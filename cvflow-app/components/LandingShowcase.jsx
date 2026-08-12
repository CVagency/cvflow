"use client";
import { useState, useEffect } from "react";

// Motion de présentation auto-rotatif pour la page d'accueil : une maquette navigateur
// qui enchaîne les fonctionnalités (Telegram, Conversation, Paiement auto Dropp, Analytics).
const SCENES = [
  { key: "connect", tab: "cvflow · modèles", title: "Connexion Telegram en 1 scan" },
  { key: "chat", tab: "cvflow · conversations", title: "Chatting fluide, scripts & médias" },
  { key: "paid", tab: "cvflow · paiement", title: "Paiement Dropp encaissé… tout seul" },
  { key: "stats", tab: "cvflow · analytics", title: "Le pilotage à la donnée" },
];
const DURATION = 4200;

export default function LandingShowcase() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % SCENES.length), DURATION);
    return () => clearInterval(t);
  }, []);
  const s = SCENES[i];

  return (
    <div className="relative">
      <div className="absolute inset-x-10 -top-6 h-24 blur-3xl opacity-40" style={{ background: "radial-gradient(circle,#22c55e,transparent)" }} />
      <div className="relative card p-2.5 shadow-2xl max-w-3xl mx-auto border-line2">
        <div className="rounded-xl overflow-hidden border border-line" style={{ background: "#0e1312" }}>
          {/* barre navigateur */}
          <div className="flex items-center gap-1.5 px-3 py-2.5 border-b border-line">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ef5f5f]" /><span className="w-2.5 h-2.5 rounded-full bg-[#e5b769]" /><span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
            <span className="text-[11px] text-muted2 ml-2 transition-all duration-500">{s.tab}</span>
            <span className="ml-auto text-[11px] font-semibold text-acc pr-1">{s.title}</span>
          </div>

          {/* scène */}
          <div className="relative h-[290px] max-sm:h-[340px] overflow-hidden">
            <div key={s.key} className="absolute inset-0 p-4 cvsc-fade">
              {s.key === "connect" && <SceneConnect />}
              {s.key === "chat" && <SceneChat />}
              {s.key === "paid" && <ScenePaid />}
              {s.key === "stats" && <SceneStats />}
            </div>
          </div>

          {/* progression */}
          <div className="flex items-center gap-1.5 px-4 py-3 border-t border-line">
            {SCENES.map((sc, k) => (
              <button key={sc.key} onClick={() => setI(k)} className="h-1.5 rounded-full overflow-hidden bg-panel2 transition-all" style={{ width: k === i ? 40 : 16 }}>
                {k === i && <span className="block h-full bg-acc cvsc-bar" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes cvscFade { from { opacity: 0; transform: translateY(8px) scale(.99); } to { opacity: 1; transform: none; } }
        .cvsc-fade { animation: cvscFade .5s ease-out both; }
        @keyframes cvscBar { from { width: 0; } to { width: 100%; } }
        .cvsc-bar { animation: cvscBar ${DURATION}ms linear both; }
        @keyframes cvscUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        @keyframes cvscScan { 0% { top: 8%; } 50% { top: 82%; } 100% { top: 8%; } }
        @keyframes cvscPop { 0% { transform: scale(.6); opacity: 0; } 60% { transform: scale(1.12); } 100% { transform: scale(1); opacity: 1; } }
        @keyframes cvscPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(34,197,94,.5); } 70% { box-shadow: 0 0 0 8px rgba(34,197,94,0); } }
        @keyframes cvscDraw { to { stroke-dashoffset: 0; } }
        @keyframes cvscGrow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        @keyframes cvscCount { from { transform: translateY(70%); opacity: 0; } to { transform: none; opacity: 1; } }
      `}</style>
    </div>
  );
}

function SceneConnect() {
  return (
    <div className="h-full flex items-center justify-center gap-6 max-sm:flex-col">
      <div className="relative w-[128px] h-[128px] rounded-2xl bg-white p-2 shrink-0" style={{ animation: "cvscPop .5s ease-out both" }}>
        <div className="w-full h-full rounded-lg relative overflow-hidden" style={{ background: "repeating-conic-gradient(#0a0d0c 0% 25%, #fff 0% 50%) 0 / 14px 14px" }}>
          <div className="absolute left-2 right-2 h-[3px] rounded bg-acc shadow-[0_0_10px_#22c55e]" style={{ animation: "cvscScan 2.4s ease-in-out infinite" }} />
        </div>
      </div>
      <div className="max-sm:text-center">
        <div className="flex items-center gap-2.5 mb-2 max-sm:justify-center">
          <span className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold" style={{ background: "linear-gradient(135deg,#0891b2,#0d9488)" }}>A</span>
          <div><div className="font-bold text-sm">Ange</div><div className="text-[11px] text-acc">● Telegram connecté</div></div>
        </div>
        <div className="inline-flex items-center gap-2 text-[12px] bg-acc/10 border border-acc/30 text-acc rounded-lg px-3 py-2 font-semibold" style={{ animation: "cvscPulse 1.6s ease-out infinite" }}>✓ Compte lié — statut en direct</div>
        <div className="text-[11px] text-muted2 mt-2 max-w-[220px]">Scanne le QR depuis le téléphone du modèle. Connecté/banni détecté automatiquement.</div>
      </div>
    </div>
  );
}

function SceneChat() {
  const bubbles = [
    ["in", "Coucou, tu fais quoi ce soir ? 🙈", 0],
    ["out", "J'ai une petite surprise pour toi… 💦", 0.5],
    ["ppv", "", 1.1],
  ];
  return (
    <div className="h-full flex flex-col justify-end gap-2.5 max-w-[440px] mx-auto">
      {bubbles.map((b, k) => (
        <div key={k} style={{ animation: `cvscUp .5s ease-out both`, animationDelay: `${b[2]}s` }} className={b[0] === "in" ? "self-start" : "self-end"}>
          {b[0] === "in" && <div className="bg-panel border border-line rounded-2xl rounded-bl px-3.5 py-2.5 text-[12.5px] max-w-[80%]">{b[1]}</div>}
          {b[0] === "out" && <div className="rounded-2xl rounded-br px-3.5 py-2.5 text-[12.5px] text-[#eafff2]" style={{ background: "linear-gradient(135deg,#16a34a,#128a44)" }}>{b[1]}</div>}
          {b[0] === "ppv" && (
            <div className="rounded-xl border border-gold/40 p-2 flex items-center gap-2.5" style={{ background: "rgba(229,183,105,.08)" }}>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center text-lg relative overflow-hidden" style={{ background: "linear-gradient(135deg,#3a2f1a,#221b0f)" }}>🎬<div className="absolute inset-0 bg-black/30 flex items-center justify-center backdrop-blur-[1px]">🔒</div></div>
              <div><div className="text-[12px] font-bold">Vidéo douche</div><div className="text-gold font-extrabold text-[13px]">15€ · Dropp</div></div>
            </div>
          )}
        </div>
      ))}
      <div className="flex items-center gap-2 mt-1 text-[11px] text-muted2" style={{ animation: "cvscUp .5s ease-out both", animationDelay: "1.6s" }}>
        <span className="bg-panel border border-tg/30 text-tg rounded px-2 py-1 font-semibold">/ scripts</span>
        <span className="bg-panel border border-gold/30 text-gold rounded px-2 py-1 font-semibold">🗄️ coffre</span>
        <span>envoyé par <b className="text-muted">Tiana</b></span>
      </div>
    </div>
  );
}

function ScenePaid() {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-3">
      <div className="rounded-xl border border-gold/40 p-3 flex items-center gap-3 w-[300px]" style={{ background: "rgba(229,183,105,.07)" }}>
        <div className="w-14 h-14 rounded-lg flex items-center justify-center text-xl" style={{ background: "linear-gradient(135deg,#3a2f1a,#221b0f)" }}>🎬</div>
        <div className="flex-1">
          <div className="text-[13px] font-bold">Vidéo douche</div>
          <div className="text-gold font-extrabold text-sm">15€ · Dropp</div>
          <div className="mt-1 text-[11px]">
            <span className="text-muted2 line-through mr-1.5" style={{ animation: "cvscFade .4s both" }}>en attente</span>
            <span className="text-acc font-bold" style={{ display: "inline-block", animation: "cvscPop .6s ease-out both", animationDelay: "1s" }}>payé ✓</span>
          </div>
        </div>
      </div>
      <div className="text-[12px] text-muted2 max-w-[300px] text-center" style={{ animation: "cvscUp .5s both", animationDelay: "1.2s" }}>
        Le fan paie sur Dropp → <b className="text-acc">encaissé automatiquement</b>, sans toucher à rien. Vente créditée au bon chatteur.
      </div>
      <div className="flex items-center gap-2 text-[11px]" style={{ animation: "cvscUp .5s both", animationDelay: "1.5s" }}>
        <span className="bg-acc/10 border border-acc/30 text-acc rounded-full px-2.5 py-1 font-semibold">+15€ · Tiana</span>
        <span className="bg-panel border border-line text-muted rounded-full px-2.5 py-1">webhook Dropp</span>
      </div>
    </div>
  );
}

function SceneStats() {
  const tiles = [["Revenu", "12 480€", "#22c55e"], ["Ventes", "312", "#3aa0e6"], ["Panier moy.", "40€", "#e5b769"]];
  return (
    <div className="h-full flex flex-col justify-center gap-3">
      <div className="grid grid-cols-3 gap-2.5">
        {tiles.map((t, k) => (
          <div key={k} className="card p-3 overflow-hidden" style={{ animation: "cvscUp .5s both", animationDelay: `${k * 0.12}s` }}>
            <div className="text-[9.5px] uppercase tracking-wide text-muted2">{t[0]}</div>
            <div className="overflow-hidden"><div className="text-[19px] font-extrabold" style={{ color: t[2], animation: "cvscCount .7s cubic-bezier(.2,.8,.2,1) both", animationDelay: `${0.15 + k * 0.12}s` }}>{t[1]}</div></div>
          </div>
        ))}
      </div>
      <div className="card p-3">
        <svg viewBox="0 0 320 90" className="w-full" style={{ display: "block", height: "auto" }}>
          <defs><linearGradient id="lsG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22c55e" stopOpacity=".3" /><stop offset="100%" stopColor="#22c55e" stopOpacity="0" /></linearGradient></defs>
          <path d="M6,74 C60,70 90,40 140,44 C190,48 230,20 314,10 L314,84 L6,84 Z" fill="url(#lsG)" opacity="0.9" />
          <path d="M6,74 C60,70 90,40 140,44 C190,48 230,20 314,10" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" pathLength="1" strokeDasharray="1" strokeDashoffset="1" style={{ animation: "cvscDraw 1.6s ease-out .2s both" }} />
        </svg>
      </div>
    </div>
  );
}
