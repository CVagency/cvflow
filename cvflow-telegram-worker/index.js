// ─────────────────────────────────────────────────────────────────────────────
//  CVFLOW · Worker Telegram (MTProto / GramJS)
//  Connexion réelle des comptes modèles par QR code + envoi/réception de messages.
//  Vercel ne peut pas tenir une connexion Telegram permanente : CE worker le fait.
//  Il tourne en continu (Railway / Render / Fly / VPS) et parle à Supabase + au CRM.
// ─────────────────────────────────────────────────────────────────────────────
import "dotenv/config";
import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import { TelegramClient, Api } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import { NewMessage } from "telegram/events/index.js";
import WebSocket from "ws";
if (!globalThis.WebSocket) globalThis.WebSocket = WebSocket;

const {
  API_ID, API_HASH,
  SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
  WORKER_API_KEY,
  PORT = 8080,
} = process.env;

if (!API_ID || !API_HASH) { console.error("❌ API_ID / API_HASH manquants (voir my.telegram.org)"); process.exit(1); }
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) { console.error("❌ SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquants"); process.exit(1); }

const apiId = parseInt(API_ID, 10);
const supa = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
  realtime: { transport: WebSocket },
});

// Etat en mémoire par modèle : { client, status, qrUrl, error, agency_id }
const sessions = new Map();
const b64url = (buf) => Buffer.from(buf).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

async function loadModel(modelId) {
  const { data } = await supa.from("cvflow_models").select("id, agency_id, tg_session, tg_proxy").eq("id", modelId).single();
  return data;
}
async function saveSession(modelId, sessionStr) {
  await supa.from("cvflow_models").update({ tg_session: sessionStr, tg_connected: true }).eq("id", modelId);
}
function parseProxy(raw) {
  // Format attendu : "socks5://user:pass@host:port" ou "host:port:user:pass"
  if (!raw) return undefined;
  try {
    if (raw.includes("://")) {
      const u = new URL(raw);
      return { socksType: u.protocol.startsWith("socks4") ? 4 : 5, ip: u.hostname, port: parseInt(u.port, 10), username: decodeURIComponent(u.username) || undefined, password: decodeURIComponent(u.password) || undefined };
    }
    const [ip, port, username, password] = raw.split(":");
    return { socksType: 5, ip, port: parseInt(port, 10), username, password };
  } catch { return undefined; }
}

// ── Réception : nouveau message entrant → upsert fan + insert message "in" ──
function attachHandlers(modelId, agencyId, client) {
  client.addEventHandler(async (event) => {
    try {
      const msg = event.message;
      if (!msg || msg.out) return;                 // ignore les messages sortants
      const sender = await msg.getSender();
      if (!sender) return;
      const tgId = String(sender.id);
      const name = [sender.firstName, sender.lastName].filter(Boolean).join(" ") || sender.username || ("Fan " + tgId);

      // upsert fan par tg_user_id
      let { data: fan } = await supa.from("cvflow_fans").select("id").eq("model_id", modelId).eq("tg_user_id", tgId).maybeSingle();
      if (!fan) {
        const ins = await supa.from("cvflow_fans").insert({ model_id: modelId, agency_id: agencyId, name, source: "tg", tag: "new", tg_user_id: tgId }).select("id").single();
        fan = ins.data;
      }
      await supa.from("cvflow_messages").insert({
        fan_id: fan.id, model_id: modelId, agency_id: agencyId,
        direction: "in", kind: "text", body: msg.message || "", tg_message_id: String(msg.id),
      });
    } catch (e) { console.error("handler err", e); }
  }, new NewMessage({}));
}

// ── Connexion / QR ──
async function connectModel(modelId) {
  let st = sessions.get(modelId);
  if (st && (st.status === "connected" || st.status === "qr" || st.status === "connecting")) return st;

  const model = await loadModel(modelId);
  if (!model) throw new Error("Modèle introuvable");
  st = { status: "connecting", qrUrl: null, error: null, agency_id: model.agency_id, client: null };
  sessions.set(modelId, st);

  const proxy = parseProxy(model.tg_proxy);
  const client = new TelegramClient(new StringSession(model.tg_session || ""), apiId, API_HASH, {
    connectionRetries: 5, ...(proxy ? { proxy } : {}),
  });
  st.client = client;
  await client.connect();

  if (await client.checkAuthorization()) {
    st.status = "connected";
    await saveSession(modelId, client.session.save());
    attachHandlers(modelId, model.agency_id, client);
    return st;
  }

  // Login par QR — resout quand le compte scanne
  client.signInUserWithQrCode(
    { apiId, apiHash: API_HASH },
    {
      qrCode: async (code) => { st.qrUrl = "tg://login?token=" + b64url(code.token); st.status = "qr"; },
      onError: async (err) => { st.status = "error"; st.error = String(err?.message || err); return true; },
      password: async () => { st.status = "error"; st.error = "2FA activée : désactive la double authentification sur ce compte, ou ajoute la gestion 2FA."; throw new Error("2FA"); },
    }
  ).then(async () => {
    st.status = "connected"; st.qrUrl = null;
    await saveSession(modelId, client.session.save());
    attachHandlers(modelId, model.agency_id, client);
    console.log("✅ Modèle connecté:", modelId);
  }).catch((e) => { st.status = "error"; st.error = String(e?.message || e); });

  return st;
}

// ── API HTTP (appelée par le CRM) ──
const app = express();
app.use(cors());
app.use(express.json());

// Auth simple par clé partagée
app.use((req, res, next) => {
  if (req.path === "/health") return next();
  if (!WORKER_API_KEY || req.get("x-api-key") === WORKER_API_KEY) return next();
  res.status(401).json({ error: "unauthorized" });
});

app.get("/health", (_req, res) => res.json({ ok: true, models: [...sessions.keys()] }));

// Démarre/retourne la connexion + le QR
app.post("/connect", async (req, res) => {
  try {
    const { modelId } = req.body || {};
    if (!modelId) return res.status(400).json({ error: "modelId requis" });
    const st = await connectModel(modelId);
    res.json({ status: st.status, qrUrl: st.qrUrl, error: st.error });
  } catch (e) { res.status(500).json({ error: String(e?.message || e) }); }
});

// Statut (le CRM fait du polling toutes les ~2s pendant l'affichage du QR)
app.get("/status/:modelId", (req, res) => {
  const st = sessions.get(req.params.modelId);
  if (!st) return res.json({ status: "idle" });
  res.json({ status: st.status, qrUrl: st.qrUrl, error: st.error });
});

// Envoi d'un message vers un fan (par son tg_user_id), avec réponse optionnelle
app.post("/send", async (req, res) => {
  try {
    const { modelId, tgUserId, text, replyTo } = req.body || {};
    const st = sessions.get(modelId);
    if (!st || st.status !== "connected") return res.status(409).json({ error: "modèle non connecté" });
    const opts = { message: text };
    if (replyTo) opts.replyTo = parseInt(replyTo, 10);
    const sent = await st.client.sendMessage(tgUserId, opts);
    res.json({ ok: true, tgMessageId: sent && sent.id ? String(sent.id) : null });
  } catch (e) { res.status(500).json({ error: String(e?.message || e) }); }
});

// Suppression d'un message (pour tout le monde)
app.post("/delete", async (req, res) => {
  try {
    const { modelId, tgUserId, tgMessageId } = req.body || {};
    const st = sessions.get(modelId);
    if (!st || st.status !== "connected") return res.status(409).json({ error: "modèle non connecté" });
    await st.client.deleteMessages(tgUserId, [parseInt(tgMessageId, 10)], { revoke: true });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: String(e?.message || e) }); }
});

// Réaction (like) sur un message reçu
app.post("/react", async (req, res) => {
  try {
    const { modelId, tgUserId, tgMessageId, emoji } = req.body || {};
    const st = sessions.get(modelId);
    if (!st || st.status !== "connected") return res.status(409).json({ error: "modèle non connecté" });
    await st.client.invoke(new Api.messages.SendReaction({
      peer: tgUserId,
      msgId: parseInt(tgMessageId, 10),
      reaction: [new Api.ReactionEmoji({ emoticon: emoji || "❤️" })],
    }));
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: String(e?.message || e) }); }
});

// Déconnexion
app.post("/disconnect", async (req, res) => {
  const { modelId } = req.body || {};
  const st = sessions.get(modelId);
  if (st?.client) { try { await st.client.disconnect(); } catch {} }
  sessions.delete(modelId);
  res.json({ ok: true });
});

// Au démarrage : reconnecte les modèles déjà liés (session en base)
async function bootstrap() {
  const { data } = await supa.from("cvflow_models").select("id").eq("tg_connected", true).not("tg_session", "is", null);
  for (const m of data || []) { try { await connectModel(m.id); } catch (e) { console.error("reconnect", m.id, e?.message); } }
}

app.listen(PORT, () => { console.log("🚀 CVFLOW Telegram worker sur :" + PORT); bootstrap(); });
