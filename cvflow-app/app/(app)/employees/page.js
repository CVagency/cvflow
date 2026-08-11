"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { initials, eur } from "@/lib/ui";
import Kpi from "@/components/Kpi";

export default function Employees() {
  const { team, models, setPct, setRole, addMember, removeMember, profile } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "CHATTER", pct: 8 });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);
  const isAdmin = profile?.role === "ADMIN";

  async function invite() {
    setErr(""); setBusy(true);
    const error = await addMember(form);
    setBusy(false);
    if (error) { setErr(error); return; }
    setOpen(false); setForm({ name: "", email: "", password: "", role: "CHATTER", pct: 8 });
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-4"><div className="text-xl font-extrabold">Employés</div><div className="flex-1" />{isAdmin && <button onClick={() => setOpen(true)} className="btn px-4 py-2.5 font-bold">＋ Inviter un membre</button>}</div>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <Kpi label="Membres" value={team.length} sub={team.filter((t) => t.role === "ADMIN").length + " admin · " + team.filter((t) => t.role === "CHATTER").length + " chatteurs"} />
        <Kpi label="Modèles" value={models.length} />
        <Kpi label="Part chatteurs" value={eur(team.reduce((a, e) => a + Math.round((e.ca * e.pct) / 100), 0))} sub="commissions" />
      </div>
      <div className="card p-[18px]">
        <h3 className="text-[13px] font-semibold text-muted mb-3.5">Membres</h3>
        <table className="w-full">
          <thead><tr className="text-left text-[11px] uppercase tracking-wide text-muted2">{["Membre", "Rôle", "CA généré", "Commission %", "Sa part", ""].map((h, i) => <th key={i} className={`py-2.5 px-3.5 border-b border-line font-semibold ${i === 4 ? "text-right" : ""}`}>{h}</th>)}</tr></thead>
          <tbody>
            {team.map((e) => {
              const self = e.id === profile?.id;
              return (
                <tr key={e.id} className="hover:bg-panel2">
                  <td className="py-3 px-3.5 border-b border-line"><div className="flex items-center gap-2.5"><div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold text-white" style={{ background: e.color }}>{initials(e.name)}</div><div><div className="font-semibold">{e.name}{self && <span className="text-muted2 text-[11px] font-normal"> · toi</span>}</div><div className="text-[11px] text-muted">{e.email}</div></div></div></td>
                  <td className="py-3 px-3.5 border-b border-line">
                    {isAdmin && !self ? (
                      <select defaultValue={e.role} onChange={(ev) => setRole(e.id, ev.target.value)} className="inp px-2 py-1.5 text-[12px]"><option value="CHATTER">CHATTER</option><option value="ADMIN">ADMIN</option></select>
                    ) : <span className={`badge ${e.role === "ADMIN" ? "text-purple bg-purple/15" : "text-acc bg-acc/15"}`}>{e.role}</span>}
                  </td>
                  <td className="py-3 px-3.5 border-b border-line text-acc font-bold">{eur(e.ca)}</td>
                  <td className="py-3 px-3.5 border-b border-line">{isAdmin ? <div className="flex items-center gap-1.5"><input type="number" defaultValue={e.pct} onChange={(ev) => setPct(e.id, ev.target.value)} className="w-16 inp px-2 py-1.5" /><span className="text-muted">%</span></div> : <span>{e.pct}%</span>}</td>
                  <td className="py-3 px-3.5 border-b border-line text-right text-acc font-bold">{e.pct ? eur(Math.round((e.ca * e.pct) / 100)) : "—"}</td>
                  <td className="py-3 px-3.5 border-b border-line text-right">{isAdmin && !self && <button onClick={() => setConfirmDel(e)} className="w-8 h-8 rounded-lg bg-panel2 text-muted hover:text-danger" title="Supprimer">🗑</button>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="text-[12px] text-muted mt-3">💡 Change le rôle ou le % à tout moment. La part se recalcule (CA généré × %).</div>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div className="card p-6 w-[480px] max-w-[92vw]">
            <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-extrabold">Inviter un membre</h2><button onClick={() => setOpen(false)} className="w-[30px] h-[30px] rounded-lg bg-panel2 text-muted">✕</button></div>
            <label className="text-xs text-muted font-semibold block mb-1.5">Nom</label>
            <input className="inp w-full px-3 py-2.5 mb-3" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Prénom Nom" />
            <label className="text-xs text-muted font-semibold block mb-1.5">Email (nouveau, jamais utilisé sur CVFLOW)</label>
            <input className="inp w-full px-3 py-2.5 mb-3" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="chatteur@email.com" />
            <label className="text-xs text-muted font-semibold block mb-1.5">Mot de passe (le membre l'utilisera pour se connecter)</label>
            <input className="inp w-full px-3 py-2.5 mb-3" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="min. 6 caractères" />
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div><label className="text-xs text-muted font-semibold block mb-1.5">Rôle</label><select className="inp w-full px-3 py-2.5" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}><option value="CHATTER">Chatteur</option><option value="ADMIN">Admin</option></select></div>
              <div><label className="text-xs text-muted font-semibold block mb-1.5">Commission %</label><input type="number" className="inp w-full px-3 py-2.5" value={form.pct} onChange={(e) => setForm({ ...form, pct: parseInt(e.target.value) || 0 })} /></div>
            </div>
            {err && <div className="text-[12.5px] text-danger mb-3">{err}</div>}
            <button onClick={invite} disabled={busy} className="btn w-full py-2.5 font-bold disabled:opacity-50">{busy ? "…" : "Créer le compte membre"}</button>
          </div>
        </div>
      )}

      {confirmDel && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={(e) => { if (e.target === e.currentTarget) setConfirmDel(null); }}>
          <div className="card p-6 w-[440px] max-w-[92vw]">
            <div className="text-lg font-extrabold mb-2">Supprimer {confirmDel.name} ?</div>
            <div className="text-muted text-[13px] mb-5">Son compte de connexion sera supprimé définitivement.</div>
            <div className="flex gap-2.5">
              <button onClick={() => setConfirmDel(null)} className="btn-ghost flex-1 py-2.5 font-semibold">Annuler</button>
              <button onClick={async () => { const id = confirmDel.id; setConfirmDel(null); const e = await removeMember(id); if (e) alert(e); }} className="flex-1 py-2.5 font-bold rounded-[10px]" style={{ background: "#ef5f5f", color: "#fff" }}>Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
