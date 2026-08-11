"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";

export default function LoginPage() {
  const { ready, signIn, signUp, session } = useStore();
  const router = useRouter();
  const [mode, setMode] = useState("login"); // login | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agency, setAgency] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState("");

  useEffect(() => { if (session) router.replace("/dashboard"); }, [session, router]);

  async function submit(e) {
    e.preventDefault();
    setErr(""); setInfo(""); setBusy(true);
    const error = mode === "login" ? await signIn(email, password) : await signUp(email, password, agency, name);
    setBusy(false);
    if (error) { setErr(error); return; }
    if (mode === "signup") setInfo("Compte créé. Tu peux te connecter.");
  }

  const feats = [
    ["🗄️", "Coffre média avec aperçu", "Liens Dropp par dossier et niveau, envoi en 1 clic."],
    ["💬", "Chatting sans friction", "Scripts en « / », emojis, fiche fan."],
    ["📊", "Ventes attribuées sans bug", "Chaque vente créditée au bon chatteur."],
  ];

  return (
    <div className="fixed inset-0 flex">
      <div className="flex-1 p-14 flex flex-col justify-center border-r border-line max-md:hidden" style={{ background: "radial-gradient(1200px 600px at 20% 10%,rgba(34,197,94,.10),transparent),#0e1312" }}>
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-[#05130c] text-sm" style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)" }}>CV</div>
          <div className="font-extrabold text-xl">CVFLOW</div>
          <div className="badge text-acc bg-acc/15">BETA</div>
        </div>
        <h1 className="text-4xl font-extrabold leading-tight max-w-xl">Le CRM de chatting <span className="text-acc">WhatsApp & Telegram</span> pour agences.</h1>
        <div className="flex flex-col gap-4 mt-8 max-w-md">
          {feats.map((f, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-9 h-9 rounded-lg bg-acc/15 flex items-center justify-center text-base shrink-0">{f[0]}</div>
              <div><div className="font-bold text-sm">{f[1]}</div><div className="text-xs text-muted mt-0.5">{f[2]}</div></div>
            </div>
          ))}
        </div>
      </div>
      <div className="w-[440px] min-w-[440px] max-md:w-full max-md:min-w-0 flex flex-col justify-center p-12">
        <h2 className="text-2xl font-extrabold">{mode === "login" ? "Connexion" : "Créer mon agence"}</h2>
        <div className="text-muted text-sm mt-1.5 mb-6">{mode === "login" ? "Accède à ton espace agence" : "Ton compte admin en 30 secondes"}</div>

        {!ready && <div className="mb-4 p-3 rounded-lg text-[12.5px]" style={{ background: "rgba(239,95,95,.1)", border: "1px solid rgba(239,95,95,.3)", color: "#ef5f5f" }}>Base de données non configurée (variables Supabase manquantes dans Vercel).</div>}

        <form onSubmit={submit}>
          {mode === "signup" && <>
            <label className="text-xs text-muted font-semibold block mb-1.5">Nom de l'agence</label>
            <input className="inp w-full px-3.5 py-3 mb-3.5" value={agency} onChange={(e) => setAgency(e.target.value)} placeholder="CV Agency" />
            <label className="text-xs text-muted font-semibold block mb-1.5">Ton nom</label>
            <input className="inp w-full px-3.5 py-3 mb-3.5" value={name} onChange={(e) => setName(e.target.value)} placeholder="Corentin" />
          </>}
          <label className="text-xs text-muted font-semibold block mb-1.5">Email</label>
          <input type="email" required className="inp w-full px-3.5 py-3 mb-3.5" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="toi@agence.com" />
          <label className="text-xs text-muted font-semibold block mb-1.5">Mot de passe</label>
          <input type="password" required className="inp w-full px-3.5 py-3 mb-4" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          {err && <div className="text-[12.5px] text-danger mb-3">{err}</div>}
          {info && <div className="text-[12.5px] text-acc mb-3">{info}</div>}
          <button type="submit" disabled={busy || !ready} className="btn w-full py-3 font-bold disabled:opacity-50">{busy ? "…" : mode === "login" ? "Se connecter →" : "Créer mon agence →"}</button>
        </form>

        <div className="mt-5 text-xs text-muted2 text-center">
          {mode === "login"
            ? <>Pas encore d'agence ? <span className="text-acc cursor-pointer" onClick={() => { setMode("signup"); setErr(""); }}>Créer un compte</span></>
            : <>Déjà un compte ? <span className="text-acc cursor-pointer" onClick={() => { setMode("login"); setErr(""); }}>Se connecter</span></>}
        </div>
      </div>
    </div>
  );
}
