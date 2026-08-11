"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { eur } from "@/lib/ui";
import Kpi from "@/components/Kpi";

export default function Analytics() {
  const { models, activeModel, setActiveModel } = useStore();
  const [tab, setTab] = useState("overview");
  if (!models.length) return <div className="p-6"><div className="h-[60vh] flex flex-col items-center justify-center text-center gap-2"><div className="text-4xl opacity-40">📈</div><div className="font-bold text-lg">Pas encore de données</div><div className="text-muted text-sm">Les analytics s'afficheront dès tes premières ventes.</div></div></div>;
  const current = activeModel || models[0].id;
  const m = models.find((x) => x.id === current) || models[0];
  const ca = m.ca30;
  const daily = [42, 68, 55, 90, 120, 60, 48, 75, 52, 107, 88, 64, 95, 70, 58, 82, 110, 66, 74, 90, 130, 85, 60, 78, 102, 70, 55, 88, 96, 72, 84];
  const max = Math.max(...daily);
  const mix = [["Médias Dropp", Math.round(ca * 0.62), "#22c55e"], ["Pourboires", Math.round(ca * 0.22), "#e5b769"], ["Bundles", Math.round(ca * 0.13), "#a78bfa"], ["Messages", Math.round(ca * 0.03), "#3aa0e6"]];
  const total = mix.reduce((a, x) => a + x[1], 0) || 1;
  let acc = 0;
  const segs = mix.map((x) => { const f = x[1] / total; const s = `${x[2]} ${acc * 360}deg ${(acc + f) * 360}deg`; acc += f; return s; }).join(",");

  return (
    <div className="p-6">
      <div className="flex items-center mb-4">
        <div className="flex gap-1 bg-panel border border-line rounded-[10px] p-1">
          {[["overview", "Vue agence"], ["models", "Modèles"], ["fans", "Fans"]].map((t) => <button key={t[0]} onClick={() => setTab(t[0])} className={`px-3.5 py-1.5 rounded-md text-[13px] font-semibold ${tab === t[0] ? "bg-acc/15 text-acc" : "text-muted"}`}>{t[1]}</button>)}
        </div>
        <div className="flex-1" />
        <div className="badge text-muted bg-panel border border-line px-3 py-1.5">Modèle : <select value={current} onChange={(e) => setActiveModel(e.target.value)} className="bg-transparent text-txt font-bold ml-1 outline-none cursor-pointer">{models.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></div>
      </div>

      {tab === "overview" && <>
        <div className="grid grid-cols-4 gap-4 mb-3.5">
          <Kpi label="Revenu modèle" value={eur(ca)} sub="+43% vs mois-1" up />
          <Kpi label="Volume TTC" value={eur(Math.round(ca * 1.3))} sub="+42%" up />
          <Kpi label="CA net agence" value={eur(Math.round(ca * 0.3))} sub="+43%" up />
          <Kpi label="Panier moyen" value={eur(m.ppv ? Math.round(ca / m.ppv) : 0)} sub="+9%" up />
        </div>
        <div className="grid grid-cols-[2fr_1fr] gap-4">
          <div className="card p-[18px]">
            <h3 className="text-[13px] font-semibold text-muted mb-3.5">Revenu net journalier · ce mois</h3>
            <div className="flex items-end gap-1.5 h-40">
              {daily.map((v, i) => <div key={i} className="flex-1 flex flex-col items-center justify-end h-full"><div className="w-full max-w-[22px] rounded-t" style={{ height: (v / max) * 100 + "%", background: i % 7 === 4 ? "linear-gradient(180deg,#22c55e,#16a34a)" : "linear-gradient(180deg,#3a4741,#2a3630)" }} /></div>)}
            </div>
          </div>
          <div className="card p-[18px]">
            <h3 className="text-[13px] font-semibold text-muted mb-3.5">Répartition des revenus</h3>
            <div className="flex items-center gap-5">
              <div className="w-[130px] h-[130px] rounded-full flex items-center justify-center shrink-0" style={{ background: `conic-gradient(${segs})` }}><div className="w-[82px] h-[82px] rounded-full bg-panel flex flex-col items-center justify-center"><div className="text-lg font-extrabold">{Math.round((mix[0][1] / total) * 100)}%</div><div className="text-[10px] text-muted">Médias</div></div></div>
              <div className="flex-1">{mix.map((x) => <div key={x[0]} className="flex items-center gap-2 text-[12.5px] py-1"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: x[2] }} />{x[0]}<span className="ml-auto font-bold">{eur(x[1])}</span></div>)}</div>
            </div>
          </div>
        </div>
      </>}

      {tab === "models" && (
        <div className="card p-[18px]"><h3 className="text-[13px] font-semibold text-muted mb-3.5">Performance par modèle</h3>
          <table className="w-full"><thead><tr className="text-left text-[11px] uppercase tracking-wide text-muted2">{["Modèle", "Fans", "PPV", "Conv.", "CA 30j"].map((h, i) => <th key={h} className={`py-2.5 px-3.5 border-b border-line font-semibold ${i === 4 ? "text-right" : ""}`}>{h}</th>)}</tr></thead>
            <tbody>{models.map((x) => <tr key={x.id} className="hover:bg-panel2"><td className="py-3 px-3.5 border-b border-line font-semibold">{x.name}</td><td className="py-3 px-3.5 border-b border-line">{x.fans}</td><td className="py-3 px-3.5 border-b border-line">{x.ppv}</td><td className="py-3 px-3.5 border-b border-line">{x.conv}%</td><td className="py-3 px-3.5 border-b border-line text-right text-acc font-bold">{eur(x.ca30)}</td></tr>)}</tbody>
          </table></div>
      )}
      {tab === "fans" && (
        <div className="grid grid-cols-4 gap-4"><Kpi label="Fans actifs" value="312" sub="sur 418" /><Kpi label="Panier moyen" value="36 €" sub="+4€" up /><Kpi label="Whales" value="8" sub=">1000€" /><Kpi label="Rétention" value="68%" sub="+5 pts" up /></div>
      )}
    </div>
  );
}
