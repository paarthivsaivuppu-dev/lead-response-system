-- Simple Phase 1 seed data.
-- Replace the user_id value below with your real Supabase auth user id.

insert into public.businesses (
  id,
  name,
  notification_email,
  notification_phone,
  reply_tone
) values (
  '00000000-0000-4000-8000-000000000001',
  'Example Aesthetic Clinic',
  'owner@example.com',
  '+61 400 000 000',
  'Friendly and professional'
) on conflict (id) do update set
  name = excluded.name,
  notification_email = excluded.notification_email,
  notification_phone = excluded.notification_phone,
  reply_tone = excluded.reply_tone;

-- After you create a Supabase auth user, replace this placeholder UUID.
-- Example:
-- insert into public.business_users (user_id, business_id, role)
-- values ('YOUR-AUTH-USER-ID-HERE', '00000000-0000-4000-8000-000000000001', 'owner');

insert into public.leads (
  id,
  business_id,
  full_name,
  email,
  phone,
  source,
  status,
  notes
) values (
  '00000000-0000-4000-8000-000000000101',
  '00000000-0000-4000-8000-000000000001',
  'Maya Singh',
  'sarah@example.com',
  '+61 411 111 111',
  'website',
  'New',
  'Asked about a skin consultation next week.'
) on conflict (id) do update set
  full_name = excluded.full_name,
  email = excluded.email,
  phone = excluded.phone,
  source = excluded.source,
  status = excluded.status,
  notes = excluded.notes;

insert into public.messages (
  id,
  business_id,
  lead_id,
  direction,
  channel,
  body
) values (
  '00000000-0000-4000-8000-000000000201',
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000101',
  'inbound',
  'manual',
  'Hi, I would like to book a skin consultation sometime next week.'
) on conflict (id) do nothing;
