"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import confetti from "canvas-confetti";
import { useStore } from "@/lib/store";

function fireConfetti() {
  try {
    const end = Date.now() + 900;
    const colors = ["#22c55e", "#16a34a", "#e5b769", "#3aa0e6"];
    (function frame() {
      confetti({ particleCount: 5, angle: 60, spread: 60, origin: { x: 0, y: 0.6 }, colors });
      confetti({ particleCount: 5, angle: 120, spread: 60, origin: { x: 1, y: 0.6 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
    confetti({ particleCount: 90, spread: 80, origin: { y: 0.5 }, colors });
  } catch (e) { /* no-op */ }
}

const WORKER = process.env.NEXT_PUBLIC_TG_WORKER_URL;
const WORKER_KEY = process.env.NEXT_PUBLIC_TG_WORKER_KEY;
function workerFetch(path, opts = {}) {
  return fetch(WORKER + path, { ...opts, headers: { "content-type": "application/json", "x-api-key": WORKER_KEY || "", ...(opts.headers || {}) } });
}

const STATUS_UI = {
  connected: ["● Telegram connecté", "text-acc"],
  connecting: ["◐ Connexion en cours…", "text-gold"],
  qr: ["◵ QR en attente de scan", "text-gold"],
  error: ["✕ Déconnecté / banni", "text-danger"],
  offline: ["○ Worker injoignable", "text-muted2"],
  idle: ["○ Non connecté", "text-muted2"],
};

// QR décoratif (repli quand le worker n'est pas encore branché)
function PlaceholderQR() {
  let cells = [];
  for (let y = 0; y < 21; y++) for (let x = 0; x < 21; x++) {
    const corner = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13);
    const on = corner ? ((x === 0 || x === 6 || y === 0 || y === 6 || (x > 1 && x < 5 && y > 1 && y < 5)) ? 1 : 0) : ((x * 7 + y * 3) % 2);
    if (on) cells.push(<rect key={x + "-" + y} x={x * 8} y={y * 8} width="8" height="8" />);
  }
  return <svg width="168" height="168" viewBox="0 0 168 168" style={{ background: "#fff", borderRadius: 10 }}><g fill="#0a0d0c">{cells}</g></svg>;
}

export default function Models() {
  const { models, convs, addModel, deleteModel, setActiveModel, setModelConnected, setDroppConfig } = useStore();
  const router = useRouter();
  const [droppModal, setDroppModal] = useState(null); // modèle en cours d'édition de clé Dropp
  const [droppInput, setDroppInput] = useState("");
  const [droppTip, setDroppTip] = useState("");
  const [droppSecret, setDroppSecret] = useState("");
  const [connect, setConnect] = useState(false);
  const [name, setName] = useState("");
  const [step, setStep] = useState("form");
  const [newId, setNewId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);
  const [qrImg, setQrImg] = useState(null);
  const [error, setError] = useState("");
  const [statusMap, setStatusMap] = useState({});
  const pollRef = useRef(null);

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  // Statut de connexion en direct pour chaque modèle (interrogé au worker)
  useEffect(() => {
    if (!WORKER || !models.length) return;
    let stop = false;
    const poll = async () => {
      const entries = await Promise.all(models.map(async (m) => {
        try { const r = await workerFetch("/status/" + m.id); const d = await r.json(); return [m.id, d.status || "offline"]; }
        catch (e) { return [m.id, "offline"]; }
      }));
      if (!stop) setStatusMap(Object.fromEntries(entries));
    };
    poll();
    const t = setInterval(poll, 5000);
    return () => { stop = true; clearInterval(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [models]);

  async function generate() {
    setBusy(true); setError(""); setQrImg(null);
    const id = await addModel(name || "Nouveau modèle");
    setBusy(false); setNewId(id); setStep("qr");
    fireConfetti();
    if (WORKER && id) startWorkerConnect(id);
  }

  // Reconnexion d'un modèle EXISTANT (ex: session tuée par Telegram) → force un QR neuf
  function reconnect(m) {
    setConnect(true); setStep("qr"); setName(m.name); setNewId(m.id); setQrImg(null); setError("");
    if (WORKER) startWorkerConnect(m.id, true);
  }

  async function startWorkerConnect(id, fresh) {
    try {
      await workerFetch("/connect", { method: "POST", body: JSON.stringify({ modelId: id, fresh: !!fresh }) });
    } catch (e) { setError("Worker injoignable. Vérifie qu'il tourne et que l'URL est correcte."); return; }
    let lastQr = "";
    pollRef.current = setInterval(async () => {
      try {
        const r = await workerFetch("/status/" + id);
        const s = await r.json();
        if (s.status === "qr" && s.qrUrl && s.qrUrl !== lastQr) {
          lastQr = s.qrUrl;
          setQrImg(await QRCode.toDataURL(s.qrUrl, { margin: 1, width: 220 }));
        }
        if (s.status === "connected") { clearInterval(pollRef.current); await setModelConnected(id, true); setStep("done"); setTimeout(closeConnect, 1600); }
        if (s.status === "error") { clearInterval(pollRef.current); setError(s.error || "Échec de la connexion Telegram."); }
      } catch (e) { /* transitoire */ }
    }, 2000);
  }

  async function markConnectedManual() {
    if (newId) await setModelConnected(newId, true);
    closeConnect();
  }
  function closeConnect() {
    if (pollRef.current) clearInterval(pollRef.current);
    setConnect(false); setStep("form"); setName(""); setNewId(null); setQrImg(null); setError("");
  }
  function openVault(id) { setActiveModel(id); router.push("/vault"); }

  return (
    <div className="p-6">
      <div className="flex items-center mb-4"><div className="text-xl font-extrabold">Modèles</div><div className="flex-1" /><button onClick={() => { setConnect(true); setStep("form"); }} className="btn px-4 py-2.5 font-bold">＋ Connecter un compte</button></div>

      {models.length === 0 ? (
        <div className="h-[50vh] flex flex-col items-center justify-center text-center gap-2"><div className="text-4xl opacity-40">👤</div><div className="font-bold text-lg">Aucun modèle</div><div className="text-muted text-sm">Connecte un compte Telegram pour commencer.</div></div>
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(310px,1fr))" }}>
          {models.map((m) => {
            const st = WORKER ? (statusMap[m.id] || "connecting") : (m.tg ? "connected" : "idle");
            const ui = STATUS_UI[st] || STATUS_UI.idle;
            const needsReconnect = WORKER && st !== "connected";
            return (
            <div key={m.id} className="card p-[18px]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg" style={{ background: `linear-gradient(135deg,${m.color},${m.c2 || "#0d9488"})` }}>{m.name[0]}</div>
                <div className="flex-1">
                  <div className="font-bold text-[15px]">{m.name}</div>
                  <div className={`text-[12px] flex items-center gap-1.5 mt-0.5 ${ui[1]}`}>{ui[0]}</div>
                </div>
                <button onClick={() => setConfirmDel(m)} className="w-8 h-8 rounded-lg bg-panel2 text-muted hover:text-danger flex items-center justify-center" title="Supprimer">🗑</button>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3.5">
                {[[convs.filter((c) => c.model_id === m.id).length, "Fans"], [m.ppv || 0, "PPV"], ["€0", "CA"]].map((s, i) => <div key={i} className="bg-bg2 rounded-lg p-2.5 text-center"><div className="text-base font-extrabold">{s[0]}</div><div className="text-[10px] text-muted uppercase mt-0.5">{s[1]}</div></div>)}
              </div>
              <div className="flex gap-2 mb-3.5">
                <div className="flex-1 flex items-center gap-1.5 bg-bg2 border border-line rounded-lg px-2 py-2 text-[11.5px]"><span className="w-2 h-2 rounded-full" style={{ background: m.tg ? "#22c55e" : "#5f6b66" }} /><span style={{ color: "#3aa0e6" }}>Telegram</span></div>
                <button onClick={() => { setDroppInput(""); setDroppSecret(""); setDroppTip(m.dropp_tip_link || ""); setDroppModal(m); }} className="flex-1 flex items-center gap-1.5 bg-bg2 border border-line rounded-lg px-2 py-2 text-[11.5px] hover:border-gold/50" title="Connecter la clé API Dropp Fans"><span className="w-2 h-2 rounded-full" style={{ background: m.dropp ? "#22c55e" : "#5f6b66" }} /><span style={{ color: "#e5b769" }}>Dropp {m.dropp ? "✓" : "＋"}</span></button>
              </div>
              {needsReconnect && <button onClick={() => reconnect(m)} className="w-full py-2 text-[12px] font-bold mb-2 rounded-[10px] text-white" style={{ background: "linear-gradient(135deg,#3aa0e6,#2a80c6)" }}>🔗 Reconnecter Telegram (scanner le QR)</button>}
              <div className="flex gap-2">
                <button onClick={() => router.push("/scripts")} className="btn-ghost flex-1 py-2 text-[12px] font-semibold">Scripts</button>
                <button onClick={() => openVault(m.id)} className="btn flex-1 py-2 text-[12px] font-bold">Coffre →</button>
              </div>
            </div>
            );
          })}
        </div>
      )}

      {connect && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={(e) => { if (e.target === e.currentTarget) closeConnect(); }}>
          <div className="card p-6 w-[500px] max-w-[92vw]">
            <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-extrabold">Connecter un compte modèle</h2><button onClick={closeConnect} className="w-[30px] h-[30px] rounded-lg bg-panel2 text-muted">✕</button></div>
            {step === "form" && <>
              <label className="text-xs text-muted font-semibold block mb-1.5">Nom du modèle</label>
              <input className="inp w-full px-3 py-2.5 mb-3" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Céline" />
              <label className="text-xs text-muted font-semibold block mb-1.5">Méthode de connexion Telegram</label>
              <select className="inp w-full px-3 py-2.5 mb-4"><option>Via QR code (recommandé)</option><option>Via numéro de téléphone</option></select>
              <button onClick={generate} disabled={busy} className="btn w-full py-2.5 font-bold disabled:opacity-50">{busy ? "…" : "Créer le modèle & afficher le QR"}</button>
            </>}
            {step === "qr" && <div className="text-center py-2">
              <div className="flex justify-center min-h-[176px] items-center">
                {WORKER ? (
                  error ? <div className="text-danger text-[13px] px-4">{error}</div>
                  : qrImg ? <img src={qrImg} width={220} height={220} alt="QR Telegram" style={{ borderRadius: 10, background: "#fff", padding: 8 }} />
                  : <div className="text-muted text-[13px]">Génération du QR en cours…</div>
                ) : <PlaceholderQR />}
              </div>
              <div className="text-[12.5px] text-muted mt-3">Sur le téléphone du modèle : <b className="text-txt">Telegram → Réglages → Appareils → Lier un appareil</b>, puis scanne ce QR.</div>
              {WORKER ? (
                <div className="text-[11.5px] text-muted2 mt-2">Le QR se rafraîchit automatiquement. La connexion est détectée dès le scan.</div>
              ) : (
                <>
                  <div className="text-[11.5px] text-muted2 mt-2 leading-relaxed">Le modèle « {name || "Nouveau modèle"} » est créé dans ton CRM. Une fois lié sur l'appareil, marque-le comme connecté.</div>
                  <div className="flex gap-2.5 mt-4">
                    <button onClick={closeConnect} className="btn-ghost flex-1 py-2.5 font-semibold">Plus tard</button>
                    <button onClick={markConnectedManual} className="btn flex-1 py-2.5 font-bold">✓ Compte lié</button>
                  </div>
                </>
              )}
              {WORKER && <button onClick={closeConnect} className="btn-ghost w-full py-2.5 font-semibold mt-4">Fermer</button>}
            </div>}
            {step === "done" && <div className="text-center py-8 text-acc font-bold text-lg">✓ {name || "Modèle"} connecté à Telegram</div>}
          </div>
        </div>
      )}

      {droppModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={(e) => { if (e.target === e.currentTarget) setDroppModal(null); }}>
          <div className="card p-6 w-[540px] max-w-[92vw] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3"><h2 className="text-lg font-extrabold">🟡 Connecter Dropp Fans · {droppModal.name}</h2><button onClick={() => setDroppModal(null)} className="w-[30px] h-[30px] rounded-lg bg-panel2 text-muted">✕</button></div>
            <div className="bg-bg2 border border-line rounded-xl p-3.5 mb-4 text-[12px] text-muted leading-relaxed">
              Connecte-toi sur <span className="text-gold">app.dropp.fans</span> → clique les <b className="text-txt">⋯</b> à côté de ton agence → <b className="text-txt">Paramètres → onglet API</b>. Tu y crées les deux éléments ci-dessous. Tout se colle ici, rien à faire ailleurs.
            </div>

            {/* 1) Clé API */}
            <label className="text-xs text-muted font-semibold block mb-1.5">1) Clé API {droppModal.dropp && <span className="text-acc font-bold">· déjà configurée ✓</span>}</label>
            <div className="bg-bg2 border border-line rounded-lg px-3 py-2 mb-2 text-[11.5px] text-muted2 leading-relaxed"><b className="text-txt">Create Key</b> → coche <span className="text-txt">content:read, orders:read, links:read, links:write, webhooks:read</span> → copie la clé <span className="font-mono text-gold">drp_live_…</span></div>
            <input className="inp w-full px-3 py-2.5 mb-4 font-mono text-[12px]" value={droppInput} onChange={(e) => setDroppInput(e.target.value)} placeholder={droppModal.dropp ? "•••••••••  (laisse vide pour garder l'actuelle)" : "drp_live_…"} />

            {/* 2) Secret du webhook */}
            <label className="text-xs text-muted font-semibold block mb-1.5">2) Secret du webhook {droppModal.dropphook && <span className="text-acc font-bold">· déjà configuré ✓</span>}</label>
            <div className="bg-bg2 border border-line rounded-lg px-3 py-2 mb-2 text-[11.5px] text-muted2 leading-relaxed">Même onglet API → <b className="text-txt">Webhook Endpoints → Add Endpoint</b>. URL à coller : <span className="font-mono text-gold break-all">https://cvflow-zeta.vercel.app/api/dropp/webhook</span>. Coche l'événement <b className="text-txt">order.paid</b>, crée-le, puis copie le <b className="text-txt">Signing secret</b> (affiché une seule fois) et colle-le ici. C'est ce qui fait remonter les paiements automatiquement.</div>
            <input className="inp w-full px-3 py-2.5 mb-4 font-mono text-[12px]" value={droppSecret} onChange={(e) => setDroppSecret(e.target.value)} placeholder={droppModal.dropphook ? "•••••••••  (laisse vide pour garder l'actuel)" : "whsec_…"} />

            {/* 3) Lien de pourboire */}
            <label className="text-xs text-muted font-semibold block mb-1.5">3) 💝 Lien de pourboire <span className="text-muted2 font-normal">(montant libre — facultatif)</span></label>
            <div className="bg-bg2 border border-line rounded-lg px-3 py-2 mb-2 text-[11.5px] text-muted2 leading-relaxed">Dropp → <b className="text-txt">Liens de paiement</b> → crée un lien <b className="text-txt">« Pourboire »</b> (sans prix fixe), copie son URL. Elle sert au bouton <b className="text-txt">Demande pourboire</b> des conversations.</div>
            <input className="inp w-full px-3 py-2.5 mb-4 font-mono text-[12px]" value={droppTip} onChange={(e) => setDroppTip(e.target.value)} placeholder="https://app.dropp.fans/external/donation/don_…" />

            <div className="flex gap-2.5">
              <button onClick={() => setDroppModal(null)} className="btn-ghost flex-1 py-2.5 font-semibold">Annuler</button>
              <button onClick={async () => { const id = droppModal.id; setDroppModal(null); await setDroppConfig(id, { key: droppInput.trim() || undefined, secret: droppSecret.trim() || undefined, tipLink: droppTip.trim() }); }} className="btn flex-1 py-2.5 font-bold">Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {confirmDel && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={(e) => { if (e.target === e.currentTarget) setConfirmDel(null); }}>
          <div className="card p-6 w-[440px] max-w-[92vw]">
            <div className="text-lg font-extrabold mb-2">Supprimer {confirmDel.name} ?</div>
            <div className="text-muted text-[13px] mb-5">Le modèle et tout son coffre, ses scripts, ses fans et messages seront supprimés définitivement.</div>
            <div className="flex gap-2.5">
              <button onClick={() => setConfirmDel(null)} className="btn-ghost flex-1 py-2.5 font-semibold">Annuler</button>
              <button onClick={async () => { const id = confirmDel.id; setConfirmDel(null); await deleteModel(id); }} className="flex-1 py-2.5 font-bold rounded-[10px]" style={{ background: "#ef5f5f", color: "#fff" }}>Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
