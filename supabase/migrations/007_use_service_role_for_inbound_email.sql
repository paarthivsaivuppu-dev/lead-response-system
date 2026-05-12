-- Inbound email webhooks now use the server-only Supabase service role client.
-- These public email insert/update policies are no longer needed.

drop policy if exists "Public can insert inbound email leads" on public.leads;
drop policy if exists "Public can update inbound email lead extraction" on public.leads;
drop policy if exists "Public can insert inbound email lead messages" on public.messages;
