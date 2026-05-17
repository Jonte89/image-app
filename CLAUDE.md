# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start Next.js dev server on `localhost:3000`.
- `npm run build` — production build; this is the canonical type-check (no separate `tsc` script).
- `npm run start` — serve the production build.
- `npm run lint` — Next.js ESLint.

No test suite is configured.

## Architecture

Next.js 14 App Router app that proxies two user-uploaded images to an n8n webhook and renders the binary image response. Access is gated behind Supabase email/password auth.

**Auth:**
- Uses `@supabase/ssr`. `lib/supabase/client.ts` (browser), `lib/supabase/server.ts` (Server Components / Route Handlers), `lib/supabase/middleware.ts` (`updateSession` helper).
- `middleware.ts` runs on every non-asset request: it refreshes the session via `getUser()` and redirects unauthenticated users to `/login` (and authenticated users away from `/login`/`/signup`). It must return the response whose cookies the Supabase client set — copy cookies onto any redirect, never construct a fresh `NextResponse` after `getUser()`.
- Routes: `/login`, `/signup` (name + email + password), `/auth/callback` (exchanges the email-confirmation `code` for a session), `/auth/auth-code-error`. Email confirmation is required, so `signUp` returns no session — `SignupForm` shows a "check your email" state.
- `app/page.tsx` is an async Server Component that re-checks the session (authoritative gate) and reads the user's name from `profiles`.
- The user's name lives in a `public.profiles` table (RLS: owner-only) populated by an `on_auth_user_created` trigger reading `raw_user_meta_data->>'name'`. The trigger function is `SECURITY DEFINER` with `EXECUTE` revoked from `anon`/`authenticated`. Schema changes go through Supabase migrations, not files in this repo.
- Auth components live in `components/auth/`.

**Data flow:**
1. `components/ImageMixer.tsx` is the only stateful component. It holds two `File` objects, a `loading` flag, and a result Blob URL.
2. Each `components/Dropzone.tsx` owns its own object-URL lifecycle for the preview (`URL.createObjectURL` on file change, revoke on cleanup). The parent only sees `File | null`.
3. On submit, `lib/api.ts#generateImage` POSTs a `multipart/form-data` body to the local route `/api/generate`.
4. `app/api/generate/route.ts` (Node runtime) rejects unauthenticated requests with 401, validates each file (size ≤ 10 MB, MIME in `image/jpeg|png|webp`), forwards to the n8n webhook in `process.env.WEBHOOK_URL`, verifies the upstream content-type is `image/*`, then streams the bytes back.
5. The Blob is turned into an object URL and passed to `components/ResultPanel.tsx`. `ImageMixer` revokes the previous URL before setting a new one, and on unmount.

**Important constraints:**
- The webhook URL is server-side only (`WEBHOOK_URL` in `.env.local`, never `NEXT_PUBLIC_*`) — it must never reach the browser. Always proxy through the API route, never `fetch` the upstream directly from a client component.
- Accepted uploads are JPG/JPEG/PNG/WEBP only and ≤ 10 MB. Both Dropzone (UX) and the API route (authoritative) enforce this — keep them in sync.
- Object URLs must be revoked when files change or components unmount — leaking them is the easiest bug to introduce here.
- The Generate button must stay disabled until both files are set AND not currently loading.
- Security headers (CSP, X-Frame-Options, etc.) are set in `next.config.mjs`. The CSP includes `img-src 'self' blob: data:` to allow the object-URL previews and result image — adjust there if rendering breaks. `connect-src` includes `process.env.NEXT_PUBLIC_SUPABASE_URL` so the auth clients can reach Supabase; if that env var is missing at build time the directive breaks. In development the CSP additionally permits `'unsafe-eval'` and `ws:`/`http://localhost:*` for HMR; without those Next.js fails to hydrate and click handlers silently never attach.
- `next.config.mjs` changes only take effect after a dev server restart.

**Styling:**
- Tailwind v3 with custom palette in `tailwind.config.ts` (`cream`, `ink`, `muted`, `olive`, `border`) and font CSS variables `--font-sans` (Inter) / `--font-serif` (Instrument Serif) set in `app/layout.tsx`.
- Aesthetic is intentionally a warm editorial light-mode look (not dark/glassmorphism). Headings use the serif via `font-serif`; CTAs are pill-shaped (`rounded-full`); cards are `rounded-2xl` with a 1px `border-border` stroke.
- Toasts use `sonner` — `<Toaster />` is mounted once in `app/layout.tsx`; call `toast.error(...)` from anywhere.

**Path alias:** `@/*` maps to the project root (see `tsconfig.json`), so imports are `@/lib/api`, `@/components/...`.

## Environment

- `WEBHOOK_URL` (server-only, no `NEXT_PUBLIC_` prefix) — the n8n webhook the API route proxies to.
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase project URL and publishable key, used by the auth clients. The publishable key is safe in the browser; RLS enforces access.

Stored in `.env.local` locally (gitignored); template in `.env.example`.

## Deployment

Targeted at Vercel. Set `WEBHOOK_URL`, `NEXT_PUBLIC_SUPABASE_URL`, and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the project's environment variables before deploying — `/api/generate` returns a 500 "Server is not configured" without `WEBHOOK_URL`, and the `NEXT_PUBLIC_*` values are baked in at build time so a redeploy is needed after changing them. In the Supabase dashboard, the production domain must be the Site URL and `<domain>/auth/callback` must be an allowed Redirect URL, or email confirmation links fail.
