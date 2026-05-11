create unique index if not exists business_rules_business_id_rule_type_key
  on public.business_rules(business_id, rule_type);

create policy "Users can update their business records"
  on public.businesses for update
  using (
    exists (
      select 1
      from public.business_users
      where business_users.business_id = businesses.id
        and business_users.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.business_users
      where business_users.business_id = businesses.id
        and business_users.user_id = auth.uid()
    )
  );

create policy "Users can insert business rules"
  on public.business_rules for insert
  with check (
    exists (
      select 1
      from public.business_users
      where business_users.business_id = business_rules.business_id
        and business_users.user_id = auth.uid()
    )
  );

create policy "Users can update business rules"
  on public.business_rules for update
  using (
    exists (
      select 1
      from public.business_users
      where business_users.business_id = business_rules.business_id
        and business_users.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.business_users
      where business_users.business_id = business_rules.business_id
        and business_users.user_id = auth.uid()
    )
  );
