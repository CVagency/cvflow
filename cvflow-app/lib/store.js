"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase, supabaseReady } from "./supabaseClient";

const StoreCtx = createContext(null);
export const useStore = () => useContext(StoreCtx);

export const ROLE_VIEWS = {
  ADMIN: ["dashboard", "conversations", "analytics", "plannings", "scripts", "models", "vault", "employees", "settings"],
  CHATTER: ["conversations", "plannings"],
};

const COLORS = ["#e11d48", "#7c3aed", "#0891b2", "#16a34a", "#db2777", "#ea580c", "#4f46e5", "#dc2626", "#d97706", "#0d9488"];
const colorFor = (s) => COLORS[Math.abs([...(s || "x")].reduce((a, c) => a + c.charCodeAt(0), 0)) % COLORS.length];
const timeOf = (ts) => { const d = ts ? new Date(ts) : new Date(); return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); };

export function StoreProvider({ children }) {
  const [ready] = useState(supabaseReady);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [models, setModels] = useState([]);
  const [team, setTeam] = useState([]);
  const [vault, setVault] = useState({});        // modelId -> [{folder, folderId, items:[...]}]
  const [scripts, setScripts] = useState({});    // modelId -> [[cmd,title,body], ...]
  const [convs, setConvs] = useState([]);        // fans
  const [chats, setChats] = useState({});        // fanId -> [messages]
  const [salesLog, setSalesLog] = useState([]);
  const [activeModel, setActiveModel] = useState(null);

  // ---- Auth ----
  useEffect(() => {
    if (!ready) { setLoading(false); return; }
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); if (!data.session) setLoading(false); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => { setSession(s); if (!s) { setProfile(null); setLoading(false); } });
    return () => sub.subscription.unsubscribe();
  }, [ready]);

  const auth = profile ? { userId: profile.id, role: profile.role } : null;
  const currentUser = profile?.id;

  const signIn = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error?.message || null;
  }, []);
  const signUp = useCallback(async (email, password, agencyName, name) => {
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { agency_name: agencyName || "Mon agence", name: name || email.split("@")[0] } } });
    return error?.message || null;
  }, []);
  const logout = useCallback(async () => { await supabase.auth.signOut(); setProfile(null); }, []);

  // ---- Load everything for the agency ----
  const loadAll = useCallback(async (agencyId) => {
    const [mRes, pRes] = await Promise.all([
      supabase.from("cvflow_models").select("*").eq("agency_id", agencyId).order("created_at"),
      supabase.from("cvflow_profiles").select("*").eq("agency_id", agencyId),
    ]);
    const ms = (mRes.data || []).map((m) => ({ ...m, color: colorFor(m.name), c2: "#0d9488", wa: m.wa_connected, tg: m.tg_connected, dropp: !!m.dropp_api_key, fans: 0, ca30: 0, ppv: 0, conv: 0 }));
    setModels(ms);
    setTeam((pRes.data || []).map((p) => ({ id: p.id, name: p.name || p.email, email: p.email, role: p.role, pct: p.pct, models: ms.map((m) => m.id), msgs: 0, sales: 0, ca: 0, hours: 0, rt: "—", online: false, color: colorFor(p.name || p.email) })));
    if (ms.length && !activeModel) setActiveModel(ms[0].id);

    const modelIds = ms.map((m) => m.id);
    if (modelIds.length) {
      const [foldersRes, scriptsRes, fansRes, salesRes] = await Promise.all([
        supabase.from("cvflow_vault_folders").select("*, cvflow_vault_items(*)").in("model_id", modelIds).order("position"),
        supabase.from("cvflow_scripts").select("*").in("model_id", modelIds),
        supabase.from("cvflow_fans").select("*").eq("agency_id", agencyId).order("created_at", { ascending: false }),
        supabase.from("cvflow_sales").select("*").eq("agency_id", agencyId),
      ]);
      const vaultByModel = {};
      (foldersRes.data || []).forEach((f) => {
        (vaultByModel[f.model_id] = vaultByModel[f.model_id] || []).push({
          folder: f.name, folderId: f.id,
          items: (f.cvflow_vault_items || []).sort((a, b) => a.level - b.level).map((it) => ({ id: it.id, lvl: it.level, name: it.name, type: it.type, price: Number(it.price), free: Number(it.price) === 0, link: it.dropp_link })),
        });
      });
      setVault(vaultByModel);
      const sc = {};
      (scriptsRes.data || []).forEach((s) => { (sc[s.model_id] = sc[s.model_id] || []).push([s.command, s.title, s.body]); });
      setScripts(sc);
      setConvs((fansRes.data || []).map((f) => ({ id: f.id, model_id: f.model_id, name: f.name || "Fan", last: "", time: "", unread: 0, tag: f.tag, spent: Number(f.spent), src: f.source, color: colorFor(f.name || f.id), fiche: f.fiche || {}, notes: f.notes || "" })));
      setSalesLog((salesRes.data || []).map((s) => ({ user: s.member_id, price: Number(s.amount) })));
      // reflect sales into team ca
      setTeam((prev) => prev.map((u) => { const ca = (salesRes.data || []).filter((s) => s.member_id === u.id).reduce((a, s) => a + Number(s.amount), 0); return { ...u, ca, sales: (salesRes.data || []).filter((s) => s.member_id === u.id).length }; }));
    } else {
      setVault({}); setScripts({}); setConvs([]); setSalesLog([]);
    }
    setLoading(false);
  }, [activeModel]);

  useEffect(() => {
    if (!session) return;
    (async () => {
      const { data: prof } = await supabase.from("cvflow_profiles").select("*").eq("id", session.user.id).single();
      if (prof) { setProfile(prof); await loadAll(prof.agency_id); }
      else setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const refresh = useCallback(() => { if (profile) loadAll(profile.agency_id); }, [profile, loadAll]);

  // ---- Messages / conversations ----
  const loadChat = useCallback(async (fanId) => {
    const { data } = await supabase.from("cvflow_messages").select("*").eq("fan_id", fanId).order("created_at");
    setChats((prev) => ({ ...prev, [fanId]: (data || []).map(mapMsg) }));
  }, []);
  function mapMsg(m) {
    if (m.kind === "ppv") return { t: "ppv", id: m.id, name: m.body, price: Number(m.price), unlocked: m.unlocked, by: m.sender_id, folder: "", lvl: "", type: "photo", time: timeOf(m.created_at) };
    return { t: m.direction === "in" ? "in" : "out", x: m.body, by: m.sender_id, time: timeOf(m.created_at) };
  }
  const sendMessage = useCallback(async (fanId, text) => {
    const fan = convs.find((c) => c.id === fanId);
    const { data } = await supabase.from("cvflow_messages").insert({ fan_id: fanId, model_id: fan?.model_id || activeModel, agency_id: profile.agency_id, sender_id: profile.id, direction: "out", kind: "text", body: text }).select().single();
    setChats((prev) => ({ ...prev, [fanId]: [...(prev[fanId] || []), mapMsg(data)] }));
  }, [convs, activeModel, profile]);

  const sendVaultItem = useCallback(async (fanId, modelId, folderIdx, itemIdx) => {
    const it = vault[modelId][folderIdx].items[itemIdx];
    const { data } = await supabase.from("cvflow_messages").insert({ fan_id: fanId, model_id: modelId, agency_id: profile.agency_id, sender_id: profile.id, kind: "ppv", body: it.name, vault_item_id: it.id, price: it.free ? 0 : it.price, unlocked: !!it.free }).select().single();
    const msg = mapMsg(data); msg.folder = vault[modelId][folderIdx].folder; msg.lvl = it.lvl; msg.type = it.type;
    setChats((prev) => ({ ...prev, [fanId]: [...(prev[fanId] || []), msg] }));
    // NOTE: le déverrouillage réel viendra du webhook Dropp (Phase 3). Bouton manuel de test ci-dessous.
    return data.id;
  }, [vault, profile]);

  // Marque un PPV payé + crédite le chatteur (déclenché par le webhook Dropp en prod, ou manuellement ici)
  const markPaid = useCallback(async (messageId, fanId) => {
    const { data: msg } = await supabase.from("cvflow_messages").update({ unlocked: true }).eq("id", messageId).select().single();
    if (!msg) return;
    await supabase.from("cvflow_sales").insert({ agency_id: profile.agency_id, model_id: msg.model_id, fan_id: fanId, member_id: msg.sender_id, amount: msg.price });
    const fan = convs.find((c) => c.id === fanId);
    if (fan) await supabase.from("cvflow_fans").update({ spent: Number(fan.spent) + Number(msg.price) }).eq("id", fanId);
    loadChat(fanId); refresh();
  }, [profile, convs, loadChat, refresh]);

  // ---- CRUD ----
  const addModel = useCallback(async (name) => {
    const { data } = await supabase.from("cvflow_models").insert({ agency_id: profile.agency_id, name, tg_connected: true }).select().single();
    if (data) { await supabase.from("cvflow_vault_folders").insert({ model_id: data.id, name: "Script Livre", position: 0 }); refresh(); }
    return data?.id;
  }, [profile, refresh]);

  const addFolder = useCallback(async (modelId, name) => {
    await supabase.from("cvflow_vault_folders").insert({ model_id: modelId, name });
    refresh();
  }, [refresh]);

  const addMedia = useCallback(async (modelId, folderIdx, item) => {
    const folderId = vault[modelId][folderIdx].folderId;
    await supabase.from("cvflow_vault_items").insert({ folder_id: folderId, name: item.name, type: item.type, level: item.lvl, price: item.price, dropp_link: item.link || null });
    refresh();
  }, [vault, refresh]);

  const addScript = useCallback(async (modelId, command, title, body) => {
    await supabase.from("cvflow_scripts").insert({ model_id: modelId, command, title, body });
    refresh();
  }, [refresh]);

  const addFan = useCallback(async (modelId, name, source, tag) => {
    await supabase.from("cvflow_fans").insert({ model_id: modelId, agency_id: profile.agency_id, name, source: source || "tg", tag: tag || "new" });
    refresh();
  }, [profile, refresh]);

  const setPct = useCallback(async (userId, pct) => {
    setTeam((prev) => prev.map((u) => (u.id === userId ? { ...u, pct: parseInt(pct) || 0 } : u)));
    await supabase.from("cvflow_profiles").update({ pct: parseInt(pct) || 0 }).eq("id", userId);
  }, []);

  const addMember = useCallback(async ({ email, password, name, role, pct }) => {
    const { data: { session: s } } = await supabase.auth.getSession();
    const res = await fetch("/api/invite", { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${s?.access_token}` }, body: JSON.stringify({ email, password, name, role, pct }) });
    const out = await res.json();
    if (out.ok) refresh();
    return out.error || null;
  }, [refresh]);

  const saveFiche = useCallback(async (fanId, key, val) => {
    const fan = convs.find((c) => c.id === fanId); if (!fan) return;
    const fiche = { ...(fan.fiche || {}), [key]: val };
    setConvs((prev) => prev.map((c) => (c.id === fanId ? { ...c, fiche } : c)));
    await supabase.from("cvflow_fans").update({ fiche }).eq("id", fanId);
  }, [convs]);
  const saveNote = useCallback(async (fanId, val) => {
    setConvs((prev) => prev.map((c) => (c.id === fanId ? { ...c, notes: val } : c)));
    await supabase.from("cvflow_fans").update({ notes: val }).eq("id", fanId);
  }, []);
  const markRead = useCallback((fanId) => { setConvs((prev) => prev.map((c) => (c.id === fanId ? { ...c, unread: 0 } : c))); }, []);

  const value = {
    ready, loading, auth, profile, session, currentUser,
    signIn, signUp, logout,
    models, team, vault, scripts, convs, chats, salesLog, activeModel, setActiveModel,
    loadChat, sendMessage, sendVaultItem, markPaid, setPct, addMember, addMedia, addModel, addFolder, addScript, addFan, saveFiche, saveNote, markRead, refresh,
  };
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}
