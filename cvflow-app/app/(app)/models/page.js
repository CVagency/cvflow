"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";

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
  const { models, convs, addModel, deleteModel, setActiveModel } = useStore();
  const router = useRouter();
  const [connect, setConnect] = useState(false);
  const [name, setName] = useState("");
  const [step, setStep] = useState("form");
  const [confirmDel, setConfirmDel] = useState(null);

  function startQR() {
    setStep("qr");
    setTimeout(() => { addModel(name || "Nouveau modèle"); setStep("done"); setTimeout(() => { setConnect(false); setStep("form"); setName(""); }, 1100); }, 2600);
  }

  function openVault(id) { setActiveModel(id); router.push("/vault"); }

  return (
    <div className="p-6">
      <div className="flex items-center mb-4"><div className="text-xl font-extrabold">Modèles</div><div className="flex-1" /><button onClick={() => { setConnect(true); setStep("form"); }} className="btn px-4 py-2.5 font-bold">＋ Connecter un compte</button></div>

      {models.length === 0 ? (
        <div className="h-[50vh] flex flex-col items-center justify-center text-center gap-2"><div className="text-4xl opacity-40">👤</div><div className="font-bold text-lg">Aucun modèle</div><div className="text-muted text-sm">Connecte un compte Telegram pour commencer.</div></div>
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(310px,1fr))" }}>
          {models.map((m) => (
            <div key={m.id} className="card p-[18px]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg" style={{ background: `linear-gradient(135deg,${m.color},${m.c2 || "#0d9488"})` }}>{m.name[0]}</div>
                <div className="flex-1"><div className="font-bold text-[15px]">{m.name}</div><div className="text-[12px] text-acc flex items-center gap-1.5 mt-0.5">● Connecté · proxy FR</div></div>
                <button onClick={() => setConfirmDel(m)} className="w-8 h-8 rounded-lg bg-panel2 text-muted hover:text-danger flex items-center justify-center" title="Supprimer">🗑</button>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3.5">
                {[[convs.filter((c) => c.model_id === m.id).length, "Fans"], [m.ppv || 0, "PPV"], ["€0", "CA"]].map((s, i) => <div key={i} className="bg-bg2 rounded-lg p-2.5 text-center"><div className="text-base font-extrabold">{s[0]}</div><div className="text-[10px] text-muted uppercase mt-0.5">{s[1]}</div></div>)}
              </div>
              <div className="flex gap-2 mb-3.5">
                {[["WhatsApp", m.wa, "#25d366"], ["Telegram", m.tg, "#3aa0e6"], ["Dropp", m.dropp, "#e5b769"]].map((c) => <div key={c[0]} className="flex-1 flex items-center gap-1.5 bg-bg2 border border-line rounded-lg px-2 py-2 text-[11.5px]"><span className="w-2 h-2 rounded-full" style={{ background: c[1] ? "#22c55e" : "#5f6b66" }} /><span style={{ color: c[2] }}>{c[0]}</span></div>)}
              </div>
              <div className="flex gap-2">
                <button onClick={() => router.push("/scripts")} className="btn-ghost flex-1 py-2 text-[12px] font-semibold">Scripts</button>
                <button onClick={() => openVault(m.id)} className="btn flex-1 py-2 text-[12px] font-bold">Coffre →</button>
              </div>
            </div>
          ))}
        </div>
      )}

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

      {confirmDel && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={(e) => { if (e.target === e.currentTarget) setConfirmDel(null); }}>
          <div className="card p-6 w-[440px] max-w-[92vw]">
            <div className="text-lg font-extrabold mb-2">Supprimer {confirmDel.name} ?</div>
            <div className="text-muted text-[13px] mb-5">Le modèle et tout son coffre, ses scripts, ses fans et messages seront supprimés définitivement.</div>
            <div className="flex gap-2.5">
              <button onClick={() => setConfirmDel(null)} className="btn-ghost flex-1 py-2.5 font-semibold">Annuler</button>
              <button onClick={async () => { const id = confirmDel.id; setConfirmDel(null); await deleteModel(id); }} className="flex-1 py-2.5 font-bold rounded-[10px]" style={{ background: "#ef5f5f", color: "#fff" }}>Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
