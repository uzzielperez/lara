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

Demo wipe (local only):

```bash
npm run db:seed:demo
```
