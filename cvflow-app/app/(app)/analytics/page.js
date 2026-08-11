"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { eur, initials } from "@/lib/ui";

const DAYNAMES = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

export default function Analytics() {
  const { models, convs, salesLog } = useStore();
  const [tab, setTab] = useState("overview");
  const [days, setDays] = useState(7);

  if (!models.length) {
    return <div className="p-6"><div className="h-[60vh] flex flex-col items-center justify-center text-center gap-2"><div className="text-4xl opacity-40">📈</div><div className="font-bold text-lg">Pas encore de données</div><div className="text-muted text-sm">Les analytics s'afficheront dès tes premières ventes.</div></div></div>;
  }

  const now = new Date();
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const today0 = startOfDay(now);
  const since = today0 - (days - 1) * 864e5;

  const periodSales = salesLog.filter((s) => s.date && startOfDay(new Date(s.date)) >= since);
  const totalCA = periodSales.reduce((a, s) => a + s.price, 0);
  const nSales = periodSales.length;
  const avg = nSales ? Math.round(totalCA / nSales) : 0;
  const caByModel = (id) => periodSales.filter((s) => s.model === id).reduce((a, s) => a + s.price, 0);

  const series = [];
  for (let i = days - 1; i >= 0; i--) {
    const d0 = today0 - i * 864e5;
    series.push({ d: new Date(d0), sum: salesLog.filter((s) => s.date && startOfDay(new Date(s.date)) === d0).reduce((a, x) => a + x.price, 0) });
  }
  const max = Math.max(1, ...series.map((s) => s.sum));

  // best day
  const best = series.reduce((a, b) => (b.sum > a.sum ? b : a), series[0]);

  const modelRows = models.map((m) => ({ m, ca: caByModel(m.id), fans: convs.filter((c) => c.model_id === m.id).length, sales: periodSales.filter((s) => s.model === m.id).length })).sort((a, b) => b.ca - a.ca);
  const maxModelCA = Math.max(1, ...modelRows.map((r) => r.ca));

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="flex gap-1 bg-panel border border-line rounded-[10px] p-1">
          {[["overview", "Vue agence"], ["models", "Modèles"], ["fans", "Fans"]].map((t) => <button key={t[0]} onClick={() => setTab(t[0])} className={`px-3.5 py-1.5 rounded-md text-[13px] font-semibold transition ${tab === t[0] ? "bg-acc/15 text-acc" : "text-muted hover:text-txt"}`}>{t[1]}</button>)}
        </div>
        <div className="flex-1" />
        <div className="flex gap-1 bg-panel border border-line rounded-[10px] p-1">
          {[[7, "7 jours"], [30, "30 jours"]].map((p) => <button key={p[0]} onClick={() => setDays(p[0])} className={`px-3 py-1.5 rounded-md text-[12.5px] font-semibold ${days === p[0] ? "bg-acc/15 text-acc" : "text-muted"}`}>{p[1]}</button>)}
        </div>
      </div>

      {tab === "overview" && <>
        <div className="grid grid-cols-4 gap-4 mb-4 max-lg:grid-cols-2">
          <Stat label="Revenu" value={eur(totalCA)} accent hint={totalCA ? `sur ${days} jours` : "aucune vente"} />
          <Stat label="Ventes" value={nSales} hint="PPV déverrouillés" />
          <Stat label="Panier moyen" value={avg ? eur(avg) : "—"} hint="par vente" />
          <Stat label="Fans actifs" value={convs.length} hint={models.length + " modèle" + (models.length > 1 ? "s" : "")} />
        </div>

        <div className="card p-5 mb-4">
          <div className="flex items-center justify-between mb-1"><h3 className="text-[13px] font-semibold text-muted">Revenu · {days} derniers jours</h3>{totalCA > 0 && <div className="text-[12px] text-muted2">Meilleur jour : <b className="text-txt">{eur(best.sum)}</b></div>}</div>
        {totalCA === 0 ? (
          <div className="h-48 flex items-center justify-center text-muted2 text-[13px]">Aucune vente sur la période — le graphe se remplira automatiquement.</div>
        ) : <AreaChart series={series} max={max} />}
        </div>

        {totalCA > 0 && modelRows.filter((r) => r.ca > 0).length > 0 && (
          <div className="card p-[18px] mb-4">
            <h3 className="text-[13px] font-semibold text-muted mb-4">Répartition du revenu par modèle</h3>
            <Donut data={modelRows.filter((r) => r.ca > 0).slice(0, 6).map((r) => ({ label: r.m.name, value: r.ca, color: r.m.color }))} />
          </div>
        )}

        <div className="card p-[18px]">
          <h3 className="text-[13px] font-semibold text-muted mb-3.5">Classement des modèles</h3>
          {totalCA === 0 ? <div className="text-muted2 text-[13px] py-6 text-center">Pas encore de ventes à classer.</div> : (
            <div className="flex flex-col gap-3">
              {modelRows.map((r) => (
                <div key={r.m.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-[12px] shrink-0" style={{ background: `linear-gradient(135deg,${r.m.color},${r.m.c2 || "#0d9488"})` }}>{r.m.name[0]}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-[12.5px] mb-1"><span className="font-semibold truncate">{r.m.name}</span><span className="text-acc font-bold">{eur(r.ca)}</span></div>
                    <div className="h-2 rounded-full bg-bg2 overflow-hidden"><div className="h-full rounded-full" style={{ width: (r.ca / maxModelCA) * 100 + "%", background: "linear-gradient(90deg,#22c55e,#16a34a)" }} /></div>
                  </div>
                  <div className="text-[11px] text-muted2 w-16 text-right shrink-0">{r.sales} vente{r.sales > 1 ? "s" : ""}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </>}

      {tab === "models" && (
        <div className="card p-[18px]"><h3 className="text-[13px] font-semibold text-muted mb-3.5">Performance par modèle · {days} j</h3>
          <table className="w-full"><thead><tr className="text-left text-[11px] uppercase tracking-wide text-muted2">{["Modèle", "Fans", "Ventes", "Panier moy.", "CA"].map((h, i) => <th key={h} className={`py-2.5 px-3.5 border-b border-line font-semibold ${i === 4 ? "text-right" : ""}`}>{h}</th>)}</tr></thead>
            <tbody>{modelRows.map((r) => <tr key={r.m.id} className="hover:bg-panel2"><td className="py-3 px-3.5 border-b border-line"><div className="flex items-center gap-2.5"><div className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-[11px]" style={{ background: `linear-gradient(135deg,${r.m.color},${r.m.c2 || "#0d9488"})` }}>{r.m.name[0]}</div><span className="font-semibold">{r.m.name}</span></div></td><td className="py-3 px-3.5 border-b border-line">{r.fans}</td><td className="py-3 px-3.5 border-b border-line">{r.sales}</td><td className="py-3 px-3.5 border-b border-line">{r.sales ? eur(Math.round(r.ca / r.sales)) : "—"}</td><td className="py-3 px-3.5 border-b border-line text-right text-acc font-bold">{eur(r.ca)}</td></tr>)}</tbody>
          </table></div>
      )}

      {tab === "fans" && (
        <div className="card p-[18px]"><h3 className="text-[13px] font-semibold text-muted mb-3.5">Top fans</h3>
          {convs.filter((c) => c.spent > 0).length === 0 ? <div className="text-muted2 text-[13px] py-6 text-center">Aucun achat pour l'instant.</div> : (
            <table className="w-full"><thead><tr className="text-left text-[11px] uppercase tracking-wide text-muted2">{["Fan", "Modèle", "Tag", "Dépensé"].map((h, i) => <th key={h} className={`py-2.5 px-3.5 border-b border-line font-semibold ${i === 3 ? "text-right" : ""}`}>{h}</th>)}</tr></thead>
              <tbody>{convs.filter((c) => c.spent > 0).sort((a, b) => b.spent - a.spent).slice(0, 10).map((c) => <tr key={c.id} className="hover:bg-panel2"><td className="py-3 px-3.5 border-b border-line"><div className="flex items-center gap-2.5"><div className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-[11px]" style={{ background: c.color }}>{initials(c.name)}</div><span className="font-semibold">{c.name}</span></div></td><td className="py-3 px-3.5 border-b border-line text-muted">{models.find((m) => m.id === c.model_id)?.name || "—"}</td><td className="py-3 px-3.5 border-b border-line">{c.tag.toUpperCase()}</td><td className="py-3 px-3.5 border-b border-line text-right text-acc font-bold">{eur(c.spent)}</td></tr>)}</tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, hint, accent }) {
  return (
    <div className="card p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: accent ? "linear-gradient(90deg,#22c55e,#16a34a)" : "#1f2a26" }} />
      <div className="text-[11px] uppercase tracking-wide text-muted2 font-semibold">{label}</div>
      <div className={`text-[27px] font-extrabold mt-1.5 ${accent ? "text-acc" : ""}`}>{value}</div>
      {hint && <div className="text-[11.5px] text-muted mt-0.5">{hint}</div>}
    </div>
  );
}

function Donut({ data }) {
  const total = data.reduce((a, d) => a + d.value, 0) || 1;
  const R = 52, C = 2 * Math.PI * R;
  let off = 0;
  return (
    <div className="flex items-center gap-6 flex-wrap">
      <svg width="132" height="132" viewBox="0 0 132 132" className="shrink-0">
        <g transform="translate(66,66) rotate(-90)">
          <circle r={R} fill="none" stroke="#1f2a26" strokeWidth="15" />
          {data.map((d, i) => { const len = C * (d.value / total); const el = <circle key={i} r={R} fill="none" stroke={d.color} strokeWidth="15" strokeLinecap="round" strokeDasharray={`${Math.max(0, len - 2)} ${C - Math.max(0, len - 2)}`} strokeDashoffset={-off} />; off += len; return el; })}
        </g>
      </svg>
      <div className="flex flex-col gap-2 min-w-[160px] flex-1">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2 text-[12.5px]"><span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} /><span className="text-muted truncate">{d.label}</span><span className="font-bold ml-auto text-txt">{Math.round((d.value / total) * 100)}%</span></div>
        ))}
      </div>
    </div>
  );
}

function AreaChart({ series, max }) {
  const W = 720, H = 180, pad = 8;
  const n = series.length;
  const x = (i) => pad + (i * (W - pad * 2)) / Math.max(1, n - 1);
  const y = (v) => H - pad - (v / max) * (H - pad * 2);
  const line = series.map((s, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(s.sum).toFixed(1)}`).join(" ");
  const area = `${line} L${x(n - 1).toFixed(1)},${H - pad} L${x(0).toFixed(1)},${H - pad} Z`;
  const grid = [0.25, 0.5, 0.75, 1].map((f) => H - pad - f * (H - pad * 2));
  return (
    <div className="w-full overflow-hidden">
      <svg viewBox={`0 0 ${W} ${H + 22}`} className="w-full" preserveAspectRatio="none" style={{ maxHeight: 210 }}>
        <defs><linearGradient id="areaG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22c55e" stopOpacity="0.35" /><stop offset="100%" stopColor="#22c55e" stopOpacity="0" /></linearGradient></defs>
        {grid.map((gy, i) => <line key={i} x1={pad} y1={gy} x2={W - pad} y2={gy} stroke="#1f2a26" strokeWidth="1" />)}
        <path d={area} fill="url(#areaG)" />
        <path d={line} fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {series.map((s, i) => <circle key={i} cx={x(i)} cy={y(s.sum)} r="3" fill="#0a0d0c" stroke="#22c55e" strokeWidth="2" />)}
        {series.map((s, i) => (n <= 10 || i % Math.ceil(n / 10) === 0) ? <text key={"t" + i} x={x(i)} y={H + 14} fill="#5f6b66" fontSize="10" textAnchor="middle">{DAYNAMES[s.d.getDay()]}{n > 7 ? " " + s.d.getDate() : ""}</text> : null)}
      </svg>
    </div>
  );
}
