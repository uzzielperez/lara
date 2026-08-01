#!/usr/bin/env node
/**
 * Deploy helper: apply schema safely, then seed catalog/admins if needed.
 *
 * Prefers `prisma migrate deploy`. If the DB was previously managed with
 * `db push` (no migration history), falls back to `db push` WITHOUT --force-reset.
 */

const { execSync } = require("node:child_process");

function run(cmd) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: "inherit", env: process.env });
}

function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  run("npx prisma generate");

  try {
    run("npx prisma migrate deploy");
  } catch (err) {
    console.warn(
      "\n⚠️  migrate deploy failed — falling back to `prisma db push` (no wipe)."
    );
    console.warn(
      "If this is the first deploy after switching from force-reset, consider baselining migrations (see tasks/REAL_USER_DEPLOY.md).\n"
    );
    run("npx prisma db push");
  }

  // Idempotent: never deletes real users
  run("npm run db:seed");
}

main();
