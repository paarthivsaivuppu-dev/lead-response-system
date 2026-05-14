alter table public.businesses
  add column if not exists pilot_status text
    check (
      pilot_status in (
        'pilot_active',
        'pilot_expired',
        'paid',
        'paused',
        'cancelled'
      )
    ),
  add column if not exists pilot_starts_at timestamptz,
  add column if not exists pilot_ends_at timestamptz,
  add column if not exists subscription_status text
    check (
      subscription_status in (
        'trialing',
        'active',
        'inactive',
        'past_due',
        'cancelled'
      )
    ),
  add column if not exists pilot_lead_limit integer;

update public.businesses
set
  pilot_status = coalesce(pilot_status, 'pilot_active'),
  subscription_status = coalesce(subscription_status, 'trialing'),
  pilot_starts_at = coalesce(pilot_starts_at, now()),
  pilot_ends_at = coalesce(pilot_ends_at, now() + interval '30 days'),
  pilot_lead_limit = coalesce(pilot_lead_limit, 50);

alter table public.businesses
  alter column pilot_status set default 'pilot_active',
  alter column pilot_status set not null,
  alter column subscription_status set default 'trialing',
  alter column subscription_status set not null,
  alter column pilot_lead_limit set default 50,
  alter column pilot_lead_limit set not null;
