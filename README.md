# AI Image Mixer

Upload a target image and a reference image; the app sends both to an n8n workflow and renders the generated result. Access is gated behind a Supabase email/password login.

Built with Next.js 14 (App Router) + Tailwind + lucide-react + sonner, with Supabase Auth. Designed to deploy on Vercel.

## Getting started

```bash
npm install
cp .env.example .env.local        # then edit WEBHOOK_URL + Supabase vars
npm run dev                       # http://localhost:3000
```

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with HMR |
| `npm run build` | Production build (also the canonical type check) |
| `npm run start` | Serve the production build |
| `npm run lint` | Next.js ESLint |

## Environment

| Variable | Purpose |
|---|---|
| `WEBHOOK_URL` | Server-side n8n webhook the `/api/generate` route forwards uploads to. Never prefix with `NEXT_PUBLIC_` — it must not reach the browser. |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL. Used by the browser and server auth clients. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase publishable (anon) key. Safe in the browser — Row Level Security enforces access. |

`.env.local` is gitignored. `.env.example` is the template.

## Authentication

The app is gated behind Supabase email/password auth (`@supabase/ssr`).

- Sign up with **name, email, password** at `/signup`. Email confirmation is required — the user receives a link that completes signup via `/auth/callback`.
- `middleware.ts` refreshes the session on every request and redirects unauthenticated visitors to `/login`.
- The user's name is stored in a `public.profiles` table, linked to `auth.users` and populated by a database trigger on signup (Row Level Security restricts each row to its owner).
- `/api/generate` independently rejects unauthenticated requests with 401.

## How it works

```
Browser  (must be signed in)
  ├── two files (JPG / PNG / WEBP, ≤ 10 MB each)
  ▼
POST /api/generate           ← multipart/form-data
  ├── checks Supabase session (401 if absent)
  ├── validates type + size
  ├── forwards to WEBHOOK_URL
  └── streams the image response back
  ▼
<img src={objectURL}>        ← rendered + downloadable
```

- The webhook URL is read server-side only and never exposed to the client.
- The API route re-validates uploads (size ≤ 10 MB, MIME ∈ `image/jpeg|png|webp`) and verifies the upstream response is `image/*` before forwarding bytes.
- Security headers (CSP, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, `X-Content-Type-Options: nosniff`) are set in `next.config.mjs`. The CSP `connect-src` allows the Supabase domain.

## Deploying to Vercel

1. Push to a Git remote and import the project in Vercel.
2. Add `WEBHOOK_URL`, `NEXT_PUBLIC_SUPABASE_URL`, and `NEXT_PUBLIC_SUPABASE_ANON_KEY` under **Project Settings → Environment Variables**, then redeploy (the `NEXT_PUBLIC_*` values are baked in at build time).
3. In the Supabase dashboard (**Authentication → URL Configuration**), set the **Site URL** to the production domain and add `https://<your-domain>/auth/callback` to **Redirect URLs**, or confirmation emails will fail.
