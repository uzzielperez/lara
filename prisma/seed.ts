import { PrismaClient, DegreeLevel, AccommodationType, UserRole, ApplicationStatus } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Clear all data in correct order (respecting foreign keys)
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

  console.log("🧹 Database cleared.");

  // 1. Create Admins
  const adminEmails = ["uzzielperez25@gmail.com", "isabella@filipinas-abroad.com", "lauren@filipinas-abroad.com"];
  for (const email of adminEmails) {
    const user = await prisma.user.create({
      data: {
        email,
        name: email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1),
        profile: {
          create: {
            role: UserRole.ADMIN,
          }
        }
      }
    });
    console.log(`👤 Admin created: ${user.email}`);
  }

  // 2. Create Schools and Programs
  const schools = [
    { name: "TU Berlin", country: "DE", city: "Berlin", programs: ["MSc Computer Science", "MA Architecture"] },
    { name: "TU Delft", country: "NL", city: "Delft", programs: ["MSc Aerospace Engineering", "MSc Sustainable Energy"] },
    { name: "Sorbonne University", country: "FR", city: "Paris", programs: ["MA Art History", "MSc Mathematics"] },
    { name: "University of Milan", country: "IT", city: "Milan", programs: ["MSc Economics", "MA Design"] },
    { name: "Complutense University", country: "ES", city: "Madrid", programs: ["MA Literature", "MSc Biological Sciences"] },
  ];

  const createdPrograms: any[] = [];

  for (const s of schools) {
    const school = await prisma.school.create({
      data: {
        name: s.name,
        countryCode: s.country,
        city: s.city,
      }
    });

    for (const pTitle of s.programs) {
      const program = await prisma.program.create({
        data: {
          schoolId: school.id,
          title: pTitle,
          degreeLevel: DegreeLevel.MASTERS,
          durationMonths: 24,
          tuitionAnnual: Math.floor(Math.random() * 15000),
          currency: "EUR",
          city: s.city,
          countryCode: s.country,
        }
      });
      createdPrograms.push(program);
    }
  }
  console.log(`🏫 ${schools.length} Schools and ${createdPrograms.length} Programs created.`);

  // 3. Create 15 Fake Student Users and Applications
  const fakeStudents = [
    { name: "Maria Santos", email: "maria.santos@example.com", country: "PH", status: "APPLIED" },
    { name: "Arjun Mehta", email: "arjun.mehta@example.com", country: "IN", status: "SAVED" },
    { name: "Elena Rossi", email: "elena.rossi@example.com", country: "IT", status: "ACCEPTED" },
    { name: "Juan Garcia", email: "juan.garcia@example.com", country: "ES", status: "SAVED" },
    { name: "Yuki Tanaka", email: "yuki.tanaka@example.com", country: "JP", status: "REJECTED" },
    { name: "Chen Wei", email: "chen.wei@example.com", country: "CN", status: "APPLIED" },
    { name: "Sarah Miller", email: "sarah.miller@example.com", country: "US", status: "SAVED" },
    { name: "Amira Hassan", email: "amira.hassan@example.com", country: "EG", status: "APPLIED" },
    { name: "Lucas Silva", email: "lucas.silva@example.com", country: "BR", status: "SAVED" },
    { name: "Fatima Khan", email: "fatima.khan@example.com", country: "PK", status: "ACCEPTED" },
    { name: "Chloe Lefebvre", email: "chloe.le@example.com", country: "FR", status: "WITHDRAWN" },
    { name: "Erik Nilsson", email: "erik.nilsson@example.com", country: "SE", status: "SAVED" },
    { name: "Sofia Popova", email: "sofia.p@example.com", country: "RU", status: "APPLIED" },
    { name: "Hans Meyer", email: "hans.m@example.com", country: "DE", status: "SAVED" },
    { name: "Grace O'Malley", email: "grace.o@example.com", country: "IE", status: "APPLIED" },
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
            targetCountries: ["DE", "NL"],
            degreeLevels: [DegreeLevel.MASTERS],
            subscriptionStatus: Math.random() > 0.7 ? "PREMIUM" : "FREE",
          }
        }
      },
      include: { profile: true }
    });

    // Create 1-2 random applications for each student
    const randomProgram1 = createdPrograms[Math.floor(Math.random() * createdPrograms.length)];
    const randomProgram2 = createdPrograms[Math.floor(Math.random() * createdPrograms.length)];

    await prisma.application.create({
      data: {
        userId: user.profile!.id,
        programId: randomProgram1.id,
        status: student.status as ApplicationStatus,
        notes: `Interest in ${randomProgram1.title} at ${randomProgram1.city}`,
        appliedAt: student.status === "APPLIED" || student.status === "ACCEPTED" ? new Date() : null,
      }
    });

    if (Math.random() > 0.5 && randomProgram1.id !== randomProgram2.id) {
      await prisma.application.create({
        data: {
          userId: user.profile!.id,
          programId: randomProgram2.id,
          status: "SAVED",
          notes: "Exploring this as a secondary option.",
        }
      });
    }
  }

  console.log(`🎓 15 Student Users and Applications seeded.`);
  console.log("✅ Seed completed successfully!");
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
