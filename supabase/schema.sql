-- ============================================================
-- Campus Opportunity Hub — Supabase Schema
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- TABLE: opportunities
-- ============================================================

CREATE TABLE IF NOT EXISTS public.opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company TEXT NOT NULL,
  role TEXT NOT NULL,

  type TEXT CHECK (
    type IN (
      'placement',
      'internship',
      'hackathon',
      'scholarship',
      'campus_drive',
      'fellowship',
      'competition',
      'other'
    )
  ),

  salary TEXT,
  location TEXT,
  eligibility JSONB,
  skills TEXT[],
  responsibilities TEXT[],
  interview_process JSONB,
  instructions TEXT,
  apply_link TEXT,
  source_link TEXT,
  raw_text TEXT,
  deadline TIMESTAMPTZ,

  featured BOOLEAN DEFAULT false,
  is_expired BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,

  tags TEXT[],
  views_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- ============================================================
-- FULL TEXT SEARCH COLUMN
-- ============================================================

ALTER TABLE public.opportunities
ADD COLUMN IF NOT EXISTS fts_vector TSVECTOR;

UPDATE public.opportunities
SET fts_vector =
  to_tsvector(
    'english',
    coalesce(company,'') || ' ' ||
    coalesce(role,'') || ' ' ||
    coalesce(location,'') || ' ' ||
    coalesce(salary,'') || ' ' ||
    coalesce(array_to_string(skills, ' '),'') || ' ' ||
    coalesce(array_to_string(tags, ' '),'')
  );

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_opportunities_fts
ON public.opportunities
USING GIN (fts_vector);

CREATE INDEX IF NOT EXISTS idx_opportunities_type
ON public.opportunities (type);

CREATE INDEX IF NOT EXISTS idx_opportunities_published
ON public.opportunities (is_published, is_expired);

CREATE INDEX IF NOT EXISTS idx_opportunities_deadline
ON public.opportunities (deadline);

CREATE INDEX IF NOT EXISTS idx_opportunities_featured
ON public.opportunities (featured);

CREATE INDEX IF NOT EXISTS idx_opportunities_created_at
ON public.opportunities (created_at DESC);

-- ============================================================
-- TABLE: scrape_cache
-- ============================================================

CREATE TABLE IF NOT EXISTS public.scrape_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT UNIQUE NOT NULL,
  content TEXT,
  scraped_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_scrape_cache_url
ON public.scrape_cache (url);

CREATE INDEX IF NOT EXISTS idx_scrape_cache_expires
ON public.scrape_cache (expires_at);

-- ============================================================
-- TABLE: admin_logs
-- ============================================================

CREATE TABLE IF NOT EXISTS public.admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  opportunity_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_logs_admin
ON public.admin_logs (admin_id);

CREATE INDEX IF NOT EXISTS idx_admin_logs_created
ON public.admin_logs (created_at DESC);

-- ============================================================
-- FUNCTION: increment views
-- ============================================================

CREATE OR REPLACE FUNCTION public.increment_views(opp_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.opportunities
  SET views_count = views_count + 1
  WHERE id = opp_id;
END;
$$;

-- ============================================================
-- FUNCTION: updated_at trigger
-- ============================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================================
-- FUNCTION: fts trigger
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_fts_vector()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.fts_vector :=
    to_tsvector(
      'english',
      coalesce(NEW.company,'') || ' ' ||
      coalesce(NEW.role,'') || ' ' ||
      coalesce(NEW.location,'') || ' ' ||
      coalesce(NEW.salary,'') || ' ' ||
      coalesce(array_to_string(NEW.skills, ' '),'') || ' ' ||
      coalesce(array_to_string(NEW.tags, ' '),'')
    );

  RETURN NEW;
END;
$$;

-- ============================================================
-- TRIGGERS
-- ============================================================

DROP TRIGGER IF EXISTS trg_opportunities_updated_at ON public.opportunities;
DROP TRIGGER IF EXISTS trg_opportunities_fts ON public.opportunities;

CREATE TRIGGER trg_opportunities_updated_at
BEFORE UPDATE ON public.opportunities
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_opportunities_fts
BEFORE INSERT OR UPDATE ON public.opportunities
FOR EACH ROW
EXECUTE FUNCTION public.update_fts_vector();

-- ============================================================
-- FUNCTION: expire past deadlines
-- ============================================================

CREATE OR REPLACE FUNCTION public.expire_past_deadline()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.opportunities
  SET is_expired = true
  WHERE deadline < now()
    AND is_expired = false;
END;
$$;