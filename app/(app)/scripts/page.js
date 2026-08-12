"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";

export default function Scripts() {
  const { models, scripts, activeModel, setActiveModel, addScript } = useStore();
  const current = activeModel || models[0]?.id;
  const list = scripts[current] || [];
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ command: "/", title: "", body: "" });

  if (!models.length) return <div className="p-6"><div className="h-[60vh] flex flex-col items-center justify-center text-center gap-2"><div className="text-4xl opacity-40">📝</div><div className="font-bold text-lg">Aucun modèle</div><div className="text-muted text-sm">Connecte un modèle pour créer ses scripts.</div></div></div>;

  return (
    <div className="p-6">
      <div className="flex items-center mb-4">
        <div>
          <div className="text-xl font-extrabold">Scripts</div>
          <div className="text-[13px] text-muted mt-1">Modèle : <select value={current} onChange={(e) => setActiveModel(e.target.value)} className="bg-panel border border-line rounded-md text-txt px-2 py-1 outline-none">{models.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select> · {list.length} scripts · accès chatteur via <b className="text-tg">/</b></div>
        </div>
        <div className="flex-1" /><button onClick={() => { setForm({ command: "/", title: "", body: "" }); setOpen(true); }} className="btn px-4 py-2.5 font-bold">＋ Nouveau script</button>
      </div>
      {list.length === 0 && <div className="card p-8 text-center text-muted2 text-[13px]">Aucun script. Crée-en un — le chatteur l'insérera en tapant « / » dans la conversation.</div>}
      {list.map((s, i) => (
        <div key={i} className="card p-4 mb-3">
          <div className="flex items-center gap-2.5 mb-2.5"><span className="w-[22px] h-[22px] rounded-md bg-panel2 flex items-center justify-center text-[11px] text-muted">{i + 1}</span><span className="font-mono text-[12px] bg-tg/15 text-tg px-2 py-0.5 rounded font-semibold">{s[0]}</span><span className="font-semibold">{s[1]}</span></div>
          <div className="bg-bg2 border border-line rounded-lg px-3.5 py-2.5 text-[13px]">{s[2]}</div>
        </div>
      ))}

      {open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div className="card p-6 w-[480px] max-w-[92vw]">
            <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-extrabold">Nouveau script</h2><button onClick={() => setOpen(false)} className="w-[30px] h-[30px] rounded-lg bg-panel2 text-muted">✕</button></div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div><label className="text-xs text-muted font-semibold block mb-1.5">Raccourci</label><input className="inp w-full px-3 py-2.5" value={form.command} onChange={(e) => setForm({ ...form, command: e.target.value })} placeholder="/accroche" /></div>
              <div><label className="text-xs text-muted font-semibold block mb-1.5">Titre</label><input className="inp w-full px-3 py-2.5" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Accroche" /></div>
            </div>
            <label className="text-xs text-muted font-semibold block mb-1.5">Message</label>
            <textarea className="inp w-full px-3 py-2.5 mb-4" rows={3} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="Heyy 😍 tu fais quoi de beau ?" />
            <button onClick={async () => { await addScript(current, form.command || "/script", form.title || "Script", form.body); setOpen(false); }} className="btn w-full py-2.5 font-bold">Créer le script</button>
          </div>
        </div>
      )}
    </div>
  );
}
