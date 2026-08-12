"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useStore, ROLE_VIEWS } from "@/lib/store";
import { initials } from "@/lib/ui";
import OnboardingGuide from "@/components/OnboardingGuide";

const NAV = [
  { group: "Pilotage", items: [["dashboard", "Tableau de bord"], ["conversations", "Conversations"], ["analytics", "Analytics"], ["plannings", "Plannings"], ["scripts", "Scripts"]] },
  { group: "Gestion", items: [["models", "Modèles"], ["vault", "Coffre média"], ["employees", "Employés"]] },
];
const PATH = { plannings: "planning" };

export default function AppLayout({ children }) {
  const { ready, loading, session, profile, logout } = useStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => { if (ready && !loading && !session) router.replace("/login"); }, [ready, loading, session, router]);

  // Garde d'accès par rôle : un chatteur qui tape /analytics dans l'URL est renvoyé vers une page autorisée
  useEffect(() => {
    if (!ready || loading || !session || !profile) return;
    const seg = (pathname || "/").replace(/^\//, "").split("/")[0];
    const view = seg === "planning" ? "plannings" : seg;
    const allowed = ROLE_VIEWS[profile.role] || [];
    if (view && !allowed.includes(view)) {
      const first = allowed[0] || "conversations";
      router.replace("/" + (PATH[first] || first));
    }
  }, [ready, loading, session, profile, pathname, router]);

  if (!ready) return <Centered>Base de données non configurée.</Centered>;
  if (loading) return <Centered>Chargement…</Centered>;
  if (!session || !profile) return null;

  const allow = ROLE_VIEWS[profile.role] || [];
  const href = (v) => "/" + (PATH[v] || v);

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <aside className="w-[236px] min-w-[236px] bg-bg2 border-r border-line flex flex-col p-3">
        <div className="flex items-center gap-2.5 px-2.5 pt-2 pb-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-extrabold text-[#05130c] text-xs" style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)" }}>CV</div>
          <div className="font-extrabold text-base">CVFLOW</div>
          <div className="badge text-acc bg-acc/15 ml-auto">BETA</div>
        </div>
        <nav className="flex-1">
          {NAV.map((g) => {
            const items = g.items.filter((it) => allow.includes(it[0]));
            if (!items.length) return null;
            return (
              <div key={g.group}>
                <div className="text-[10px] uppercase tracking-wider text-muted2 px-3 pt-3.5 pb-1.5 font-semibold">{g.group}</div>
                {items.map((it) => {
                  const active = pathname === href(it[0]);
                  return <Link key={it[0]} href={href(it[0])} className={`flex items-center gap-3 px-3 py-2 rounded-[10px] text-[13.5px] font-medium mb-0.5 ${active ? "bg-acc/15 text-acc" : "text-muted hover:bg-panel hover:text-txt"}`}>{it[1]}</Link>;
                })}
              </div>
            );
          })}
        </nav>
        <div className="mt-auto pt-3 border-t border-line">
          <button onClick={async () => { await logout(); router.replace("/login"); }} className="flex items-center gap-3 px-3 py-2 rounded-[10px] text-[13.5px] font-medium w-full text-left text-muted hover:bg-panel hover:text-txt">Déconnexion</button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-[60px] min-h-[60px] border-b border-line flex items-center px-6 gap-3.5 bg-bg2">
          <div className="text-[17px] font-bold capitalize">{(pathname.slice(1) || "dashboard").replace("planning", "plannings")}</div>
          <div className="flex-1" />
          {profile.role === "ADMIN" && <button onClick={() => window.dispatchEvent(new Event("cvflow-open-guide"))} className="text-[12.5px] font-semibold text-muted hover:text-acc border border-line hover:border-acc/50 rounded-full px-3 py-1.5 flex items-center gap-1.5" title="Revoir le guide de démarrage">🎓 Guide</button>}
          <div className="badge text-acc bg-acc/15 flex items-center gap-1.5 px-3 py-1.5"><span className="w-1.5 h-1.5 rounded-full bg-acc" /> Opérationnel</div>
          <div className="flex items-center gap-2 bg-panel border border-line2 pl-1 pr-3 py-1 rounded-full">
            <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] text-white" style={{ background: "#0d9488" }}>{initials(profile.name || profile.email || "?")}</div>
            <span className="text-[13px] font-semibold">{(profile.name || profile.email)?.split(" ")[0]} · {profile.role === "ADMIN" ? "Admin" : "Chatteur"}</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
      <OnboardingGuide />
    </div>
  );
}

function Centered({ children }) {
  return <div className="fixed inset-0 flex items-center justify-center text-muted">{children}</div>;
}
