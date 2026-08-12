import Link from "next/link";
import LandingShowcase from "@/components/LandingShowcase";

export const metadata = {
  title: "CVFLOW — Le CRM de chatting Telegram pour agences",
  description: "Coffre média connecté à Dropp Fans, scripts par modèle, attribution des ventes au chatteur, analytics en temps réel.",
};

const FEATS = [
  ["🗄️", "Coffre média avec aperçu", "Le manager prépare les liens Dropp par dossier et par niveau. Le chatteur envoie dans le bon ordre, en 1 clic, sans ouvrir de Drive.", "#22c55e"],
  ["💬", "Chatting sans friction", "Inbox Telegram, scripts en « / », barre d'emojis, réponses & réactions, fiche fan complète à droite de chaque conversation.", "#3aa0e6"],
  ["📊", "Ventes attribuées sans bug", "Chaque média payant déverrouillé est crédité au chatteur qui l'a envoyé. CA × commission calculés en temps réel.", "#e5b769"],
  ["🔒", "Anti-ban intégré", "Connexion Telegram par QR code, proxy résidentiel FR dédié par modèle, pacing des envois pour protéger les comptes.", "#a78bfa"],
  ["👥", "Équipe sous contrôle", "Rôles admin / chatteur, planning avec récap d'heures, CA/heure par chatteur, commissions éditables à tout moment.", "#e879a6"],
  ["📈", "Analytics niveau agence", "Revenu par modèle, par jour, panier moyen, top fans et baleines. Tu pilotes à la donnée, plus au feeling.", "#22c55e"],
];

const STEPS = [
  ["1", "Connecte tes modèles", "Scanne le QR Telegram depuis le compte du modèle — proxy FR appliqué automatiquement."],
  ["2", "Remplis le coffre", "Colle tes liens Dropp par dossier et par niveau, ajoute tes scripts par modèle."],
  ["3", "Tes chatteurs vendent", "Ils envoient en 1 clic, tu vois les ventes attribuées et les commissions en direct."],
];

// Modèle façon Infloww : tu paies selon ce que tu génères. Petit abonnement uniquement sous 500€/mois.
const WA_NUMBER = "33689891964";
const WA_TEXT = "Salut ! Je gère une agence et je veux utiliser CVFLOW. Peux-tu m'envoyer les infos pour démarrer ?";
const WA_LINK = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(WA_TEXT)}`;

const TIERS = [
  ["Démarrage", "Moins de 500€ / mois", "49€", "/mois", "Abonnement fixe qui couvre l'hébergement et le proxy pendant que tu lances ton agence.", false],
  ["Croissance", "500€ – 10 000€ / mois", "5%", "du CA", "Tu ne paies qu'un pourcentage de ce que tu encaisses réellement. Zéro risque.", true],
  ["Scale", "10 000€ – 30 000€ / mois", "4%", "du CA", "Le pourcentage baisse au fur et à mesure que tu montes en volume.", false],
  ["Elite", "Plus de 30 000€ / mois", "3%", "du CA", "Le meilleur taux, pour les grosses agences. Onboarding et support dédiés.", false],
];

// « Tu fais X → tu paies Y »
const EXAMPLES = [
  ["300 €", "49 €", "Abonnement démarrage"],
  ["2 000 €", "100 €", "5% du CA"],
  ["8 000 €", "400 €", "5% du CA"],
  ["20 000 €", "800 €", "4% du CA"],
  ["50 000 €", "1 500 €", "3% du CA"],
];

export default function Landing() {
  return (
    <div className="min-h-screen text-txt" style={{ background: "radial-gradient(1200px 600px at 50% -5%,rgba(34,197,94,.12),transparent),#0a0d0c" }}>
      <header className="sticky top-0 z-30 backdrop-blur-md bg-[#0a0d0c]/70 border-b border-line/60">
        <div className="max-w-6xl mx-auto flex items-center gap-3 px-6 py-3.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-[#05130c] text-xs" style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)" }}>CV</div>
          <div className="font-extrabold text-lg">CVFLOW</div>
          <div className="badge text-acc bg-acc/15">BETA</div>
          <div className="flex-1" />
          <a href="#features" className="text-[13.5px] text-muted hover:text-txt max-sm:hidden px-3">Fonctions</a>
          <a href="#pricing" className="text-[13.5px] text-muted hover:text-txt max-sm:hidden px-3">Tarifs</a>
          <Link href="/login" className="btn px-5 py-2.5 text-sm">Se connecter</Link>
        </div>
      </header>

      {/* HERO */}
      <section className="max-w-5xl mx-auto text-center px-6 pt-20 pb-10">
        <div className="inline-flex items-center gap-2 badge text-acc bg-acc/12 border border-acc/20 px-3.5 py-2 mb-7">✈️ 100% Telegram · pensé par une agence, pour les agences</div>
        <h1 className="text-[54px] leading-[1.05] font-extrabold -tracking-wide max-md:text-4xl">Le CRM de chatting<br /><span className="text-acc">Telegram</span> pour agences.</h1>
        <p className="text-muted text-lg mt-6 max-w-2xl mx-auto leading-relaxed">Coffre média connecté à Dropp Fans, scripts par modèle, attribution des ventes au chatteur, analytics en temps réel. Zéro bug, zéro friction.</p>
        <div className="flex items-center justify-center gap-3 mt-9 flex-wrap">
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="btn px-8 py-3.5 text-[15px] shadow-[0_10px_40px_-10px_rgba(34,197,94,.6)]">Lancer mon agence →</a>
          <a href="#pricing" className="btn-ghost px-7 py-3.5 text-[15px] font-semibold">Voir les tarifs</a>
        </div>
        <div className="mt-5 text-[13px] text-muted2 flex items-center justify-center gap-2"><span className="inline-flex -space-x-1.5">{["#22c55e","#3aa0e6","#e5b769"].map((c)=><span key={c} className="w-5 h-5 rounded-full border-2 border-[#0a0d0c]" style={{background:c}} />)}</span>3 agences déjà en cours d'onboarding · paiement au résultat</div>

        {/* Aperçu produit — motion animé auto-rotatif */}
        <div className="mt-16">
          <LandingShowcase />
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="max-w-6xl mx-auto px-6 pt-16 pb-8">
        <h2 className="text-center text-3xl font-extrabold mb-3">Tout ce qu'il te faut pour scaler</h2>
        <p className="text-center text-muted mb-10 max-w-xl mx-auto">Un cockpit unique pour tes modèles, tes chatteurs et tes ventes.</p>
        <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
          {FEATS.map((f) => (
            <div key={f[1]} className="card p-6 hover:border-line2 transition group">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-4 transition group-hover:scale-110" style={{ background: `${f[3]}22`, border: `1px solid ${f[3]}44` }}>{f[0]}</div>
              <div className="font-bold text-[15px] mb-1.5">{f[1]}</div>
              <div className="text-muted text-[13px] leading-relaxed">{f[2]}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-center text-3xl font-extrabold mb-10">3 étapes, et c'est parti</h2>
        <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
          {STEPS.map((s) => (
            <div key={s[0]} className="card p-6 relative">
              <div className="w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-[#05130c] text-sm mb-4" style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)" }}>{s[0]}</div>
              <div className="font-bold text-[15px] mb-1.5">{s[1]}</div>
              <div className="text-muted text-[13px] leading-relaxed">{s[2]}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 pb-8 pt-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 badge text-acc bg-acc/12 border border-acc/20 px-3.5 py-2 mb-5">💸 Tu paies selon ce que tu génères</div>
          <h2 className="text-3xl font-extrabold mb-3">Pas d'abonnement qui t'étrangle.<br />Un pourcentage, comme un vrai partenaire.</h2>
          <p className="text-muted leading-relaxed">Plus ton agence chiffre, plus tu gagnes — et le pourcentage baisse. On se rémunère uniquement quand tu encaisses. Le proxy, le dev et l'hébergement sont couverts, tu ne prends aucun risque.</p>
        </div>

        <div className="grid grid-cols-4 gap-4 max-lg:grid-cols-2 max-sm:grid-cols-1 items-stretch mb-10">
          {TIERS.map((p) => (
            <div key={p[0]} className={`card p-6 relative flex flex-col ${p[5] ? "border-acc shadow-[0_20px_60px_-20px_rgba(34,197,94,.5)]" : ""}`}>
              {p[5] && <div className="absolute -top-3 left-1/2 -translate-x-1/2 badge bg-acc text-[#05130c] px-3 py-1 whitespace-nowrap">LE PLUS CHOISI</div>}
              <div className="font-bold text-[15px]">{p[0]}</div>
              <div className="text-[12px] text-muted2 mt-0.5 mb-4">{p[1]}</div>
              <div className="mb-3"><span className="text-4xl font-extrabold text-acc">{p[2]}</span><span className="text-muted text-sm ml-1">{p[3]}</span></div>
              <div className="text-[13px] text-muted leading-relaxed flex-1">{p[4]}</div>
              <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className={`${p[5] ? "btn" : "btn-ghost"} w-full py-2.5 mt-5 text-center block font-bold text-sm`}>Rejoindre</a>
            </div>
          ))}
        </div>

        {/* Simulateur « tu fais X → tu paies Y » */}
        <div className="card p-7 max-w-2xl mx-auto">
          <h3 className="text-center font-extrabold text-lg mb-1">Tu fais combien ? Voilà ce que ça coûte.</h3>
          <p className="text-center text-muted text-[13px] mb-5">Exemples concrets, calculés sur ton chiffre d'affaires mensuel.</p>
          <div className="flex flex-col gap-1.5">
            <div className="grid grid-cols-3 text-[11px] uppercase tracking-wide text-muted2 font-semibold px-3 pb-1">
              <span>Ton CA / mois</span><span className="text-center">Formule</span><span className="text-right">Tu paies</span>
            </div>
            {EXAMPLES.map((e, i) => (
              <div key={i} className="grid grid-cols-3 items-center bg-panel border border-line rounded-xl px-3.5 py-3">
                <span className="font-extrabold text-[15px]">{e[0]}</span>
                <span className="text-center text-[12px] text-muted">{e[2]}</span>
                <span className="text-right font-extrabold text-acc text-[15px]">{e[1]}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-muted2 text-[12px] mt-4">Le reste est à toi. Tu gardes 90 à 97% de ce que tu génères.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="card p-10 text-center relative overflow-hidden" style={{ background: "radial-gradient(600px 200px at 50% 0%,rgba(34,197,94,.15),transparent),#121a17" }}>
          <h2 className="text-3xl font-extrabold mb-3">Prêt à professionnaliser ton agence ?</h2>
          <p className="text-muted mb-7 max-w-lg mx-auto">Écris-nous sur WhatsApp. On te met en place ton espace et ton premier modèle connecté, et on te lance en 24h.</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="btn px-8 py-3.5 text-[15px] inline-flex items-center gap-2">💬 Nous contacter sur WhatsApp</a>
            <Link href="/login" className="btn-ghost px-7 py-3.5 text-[15px] font-semibold">J'ai déjà un compte</Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-line py-8 text-center text-muted2 text-xs">CVFLOW © 2026 · Le CRM Telegram des agences · <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="text-acc">WhatsApp</a> · <Link href="/login" className="text-acc">Connexion</Link></footer>
    </div>
  );
}
