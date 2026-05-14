-- Demo seed data for ClinicResponse AI dashboard testing.
-- This inserts 20 realistic fake clinic leads and one inbound message per lead.
--
-- Safe testing notes:
-- - This is direct SQL only.
-- - It does not call the app.
-- - It does not trigger OpenAI extraction.
-- - It does not send SMS.
-- - It does not send email notifications.
--
-- Usage:
-- Run this in the Supabase SQL Editor after the base schema/migrations are applied.
-- The seed uses the first business in public.businesses.
-- It clears the Treatment Demand reset marker for that business so the
-- intentionally backdated demo leads appear in the 30-day demand chart.

do $$
declare
  demo_business_id uuid;
begin
  select id
    into demo_business_id
  from public.businesses
  order by created_at asc
  limit 1;

  if demo_business_id is null then
    raise exception 'No business found. Create a business before running demo_seed_20_clinic_leads.sql.';
  end if;

  delete from public.business_rules
  where business_id = demo_business_id
    and rule_type = 'treatment_demand_reset_at';

  with demo_leads as (
    select *
    from (
      values
        (
          'Amelia Foster',
          'amelia.foster@example.com',
          '+61411100101',
          'website',
          'New',
          'Skin Consultation',
          'medium',
          'booking',
          'Customer wants a skin consultation next week and asked what appointment times are available.',
          'high',
          'Contact today and offer suitable consultation times.',
          0.94::numeric,
          now() - interval '2 hours',
          'booking_ready',
          'Asked for availability next week and provided contact details.',
          now() - interval '2 days 3 hours',
          'Hi, I would like to book a skin consultation next week. Do you have any appointments available?'
        ),
        (
          'Chloe Martin',
          'chloe.martin@example.com',
          '+61411100102',
          'email',
          'New',
          'Laser Treatment',
          'high',
          'booking',
          'Customer asked about laser treatment availability this week.',
          'high',
          'Call back promptly to discuss timing and next steps.',
          0.91::numeric,
          now() - interval '1 hour',
          'booking_ready',
          'Asked about availability this week.',
          now() - interval '3 days 4 hours',
          'Hello, I am interested in laser treatment and wanted to know if you have availability this week.'
        ),
        (
          'Natalie Brown',
          'natalie.brown@example.com',
          '+61411100103',
          'email',
          'New',
          'Microneedling',
          'medium',
          'booking',
          'Customer asked about booking microneedling soon and included a phone number.',
          'high',
          'Call to answer questions and offer the best next step.',
          0.89::numeric,
          now() - interval '5 hours',
          'booking_ready',
          'Asked to book soon and provided a phone number.',
          now() - interval '1 day 8 hours',
          'Hi, my name is Natalie Brown. I am interested in booking microneedling soon. My phone number is 0424 123 987.'
        ),
        (
          'Olivia Hart',
          'olivia.hart@example.com',
          '+61411100104',
          'manual',
          'Contacted',
          'Hydrafacial',
          'low',
          'booking',
          'Customer asked about Hydrafacial appointment options and has been contacted.',
          'medium',
          'Follow up with available appointment times.',
          0.82::numeric,
          now() - interval '2 days',
          'interested',
          'Asked about appointment options but has not confirmed a preferred time.',
          now() - interval '2 days 6 hours',
          'Customer called asking what Hydrafacial appointments are available next week.'
        ),
        (
          'Isabella Chen',
          'isabella.chen@example.com',
          '+61411100105',
          'sms',
          'Contacted',
          'Teeth Whitening',
          'low',
          'pricing',
          'Customer asked about teeth whitening pricing and has been contacted.',
          'medium',
          'Send approved pricing information and ask if they would like to book.',
          0.78::numeric,
          now() - interval '3 days',
          'interested',
          'Asked about pricing but has not requested a booking.',
          now() - interval '2 days 2 hours',
          'Hi, could you please send me info about teeth whitening pricing?'
        ),
        (
          'Sienna Brooks',
          'sienna.brooks@example.com',
          '+61411100106',
          'website',
          'Replied',
          'Injectables Consultation',
          'medium',
          'booking',
          'Customer replied after asking about an injectables consultation.',
          'high',
          'Review reply and move to staff review if clinically appropriate.',
          0.86::numeric,
          now() - interval '1 day',
          'booking_ready',
          'Replied after asking for a consultation.',
          now() - interval '18 hours',
          'I would like to organise an injectables consultation and can come in Thursday afternoon.'
        ),
        (
          'Maya Singh',
          'maya.singh@example.com',
          '+61411100107',
          'email',
          'Ready for Staff',
          'Pigmentation Consultation',
          'medium',
          'consultation',
          'Customer wants guidance on pigmentation treatment options and is ready for staff review.',
          'medium',
          'Have staff review the enquiry and respond with suitable consultation next steps.',
          0.84::numeric,
          now() - interval '4 hours',
          'interested',
          'Asked about treatment options and likely needs staff input.',
          now() - interval '10 hours',
          'Hi, I would like to understand what options you offer for pigmentation concerns.'
        ),
        (
          'Ethan Brooks',
          'ethan.brooks@example.com',
          '+61411100108',
          'manual',
          'Booked',
          'Hair Removal',
          'low',
          'booking',
          'Customer asked for hair removal and has booked an appointment.',
          'high',
          'No action needed unless appointment details need confirming.',
          0.92::numeric,
          now() - interval '6 days',
          'booking_ready',
          'Asked for a service and appointment has already been booked.',
          now() - interval '6 days',
          'Customer requested hair removal and booked for next Tuesday.'
        ),
        (
          'Aisha Khan',
          'aisha.khan@example.com',
          '+61411100109',
          'website',
          'Booked',
          'Cosmetic Consultation',
          'medium',
          'booking',
          'Customer requested a cosmetic consultation and has booked.',
          'high',
          'No immediate action needed.',
          0.9::numeric,
          now() - interval '8 days',
          'booking_ready',
          'Customer requested a consultation and booking is complete.',
          now() - interval '8 days',
          'I would like to book a cosmetic consultation for next week.'
        ),
        (
          'Grace Wilson',
          'grace.wilson@example.com',
          '+61411100110',
          'sms',
          'Lost',
          'Acne Treatment',
          'low',
          'pricing',
          'Customer was price-shopping for acne treatment and did not proceed.',
          'low',
          'No action needed unless they re-engage.',
          0.7::numeric,
          now() - interval '12 days',
          'low_intent',
          'Mostly asked for prices and did not show booking intent.',
          now() - interval '12 days',
          'Can you send the cheapest acne treatment options? I am comparing clinics.'
        ),
        (
          'Hannah Lee',
          'hannah.lee@example.com',
          '+61411100111',
          'email',
          'Invalid',
          'Skin Consultation',
          'unknown',
          'unclear',
          'Message did not contain a valid clinic enquiry.',
          'low',
          'No action needed.',
          0.55::numeric,
          now() - interval '14 days',
          'needs_review',
          'Message was unclear and may not be a real enquiry.',
          now() - interval '14 days',
          'Please remove me from this list.'
        ),
        (
          'Ruby Clark',
          'ruby.clark@example.com',
          '+61411100112',
          'website',
          'Needs Review',
          'Laser Treatment',
          'unknown',
          'unclear',
          'Customer mentioned laser treatment but the request needs human review.',
          'medium',
          'Review the enquiry before responding.',
          0.62::numeric,
          now() - interval '20 hours',
          'needs_review',
          'Intent is ambiguous and should be reviewed.',
          now() - interval '20 hours',
          'I saw something about laser treatment and wanted to know what happens next.'
        ),
        (
          'Zara Patel',
          'zara.patel@example.com',
          '+61411100113',
          'manual',
          'New',
          'Hydrafacial',
          'low',
          'information',
          'Customer asked for more information about Hydrafacial.',
          'medium',
          'Send service information and ask if they would like to book.',
          0.8::numeric,
          now() - interval '30 minutes',
          'interested',
          'Asked about a service but did not ask to book yet.',
          now() - interval '4 hours',
          'Can you tell me more about Hydrafacial and what is included?'
        ),
        (
          'Lily Nguyen',
          'lily.nguyen@example.com',
          '+61411100114',
          'email',
          'New',
          'Teeth Whitening',
          'medium',
          'booking',
          'Customer asked for a teeth whitening appointment tomorrow.',
          'high',
          'Contact quickly to confirm suitable appointment options.',
          0.93::numeric,
          now() - interval '15 minutes',
          'booking_ready',
          'Asked for an appointment tomorrow.',
          now() - interval '6 hours',
          'Hi, do you have any teeth whitening appointments tomorrow?'
        ),
        (
          'Mia Thompson',
          'mia.thompson@example.com',
          '+61411100115',
          'website',
          'Contacted',
          'Microneedling',
          'medium',
          'booking',
          'Customer asked about microneedling next steps and was contacted.',
          'high',
          'Follow up because the customer has not booked yet.',
          0.87::numeric,
          now() - interval '2 days',
          'booking_ready',
          'Asked for next steps and provided contact details.',
          now() - interval '2 days 10 hours',
          'I am interested in microneedling and would like to know the next step.'
        ),
        (
          'Sophie Anderson',
          'sophie.anderson@example.com',
          '+61411100116',
          'sms',
          'Contacted',
          'Hair Removal',
          'low',
          'booking',
          'Customer asked about hair removal and has not responded after contact.',
          'medium',
          'Follow up with simple appointment options.',
          0.81::numeric,
          now() - interval '3 days',
          'interested',
          'Asked about a service and may need follow-up.',
          now() - interval '3 days 2 hours',
          'Do you offer hair removal packages?'
        ),
        (
          'Ella Roberts',
          'ella.roberts@example.com',
          '+61411100117',
          'website',
          'Replied',
          'Acne Treatment',
          'medium',
          'consultation',
          'Customer asked about acne treatment and replied with availability.',
          'high',
          'Move to staff review or offer consultation times.',
          0.88::numeric,
          now() - interval '1 day',
          'booking_ready',
          'Provided availability after asking about treatment.',
          now() - interval '1 day 3 hours',
          'I am looking for acne treatment options and can come in Friday morning.'
        ),
        (
          'Charlotte King',
          'charlotte.king@example.com',
          '+61411100118',
          'email',
          'Ready for Staff',
          'Injectables Consultation',
          'medium',
          'consultation',
          'Customer requested an injectables consultation and needs staff review.',
          'high',
          'Have staff review and advise the appropriate consultation pathway.',
          0.85::numeric,
          now() - interval '5 hours',
          'booking_ready',
          'Requested a consultation and provided contact details.',
          now() - interval '11 hours',
          'Hello, I would like to arrange an injectables consultation if possible.'
        ),
        (
          'Harper Scott',
          'harper.scott@example.com',
          '+61411100119',
          'manual',
          'New',
          'Pigmentation Consultation',
          'low',
          'information',
          'Customer asked whether the clinic offers pigmentation consultations.',
          'medium',
          'Reply with consultation information and invite them to book.',
          0.79::numeric,
          now() - interval '3 hours',
          'interested',
          'Asked about a service but did not ask to book.',
          now() - interval '5 days',
          'Do you offer consultations for pigmentation concerns?'
        ),
        (
          'Emily Taylor',
          'emily.taylor@example.com',
          '+61411100120',
          'website',
          'New',
          'Cosmetic Consultation',
          'medium',
          'booking',
          'Customer asked for a call back about a cosmetic consultation.',
          'high',
          'Call back and help with the next step.',
          0.9::numeric,
          now() - interval '45 minutes',
          'booking_ready',
          'Asked for a call back about a consultation.',
          now() - interval '28 hours',
          'Could someone please call me back about booking a cosmetic consultation?'
        )
    ) as v(
      full_name,
      email,
      phone,
      source,
      status,
      service_requested,
      urgency,
      intent,
      ai_summary,
      lead_quality,
      recommended_next_action,
      confidence,
      ai_extracted_at,
      booking_readiness,
      booking_readiness_reason,
      created_at,
      message_body
    )
  ),
  inserted_leads as (
    insert into public.leads (
      business_id,
      full_name,
      email,
      phone,
      source,
      status,
      notes,
      service_requested,
      urgency,
      intent,
      ai_summary,
      lead_quality,
      recommended_next_action,
      confidence,
      ai_extracted_at,
      booking_readiness,
      booking_readiness_reason,
      created_at,
      updated_at
    )
    select
      demo_business_id,
      full_name,
      email,
      phone,
      source,
      status,
      message_body,
      service_requested,
      urgency,
      intent,
      ai_summary,
      lead_quality,
      recommended_next_action,
      confidence,
      ai_extracted_at,
      booking_readiness,
      booking_readiness_reason,
      created_at,
      created_at
    from demo_leads
    returning
      id,
      business_id,
      full_name,
      notes,
      source,
      created_at
  )
  insert into public.messages (
    business_id,
    lead_id,
    direction,
    channel,
    body,
    created_at
  )
  select
    business_id,
    id,
    'inbound',
    case
      when source in ('email', 'sms') then source
      else 'manual'
    end,
    notes,
    created_at + interval '1 minute'
  from inserted_leads;
end $$;
