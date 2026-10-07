# Tally Private 2

- Vite + React 19 + TypeScript single-page app with no server. The browser talks to Supabase
  directly through supabase-js; the client lives in `src/lib/supabase.ts`.
- Sign-in is Supabase Auth with email and password (`src/SignIn.tsx`); there is no sign-up. Test
  accounts are listed in the README under "Test accounts".
- The whole backend is one `private_todos` table in `supabase/migrations/`, with row level security
  that limits every row to its owner (`user_id = auth.uid()`). Schema changes go in a new migration
  file, never in the dashboard only.
- Styling is plain CSS in `src/index.css`, with the tokens from DESIGN.md as custom properties.
  No UI library.
- Checks: `npm run build` (type-checks, then builds `dist/`) and `npm run lint`.
