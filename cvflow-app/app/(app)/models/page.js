"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { eur } from "@/lib/ui";

function QR() {
  let cells = [];
  for (let y = 0; y < 21; y++) for (let x = 0; x < 21; x++) {
    const corner = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13);
    const on = corner ? ((x === 0 || x === 6 || y === 0 || y === 6 || (x > 1 && x < 5 && y > 1 && y < 5)) ? 1 : 0) : ((x * 7 + y * 3) % 2);
    if (on) cells.push(<rect key={x + "-" + y} x={x * 8} y={y * 8} width="8" height="8" />);
  }
  return <svg width="168" height="168" viewBox="0 0 168 168" style={{ background: "#fff", borderRadius: 10 }}><g fill="#0a0d0c">{cells}</g></svg>;
}

export default function Models() {
  const { models, vault, addModel } = useStore();
  const [connect, setConnect] = useState(false);
  const [name, setName] = useState("");
  const [step, setStep] = useState("form"); // form → qr → done
  const [sheet, setSheet] = useState(null);

  function startQR() {
    setStep("qr");
    setTimeout(() => { addModel(name || "Nouveau modèle"); setStep("done"); setTimeout(() => { setConnect(false); setStep("form"); setName(""); }, 1100); }, 2600);
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-4"><div className="text-xl font-extrabold">Modèles</div><div className="flex-1" /><button onClick={() => { setConnect(true); setStep("form"); }} className="btn px-4 py-2.5 font-bold">＋ Connecter un compte</button></div>
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(310px,1fr))" }}>
        {models.map((m) => (
          <div key={m.id} className="card p-[18px]">
            <div className="flex items-center gap-3 mb-4"><div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg" style={{ background: `linear-gradient(135deg,${m.color},${m.c2})` }}>{m.name[0]}</div><div className="flex-1"><div className="font-bold text-[15px]">{m.name}</div><div className="text-[12px] text-acc flex items-center gap-1.5 mt-0.5">● Connecté · proxy FR dédié</div></div></div>
            <div className="grid grid-cols-3 gap-2 mb-3.5">
              {[[m.fans, "Fans"], ["€" + (m.ca30 / 1000).toFixed(1) + "k", "CA 30j"], [m.ppv, "PPV"]].map((s, i) => <div key={i} className="bg-bg2 rounded-lg p-2.5 text-center"><div className="text-base font-extrabold">{s[0]}</div><div className="text-[10px] text-muted uppercase mt-0.5">{s[1]}</div></div>)}
            </div>
            <div className="flex gap-2 mb-3.5">
              {[["WhatsApp", m.wa, "#25d366"], ["Telegram", m.tg, "#3aa0e6"], ["Dropp", m.dropp, "#e5b769"]].map((c) => <div key={c[0]} className="flex-1 flex items-center gap-1.5 bg-bg2 border border-line rounded-lg px-2 py-2 text-[11.5px]"><span className="w-2 h-2 rounded-full" style={{ background: c[1] ? "#22c55e" : "#5f6b66" }} /><span style={{ color: c[2] }}>{c[0]}</span></div>)}
            </div>
            <div className="flex gap-2"><button onClick={() => setSheet(m.id)} className="btn-ghost flex-1 py-2 text-[12px] font-semibold">Fiche persona</button><button className="btn flex-1 py-2 text-[12px] font-bold">Coffre →</button></div>
          </div>
        ))}
      </div>

      {connect && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={(e) => { if (e.target === e.currentTarget && step !== "qr") setConnect(false); }}>
          <div className="card p-6 w-[500px] max-w-[92vw]">
            <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-extrabold">Connecter un compte modèle</h2><button onClick={() => setConnect(false)} className="w-[30px] h-[30px] rounded-lg bg-panel2 text-muted">✕</button></div>
            {step === "form" && <>
              <label className="text-xs text-muted font-semibold block mb-1.5">Nom du modèle</label>
              <input className="inp w-full px-3 py-2.5 mb-3" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Céline" />
              <label className="text-xs text-muted font-semibold block mb-1.5">Méthode Telegram</label>
              <select className="inp w-full px-3 py-2.5 mb-3"><option>Via QR code (recommandé)</option><option>Via numéro de téléphone</option></select>
              <label className="text-xs text-muted font-semibold block mb-1.5">Proxy</label>
              <select className="inp w-full px-3 py-2.5 mb-4"><option>IP résidentielle FR dédiée (anti-ban)</option></select>
              <button onClick={startQR} className="btn w-full py-2.5 font-bold">Générer le QR code</button>
            </>}
            {step === "qr" && <div className="text-center py-2"><div className="flex justify-center"><QR /></div><div className="text-[12.5px] text-muted mt-2.5">📲 Telegram → Réglages → Appareils → Scanner un QR</div><div className="text-[12px] text-muted2 mt-1">Connexion via proxy FR dédié…</div></div>}
            {step === "done" && <div className="text-center py-8 text-acc font-bold">✓ {name || "Modèle"} connectée à Telegram</div>}
          </div>
        </div>
      )}

      {sheet && (() => { const m = models.find((x) => x.id === sheet); return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={(e) => { if (e.target === e.currentTarget) setSheet(null); }}>
          <div className="card p-6 w-[520px] max-w-[92vw]">
            <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-extrabold">Fiche persona · {m.name}</h2><button onClick={() => setSheet(null)} className="w-[30px] h-[30px] rounded-lg bg-panel2 text-muted">✕</button></div>
            <div className="grid grid-cols-2 gap-3 mb-3"><div><label className="text-xs text-muted font-semibold block mb-1.5">Nom de scène</label><input className="inp w-full px-3 py-2.5" defaultValue={m.name} /></div><div><label className="text-xs text-muted font-semibold block mb-1.5">Âge (persona)</label><input className="inp w-full px-3 py-2.5" placeholder="23" /></div></div>
            <label className="text-xs text-muted font-semibold block mb-1.5">Bio / personnalité (le chatteur s'en inspire)</label>
            <textarea className="inp w-full px-3 py-2.5 mb-3" rows={3} placeholder="Ton, univers, façon de parler…" />
            <div className="grid grid-cols-2 gap-3 mb-4"><div><label className="text-xs text-muted font-semibold block mb-1.5">À faire</label><textarea className="inp w-full px-3 py-2.5" rows={2} placeholder="tutoyer, taquiner" /></div><div><label className="text-xs text-muted font-semibold block mb-1.5">À éviter</label><textarea className="inp w-full px-3 py-2.5" rows={2} placeholder="parler d'argent trop tôt" /></div></div>
            <button onClick={() => setSheet(null)} className="btn w-full py-2.5 font-bold">Enregistrer</button>
          </div>
        </div>
      ); })()}
    </div>
  );
}
