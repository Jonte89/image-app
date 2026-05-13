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

**Data flow (all client-side):**
1. `components/ImageMixer.tsx` is the only stateful component. It holds two `File` objects, a `loading` flag, and a result Blob URL.
2. Each `components/Dropzone.tsx` owns its own object-URL lifecycle for the preview (`URL.createObjectURL` on file change, revoke on cleanup). The parent only sees `File | null`.
3. On submit, `lib/api.ts#generateImage` POSTs a `multipart/form-data` body with fields `image1` and `image2` to the hardcoded n8n webhook URL and returns `response.blob()`.
4. The Blob is turned into an object URL and passed to `components/ResultPanel.tsx`. `ImageMixer` revokes the previous URL before setting a new one, and on unmount.

**Important constraints:**
- The webhook URL in `lib/api.ts` is the live integration — do not mock it.
- Accepted uploads are JPG/JPEG/WEBP only; validation lives in `Dropzone.tsx` (both MIME type and extension check, since drag-and-drop sometimes yields empty `type`).
- Object URLs must be revoked when files change or components unmount — leaking them is the easiest bug to introduce here.
- The Generate button must stay disabled until both files are set AND not currently loading.

**Styling:**
- Tailwind v3 with custom palette in `tailwind.config.ts` (`cream`, `ink`, `muted`, `olive`, `border`) and font CSS variables `--font-sans` (Inter) / `--font-serif` (Instrument Serif) set in `app/layout.tsx`.
- Aesthetic is intentionally a warm editorial light-mode look (not dark/glassmorphism). Headings use the serif via `font-serif`; CTAs are pill-shaped (`rounded-full`); cards are `rounded-2xl` with a 1px `border-border` stroke.
- Toasts use `sonner` — `<Toaster />` is mounted once in `app/layout.tsx`; call `toast.error(...)` from anywhere.

**Path alias:** `@/*` maps to the project root (see `tsconfig.json`), so imports are `@/lib/api`, `@/components/...`.

## Deployment

Targeted at Vercel. No server routes, env vars, or API handlers — purely static + client fetch to the external webhook.
