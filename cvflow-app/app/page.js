import Link from "next/link";

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

const PLANS = [
  ["Starter", "49€", "/mois", ["1 modèle connecté", "2 sièges chatteur", "Coffre média illimité", "Analytics de base"], false],
  ["Pro", "99€", "/mois", ["5 modèles connectés", "Sièges illimités", "Proxy FR dédié / modèle", "Analytics complètes", "Support prioritaire"], true],
  ["Scale", "199€", "/mois", ["Modèles illimités", "Multi-agences", "API & webhooks Dropp", "Onboarding dédié"], false],
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
          <Link href="/login" className="btn px-8 py-3.5 text-[15px] shadow-[0_10px_40px_-10px_rgba(34,197,94,.6)]">Démarrer gratuitement →</Link>
          <a href="#how" className="btn-ghost px-7 py-3.5 text-[15px] font-semibold">Voir comment ça marche</a>
        </div>

        {/* Aperçu produit (mockup) */}
        <div className="mt-16 relative">
          <div className="absolute inset-x-10 -top-6 h-24 blur-3xl opacity-40" style={{ background: "radial-gradient(circle,#22c55e,transparent)" }} />
          <div className="relative card p-2.5 shadow-2xl max-w-3xl mx-auto border-line2">
            <div className="rounded-xl overflow-hidden border border-line" style={{ background: "#0e1312" }}>
              <div className="flex items-center gap-1.5 px-3 py-2.5 border-b border-line">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ef5f5f]" /><span className="w-2.5 h-2.5 rounded-full bg-[#e5b769]" /><span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
                <span className="text-[11px] text-muted2 ml-2">cvflow · conversations</span>
              </div>
              <div className="grid grid-cols-[150px_1fr_140px] h-[240px] text-left max-sm:grid-cols-1">
                <div className="border-r border-line p-2.5 flex flex-col gap-2 max-sm:hidden">
                  {[["Jérémie", "120€", "#22c55e"], ["Alex", "40€", "#e5b769"], ["Sam", "0€", "#5f6b66"]].map((f, i) => (
                    <div key={i} className={`flex items-center gap-2 rounded-lg p-1.5 ${i === 0 ? "bg-panel2" : ""}`}>
                      <span className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: f[2] }}>{f[0][0]}</span>
                      <div className="min-w-0"><div className="text-[11px] font-semibold truncate">{f[0]}</div><div className="text-[10px] font-bold" style={{ color: f[2] }}>{f[1]}</div></div>
                    </div>
                  ))}
                </div>
                <div className="p-3 flex flex-col justify-end gap-2">
                  <div className="self-start bg-panel border border-line rounded-2xl rounded-bl px-3 py-2 text-[11.5px] max-w-[80%]">Coucou, tu fais quoi ce soir ? 🙈</div>
                  <div className="self-end rounded-2xl rounded-br px-3 py-2 text-[11.5px] max-w-[80%] text-[#eafff2]" style={{ background: "linear-gradient(135deg,#16a34a,#128a44)" }}>J'ai une petite surprise pour toi… 💦</div>
                  <div className="self-end rounded-xl border border-gold/40 px-3 py-2 text-[11px] max-w-[80%]" style={{ background: "rgba(229,183,105,.08)" }}>🎬 Vidéo douche · <b className="text-gold">15€ · Dropp</b></div>
                </div>
                <div className="border-l border-line p-2.5 max-sm:hidden">
                  <div className="text-[10px] text-muted2 uppercase mb-1">Fiche fan</div>
                  <div className="text-[11px] font-bold">Jérémie</div>
                  <div className="mt-1.5 badge text-gold bg-gold/15">VIP</div>
                  <div className="mt-3 text-[10px] text-muted2 uppercase mb-1">Dépensé</div>
                  <div className="text-acc font-extrabold text-lg">120€</div>
                </div>
              </div>
            </div>
          </div>
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
      <section id="pricing" className="max-w-5xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-extrabold text-center mb-3">Un tarif simple, qui scale avec toi</h2>
        <p className="text-center text-muted mb-10">Sans engagement. Change de plan quand tu veux.</p>
        <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1 items-start">
          {PLANS.map((p) => (
            <div key={p[0]} className={`card p-7 relative ${p[4] ? "border-acc shadow-[0_20px_60px_-20px_rgba(34,197,94,.5)] md:-translate-y-2" : ""}`}>
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

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="card p-10 text-center relative overflow-hidden" style={{ background: "radial-gradient(600px 200px at 50% 0%,rgba(34,197,94,.15),transparent),#121a17" }}>
          <h2 className="text-3xl font-extrabold mb-3">Prêt à professionnaliser ton agence ?</h2>
          <p className="text-muted mb-7 max-w-lg mx-auto">Crée ton espace en 30 secondes. Connecte ton premier modèle aujourd'hui.</p>
          <Link href="/login" className="btn px-8 py-3.5 text-[15px]">Créer mon agence →</Link>
        </div>
      </section>

      <footer className="border-t border-line py-8 text-center text-muted2 text-xs">CVFLOW © 2026 · Le CRM Telegram des agences · <Link href="/login" className="text-acc">Connexion</Link></footer>
    </div>
  );
}
