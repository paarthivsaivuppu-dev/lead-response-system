alter table public.leads
  add column if not exists booking_readiness text
    check (
      booking_readiness is null
      or booking_readiness in (
        'booking_ready',
        'interested',
        'low_intent',
        'needs_review'
      )
    ),
  add column if not exists booking_readiness_reason text;
