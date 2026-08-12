"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { eur, initials } from "@/lib/ui";
import Kpi from "@/components/Kpi";

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const hhmm = (min) => String(Math.floor(min / 60)).padStart(2, "0") + ":" + String(min % 60).padStart(2, "0");
const toMin = (str) => { const [h, m] = String(str).split(":").map(Number); return (h || 0) * 60 + (m || 0); };
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export default function Planning() {
  const { team, models, shifts, addShift, removeShift, profile, currentUser } = useStore();
  const isAdmin = profile?.role === "ADMIN";
  // Un chatteur ne voit QUE son propre planning et SA propre rémunération (jamais celle des autres)
  const visShifts = isAdmin ? shifts : shifts.filter((s) => s.member_id === currentUser);
  const visTeam = isAdmin ? team : team.filter((t) => t.id === currentUser);

  const [weekOffset, setWeekOffset] = useState(0);
  const [modal, setModal] = useState(null); // {dateStr}
  const [form, setForm] = useState({ member_id: "", model_id: "", start: "09:00", end: "17:00", note: "" });

  const base = new Date();
  const monday = new Date(base);
  monday.setDate(base.getDate() - ((base.getDay() + 6) % 7) + weekOffset * 7);
  const weekDates = DAYS.map((_, i) => { const d = new Date(monday); d.setDate(monday.getDate() + i); return d; });
  const weekIso = weekDates.map(iso);
  const todayIso = iso(new Date());

  const weekShifts = visShifts.filter((s) => weekIso.includes(s.day));
  const shiftsFor = (dateStr) => weekShifts.filter((s) => s.day === dateStr).sort((a, b) => a.start_min - b.start_min);
  const memberName = (id) => team.find((t) => t.id === id)?.name || "—";
  const memberColor = (id) => team.find((t) => t.id === id)?.color || "#0d9488";
  const hoursOf = (id) => weekShifts.filter((s) => s.member_id === id).reduce((a, s) => a + (s.end_min - s.start_min) / 60, 0);
  const totalHours = weekShifts.reduce((a, s) => a + (s.end_min - s.start_min) / 60, 0);

  function openAdd(dateStr) {
    setForm({ member_id: team[0]?.id || "", model_id: "", start: "09:00", end: "17:00", note: "" });
    setModal({ dateStr });
  }
  async function save() {
    if (!form.member_id) return;
    await addShift({ member_id: form.member_id, model_id: form.model_id, day: modal.dateStr, start_min: toMin(form.start), end_min: toMin(form.end), note: form.note });
    setModal(null);
  }

  const label = weekOffset === 0 ? "Cette semaine" : weekOffset === 1 ? "Semaine prochaine" : weekOffset === -1 ? "Semaine dernière" : `${iso(weekDates[0])} → ${iso(weekDates[6])}`;

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="text-xl font-extrabold">Planning</div>
        <div className="flex items-center gap-1 bg-panel border border-line rounded-[10px] p-1">
          <button onClick={() => setWeekOffset((w) => w - 1)} className="w-7 h-7 rounded-md text-muted hover:text-txt hover:bg-panel2">‹</button>
          <span className="text-[12.5px] font-semibold px-2 min-w-[130px] text-center">{label}</span>
          <button onClick={() => setWeekOffset((w) => w + 1)} className="w-7 h-7 rounded-md text-muted hover:text-txt hover:bg-panel2">›</button>
        </div>
        {weekOffset !== 0 && <button onClick={() => setWeekOffset(0)} className="text-[12px] text-acc font-semibold">Aujourd'hui</button>}
      </div>

      {team.length === 0 ? (
        <div className="card p-10 text-center text-muted2 text-[13px]">Aucun membre dans l'agence. Ajoute des chatteurs dans l'onglet Employés pour planifier leurs créneaux.</div>
      ) : (
        <>
          <div className="grid grid-cols-7 gap-2.5 mb-5 max-lg:grid-cols-4 max-sm:grid-cols-2">
            {DAYS.map((d, i) => {
              const dateStr = weekIso[i];
              const isToday = dateStr === todayIso;
              const list = shiftsFor(dateStr);
              return (
                <div key={d} className={`card min-h-[170px] p-2.5 flex flex-col ${isToday ? "border-acc" : ""}`}>
                  <div className="flex justify-between text-[12px] font-semibold mb-2 uppercase"><span className={isToday ? "text-acc" : "text-muted"}>{d}</span><span className="text-muted2">{weekDates[i].getDate()}</span></div>
                  <div className="flex flex-col gap-1.5 flex-1">
                    {list.map((s) => (
                      <div key={s.id} className="group rounded-lg bg-panel2 border border-line px-2 py-1.5 relative">
                        <div className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0" style={{ background: memberColor(s.member_id) }}>{initials(memberName(s.member_id))}</span>
                          <span className="text-[11.5px] font-semibold truncate">{memberName(s.member_id).split(" ")[0]}</span>
                        </div>
                        <div className="text-[10.5px] text-muted mt-0.5">{hhmm(s.start_min)}–{hhmm(s.end_min)}{s.model_id ? " · " + (models.find((m) => m.id === s.model_id)?.name || "") : ""}</div>
                        {isAdmin && <button onClick={() => removeShift(s.id)} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-muted2 hover:text-danger text-[11px]">✕</button>}
                      </div>
                    ))}
                    {isAdmin && <button onClick={() => openAdd(dateStr)} className="mt-auto text-[11.5px] text-muted2 border border-dashed border-line2 rounded-lg py-1.5 text-center hover:text-acc hover:border-acc">＋</button>}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4 max-sm:grid-cols-1">
            <Kpi label="Heures planifiées" value={(Math.round(totalHours * 10) / 10) + " h"} sub={label.toLowerCase()} />
            <Kpi label="Créneaux" value={weekShifts.length} />
            <Kpi label={isAdmin ? "Membres planifiés" : "Mes créneaux"} value={isAdmin ? new Set(weekShifts.map((s) => s.member_id)).size + "/" + team.length : weekShifts.length} />
          </div>

          <div className="card p-[18px]">
            <h3 className="text-[13px] font-semibold text-muted mb-3.5">{isAdmin ? "Récap par chatteur" : "Ma rémunération"}</h3>
            <table className="w-full">
              <thead><tr className="text-left text-[11px] uppercase tracking-wide text-muted2">{["Chatteur", "Heures", "Ventes", "CA généré", "%", "Sa part"].map((h, i) => <th key={h} className={`py-2.5 px-3.5 border-b border-line font-semibold ${i === 5 ? "text-right" : ""}`}>{h}</th>)}</tr></thead>
              <tbody>
                {visTeam.map((r) => {
                  const h = Math.round(hoursOf(r.id) * 10) / 10;
                  return (
                    <tr key={r.id} className="hover:bg-panel2">
                      <td className="py-3 px-3.5 border-b border-line"><div className="flex items-center gap-2.5"><div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white" style={{ background: r.color }}>{initials(r.name)}</div>{r.name}</div></td>
                      <td className="py-3 px-3.5 border-b border-line">{h} h</td>
                      <td className="py-3 px-3.5 border-b border-line">{r.sales}</td>
                      <td className="py-3 px-3.5 border-b border-line text-acc font-bold">{eur(r.ca)}</td>
                      <td className="py-3 px-3.5 border-b border-line">{r.pct}%</td>
                      <td className="py-3 px-3.5 border-b border-line text-right text-acc font-bold">{r.pct ? eur(Math.round((r.ca * r.pct) / 100)) : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={(e) => { if (e.target === e.currentTarget) setModal(null); }}>
          <div className="card p-6 w-[440px] max-w-[92vw]">
            <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-extrabold">Nouveau créneau</h2><button onClick={() => setModal(null)} className="w-[30px] h-[30px] rounded-lg bg-panel2 text-muted">✕</button></div>
            <label className="text-xs text-muted font-semibold block mb-1.5">Chatteur</label>
            <select className="inp w-full px-3 py-2.5 mb-3" value={form.member_id} onChange={(e) => setForm({ ...form, member_id: e.target.value })}>{team.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
            <label className="text-xs text-muted font-semibold block mb-1.5">Modèle (optionnel)</label>
            <select className="inp w-full px-3 py-2.5 mb-3" value={form.model_id} onChange={(e) => setForm({ ...form, model_id: e.target.value })}><option value="">— Aucun —</option>{models.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div><label className="text-xs text-muted font-semibold block mb-1.5">Début</label><input type="time" className="inp w-full px-3 py-2.5" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} /></div>
              <div><label className="text-xs text-muted font-semibold block mb-1.5">Fin</label><input type="time" className="inp w-full px-3 py-2.5" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} /></div>
            </div>
            <button onClick={save} className="btn w-full py-2.5 font-bold">Ajouter le créneau</button>
          </div>
        </div>
      )}
    </div>
  );
}
