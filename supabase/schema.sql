-- Phase 1 database schema for the Lead Response & Follow-Up System.
-- Run this in the Supabase SQL editor.

create extension if not exists pgcrypto;

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  notification_email text,
  notification_phone text,
  inbound_email_alias text unique,
  reply_tone text default 'Friendly and professional',
  created_at timestamptz not null default now()
);

create table if not exists public.business_users (
  user_id uuid not null references auth.users(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  role text not null default 'owner',
  created_at timestamptz not null default now(),
  primary key (user_id, business_id)
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  full_name text not null,
  email text,
  phone text,
  source text,
  status text not null default 'New',
  notes text,
  service_requested text,
  urgency text,
  intent text,
  ai_summary text,
  lead_quality text,
  recommended_next_action text,
  confidence numeric,
  ai_extracted_at timestamptz,
  ai_extraction_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint leads_status_check check (
    status in (
      'New',
      'Contacted',
      'Replied',
      'Ready for Staff',
      'Booked',
      'Lost',
      'Invalid',
      'Needs Review'
    )
  )
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  lead_id uuid not null references public.leads(id) on delete cascade,
  direction text not null check (direction in ('inbound', 'outbound')),
  channel text not null check (channel in ('email', 'sms', 'manual')),
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.follow_ups (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  lead_id uuid not null references public.leads(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'sent', 'cancelled')),
  scheduled_for timestamptz,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.business_rules (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  rule_type text not null,
  rule_value jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.inbound_email_logs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete set null,
  inbound_alias text,
  resend_email_id text,
  from_email text,
  from_name text,
  to_email text,
  subject text,
  text_body text,
  html_body text,
  body_preview text,
  classification text not null default 'unsure'
    check (classification in ('enquiry', 'non_enquiry', 'verification', 'unsure')),
  classification_reason text,
  lead_id uuid references public.leads(id) on delete set null,
  processing_status text not null default 'received'
    check (processing_status in ('received', 'skipped', 'lead_created', 'needs_review', 'failed')),
  error_message text,
  created_at timestamptz not null default now()
);

create index if not exists business_users_user_id_idx on public.business_users(user_id);
create index if not exists business_users_business_id_idx on public.business_users(business_id);
create index if not exists leads_business_id_idx on public.leads(business_id);
create index if not exists leads_status_idx on public.leads(status);
create index if not exists messages_lead_id_idx on public.messages(lead_id);
create index if not exists follow_ups_lead_id_idx on public.follow_ups(lead_id);
create index if not exists business_rules_business_id_idx on public.business_rules(business_id);
create index if not exists inbound_email_logs_business_id_created_at_idx
  on public.inbound_email_logs(business_id, created_at desc);
create index if not exists inbound_email_logs_resend_email_id_idx
  on public.inbound_email_logs(resend_email_id);

alter table public.businesses enable row level security;
alter table public.business_users enable row level security;
alter table public.leads enable row level security;
alter table public.messages enable row level security;
alter table public.follow_ups enable row level security;
alter table public.business_rules enable row level security;
alter table public.inbound_email_logs enable row level security;

grant select on table public.inbound_email_logs to authenticated;
grant all privileges on table public.inbound_email_logs to service_role;

-- Phase 1 RLS is intentionally simple:
-- Users can read and manage records for businesses they are connected to.
-- TODO: In a later phase, tighten write policies by role and separate staff/admin access.

create policy "Users can read their business records"
  on public.businesses for select
  using (
    exists (
      select 1
      from public.business_users
      where business_users.business_id = businesses.id
        and business_users.user_id = auth.uid()
    )
  );

create policy "Public can read business form records"
  on public.businesses for select
  to anon
  using (true);

create policy "Users can read their business memberships"
  on public.business_users for select
  using (user_id = auth.uid());

create policy "Users can insert their own business membership"
  on public.business_users for insert
  with check (user_id = auth.uid());

create policy "Users can read business leads"
  on public.leads for select
  using (
    exists (
      select 1
      from public.business_users
      where business_users.business_id = leads.business_id
        and business_users.user_id = auth.uid()
    )
  );

create policy "Users can insert business leads"
  on public.leads for insert
  with check (
    exists (
      select 1
      from public.business_users
      where business_users.business_id = leads.business_id
        and business_users.user_id = auth.uid()
    )
  );

create policy "Public can insert website leads"
  on public.leads for insert
  to anon
  with check (
    source = 'website'
    and exists (
      select 1
      from public.businesses
      where businesses.id = leads.business_id
    )
  );

create policy "Users can update business leads"
  on public.leads for update
  using (
    exists (
      select 1
      from public.business_users
      where business_users.business_id = leads.business_id
        and business_users.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.business_users
      where business_users.business_id = leads.business_id
        and business_users.user_id = auth.uid()
    )
  );

create policy "Public can update website lead extraction"
  on public.leads for update
  to anon
  using (source = 'website')
  with check (source = 'website');

create policy "Users can read business messages"
  on public.messages for select
  using (
    exists (
      select 1
      from public.business_users
      where business_users.business_id = messages.business_id
        and business_users.user_id = auth.uid()
    )
  );

create policy "Users can insert business messages"
  on public.messages for insert
  with check (
    exists (
      select 1
      from public.business_users
      where business_users.business_id = messages.business_id
        and business_users.user_id = auth.uid()
    )
  );

create policy "Public can insert website lead messages"
  on public.messages for insert
  to anon
  with check (
    direction in ('inbound', 'outbound')
    and channel in ('manual', 'sms')
    and exists (
      select 1
      from public.leads
      where leads.id = messages.lead_id
        and leads.business_id = messages.business_id
        and leads.source = 'website'
    )
  );

create policy "Users can read business follow ups"
  on public.follow_ups for select
  using (
    exists (
      select 1
      from public.business_users
      where business_users.business_id = follow_ups.business_id
        and business_users.user_id = auth.uid()
    )
  );

create policy "Users can read business rules"
  on public.business_rules for select
  using (
    exists (
      select 1
      from public.business_users
      where business_users.business_id = business_rules.business_id
        and business_users.user_id = auth.uid()
    )
  );

create policy "Users can read business inbound email logs"
  on public.inbound_email_logs for select
  using (
    business_id is not null
    and exists (
      select 1
      from public.business_users
      where business_users.business_id = inbound_email_logs.business_id
        and business_users.user_id = auth.uid()
    )
  );
