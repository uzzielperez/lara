# Netlify Deployment Setup

## Required Environment Variables

You need to set the following environment variables in Netlify:

1. **DATABASE_URL** - Database connection string
2. **GROQ_API_KEY** - Your Groq API key for AI features

## Setting Environment Variables in Netlify

1. Go to your Netlify site dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Add the following variables:

### For Production:
- `DATABASE_URL` - See database setup below
- `GROQ_API_KEY` - Your Groq API key (get from https://console.groq.com/)

## ⚠️ Critical: Database Setup

**SQLite file-based databases DO NOT work on Netlify** because:
- Netlify functions are stateless and ephemeral
- File system changes don't persist between function invocations
- Each deploy gets a fresh file system

### Recommended Solutions:

#### Option 1: Use Turso (SQLite-compatible cloud database) - Easiest Migration
1. Sign up at https://turso.tech/
2. Create a new database
3. Get your database URL (looks like `libsql://your-db.turso.io`)
4. Set `DATABASE_URL` in Netlify to: `libsql://your-db.turso.io?authToken=your-token`
5. Update your Prisma schema to use the Turso driver (optional, works with standard SQLite)

#### Option 2: Use PostgreSQL (Recommended for Production)
1. Use a service like:
   - [Supabase](https://supabase.com/) (free tier available)
   - [Neon](https://neon.tech/) (free tier available)
   - [Railway](https://railway.app/) (free tier available)
   - [PlanetScale](https://planetscale.com/) (MySQL, free tier available)
2. Update your Prisma schema `datasource` to use `postgresql` or `mysql`
3. Set `DATABASE_URL` in Netlify to your database connection string

#### Option 3: Use Prisma Data Proxy (For Serverless)
1. Set up Prisma Accelerate or Data Proxy
2. Use the proxy URL as your `DATABASE_URL`

### Quick Migration Steps (Turso - Easiest):

1. Install Turso CLI: `curl -sSfL https://get.tur.so/install.sh | bash`
2. Create database: `turso db create lara`
3. Get connection string: `turso db show lara --url`
4. Get auth token: `turso db tokens create lara`
5. Set in Netlify: `DATABASE_URL=libsql://your-db.turso.io?authToken=your-token`
6. Run migrations: `npx prisma db push` (after setting DATABASE_URL locally)

## Current Environment Variables Needed:

```bash
DATABASE_URL=file:./prisma/dev.db  # ⚠️ Change this for production!
GROQ_API_KEY=your-groq-api-key-here
```

## Testing Locally

Create a `.env.local` file (already in .gitignore) for local development:
```bash
DATABASE_URL="file:./prisma/dev.db"
GROQ_API_KEY=your-groq-api-key
```

## After Setting Up Environment Variables

1. Redeploy your site on Netlify
2. The build should complete successfully
3. Your API routes should work with the database

