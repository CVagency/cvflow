import { createClient } from "@supabase/supabase-js";

// Supprime définitivement un membre (compte auth + profil via cascade). Réservé aux admins.
export async function DELETE(req) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !service) return json({ error: "Supabase non configuré (SUPABASE_SERVICE_ROLE_KEY manquante)" }, 500);

  const token = (req.headers.get("authorization") || "").replace("Bearer ", "");
  if (!token) return json({ error: "Non authentifié" }, 401);

  const admin = createClient(url, service, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: userData, error: uErr } = await admin.auth.getUser(token);
  if (uErr || !userData?.user) return json({ error: "Session invalide" }, 401);
  const { data: me } = await admin.from("cvflow_profiles").select("agency_id, role").eq("id", userData.user.id).single();
  if (!me || me.role !== "ADMIN") return json({ error: "Réservé aux admins" }, 403);

  let body;
  try { body = await req.json(); } catch { return json({ error: "Requête invalide" }, 400); }
  const { userId } = body || {};
  if (!userId) return json({ error: "userId requis" }, 400);
  if (userId === userData.user.id) return json({ error: "Tu ne peux pas te supprimer toi-même" }, 400);

  const { data: target } = await admin.from("cvflow_profiles").select("agency_id").eq("id", userId).single();
  if (!target || target.agency_id !== me.agency_id) return json({ error: "Membre introuvable" }, 404);

  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) return json({ error: error.message }, 400);
  return json({ ok: true });
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json" } });
}
