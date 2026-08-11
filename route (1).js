import { createClient } from "@supabase/supabase-js";

// Route serveur : crée un vrai compte membre (rôle + commission) dans l'agence de l'admin.
// Utilise la SERVICE ROLE KEY (secrète, jamais exposée au navigateur).
export async function POST(req) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !service) return json({ error: "Supabase non configuré (SUPABASE_SERVICE_ROLE_KEY manquante)" }, 500);

  const auth = req.headers.get("authorization") || "";
  const token = auth.replace("Bearer ", "");
  if (!token) return json({ error: "Non authentifié" }, 401);

  const admin = createClient(url, service, { auth: { autoRefreshToken: false, persistSession: false } });

  // Vérifie que l'appelant est un ADMIN et récupère son agence
  const { data: userData, error: uErr } = await admin.auth.getUser(token);
  if (uErr || !userData?.user) return json({ error: "Session invalide" }, 401);
  const { data: me } = await admin.from("cvflow_profiles").select("agency_id, role").eq("id", userData.user.id).single();
  if (!me || me.role !== "ADMIN") return json({ error: "Réservé aux admins" }, 403);

  let body;
  try { body = await req.json(); } catch { return json({ error: "Requête invalide" }, 400); }
  const { email, password, name, role, pct } = body || {};
  if (!email || !password) return json({ error: "Email et mot de passe requis" }, 400);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({ error: "Adresse email invalide" }, 400);
  if (String(password).length < 6) return json({ error: "Le mot de passe doit faire au moins 6 caractères" }, 400);

  const { data: created, error: cErr } = await admin.auth.admin.createUser({
    email, password, email_confirm: true,
    user_metadata: { name: name || email.split("@")[0], role: role || "CHATTER", pct: pct || 0, agency_id: me.agency_id },
  });
  if (cErr) {
    const msg = (cErr.message || "").toLowerCase();
    let friendly = cErr.message;
    if (msg.includes("already") && (msg.includes("registered") || msg.includes("exist"))) friendly = "Cet email a déjà un compte CVFLOW. Utilise une adresse différente.";
    else if (msg.includes("password")) friendly = "Mot de passe trop faible (min. 6 caractères).";
    else if (msg.includes("email")) friendly = "Adresse email invalide ou refusée.";
    return json({ error: friendly }, 400);
  }
  return json({ ok: true, id: created?.user?.id });
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json" } });
}
