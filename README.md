# AI Image Mixer

Upload a target image and a reference image; the app sends both to an n8n workflow and renders the generated result.

Built with Next.js 14 (App Router) + Tailwind + lucide-react + sonner. Designed to deploy on Vercel.

## Getting started

```bash
npm install
cp .env.example .env.local        # then edit WEBHOOK_URL
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

`.env.local` is gitignored. `.env.example` is the template.

## How it works

```
Browser
  ├── two files (JPG / PNG / WEBP, ≤ 10 MB each)
  ▼
POST /api/generate           ← multipart/form-data
  ├── validates type + size
  ├── forwards to WEBHOOK_URL
  └── streams the image response back
  ▼
<img src={objectURL}>        ← rendered + downloadable
```

- The webhook URL is read server-side only and never exposed to the client.
- The API route re-validates uploads (size ≤ 10 MB, MIME ∈ `image/jpeg|png|webp`) and verifies the upstream response is `image/*` before forwarding bytes.
- Security headers (CSP, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, `X-Content-Type-Options: nosniff`) are set in `next.config.mjs`.

## Deploying to Vercel

1. Push to a Git remote and import the project in Vercel.
2. Add `WEBHOOK_URL` under **Project Settings → Environment Variables**.
3. Deploy. No other configuration needed.
