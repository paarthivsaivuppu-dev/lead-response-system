create policy "Users can delete business leads"
  on public.leads for delete
  using (
    exists (
      select 1
      from public.business_users
      where business_users.business_id = leads.business_id
        and business_users.user_id = auth.uid()
    )
  );

create policy "Users can delete business messages"
  on public.messages for delete
  using (
    exists (
      select 1
      from public.business_users
      where business_users.business_id = messages.business_id
        and business_users.user_id = auth.uid()
    )
  );

create policy "Users can delete business follow ups"
  on public.follow_ups for delete
  using (
    exists (
      select 1
      from public.business_users
      where business_users.business_id = follow_ups.business_id
        and business_users.user_id = auth.uid()
    )
  );
