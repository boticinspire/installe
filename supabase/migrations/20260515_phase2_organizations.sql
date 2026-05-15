-- ============================================================
-- PHASE 2 — Multi-tenant SaaS
-- Ajouter APRÈS que la Phase 1 est stable en production
-- ============================================================

-- ── Plans SaaS ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS saas_plans (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom          text NOT NULL,                        -- 'Free', 'Pro', 'Business'
  prix_mensuel numeric(10,2) NOT NULL DEFAULT 0,
  limite_missions_mois int,                          -- NULL = illimité
  limite_techniciens   int,
  features     jsonb NOT NULL DEFAULT '[]',          -- liste de features activées
  actif        boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now()
);

INSERT INTO saas_plans (nom, prix_mensuel, limite_missions_mois, limite_techniciens, features) VALUES
  ('Free',     0,     20,   2, '["fsm_basic", "rapports_pdf"]'),
  ('Pro',      49,    NULL, 10, '["fsm_basic", "rapports_pdf", "paiements", "profil_public", "leads_5"]'),
  ('Business', 149,   NULL, NULL, '["fsm_basic", "rapports_pdf", "paiements", "profil_public", "leads_illimite", "featured", "multi_site", "api_access"]');

-- ── Organizations (tenants) ───────────────────────────────────

CREATE TABLE IF NOT EXISTS organizations (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom          text NOT NULL,
  slug         text UNIQUE NOT NULL,               -- ex: "leroy-electricite"
  email        text,
  telephone    text,
  siret        text,
  logo_url     text,
  plan_id      uuid REFERENCES saas_plans(id),
  actif        boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- ── Membres d'une organization ────────────────────────────────

CREATE TYPE org_role AS ENUM ('owner', 'admin', 'member');

CREATE TABLE IF NOT EXISTS organization_members (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role            org_role NOT NULL DEFAULT 'member',
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, user_id)
);

-- ── Abonnements SaaS actifs ───────────────────────────────────

CREATE TABLE IF NOT EXISTS saas_subscriptions (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id     uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  plan_id             uuid NOT NULL REFERENCES saas_plans(id),
  statut              text NOT NULL DEFAULT 'active'  -- active | cancelled | past_due
                      CHECK (statut IN ('active', 'cancelled', 'past_due', 'trialing')),
  stripe_subscription_id text,
  current_period_start timestamptz,
  current_period_end   timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- ── Ajouter organization_id aux tables FSM existantes ─────────
-- ⚠️  À exécuter seulement quand les données Phase 1 sont migrées

ALTER TABLE missions      ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id);
ALTER TABLE clients       ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id);
ALTER TABLE sites         ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id);
ALTER TABLE rapports      ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id);
ALTER TABLE paiements     ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id);
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id);

-- Index pour les requêtes multi-tenant
CREATE INDEX IF NOT EXISTS idx_missions_org      ON missions(organization_id);
CREATE INDEX IF NOT EXISTS idx_clients_org       ON clients(organization_id);
CREATE INDEX IF NOT EXISTS idx_rapports_org      ON rapports(organization_id);

-- ── RLS multi-tenant ─────────────────────────────────────────
-- Policy type : l'utilisateur voit seulement les données de son organization

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE saas_subscriptions ENABLE ROW LEVEL SECURITY;

-- Un user voit les organizations dont il est membre
CREATE POLICY "org_members_select" ON organizations
  FOR SELECT USING (
    id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- Un user voit les membres de ses organizations
CREATE POLICY "org_members_members_select" ON organization_members
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- ── Trigger updated_at ───────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER saas_subscriptions_updated_at
  BEFORE UPDATE ON saas_subscriptions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
