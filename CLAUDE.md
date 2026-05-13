# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start Next.js dev server on `localhost:3000`.
- `npm run build` — production build; this is the canonical type-check (no separate `tsc` script).
- `npm run start` — serve the production build.
- `npm run lint` — Next.js ESLint.

No test suite is configured.

## Architecture

Single-page Next.js 14 App Router app that proxies two user-uploaded images to an n8n webhook and renders the binary image response.

**Data flow:**
1. `components/ImageMixer.tsx` is the only stateful component. It holds two `File` objects, a `loading` flag, and a result Blob URL.
2. Each `components/Dropzone.tsx` owns its own object-URL lifecycle for the preview (`URL.createObjectURL` on file change, revoke on cleanup). The parent only sees `File | null`.
3. On submit, `lib/api.ts#generateImage` POSTs a `multipart/form-data` body to the local route `/api/generate`.
4. `app/api/generate/route.ts` (Node runtime) validates each file (size ≤ 10 MB, MIME in `image/jpeg|png|webp`), forwards to the n8n webhook in `process.env.WEBHOOK_URL`, verifies the upstream content-type is `image/*`, then streams the bytes back.
5. The Blob is turned into an object URL and passed to `components/ResultPanel.tsx`. `ImageMixer` revokes the previous URL before setting a new one, and on unmount.

**Important constraints:**
- The webhook URL is server-side only (`WEBHOOK_URL` in `.env.local`, never `NEXT_PUBLIC_*`) — it must never reach the browser. Always proxy through the API route, never `fetch` the upstream directly from a client component.
- Accepted uploads are JPG/JPEG/PNG/WEBP only and ≤ 10 MB. Both Dropzone (UX) and the API route (authoritative) enforce this — keep them in sync.
- Object URLs must be revoked when files change or components unmount — leaking them is the easiest bug to introduce here.
- The Generate button must stay disabled until both files are set AND not currently loading.
- Security headers (CSP, X-Frame-Options, etc.) are set in `next.config.mjs`. The CSP includes `img-src 'self' blob: data:` to allow the object-URL previews and result image — adjust there if rendering breaks. In development the CSP additionally permits `'unsafe-eval'` and `ws:`/`http://localhost:*` for HMR; without those Next.js fails to hydrate and click handlers silently never attach.
- `next.config.mjs` changes only take effect after a dev server restart.

**Styling:**
- Tailwind v3 with custom palette in `tailwind.config.ts` (`cream`, `ink`, `muted`, `olive`, `border`) and font CSS variables `--font-sans` (Inter) / `--font-serif` (Instrument Serif) set in `app/layout.tsx`.
- Aesthetic is intentionally a warm editorial light-mode look (not dark/glassmorphism). Headings use the serif via `font-serif`; CTAs are pill-shaped (`rounded-full`); cards are `rounded-2xl` with a 1px `border-border` stroke.
- Toasts use `sonner` — `<Toaster />` is mounted once in `app/layout.tsx`; call `toast.error(...)` from anywhere.

**Path alias:** `@/*` maps to the project root (see `tsconfig.json`), so imports are `@/lib/api`, `@/components/...`.

## Environment

`WEBHOOK_URL` (server-only, no `NEXT_PUBLIC_` prefix) — the n8n webhook the API route proxies to. Stored in `.env.local` locally (gitignored); template in `.env.example`.

## Deployment

Targeted at Vercel. Set `WEBHOOK_URL` in the project's environment variables before deploying — the `/api/generate` route returns a 500 "Server is not configured" without it.
