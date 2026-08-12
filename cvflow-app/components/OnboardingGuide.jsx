"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";

// Coach de démarrage : une carte flottante en bas à droite (non bloquante) qui reste ouverte
// quand tu changes de page et qui SURLIGNE l'élément de menu concerné (clignote).
const STEPS = [
  { icon: "🚀", accent: "#22c55e", title: "Bienvenue sur CVFLOW",
    body: "Ton cockpit pour gérer le chatting Telegram de tes modèles. On te fait le tour en 1 minute — le menu de gauche se surligne à chaque étape." },
  { icon: "✈️", accent: "#3aa0e6", nav: "models", route: "/models", cta: "Ouvrir Modèles",
    title: "1. Connecte un modèle",
    body: "Onglet Modèles (surligné à gauche) → « Connecter un compte » → scanne le QR depuis le Telegram du modèle. Le statut connecté/déconnecté s'affiche en direct." },
  { icon: "🗄️", accent: "#e5b769", nav: "vault", route: "/vault", cta: "Ouvrir le Coffre",
    title: "2. Remplis le coffre média",
    body: "Range tes liens Dropp par dossier et par niveau. Colle un lien puis « Récupérer prix & infos depuis Dropp » : le prix se remplit tout seul." },
  { icon: "💬", accent: "#a78bfa", nav: "conversations", route: "/conversations", cta: "Voir les Conversations",
    title: "3. Les conversations",
    body: "Inbox Telegram : scripts en « / », réponses & likes, montant dépensé par fan, filtres VIP/Baleine/non-lus, et l'historique PPV avec taux d'achat." },
  { icon: "👥", accent: "#e879a6", nav: "employees", route: "/employees", cta: "Ouvrir Employés",
    title: "4. Invite ton équipe",
    body: "Ajoute tes chatteurs. Chacun ne voit QUE son planning, ses conversations et SA rémunération — jamais celle des autres. Les ventes sont créditées au bon chatteur." },
  { icon: "🟡", accent: "#e5b769", nav: "models", route: "/models", cta: "Aller connecter Dropp",
    title: "5. Connecte Dropp (paiement auto)",
    body: "Sur chaque modèle → bouton « Dropp ＋ » → colle la clé API (links:read + links:write). Ensuite, quand un fan paie, le PPV passe « payé ✓ » tout seul." },
  { icon: "✅", accent: "#22c55e", title: "C'est parti !",
    body: "Tu es prêt. Tu peux rouvrir ce guide à tout moment via le bouton « 🎓 Guide » en haut à droite." },
];

function clearHighlight() { try { document.querySelectorAll(".guide-pulse").forEach((e) => e.classList.remove("guide-pulse")); } catch (e) {} }
function highlight(nav) { clearHighlight(); if (!nav) return; try { const el = document.querySelector(`[data-guide="${nav}"]`); if (el) el.classList.add("guide-pulse"); } catch (e) {} }

export default function OnboardingGuide() {
  const { profile } = useStore();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(0);

  const agencyId = profile?.agency_id;
  const key = agencyId ? "cvflow_onboarded_" + agencyId : null;

  useEffect(() => {
    if (!profile || profile.role !== "ADMIN" || !key) return;
    try { if (!localStorage.getItem(key)) setOpen(true); } catch (e) {}
  }, [profile, key]);

  useEffect(() => {
    const h = () => { setI(0); setOpen(true); };
    window.addEventListener("cvflow-open-guide", h);
    return () => window.removeEventListener("cvflow-open-guide", h);
  }, []);

  // Surligne l'élément de menu de l'étape courante
  useEffect(() => {
    if (open) highlight(STEPS[i]?.nav); else clearHighlight();
    return () => clearHighlight();
  }, [open, i]);

  function done() { try { if (key) localStorage.setItem(key, "1"); } catch (e) {} clearHighlight(); setOpen(false); }
  function goto(route) { if (route) router.push(route); }   // ne ferme PAS le guide : il reste en coach

  if (!open) return null;
  const s = STEPS[i];
  const last = i === STEPS.length - 1;
  const first = i === 0;

  return (
    <div className="fixed bottom-5 right-5 z-[60] w-[370px] max-w-[calc(100vw-40px)] guide-fade-in">
      <div className="rounded-2xl border border-line2 shadow-2xl overflow-hidden" style={{ background: "#0e1312", boxShadow: "0 24px 60px -20px rgba(0,0,0,.7)" }}>
        <div className="h-1 w-full bg-panel2"><div className="h-full transition-all duration-300" style={{ width: `${((i + 1) / STEPS.length) * 100}%`, background: s.accent }} /></div>
        <div className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: `${s.accent}22`, border: `1px solid ${s.accent}55` }}>{s.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="text-[10.5px] uppercase tracking-wider font-semibold" style={{ color: s.accent }}>Guide · {i + 1}/{STEPS.length}</div>
              <div className="font-extrabold text-[15.5px] leading-tight truncate">{s.title}</div>
            </div>
            <button onClick={done} title="Fermer le guide" className="w-7 h-7 rounded-lg bg-panel2 text-muted2 hover:text-txt flex items-center justify-center shrink-0">✕</button>
          </div>
          <p className="text-muted text-[13px] leading-relaxed min-h-[76px]">{s.body}</p>

          {s.route && <button onClick={() => goto(s.route)} className="w-full mt-1 mb-3 py-2 rounded-lg text-[12.5px] font-bold" style={{ background: `${s.accent}1f`, color: s.accent, border: `1px solid ${s.accent}44` }}>{s.cta} →</button>}

          <div className="flex items-center gap-1.5 mb-3.5">
            {STEPS.map((_, k) => <span key={k} onClick={() => setI(k)} className="h-1.5 rounded-full cursor-pointer transition-all" style={{ width: k === i ? 20 : 6, background: k === i ? s.accent : "#2a332f" }} />)}
          </div>

          <div className="flex items-center gap-2">
            <button onClick={done} className="text-[12px] text-muted2 hover:text-txt mr-auto">Passer</button>
            {!first && <button onClick={() => setI(i - 1)} className="btn-ghost px-3.5 py-2 text-[13px] font-semibold">‹</button>}
            {last
              ? <button onClick={done} className="btn px-5 py-2 text-[13px] font-bold">Terminer 🎉</button>
              : <button onClick={() => setI(i + 1)} className="btn px-5 py-2 text-[13px] font-bold">Suivant ›</button>}
          </div>
        </div>
      </div>
    </div>
  );
}
