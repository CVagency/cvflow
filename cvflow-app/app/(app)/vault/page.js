"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { supabase } from "@/lib/supabaseClient";
import { thumbBg, typeIcons, typeLabel } from "@/lib/ui";
import ModelSwitcher from "@/components/ModelSwitcher";
import CopyLink from "@/components/CopyLink";

const TYPES = [["photo", "📷", "Photo"], ["video", "🎬", "Vidéo"], ["audio", "🎧", "Audio"]];

export default function Vault() {
  const { models, vault, activeModel, addMedia, addFolder, deleteFolder, deleteMedia } = useStore();
  const current = activeModel || models[0]?.id;
  const [open, setOpen] = useState(null);
  const [folderOpen, setFolderOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [confirmDel, setConfirmDel] = useState(null); // {type:'folder'|'media', id, name}
  const folders = vault[current] || [];
  const m = models.find((x) => x.id === current);
  const [form, setForm] = useState({ link: "", name: "", types: ["photo"], lvl: 1, price: 20 });
  const [droppBusy, setDroppBusy] = useState(false);
  const [droppErr, setDroppErr] = useState("");

  async function fetchDropp() {
    if (!form.link || !current) { setDroppErr("Colle d'abord le lien Dropp."); return; }
    setDroppBusy(true); setDroppErr("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const r = await fetch("/api/dropp/link-info", { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${session?.access_token}` }, body: JSON.stringify({ modelId: current, linkUrl: form.link }) });
      const out = await r.json();
      if (out?.ok) setForm((f) => ({ ...f, name: out.name || f.name, price: out.priceCents != null ? Math.round(out.priceCents / 100) : f.price, types: out.types?.length ? out.types : f.types }));
      else setDroppErr(out?.error || "Échec de la récupération.");
    } catch (e) { setDroppErr("Impossible de joindre Dropp."); }
    setDroppBusy(false);
  }

  function toggleType(t) {
    setForm((f) => {
      const has = f.types.includes(t);
      const types = has ? f.types.filter((x) => x !== t) : [...f.types, t];
      return { ...f, types: types.length ? types : [t] }; // au moins un type
    });
  }

  if (!models.length) return <div className="p-6"><div className="h-[60vh] flex flex-col items-center justify-center text-center gap-2"><div className="text-4xl opacity-40">🗄️</div><div className="font-bold text-lg">Aucun modèle</div><div className="text-muted text-sm">Connecte un modèle dans l'onglet Modèles pour créer son coffre.</div></div></div>;

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-1.5 flex-wrap">
        <div className="text-xl font-extrabold">Coffre média</div>
        <div className="flex-1 min-w-[120px]" />
        <ModelSwitcher showCount={false} />
        <button onClick={() => { setFolderName(""); setFolderOpen(true); }} className="btn-ghost px-3 py-2 text-[12px] font-semibold">＋ Dossier</button>
      </div>
      <div className="text-[13px] text-muted mb-4">Organise les médias Dropp par dossier et par niveau. Aperçu visible → le chatteur envoie en 1 clic. {m?.dropp ? <span className="text-acc">Dropp connecté ✓</span> : <span className="text-muted2">Colle simplement les liens Dropp ci-dessous.</span>}</div>

      {folders.length === 0 && <div className="card p-8 text-center text-muted2 text-[13px]">Aucun dossier. Clique sur « ＋ Dossier » pour commencer (ex : Douche, Bain, Script Livre).</div>}

      {folders.map((f, fi) => (
        <div key={f.folderId || fi} className="card mb-3.5 overflow-hidden">
          <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-line bg-panel2">📁 <span className="font-bold text-sm">{f.folder}</span><span className="text-[11px] text-muted">· {f.items.length} médias</span><div className="flex-1" /><button onClick={() => setConfirmDel({ type: "folder", id: f.folderId, name: f.folder })} className="w-7 h-7 rounded-lg bg-bg2 text-muted hover:text-danger flex items-center justify-center" title="Supprimer le dossier">🗑</button></div>
          <div className="grid gap-3 p-4" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))" }}>
            {f.items.map((it, i) => (
              <div key={it.id || i} className="border border-line rounded-lg overflow-hidden bg-bg2">
                <div className="h-24 relative flex items-center justify-center text-2xl" style={{ background: thumbBg(it.name) }}>
                  <span className="absolute top-1.5 left-1.5 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">Lvl {it.lvl}</span>{typeIcons(it.type)}
                  <button onClick={() => setConfirmDel({ type: "media", id: it.id, name: it.name })} className="absolute top-1.5 right-1.5 w-6 h-6 rounded-md bg-black/60 text-white/80 hover:text-danger flex items-center justify-center text-[12px]" title="Supprimer ce média">✕</button>
                  <span className="absolute bottom-1.5 right-1.5 bg-black/50 text-white text-[9px] px-1.5 py-0.5 rounded">{typeLabel(it.type)}</span>
                </div>
                <div className="px-2.5 py-2">
                  <div className="text-[12px] font-semibold truncate">{it.name}</div>
                  <div className="text-[12px] font-bold mt-0.5 mb-2" style={{ color: it.free ? "#22c55e" : "#e5b769" }}>{it.free ? "Gratuit" : it.price + "€"}</div>
                  <CopyLink text={it.link} className="w-full text-[11px] font-bold py-1.5 rounded-md bg-tg/15 text-tg hover:bg-tg/25 border border-tg/30" />
                </div>
              </div>
            ))}
            <button onClick={() => { setForm({ link: "", name: "", types: ["photo"], lvl: f.items.length + 1, price: 20 }); setOpen(fi); }} className="border border-dashed border-line2 rounded-lg flex items-center justify-center text-muted2 text-[13px] min-h-[150px] hover:text-acc hover:border-acc">＋ Ajouter un média Dropp</button>
          </div>
        </div>
      ))}

      {folderOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={(e) => { if (e.target === e.currentTarget) setFolderOpen(false); }}>
          <div className="card p-6 w-[420px] max-w-[92vw]">
            <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-extrabold">Nouveau dossier</h2><button onClick={() => setFolderOpen(false)} className="w-[30px] h-[30px] rounded-lg bg-panel2 text-muted">✕</button></div>
            <label className="text-xs text-muted font-semibold block mb-1.5">Nom du dossier</label>
            <input className="inp w-full px-3 py-2.5 mb-4" value={folderName} onChange={(e) => setFolderName(e.target.value)} placeholder="Ex: Douche" />
            <button onClick={async () => { await addFolder(current, folderName || "Nouveau dossier"); setFolderOpen(false); }} className="btn w-full py-2.5 font-bold">Créer</button>
          </div>
        </div>
      )}

      {open !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={(e) => { if (e.target === e.currentTarget) setOpen(null); }}>
          <div className="card p-6 w-[520px] max-w-[92vw]">
            <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-extrabold">Ajouter un média · {folders[open].folder}</h2><button onClick={() => setOpen(null)} className="w-[30px] h-[30px] rounded-lg bg-panel2 text-muted">✕</button></div>
            <label className="text-xs text-muted font-semibold block mb-1.5">Lien Dropp (copier-coller)</label>
            <input className="inp w-full px-3 py-2.5 mb-2" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="https://app.dropp.fans/external/share/link/link_…" />
            <button type="button" onClick={fetchDropp} disabled={droppBusy} className="btn-ghost text-[12px] px-2.5 py-1.5 mb-1 font-semibold disabled:opacity-50">{droppBusy ? "Récupération…" : "⤓ Récupérer prix & infos depuis Dropp"}</button>
            {droppErr && <div className="text-danger text-[11.5px] mb-1">{droppErr}</div>}
            <div className="mb-3" />
            <label className="text-xs text-muted font-semibold block mb-1.5">Nom du média</label>
            <input className="inp w-full px-3 py-2.5 mb-3" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Vidéo douche complète" />
            <label className="text-xs text-muted font-semibold block mb-1.5">Type de contenu <span className="text-muted2 font-normal">(un lien peut en combiner plusieurs)</span></label>
            <div className="flex gap-2 mb-3">
              {TYPES.map(([val, icon, label]) => {
                const on = form.types.includes(val);
                return (
                  <button key={val} type="button" onClick={() => toggleType(val)} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg border text-[13px] font-semibold transition ${on ? "border-acc bg-acc/15 text-acc" : "border-line bg-bg2 text-muted hover:border-line2"}`}>
                    <span className="text-base">{icon}</span>{label}
                  </button>
                );
              })}
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div><label className="text-xs text-muted font-semibold block mb-1.5">Niveau (ordre)</label><input type="number" className="inp w-full px-3 py-2.5" value={form.lvl} onChange={(e) => setForm({ ...form, lvl: parseInt(e.target.value) || 1 })} /></div>
              <div><label className="text-xs text-muted font-semibold block mb-1.5">Prix (€) · 0 = gratuit</label><input type="number" className="inp w-full px-3 py-2.5" value={form.price} onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })} /></div>
            </div>
            <button onClick={async () => { await addMedia(current, open, { name: form.name || "Nouveau média", type: form.types.join(","), lvl: form.lvl, price: form.price, link: form.link }); setOpen(null); }} className="btn w-full py-2.5 font-bold">Ajouter au coffre</button>
          </div>
        </div>
      )}

      {confirmDel && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={(e) => { if (e.target === e.currentTarget) setConfirmDel(null); }}>
          <div className="card p-6 w-[440px] max-w-[92vw]">
            <div className="text-lg font-extrabold mb-2">Supprimer {confirmDel.type === "folder" ? "le dossier" : "le média"} « {confirmDel.name} » ?</div>
            <div className="text-muted text-[13px] mb-5">{confirmDel.type === "folder" ? "Le dossier et tous les médias qu'il contient seront supprimés définitivement." : "Ce média sera retiré du coffre définitivement."}</div>
            <div className="flex gap-2.5">
              <button onClick={() => setConfirmDel(null)} className="btn-ghost flex-1 py-2.5 font-semibold">Annuler</button>
              <button onClick={async () => { const d = confirmDel; setConfirmDel(null); if (d.type === "folder") await deleteFolder(d.id); else await deleteMedia(d.id); }} className="flex-1 py-2.5 font-bold rounded-[10px]" style={{ background: "#ef5f5f", color: "#fff" }}>Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
