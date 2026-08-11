# CVFLOW — CRM de chatting Telegram pour agences

App Next.js (App Router) + Tailwind + Supabase. Coffre média connecté à Dropp, scripts par modèle, attribution des ventes au chatteur, rôles admin/chatteur, analytics, planning, employés à commission. **CRM 100 % Telegram.**

## Statut du build

**Fonctionnel** — vraie authentification, base de données Supabase (Postgres + RLS multi-agences), données persistantes. Tout est neutre par défaut : chaque agence construit ses propres modèles, coffres, fans et plannings.

- Login + rôles (Admin voit tout · Chatteur voit seulement Conversations + Planning)
- Conversations : inbox Telegram, Coffre média avec aperçu + envoi 1 clic, scripts en `/`, emojis, fiche fan
- Attribution des ventes au chatteur connecté (crédité automatiquement)
- Coffre média (manager) : dossiers ordonnés par niveau, ajout média = coller le lien Dropp ; un média peut combiner plusieurs types (photo + vidéo + audio)
- Modèles : connexion Telegram par QR code, fiche persona
- Employés : rôle + commission % éditables → part = CA × %
- Planning : créneaux (shifts) réels par chatteur, récap heures/CA
- Analytics : revenu par période, classement des modèles, top fans

**À venir** — Telegram réel via un worker Node (GramJS/MTProto) + proxy FR ; webhook Dropp `payment.succeeded` qui déverrouille et attribue automatiquement le PPV.

## Lancer en local

```bash
npm install
npm run dev        # http://localhost:3000
```

## Configurer Supabase

1. Créer un projet sur supabase.com.
2. SQL Editor → coller `supabase/schema.sql` → Run (idempotent, réexécutable).
3. Renseigner les variables d'environnement :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (secrète — sert à créer les comptes membres côté serveur)

## Déployer sur Vercel

1. Pousser ce dossier sur un repo GitHub.
2. Sur vercel.com → **Add New → Project → Import** le repo. Framework détecté : Next.js.
3. Ajouter les 3 variables d'environnement ci-dessus → Deploy.

## Architecture Telegram (à venir)

Vercel serverless ne peut pas tenir une connexion MTProto permanente → un **worker Node séparé** (Railway/Fly/VPS) avec GramJS :
- tient la session Telegram par modèle + proxy FR (anti-ban),
- expose `POST /send` (le CRM appelle quand un chatteur envoie),
- écoute les messages entrants → écrit dans Supabase (`cvflow_messages`) → le CRM les affiche en temps réel (Supabase Realtime).

## Dropp

- L'agence crée les liens payants sur Dropp et les colle dans le Coffre (`cvflow_vault_items.dropp_link`).
- Webhook Dropp `payment.succeeded` → insère dans `cvflow_sales` avec le `member_id` du chatteur qui a envoyé → déverrouille le PPV et crédite le bon chatteur.
