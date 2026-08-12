import { createClient } from "@supabase/supabase-js";

// Récupère les infos d'un lien Dropp (prix, nom, type) via l'API Dropp, avec la clé du modèle.
// La clé Dropp reste côté serveur : jamais exposée au navigateur.
const DROPP_API = "https://api.external.dropp.fans/v1";

export async function POST(req) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !service) return json({ error: "Supabase non configuré" }, 500);
  const token = (req.headers.get("authorization") || "").replace("Bearer ", "");
  if (!token) return json({ error: "Non authentifié" }, 401);

  const admin = createClient(url, service, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: userData } = await admin.auth.getUser(token);
  if (!userData?.user) return json({ error: "Session invalide" }, 401);
  const { data: me } = await admin.from("cvflow_profiles").select("agency_id").eq("id", userData.user.id).single();
  if (!me) return json({ error: "Profil introuvable" }, 403);

  let body; try { body = await req.json(); } catch { return json({ error: "Requête invalide" }, 400); }
  const { modelId, linkUrl } = body || {};
  const { data: model } = await admin.from("cvflow_models").select("dropp_api_key").eq("id", modelId).eq("agency_id", me.agency_id).single();
  if (!model?.dropp_api_key) return json({ error: "Ce modèle n'a pas de clé API Dropp (Modèles → bouton Dropp)." }, 400);
  const linkId = parseLinkId(linkUrl);
  if (!linkId) return json({ error: "Lien Dropp invalide (identifiant link_… introuvable)." }, 400);

  try {
    const r = await fetch(`${DROPP_API}/links/${linkId}`, { headers: { authorization: `Bearer ${model.dropp_api_key}` } });
    if (!r.ok) { let e = {}; try { e = await r.json(); } catch (x) {} return json({ error: e?.error?.message || `Dropp a répondu ${r.status}` }, 400); }
    const raw = await r.json();
    const d = raw && raw.data && !Array.isArray(raw.data) ? raw.data : raw;   // Dropp enveloppe parfois dans { data: {...} }
    const typeMap = { image: "photo", video: "video", audio: "audio" };
    const types = (d?.contents?.types || []).map((t) => typeMap[String(t).toLowerCase()] || "photo");
    return json({ ok: true, name: d?.name || "", priceCents: d?.price?.amount_cents ?? null, priceDisplay: d?.price?.display || "", types: types.length ? [...new Set(types)] : ["photo"] });
  } catch (e) { return json({ error: "Impossible de joindre l'API Dropp" }, 502); }
}

function parseLinkId(u) { const m = String(u || "").match(/link_[A-Za-z0-9_-]+/); return m ? m[0] : null; }
function json(obj, status = 200) { return new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json" } }); }
