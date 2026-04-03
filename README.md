# PEO Sales Pro Web

Shared web MVP scaffold for PEO Sales Pro using Next.js and Supabase.

## Included

- public marketing/auth pages
- Supabase auth helpers
- protected app shell
- role-aware navigation
- admin section scaffolds
- calculators, opportunities, wins, insights, training, scripts, settings
- Supabase SQL schema and planning docs

## Setup

1. Install Node.js 20+ locally.
2. From this folder, run `npm install`.
3. Copy `.env.example` to `.env.local`.
4. Add your Supabase project URL and keys.
5. Run the SQL in `supabase/schema.sql`.
6. Start the app with `npm run dev`.

## Suggested next build steps

1. Connect the auth forms to your live Supabase project.
2. Replace the starter dashboard metrics with real queries.
3. Add CRUD forms for admin content management.
4. Connect the calculators to saved calculator settings in Supabase.
