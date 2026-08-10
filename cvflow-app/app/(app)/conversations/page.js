"use client";
import { useState, useRef, useEffect } from "react";
import { useStore } from "@/lib/store";
import { initials, eur, thumbBg, TYPE_ICON, TAG_CLASS } from "@/lib/ui";

export default function Conversations() {
  const s = useStore();
  const { models, convs, chats, scripts, team, currentUser } = s;
  const [activeModel, setActiveModel] = useState("ange");
  const [activeConv, setActiveConv] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [vaultOpen, setVaultOpen] = useState(false);
  const [vaultFolder, setVaultFolder] = useState(0);
  const [draft, setDraft] = useState("");
  const [showScripts, setShowScripts] = useState(false);
  const msgsRef = useRef(null);

  const cnt = { ange: 24, lily: 19, lola: 8 };
  const emojis = ["😍", "🔥", "😏", "🥰", "😘", "😉", "🙈", "💦", "😈", "🥺", "❤️", "💸", "👀", "😊"];

  const list = convs.filter((c) => {
    if (filter === "unread") return c.unread > 0;
    if (["vip", "whale", "new"].includes(filter)) return c.tag === filter;
    if (filter === "wa" || filter === "tg") return c.src === filter;
    return true;
  }).filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  const conv = convs.find((c) => c.id === activeConv);
  const msgs = activeConv ? chats[activeConv] || [] : [];

  useEffect(() => { if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight; }, [msgs, activeConv]);

  function openConv(id) { setActiveConv(id); setVaultOpen(false); s.markRead(id); }
  function send() { if (!draft.trim() || !activeConv) return; s.sendMessage(activeConv, draft.trim()); setDraft(""); setShowScripts(false); }
  function onDraft(v) { setDraft(v); setShowScripts(v.startsWith("/")); }
  function pickScript(txt) { setDraft(txt.replace("(name)", conv?.name || "")); setShowScripts(false); }

  const folders = s.vault[activeModel] || [];
  const fi = Math.min(vaultFolder, Math.max(0, folders.length - 1));

  return (
    <div className="flex flex-col h-full bg-bg">
      <div className="flex gap-2 px-4 py-3 border-b border-line bg-bg2 items-center">
        {models.map((m) => (
          <button key={m.id} onClick={() => { setActiveModel(m.id); setActiveConv(null); setVaultOpen(false); }} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[13px] font-semibold border ${activeModel === m.id ? "border-acc text-txt bg-acc/15" : "border-line text-muted bg-panel"}`}>
            <span className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-[10px] text-white" style={{ background: m.color }}>{m.name[0]}</span>{m.name}
            <span className="text-[10px] bg-acc text-[#05130c] px-1.5 rounded-full font-bold">{cnt[m.id] ?? 0}</span>
          </button>
        ))}
        <div className="flex-1" />
        <div className="badge text-muted bg-panel border border-line px-3 py-1.5 text-[11.5px]">Inbox unifiée · <span className="text-wa">WhatsApp</span> + <span className="text-tg">Telegram</span></div>
      </div>
      <div className="flex-1 flex min-h-0">
        {/* list */}
        <div className="w-[300px] min-w-[300px] border-r border-line flex flex-col bg-bg2">
          <div className="p-3"><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un contact…" className="inp w-full px-3 py-2.5 text-[13px]" /></div>
          <div className="flex gap-1.5 px-3 pb-2.5 overflow-x-auto">
            {[["all", "Tous"], ["unread", "Non lus"], ["vip", "VIP"], ["whale", "Whales"], ["new", "Nouveaux"], ["wa", "WA"], ["tg", "TG"]].map((f) => (
              <button key={f[0]} onClick={() => setFilter(f[0])} className={`text-[11.5px] px-2.5 py-1 rounded-full font-semibold whitespace-nowrap ${filter === f[0] ? "bg-acc/15 text-acc" : "bg-panel text-muted"}`}>{f[1]}</button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto">
            {list.map((c) => (
              <div key={c.id} onClick={() => openConv(c.id)} className={`flex gap-2.5 px-3.5 py-3 border-b border-line cursor-pointer relative ${activeConv === c.id ? "bg-panel2 shadow-[inset_2px_0_0_#22c55e]" : "hover:bg-panel"}`}>
                <div className="relative">
                  <div className="w-[42px] h-[42px] rounded-full flex items-center justify-center font-bold text-white" style={{ background: c.color }}>{initials(c.name)}</div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-[15px] h-[15px] rounded-full border-2 border-bg2" style={{ background: c.src === "wa" ? "#25d366" : "#3aa0e6" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline"><span className="font-semibold text-[13.5px] truncate">{c.name}</span><span className="text-[11px] text-muted2 ml-1.5 shrink-0">{c.time}</span></div>
                  <div className="text-[12.5px] text-muted truncate mt-0.5">{c.last}</div>
                  <div className="mt-1"><span className={`badge ${TAG_CLASS[c.tag]}`}>{c.tag.toUpperCase()}</span></div>
                </div>
                {c.unread > 0 && <div className="absolute right-3.5 bottom-3.5 bg-acc text-[#05130c] text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1.5">{c.unread}</div>}
              </div>
            ))}
          </div>
        </div>
        {/* chat */}
        <div className="flex-1 flex flex-col min-w-0 bg-bg relative overflow-hidden">
          {!conv ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted2 gap-3"><div className="text-5xl opacity-40">💬</div><div>Sélectionne une conversation</div></div>
          ) : (
            <>
              <div className="h-16 min-h-16 border-b border-line flex items-center px-[18px] gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white" style={{ background: conv.color }}>{initials(conv.name)}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[15px] flex items-center gap-2">{conv.name} <span className={`badge ${TAG_CLASS[conv.tag]}`}>{conv.tag.toUpperCase()}</span></div>
                  <div className="text-[12px] text-muted"><span style={{ color: conv.src === "wa" ? "#25d366" : "#3aa0e6" }}>● {conv.src === "wa" ? "WhatsApp" : "Telegram"}</span> · via {models.find((m) => m.id === activeModel)?.name} · tu chattes en <b className="text-txt">{team.find((t) => t.id === currentUser)?.name.split(" ")[0]}</b></div>
                </div>
              </div>
              <div ref={msgsRef} className="flex-1 overflow-y-auto p-[22px] flex flex-col gap-2.5">
                <div className="self-center text-[11px] text-muted2 bg-panel px-3 py-0.5 rounded-full">Aujourd'hui</div>
                {msgs.map((m, i) => <Bubble key={i} m={m} team={team} />)}
              </div>
              <div className="border-t border-line px-3.5 py-2.5 bg-bg2 relative">
                {showScripts && (
                  <div className="absolute bottom-full left-3.5 right-3.5 bg-panel2 border border-line2 rounded-xl mb-2 max-h-[260px] overflow-y-auto shadow-2xl z-30">
                    <div className="px-3 py-2 text-[11px] text-muted2 border-b border-line">Scripts de {models.find((m) => m.id === activeModel)?.name}</div>
                    {(scripts[activeModel] || []).filter((sc) => (sc[0] + sc[1]).toLowerCase().includes(draft.slice(1).toLowerCase())).map((sc, i) => (
                      <div key={i} onClick={() => pickScript(sc[2])} className="px-3 py-2.5 border-b border-line cursor-pointer hover:bg-panel">
                        <span className="font-mono text-[11px] text-tg font-bold">{sc[0]}</span> <span className="font-semibold">{sc[1]}</span>
                        <div className="text-[12.5px] mt-0.5">{sc[2]}</div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-0.5 mb-2 flex-wrap items-center">
                  {emojis.map((e) => <button key={e} onClick={() => setDraft((d) => d + e)} className="text-[17px] px-1.5 py-0.5 rounded-md hover:bg-panel2">{e}</button>)}
                </div>
                <div className="flex gap-1.5 mb-2 flex-wrap">
                  <button onClick={() => setVaultOpen((v) => !v)} className="flex items-center gap-1.5 text-[12px] px-2.5 py-1.5 rounded-lg bg-panel border border-gold/30 text-gold font-semibold">🗄️ Coffre média</button>
                  <button onClick={() => setShowScripts((v) => !v)} className="flex items-center gap-1.5 text-[12px] px-2.5 py-1.5 rounded-lg bg-panel border border-tg/30 text-tg font-semibold">Scripts ( / )</button>
                </div>
                <div className="flex gap-2.5 items-end">
                  <textarea value={draft} onChange={(e) => onDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} rows={1} placeholder={`Écris à ${conv.name}…  (tape / pour tes scripts)`} className="flex-1 inp px-3.5 py-2.5 text-[13.5px] resize-none max-h-[120px]" />
                  <button onClick={send} className="w-[42px] h-[42px] rounded-xl btn flex items-center justify-center text-lg">➤</button>
                </div>
              </div>
              {/* vault panel */}
              <div className={`absolute top-16 bottom-0 right-0 w-[420px] bg-bg2 border-l border-line2 shadow-2xl flex flex-col transition-transform z-40 ${vaultOpen ? "translate-x-0 visible" : "translate-x-[105%] invisible"}`}>
                <div className="px-4 py-3.5 border-b border-line flex items-center justify-between"><h3 className="text-sm font-extrabold">🗄️ Coffre de {models.find((m) => m.id === activeModel)?.name}</h3><button onClick={() => setVaultOpen(false)} className="w-[30px] h-[30px] rounded-lg bg-panel2 text-muted flex items-center justify-center">✕</button></div>
                <div className="flex gap-1.5 px-4 py-3 overflow-x-auto border-b border-line">
                  {folders.map((f, i) => <button key={i} onClick={() => setVaultFolder(i)} className={`text-[12px] px-3 py-1.5 rounded-full font-semibold whitespace-nowrap border ${i === fi ? "bg-acc/15 text-acc border-acc" : "bg-panel text-muted border-line"}`}>{f.folder} · {f.items.length}</button>)}
                </div>
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5">
                  {(folders[fi]?.items || []).map((it, idx) => (
                    <div key={idx} className="flex gap-3 items-center bg-panel border border-line rounded-xl p-2.5">
                      <div className="w-[58px] h-[58px] rounded-lg shrink-0 relative flex items-center justify-center text-xl" style={{ background: thumbBg(it.name) }}>
                        <span className="absolute top-1 left-1 bg-black/60 text-white text-[9px] font-bold px-1.5 rounded">Lvl {it.lvl}</span>{TYPE_ICON[it.type]}
                      </div>
                      <div className="flex-1 min-w-0"><div className="font-bold text-[13px]">{it.name}</div><div className="text-[11px] text-muted mt-0.5">{TYPE_ICON[it.type]} {it.type} · {it.free ? <span className="text-acc font-bold">Gratuit</span> : <span className="text-gold font-extrabold">{it.price}€</span>}</div></div>
                      <button onClick={() => s.sendVaultItem(activeConv, activeModel, fi, idx)} className="btn text-[12px] px-2.5 py-1.5 font-bold">Envoyer</button>
                    </div>
                  ))}
                  <div className="text-[11px] text-muted text-center py-2.5">Liens Dropp pré-préparés par le manager · aperçu visible · envoi en 1 clic</div>
                </div>
              </div>
            </>
          )}
        </div>
        {/* fan info */}
        {conv && <FanInfo conv={conv} chats={chats} store={s} />}
      </div>
    </div>
  );
}

function Bubble({ m, team }) {
  if (m.t === "ppv") {
    const by = m.by ? team.find((t) => t.id === m.by) : null;
    return (
      <div className="self-end max-w-[60%] p-2 rounded-2xl border border-gold/35" style={{ background: "rgba(229,183,105,.07)" }}>
        <div className="flex gap-2.5 items-center">
          <div className="w-16 h-16 rounded-lg shrink-0 relative flex items-center justify-center text-xl overflow-hidden" style={{ background: thumbBg(m.name) }}>
            {TYPE_ICON[m.type]}{!m.unlocked && <div className="absolute inset-0 bg-black/35 flex items-center justify-center backdrop-blur-sm">🔒</div>}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-[13px]">{m.name}</div>
            <div className="text-gold font-extrabold text-sm mt-0.5">{m.price > 0 ? m.price + "€ · Dropp" : "Gratuit"}</div>
            <div className="text-[10.5px] text-muted mt-0.5">{m.folder} · Lvl {m.lvl} {m.unlocked ? <span className="text-acc font-bold">· payé ✓</span> : "· en attente"}{by ? ` · vendu par ${by.name.split(" ")[0]}` : ""}</div>
          </div>
        </div>
        <div className="text-[10px] opacity-60 mt-1 text-right">{m.time}</div>
      </div>
    );
  }
  const out = m.t === "out";
  return (
    <div className={`max-w-[56%] px-3.5 py-2.5 rounded-2xl text-[13.5px] leading-relaxed ${out ? "self-end text-[#eafff2] rounded-br" : "self-start bg-panel border border-line rounded-bl"}`} style={out ? { background: "linear-gradient(135deg,#16a34a,#128a44)" } : {}}>
      {m.x}<div className="text-[10px] opacity-60 mt-1 text-right">{m.time}</div>
    </div>
  );
}

function FanInfo({ conv, chats, store }) {
  const ppv = (chats[conv.id] || []).filter((m) => m.t === "ppv");
  const unlocked = ppv.filter((p) => p.unlocked && p.price > 0).length;
  const fields = [["age", "Âge"], ["location", "Localisation"], ["job", "Job"], ["relationship", "Situation"], ["interests", "Intérêts"], ["budget", "Budget"], ["timezone", "Fuseau"]];
  return (
    <div className="w-[290px] min-w-[290px] border-l border-line bg-bg2 overflow-y-auto max-[1250px]:hidden">
      <div className="text-center p-5 border-b border-line">
        <div className="w-[60px] h-[60px] rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-2.5" style={{ background: conv.color }}>{initials(conv.name)}</div>
        <div className="font-bold text-base">{conv.name}</div>
        <div className="text-[12px] text-muted mt-0.5">{conv.src === "wa" ? "📱 WhatsApp" : "✈️ Telegram"} · fan depuis 2 mois</div>
        <div className="mt-2.5"><span className={`badge ${TAG_CLASS[conv.tag]}`}>{conv.tag.toUpperCase()}</span></div>
      </div>
      <Section title="💸 Dépenses & achats">
        <Row k="Total dépensé" v={eur(conv.spent)} acc />
        <Row k="PPV envoyés" v={ppv.length} />
        <Row k="PPV déverrouillés" v={unlocked} acc />
        <Row k="Panier moyen" v={conv.spent ? eur(Math.round(conv.spent / Math.max(1, ppv.length))) : "—"} />
      </Section>
      <Section title="📊 Profil & scoring">
        <Row k="Pouvoir d'achat" v={conv.spent > 1000 ? "Top 10%" : conv.spent > 300 ? "Élevé" : "Standard"} />
        <Row k="Risque chargeback" v="Faible" acc />
        <Row k="Conversion" v={ppv.length ? Math.round((unlocked / ppv.length) * 100) + "%" : "0%"} />
      </Section>
      <Section title="👤 Fiche fan">
        {fields.map((f) => (
          <div key={f[0]} className="flex justify-between items-center py-1.5 text-[12.5px] gap-2">
            <span className="text-muted whitespace-nowrap">{f[1]}</span>
            <input defaultValue={conv.fiche[f[0]]} onBlur={(e) => store.saveFiche(conv.id, f[0], e.target.value)} placeholder="—" className="flex-1 bg-panel border border-line rounded-md px-2 py-1 text-[12px] outline-none text-right focus:border-acc" />
          </div>
        ))}
      </Section>
      <Section title="📝 Notes privées" last>
        <textarea defaultValue={conv.notes} onBlur={(e) => store.saveNote(conv.id, e.target.value)} placeholder="Ex: préfère les vidéos, dispo le soir…" className="w-full bg-panel border border-line rounded-lg p-2.5 text-[12.5px] resize-y min-h-[70px] outline-none" />
      </Section>
    </div>
  );
}
function Section({ title, children, last }) {
  return <div className={last ? "" : "border-b border-line"}><div className="px-[18px] py-3.5 text-[12px] font-bold">{title}</div><div className="px-[18px] pb-3.5">{children}</div></div>;
}
function Row({ k, v, acc }) {
  return <div className="flex justify-between py-1.5 text-[12.5px]"><span className="text-muted">{k}</span><span className={`font-bold ${acc ? "text-acc" : ""}`}>{v}</span></div>;
}
