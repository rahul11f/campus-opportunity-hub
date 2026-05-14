-- ============================================================
-- Campus Opportunity Hub — Row Level Security Policies
-- Run AFTER schema.sql in Supabase SQL Editor
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scrape_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- opportunities: Public can read published, non-expired rows
-- ============================================================
DROP POLICY IF EXISTS "Public read published opportunities" ON public.opportunities;
CREATE POLICY "Public read published opportunities"
  ON public.opportunities
  FOR SELECT
  USING (is_published = true AND is_expired = false);

-- Authenticated admins can read all (including drafts)
DROP POLICY IF EXISTS "Admins read all opportunities" ON public.opportunities;
CREATE POLICY "Admins read all opportunities"
  ON public.opportunities
  FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated admins can insert
DROP POLICY IF EXISTS "Admins insert opportunities" ON public.opportunities;
CREATE POLICY "Admins insert opportunities"
  ON public.opportunities
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Authenticated admins can update
DROP POLICY IF EXISTS "Admins update opportunities" ON public.opportunities;
CREATE POLICY "Admins update opportunities"
  ON public.opportunities
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Authenticated admins can delete
DROP POLICY IF EXISTS "Admins delete opportunities" ON public.opportunities;
CREATE POLICY "Admins delete opportunities"
  ON public.opportunities
  FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- ============================================================
-- scrape_cache: Service role only
-- ============================================================
DROP POLICY IF EXISTS "Service role scrape cache" ON public.scrape_cache;
CREATE POLICY "Service role scrape cache"
  ON public.scrape_cache
  USING (auth.role() = 'service_role');

-- ============================================================
-- admin_logs: Authenticated admins only
-- ============================================================
DROP POLICY IF EXISTS "Admins read logs" ON public.admin_logs;
CREATE POLICY "Admins read logs"
  ON public.admin_logs
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins insert logs" ON public.admin_logs;
CREATE POLICY "Admins insert logs"
  ON public.admin_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- increment_views: Allow anon calls via RPC
-- ============================================================
GRANT EXECUTE ON FUNCTION public.increment_views(UUID) TO anon, authenticated;
