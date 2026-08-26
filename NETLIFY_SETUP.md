# Netlify Deployment Setup (real users)

## Required environment variables

Set these in **Site settings → Environment variables** (Production):

| Variable | Example / notes |
|----------|-----------------|
| `DATABASE_URL` | Neon Postgres URL (pooled or direct) |
| `AUTH_SECRET` | Long random string |
| `AUTH_URL` | `https://<your-site>.netlify.app` |
| `GROQ_API_KEY` | From https://console.groq.com/ |
| `GOOGLE_CLIENT_ID` | Google OAuth client |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret |
| `STRIPE_SECRET_KEY` | Stripe secret key (Dashboard → Developers) |
| `STRIPE_WEBHOOK_SECRET` | Signing secret from webhook endpoint |
| `STRIPE_PRICE_MONTHLY` | Price ID for €49/month subscription |
| `STRIPE_PRICE_STARTER` | Price ID for €199 / 6 months (one-time) |
| `STRIPE_PRICE_LIFETIME` | Price ID for €700 lifetime (one-time) |
| `STRIPE_PRICE_DOWNLOAD` | Price ID for €4.99 single application download |
| `STRIPE_PRICE_APPLICATION_PREMIUM` | Price ID for €19.99 premium unlock |
| `STRIPE_PRICE_PATHWAY_ADMISSION` | Price ID for €480 School Admission package |
| `STRIPE_PRICE_PATHWAY_VISA` | Price ID for €480 Visa package |
| `STRIPE_PRICE_PATHWAY_LANDING` | Price ID for €240 Landing package |

Optional aliases if still referenced: `NEXTAUTH_SECRET`, `NEXTAUTH_URL`.

## Database (Neon PostgreSQL)

SQLite **does not** work on Netlify. Use Neon (or another hosted Postgres).

Build command (see `netlify.toml`):

```bash
npm ci && node scripts/prepare-db.js && npm run build
```

`prepare-db.js` will:

1. `prisma generate`
2. `prisma migrate deploy` (or `db push` without wipe if migrate fails)
3. Idempotent seed (admins + catalog if empty)

**Never** use `prisma db push --force-reset` in production — it deletes all users.

Full checklist: [`tasks/REAL_USER_DEPLOY.md`](./tasks/REAL_USER_DEPLOY.md)

## Local development

```bash
# .env
DATABASE_URL="postgresql://..."
GROQ_API_KEY=...
AUTH_SECRET=...
AUTH_URL=http://localhost:3000

npm run db:prepare
npm run dev
```

### Stripe webhook (production)

1. In Stripe Dashboard → Developers → Webhooks, add endpoint:
   `https://<your-site>.netlify.app/api/stripe/webhook`
2. Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
3. Copy the signing secret into `STRIPE_WEBHOOK_SECRET` on Netlify.

Create Products/Prices in Stripe matching the amounts on `/pricing`, then paste each Price ID into the env vars above.

Demo wipe (local only):

```bash
npm run db:seed:demo
```
