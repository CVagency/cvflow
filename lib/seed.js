// Seed data — mirrors the prototype. In Phase 2 this is replaced by Supabase queries.
export const MODELS = [
  { id: "ange", name: "Ange", fans: 124, ca30: 3820, ppv: 38, conv: 11, wa: true, tg: true, dropp: true, color: "#22c55e", c2: "#0d9488" },
  { id: "lily", name: "Lily", fans: 206, ca30: 6140, ppv: 57, conv: 14, wa: true, tg: true, dropp: true, color: "#3aa0e6", c2: "#6366f1" },
  { id: "lola", name: "Lola", fans: 88, ca30: 2190, ppv: 21, conv: 9, wa: false, tg: true, dropp: false, color: "#a78bfa", c2: "#db2777" },
];

export const TEAM = [
  { id: "cor", name: "Corentin Villacreces", email: "cvagency33@gmail.com", role: "ADMIN", models: ["ange", "lily", "lola"], pct: 0, msgs: 457, sales: 34, ca: 4210, hours: 12, rt: "2m", online: true, color: "#0d9488" },
  { id: "tia", name: "Tiana", email: "tiana@cvagency.com", role: "CHATTER", models: ["ange", "lily", "lola"], pct: 8, msgs: 389, sales: 22, ca: 2890, hours: 38, rt: "3m", online: true, color: "#e879a6" },
  { id: "mah", name: "Mahery", email: "mahery@cvagency.com", role: "CHATTER", models: ["lily", "lola"], pct: 7, msgs: 301, sales: 18, ca: 2140, hours: 31, rt: "4m", online: false, color: "#f59e0b" },
];

export const VAULT = {
  ange: [
    { folder: "Script Livre", items: [
      { lvl: 1, name: "Accroche photo", type: "photo", price: 0, free: true, link: "" },
      { lvl: 2, name: "Photo teasing", type: "photo", price: 12, link: "" },
      { lvl: 3, name: "Vidéo courte", type: "video", price: 20, link: "" },
      { lvl: 4, name: "Vidéo HOT", type: "video", price: 35, link: "" },
      { lvl: 5, name: "Bundle complet", type: "bundle", price: 55, link: "" },
    ]},
    { folder: "Douche", items: [
      { lvl: 1, name: "Entrée douche", type: "photo", price: 0, free: true, link: "" },
      { lvl: 2, name: "Sous la douche", type: "video", price: 25, link: "" },
      { lvl: 3, name: "Douche complète", type: "video", price: 40, link: "" },
    ]},
    { folder: "Vocaux", items: [
      { lvl: 1, name: "Audio coquin", type: "audio", price: 10, link: "" },
      { lvl: 2, name: "Audio persuasion", type: "audio", price: 15, link: "" },
    ]},
  ],
  lily: [
    { folder: "Script Livre", items: [
      { lvl: 1, name: "Accroche", type: "photo", price: 0, free: true, link: "" },
      { lvl: 2, name: "Lingerie rose", type: "photo", price: 15, link: "" },
      { lvl: 3, name: "Vidéo lit", type: "video", price: 29, link: "" },
      { lvl: 4, name: "Custom premium", type: "video", price: 49, link: "" },
    ]},
    { folder: "Bain", items: [
      { lvl: 1, name: "Dans le bain", type: "photo", price: 0, free: true, link: "" },
      { lvl: 2, name: "Bain moussant", type: "video", price: 30, link: "" },
    ]},
  ],
  lola: [
    { folder: "Script Livre", items: [
      { lvl: 1, name: "Accroche", type: "photo", price: 0, free: true, link: "" },
      { lvl: 2, name: "Teasing", type: "photo", price: 12, link: "" },
    ]},
  ],
};

export const SCRIPTS = {
  ange: [
    ["/accroche", "Accroche", "Heyy 😍 trop contente que tu sois là, tu fais quoi de beau ?"],
    ["/ppv", "Vente PPV", "Mmmh j'ai filmé un truc rien que pour toi bébé… tu veux voir ? 🙈🔥"],
    ["/relance", "Relance", "Tu me manques… reviens me parler 🥺"],
    ["/merci", "Remerciement", "Mmmh merci mon amour 😘 t'es le meilleur"],
    ["/tip", "Demande de tip", "Si tu m'aimes vraiment, gâte-moi un peu 😇💸"],
  ],
  lily: [
    ["/accroche", "Accroche", "Coucou toi 🥰 ça me fait plaisir que tu m'écrives"],
    ["/ppv", "Vente PPV", "J'ai un contenu de fou pour toi… tu oses regarder ? 🔥"],
  ],
  lola: [["/accroche", "Accroche", "Hey 😘 enfin toi !"]],
};

const NAMES = [
  ["Jérémie", "Oui très bien merci et toi", "20:29", 3, "vip", 1240, "wa"],
  ["Arnaud Loir", "En fait le résilié est très bien port…", "16:30", 2, "whale", 3890, "tg"],
  ["Bruno Tichy", "Résille rose magnifique 😍", "16:14", 1, "vip", 760, "wa"],
  ["Daniel", "Oui et toi", "14:01", 4, "new", 0, "tg"],
  ["Dany Lemaire", "Merci mon cœur ❤️", "13:59", 0, "vip", 540, "wa"],
  ["Kris Mld", "Oui ça va et toi ?", "13:54", 1, "new", 85, "tg"],
  ["Philippe", "Philippe et toi", "13:48", 1, "cold", 0, "wa"],
  ["Decaen", "Oui ma chérie ta une photo…", "13:52", 2, "whale", 2100, "wa"],
  ["Marc D.", "tu fais quoi ce soir 😏", "12:40", 1, "vip", 430, "tg"],
  ["Sofiane", "ok je regarde le lien", "11:20", 0, "new", 60, "wa"],
];
const COLS = ["#e11d48", "#7c3aed", "#0891b2", "#16a34a", "#db2777", "#ea580c", "#4f46e5", "#dc2626", "#d97706", "#0d9488"];
export function seedConvs() {
  return NAMES.map((n, i) => ({
    id: "c" + i, name: n[0], last: n[1], time: n[2], unread: n[3], tag: n[4], spent: n[5], src: n[6], color: COLS[i],
    fiche: { age: "", location: "", job: "", relationship: "", interests: "", budget: "", timezone: "" }, notes: i === 1 ? "Gros dépensier, répond vite le soir." : "",
  }));
}
export function seedChats() {
  return {
    c0: [{ t: "in", x: "Coucou toi 😊", time: "20:20" }, { t: "out", x: "Heyy 😍 tu fais quoi de beau ?", time: "20:22", by: "tia" }, { t: "in", x: "Oui très bien merci et toi", time: "20:29" }],
    c1: [{ t: "in", x: "Salut ma belle", time: "16:10" }, { t: "ppv", name: "Vidéo HOT", type: "video", price: 35, folder: "Script Livre", lvl: 4, unlocked: true, by: "tia", time: "16:20" }],
  };
}
