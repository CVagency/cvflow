import { createClient } from "@supabase/supabase-js";

// Crée une COPIE TRACKÉE d'un lien Dropp avec des métadonnées {message_id, fan_id}.
// Dropp renverra exactement ces métadonnées dans le webhook order.paid → attribution automatique.
// En cas d'échec on renvoie ok:false (200) : l'appelant enverra alors le lien brut (pas bloquant).
const DROPP_API = "https://api.external.dropp.fans/v1";

export async function POST(req) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !service) return json({ ok: false, error: "server" });
  const token = (req.headers.get("authorization") || "").replace("Bearer ", "");
  if (!token) return json({ ok: false, error: "auth" });

  const admin = createClient(url, service, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: userData } = await admin.auth.getUser(token);
  if (!userData?.user) return json({ ok: false, error: "auth" });
  const { data: me } = await admin.from("cvflow_profiles").select("agency_id").eq("id", userData.user.id).single();
  if (!me) return json({ ok: false, error: "profile" });

  let body; try { body = await req.json(); } catch { return json({ ok: false, error: "body" }); }
  const { modelId, linkUrl, metadata } = body || {};
  const { data: model } = await admin.from("cvflow_models").select("dropp_api_key").eq("id", modelId).eq("agency_id", me.agency_id).single();
  if (!model?.dropp_api_key) return json({ ok: false, error: "no_key" });
  const linkId = parseLinkId(linkUrl);
  if (!linkId) return json({ ok: false, error: "no_link" });

  try {
    const r = await fetch(`${DROPP_API}/links/${linkId}/copies`, {
      method: "POST",
      headers: { authorization: `Bearer ${model.dropp_api_key}`, "content-type": "application/json" },
      body: JSON.stringify({ metadata: metadata || {} }),
    });
    if (!r.ok) return json({ ok: false, error: `dropp_${r.status}` });
    const d = await r.json();
    const copy = d?.copy || d?.data?.copy || null;
    return json({ ok: true, checkoutUrl: copy?.checkout_url || null, copyId: copy?.id || null });
  } catch (e) { return json({ ok: false, error: "unreachable" }); }
}

function parseLinkId(u) { const m = String(u || "").match(/link_[A-Za-z0-9_-]+/); return m ? m[0] : null; }
function json(obj, status = 200) { return new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json" } }); }
