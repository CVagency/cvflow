"use client";
import { createContext, useContext, useState, useCallback } from "react";
import { MODELS, TEAM, VAULT, SCRIPTS, seedConvs, seedChats } from "./seed";

const StoreCtx = createContext(null);
export const useStore = () => useContext(StoreCtx);

export const ROLE_VIEWS = {
  ADMIN: ["dashboard", "conversations", "analytics", "plannings", "scripts", "models", "vault", "employees", "settings"],
  CHATTER: ["conversations", "plannings"],
};

function now() {
  const d = new Date();
  return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
}

export function StoreProvider({ children }) {
  const [auth, setAuth] = useState(null); // {userId, role}
  const [currentUser, setCurrentUser] = useState("tia");
  const [team, setTeam] = useState(() => JSON.parse(JSON.stringify(TEAM)));
  const [models, setModels] = useState(() => JSON.parse(JSON.stringify(MODELS)));
  const [vault, setVault] = useState(() => JSON.parse(JSON.stringify(VAULT)));
  const [scripts] = useState(() => JSON.parse(JSON.stringify(SCRIPTS)));
  const [convs, setConvs] = useState(() => seedConvs());
  const [chats, setChats] = useState(() => seedChats());
  const [salesLog, setSalesLog] = useState([]);
  const [activeModel, setActiveModel] = useState("ange");

  const login = useCallback((userId) => {
    const u = team.find((t) => t.id === userId) || team[0];
    setAuth({ userId: u.id, role: u.role });
    setCurrentUser(u.id);
  }, [team]);
  const logout = useCallback(() => setAuth(null), []);

  const sendMessage = useCallback((convId, text) => {
    setChats((prev) => ({ ...prev, [convId]: [...(prev[convId] || []), { t: "out", x: text, time: now(), by: currentUser }] }));
    setConvs((prev) => prev.map((c) => (c.id === convId ? { ...c, last: text.slice(0, 32), time: now(), unread: 0 } : c)));
    // NOTE: Phase 2 → relay to Telegram worker here (POST /api/telegram/send)
  }, [currentUser]);

  const sendVaultItem = useCallback((convId, modelId, folderIdx, itemIdx) => {
    const it = vault[modelId][folderIdx].items[itemIdx];
    const folder = vault[modelId][folderIdx].folder;
    const msg = { t: "ppv", name: it.name, type: it.type, price: it.free ? 0 : it.price, folder, lvl: it.lvl, unlocked: !!it.free, by: currentUser, time: now(), link: it.link || "" };
    setChats((prev) => ({ ...prev, [convId]: [...(prev[convId] || []), msg] }));
    setConvs((prev) => prev.map((c) => (c.id === convId ? { ...c, last: (it.free ? "📎 " : "💰 ") + it.name, time: now() } : c)));
    if (!it.free) {
      // Phase 3 → real unlock comes from Dropp payment webhook. Here we simulate after 2.6s.
      setTimeout(() => registerSale(convId, it.price, it.name), 2600);
    }
  }, [vault, currentUser]);

  const registerSale = useCallback((convId, price, itemName) => {
    setChats((prev) => {
      const arr = [...(prev[convId] || [])];
      for (let i = arr.length - 1; i >= 0; i--) {
        if (arr[i].t === "ppv" && !arr[i].unlocked && arr[i].name === itemName) { arr[i] = { ...arr[i], unlocked: true }; break; }
      }
      return { ...prev, [convId]: arr };
    });
    setTeam((prev) => prev.map((u) => (u.id === currentUser ? { ...u, sales: u.sales + 1, ca: u.ca + price } : u)));
    setConvs((prev) => prev.map((c) => (c.id === convId ? { ...c, spent: c.spent + price } : c)));
    setSalesLog((prev) => [...prev, { user: currentUser, fan: convId, price, item: itemName, time: now() }]);
  }, [currentUser]);

  const setPct = useCallback((userId, pct) => {
    setTeam((prev) => prev.map((u) => (u.id === userId ? { ...u, pct: parseInt(pct) || 0 } : u)));
  }, []);

  const addMember = useCallback((m) => {
    const colors = ["#8b5cf6", "#06b6d4", "#f43f5e", "#84cc16"];
    setTeam((prev) => [...prev, { id: "u" + prev.length, models: ["ange", "lily", "lola"], msgs: 0, sales: 0, ca: 0, hours: 0, rt: "—", online: false, color: colors[prev.length % 4], ...m }]);
  }, []);

  const addMedia = useCallback((modelId, folderIdx, item) => {
    setVault((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      copy[modelId][folderIdx].items.push({ ...item, free: item.price === 0 });
      copy[modelId][folderIdx].items.sort((a, b) => a.lvl - b.lvl);
      return copy;
    });
  }, []);

  const addModel = useCallback((name) => {
    const id = "m" + Date.now();
    setModels((prev) => [...prev, { id, name, fans: 0, ca30: 0, ppv: 0, conv: 0, wa: false, tg: true, dropp: false, color: "#8b5cf6", c2: "#6d28d9" }]);
    setVault((prev) => ({ ...prev, [id]: [{ folder: "Script Livre", items: [{ lvl: 1, name: "Accroche", type: "photo", price: 0, free: true, link: "" }] }] }));
    return id;
  }, []);

  const saveFiche = useCallback((convId, key, val) => {
    setConvs((prev) => prev.map((c) => (c.id === convId ? { ...c, fiche: { ...c.fiche, [key]: val } } : c)));
  }, []);
  const saveNote = useCallback((convId, val) => {
    setConvs((prev) => prev.map((c) => (c.id === convId ? { ...c, notes: val } : c)));
  }, []);
  const markRead = useCallback((convId) => {
    setConvs((prev) => prev.map((c) => (c.id === convId ? { ...c, unread: 0 } : c)));
  }, []);

  const value = {
    auth, login, logout, currentUser, setCurrentUser,
    team, models, vault, scripts, convs, chats, salesLog, activeModel, setActiveModel,
    sendMessage, sendVaultItem, setPct, addMember, addMedia, addModel, saveFiche, saveNote, markRead,
  };
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}
