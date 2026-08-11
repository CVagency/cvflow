"use client";
import { useStore } from "@/lib/store";

// Sélecteur de modèle réutilisable et soigné (avatars + compteur de fans).
export default function ModelSwitcher({ onChange, showCount = true }) {
  const { models, activeModel, setActiveModel, convs } = useStore();
  if (!models.length) return null;

  function pick(id) {
    setActiveModel(id);
    onChange && onChange(id);
  }

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
      {models.map((m) => {
        const active = activeModel === m.id;
        const fans = convs.filter((c) => c.model_id === m.id).length;
        return (
          <button
            key={m.id}
            onClick={() => pick(m.id)}
            className={`group flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full border shrink-0 transition ${active ? "border-acc/60 bg-acc/10 shadow-[0_0_0_1px_rgba(34,197,94,.15)]" : "border-line bg-panel hover:border-line2"}`}
          >
            <span
              className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-extrabold text-white shadow-sm"
              style={{ background: `linear-gradient(135deg,${m.color || "#16a34a"},${m.c2 || "#0d9488"})` }}
            >
              {(m.name[0] || "?").toUpperCase()}
            </span>
            <span className={`text-[13px] font-semibold whitespace-nowrap ${active ? "text-txt" : "text-muted"}`}>{m.name}</span>
            {showCount && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${active ? "bg-acc text-[#05130c]" : "bg-bg2 text-muted2"}`}>{fans}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
