"use client";
import { useStore } from "@/lib/store";
import { initials, eur } from "@/lib/ui";
import Kpi from "@/components/Kpi";

const DAYS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

export default function Dashboard() {
  const { models, team, salesLog, convs } = useStore();
  const now = new Date();
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const today0 = startOfDay(now);

  const last30 = salesLog.filter((s) => s.date && new Date(s.date).getTime() >= today0 - 30 * 864e5);
  const ca30 = last30.reduce((a, s) => a + s.price, 0);
  const salesToday = salesLog.filter((s) => s.date && new Date(s.date).getTime() >= today0);
  const caToday = salesToday.reduce((a, s) => a + s.price, 0);

  // 7 derniers jours réels
  const week = [];
  for (let i = 6; i >= 0; i--) {
    const d0 = today0 - i * 864e5;
    const sum = salesLog.filter((s) => s.date && startOfDay(new Date(s.date)) === d0).reduce((a, s) => a + s.price, 0);
    week.push({ label: DAYS[new Date(d0).getDay()], sum });
  }
  const max = Math.max(1, ...week.map((w) => w.sum));

  return (
    <div className="p-6">
      <div className="text-xl font-extrabold mb-5">Aperçu agence</div>
      <div className="grid grid-cols-4 gap-4 mb-4">
        <Kpi label="CA 30 jours" value={eur(ca30)} sub={ca30 ? "sur les ventes réelles" : "aucune vente pour l'instant"} up={ca30 > 0} />
        <Kpi label="Ventes aujourd'hui" value={salesToday.length} sub={eur(caToday) + " encaissés"} up={salesToday.length > 0} />
        <Kpi label="Fans" value={convs.length} sub={convs.length ? "dans le CRM" : "ajoute tes fans"} />
        <Kpi label="Modèles" value={models.length} sub={models.length ? "connectés" : "connecte un compte"} />
      </div>
      <div className="grid grid-cols-[2fr_1fr] gap-4 mb-4">
        <div className="card p-[18px]">
          <h3 className="text-[13px] font-semibold text-muted mb-3.5">CA · 7 derniers jours</h3>
          {ca30 === 0 ? (
            <div className="h-40 flex items-center justify-center text-muted2 text-[13px]">Aucune vente encore — le graphe se remplira avec tes premières ventes.</div>
          ) : (
            <div className="flex items-end gap-1.5 h-40">
              {week.map((w, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <div className="w-full max-w-[26px] rounded-t" style={{ height: (w.sum / max) * 100 + "%", background: "linear-gradient(180deg,#22c55e,#16a34a)" }} />
                  <div className="text-[10px] text-muted2">{w.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="card p-[18px]">
          <h3 className="text-[13px] font-semibold text-muted mb-3.5">Chatteurs en ligne</h3>
          {team.filter((e) => e.online).length === 0 ? (
            <div className="text-muted2 text-[12.5px] py-6 text-center">Personne en ligne pour l'instant.</div>
          ) : team.filter((e) => e.online).map((e) => (
            <div key={e.id} className="flex items-center gap-2.5 py-2.5 border-b border-line">
              <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-[13px] text-white" style={{ background: e.color }}>{initials(e.name)}</div>
              <div className="flex-1"><div className="font-semibold text-[13px]">{e.name}</div><div className="text-[11.5px] text-muted">{e.role === "ADMIN" ? "Admin" : "Chatteur"}</div></div>
            </div>
          ))}
        </div>
      </div>
      <div className="card p-[18px]">
        <h3 className="text-[13px] font-semibold text-muted mb-3.5">Performance de l'équipe · CA × commission</h3>
        <table className="w-full">
          <thead><tr className="text-left text-[11px] uppercase tracking-wide text-muted2">
            {["Membre", "Ventes", "CA généré", "%", "Sa part"].map((h, i) => <th key={h} className={`py-2.5 px-3.5 border-b border-line font-semibold ${i === 4 ? "text-right" : ""}`}>{h}</th>)}
          </tr></thead>
          <tbody>
            {team.map((e) => {
              const part = Math.round((e.ca * e.pct) / 100);
              return (
                <tr key={e.id} className="hover:bg-panel2">
                  <td className="py-3 px-3.5 border-b border-line"><div className="flex items-center gap-2.5"><div className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-[11px] font-bold text-white" style={{ background: e.color }}>{initials(e.name)}</div><div><div className="font-semibold">{e.name}</div><div className="text-[11px] text-muted">{e.role}</div></div></div></td>
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
