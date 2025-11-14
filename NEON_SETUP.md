# Setting Up Neon PostgreSQL Database

## Step 1: Get Your Neon Connection String

1. In your Neon dashboard, click the **"Connect"** button (top right)
2. You'll see connection strings. Copy the one that says **"Connection string"** or **"Postgres"**
   - It should look like: `postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require`
3. **Important**: Make sure to use the connection string with `?sslmode=require` at the end (required for Neon)

## Step 2: Update Your Local .env File

Update your `.env` file with your Neon connection string:

```bash
DATABASE_URL="postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require"
GROQ_API_KEY=your-groq-api-key-here
```

Replace the connection string with your actual Neon connection string.

## Step 3: Set Up the Database Schema

Run these commands to create the tables in your Neon database:

```bash
# Generate Prisma client
npm run db:generate

# Push the schema to Neon (creates all tables)
npm run db:push
```

Or if you prefer migrations:

```bash
# Create a migration
npx prisma migrate dev --name init

# Apply migrations
npx prisma migrate deploy
```

## Step 4: Set Environment Variables in Netlify

1. Go to your Netlify site dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Add these variables:

   - **Key**: `DATABASE_URL`
     **Value**: Your Neon connection string (same as in .env)
     - Make sure it includes `?sslmode=require`
   
   - **Key**: `GROQ_API_KEY`
     **Value**: Your Groq API key

4. Click **Save**

## Step 5: (Optional) Seed Your Database

If you have seed data, you can run:

```bash
npm run db:seed
```

Make sure your `DATABASE_URL` in `.env` points to Neon before running this.

## Step 6: Deploy

After setting the environment variables in Netlify, trigger a new deployment. Your app should now connect to Neon!

## Troubleshooting

### Connection Issues
- Make sure your connection string includes `?sslmode=require`
- Check that your Neon project is active (not paused)
- Verify the connection string in Neon dashboard matches what you set

### Migration Issues
- If you get errors about tables already existing, you can use `npx prisma db push --force-reset` (⚠️ This will delete all data!)
- For production, prefer using migrations: `npx prisma migrate deploy`

### Build Issues
- Make sure `DATABASE_URL` is set in Netlify environment variables
- The build should work even without a database connection (Prisma generate doesn't need it)
- Runtime errors will occur if `DATABASE_URL` is missing when API routes try to connect

## Notes

- Neon automatically scales to zero when not in use (free tier)
- Your database will wake up automatically when accessed
- First request after inactivity might be slightly slower (cold start)

