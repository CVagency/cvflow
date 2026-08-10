# CVFLOW — CRM de chatting WhatsApp & Telegram pour agences

App Next.js (App Router) + Tailwind. Coffre média connecté à Dropp, scripts par modèle, attribution des ventes au chatteur, rôles admin/chatteur, analytics, planning, employés à commission.

## Statut du build

**Phase 1 (ce repo)** — app fonctionnelle en mode démo (données locales dans le navigateur, aucune dépendance externe requise pour tourner). Structure prête à brancher Supabase.

- Login + rôles (Admin voit tout · Chatteur voit seulement Conversations + Planning)
- Conversations : inbox unifiée, Coffre média avec aperçu + envoi 1 clic, scripts en `/`, emojis, fiche fan
- Attribution des ventes au chatteur connecté
- Coffre média (manager) : dossiers ordonnés, ajout média = coller le lien Dropp
- Modèles : connexion Telegram par QR (simulée), fiche persona
- Employés : commission % éditable → part = CA × %
- Analytics, Planning (récap heures/CA par chatteur)

**Phase 2 (à venir)** — Telegram réel via un worker Node (GramJS/MTProto) + proxy FR, WhatsApp Business API.
**Phase 3 (à venir)** — Dropp : liens collés dans le coffre + webhook de paiement qui déverrouille et attribue automatiquement.

## Lancer en local

```bash
npm install
npm run dev        # http://localhost:3000
```

Connexion démo : **Admin** (Corentin) ou **Chatteur** (Tiana).

## Déployer sur Vercel

1. Pousser ce dossier sur un repo GitHub.
2. Sur vercel.com → **Add New → Project → Import** le repo. Framework détecté : Next.js. Deploy.
3. (Optionnel Phase 2) ajouter les variables d'environnement `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Brancher Supabase (Phase 2)

1. Créer un projet sur supabase.com.
2. SQL Editor → coller `supabase/schema.sql` → Run.
3. Renseigner `.env.local` à partir de `.env.example`.
4. Remplacer les lectures/écritures du store (`lib/store.js`) par des requêtes Supabase (les points d'accroche sont commentés `// Phase 2`).

## Architecture Telegram (Phase 2)

Vercel serverless ne peut pas tenir une connexion MTProto permanente → un **worker Node séparé** (Railway/Fly/VPS) avec GramJS :
- tient la session Telegram par modèle + proxy FR (anti-ban),
- expose `POST /send` (le CRM appelle quand un chatteur envoie),
- écoute les messages entrants → écrit dans Supabase (`messages`) → le CRM les affiche en temps réel (Supabase Realtime).

## Dropp (Phase 3)

- L'agence crée les liens payants sur Dropp et les colle dans le Coffre (`vault_items.dropp_link`).
- Webhook Dropp `payment.succeeded` → insère dans `sales` avec le `member_id` du chatteur qui a envoyé → déverrouille le PPV et crédite le bon chatteur.
