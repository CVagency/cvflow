"use client";
import { useState, useEffect } from "react";

// Motion de présentation complet et auto-rotatif pour la page d'accueil.
// Montre TOUTES les fonctions en action : connexion QR, coffre auto-rempli,
// conversation (scripts, emojis, vocal/wave), fiche fan + tags, paiement auto, analytics.
const SCENES = [
  { key: "connect", tab: "cvflow · modèles", title: "Connexion Telegram en 1 scan" },
  { key: "vault", tab: "cvflow · coffre média", title: "Coffre auto-rempli depuis Dropp" },
  { key: "chat", tab: "cvflow · conversations", title: "Scripts, emojis, vocal & fiche fan" },
  { key: "paid", tab: "cvflow · paiement", title: "Paiement Dropp encaissé… tout seul" },
  { key: "stats", tab: "cvflow · analytics", title: "Le pilotage à la donnée" },
];
const DURATION = 5200;

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
          <div className="flex items-center gap-1.5 px-3 py-2.5 border-b border-line">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ef5f5f]" /><span className="w-2.5 h-2.5 rounded-full bg-[#e5b769]" /><span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
            <span className="text-[11px] text-muted2 ml-2">{s.tab}</span>
            <span className="ml-auto text-[11px] font-semibold text-acc pr-1 max-sm:hidden">{s.title}</span>
          </div>
          <div className="relative h-[310px] max-sm:h-[360px] overflow-hidden">
            <div key={s.key} className="absolute inset-0 p-3.5 cvsc-fade">
              {s.key === "connect" && <SceneConnect />}
              {s.key === "vault" && <SceneVault />}
              {s.key === "chat" && <SceneChat />}
              {s.key === "paid" && <ScenePaid />}
              {s.key === "stats" && <SceneStats />}
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-4 py-3 border-t border-line">
            {SCENES.map((sc, k) => (
              <button key={sc.key} onClick={() => setI(k)} className="h-1.5 rounded-full overflow-hidden bg-panel2 transition-all" style={{ width: k === i ? 40 : 16 }} aria-label={sc.title}>
                {k === i && <span className="block h-full bg-acc cvsc-bar" />}
              </button>
            ))}
          </div>
        </div>
      </div>
      <style jsx global>{`
        @keyframes cvscFade { from { opacity:0; transform: translateY(8px) scale(.99);} to { opacity:1; transform:none;} }
        .cvsc-fade { animation: cvscFade .5s ease-out both; }
        @keyframes cvscBar { from { width:0;} to { width:100%;} }
        .cvsc-bar { animation: cvscBar ${DURATION}ms linear both; }
        @keyframes cvscUp { from { opacity:0; transform: translateY(10px);} to { opacity:1; transform:none;} }
        @keyframes cvscScan { 0% { top:6%;} 50% { top:84%;} 100% { top:6%;} }
        @keyframes cvscPop { 0% { transform: scale(.6); opacity:0;} 60% { transform: scale(1.12);} 100% { transform: scale(1); opacity:1;} }
        @keyframes cvscPulse { 0%,100% { box-shadow:0 0 0 0 rgba(34,197,94,.5);} 70% { box-shadow:0 0 0 8px rgba(34,197,94,0);} }
        @keyframes cvscDraw { to { stroke-dashoffset:0;} }
        @keyframes cvscCount { from { transform: translateY(80%); opacity:0;} to { transform:none; opacity:1;} }
        @keyframes cvscFlash { 0% { background: rgba(34,197,94,.4); box-shadow:0 0 0 1px rgba(34,197,94,.6);} 100% { background: transparent; box-shadow:none;} }
        .cvsc-flash { animation: cvscFlash 1.1s ease-out both; }
        @keyframes cvscWave { 0%,100% { transform: scaleY(.28);} 50% { transform: scaleY(1);} }
        @keyframes cvscBlink { 0%,100% { opacity:1;} 50% { opacity:0;} }
      `}</style>
    </div>
  );
}

/* ── Scène 1 : Connexion Telegram avec un vrai QR ── */
function QR() {
  const N = 25, mods = [];
  const finder = (x, y) => {
    for (const [bx, by] of [[0, 0], [N - 7, 0], [0, N - 7]]) {
      if (x >= bx && x < bx + 7 && y >= by && y < by + 7) {
        const lx = x - bx, ly = y - by;
        return (lx === 0 || lx === 6 || ly === 0 || ly === 6 || (lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4)) ? 1 : 0;
      }
    }
    return -1;
  };
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const f = finder(x, y);
    const near = (x < 8 && y < 8) || (x > N - 9 && y < 8) || (x < 8 && y > N - 9);
    const on = f !== -1 ? f : (near ? 0 : ((x * 7 + y * 13 + x * y * 3) % 3 === 0 ? 1 : 0));
    if (on) mods.push(<rect key={x + "-" + y} x={x} y={y} width="1" height="1" />);
  }
  return <svg viewBox={`0 0 ${N} ${N}`} width="118" height="118" shapeRendering="crispEdges"><g fill="#0a0d0c">{mods}</g></svg>;
}
function SceneConnect() {
  return (
    <div className="h-full flex items-center justify-center gap-6 max-sm:flex-col">
      <div className="relative rounded-2xl bg-white p-2.5 shrink-0" style={{ animation: "cvscPop .5s ease-out both" }}>
        <QR />
        <div className="absolute left-2.5 right-2.5 h-[3px] rounded bg-acc shadow-[0_0_10px_#22c55e]" style={{ animation: "cvscScan 2.6s ease-in-out infinite" }} />
      </div>
      <div className="max-sm:text-center">
        <div className="flex items-center gap-2.5 mb-2 max-sm:justify-center">
          <span className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold" style={{ background: "linear-gradient(135deg,#0891b2,#0d9488)" }}>A</span>
          <div><div className="font-bold text-sm">Ange</div><div className="text-[11px] text-acc">● Telegram connecté</div></div>
        </div>
        <div className="inline-flex items-center gap-2 text-[12px] bg-acc/10 border border-acc/30 text-acc rounded-lg px-3 py-2 font-semibold" style={{ animation: "cvscPulse 1.6s ease-out infinite" }}>✓ Compte lié — statut en direct</div>
        <div className="text-[11px] text-muted2 mt-2 max-w-[230px]">Scanne le QR depuis le téléphone du modèle. Connecté / banni détecté automatiquement, reconnexion en 1 clic.</div>
      </div>
    </div>
  );
}

/* ── Scène 2 : Coffre média, auto-remplissage depuis Dropp ── */
function SceneVault() {
  const Field = ({ label, value, delay, mono }) => (
    <div className="mb-2">
      <div className="text-[9.5px] text-muted2 uppercase tracking-wide mb-1">{label}</div>
      <div className="rounded-lg border border-line bg-[#0a0d0c] px-2.5 py-1.5 text-[12px] cvsc-flash" style={{ animationDelay: `${delay}s` }}>
        <span className={mono ? "font-mono" : ""} style={{ animation: "cvscUp .4s both", animationDelay: `${delay}s` }}>{value}</span>
      </div>
    </div>
  );
  return (
    <div className="h-full flex items-center justify-center">
      <div className="w-[420px] max-w-full rounded-xl border border-line2 bg-panel p-3.5" style={{ animation: "cvscPop .45s ease-out both" }}>
        <div className="font-extrabold text-[13px] mb-2.5">Ajouter un média · Douche</div>
        <div className="mb-2">
          <div className="text-[9.5px] text-muted2 uppercase tracking-wide mb-1">Lien Dropp</div>
          <div className="rounded-lg border border-line bg-[#0a0d0c] px-2.5 py-1.5 text-[11px] font-mono text-muted truncate">app.dropp.fans/…/link_Ph0esr<span style={{ animation: "cvscBlink 1s step-end infinite" }}>▍</span></div>
        </div>
        <div className="inline-flex items-center gap-1.5 text-[11.5px] bg-tg/10 border border-tg/30 text-tg rounded-lg px-2.5 py-1.5 font-bold mb-3" style={{ animation: "cvscPulse 1.5s ease-out 3", animationDelay: ".2s" }}>⤓ Récupérer prix &amp; infos depuis Dropp</div>
        <div className="grid grid-cols-2 gap-2.5">
          <Field label="Nom du média" value="Vidéo douche" delay={1.1} />
          <Field label="Prix (€)" value="15 €" delay={1.35} mono />
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[9.5px] text-muted2 uppercase mr-1">Type</span>
          {["📷 Photo", "🎬 Vidéo", "🎧 Audio"].map((t, k) => (
            <span key={k} className={`text-[10.5px] px-2 py-1 rounded-md border ${k === 1 ? "border-acc bg-acc/15 text-acc cvsc-flash" : "border-line text-muted2"}`} style={k === 1 ? { animationDelay: "1.5s" } : {}}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Scène 3 : Conversation complète (fans + chat + scripts/emojis/vocal + fiche) ── */
function Wave() {
  return (
    <div className="flex items-end gap-[2px] h-4">
      {[.4, .8, .5, 1, .7, .35, .9, .6, .8, .45, .7, .5].map((h, k) => (
        <span key={k} className="w-[2px] rounded-full bg-white/80" style={{ height: `${h * 100}%`, transformOrigin: "bottom", animation: "cvscWave 1s ease-in-out infinite", animationDelay: `${k * 0.07}s` }} />
      ))}
    </div>
  );
}
function SceneChat() {
  const fans = [["Jérémie", "120€", "#22c55e"], ["Alex", "40€", "#e5b769"], ["Sam", "0€", "#5f6b66"]];
  const fiche = [["Âge", "24"], ["Ville", "Paris"], ["Budget", "élevé"]];
  return (
    <div className="h-full grid grid-cols-[118px_1fr_138px] gap-2 max-sm:grid-cols-1 text-left">
      {/* liste fans */}
      <div className="border-r border-line pr-2 flex flex-col gap-1.5 max-sm:hidden">
        <div className="text-[9px] text-muted2 uppercase tracking-wide mb-0.5">Fans · montant</div>
        {fans.map((f, k) => (
          <div key={k} className={`flex items-center gap-1.5 rounded-lg p-1.5 ${k === 0 ? "bg-panel2" : ""}`} style={{ animation: "cvscUp .4s both", animationDelay: `${k * 0.1}s` }}>
            <span className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white" style={{ background: f[2] }}>{f[0][0]}</span>
            <div className="min-w-0"><div className="text-[10px] font-semibold truncate">{f[0]}</div><div className="text-[9.5px] font-bold" style={{ color: f[2] }}>{f[1]}</div></div>
          </div>
        ))}
      </div>
      {/* chat */}
      <div className="flex flex-col min-h-0">
        <div className="flex-1 flex flex-col justify-end gap-1.5">
          <div className="self-start bg-panel border border-line rounded-2xl rounded-bl px-3 py-2 text-[11.5px] max-w-[85%]" style={{ animation: "cvscUp .4s both" }}>Coucou 🙈</div>
          <div className="self-end rounded-2xl rounded-br px-3 py-2 max-w-[85%] flex items-center gap-2 text-[#eafff2]" style={{ background: "linear-gradient(135deg,#16a34a,#128a44)", animation: "cvscUp .4s both", animationDelay: ".4s" }}><span className="text-[13px]">▶</span><Wave /><span className="text-[10px] opacity-80">0:07</span></div>
          <div className="self-end rounded-2xl rounded-br px-3 py-2 text-[11.5px] max-w-[85%] text-[#eafff2]" style={{ background: "linear-gradient(135deg,#16a34a,#128a44)", animation: "cvscUp .4s both", animationDelay: "1.5s" }}>J'ai une surprise pour toi 💦</div>
        </div>
        {/* composer + scripts + emojis */}
        <div className="mt-2 relative">
          <div className="absolute -top-[86px] left-0 right-6 bg-panel2 border border-line2 rounded-xl shadow-2xl overflow-hidden" style={{ animation: "cvscUp .4s both", animationDelay: ".8s" }}>
            <div className="px-2.5 py-1.5 text-[9px] text-muted2 border-b border-line">Scripts de Ange</div>
            {[["/surprise", "Teasing"], ["/relance", "Relance douce"]].map((sc, k) => (
              <div key={k} className={`px-2.5 py-1.5 text-[10.5px] ${k === 0 ? "bg-panel text-acc" : "text-muted"}`}><span className="font-mono text-tg">{sc[0]}</span> · {sc[1]}</div>
            ))}
          </div>
          <div className="flex gap-1 mb-1.5">{["😍", "🔥", "😏", "🥰", "😘", "💦", "😈"].map((e) => <span key={e} className="text-[13px]">{e}</span>)}</div>
          <div className="flex items-center gap-1.5">
            <div className="flex-1 rounded-lg border border-line bg-[#0a0d0c] px-2.5 py-1.5 text-[11px] text-muted font-mono">/surprise<span style={{ animation: "cvscBlink 1s step-end infinite" }}>▍</span></div>
            <span className="w-7 h-7 rounded-lg btn flex items-center justify-center text-[13px]">➤</span>
          </div>
        </div>
      </div>
      {/* fiche fan */}
      <div className="border-l border-line pl-2 max-sm:hidden">
        <div className="text-[9px] text-muted2 uppercase tracking-wide mb-1.5">Fiche fan</div>
        <div className="flex flex-wrap gap-1 mb-2">
          {[["VIP", 1], ["Baleine", 0], ["TW", 0]].map((t, k) => (
            <span key={k} className={`text-[9.5px] px-1.5 py-0.5 rounded-full font-semibold ${t[1] ? "bg-gold/15 text-gold cvsc-flash" : "bg-panel2 text-muted2"}`} style={t[1] ? { animationDelay: ".6s" } : {}}>{t[0]}</span>
          ))}
        </div>
        {fiche.map((f, k) => (
          <div key={k} className="flex justify-between items-center py-1 text-[10.5px] border-b border-line/40" style={{ animation: "cvscUp .4s both", animationDelay: `${0.9 + k * 0.25}s` }}>
            <span className="text-muted2">{f[0]}</span><span className="font-semibold cvsc-flash rounded px-1" style={{ animationDelay: `${0.9 + k * 0.25}s` }}>{f[1]}</span>
          </div>
        ))}
        <div className="mt-2 text-[9px] text-muted2 uppercase">Dépensé</div>
        <div className="text-acc font-extrabold text-base" style={{ animation: "cvscCount .6s both", animationDelay: "1.6s" }}>120€</div>
      </div>
    </div>
  );
}

/* ── Scène 4 : Paiement auto Dropp ── */
function ScenePaid() {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-3">
      <div className="rounded-xl border border-gold/40 p-3 flex items-center gap-3 w-[320px] max-w-full" style={{ background: "rgba(229,183,105,.07)" }}>
        <div className="w-14 h-14 rounded-lg flex items-center justify-center text-xl" style={{ background: "linear-gradient(135deg,#3a2f1a,#221b0f)" }}>🎬</div>
        <div className="flex-1">
          <div className="text-[13px] font-bold">Vidéo douche</div>
          <div className="text-gold font-extrabold text-sm">15€ · Dropp</div>
          <div className="mt-1 text-[11px]">
            <span className="text-muted2 line-through mr-1.5">en attente</span>
            <span className="text-acc font-bold" style={{ display: "inline-block", animation: "cvscPop .6s ease-out both", animationDelay: "1.1s" }}>payé ✓</span>
          </div>
        </div>
      </div>
      <div className="text-[12px] text-muted2 max-w-[320px] text-center" style={{ animation: "cvscUp .5s both", animationDelay: "1.3s" }}>Le fan paie sur Dropp → <b className="text-acc">encaissé automatiquement</b>, sans toucher à rien.</div>
      <div className="flex items-center gap-2 text-[11px]" style={{ animation: "cvscUp .5s both", animationDelay: "1.6s" }}>
        <span className="bg-acc/10 border border-acc/30 text-acc rounded-full px-2.5 py-1 font-semibold">+15€ · crédité à Tiana</span>
        <span className="bg-panel border border-line text-muted rounded-full px-2.5 py-1">webhook Dropp</span>
      </div>
    </div>
  );
}

/* ── Scène 5 : Analytics ── */
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
        <svg viewBox="0 0 320 100" className="w-full" style={{ display: "block", height: "auto" }}>
          <defs><linearGradient id="lsG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22c55e" stopOpacity=".3" /><stop offset="100%" stopColor="#22c55e" stopOpacity="0" /></linearGradient></defs>
          <path d="M6,82 C60,78 90,44 140,48 C190,52 230,22 314,12 L314,92 L6,92 Z" fill="url(#lsG)" />
          <path d="M6,82 C60,78 90,44 140,48 C190,52 230,22 314,12" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" pathLength="1" strokeDasharray="1" strokeDashoffset="1" style={{ animation: "cvscDraw 1.7s ease-out .2s both" }} />
        </svg>
      </div>
    </div>
  );
}
