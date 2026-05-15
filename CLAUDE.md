# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: Installe.com

Plateforme FSM (Field Service Management) pour la gestion d'interventions techniques et contrats d'entretien récurrents. Stack : Next.js / Supabase / Vercel / Cloudflare.

## Infrastructure

| Service    | Détail                                              |
|------------|-----------------------------------------------------|
| Supabase   | Projet **"Installe"** — ID `zfurzynkwouenfcmgnos`  |
| Région     | `eu-central-1` (Frankfurt)                          |
| Vercel     | À connecter (Next.js)                               |
| Cloudflare | DNS pour `installe.com` — à configurer              |

## Variables d'environnement

```bash
NEXT_PUBLIC_SUPABASE_URL=https://zfurzynkwouenfcmgnos.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>
```

Ne jamais committer ces valeurs — utiliser `.env.local` (ignoré par git).

## Architecture de la base de données

Le flux métier central : **Commande → Assignation → Intervention → Rapport → Paiement**

### Tables principales

| Table                    | Rôle                                                              |
|--------------------------|-------------------------------------------------------------------|
| `users`                  | Profils (admin, dispatcher, technicien, client) liés à auth.users |
| `clients`                | Donneurs d'ordre                                                  |
| `sites`                  | Adresses d'intervention (N sites par client)                      |
| `missions`               | Interventions ponctuelles ou générées par un abonnement           |
| `mission_techniciens`    | Jointure N↔N missions/techniciens avec statut d'acceptation       |
| `mission_logs`           | Historique automatique des changements de statut (trigger SQL)    |
| `checklist_templates`    | Modèles de contrôle par métier                                    |
| `checklist_items`        | Items instanciés par mission (copie du label au moment de création)|
| `photos`                 | Preuves photo avec géolocalisation GPS                            |
| `intervention_parts`     | Matériel/consommables utilisés (pour facturation précise)         |
| `rapports`               | Rapport PDF + signature client + statut de validation             |
| `paiements`              | Paiements ponctuels ou récurrents (intégration Swan API)          |
| `subscriptions`          | Contrats d'entretien récurrents (moteur de génération de missions) |
| `subscription_templates` | Catalogues d'abonnements réutilisables                            |

### Points clés d'architecture

- **Multi-site** : `CLIENTS` → `SITES` → `MISSIONS`. Lier toujours la mission au site, pas juste au client.
- **Récurrence** : `subscriptions.next_intervention_at` pilote la génération automatique de missions. Un job (Edge Function ou cron) crée les missions quand la date approche.
- **Statuts de mission** : `draft → pending → assigned → in_progress → completed | cancelled`. Chaque transition est loggée automatiquement via trigger dans `mission_logs`.
- **Paiement conditionnel** : Le paiement ne doit être créé qu'après un rapport en statut `signed` ou `validated`.
- **Checklist** : Le `label` est copié dans `checklist_items` à la création pour préserver l'historique si le template évolue.
- **RLS activé** sur toutes les tables. Les policies fines par rôle sont à implémenter après le MVP admin.

### Rôles utilisateurs

- `admin` : accès complet
- `dispatcher` : crée et assigne les missions
- `technicien` : voit ses missions assignées, remplit checklist/photos/rapport
- `client` : accès lecture à ses missions et rapports

## Commandes

```bash
# Développement local
npm run dev

# Build production
npm run build

# Linting
npm run lint

# Générer les types TypeScript depuis Supabase
npx supabase gen types typescript --project-id zfurzynkwouenfcmgnos > types/supabase.ts
```

## État du projet

- [x] Projet Supabase créé (`zfurzynkwouenfcmgnos`)
- [x] Schéma base de données appliqué (14 tables + RLS + trigger)
- [ ] Clés Supabase récupérées et configurées dans Vercel
- [ ] Projet Next.js initialisé et lié à Vercel
- [ ] DNS Cloudflare configuré pour installe.com
- [ ] Policies RLS fines par rôle (technicien, dispatcher, client)
- [ ] Edge Function : génération automatique des missions récurrentes
- [ ] Intégration Swan API (paiements)
