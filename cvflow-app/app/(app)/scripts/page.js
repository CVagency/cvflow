"use client";
import { useStore } from "@/lib/store";

export default function Scripts() {
  const { models, scripts, activeModel, setActiveModel } = useStore();
  const list = scripts[activeModel] || [];
  return (
    <div className="p-6">
      <div className="flex items-center mb-4">
        <div>
          <div className="text-xl font-extrabold">Scripts</div>
          <div className="text-[13px] text-muted mt-1">Modèle : <select value={activeModel} onChange={(e) => setActiveModel(e.target.value)} className="bg-panel border border-line rounded-md text-txt px-2 py-1 outline-none">{models.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select> · {list.length} scripts · accès chatteur via <b className="text-tg">/</b></div>
        </div>
        <div className="flex-1" /><button className="btn px-4 py-2.5 font-bold">＋ Nouveau script</button>
      </div>
      {list.map((s, i) => (
        <div key={i} className="card p-4 mb-3">
          <div className="flex items-center gap-2.5 mb-2.5"><span className="w-[22px] h-[22px] rounded-md bg-panel2 flex items-center justify-center text-[11px] text-muted">{i + 1}</span><span className="font-mono text-[12px] bg-tg/15 text-tg px-2 py-0.5 rounded font-semibold">{s[0]}</span><span className="font-semibold">{s[1]}</span></div>
          <div className="bg-bg2 border border-line rounded-lg px-3.5 py-2.5 text-[13px]">{s[2]}</div>
        </div>
      ))}
    </div>
  );
}
