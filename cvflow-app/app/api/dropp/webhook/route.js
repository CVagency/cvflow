import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

// Webhook Dropp (order.paid uniquement). Vérifie la signature HMAC puis attribue le paiement :
//  - PPV / lien tracké  : via metadata.message_id (échangé par la copie trackée du lien).
//  - Pourboire (donation): montant libre → PAS de métadonnées possibles. On retrouve le fan par son
//    id Telegram (buyer.telegram.id) et on rattache la demande de pourboire "en attente" la plus récente.
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

  const d = payload?.data || {};
  const cents = d?.amount?.total_cents ?? d?.amount?.subtotal_cents ?? d?.amount_cents ?? (typeof d?.amount === "number" ? d.amount : 0) ?? 0;
  const paid = Math.round(Number(cents || 0) / 100);
  const admin = createClient(url, service, { auth: { persistSession: false } });

  // ── Cas 1 : lien tracké avec métadonnées (PPV, ou lien de pourboire "link_" tracké) ───────────────
  const messageId = d?.metadata?.message_id;
  if (messageId) {
    const { data: msg } = await admin.from("cvflow_messages").select("*").eq("id", messageId).maybeSingle();
    if (!msg) return json({ ok: true, msg_not_found: true });
    if (msg.unlocked) return json({ ok: true, already: true });      // idempotence (livraison at-least-once)
    const isTip = msg.kind === "tip";
    const amount = isTip ? paid : (Number(msg.price) || paid);
    if (isTip && amount <= 0) return json({ ok: true, tip_zero: true });
    await admin.from("cvflow_messages").update(isTip ? { unlocked: true, price: amount } : { unlocked: true }).eq("id", messageId);
    await admin.from("cvflow_sales").insert({ agency_id: msg.agency_id, model_id: msg.model_id, fan_id: msg.fan_id, member_id: msg.sender_id, amount });
    const { data: fan } = await admin.from("cvflow_fans").select("spent").eq("id", msg.fan_id).maybeSingle();
    if (fan) await admin.from("cvflow_fans").update({ spent: Number(fan.spent || 0) + Number(amount) }).eq("id", msg.fan_id);
    return json({ ok: true, marked: messageId });
  }

  // ── Cas 2 : pourboire via page de donation (montant libre, sans métadonnées) ──────────────────────
  if (d?.type !== "donation") return json({ ok: true, no_metadata: true, type: d?.type || null });
  if (paid <= 0) return json({ ok: true, donation_zero: true });

  // On retrouve le fan par son id Telegram (le fan paie depuis Telegram)
  const tgId = d?.buyer?.telegram?.id != null ? String(d.buyer.telegram.id) : null;
  let fanRow = null, tip = null;
  if (tgId) {
    const { data: f } = await admin.from("cvflow_fans").select("*").eq("tg_user_id", tgId).maybeSingle();
    if (f) {
      fanRow = f;
      const { data: t } = await admin.from("cvflow_messages").select("*").eq("fan_id", f.id).eq("kind", "tip").eq("unlocked", false).order("created_at", { ascending: false }).limit(1).maybeSingle();
      tip = t || null;
    }
  }
  // Fallback : la demande de pourboire "en attente" la plus récente (id Telegram absent ou fan inconnu)
  if (!tip) {
    const { data: t } = await admin.from("cvflow_messages").select("*").eq("kind", "tip").eq("unlocked", false).order("created_at", { ascending: false }).limit(1).maybeSingle();
    tip = t || null;
  }

  if (tip) {
    await admin.from("cvflow_messages").update({ unlocked: true, price: paid }).eq("id", tip.id);
    await admin.from("cvflow_sales").insert({ agency_id: tip.agency_id, model_id: tip.model_id, fan_id: tip.fan_id, member_id: tip.sender_id, amount: paid });
    const { data: fan } = await admin.from("cvflow_fans").select("spent").eq("id", tip.fan_id).maybeSingle();
    if (fan) await admin.from("cvflow_fans").update({ spent: Number(fan.spent || 0) + paid }).eq("id", tip.fan_id);
    return json({ ok: true, tip_marked: tip.id, via: tgId ? "telegram" : "pending" });
  }

  // Pourboire spontané (aucune demande en attente) : on crée la bulle sur la conversation du fan si connu
  if (fanRow) {
    const { data: m } = await admin.from("cvflow_messages").insert({ fan_id: fanRow.id, model_id: fanRow.model_id, agency_id: fanRow.agency_id, kind: "tip", body: "Pourboire", price: paid, unlocked: true }).select().single();
    if (m) await admin.from("cvflow_fans").update({ spent: Number(fanRow.spent || 0) + paid }).eq("id", fanRow.id);
    return json({ ok: true, tip_created: !!m });
  }

  return json({ ok: true, unattributed: true });
}

function json(obj, status = 200) { return new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json" } }); }
