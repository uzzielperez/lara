# Real-user deploy checklist

**Goal:** Ship LARA so real students can sign up without losing data on every deploy.

**Last updated:** August 1, 2026

---

## What we fixed in code

1. **Netlify no longer wipes the DB** — removed `prisma db push --force-reset`
2. **Safe prepare script** — `scripts/prepare-db.js` runs `migrate deploy` (falls back to `db push` without wipe) + idempotent seed
3. **Seed is production-safe** — upserts admins + seeds schools/programs only if catalog is empty. Never deletes users unless `SEED_DEMO=1`
4. **Programs API reads from Neon** — no more hardcoded mock list
5. **Debug APIs gated** — `/api/debug-*` require ADMIN in production

---

## Before you push / deploy

### 1. Neon database

In [Neon](https://console.neon.tech/), confirm you have a production branch/DB and copy the connection string into Netlify as `DATABASE_URL`.

**If this Neon DB already has tables** (from earlier `db push` / force-reset deploys), baseline migrations once so the next deploy doesn’t try to create everything again:

```bash
# Locally, with production DATABASE_URL in .env
npx prisma migrate resolve --applied 20260801120000_init
npx prisma db push   # sync any missing columns (chatUsesCount, etc.) without wipe
npm run db:seed      # safe: admins + catalog if empty
```

**If the DB is empty / new**, you can skip resolve — `migrate deploy` on Netlify will create the schema.

### 2. Netlify environment variables

Required:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Neon Postgres connection string |
| `AUTH_SECRET` | NextAuth secret (long random string) |
| `AUTH_URL` | Public site URL, e.g. `https://your-site.netlify.app` |
| `GROQ_API_KEY` | Chat AI |

Recommended:

| Variable | Purpose |
|----------|---------|
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google sign-in |
| `NEXTAUTH_SECRET` | Same as AUTH_SECRET if still referenced |
| `NEXTAUTH_URL` | Same as AUTH_URL if still referenced |

### 3. Deploy

```bash
git add -A
git commit -m "Make Netlify deploy safe for real users"
git push origin main
```

Watch the Netlify build log for:

- `prisma migrate deploy` **or** fallback `db push`
- `Seed completed`
- `next build` success

### 4. Smoke test on production

- [ ] Sign up / Google sign-in works
- [ ] Complete intake → lands on `/profile` dashboard
- [ ] Ask LARA a question (prompt count decrements)
- [ ] `/programs` shows schools from DB (not the old 6 mocks)
- [ ] Save a program → appears in `/applications`
- [ ] Redeploy Netlify once → **your user still exists** (critical!)
- [ ] `/api/debug-db` returns 401/403 when logged out

---

## What is still MVP (OK for early real users)

- Subscription activate is **not Stripe yet** (manual/MVP unlock)
- Staff password login still uses a shared demo password in code — rotate before broad launch
- Application download paywall UI may still say Stripe without full integration
- S2 shortlist / school pages / visa are incomplete

These don’t block a **small real-user pilot**; they block **paid scale**.

---

## Local commands

```bash
npm run db:prepare     # generate + migrate/push + safe seed
npm run db:seed        # safe seed only
npm run db:seed:demo   # WIPE + fake data — local only, never on Netlify
```

---

## Rollback note

If a deploy fails on migrate, Netlify will not complete the site update. Fix migrations locally against Neon, then redeploy. Do **not** re-add `--force-reset`.
