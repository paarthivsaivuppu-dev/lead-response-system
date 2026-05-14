-- Cleanup duplicate demo seed leads for ClinicResponse AI.
--
-- Purpose:
-- If supabase/demo_seed_20_clinic_leads.sql was run more than once, this keeps
-- one lead per fake demo email and removes only duplicate demo rows.
--
-- Safety:
-- - Targets only the exact fake @example.com email addresses used by the demo seed.
-- - Targets only the first business in public.businesses, matching the demo seed.
-- - Keeps the oldest row for each demo email and deletes newer duplicates.
-- - Does not delete businesses, users, business_users, settings, or real leads.
-- - Related messages/follow_ups for deleted leads are removed automatically by
--   the existing foreign keys: messages.lead_id and follow_ups.lead_id both use
--   "on delete cascade".
--
-- Review first:
-- Run the PREVIEW query below first if you want to see what would be deleted.

-- PREVIEW: duplicate demo leads that would be deleted.
with demo_business as (
  select id
  from public.businesses
  order by created_at asc
  limit 1
),
demo_emails(email) as (
  values
    ('amelia.foster@example.com'),
    ('chloe.martin@example.com'),
    ('natalie.brown@example.com'),
    ('olivia.hart@example.com'),
    ('isabella.chen@example.com'),
    ('sienna.brooks@example.com'),
    ('maya.singh@example.com'),
    ('ethan.brooks@example.com'),
    ('aisha.khan@example.com'),
    ('grace.wilson@example.com'),
    ('hannah.lee@example.com'),
    ('ruby.clark@example.com'),
    ('zara.patel@example.com'),
    ('lily.nguyen@example.com'),
    ('mia.thompson@example.com'),
    ('sophie.anderson@example.com'),
    ('ella.roberts@example.com'),
    ('charlotte.king@example.com'),
    ('harper.scott@example.com'),
    ('emily.taylor@example.com')
),
ranked_demo_leads as (
  select
    leads.id,
    leads.business_id,
    leads.full_name,
    leads.email,
    leads.created_at,
    row_number() over (
      partition by leads.business_id, lower(leads.email)
      order by leads.created_at asc, leads.id asc
    ) as duplicate_rank
  from public.leads
  join demo_business on demo_business.id = leads.business_id
  join demo_emails on demo_emails.email = lower(leads.email)
)
select
  id,
  full_name,
  email,
  created_at,
  duplicate_rank
from ranked_demo_leads
where duplicate_rank > 1
order by email, created_at;

-- DELETE: remove duplicate demo leads, keeping one row per demo email.
-- Uncomment and run this block after reviewing the preview above.
/*
with demo_business as (
  select id
  from public.businesses
  order by created_at asc
  limit 1
),
demo_emails(email) as (
  values
    ('amelia.foster@example.com'),
    ('chloe.martin@example.com'),
    ('natalie.brown@example.com'),
    ('olivia.hart@example.com'),
    ('isabella.chen@example.com'),
    ('sienna.brooks@example.com'),
    ('maya.singh@example.com'),
    ('ethan.brooks@example.com'),
    ('aisha.khan@example.com'),
    ('grace.wilson@example.com'),
    ('hannah.lee@example.com'),
    ('ruby.clark@example.com'),
    ('zara.patel@example.com'),
    ('lily.nguyen@example.com'),
    ('mia.thompson@example.com'),
    ('sophie.anderson@example.com'),
    ('ella.roberts@example.com'),
    ('charlotte.king@example.com'),
    ('harper.scott@example.com'),
    ('emily.taylor@example.com')
),
ranked_demo_leads as (
  select
    leads.id,
    row_number() over (
      partition by leads.business_id, lower(leads.email)
      order by leads.created_at asc, leads.id asc
    ) as duplicate_rank
  from public.leads
  join demo_business on demo_business.id = leads.business_id
  join demo_emails on demo_emails.email = lower(leads.email)
),
duplicate_demo_leads as (
  select id
  from ranked_demo_leads
  where duplicate_rank > 1
)
delete from public.leads
using duplicate_demo_leads
where leads.id = duplicate_demo_leads.id
returning leads.id, leads.full_name, leads.email, leads.created_at;
*/
