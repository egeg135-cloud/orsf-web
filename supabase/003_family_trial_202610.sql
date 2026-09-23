-- New cohort only; preserves all legacy applications and age classifications.
create table if not exists public.family_trial_202610 (
 id uuid primary key default gen_random_uuid(),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 guardian_name text not null check(char_length(guardian_name) between 2 and 40),
 contact text not null check(char_length(contact) between 5 and 80),
 child_age_group text not null check(child_age_group in ('4-6','7-10')),
 current_solution text not null,
 main_issue text not null,
 participation_agreed boolean not null check(participation_agreed),
 privacy_consent boolean not null check(privacy_consent),
 consent_version text not null,
 attribution jsonb not null default '{}'::jsonb,
 status text not null default 'applied' check(status in ('applied','eligible','selected','waitlisted','confirmed','shipped','completed','declined'))
);
create unique index if not exists family_trial_202610_contact_key on public.family_trial_202610(lower(contact));
alter table public.family_trial_202610 enable row level security;
revoke all on public.family_trial_202610 from public,anon,authenticated;
grant select,insert,update,delete on public.family_trial_202610 to service_role;
-- Retention deadline: 2027-01-14. Owner must delete cohort data and any CSV exports.
