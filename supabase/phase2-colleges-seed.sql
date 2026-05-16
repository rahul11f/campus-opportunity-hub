insert into colleges (
  name,
  slug,
  city,
  state,
  is_active
)
values
(
  'Babu Banarasi Das University',
  'bbdu',
  'Lucknow',
  'Uttar Pradesh',
  true
),
(
  'AKTU',
  'aktu',
  'Lucknow',
  'Uttar Pradesh',
  true
),
(
  'NIT Patna',
  'nitp',
  'Patna',
  'Bihar',
  true
)
on conflict (slug) do nothing;