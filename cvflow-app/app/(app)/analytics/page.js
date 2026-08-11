"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { eur } from "@/lib/ui";
import Kpi from "@/components/Kpi";

const DAYS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

export default function Analytics() {
  const { models, convs, salesLog, activeModel, setActiveModel } = useStore();
  const [tab, setTab] = useState("overview");

  if (!models.length) return <div className="p-6"><div className="h-[60vh] flex flex-col items-center justify-center text-center gap-2"><div className="text-4xl opacity-40">📈</div><div className="font-bold text-lg">Pas encore de données</div><div className="text-muted text-sm">Les analytics s'afficheront dès tes premières ventes.</div></div></div>;

  const current = activeModel || models[0].id;
  const totalCA = salesLog.reduce((a, s) => a + s.price, 0);
  const caByModel = (id) => salesLog.filter((s) => s.model === id).reduce((a, s) => a + s.price, 0);

  const now = new Date();
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const today0 = startOfDay(now);
  const week = [];
  for (let i = 6; i >= 0; i--) {
    const d0 = today0 - i * 864e5;
    week.push({ label: DAYS[new Date(d0).getDay()], sum: salesLog.filter((s) => s.date && startOfDay(new Date(s.date)) === d0).reduce((a, x) => a + x.price, 0) });
  }
  const max = Math.max(1, ...week.map((w) => w.sum));

  return (
    <div className="p-6">
      <div className="flex items-center mb-4">
        <div className="flex gap-1 bg-panel border border-line rounded-[10px] p-1">
          {[["overview", "Vue agence"], ["models", "Modèles"], ["fans", "Fans"]].map((t) => <button key={t[0]} onClick={() => setTab(t[0])} className={`px-3.5 py-1.5 rounded-md text-[13px] font-semibold ${tab === t[0] ? "bg-acc/15 text-acc" : "text-muted"}`}>{t[1]}</button>)}
        </div>
        <div className="flex-1" />
      </div>

      {tab === "overview" && <>
        <div className="grid grid-cols-4 gap-4 mb-4">
          <Kpi label="Revenu total" value={eur(totalCA)} sub={totalCA ? "ventes réelles" : "aucune vente"} up={totalCA > 0} />
          <Kpi label="Ventes" value={salesLog.length} sub="PPV déverrouillés" />
          <Kpi label="Fans" value={convs.length} />
          <Kpi label="Modèles" value={models.length} />
        </div>
        <div className="card p-[18px]">
          <h3 className="text-[13px] font-semibold text-muted mb-3.5">Revenu · 7 derniers jours</h3>
          {totalCA === 0 ? <div className="h-40 flex items-center justify-center text-muted2 text-[13px]">Aucune vente — les courbes se rempliront ensuite.</div> : (
            <div className="flex items-end gap-1.5 h-40">
              {week.map((w, i) => <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-1.5"><div className="w-full max-w-[26px] rounded-t" style={{ height: (w.sum / max) * 100 + "%", background: "linear-gradient(180deg,#22c55e,#16a34a)" }} /><div className="text-[10px] text-muted2">{w.label}</div></div>)}
            </div>
          )}
        </div>
      </>}

      {tab === "models" && (
        <div className="card p-[18px]"><h3 className="text-[13px] font-semibold text-muted mb-3.5">Performance par modèle</h3>
          <table className="w-full"><thead><tr className="text-left text-[11px] uppercase tracking-wide text-muted2">{["Modèle", "Fans", "Ventes", "CA"].map((h, i) => <th key={h} className={`py-2.5 px-3.5 border-b border-line font-semibold ${i === 3 ? "text-right" : ""}`}>{h}</th>)}</tr></thead>
            <tbody>{models.map((x) => <tr key={x.id} className="hover:bg-panel2"><td className="py-3 px-3.5 border-b border-line font-semibold">{x.name}</td><td className="py-3 px-3.5 border-b border-line">{convs.filter((c) => c.model_id === x.id).length}</td><td className="py-3 px-3.5 border-b border-line">{salesLog.filter((s) => s.model === x.id).length}</td><td className="py-3 px-3.5 border-b border-line text-right text-acc font-bold">{eur(caByModel(x.id))}</td></tr>)}</tbody>
          </table></div>
      )}
      {tab === "fans" && (
        <div className="card p-[18px]"><h3 className="text-[13px] font-semibold text-muted mb-3.5">Top fans</h3>
          {convs.filter((c) => c.spent > 0).length === 0 ? <div className="text-muted2 text-[13px] py-6 text-center">Aucun achat pour l'instant.</div> : (
            <table className="w-full"><thead><tr className="text-left text-[11px] uppercase tracking-wide text-muted2">{["Fan", "Tag", "Dépensé"].map((h, i) => <th key={h} className={`py-2.5 px-3.5 border-b border-line font-semibold ${i === 2 ? "text-right" : ""}`}>{h}</th>)}</tr></thead>
              <tbody>{convs.filter((c) => c.spent > 0).sort((a, b) => b.spent - a.spent).slice(0, 10).map((c) => <tr key={c.id} className="hover:bg-panel2"><td className="py-3 px-3.5 border-b border-line font-semibold">{c.name}</td><td className="py-3 px-3.5 border-b border-line">{c.tag.toUpperCase()}</td><td className="py-3 px-3.5 border-b border-line text-right text-acc font-bold">{eur(c.spent)}</td></tr>)}</tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
