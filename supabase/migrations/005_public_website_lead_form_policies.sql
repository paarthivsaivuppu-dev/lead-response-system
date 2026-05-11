-- Public website lead form policies.
-- These allow anonymous visitors to submit website enquiries for an existing business.
-- TODO: Add rate limiting, bot protection, and tighter submission controls before broad production use.

create policy "Public can read business form records"
  on public.businesses for select
  to anon
  using (true);

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

create policy "Public can update website lead extraction"
  on public.leads for update
  to anon
  using (source = 'website')
  with check (source = 'website');

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
