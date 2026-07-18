-- Sarga Studio OS — seed data.
-- The default outbound sequence from docs/06 §6: four touches over 21 days.
-- Every step requires human approval (the column default, restated here on
-- purpose so the intent survives schema drift).

insert into sequences (id, name, channel_mix, status)
values (
  'a0000000-0000-4000-8000-000000000001',
  'Founders Default - 4x21',
  'email, email, linkedin, email',
  'active'
)
on conflict (id) do nothing;

insert into sequence_steps (id, sequence_id, day_offset, channel, template, requires_human_approval)
values
  (
    'a0000000-0000-4000-8000-000000000011',
    'a0000000-0000-4000-8000-000000000001',
    0, 'email',
    'First touch. One specific observation about their operation, one idea worth stealing, one quiet question. No pitch deck energy. Short enough to read on a phone.',
    true
  ),
  (
    'a0000000-0000-4000-8000-000000000012',
    'a0000000-0000-4000-8000-000000000001',
    4, 'email',
    'Artifact follow-up. Attach or link one concrete thing made for them: a teardown sketch, a two-step shorter flow, a numbers-back-of-envelope. Ask nothing except whether it lands.',
    true
  ),
  (
    'a0000000-0000-4000-8000-000000000013',
    'a0000000-0000-4000-8000-000000000001',
    11, 'linkedin',
    'Channel switch. A short, human LinkedIn note referencing the artifact. Rendered for manual send; the operator sends it by hand and records the touch.',
    true
  ),
  (
    'a0000000-0000-4000-8000-000000000014',
    'a0000000-0000-4000-8000-000000000001',
    21, 'email',
    'Clean close. One line: closing the loop, door stays open, no guilt hooks. If timing is wrong, say so and we vanish politely.',
    true
  )
on conflict (id) do nothing;
