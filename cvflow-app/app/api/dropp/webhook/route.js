import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

// Webhook Dropp : appelé par Dropp quand un événement arrive (on ne traite que order.paid).
// Vérifie la signature HMAC, retrouve le PPV via metadata.message_id, le passe "payé" + crédite le chatteur.
export const dynamic = "force-dynamic";

export async function POST(req) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const secret = process.env.DROPP_WEBHOOK_SECRET;

  const raw = await req.text();
  const sig = req.headers.get("x-dropp-signature") || "";
  const ts = req.headers.get("x-dropp-timestamp") || "";

  // Vérification de signature (obligatoire si le secret est configuré)
  if (secret) {
    if (Math.floor(Date.now() / 1000) - parseInt(ts || "0", 10) > 300) return json({ error: "stale" }, 400);
    const expected = "sha256=" + crypto.createHmac("sha256", secret).update(`${ts}.${raw}`).digest("hex");
    let ok = false;
    try { ok = crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected)); } catch (e) { ok = false; }
    if (!ok) return json({ error: "bad_signature" }, 401);
  }

  let payload; try { payload = JSON.parse(raw); } catch { return json({ error: "bad_json" }, 400); }
  if (payload?.test) return json({ ok: true, test: true });          // événement de test du dashboard
  if (payload?.event !== "order.paid") return json({ ok: true, ignored: payload?.event || null });

  const meta = payload?.data?.metadata || {};
  const messageId = meta?.message_id;
  if (!messageId) return json({ ok: true, no_message_id: true });

  const admin = createClient(url, service, { auth: { persistSession: false } });
  const { data: msg } = await admin.from("cvflow_messages").select("*").eq("id", messageId).maybeSingle();
  if (!msg) return json({ ok: true, msg_not_found: true });
  if (msg.unlocked) return json({ ok: true, already: true });        // idempotence (livraison at-least-once)

  // Montant exact payé (en centimes) remonté par Dropp — plusieurs formes possibles selon l'événement
  const d = payload?.data || {};
  const cents = d?.amount?.total_cents ?? d?.amount_total_cents ?? d?.total_cents ?? d?.amount_cents ?? (typeof d?.amount === "number" ? d.amount : 0) ?? 0;
  const paid = Math.round(Number(cents || 0) / 100);
  const isTip = msg.kind === "tip";
  // PPV = prix fixe du média ; pourboire = montant libre choisi par le fan
  const amount = isTip ? paid : (Number(msg.price) || paid);
  // Garde-fou : si le montant d'un pourboire est introuvable dans le payload, on NE marque PAS payé
  // (sinon encaissé à 0 € sans rattrapage). On laisse "en attente" → le chatteur pourra faire "✓ reçu".
  if (isTip && amount <= 0) return json({ ok: true, tip_zero: true, note: "montant introuvable, laissé en attente" });
  await admin.from("cvflow_messages").update(isTip ? { unlocked: true, price: amount } : { unlocked: true }).eq("id", messageId);
  await admin.from("cvflow_sales").insert({ agency_id: msg.agency_id, model_id: msg.model_id, fan_id: msg.fan_id, member_id: msg.sender_id, amount });
  const { data: fan } = await admin.from("cvflow_fans").select("spent").eq("id", msg.fan_id).maybeSingle();
  if (fan) await admin.from("cvflow_fans").update({ spent: Number(fan.spent || 0) + Number(amount) }).eq("id", msg.fan_id);

  return json({ ok: true, marked: messageId });
}

function json(obj, status = 200) { return new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json" } }); }
