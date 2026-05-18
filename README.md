# AI Image Mixer

Upload a target image and a reference image; the app sends both to an n8n workflow and renders the generated result. Access is gated behind a Supabase email/password login and a **€9.99/month** Stripe subscription.

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
| `NEXT_PUBLIC_STRIPE_PAYMENT_LINK` | Stripe Payment Link URL for the €9.99/month subscription. Public — safe in the browser. |
| `STRIPE_SECRET_KEY` | Stripe secret key. Server-only — used to verify checkout and read live subscription status. Never prefix with `NEXT_PUBLIC_`. |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role key. Server-only — used solely to store the Stripe customer id on a profile (bypasses RLS). Never expose to the browser. |

`.env.local` is gitignored. `.env.example` is the template.

## Authentication

The app is gated behind Supabase email/password auth (`@supabase/ssr`).

- Sign up with **name, email, password** at `/signup`. Email confirmation is required — the user receives a link that completes signup via `/auth/callback`.
- `middleware.ts` refreshes the session on every request and redirects unauthenticated visitors to `/login`.
- The user's name is stored in a `public.profiles` table, linked to `auth.users` and populated by a database trigger on signup (Row Level Security restricts each row to its owner).
- `/api/generate` independently rejects unauthenticated requests with 401.

## Paywall

Access requires an active **€9.99/month** Stripe subscription on top of a confirmed account.

- After login, any account without an active subscription is redirected to `/pay`, which links out to a **Stripe Payment Link** (subscription mode). The link carries the Supabase user ID as `client_reference_id`, so the subscription is tied to the account regardless of the email typed at checkout.
- Stripe redirects the buyer back to `/pay/success?session_id=…`. That route re-fetches the Checkout Session from Stripe (the query string is not trusted), confirms it is paid and belongs to the signed-in user, then stores `profiles.stripe_customer_id` via the Supabase service-role client.
- **Access is checked live** (`lib/subscription.ts#hasActiveSubscription`): every load of `/` and every `/api/generate` call asks Stripe whether the customer has an `active`/`trialing` subscription. So when a user cancels or a payment fails, they lose access on their next request — no webhook needed and no stale flag.
- `stripe_customer_id` is writable **only** by the service role — `UPDATE` is revoked from the `authenticated` role for every column except `name`, so a user cannot tamper with the mapping.
- `/api/generate` independently returns **402** for users without an active subscription — the client-side gate is never trusted.
- If a buyer closes the tab before the redirect, `stripe_customer_id` is not stored; the live check then falls back to looking the customer up by email (and persists the id), so access still works.

## How it works

```
Browser  (must be signed in)
  ├── two files (JPG / PNG / WEBP, ≤ 10 MB each)
  ▼
POST /api/generate           ← multipart/form-data
  ├── checks Supabase session (401 if absent)
  ├── checks live Stripe subscription (402 if inactive)
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
2. Add `WEBHOOK_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_STRIPE_PAYMENT_LINK`, `STRIPE_SECRET_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` under **Project Settings → Environment Variables**, then redeploy (the `NEXT_PUBLIC_*` values are baked in at build time).
3. In the Supabase dashboard (**Authentication → URL Configuration**), set the **Site URL** to the production domain and add `https://<your-domain>/auth/callback` to **Redirect URLs**, or confirmation emails will fail.
4. Update the Stripe Payment Link's **after-payment redirect** to `https://<your-domain>/pay/success?session_id={CHECKOUT_SESSION_ID}` (it points at `localhost` for local dev), and use live-mode Stripe keys + a live-mode subscription Payment Link in production.
