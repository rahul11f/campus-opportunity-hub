-- Migration patch for Phase 3: Attachments and Timeline Cleanup

-- 1. Add attachments_json column to opportunities table
ALTER TABLE public.opportunities 
ADD COLUMN IF NOT EXISTS attachments_json JSONB DEFAULT '[]'::jsonb;

-- 2. Create function to delete expired opportunities
CREATE OR REPLACE FUNCTION public.cleanup_expired_opportunities(retention_buffer_days INTEGER DEFAULT 0)
RETURNS TABLE(deleted_id UUID, company TEXT, role TEXT, deleted_attachments JSONB) 
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  DELETE FROM public.opportunities
  WHERE (is_expired = true OR deadline < now())
    AND deadline IS NOT NULL
    AND deadline + (retention_days * INTERVAL '1 day') + (retention_buffer_days * INTERVAL '1 day') < now()
  RETURNING id, opportunities.company, opportunities.role, opportunities.attachments_json;
END;
$$;
