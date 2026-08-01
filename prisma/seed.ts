/**
 * Production-safe seed.
 * - Never wipes user data
 * - Upserts admin accounts
 * - Seeds schools/programs only when the catalog is empty
 *
 * For a full wipe + fake students (local demos only):
 *   SEED_DEMO=1 npm run db:seed
 */

import {
  PrismaClient,
  DegreeLevel,
  UserRole,
  ApplicationStatus,
} from "../src/generated/prisma";

const prisma = new PrismaClient();

const ADMIN_EMAILS = [
  "uzzielperez25@gmail.com",
  "isabella@filipinas-abroad.com",
  "lauren@filipinas-abroad.com",
];

const CATALOG = [
  {
    name: "TU Berlin",
    country: "DE",
    city: "Berlin",
    website: "https://www.tu.berlin/",
    programs: ["MSc Computer Science", "MA Architecture"],
  },
  {
    name: "TU Delft",
    country: "NL",
    city: "Delft",
    website: "https://www.tudelft.nl/",
    programs: ["MSc Aerospace Engineering", "MSc Sustainable Energy"],
  },
  {
    name: "Sorbonne University",
    country: "FR",
    city: "Paris",
    website: "https://www.sorbonne-universite.fr/",
    programs: ["MA Art History", "MSc Mathematics"],
  },
  {
    name: "University of Milan",
    country: "IT",
    city: "Milan",
    website: "https://www.unimi.it/",
    programs: ["MSc Economics", "MA Design"],
  },
  {
    name: "Complutense University",
    country: "ES",
    city: "Madrid",
    website: "https://www.ucm.es/",
    programs: ["MA Literature", "MSc Biological Sciences"],
  },
  {
    name: "Universitat de Barcelona",
    country: "ES",
    city: "Barcelona",
    website: "https://web.ub.edu/en/",
    programs: ["MSc Data Science", "MA International Relations"],
  },
  {
    name: "Barcelona Technology School",
    country: "ES",
    city: "Barcelona",
    website: "https://barcelonatechnologyschool.com",
    programs: ["MSc Digital Business", "MSc Big Data Analytics"],
  },
];

async function upsertAdmins() {
  for (const email of ADMIN_EMAILS) {
    const name =
      email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1);
    const user = await prisma.user.upsert({
      where: { email },
      update: { name },
      create: {
        email,
        name,
        profile: {
          create: { role: UserRole.ADMIN },
        },
      },
      include: { profile: true },
    });

    if (user.profile && user.profile.role !== UserRole.ADMIN) {
      await prisma.userProfile.update({
        where: { id: user.profile.id },
        data: { role: UserRole.ADMIN },
      });
    } else if (!user.profile) {
      await prisma.userProfile.create({
        data: { userId: user.id, role: UserRole.ADMIN },
      });
    }
    console.log(`👤 Admin ready: ${email}`);
  }
}

async function seedCatalogIfEmpty() {
  const count = await prisma.school.count();
  if (count > 0) {
    console.log(`🏫 Catalog already has ${count} schools — skipping seed.`);
    return;
  }

  for (const s of CATALOG) {
    const school = await prisma.school.create({
      data: {
        name: s.name,
        countryCode: s.country,
        city: s.city,
        website: s.website,
      },
    });

    for (const title of s.programs) {
      await prisma.program.create({
        data: {
          schoolId: school.id,
          title,
          degreeLevel: DegreeLevel.MASTERS,
          durationMonths: 24,
          tuitionAnnual: 2000 + Math.floor(Math.random() * 12000),
          currency: "EUR",
          city: s.city,
          countryCode: s.country,
          language: "EN",
          applicationDeadline: new Date(
            new Date().getFullYear() + 1,
            Math.floor(Math.random() * 6) + 1,
            15
          ),
        },
      });
    }
  }
  console.log(`🏫 Seeded ${CATALOG.length} schools + programs.`);
}

async function seedDemoStudents() {
  console.log("⚠️  SEED_DEMO=1 — wiping app data and creating fake students…");

  await prisma.bookingReferral.deleteMany();
  await prisma.application.deleteMany();
  await prisma.swipe.deleteMany();
  await prisma.accommodation.deleteMany();
  await prisma.program.deleteMany();
  await prisma.school.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.visaRequirement.deleteMany();

  await upsertAdmins();
  await seedCatalogIfEmpty();

  const programs = await prisma.program.findMany();
  const fakeStudents = [
    { name: "Maria Santos", email: "maria.santos@example.com", country: "PH", status: "APPLIED" },
    { name: "Arjun Mehta", email: "arjun.mehta@example.com", country: "IN", status: "SAVED" },
    { name: "Elena Rossi", email: "elena.rossi@example.com", country: "IT", status: "ACCEPTED" },
  ];

  for (const student of fakeStudents) {
    const user = await prisma.user.create({
      data: {
        name: student.name,
        email: student.email,
        profile: {
          create: {
            nationalityCode: student.country,
            budgetMinMonthly: 600,
            budgetMaxMonthly: 1500,
            targetCountries: ["DE", "NL", "ES"],
            degreeLevels: [DegreeLevel.MASTERS],
            subscriptionStatus: "FREE",
          },
        },
      },
      include: { profile: true },
    });

    const program = programs[Math.floor(Math.random() * programs.length)];
    if (program && user.profile) {
      await prisma.application.create({
        data: {
          userId: user.profile.id,
          programId: program.id,
          status: student.status as ApplicationStatus,
          notes: `Interest in ${program.title}`,
          appliedAt:
            student.status === "APPLIED" || student.status === "ACCEPTED"
              ? new Date()
              : null,
        },
      });
    }
  }
  console.log("🎓 Demo students created.");
}

async function main() {
  console.log("🌱 Starting seed…");
  if (process.env.SEED_DEMO === "1") {
    await seedDemoStudents();
  } else {
    await upsertAdmins();
    await seedCatalogIfEmpty();
  }
  console.log("✅ Seed completed.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
