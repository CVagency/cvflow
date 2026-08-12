"use client";
import { useState } from "react";

// Bouton « copier le lien Dropp » — mode cockpit : le chatteur colle dans Telegram.
export default function CopyLink({ text, label = "Copier le lien", className = "" }) {
  const [ok, setOk] = useState(false);
  if (!text) return <span className="text-[11px] text-muted2 italic">Pas de lien Dropp</span>;
  async function copy(e) {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setOk(true);
      setTimeout(() => setOk(false), 1300);
    } catch {
      // fallback : sélection manuelle
      window.prompt("Copie ce lien Dropp :", text);
    }
  }
  return (
    <button onClick={copy} className={className}>
      {ok ? "✓ Copié !" : label}
    </button>
  );
}
