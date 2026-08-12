"use client";
import { useState, useRef, useEffect } from "react";
import { useStore } from "@/lib/store";
import { initials, eur, thumbBg, typeIcons, typeLabel, TAG_CLASS, TAGS } from "@/lib/ui";
import ModelSwitcher from "@/components/ModelSwitcher";
import CopyLink from "@/components/CopyLink";

export default function Conversations() {
  const s = useStore();
  const { models, convs, chats, scripts, team, currentUser, activeModel } = s;
  const [activeConv, setActiveConv] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [vaultOpen, setVaultOpen] = useState(false);
  const [vaultFolder, setVaultFolder] = useState(0);
  const [draft, setDraft] = useState("");
  const [showScripts, setShowScripts] = useState(false);
  const [addFanOpen, setAddFanOpen] = useState(false);
  const [fanForm, setFanForm] = useState({ name: "", tag: "new" });
  const [replyTo, setReplyTo] = useState(null);
  const msgsRef = useRef(null);

  const emojis = ["😍", "🔥", "😏", "🥰", "😘", "😉", "🙈", "💦", "😈", "🥺", "❤️", "💸", "👀", "😊"];

  const modelConvs = convs.filter((c) => !activeModel || c.model_id === activeModel);
  const list = modelConvs.filter((c) => {
    if (filter === "unread") return c.unread > 0;
    if (["vip", "whale", "new", "cold"].includes(filter)) return c.tag === filter;
    return true;
  }).filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  const conv = convs.find((c) => c.id === activeConv);
  const msgs = activeConv ? chats[activeConv] || [] : [];

  useEffect(() => { if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight; }, [msgs, activeConv]);

  // Remontée des messages entrants : rafraîchit la conversation ouverte + la liste des fans
  useEffect(() => {
    if (!activeConv) return;
    const t = setInterval(() => s.loadChat(activeConv), 4000);
    return () => clearInterval(t);
  }, [activeConv]);
  useEffect(() => {
    const t = setInterval(() => { if (s.refresh) s.refresh(); }, 20000);
    return () => clearInterval(t);
  }, []);

  function openConv(id) { setActiveConv(id); setVaultOpen(false); setReplyTo(null); s.markRead(id); if (!chats[id]) s.loadChat(id); }
  function send() { if (!draft.trim() || !activeConv) return; s.sendMessage(activeConv, draft.trim(), replyTo?.tgId); setDraft(""); setShowScripts(false); setReplyTo(null); }
  function onDraft(v) { setDraft(v); setShowScripts(v.startsWith("/")); }
  function pickScript(txt) { const t = txt.replace("(name)", conv?.name || ""); setDraft(t); setShowScripts(false); try { navigator.clipboard.writeText(t); } catch {} }

  const folders = s.vault[activeModel] || [];
  const fi = Math.min(vaultFolder, Math.max(0, folders.length - 1));

  if (!models.length) return <Empty title="Aucun modèle connecté" sub="Va dans Modèles pour connecter un compte Telegram, puis reviens chatter." />;

  return (
    <div className="flex flex-col h-full bg-bg">
      <div className="flex gap-2 px-4 py-3 border-b border-line bg-bg2 items-center">
        <ModelSwitcher onChange={() => { setActiveConv(null); setVaultOpen(false); }} />
        <div className="flex-1" />
        <div className="badge text-muted bg-panel border border-line px-3 py-1.5 text-[11.5px] flex items-center gap-1.5"><span className="text-tg">✈️ Telegram</span></div>
      </div>
      <div className="flex-1 flex min-h-0">
        <div className="w-[300px] min-w-[300px] border-r border-line flex flex-col bg-bg2">
          <div className="p-3 flex gap-2">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher…" className="inp flex-1 px-3 py-2.5 text-[13px]" />
            <button onClick={() => setAddFanOpen(true)} className="btn px-3 text-sm font-bold" title="Ajouter un fan">＋</button>
          </div>
          <div className="flex gap-1.5 px-3 pb-2.5 overflow-x-auto">
            {[["all", "Tous"], ["unread", "Non lus"], ["vip", "VIP"], ["whale", "Whales"], ["new", "Nouveaux"], ["cold", "Froids"]].map((f) => (
              <button key={f[0]} onClick={() => setFilter(f[0])} className={`text-[11.5px] px-2.5 py-1 rounded-full font-semibold whitespace-nowrap ${filter === f[0] ? "bg-acc/15 text-acc" : "bg-panel text-muted"}`}>{f[1]}</button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto">
            {list.length === 0 && <div className="text-center text-muted2 text-[12.5px] p-6">Aucun fan pour ce modèle.<br />Clique sur ＋ pour en ajouter.</div>}
            {list.map((c) => (
              <div key={c.id} onClick={() => openConv(c.id)} className={`flex gap-2.5 px-3.5 py-3 border-b border-line cursor-pointer relative ${activeConv === c.id ? "bg-panel2 shadow-[inset_2px_0_0_#22c55e]" : "hover:bg-panel"}`}>
                <div className="relative">
                  <div className="w-[42px] h-[42px] rounded-full flex items-center justify-center font-bold text-white" style={{ background: c.color }}>{initials(c.name)}</div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-[15px] h-[15px] rounded-full border-2 border-bg2 flex items-center justify-center text-[8px]" style={{ background: "#3aa0e6" }}>✈️</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline"><span className="font-semibold text-[13.5px] truncate">{c.name}</span></div>
                  <div className="mt-1"><span className={`badge ${TAG_CLASS[c.tag]}`}>{c.tag.toUpperCase()}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0 bg-bg relative overflow-hidden">
          {!conv ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted2 gap-3"><div className="text-5xl opacity-40">💬</div><div>Sélectionne une conversation</div></div>
          ) : (
            <>
              <div className="h-16 min-h-16 border-b border-line flex items-center px-[18px] gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white" style={{ background: conv.color }}>{initials(conv.name)}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[15px] flex items-center gap-2">{conv.name} <span className={`badge ${TAG_CLASS[conv.tag]}`}>{conv.tag.toUpperCase()}</span></div>
                  <div className="text-[12px] text-muted"><span style={{ color: "#3aa0e6" }}>✈️ Telegram</span> · via {models.find((m) => m.id === conv.model_id)?.name} · toi = <b className="text-txt">{team.find((t) => t.id === currentUser)?.name?.split(" ")[0] || "moi"}</b></div>
                </div>
              </div>
              <div ref={msgsRef} className="flex-1 overflow-y-auto p-[22px] flex flex-col gap-2.5">
                {msgs.length === 0 && <div className="self-center text-muted2 text-[12.5px] mt-6">Démarre la conversation ci-dessous.</div>}
                {msgs.map((m, i) => <Bubble key={m.id || i} m={m} team={team} onPaid={() => s.markPaid(m.id, conv.id)} onLike={() => s.reactMessage(conv.id, m.tgId, "❤️")} onReply={() => setReplyTo(m)} />)}
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
                    {(scripts[activeModel] || []).length === 0 && <div className="px-3 py-3 text-[12px] text-muted2">Aucun script — ajoute-en dans l'onglet Scripts.</div>}
                  </div>
                )}
                {replyTo && (
                  <div className="flex items-center gap-2 mb-2 bg-panel2 border-l-2 border-acc rounded px-2.5 py-1.5 text-[12px]">
                    <span className="text-muted truncate">↩ Réponse à : <span className="text-txt">{(replyTo.x || replyTo.name || "média").slice(0, 60)}</span></span>
                    <button onClick={() => setReplyTo(null)} className="ml-auto text-muted2 hover:text-danger shrink-0">✕</button>
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
              <div className={`absolute top-16 bottom-0 right-0 w-[420px] bg-bg2 border-l border-line2 shadow-2xl flex flex-col transition-transform z-40 ${vaultOpen ? "translate-x-0 visible" : "translate-x-[105%] invisible"}`}>
                <div className="px-4 py-3.5 border-b border-line flex items-center justify-between"><h3 className="text-sm font-extrabold">🗄️ Coffre de {models.find((m) => m.id === activeModel)?.name}</h3><button onClick={() => setVaultOpen(false)} className="w-[30px] h-[30px] rounded-lg bg-panel2 text-muted flex items-center justify-center">✕</button></div>
                <div className="flex gap-1.5 px-4 py-3 overflow-x-auto border-b border-line">
                  {folders.map((f, i) => <button key={i} onClick={() => setVaultFolder(i)} className={`text-[12px] px-3 py-1.5 rounded-full font-semibold whitespace-nowrap border ${i === fi ? "bg-acc/15 text-acc border-acc" : "bg-panel text-muted border-line"}`}>{f.folder} · {f.items.length}</button>)}
                </div>
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5">
                  {folders.length === 0 && <div className="text-muted2 text-[12.5px] text-center py-4">Coffre vide — remplis-le dans l'onglet Coffre média.</div>}
                  {(folders[fi]?.items || []).map((it, idx) => (
                    <div key={it.id || idx} className="flex gap-3 items-center bg-panel border border-line rounded-xl p-2.5">
                      <div className="w-[58px] h-[58px] rounded-lg shrink-0 relative flex items-center justify-center text-xl" style={{ background: thumbBg(it.name) }}>
                        <span className="absolute top-1 left-1 bg-black/60 text-white text-[9px] font-bold px-1.5 rounded">Lvl {it.lvl}</span>{typeIcons(it.type)}
                      </div>
                      <div className="flex-1 min-w-0"><div className="font-bold text-[13px]">{it.name}</div><div className="text-[11px] text-muted mt-0.5">{typeIcons(it.type)} {typeLabel(it.type)} · {it.free ? <span className="text-acc font-bold">Gratuit</span> : <span className="text-gold font-extrabold">{it.price}€</span>}</div></div>
                      <CopyLink text={it.link} className="btn text-[12px] px-2.5 py-1.5 font-bold whitespace-nowrap" />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {conv && <FanInfo conv={conv} chats={chats} store={s} />}
      </div>

      {addFanOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={(e) => { if (e.target === e.currentTarget) setAddFanOpen(false); }}>
          <div className="card p-6 w-[440px] max-w-[92vw]">
            <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-extrabold">Ajouter un fan</h2><button onClick={() => setAddFanOpen(false)} className="w-[30px] h-[30px] rounded-lg bg-panel2 text-muted">✕</button></div>
            <label className="text-xs text-muted font-semibold block mb-1.5">Nom / pseudo Telegram</label>
            <input className="inp w-full px-3 py-2.5 mb-3" value={fanForm.name} onChange={(e) => setFanForm({ ...fanForm, name: e.target.value })} placeholder="Ex: @jeremie" />
            <label className="text-xs text-muted font-semibold block mb-1.5">Tag</label>
            <select className="inp w-full px-3 py-2.5 mb-4" value={fanForm.tag} onChange={(e) => setFanForm({ ...fanForm, tag: e.target.value })}><option value="new">New</option><option value="vip">VIP</option><option value="whale">Whale</option><option value="cold">Cold</option></select>
            <button onClick={async () => { await s.addFan(activeModel, fanForm.name || "Fan", "tg", fanForm.tag); setAddFanOpen(false); setFanForm({ name: "", tag: "new" }); }} className="btn w-full py-2.5 font-bold">Ajouter</button>
          </div>
        </div>
      )}

    </div>
  );
}

function Empty({ title, sub }) {
  return <div className="h-full flex flex-col items-center justify-center text-center gap-2 p-8"><div className="text-4xl opacity-40">🗂️</div><div className="font-bold text-lg">{title}</div><div className="text-muted text-sm max-w-sm">{sub}</div></div>;
}

function Bubble({ m, team, onPaid, onLike, onReply }) {
  if (m.t === "ppv") {
    const by = m.by ? team.find((t) => t.id === m.by) : null;
    return (
      <div className="self-end max-w-[60%] p-2 rounded-2xl border border-gold/35" style={{ background: "rgba(229,183,105,.07)" }}>
        <div className="flex gap-2.5 items-center">
          <div className="w-16 h-16 rounded-lg shrink-0 relative flex items-center justify-center text-xl overflow-hidden" style={{ background: thumbBg(m.name) }}>
            {typeIcons(m.type) || "📷"}{!m.unlocked && <div className="absolute inset-0 bg-black/35 flex items-center justify-center backdrop-blur-sm">🔒</div>}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-[13px]">{m.name}</div>
            <div className="text-gold font-extrabold text-sm mt-0.5">{m.price > 0 ? m.price + "€ · Dropp" : "Gratuit"}</div>
            <div className="text-[10.5px] text-muted mt-0.5">{m.unlocked ? <span className="text-acc font-bold">payé ✓</span> : "en attente"}{by ? ` · ${by.name?.split(" ")[0]}` : ""}</div>
            {!m.unlocked && m.price > 0 && <button onClick={onPaid} className="mt-1.5 text-[11px] font-bold text-acc border border-acc/40 rounded-md px-2 py-0.5 hover:bg-acc/10">Marquer payé (test)</button>}
          </div>
        </div>
        <div className="text-[10px] opacity-60 mt-1 text-right">{m.time}</div>
      </div>
    );
  }
  const out = m.t === "out";
  const by = m.by ? team.find((t) => t.id === m.by) : null;
  if (out) {
    return (
      <div className="self-end max-w-[56%] flex flex-col items-end">
        <div className="px-3.5 py-2.5 rounded-2xl rounded-br text-[13.5px] leading-relaxed text-[#eafff2]" style={{ background: "linear-gradient(135deg,#16a34a,#128a44)" }}>
          {m.x}<div className="text-[10px] opacity-60 mt-1 text-right">{m.time}</div>
        </div>
        {by && <div className="text-[10px] text-muted2 mt-0.5 mr-1">envoyé par <b className="text-muted">{by.name?.split(" ")[0]}</b></div>}
      </div>
    );
  }
  return (
    <div className="self-start max-w-[60%] group flex items-end gap-1.5">
      <div className="px-3.5 py-2.5 rounded-2xl rounded-bl text-[13.5px] leading-relaxed bg-panel border border-line">
        {m.x}<div className="text-[10px] opacity-60 mt-1 text-right">{m.time}</div>
      </div>
      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
        <button onClick={onLike} title="J'aime (réaction Telegram)" className="w-6 h-6 rounded-full bg-panel2 text-[11px] hover:bg-acc/20 flex items-center justify-center">❤️</button>
        <button onClick={onReply} title="Répondre à ce message" className="w-6 h-6 rounded-full bg-panel2 text-[12px] text-muted hover:bg-acc/20 hover:text-acc flex items-center justify-center">↩</button>
      </div>
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
        <div className="text-[12px] text-muted mt-0.5">✈️ Telegram</div>
        <div className="mt-3"><span className="text-[10px] text-muted2 uppercase tracking-wide block mb-1">Catégorie</span><select value={conv.tag} onChange={(e) => store.setFanTag(conv.id, e.target.value)} className="inp px-2.5 py-1.5 text-[12.5px] font-semibold w-full">{TAGS.map((t) => <option key={t[0]} value={t[0]}>{t[1]}</option>)}</select></div>
      </div>
      <Section title="💸 Dépenses & achats">
        <Row k="Total dépensé" v={eur(conv.spent)} acc />
        <Row k="PPV envoyés" v={ppv.length} />
        <Row k="PPV achetés" v={unlocked} acc />
      </Section>
      <Section title="🎬 PPV envoyés">
        {ppv.length === 0 ? <div className="text-muted2 text-[12px] py-1">Aucun PPV envoyé à ce fan.</div> : ppv.slice().reverse().map((p, i) => (
          <div key={i} className="flex items-center gap-2 py-1.5 text-[12px] border-b border-line/40 last:border-0">
            <span className="truncate flex-1">{typeIcons(p.type)} {p.name}</span>
            <span className="text-gold font-bold shrink-0">{p.price > 0 ? p.price + "€" : "gratuit"}</span>
            <span className={`shrink-0 text-[11px] ${p.unlocked ? "text-acc font-bold" : "text-muted2"}`}>{p.unlocked ? "acheté ✓" : "non acheté"}</span>
          </div>
        ))}
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
        <textarea defaultValue={conv.notes} onBlur={(e) => store.saveNote(conv.id, e.target.value)} placeholder="Notes…" className="w-full bg-panel border border-line rounded-lg p-2.5 text-[12.5px] resize-y min-h-[70px] outline-none" />
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
