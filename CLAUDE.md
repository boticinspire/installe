# CLAUDE.md

This file provides guidance to Claude when working with code in this repository.

## Project: Installe.com

Plateforme FSM (Field Service Management) évoluant vers un **marketplace de services techniques** (modèle moteurs.com appliqué aux métiers de l'installation/maintenance). Stack : Next.js / Supabase / Vercel / Cloudflare.

## Vision produit — 3 phases

| Phase | Description | Modèle économique |
|-------|-------------|-------------------|
| **Phase 1 — FSM** | Outil interne : missions, techniciens, rapports, paiements | Usage propre |
| **Phase 2 — SaaS** | D'autres entreprises gèrent leur activité sur installe.com | Abonnement mensuel (Free / Pro / Business) |
| **Phase 3 — Marketplace** | Particuliers et entreprises trouvent un technicien (leads entrants) | Abonnement + commission sur leads + featured listings |

## Infrastructure

| Service    | Détail                                              |
|------------|-----------------------------------------------------|
| Supabase   | Projet **"Installe"** — ID `zfurzynkwouenfcmgnos`  |
| Région     | `eu-central-1` (Frankfurt)                          |
| Vercel     | Connecté — `boticinspire/installe` → `installe.com` |
| Cloudflare | DNS configuré — proxy désactivé (DNS only)          |

## Variables d'environnement

```bash
NEXT_PUBLIC_SUPABASE_URL=https://zfurzynkwouenfcmgnos.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>
```

Ne jamais committer ces valeurs — utiliser `.env.local` (ignoré par git).

## Architecture de la base de données

### Flux métier central (Phase 1)
**Commande → Assignation → Intervention → Rapport → Paiement**

### Tables Phase 1 — FSM (existantes)

| Table                    | Rôle                                                              |
|--------------------------|-------------------------------------------------------------------|
| `users`                  | Profils (admin, dispatcher, technicien, client) liés à auth.users |
| `clients`                | Donneurs d'ordre                                                  |
| `sites`                  | Adresses d'intervention (N sites par client)                      |
| `missions`               | Interventions ponctuelles ou générées par un abonnement           |
| `mission_techniciens`    | Jointure N↔N missions/techniciens avec statut d'acceptation       |
| `mission_logs`           | Historique automatique des changements de statut (trigger SQL)    |
| `checklist_templates`    | Modèles de contrôle par métier                                    |
| `checklist_items`        | Items instanciés par mission                                      |
| `photos`                 | Preuves photo avec géolocalisation GPS                            |
| `intervention_parts`     | Matériel/consommables utilisés                                    |
| `rapports`               | Rapport PDF + signature client + statut de validation             |
| `paiements`              | Paiements ponctuels ou récurrents (Swan API)                      |
| `subscriptions`          | Contrats d'entretien récurrents                                   |
| `subscription_templates` | Catalogues d'abonnements réutilisables                            |

### Tables Phase 2 — Multi-tenant SaaS (à créer)

| Table                  | Rôle                                                                 |
|------------------------|----------------------------------------------------------------------|
| `organizations`        | Entreprises inscrites sur la plateforme (tenant principal)           |
| `organization_members` | Lien users ↔ organizations avec rôle (owner, admin, member)         |
| `saas_plans`           | Plans disponibles : Free / Pro / Business avec limites               |
| `saas_subscriptions`   | Abonnement SaaS actif par organization (lié à Stripe ou Swan)        |

### Tables Phase 3 — Marketplace (à créer)

| Table               | Rôle                                                                    |
|---------------------|-------------------------------------------------------------------------|
| `profiles_publics`  | Page vitrine publique par technicien ou entreprise                      |
| `metiers`           | Référentiel des métiers : électricité, plomberie, CVC, etc.             |
| `zones_intervention`| Zones géographiques couvertes par chaque technicien/entreprise          |
| `leads`             | Demandes de devis entrants (depuis le moteur de recherche public)       |
| `lead_responses`    | Réponses/devis envoyés par les pros à un lead                           |
| `avis`              | Avis clients après intervention (note + commentaire)                    |
| `featured_slots`    | Emplacements sponsorisés dans les résultats de recherche                |

### Points clés d'architecture

**Multi-tenant (Phase 2)**
- Toutes les tables FSM auront une colonne `organization_id` (FK → `organizations`)
- Le RLS isolera automatiquement les données par tenant via `organization_id`
- Un utilisateur peut appartenir à plusieurs organizations (ex: prestataire externe)

**Marketplace (Phase 3)**
- `profiles_publics` est la seule table accessible sans authentification (lecture publique)
- Le moteur de recherche utilisera PostGIS pour la géolocalisation (`zones_intervention.geom`)
- Les `leads` sont créés par des visiteurs non connectés → stockés avec email + téléphone seulement
- Un lead est visible par tous les pros matchant zone + métier, premier arrivé = premier servi (ou enchère si featured)

**Isolation des données**
- Phase 1 → `user_id` = clé d'isolation
- Phase 2 → `organization_id` = clé d'isolation (RLS policy : `organization_id = auth.jwt()->>'org_id'`)
- Phase 3 → données publiques sans isolation (profils, avis, leads entrants)

**Statuts de mission** : `draft → pending → assigned → in_progress → completed | cancelled`

**Paiement conditionnel** : créer un paiement uniquement après rapport `signed` ou `validated`.

### Rôles utilisateurs

| Rôle | Phase 1 | Phase 2 | Phase 3 |
|------|---------|---------|---------|
| `admin` | Accès complet | Owner d'une organization | Gère son profil public |
| `dispatcher` | Crée et assigne missions | Idem, scope organization | — |
| `technicien` | Remplit checklist/rapport | Idem, scope organization | Profil public + reçoit leads |
| `client` | Lecture missions/rapports | Idem | Dépose un lead, laisse un avis |
| `superadmin` | — | Gère toutes les organizations | Modération marketplace |

## Structure des pages (Next.js App Router)

```
src/app/
├── (dashboard)/          # Espace connecté (FSM)
│   ├── dispatch/         # Vue dispatcher ✅
│   ├── technicien/       # Vue technicien ✅
│   ├── nouvelle-mission/ # Formulaire 3 étapes ✅
│   ├── rapport/          # Rapport intervention ✅
│   └── paiement/         # Paiement SEPA/Payconiq ✅
├── (marketplace)/        # Espace public (Phase 3)
│   ├── recherche/        # Moteur recherche techniciens
│   ├── pro/[slug]/       # Profil public d'un pro
│   └── devis/            # Formulaire lead entrant
├── (auth)/               # Auth
│   ├── login/
│   └── register/
└── page.tsx              # Redirect → /dispatch
```

## Commandes

```bash
# Développement local
npm run dev

# Build production
npm run build

# Linting
npm run lint

# Générer les types TypeScript depuis Supabase
npx supabase gen types typescript --project-id zfurzynkwouenfcmgnos > src/types/supabase.ts
```

## État du projet

### Infrastructure ✅
- [x] Projet Supabase créé (`zfurzynkwouenfcmgnos`)
- [x] Schéma BDD Phase 1 appliqué (14 tables + RLS + trigger)
- [x] Clés Supabase configurées dans Vercel
- [x] Projet Next.js initialisé (App Router, TypeScript, Tailwind v4)
- [x] Repo GitHub `boticinspire/installe` connecté à Vercel
- [x] DNS Cloudflare configuré → installe.com live

### Pages FSM ✅
- [x] Dashboard Dispatch (`/dispatch`)
- [x] Vue Technicien (`/technicien`)
- [x] Nouvelle Mission formulaire 3 étapes (`/nouvelle-mission`)
- [x] Rapport d'intervention (`/rapport`)
- [x] Paiement SEPA / Payconiq (`/paiement`)

### À faire — Phase 1 (FSM connecté à Supabase)
- [ ] Pages auth : login / register / reset password
- [ ] Connexion réelle Supabase (remplacer les données mock)
- [ ] RLS policies fines par rôle
- [ ] Upload photos vers Supabase Storage
- [ ] Génération PDF rapport (Edge Function)
- [ ] Edge Function : génération missions récurrentes
- [ ] Intégration Swan API (paiements réels)

### À faire — Phase 2 (SaaS multi-tenant)
- [ ] Migration BDD : ajouter `organizations` + `organization_members` + `saas_plans` + `saas_subscriptions`
- [ ] Ajouter `organization_id` à toutes les tables FSM existantes
- [ ] RLS multi-tenant via JWT claims
- [ ] Onboarding inscription entreprise
- [ ] Dashboard superadmin
- [ ] Intégration Stripe (abonnements SaaS)

### À faire — Phase 3 (Marketplace)
- [ ] Migration BDD : `profiles_publics` + `metiers` + `zones_intervention` + `leads` + `avis` + `featured_slots`
- [ ] Activer PostGIS sur Supabase pour la géolocalisation
- [ ] Moteur de recherche public (`/recherche`)
- [ ] Profils publics (`/pro/[slug]`)
- [ ] Formulaire lead entrant (`/devis`)
- [ ] Système d'avis et notation
- [ ] Featured listings (emplacements sponsorisés)
