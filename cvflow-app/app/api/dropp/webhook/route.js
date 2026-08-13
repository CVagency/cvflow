import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

// Webhook Dropp (order.paid uniquement). Vérifie la signature HMAC puis attribue le paiement :
//  - PPV / lien tracké  : via metadata.message_id (échangé par la copie trackée du lien).
//  - Pourboire (donation): montant libre → PAS de métadonnées possibles. On retrouve le fan par son
//    id Telegram (buyer.telegram.id) et on rattache la demande de pourboire "en attente" la plus récente.
// Multi-agences : DROPP_WEBHOOK_SECRET peut lister plusieurs secrets (séparés par virgule/espace),
// un par agence — la signature est valide si l'un d'eux correspond.
// Idempotence : chaque commande Dropp (order id) n'est traitée qu'une fois (livraison at-least-once + rejeu).
export const dynamic = "force-dynamic";

export async function POST(req) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const raw = await req.text();
  const sig = req.headers.get("x-dropp-signature") || "";
  const ts = req.headers.get("x-dropp-timestamp") || "";
  const admin = createClient(url, service, { auth: { persistSession: false } });

  // Vérification de signature. Chaque agence enregistre le secret de son webhook dans le CRM
  // (colonne cvflow_models.dropp_webhook_secret) ; DROPP_WEBHOOK_SECRET (env) reste accepté en plus.
  // La signature est valide si l'un des secrets connus correspond → self-service, sans redéploiement.
  const verify = (sec) => {
    const expected = "sha256=" + crypto.createHmac("sha256", sec).update(`${ts}.${raw}`).digest("hex");
    try { return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected)); } catch (e) { return false; }
  };
  const envSecrets = (process.env.DROPP_WEBHOOK_SECRET || "").split(/[,\s]+/).map((x) => x.trim()).filter(Boolean);
  let enforced = envSecrets.length > 0;
  let sigOk = envSecrets.some(verify);
  if (!sigOk) {
    const { data: rows } = await admin.from("cvflow_models").select("dropp_webhook_secret").not("dropp_webhook_secret", "is", null);
    const dbSecrets = [...new Set((rows || []).map((r) => r.dropp_webhook_secret).filter(Boolean))];
    if (dbSecrets.length) enforced = true;
    sigOk = dbSecrets.some(verify);
  }
  if (enforced) {
    if (Math.floor(Date.now() / 1000) - parseInt(ts || "0", 10) > 300) return json({ error: "stale" }, 400);
    if (!sigOk) return json({ error: "bad_signature" }, 401);
  }

  let payload; try { payload = JSON.parse(raw); } catch { return json({ error: "bad_json" }, 400); }
  if (payload?.test) return json({ ok: true, test: true });          // événement de test du dashboard
  if (payload?.event !== "order.paid") return json({ ok: true, ignored: payload?.event || null });

  const d = payload?.data || {};
  const orderId = d?.id || null;
  const cents = d?.amount?.total_cents ?? d?.amount?.subtotal_cents ?? d?.amount_cents ?? (typeof d?.amount === "number" ? d.amount : 0) ?? 0;
  const paid = Math.round(Number(cents || 0) / 100);
  const sellerProf = d?.seller?.id || null;                          // id du créateur Dropp (prof_…)

  // Idempotence globale : si cette commande Dropp a déjà été enregistrée, on ne refait rien (rejeu/retry)
  if (orderId) {
    const { data: dup } = await admin.from("cvflow_messages").select("id").eq("dropp_order_id", orderId).limit(1).maybeSingle();
    if (dup) return json({ ok: true, already_order: orderId });
  }

  // Apprend le mapping modèle ↔ créateur Dropp (une seule fois, si pas encore connu)
  const learnModel = async (modelId) => {
    if (sellerProf && modelId) { try { await admin.from("cvflow_models").update({ dropp_profile_id: sellerProf }).eq("id", modelId).is("dropp_profile_id", null); } catch (e) {} }
  };

  // ── Cas 1 : lien tracké avec métadonnées (PPV, ou lien de pourboire "link_" tracké) ───────────────
  const messageId = d?.metadata?.message_id;
  if (messageId) {
    const { data: msg } = await admin.from("cvflow_messages").select("*").eq("id", messageId).maybeSingle();
    if (!msg) return json({ ok: true, msg_not_found: true });
    if (msg.unlocked) return json({ ok: true, already: true });      // idempotence (livraison at-least-once)
    const isTip = msg.kind === "tip";
    const amount = isTip ? paid : (Number(msg.price) || paid);
    if (isTip && amount <= 0) return json({ ok: true, tip_zero: true });
    await admin.from("cvflow_messages").update(isTip ? { unlocked: true, price: amount, dropp_order_id: orderId } : { unlocked: true, dropp_order_id: orderId }).eq("id", messageId);
    await admin.from("cvflow_sales").insert({ agency_id: msg.agency_id, model_id: msg.model_id, fan_id: msg.fan_id, member_id: msg.sender_id, amount });
    const { data: fan } = await admin.from("cvflow_fans").select("spent").eq("id", msg.fan_id).maybeSingle();
    if (fan) await admin.from("cvflow_fans").update({ spent: Number(fan.spent || 0) + Number(amount) }).eq("id", msg.fan_id);
    await learnModel(msg.model_id);
    return json({ ok: true, marked: messageId });
  }

  // ── Cas 2 : pourboire via page de donation (montant libre, sans métadonnées) ──────────────────────
  if (d?.type !== "donation") return json({ ok: true, no_metadata: true, type: d?.type || null });
  if (paid <= 0) return json({ ok: true, donation_zero: true });

  // Modèles rattachés à ce créateur Dropp (pour scoper le filet de secours au bon compte)
  let sellerModelIds = null;
  if (sellerProf) {
    const { data: ms } = await admin.from("cvflow_models").select("id").eq("dropp_profile_id", sellerProf);
    if (ms && ms.length) sellerModelIds = ms.map((m) => m.id);
  }

  // On retrouve le fan par son id Telegram (le fan paie depuis Telegram) — limit(1) car un même fan
  // peut exister sur plusieurs modèles (mêmes tg_user_id)
  const tgId = d?.buyer?.telegram?.id != null ? String(d.buyer.telegram.id) : null;
  let fanRow = null, tip = null;
  if (tgId) {
    let fq = admin.from("cvflow_fans").select("*").eq("tg_user_id", tgId);
    if (sellerModelIds) fq = fq.in("model_id", sellerModelIds);      // le bon fan sur le bon compte
    const { data: f } = await fq.order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (f) {
      fanRow = f;
      const { data: t } = await admin.from("cvflow_messages").select("*").eq("fan_id", f.id).eq("kind", "tip").eq("unlocked", false).order("created_at", { ascending: false }).limit(1).maybeSingle();
      tip = t || null;
    }
  }
  // Fallback : demande de pourboire "en attente" la plus récente, scopée au créateur si connu
  if (!tip) {
    let tq = admin.from("cvflow_messages").select("*").eq("kind", "tip").eq("unlocked", false);
    if (sellerModelIds) tq = tq.in("model_id", sellerModelIds);
    const { data: t } = await tq.order("created_at", { ascending: false }).limit(1).maybeSingle();
    tip = t || null;
  }

  if (tip) {
    await admin.from("cvflow_messages").update({ unlocked: true, price: paid, dropp_order_id: orderId }).eq("id", tip.id);
    await admin.from("cvflow_sales").insert({ agency_id: tip.agency_id, model_id: tip.model_id, fan_id: tip.fan_id, member_id: tip.sender_id, amount: paid });
    const { data: fan } = await admin.from("cvflow_fans").select("spent").eq("id", tip.fan_id).maybeSingle();
    if (fan) await admin.from("cvflow_fans").update({ spent: Number(fan.spent || 0) + paid }).eq("id", tip.fan_id);
    await learnModel(tip.model_id);
    return json({ ok: true, tip_marked: tip.id, via: tgId ? "telegram" : "pending" });
  }

  // Pourboire spontané (aucune demande en attente) : bulle sur la conversation du fan connu, crédité au
  // dernier chatteur qui lui a parlé (pour qu'il apparaisse dans un CA plutôt que nulle part)
  if (fanRow) {
    const { data: lastOut } = await admin.from("cvflow_messages").select("sender_id").eq("fan_id", fanRow.id).eq("direction", "out").not("sender_id", "is", null).order("created_at", { ascending: false }).limit(1).maybeSingle();
    const member = lastOut?.sender_id || null;
    const { data: m } = await admin.from("cvflow_messages").insert({ fan_id: fanRow.id, model_id: fanRow.model_id, agency_id: fanRow.agency_id, sender_id: member, kind: "tip", body: "Pourboire", price: paid, unlocked: true, dropp_order_id: orderId }).select().single();
    if (m) {
      if (member) await admin.from("cvflow_sales").insert({ agency_id: fanRow.agency_id, model_id: fanRow.model_id, fan_id: fanRow.id, member_id: member, amount: paid });
      await admin.from("cvflow_fans").update({ spent: Number(fanRow.spent || 0) + paid }).eq("id", fanRow.id);
      await learnModel(fanRow.model_id);
    }
    return json({ ok: true, tip_created: !!m });
  }

  return json({ ok: true, unattributed: true });
}

function json(obj, status = 200) { return new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json" } }); }
