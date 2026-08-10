export const TYPE_ICON = { photo: "📷", video: "🎬", audio: "🎧", bundle: "🗂️" };
export const TAG_CLASS = {
  vip: "text-gold bg-gold/15", whale: "text-purple bg-purple/15", new: "text-acc bg-acc/15", cold: "text-muted bg-muted/15",
};
export function initials(n) { return n.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase(); }
export function eur(n) { return "€" + Number(n).toLocaleString("fr-FR"); }
function hash(s) { let h = 0; for (let i = 0; i < s.length; i++) { h = (h << 5) - h + s.charCodeAt(i); h |= 0; } return h; }
const THUMB = [["#f472b6", "#be185d"], ["#60a5fa", "#1e40af"], ["#34d399", "#065f46"], ["#fbbf24", "#b45309"], ["#a78bfa", "#6d28d9"], ["#f87171", "#991b1b"], ["#22d3ee", "#0e7490"], ["#fb923c", "#c2410c"]];
export function thumbBg(seed) { const c = THUMB[Math.abs(hash(seed)) % THUMB.length]; return `linear-gradient(135deg,${c[0]},${c[1]})`; }
