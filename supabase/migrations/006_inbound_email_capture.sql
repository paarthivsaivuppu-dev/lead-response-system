alter table public.businesses
  add column if not exists inbound_email_alias text;

create unique index if not exists businesses_inbound_email_alias_key
  on public.businesses(inbound_email_alias)
  where inbound_email_alias is not null;

create policy "Public can insert inbound email leads"
  on public.leads for insert
  to anon
  with check (
    source = 'email'
    and exists (
      select 1
      from public.businesses
      where businesses.id = leads.business_id
    )
  );

create policy "Public can update inbound email lead extraction"
  on public.leads for update
  to anon
  using (source = 'email')
  with check (source = 'email');

create policy "Public can insert inbound email lead messages"
  on public.messages for insert
  to anon
  with check (
    direction in ('inbound', 'outbound')
    and channel in ('email', 'sms')
    and exists (
      select 1
      from public.leads
      where leads.id = messages.lead_id
        and leads.business_id = messages.business_id
        and leads.source = 'email'
    )
  );
