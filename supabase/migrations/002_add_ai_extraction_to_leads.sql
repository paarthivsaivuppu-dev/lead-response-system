alter table public.leads
  add column if not exists service_requested text,
  add column if not exists urgency text,
  add column if not exists intent text,
  add column if not exists ai_summary text,
  add column if not exists lead_quality text,
  add column if not exists recommended_next_action text,
  add column if not exists confidence numeric,
  add column if not exists ai_extracted_at timestamptz,
  add column if not exists ai_extraction_error text;
