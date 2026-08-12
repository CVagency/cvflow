"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";

// Pas-à-pas de démarrage pour une nouvelle agence : montre chaque partie du CRM,
// et se termine par la connexion de la clé API Dropp Fans.
const STEPS = [
  {
    icon: "🚀", accent: "#22c55e",
    title: "Bienvenue sur CVFLOW",
    body: "Ton cockpit pour gérer tout le chatting Telegram de tes modèles : conversations, coffre média, ventes attribuées et analytics. On te montre l'essentiel en 1 minute.",
  },
  {
    icon: "✈️", accent: "#3aa0e6", route: "/models", cta: "Aller à Modèles",
    title: "1. Connecte un modèle",
    body: "Onglet Modèles → « Connecter un compte » → scanne le QR depuis le Telegram du modèle (Réglages → Appareils → Lier un appareil). Le statut connecté / déconnecté s'affiche en direct, et si un compte saute tu peux le reconnecter en un clic.",
  },
  {
    icon: "🗄️", accent: "#e5b769", route: "/vault", cta: "Aller au Coffre",
    title: "2. Remplis le coffre média",
    body: "Range tes liens Dropp par dossier et par niveau, avec leur prix. Tes chatteurs les envoient ensuite en 1 clic depuis la conversation, sans jamais ouvrir de Drive.",
  },
  {
    icon: "💬", accent: "#a78bfa", route: "/conversations", cta: "Voir les Conversations",
    title: "3. Les conversations",
    body: "Inbox Telegram : scripts en « / », réponses & likes, fiche fan, montant dépensé par fan (coloré pour prioriser), filtres VIP / Baleine / non-lus. Le nom du chatteur est mis sous chaque message pour l'attribution des ventes.",
  },
  {
    icon: "👥", accent: "#e879a6", route: "/employees", cta: "Aller à Employés",
    title: "4. Invite ton équipe",
    body: "Ajoute tes chatteurs dans Employés. Chaque chatteur ne voit QUE son planning, ses conversations et SA rémunération — jamais celle des autres. Les ventes sont créditées au bon chatteur automatiquement.",
  },
  {
    icon: "🟡", accent: "#e5b769", route: "/models", cta: "Connecter Dropp",
    title: "5. Connecte Dropp Fans (clé API)",
    body: "Dernière étape : relie chaque modèle à Dropp pour les prix auto et le suivi des paiements. Sur app.dropp.fans → clique les ⋯ à côté du nom de l'agence → Paramètres → onglet API → Create Key (accès content, orders, links, webhooks) → copie la clé drp_live_… Puis dans Modèles, carte du modèle → bouton « Dropp ＋ » → colle la clé.",
  },
  {
    icon: "✅", accent: "#22c55e",
    title: "C'est parti !",
    body: "Tu es prêt à faire tourner ton agence. Tu peux rouvrir ce guide à tout moment via le bouton « Guide » en haut à droite.",
  },
];

export default function OnboardingGuide() {
  const { profile } = useStore();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(0);

  const agencyId = profile?.agency_id;
  const key = agencyId ? "cvflow_onboarded_" + agencyId : null;

  // Ouverture auto pour un admin qui n'a pas encore vu le guide
  useEffect(() => {
    if (!profile || profile.role !== "ADMIN" || !key) return;
    try { if (!localStorage.getItem(key)) setOpen(true); } catch (e) { /* no-op */ }
  }, [profile, key]);

  // Écoute le bouton « Guide » du header
  useEffect(() => {
    const h = () => { setI(0); setOpen(true); };
    window.addEventListener("cvflow-open-guide", h);
    return () => window.removeEventListener("cvflow-open-guide", h);
  }, []);

  function done() {
    try { if (key) localStorage.setItem(key, "1"); } catch (e) { /* no-op */ }
    setOpen(false);
  }
  function goto(route) { done(); if (route) router.push(route); }

  if (!open) return null;
  const s = STEPS[i];
  const last = i === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: "rgba(4,7,6,.72)", backdropFilter: "blur(6px)" }}>
      <div className="w-[540px] max-w-full rounded-2xl border border-line2 overflow-hidden shadow-2xl" style={{ background: "#0e1312" }}>
        <div className="h-1.5 w-full bg-panel2"><div className="h-full transition-all duration-300" style={{ width: `${((i + 1) / STEPS.length) * 100}%`, background: `linear-gradient(90deg,${s.accent},${s.accent}aa)` }} /></div>
        <div className="p-7">
          <div className="flex items-center justify-between mb-5">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" style={{ background: `${s.accent}22`, border: `1px solid ${s.accent}55` }}>{s.icon}</div>
            <button onClick={done} className="text-[12px] text-muted2 hover:text-txt">Passer le guide ✕</button>
          </div>
          <div className="text-[11px] uppercase tracking-wider font-semibold mb-1.5" style={{ color: s.accent }}>Étape {i + 1} / {STEPS.length}</div>
          <h2 className="text-2xl font-extrabold mb-3">{s.title}</h2>
          <p className="text-muted text-[14px] leading-relaxed min-h-[92px]">{s.body}</p>

          <div className="flex items-center gap-1.5 mt-5 mb-6">
            {STEPS.map((_, k) => <span key={k} onClick={() => setI(k)} className="h-1.5 rounded-full cursor-pointer transition-all" style={{ width: k === i ? 22 : 7, background: k === i ? s.accent : "#2a332f" }} />)}
          </div>

          <div className="flex items-center gap-2.5">
            {i > 0 && <button onClick={() => setI(i - 1)} className="btn-ghost px-4 py-2.5 text-sm font-semibold">‹ Précédent</button>}
            <div className="flex-1" />
            {s.route && <button onClick={() => goto(s.route)} className="btn-ghost px-4 py-2.5 text-sm font-semibold" style={{ borderColor: `${s.accent}66`, color: s.accent }}>{s.cta} →</button>}
            {last
              ? <button onClick={done} className="btn px-6 py-2.5 text-sm font-bold">Terminer 🎉</button>
              : <button onClick={() => setI(i + 1)} className="btn px-6 py-2.5 text-sm font-bold">Suivant ›</button>}
          </div>
        </div>
      </div>
    </div>
  );
}
