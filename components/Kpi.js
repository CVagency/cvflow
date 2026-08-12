export default function Kpi({ label, value, sub, up }) {
  return (
    <div className="card p-4 relative overflow-hidden">
      <div className="text-[11px] text-muted uppercase tracking-wide font-semibold">{label}</div>
      <div className="text-[25px] font-extrabold mt-2 -tracking-tight">{value}</div>
      {sub && <div className={`text-[11.5px] mt-1 ${up ? "text-acc" : "text-muted"}`}>{sub}</div>}
    </div>
  );
}
