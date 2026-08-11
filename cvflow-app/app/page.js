import Link from "next/link";

export const metadata = {
  title: "CVFLOW — Le CRM de chatting Telegram pour agences",
  description: "Coffre média connecté à Dropp Fans, scripts par modèle, attribution des ventes au chatteur, analytics en temps réel.",
};

const FEATS = [
  ["🗄️", "Coffre média avec aperçu", "Le manager prépare les liens Dropp par dossier et par niveau (Lvl 1→5). Le chatteur envoie en 1 clic, dans le bon ordre, sans ouvrir de Drive."],
  ["💬", "Chatting sans friction", "Inbox Telegram unifiée, scripts en « / », barre d'emojis, fiche fan complète à droite de chaque conversation."],
  ["📊", "Ventes attribuées sans bug", "Chaque média payant déverrouillé est crédité automatiquement au chatteur qui l'a envoyé. CA × commission calculés en temps réel."],
  ["🔒", "Anti-ban intégré", "Connexion Telegram par QR code ou numéro, proxy 4G résidentiel FR dédié par modèle, pacing des envois."],
  ["👥", "Équipe sous contrôle", "Rôles admin / chatteur, planning avec récap d'heures, CA/heure par chatteur, commissions éditables à tout moment."],
  ["📈", "Analytics niveau agence", "Revenu par modèle, par produit, par jour. Projection du mois, panier moyen, top fans et whales."],
];

const PLANS = [
  ["Starter", "49€", "/mois", ["1 modèle connecté", "2 sièges chatteur", "Coffre média illimité", "Analytics de base"], false],
  ["Pro", "99€", "/mois", ["5 modèles connectés", "Sièges illimités", "Proxy FR dédié / modèle", "Analytics complètes", "Support prioritaire"], true],
  ["Scale", "199€", "/mois", ["Modèles illimités", "Multi-agences", "API & webhooks Dropp", "Onboarding dédié"], false],
];

export default function Landing() {
  return (
    <div className="min-h-screen" style={{ background: "radial-gradient(1400px 700px at 50% -10%,rgba(34,197,94,.10),transparent),#0a0d0c" }}>
      <header className="max-w-6xl mx-auto flex items-center gap-3 px-6 py-5">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center font-extrabold text-[#05130c] text-xs" style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)" }}>CV</div>
        <div className="font-extrabold text-lg">CVFLOW</div>
        <div className="badge text-acc bg-acc/15">BETA</div>
        <div className="flex-1" />
        <Link href="/login" className="btn px-5 py-2.5 text-sm">Se connecter</Link>
      </header>

      <section className="max-w-4xl mx-auto text-center px-6 pt-16 pb-14">
        <div className="inline-flex items-center gap-2 badge text-acc bg-acc/15 px-3 py-1.5 mb-6">🚀 Pensé par une agence, pour les agences</div>
        <h1 className="text-5xl font-extrabold leading-[1.1] -tracking-wide">Le CRM de chatting<br /><span className="text-acc">Telegram</span> pour agences.</h1>
        <p className="text-muted text-lg mt-6 max-w-2xl mx-auto leading-relaxed">Coffre média connecté à Dropp Fans, scripts par modèle, attribution des ventes au chatteur, analytics en temps réel.</p>
        <div className="flex items-center justify-center gap-3 mt-9">
          <Link href="/login" className="btn px-7 py-3.5 text-[15px]">Essayer →</Link>
          <a href="#pricing" className="btn-ghost px-7 py-3.5 text-[15px] font-semibold">Voir les tarifs</a>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
          {FEATS.map((f) => (
            <div key={f[1]} className="card p-6">
              <div className="w-11 h-11 rounded-xl bg-acc/15 flex items-center justify-center text-xl mb-4">{f[0]}</div>
              <div className="font-bold text-[15px] mb-1.5">{f[1]}</div>
              <div className="text-muted text-[13px] leading-relaxed">{f[2]}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="max-w-5xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-extrabold text-center mb-10">Un tarif simple, qui scale avec toi</h2>
        <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
          {PLANS.map((p) => (
            <div key={p[0]} className={`card p-7 relative ${p[4] ? "border-acc" : ""}`}>
              {p[4] && <div className="absolute -top-3 left-1/2 -translate-x-1/2 badge bg-acc text-[#05130c] px-3 py-1">POPULAIRE</div>}
              <div className="font-bold text-lg">{p[0]}</div>
              <div className="mt-3 mb-5"><span className="text-4xl font-extrabold">{p[1]}</span><span className="text-muted text-sm">{p[2]}</span></div>
              <ul className="flex flex-col gap-2.5 mb-7">
                {p[3].map((li) => <li key={li} className="text-[13.5px] text-muted flex gap-2"><span className="text-acc">✓</span>{li}</li>)}
              </ul>
              <Link href="/login" className={`${p[4] ? "btn" : "btn-ghost"} w-full py-2.5 text-center block font-bold text-sm`}>Commencer</Link>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-line py-8 text-center text-muted2 text-xs">CVFLOW © 2026 · <Link href="/login" className="text-acc">Connexion</Link></footer>
    </div>
  );
}
