-- ============================================================
-- PHASE 3 — Marketplace
-- Ajouter APRÈS que la Phase 2 est stable en production
-- Nécessite l'extension PostGIS pour la géolocalisation
-- ============================================================

-- Activer PostGIS (à faire depuis le dashboard Supabase → Extensions)
-- CREATE EXTENSION IF NOT EXISTS postgis;

-- ── Référentiel des métiers ───────────────────────────────────

CREATE TABLE IF NOT EXISTS metiers (
  id     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug   text UNIQUE NOT NULL,          -- 'electricite', 'plomberie', 'cvc'
  label  text NOT NULL,                 -- 'Électricité', 'Plomberie', 'CVC'
  icone  text,                          -- emoji ou nom d'icône
  actif  boolean NOT NULL DEFAULT true
);

INSERT INTO metiers (slug, label, icone) VALUES
  ('electricite',   'Électricité',          '⚡'),
  ('plomberie',     'Plomberie',            '🔧'),
  ('cvc',           'Chauffage / Clim',     '🌡️'),
  ('second-oeuvre', 'Second œuvre',         '🏗️'),
  ('robotique',     'Automatisation',       '🤖'),
  ('serrurerie',    'Serrurerie',           '🔑'),
  ('menuiserie',    'Menuiserie / Vitrage', '🪟'),
  ('peinture',      'Peinture',             '🎨');

-- ── Profils publics ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS profiles_publics (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  uuid REFERENCES organizations(id) ON DELETE CASCADE,
  user_id          uuid REFERENCES auth.users(id) ON DELETE CASCADE, -- technicien indépendant
  slug             text UNIQUE NOT NULL,        -- installe.com/pro/marc-leroy
  nom_affiche      text NOT NULL,
  description      text,
  photo_url        text,
  telephone_public text,
  email_public     text,
  site_web         text,
  annee_creation   int,
  certifications   text[],                      -- ['RGIE', 'Qualibat', 'RGE']
  note_moyenne     numeric(3,2) DEFAULT 0,
  nb_avis          int NOT NULL DEFAULT 0,
  nb_missions      int NOT NULL DEFAULT 0,
  verifie          boolean NOT NULL DEFAULT false, -- badge vérifié installe.com
  featured         boolean NOT NULL DEFAULT false, -- emplacement sponsorisé
  actif            boolean NOT NULL DEFAULT true,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  CHECK (organization_id IS NOT NULL OR user_id IS NOT NULL)
);

-- ── Métiers par profil ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS profile_metiers (
  profile_id uuid NOT NULL REFERENCES profiles_publics(id) ON DELETE CASCADE,
  metier_id  uuid NOT NULL REFERENCES metiers(id) ON DELETE CASCADE,
  PRIMARY KEY (profile_id, metier_id)
);

-- ── Zones d'intervention (géographique) ──────────────────────

CREATE TABLE IF NOT EXISTS zones_intervention (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles_publics(id) ON DELETE CASCADE,
  label      text NOT NULL,               -- 'Namur et 30 km', 'Province de Liège'
  rayon_km   int,                         -- rayon en km autour d'un point central
  -- Utiliser geom quand PostGIS est activé :
  -- geom    geometry(Point, 4326),       -- point central (longitude, latitude)
  latitude   numeric(9,6),
  longitude  numeric(9,6),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ── Leads (demandes de devis entrants) ───────────────────────

CREATE TABLE IF NOT EXISTS leads (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metier_id    uuid REFERENCES metiers(id),
  description  text NOT NULL,
  adresse      text NOT NULL,
  ville        text NOT NULL,
  code_postal  text NOT NULL,
  latitude     numeric(9,6),
  longitude    numeric(9,6),
  urgence      text NOT NULL DEFAULT 'normal'
               CHECK (urgence IN ('urgent', 'normal', 'planifie')),
  -- Contact du demandeur (stocké chiffré si possible)
  contact_nom      text NOT NULL,
  contact_email    text NOT NULL,
  contact_tel      text,
  -- Statut
  statut       text NOT NULL DEFAULT 'ouvert'
               CHECK (statut IN ('ouvert', 'en_cours', 'attribue', 'expire', 'annule')),
  expire_at    timestamptz NOT NULL DEFAULT now() + interval '7 days',
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- ── Réponses aux leads ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS lead_responses (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id     uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  profile_id  uuid NOT NULL REFERENCES profiles_publics(id),
  message     text,
  montant_estime numeric(10,2),
  statut      text NOT NULL DEFAULT 'envoye'
              CHECK (statut IN ('envoye', 'accepte', 'refuse')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (lead_id, profile_id)
);

-- ── Avis clients ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS avis (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id   uuid NOT NULL REFERENCES profiles_publics(id) ON DELETE CASCADE,
  auteur_nom   text NOT NULL,
  note         int NOT NULL CHECK (note BETWEEN 1 AND 5),
  commentaire  text,
  verifie      boolean NOT NULL DEFAULT false,   -- avis vérifié (lié à une mission réelle)
  mission_id   uuid REFERENCES missions(id),
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- ── Featured slots (emplacements sponsorisés) ─────────────────

CREATE TABLE IF NOT EXISTS featured_slots (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id    uuid NOT NULL REFERENCES profiles_publics(id),
  metier_id     uuid REFERENCES metiers(id),
  zone_label    text,                     -- 'Namur', 'Province de Liège', 'Belgique'
  position      int NOT NULL DEFAULT 1,   -- 1 = première position
  prix_mensuel  numeric(10,2) NOT NULL,
  actif         boolean NOT NULL DEFAULT true,
  debut_at      timestamptz NOT NULL DEFAULT now(),
  fin_at        timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ── Index performance ─────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_leads_statut      ON leads(statut);
CREATE INDEX IF NOT EXISTS idx_leads_metier      ON leads(metier_id);
CREATE INDEX IF NOT EXISTS idx_leads_ville       ON leads(ville);
CREATE INDEX IF NOT EXISTS idx_avis_profile      ON avis(profile_id);
CREATE INDEX IF NOT EXISTS idx_featured_metier   ON featured_slots(metier_id) WHERE actif = true;
CREATE INDEX IF NOT EXISTS idx_profiles_slug     ON profiles_publics(slug) WHERE actif = true;

-- ── RLS ──────────────────────────────────────────────────────

-- Profils publics : lecture publique sans auth
ALTER TABLE profiles_publics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_publics_select_all" ON profiles_publics
  FOR SELECT USING (actif = true);

-- Leads : lecture par les pros matchant la zone
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "leads_select_auth" ON leads
  FOR SELECT TO authenticated USING (statut = 'ouvert');
CREATE POLICY "leads_insert_anon" ON leads
  FOR INSERT TO anon WITH CHECK (true);  -- visiteur non connecté peut créer un lead

-- Avis : lecture publique
ALTER TABLE avis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "avis_select_all" ON avis
  FOR SELECT USING (true);

-- ── Trigger : recalcul note moyenne ──────────────────────────

CREATE OR REPLACE FUNCTION update_note_moyenne()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles_publics
  SET
    note_moyenne = (SELECT AVG(note) FROM avis WHERE profile_id = NEW.profile_id),
    nb_avis      = (SELECT COUNT(*)  FROM avis WHERE profile_id = NEW.profile_id)
  WHERE id = NEW.profile_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER avis_update_note
  AFTER INSERT OR UPDATE OR DELETE ON avis
  FOR EACH ROW EXECUTE FUNCTION update_note_moyenne();
