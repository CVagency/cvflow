"use client";
import { useStore } from "@/lib/store";
import { initials, eur } from "@/lib/ui";
import Kpi from "@/components/Kpi";

export default function Dashboard() {
  const { models, team, salesLog } = useStore();
  const totalCA = models.reduce((a, m) => a + m.ca30, 0);
  const caToday = salesLog.reduce((a, s) => a + s.price, 0);
  const bars = [420, 560, 510, 690, 740, 880, 1020];
  const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  return (
    <div className="p-6">
      <div className="text-xl font-extrabold mb-5">Aperçu agence</div>
      <div className="grid grid-cols-4 gap-4 mb-4">
        <Kpi label="CA 30j" value={eur(totalCA)} sub="+18,4% vs mois dernier" up />
        <Kpi label="Ventes aujourd'hui" value={salesLog.length} sub={eur(caToday) + " encaissés"} up />
        <Kpi label="Nouveaux fans" value={"+" + models.reduce((a, m) => a + m.fans, 0)} sub="30 derniers jours" up />
        <Kpi label="Conversion" value="12,3%" sub="+1,8 pts" up />
      </div>
      <div className="grid grid-cols-[2fr_1fr] gap-4 mb-4">
        <div className="card p-[18px]">
          <h3 className="text-[13px] font-semibold text-muted mb-3.5">CA · 7 derniers jours</h3>
          <div className="flex items-end gap-1.5 h-40">
            {bars.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <div className="w-full max-w-[26px] rounded-t" style={{ height: (v / 1020) * 100 + "%", background: "linear-gradient(180deg,#22c55e,#16a34a)" }} />
                <div className="text-[10px] text-muted2">{days[i]}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-[18px]">
          <h3 className="text-[13px] font-semibold text-muted mb-3.5">Chatteurs en ligne</h3>
          {team.filter((e) => e.online).map((e) => (
            <div key={e.id} className="flex items-center gap-2.5 py-2.5 border-b border-line">
              <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-[13px] text-white" style={{ background: e.color }}>{initials(e.name)}</div>
              <div className="flex-1"><div className="font-semibold text-[13px]">{e.name}</div><div className="text-[11.5px] text-muted">{e.role === "ADMIN" ? "Admin" : "Chatteur"}</div></div>
              <div className="text-right"><div className="font-bold">{e.msgs}</div><div className="text-[11px] text-muted">msg</div></div>
            </div>
          ))}
        </div>
      </div>
      <div className="card p-[18px]">
        <h3 className="text-[13px] font-semibold text-muted mb-3.5">Performance de l'équipe · CA × commission</h3>
        <table className="w-full">
          <thead><tr className="text-left text-[11px] uppercase tracking-wide text-muted2">
            {["Membre", "Envoyés", "Ventes", "CA généré", "%", "Sa part"].map((h, i) => <th key={h} className={`py-2.5 px-3.5 border-b border-line font-semibold ${i === 5 ? "text-right" : ""}`}>{h}</th>)}
          </tr></thead>
          <tbody>
            {team.map((e) => {
              const part = Math.round((e.ca * e.pct) / 100);
              return (
                <tr key={e.id} className="hover:bg-panel2">
                  <td className="py-3 px-3.5 border-b border-line"><div className="flex items-center gap-2.5"><div className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-[11px] font-bold text-white" style={{ background: e.color }}>{initials(e.name)}</div><div><div className="font-semibold">{e.name}</div><div className="text-[11px] text-muted">{e.role}</div></div></div></td>
                  <td className="py-3 px-3.5 border-b border-line">{e.msgs}</td>
                  <td className="py-3 px-3.5 border-b border-line">{e.sales}</td>
                  <td className="py-3 px-3.5 border-b border-line text-acc font-bold">{eur(e.ca)}</td>
                  <td className="py-3 px-3.5 border-b border-line">{e.pct}%</td>
                  <td className="py-3 px-3.5 border-b border-line text-right text-acc font-bold">{part ? eur(part) : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
