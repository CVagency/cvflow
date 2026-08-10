"use client";
import { useStore } from "@/lib/store";
import { eur } from "@/lib/ui";
import Kpi from "@/components/Kpi";

export default function Planning() {
  const { team } = useStore();
  const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"], nums = [3, 4, 5, 6, 7, 8, 9];
  const shifts = {
    0: [["08-16", "Tiana", "Ange", "#e879a6"]], 1: [["08-16", "Mahery", "Lily", "#f59e0b"], ["16-00", "Tiana", "Lola", "#e879a6"]],
    2: [["08-16", "Tiana", "Ange", "#e879a6"]], 3: [["16-00", "Mahery", "Lily", "#f59e0b"]],
    4: [["08-16", "Tiana", "Ange", "#e879a6"], ["16-00", "Mahery", "Lola", "#f59e0b"]], 5: [["10-18", "Tiana", "Lily", "#e879a6"]], 6: [["10-18", "Corentin", "Ange", "#0d9488"]],
  };
  return (
    <div className="p-6">
      <div className="flex items-center mb-4"><div className="text-xl font-extrabold">Semaine du 3 au 9 août</div><div className="flex-1" /><button className="btn px-4 py-2.5 font-bold">＋ Nouveau shift</button></div>
      <div className="grid grid-cols-7 gap-2.5 mb-5">
        {days.map((d, i) => (
          <div key={d} className={`card min-h-[180px] p-3 flex flex-col ${i === 6 ? "border-acc" : ""}`}>
            <div className="flex justify-between text-[12px] text-muted font-semibold mb-2.5 uppercase"><span>{d}</span><span>{nums[i]}</span></div>
            {(shifts[i] || []).map((sh, j) => (
              <div key={j} className="rounded-lg px-2.5 py-1.5 mb-1.5 text-[11.5px] border" style={{ borderColor: sh[3] + "44", background: sh[3] + "18" }}>
                <div className="font-bold" style={{ color: sh[3] }}>{sh[0]}h</div><div className="font-semibold mt-0.5">{sh[1]}</div><div className="text-muted text-[10.5px]">{sh[2]}</div>
              </div>
            ))}
            <div className="mt-auto text-[11.5px] text-muted2 border border-dashed border-line2 rounded-lg py-1.5 text-center cursor-pointer hover:text-acc hover:border-acc">＋</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <Kpi label="Heures totales" value="81 h" sub="cette semaine" />
        <Kpi label="CA / heure" value="€113" sub="moyenne équipe" up />
        <Kpi label="Meilleur créneau" value="Ven 16-00" sub="107€/h" />
      </div>
      <div className="card p-[18px]">
        <h3 className="text-[13px] font-semibold text-muted mb-3.5">Récap par chatteur · qui performe</h3>
        <table className="w-full">
          <thead><tr className="text-left text-[11px] uppercase tracking-wide text-muted2">{["Chatteur", "Heures", "Ventes", "CA généré", "CA / heure", "%", "Sa part"].map((h, i) => <th key={h} className={`py-2.5 px-3.5 border-b border-line font-semibold ${i === 6 ? "text-right" : ""}`}>{h}</th>)}</tr></thead>
          <tbody>
            {team.map((r) => (
              <tr key={r.id} className="hover:bg-panel2">
                <td className="py-3 px-3.5 border-b border-line"><div className="flex items-center gap-2.5"><div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white" style={{ background: r.color }}>{r.name[0]}</div>{r.name}</div></td>
                <td className="py-3 px-3.5 border-b border-line">{r.hours} h</td><td className="py-3 px-3.5 border-b border-line">{r.sales}</td>
                <td className="py-3 px-3.5 border-b border-line text-acc font-bold">{eur(r.ca)}</td>
                <td className="py-3 px-3.5 border-b border-line">{r.hours ? eur(Math.round(r.ca / r.hours)) : "—"}</td>
                <td className="py-3 px-3.5 border-b border-line">{r.pct}%</td>
                <td className="py-3 px-3.5 border-b border-line text-right text-acc font-bold">{r.pct ? eur(Math.round((r.ca * r.pct) / 100)) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
