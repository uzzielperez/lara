import { PrismaClient, DegreeLevel, AccommodationType } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
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

  const user = await prisma.userProfile.create({
    data: {
      deviceId: "dev-device",
      nationalityCode: "IN",
      budgetMinMonthly: 50000,
      budgetMaxMonthly: 120000,
      targetCountries: ["DE", "NL", "FR"],
      degreeLevels: [DegreeLevel.MASTERS],
    },
  });

  const school1 = await prisma.school.create({
    data: {
      name: "TU Berlin",
      countryCode: "DE",
      city: "Berlin",
      website: "https://www.tu.berlin/",
    },
  });

  const school2 = await prisma.school.create({
    data: {
      name: "TU Delft",
      countryCode: "NL",
      city: "Delft",
      website: "https://www.tudelft.nl/",
    },
  });

  const program1 = await prisma.program.create({
    data: {
      schoolId: school1.id,
      title: "MSc Computer Science",
      degreeLevel: DegreeLevel.MASTERS,
      durationMonths: 24,
      tuitionAnnual: 0,
      currency: "EUR",
      applicationDeadline: new Date(new Date().getFullYear(), 11, 1),
      language: "English",
      city: "Berlin",
      countryCode: "DE",
    },
  });

  const program2 = await prisma.program.create({
    data: {
      schoolId: school2.id,
      title: "MSc Aerospace Engineering",
      degreeLevel: DegreeLevel.MASTERS,
      durationMonths: 24,
      tuitionAnnual: 1800000,
      currency: "EUR",
      applicationDeadline: new Date(new Date().getFullYear(), 9, 1),
      language: "English",
      city: "Delft",
      countryCode: "NL",
    },
  });

  await prisma.accommodation.createMany({
    data: [
      {
        providerName: "HousingAnywhere",
        providerUrl: "https://housinganywhere.com",
        type: AccommodationType.APARTMENT,
        monthlyRent: 90000,
        currency: "EUR",
        city: "Berlin",
        countryCode: "DE",
        description: "1-bed apartment near campus",
      },
      {
        providerName: "SPOTAHOME",
        providerUrl: "https://www.spotahome.com",
        type: AccommodationType.SHARED_PRIVATE,
        monthlyRent: 70000,
        currency: "EUR",
        city: "Delft",
        countryCode: "NL",
        description: "Private room in shared flat",
      },
    ],
  });

  await prisma.visaRequirement.createMany({
    data: [
      {
        nationalityCode: "IN",
        destinationCountryCode: "DE",
        summary: "National D visa required. Proof of admission and financial means.",
        officialUrl: "https://www.germany.info/us-en/service/05-VisaEinreise/-/2152820",
      },
      {
        nationalityCode: "IN",
        destinationCountryCode: "NL",
        summary: "MVV/Residence permit via university. TB test may be required.",
        officialUrl: "https://ind.nl/en/study/requirements-for-residence-permit-to-study",
      },
    ],
  });

  // sample swipe and application
  await prisma.swipe.create({
    data: {
      userId: user.id,
      programId: program1.id,
      direction: "RIGHT",
    },
  });

  await prisma.application.create({
    data: {
      userId: user.id,
      programId: program1.id,
      status: "SAVED",
    },
  });
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


