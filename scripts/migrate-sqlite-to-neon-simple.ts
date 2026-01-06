/**
 * Simple migration script using sqlite3 CLI output
 * 
 * Usage:
 * 1. Make sure your .env has the Neon DATABASE_URL
 * 2. Run: npx ts-node --compiler-options '{"module":"commonjs"}' scripts/migrate-sqlite-to-neon-simple.ts
 */

import { PrismaClient } from '../src/generated/prisma';
import { execSync } from 'child_process';
import * as path from 'path';

const neonPrisma = new PrismaClient();
const sqliteDbPath = path.join(__dirname, '../prisma/dev.db');

function querySQLite(sql: string): any[] {
  try {
    const result = execSync(`sqlite3 ${sqliteDbPath} -json "${sql}"`, { encoding: 'utf-8' });
    return JSON.parse(result || '[]');
  } catch (error: any) {
    console.error(`Error querying SQLite: ${error.message}`);
    return [];
  }
}

async function migrate() {
  console.log('🚀 Starting migration from SQLite to Neon PostgreSQL...\n');

  try {
    await neonPrisma.$connect();
    console.log('✅ Connected to Neon PostgreSQL\n');

    // 1. UserProfile
    console.log('📦 Migrating UserProfile...');
    const users = querySQLite('SELECT * FROM UserProfile');
    console.log(`   Found ${users.length} records`);
    for (const user of users) {
      await neonPrisma.userProfile.upsert({
        where: { id: user.id },
        update: {
          deviceId: user.deviceId,
          nationalityCode: user.nationalityCode,
          budgetMinMonthly: user.budgetMinMonthly,
          budgetMaxMonthly: user.budgetMaxMonthly,
          desiredStart: user.desiredStart ? new Date(user.desiredStart) : null,
          targetCountries: user.targetCountries ? JSON.parse(user.targetCountries) : null,
          degreeLevels: user.degreeLevels ? JSON.parse(user.degreeLevels) : null,
        },
        create: {
          id: user.id,
          userId: user.userId || "", // Link to User model
          deviceId: user.deviceId,
          nationalityCode: user.nationalityCode,
          budgetMinMonthly: user.budgetMinMonthly,
          budgetMaxMonthly: user.budgetMaxMonthly,
          desiredStart: user.desiredStart ? new Date(user.desiredStart) : null,
          targetCountries: user.targetCountries ? JSON.parse(user.targetCountries) : null,
          degreeLevels: user.degreeLevels ? JSON.parse(user.degreeLevels) : null,
        },
      });
    }
    console.log(`   ✅ Migrated ${users.length} UserProfile records\n`);

    // 2. School
    console.log('📦 Migrating School...');
    const schools = querySQLite('SELECT * FROM School');
    console.log(`   Found ${schools.length} records`);
    for (const school of schools) {
      await neonPrisma.school.upsert({
        where: { id: school.id },
        update: school,
        create: school,
      });
    }
    console.log(`   ✅ Migrated ${schools.length} School records\n`);

    // 3. Program
    console.log('📦 Migrating Program...');
    const programs = querySQLite('SELECT * FROM Program');
    console.log(`   Found ${programs.length} records`);
    for (const program of programs) {
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
    console.log(`   ✅ Migrated ${programs.length} Program records\n`);

    // 4. Accommodation
    console.log('📦 Migrating Accommodation...');
    const accommodations = querySQLite('SELECT * FROM Accommodation');
    console.log(`   Found ${accommodations.length} records`);
    for (const accommodation of accommodations) {
      await neonPrisma.accommodation.upsert({
        where: { id: accommodation.id },
        update: accommodation,
        create: accommodation,
      });
    }
    console.log(`   ✅ Migrated ${accommodations.length} Accommodation records\n`);

    // 5. Swipe
    console.log('📦 Migrating Swipe...');
    const swipes = querySQLite('SELECT * FROM Swipe');
    console.log(`   Found ${swipes.length} records`);
    for (const swipe of swipes) {
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
    console.log(`   ✅ Migrated ${swipes.length} Swipe records\n`);

    // 6. Application
    console.log('📦 Migrating Application...');
    const applications = querySQLite('SELECT * FROM Application');
    console.log(`   Found ${applications.length} records`);
    for (const application of applications) {
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
    console.log(`   ✅ Migrated ${applications.length} Application records\n`);

    // 7. BookingReferral
    console.log('📦 Migrating BookingReferral...');
    const referrals = querySQLite('SELECT * FROM BookingReferral');
    console.log(`   Found ${referrals.length} records`);
    for (const referral of referrals) {
      await neonPrisma.bookingReferral.upsert({
        where: { id: referral.id },
        update: referral,
        create: referral,
      });
    }
    console.log(`   ✅ Migrated ${referrals.length} BookingReferral records\n`);

    // 8. VisaRequirement
    console.log('📦 Migrating VisaRequirement...');
    const visas = querySQLite('SELECT * FROM VisaRequirement');
    console.log(`   Found ${visas.length} records`);
    for (const visa of visas) {
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
    console.log(`   ✅ Migrated ${visas.length} VisaRequirement records\n`);

    console.log('✅ Migration completed successfully!');
  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await neonPrisma.$disconnect();
  }
}

migrate();

