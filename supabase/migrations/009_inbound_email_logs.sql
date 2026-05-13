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

create index if not exists inbound_email_logs_business_id_created_at_idx
  on public.inbound_email_logs(business_id, created_at desc);

create index if not exists inbound_email_logs_resend_email_id_idx
  on public.inbound_email_logs(resend_email_id);

alter table public.inbound_email_logs enable row level security;

grant select on table public.inbound_email_logs to authenticated;
grant all privileges on table public.inbound_email_logs to service_role;

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
