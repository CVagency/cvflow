"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";

export default function LoginPage() {
  const { login } = useStore();
  const router = useRouter();
  const [role, setRole] = useState("cor");

  function doLogin() {
    login(role);
    router.replace(role === "cor" ? "/dashboard" : "/conversations");
  }

  const feats = [
    ["🗄️", "Coffre média avec aperçu", "Le manager prépare les liens Dropp par dossier et niveau. Le chatteur envoie en 1 clic."],
    ["💬", "Chatting sans friction", "Scripts en « / », emojis, fiche fan — tout dans la conversation."],
    ["📊", "Ventes attribuées sans bug", "Chaque vente est créditée au bon chatteur, automatiquement."],
  ];

  return (
    <div className="fixed inset-0 flex">
      <div className="flex-1 p-14 flex flex-col justify-center border-r border-line" style={{ background: "radial-gradient(1200px 600px at 20% 10%,rgba(34,197,94,.10),transparent),#0e1312" }}>
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-[#05130c] text-sm" style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)" }}>CV</div>
          <div className="font-extrabold text-xl">CVFLOW</div>
          <div className="badge text-acc bg-acc/15">BETA</div>
        </div>
        <h1 className="text-4xl font-extrabold leading-tight max-w-xl">Le CRM de chatting <span className="text-acc">WhatsApp & Telegram</span> pour agences.</h1>
        <p className="text-muted mt-4 max-w-md leading-relaxed">Coffre média connecté à Dropp Fans, scripts par modèle, attribution des ventes au chatteur, analytics en temps réel.</p>
        <div className="flex flex-col gap-4 mt-8 max-w-md">
          {feats.map((f, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-9 h-9 rounded-lg bg-acc/15 flex items-center justify-center text-base shrink-0">{f[0]}</div>
              <div><div className="font-bold text-sm">{f[1]}</div><div className="text-xs text-muted mt-0.5">{f[2]}</div></div>
            </div>
          ))}
        </div>
      </div>
      <div className="w-[440px] min-w-[440px] flex flex-col justify-center p-12">
        <h2 className="text-2xl font-extrabold">Connexion</h2>
        <div className="text-muted text-sm mt-1.5 mb-6">Accède à ton espace agence</div>
        <label className="text-xs text-muted font-semibold block mb-1.5">Email</label>
        <input className="inp w-full px-3.5 py-3 mb-3.5" defaultValue="cvagency33@gmail.com" />
        <label className="text-xs text-muted font-semibold block mb-1.5">Mot de passe</label>
        <input type="password" className="inp w-full px-3.5 py-3 mb-4" defaultValue="demo1234" />
        <label className="text-xs text-muted font-semibold block mb-2">Se connecter en tant que</label>
        <div className="flex gap-2.5 mb-4">
          {[["cor", "👑 Admin", "Corentin · accès complet"], ["tia", "💬 Chatteur", "Tiana · chat + coffre"]].map((r) => (
            <button key={r[0]} onClick={() => setRole(r[0])} className={`flex-1 rounded-xl p-3 text-center border ${role === r[0] ? "border-acc bg-acc/15" : "border-line2"}`}>
              <div className="font-bold text-sm">{r[1]}</div><div className="text-[11px] text-muted mt-0.5">{r[2]}</div>
            </button>
          ))}
        </div>
        <button onClick={doLogin} className="btn w-full py-3 font-bold">Se connecter →</button>
        <div className="mt-5 text-xs text-muted2 text-center">Pas encore de compte ? <span className="text-acc cursor-pointer">Demander un accès</span></div>
      </div>
    </div>
  );
}
