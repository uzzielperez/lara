/**
 * Migration script to transfer data from SQLite to Neon PostgreSQL
 * 
 * Usage:
 * 1. Make sure your .env has the Neon DATABASE_URL
 * 2. Run: npx ts-node --compiler-options '{"module":"commonjs"}' scripts/migrate-sqlite-to-neon.ts
 */

import { PrismaClient } from '@prisma/client';
import Database from 'better-sqlite3';
import * as path from 'path';

// SQLite connection
const sqliteDbPath = path.join(__dirname, '../prisma/dev.db');
const sqliteDb = new Database(sqliteDbPath);

// Neon Prisma client (from DATABASE_URL in .env)
const neonPrisma = new PrismaClient();

async function migrateTable(
  tableName: string,
  getData: () => any[],
  insertData: (data: any[]) => Promise<any>
) {
  console.log(`\n📦 Migrating ${tableName}...`);
  try {
    const data = getData();
    console.log(`   Found ${data.length} records`);
    
    if (data.length === 0) {
      console.log(`   ⏭️  Skipping ${tableName} (no data)`);
      return;
    }

    // Insert in batches to avoid overwhelming the database
    const batchSize = 100;
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      await insertData(batch);
      console.log(`   ✅ Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(data.length / batchSize)}`);
    }
    
    console.log(`   ✅ Successfully migrated ${data.length} ${tableName} records`);
  } catch (error: any) {
    console.error(`   ❌ Error migrating ${tableName}:`, error.message);
    throw error;
  }
}

async function migrate() {
  console.log('🚀 Starting migration from SQLite to Neon PostgreSQL...\n');

  try {
    // Test Neon connection
    await neonPrisma.$connect();
    console.log('✅ Connected to Neon PostgreSQL');

    // Migrate tables in order (respecting foreign key constraints)
    
    // 1. UserProfile (no dependencies)
    await migrateTable(
      'UserProfile',
      () => sqliteDb.prepare('SELECT * FROM UserProfile').all() as any[],
      async (data) => {
        for (const user of data) {
          await neonPrisma.userProfile.upsert({
            where: { id: user.id },
            update: {
              deviceId: user.deviceId,
              nationalityCode: user.nationalityCode,
              budgetMinMonthly: user.budgetMinMonthly,
              budgetMaxMonthly: user.budgetMaxMonthly,
              desiredStart: user.desiredStart ? new Date(user.desiredStart) : null,
              targetCountries: user.targetCountries ? JSON.parse(user.targetCountries as any) : null,
              degreeLevels: user.degreeLevels ? JSON.parse(user.degreeLevels as any) : null,
            },
            create: {
              id: user.id,
              userId: user.userId || "", // Link to User model
              deviceId: user.deviceId,
              nationalityCode: user.nationalityCode,
              budgetMinMonthly: user.budgetMinMonthly,
              budgetMaxMonthly: user.budgetMaxMonthly,
              desiredStart: user.desiredStart ? new Date(user.desiredStart) : null,
              targetCountries: user.targetCountries ? JSON.parse(user.targetCountries as any) : null,
              degreeLevels: user.degreeLevels ? JSON.parse(user.degreeLevels as any) : null,
            },
          });
        }
      }
    );

    // 2. School (no dependencies)
    await migrateTable(
      'School',
      () => sqliteDb.prepare('SELECT * FROM School').all() as any[],
      async (data) => {
        for (const school of data) {
          await neonPrisma.school.upsert({
            where: { id: school.id },
            update: school,
            create: school,
          });
        }
      }
    );

    // 3. Program (depends on School)
    await migrateTable(
      'Program',
      () => sqliteDb.prepare('SELECT * FROM Program').all() as any[],
      async (data) => {
        for (const program of data) {
          await neonPrisma.program.upsert({
            where: { id: program.id },
            update: {
              schoolId: program.schoolId,
              title: program.title,
              degreeLevel: program.degreeLevel,
              durationMonths: program.durationMonths,
              tuitionAnnual: program.tuitionAnnual,
              currency: program.currency,
              applicationDeadline: program.applicationDeadline ? new Date(program.applicationDeadline) : null,
              language: program.language,
              city: program.city,
              countryCode: program.countryCode,
              description: program.description,
            },
            create: {
              id: program.id,
              schoolId: program.schoolId,
              title: program.title,
              degreeLevel: program.degreeLevel,
              durationMonths: program.durationMonths,
              tuitionAnnual: program.tuitionAnnual,
              currency: program.currency,
              applicationDeadline: program.applicationDeadline ? new Date(program.applicationDeadline) : null,
              language: program.language,
              city: program.city,
              countryCode: program.countryCode,
              description: program.description,
            },
          });
        }
      }
    );

    // 4. Accommodation (no dependencies)
    await migrateTable(
      'Accommodation',
      () => sqliteDb.prepare('SELECT * FROM Accommodation').all() as any[],
      async (data) => {
        for (const accommodation of data) {
          await neonPrisma.accommodation.upsert({
            where: { id: accommodation.id },
            update: accommodation,
            create: accommodation,
          });
        }
      }
    );

    // 5. Swipe (depends on UserProfile and Program)
    await migrateTable(
      'Swipe',
      () => sqliteDb.prepare('SELECT * FROM Swipe').all() as any[],
      async (data) => {
        for (const swipe of data) {
          await neonPrisma.swipe.upsert({
            where: { userId_programId: { userId: swipe.userId, programId: swipe.programId } },
            update: {
              direction: swipe.direction,
              createdAt: new Date(swipe.createdAt),
            },
            create: {
              id: swipe.id,
              userId: swipe.userId,
              programId: swipe.programId,
              direction: swipe.direction,
              createdAt: new Date(swipe.createdAt),
            },
          });
        }
      }
    );

    // 6. Application (depends on UserProfile and Program)
    await migrateTable(
      'Application',
      () => sqliteDb.prepare('SELECT * FROM Application').all() as any[],
      async (data) => {
        for (const application of data) {
          await neonPrisma.application.upsert({
            where: { userId_programId: { userId: application.userId, programId: application.programId } },
            update: {
              status: application.status,
              appliedAt: application.appliedAt ? new Date(application.appliedAt) : null,
              notes: application.notes,
            },
            create: {
              id: application.id,
              userId: application.userId,
              programId: application.programId,
              status: application.status,
              appliedAt: application.appliedAt ? new Date(application.appliedAt) : null,
              notes: application.notes,
            },
          });
        }
      }
    );

    // 7. BookingReferral (depends on UserProfile and Accommodation)
    await migrateTable(
      'BookingReferral',
      () => sqliteDb.prepare('SELECT * FROM BookingReferral').all() as any[],
      async (data) => {
        for (const referral of data) {
          await neonPrisma.bookingReferral.upsert({
            where: { id: referral.id },
            update: {
              userId: referral.userId,
              accommodationId: referral.accommodationId,
              status: referral.status,
              referralUrl: referral.referralUrl,
            },
            create: {
              id: referral.id,
              userId: referral.userId,
              accommodationId: referral.accommodationId,
              status: referral.status,
              referralUrl: referral.referralUrl,
            },
          });
        }
      }
    );

    // 8. VisaRequirement (no dependencies)
    await migrateTable(
      'VisaRequirement',
      () => sqliteDb.prepare('SELECT * FROM VisaRequirement').all() as any[],
      async (data) => {
        for (const visa of data) {
          await neonPrisma.visaRequirement.upsert({
            where: {
              nationalityCode_destinationCountryCode: {
                nationalityCode: visa.nationalityCode,
                destinationCountryCode: visa.destinationCountryCode,
              },
            },
            update: {
              summary: visa.summary,
              requiredDocuments: visa.requiredDocuments,
              officialUrl: visa.officialUrl,
            },
            create: {
              id: visa.id,
              nationalityCode: visa.nationalityCode,
              destinationCountryCode: visa.destinationCountryCode,
              summary: visa.summary,
              requiredDocuments: visa.requiredDocuments,
              officialUrl: visa.officialUrl,
            },
          });
        }
      }
    );

    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    sqliteDb.close();
    await neonPrisma.$disconnect();
  }
}

migrate();

