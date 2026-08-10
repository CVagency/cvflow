"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { initials, eur } from "@/lib/ui";
import Kpi from "@/components/Kpi";

export default function Employees() {
  const { team, models, setPct, addMember } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "CHATTER", pct: 8 });

  return (
    <div className="p-6">
      <div className="flex items-center mb-4"><div className="text-xl font-extrabold">Employés</div><div className="flex-1" /><button onClick={() => setOpen(true)} className="btn px-4 py-2.5 font-bold">＋ Inviter un membre</button></div>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <Kpi label="Membres" value={team.length} sub="1 admin · chatteurs" />
        <Kpi label="En ligne" value={team.filter((e) => e.online).length} sub="maintenant" up />
        <Kpi label="Part chatteurs 30j" value={eur(team.reduce((a, e) => a + Math.round((e.ca * e.pct) / 100), 0))} sub="commissions à verser" />
      </div>
      <div className="card p-[18px]">
        <h3 className="text-[13px] font-semibold text-muted mb-3.5">Membres · commission éditable</h3>
        <table className="w-full">
          <thead><tr className="text-left text-[11px] uppercase tracking-wide text-muted2">{["Membre", "Rôle", "Modèles", "CA généré", "Commission %", "Sa part"].map((h, i) => <th key={h} className={`py-2.5 px-3.5 border-b border-line font-semibold ${i === 5 ? "text-right" : ""}`}>{h}</th>)}</tr></thead>
          <tbody>
            {team.map((e) => (
              <tr key={e.id} className="hover:bg-panel2">
                <td className="py-3 px-3.5 border-b border-line"><div className="flex items-center gap-2.5"><div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold text-white" style={{ background: e.color }}>{initials(e.name)}</div><div><div className="font-semibold">{e.name}</div><div className="text-[11px] text-muted">{e.email}</div></div></div></td>
                <td className="py-3 px-3.5 border-b border-line"><span className={`badge ${e.role === "ADMIN" ? "text-purple bg-purple/15" : "text-acc bg-acc/15"}`}>{e.role}</span></td>
                <td className="py-3 px-3.5 border-b border-line">{e.models.map((id) => models.find((m) => m.id === id)?.name).filter(Boolean).join(", ")}</td>
                <td className="py-3 px-3.5 border-b border-line text-acc font-bold">{eur(e.ca)}</td>
                <td className="py-3 px-3.5 border-b border-line"><div className="flex items-center gap-1.5"><input type="number" defaultValue={e.pct} onChange={(ev) => setPct(e.id, ev.target.value)} className="w-16 inp px-2 py-1.5" /><span className="text-muted">%</span></div></td>
                <td className="py-3 px-3.5 border-b border-line text-right text-acc font-bold">{e.pct ? eur(Math.round((e.ca * e.pct) / 100)) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="text-[12px] text-muted mt-3">💡 Modifie le % à tout moment : la part se recalcule (CA généré × %). Ex : 10 000 € × 8% = 800 €.</div>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div className="card p-6 w-[480px] max-w-[92vw]">
            <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-extrabold">Inviter un membre</h2><button onClick={() => setOpen(false)} className="w-[30px] h-[30px] rounded-lg bg-panel2 text-muted">✕</button></div>
            <label className="text-xs text-muted font-semibold block mb-1.5">Nom</label>
            <input className="inp w-full px-3 py-2.5 mb-3" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Prénom Nom" />
            <label className="text-xs text-muted font-semibold block mb-1.5">Email</label>
            <input className="inp w-full px-3 py-2.5 mb-3" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="chatteur@email.com" />
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div><label className="text-xs text-muted font-semibold block mb-1.5">Rôle</label><select className="inp w-full px-3 py-2.5" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}><option>CHATTER</option><option>ADMIN</option></select></div>
              <div><label className="text-xs text-muted font-semibold block mb-1.5">Commission %</label><input type="number" className="inp w-full px-3 py-2.5" value={form.pct} onChange={(e) => setForm({ ...form, pct: parseInt(e.target.value) || 0 })} /></div>
            </div>
            <button onClick={() => { addMember({ name: form.name || "Nouveau chatteur", email: form.email || "—", role: form.role, pct: form.pct }); setOpen(false); }} className="btn w-full py-2.5 font-bold">Ajouter le membre</button>
          </div>
        </div>
      )}
    </div>
  );
}
