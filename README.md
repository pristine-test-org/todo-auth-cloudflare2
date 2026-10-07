# Tally Private 2

Your own short list for the things that need doing today. Sign in, add an item, tick it off,
remove it. Each person sees only their own list.

Tally Private 2 is a static React app with Supabase behind it: Supabase Auth (email and password)
for sign-in, and a `private_todos` table whose row level security keeps every row to its owner.

Live site: https://todo-auth-cloudflare2.pages.dev/

## Test accounts

| Role | Email | Password |
| --- | --- | --- |
| user | tester@tally.example | 8rUpOmfR4i6zwb0f |

The account is confirmed already, so it signs in straight away. There is no sign-up page;
accounts are created by the project's owner (see **Adding an account** below).

## Tech stack

- **Vite + React 19 + TypeScript**, plain CSS. The build is a static `dist/` folder.
- **Supabase Auth** for sign-in (`signInWithPassword`); supabase-js keeps the session in the
  browser, so a reload stays signed in.
- **Supabase** for storage: one `private_todos` table (`id`, `user_id`, `title`, `done`,
  `created_at`), read and written from the browser with `@supabase/supabase-js` and the public
  publishable key.
- **Cloudflare Pages** hosts `dist/`, built from GitHub, with a preview URL for every pull request.

## Supabase

The app uses the team's existing Supabase project:

- Project URL: `https://hszqtfynyogshhltamep.supabase.co` (ref `hszqtfynyogshhltamep`)
- Publishable key: already the default in `src/lib/supabase.ts`. It is also in the Supabase
  dashboard → the project → **Project Settings → API Keys**. It is safe to ship to the browser;
  sign-in and row level security decide what it can do.

The `private_todos` table already exists on that project, so there is nothing to apply. If the
project shows as paused (the free tier pauses idle projects), open it in the Supabase dashboard and
press **Restore project**.

For a fresh Supabase project, create the table from
`supabase/migrations/20261008120000_private_todos.sql`: paste it into **SQL Editor** and run it,
or from this folder run:

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

The migration turns on row level security: a signed-in user can select, insert, update and delete
only rows whose `user_id` is their own (`user_id` defaults to `auth.uid()`), and the `anon`
role has no access at all.

### Adding an account

In the Supabase dashboard: **Authentication → Users → Add user → Create new user**, enter an email
and password, and tick **Auto Confirm User**. The new person can sign in at once and starts with an
empty list.

## Local setup

```bash
npm install
npm run dev                  # http://localhost:5173
```

The Supabase project is the default, so no `.env.local` is needed. To point at another project,
`cp .env.example .env.local` and fill in both values.

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Type-checks and builds `dist/` |
| `npm run preview` | Serves the built `dist/` |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc -b` only |

## Environment variables

| Name | Value |
| --- | --- |
| `VITE_SUPABASE_URL` | optional; defaults to `https://hszqtfynyogshhltamep.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | optional; defaults to the project's publishable key |

Vite bakes both into the bundle at build time, so set them on the host **before** a build and
redeploy after changing them.

## Deploy (Cloudflare Pages)

Cloudflare builds the app from GitHub on every push, and every pull request gets its own preview
URL. The Pages project is `todo-auth-cloudflare2`.

1. In the Cloudflare dashboard: **Workers & Pages → Create → Pages → Connect to Git**, authorize
   GitHub if asked, and pick this repository.
2. Build settings:
   - Production branch: `main`
   - Framework preset: `React (Vite)` (or `None`)
   - Build command: `npm run build`
   - Build output directory: `dist`
3. **Save and Deploy.** The site lands on `todo-auth-cloudflare2.pages.dev` (or a similar name if
   that one is taken). Put it in the **Live site** line at the top of this README.

The same can be done from a terminal with Cloudflare's `cf` CLI (`cf pages create`, then
`cf pages source connect` to the GitHub repository).

Pages serves `index.html` for unknown paths on its own, so the app needs no redirect file.

`wrangler.jsonc` describes the same site as a Workers static-assets project
(`assets.directory: ./dist`, single-page-app fallback). Pages builds ignore it, because it has no
`pages_build_output_dir`; it is there for `npx wrangler dev` / `npx wrangler deploy`, or for
**Workers & Pages → Create → Import a repository** if you would rather run it as a Worker.

## Project structure

```
src/
  App.tsx            The gate: checks the stored session, shows the sign-in page or the list
  SignIn.tsx         Email and password sign-in; no sign-up
  TodoList.tsx       The signed-in list: load, add, toggle, remove, sign out; loading, empty and error states
  lib/supabase.ts    supabase-js client and the Todo type
  index.css          Styles; tokens match DESIGN.md
supabase/
  migrations/        The private_todos table and its row level security policies
wrangler.jsonc      Static-assets settings for Wrangler (Pages uses the dashboard build settings)
```
