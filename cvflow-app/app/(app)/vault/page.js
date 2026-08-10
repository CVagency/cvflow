"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { thumbBg, TYPE_ICON } from "@/lib/ui";

export default function Vault() {
  const { models, vault, activeModel, setActiveModel, addMedia } = useStore();
  const [open, setOpen] = useState(null); // folderIdx
  const folders = vault[activeModel] || [];
  const m = models.find((x) => x.id === activeModel);
  const [form, setForm] = useState({ link: "", name: "", type: "photo", lvl: 1, price: 20 });

  return (
    <div className="p-6">
      <div className="flex items-center mb-1.5">
        <div className="text-xl font-extrabold">Coffre média</div><div className="flex-1" />
        <div className="badge text-muted bg-panel border border-line px-3 py-1.5">Modèle : <select value={activeModel} onChange={(e) => setActiveModel(e.target.value)} className="bg-transparent text-txt font-semibold ml-1 outline-none">{models.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></div>
      </div>
      <div className="text-[13px] text-muted mb-4">Le manager organise les médias Dropp par dossier et par niveau. Aperçu visible → le chatteur envoie en 1 clic, dans le bon ordre. {m?.dropp ? <span className="text-acc">Dropp connecté ✓</span> : <span className="text-danger">Dropp non connecté (clé API dans Réglages)</span>}</div>
      {folders.map((f, fi) => (
        <div key={fi} className="card mb-3.5 overflow-hidden">
          <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-line bg-panel2">📁 <span className="font-bold text-sm">{f.folder}</span><span className="text-[11px] text-muted">· {f.items.length} médias ordonnés</span></div>
          <div className="grid gap-3 p-4" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))" }}>
            {f.items.map((it, i) => (
              <div key={i} className="border border-line rounded-lg overflow-hidden bg-bg2">
                <div className="h-24 relative flex items-center justify-center text-2xl" style={{ background: thumbBg(it.name) }}>
                  <span className="absolute top-1.5 left-1.5 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">Lvl {it.lvl}</span>{TYPE_ICON[it.type]}
                  <span className="absolute bottom-1.5 right-1.5 bg-black/50 text-white text-[9px] px-1.5 py-0.5 rounded">{it.type}</span>
                </div>
                <div className="px-2.5 py-2"><div className="text-[12px] font-semibold truncate">{it.name}</div><div className="text-[12px] font-bold mt-0.5" style={{ color: it.free ? "#22c55e" : "#e5b769" }}>{it.free ? "Gratuit" : it.price + "€"}</div></div>
              </div>
            ))}
            <button onClick={() => { setForm({ link: "", name: "", type: "photo", lvl: f.items.length + 1, price: 20 }); setOpen(fi); }} className="border border-dashed border-line2 rounded-lg flex items-center justify-center text-muted2 text-[13px] min-h-[150px] hover:text-acc hover:border-acc">＋ Ajouter un média Dropp</button>
          </div>
        </div>
      ))}

      {open !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={(e) => { if (e.target === e.currentTarget) setOpen(null); }}>
          <div className="card p-6 w-[520px] max-w-[92vw]">
            <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-extrabold">Ajouter un média · {folders[open].folder}</h2><button onClick={() => setOpen(null)} className="w-[30px] h-[30px] rounded-lg bg-panel2 text-muted">✕</button></div>
            <label className="text-xs text-muted font-semibold block mb-1.5">Lien Dropp (copier-coller)</label>
            <input className="inp w-full px-3 py-2.5 mb-3" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="https://dropp.fans/…" />
            <label className="text-xs text-muted font-semibold block mb-1.5">Nom du média</label>
            <input className="inp w-full px-3 py-2.5 mb-3" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Vidéo douche complète" />
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div><label className="text-xs text-muted font-semibold block mb-1.5">Type</label><select className="inp w-full px-3 py-2.5" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option value="photo">Photo</option><option value="video">Vidéo</option><option value="audio">Audio</option><option value="bundle">Bundle</option></select></div>
              <div><label className="text-xs text-muted font-semibold block mb-1.5">Niveau (ordre)</label><input type="number" className="inp w-full px-3 py-2.5" value={form.lvl} onChange={(e) => setForm({ ...form, lvl: parseInt(e.target.value) || 1 })} /></div>
            </div>
            <label className="text-xs text-muted font-semibold block mb-1.5">Prix (€) · 0 = gratuit</label>
            <input type="number" className="inp w-full px-3 py-2.5 mb-3" value={form.price} onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })} />
            <div className="bg-bg2 border border-line rounded-lg p-2.5 text-[12px] text-muted mb-4">💡 C'est à l'agence de créer les liens payants sur Dropp Fans, puis de les coller ici. Le chatteur les enverra ensuite en 1 clic dans le bon ordre.</div>
            <button onClick={() => { addMedia(activeModel, open, { name: form.name || "Nouveau média", type: form.type, lvl: form.lvl, price: form.price, link: form.link }); setOpen(null); }} className="btn w-full py-2.5 font-bold">Ajouter au coffre</button>
          </div>
        </div>
      )}
    </div>
  );
}
