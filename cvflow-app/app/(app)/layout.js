"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useStore, ROLE_VIEWS } from "@/lib/store";
import { initials } from "@/lib/ui";

const NAV = [
  { group: "Pilotage", items: [
    ["dashboard", "Tableau de bord"], ["conversations", "Conversations"], ["analytics", "Analytics"],
    ["plannings", "Plannings"], ["scripts", "Scripts"],
  ]},
  { group: "Gestion", items: [
    ["models", "Modèles"], ["vault", "Coffre média"], ["employees", "Employés"],
  ]},
];
const PATH = { plannings: "planning" }; // route folder aliases

export default function AppLayout({ children }) {
  const { auth, logout, team, currentUser, setCurrentUser } = useStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => { if (!auth) router.replace("/login"); }, [auth, router]);
  if (!auth) return null;

  const allow = ROLE_VIEWS[auth.role] || [];
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
                  return (
                    <Link key={it[0]} href={href(it[0])} className={`flex items-center gap-3 px-3 py-2 rounded-[10px] text-[13.5px] font-medium mb-0.5 ${active ? "bg-acc/15 text-acc" : "text-muted hover:bg-panel hover:text-txt"}`}>
                      {it[1]}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>
        <div className="mt-auto pt-3 border-t border-line">
          <button onClick={logout} className="flex items-center gap-3 px-3 py-2 rounded-[10px] text-[13.5px] font-medium w-full text-left text-muted hover:bg-panel hover:text-txt">Déconnexion</button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-[60px] min-h-[60px] border-b border-line flex items-center px-6 gap-3.5 bg-bg2">
          <div className="text-[17px] font-bold capitalize">{(pathname.slice(1) || "dashboard").replace("planning", "plannings")}</div>
          <div className="flex-1" />
          <div className="badge text-acc bg-acc/15 flex items-center gap-1.5 px-3 py-1.5"><span className="w-1.5 h-1.5 rounded-full bg-acc" /> Opérationnel</div>
          {auth.role === "ADMIN" && (
            <div className="flex items-center gap-2 bg-panel border border-line2 pl-1 pr-2 py-1 rounded-full">
              <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] text-white" style={{ background: team.find((t) => t.id === currentUser)?.color }}>{initials(team.find((t) => t.id === currentUser)?.name || "")}</div>
              <select value={currentUser} onChange={(e) => setCurrentUser(e.target.value)} className="bg-transparent text-txt font-semibold text-[13px] outline-none cursor-pointer">
                {team.map((t) => <option key={t.id} value={t.id}>{t.name.split(" ")[0]} · {t.role === "ADMIN" ? "Admin" : "Chatteur"}</option>)}
              </select>
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
