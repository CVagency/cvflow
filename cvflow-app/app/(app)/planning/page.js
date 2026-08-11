"use client";
import { useStore } from "@/lib/store";
import { eur } from "@/lib/ui";
import Kpi from "@/components/Kpi";

export default function Planning() {
  const { team } = useStore();
  const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  const today = new Date();
  const monday = new Date(today); monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  const nums = days.map((_, i) => { const d = new Date(monday); d.setDate(monday.getDate() + i); return d.getDate(); });
  const totalHours = team.reduce((a, r) => a + (r.hours || 0), 0);

  return (
    <div className="p-6">
      <div className="flex items-center mb-4"><div className="text-xl font-extrabold">Planning de la semaine</div><div className="flex-1" /><button className="btn px-4 py-2.5 font-bold" onClick={() => alert("Création de shift — bientôt reliée à la base.")}>＋ Nouveau shift</button></div>
      <div className="grid grid-cols-7 gap-2.5 mb-5">
        {days.map((d, i) => (
          <div key={d} className={`card min-h-[160px] p-3 flex flex-col ${nums[i] === today.getDate() ? "border-acc" : ""}`}>
            <div className="flex justify-between text-[12px] text-muted font-semibold mb-2.5 uppercase"><span>{d}</span><span>{nums[i]}</span></div>
            <div className="mt-auto text-[11.5px] text-muted2 border border-dashed border-line2 rounded-lg py-1.5 text-center cursor-pointer hover:text-acc hover:border-acc" onClick={() => alert("Ajouter un shift — bientôt.")}>＋</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <Kpi label="Heures totales" value={totalHours + " h"} sub="cette semaine" />
        <Kpi label="Membres" value={team.length} />
        <Kpi label="CA équipe" value={eur(team.reduce((a, r) => a + r.ca, 0))} />
      </div>
      <div className="card p-[18px]">
        <h3 className="text-[13px] font-semibold text-muted mb-3.5">Récap par chatteur</h3>
        {team.length === 0 ? <div className="text-muted2 text-[13px] py-6 text-center">Aucun membre.</div> : (
          <table className="w-full">
            <thead><tr className="text-left text-[11px] uppercase tracking-wide text-muted2">{["Chatteur", "Heures", "Ventes", "CA généré", "%", "Sa part"].map((h, i) => <th key={h} className={`py-2.5 px-3.5 border-b border-line font-semibold ${i === 5 ? "text-right" : ""}`}>{h}</th>)}</tr></thead>
            <tbody>
              {team.map((r) => (
                <tr key={r.id} className="hover:bg-panel2">
                  <td className="py-3 px-3.5 border-b border-line"><div className="flex items-center gap-2.5"><div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white" style={{ background: r.color }}>{r.name[0]}</div>{r.name}</div></td>
                  <td className="py-3 px-3.5 border-b border-line">{r.hours || 0} h</td><td className="py-3 px-3.5 border-b border-line">{r.sales}</td>
                  <td className="py-3 px-3.5 border-b border-line text-acc font-bold">{eur(r.ca)}</td>
                  <td className="py-3 px-3.5 border-b border-line">{r.pct}%</td>
                  <td className="py-3 px-3.5 border-b border-line text-right text-acc font-bold">{r.pct ? eur(Math.round((r.ca * r.pct) / 100)) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
