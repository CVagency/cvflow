# CVFLOW — Worker Telegram (vraie connexion MTProto)

Ce worker fait ce que Vercel **ne peut pas** faire : tenir une connexion Telegram permanente par compte modèle, afficher un vrai QR de connexion, recevoir et envoyer les messages, et tout écrire dans Supabase (que le CRM lit en temps réel).

## Ce dont tu as besoin (les 2 seules choses que je ne peux pas créer à ta place)

1. **Identifiants API Telegram** — gratuits, 5 min :
   - Va sur https://my.telegram.org → connecte-toi avec le **numéro du compte** → **API development tools**
   - Crée une app (n'importe quel nom) → note **api_id** et **api_hash**
2. **Un hébergeur toujours allumé** (Vercel ne convient pas). Le plus simple : **Railway** ou **Render** (déploiement depuis GitHub en quelques clics, offre gratuite pour tester).

## Étapes

### 1) Base de données
Dans Supabase → SQL Editor, exécute `schema-additions.sql` (ajoute les colonnes `tg_session`, `tg_proxy`, `tg_user_id`).

### 2) Déploie le worker
Pousse ce dossier sur un repo GitHub, puis sur **Railway** : New Project → Deploy from GitHub → choisis le repo. Railway détecte le `Dockerfile`. Ajoute les variables d'environnement (voir `.env.example`) :
- `API_ID`, `API_HASH` (étape ci-dessus)
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (mêmes que le CRM)
- `WORKER_API_KEY` (invente une longue chaîne aléatoire — la même sera mise côté CRM)

Railway te donne une URL publique (ex: `https://cvflow-worker.up.railway.app`).

### 3) Relie le CRM au worker
Dans Vercel (projet CVFLOW) → Settings → Environment Variables, ajoute :
- `NEXT_PUBLIC_TG_WORKER_URL` = l'URL Railway
- `NEXT_PUBLIC_TG_WORKER_KEY` = la même valeur que `WORKER_API_KEY`

Redéploie le CRM. Le bouton « Connecter un compte » affichera alors le **vrai** QR : le modèle le scanne depuis Telegram (Réglages → Appareils → Lier un appareil), et dès qu'il est lié, ses conversations remontent dans CVFLOW.

## API exposée
- `POST /connect { modelId }` → démarre la connexion, renvoie `{status, qrUrl}`
- `GET /status/:modelId` → `{status: idle|connecting|qr|connected|error, qrUrl, error}`
- `POST /send { modelId, tgUserId, text }` → envoie un message
- `POST /disconnect { modelId }`
- `GET /health`

Toutes les routes (sauf `/health`) exigent l'en-tête `x-api-key: <WORKER_API_KEY>`.

## ⚠️ Anti-ban (important pour une agence)
Brancher un compte modèle réel sur un nouveau serveur = risque de blocage Telegram. Bonnes pratiques :
- Renseigne un **proxy résidentiel FR** par modèle dans `cvflow_models.tg_proxy` (le worker l'utilise) — idéalement l'IP habituelle du compte.
- Désactive la **double authentification (2FA)** sur le compte, ou ajoute la gestion du mot de passe dans `signInUserWithQrCode`.
- Ne connecte pas 10 comptes d'un coup depuis la même IP.
- Garde le worker allumé en continu (une reconnexion permanente est plus saine que des connexions/déconnexions répétées).
