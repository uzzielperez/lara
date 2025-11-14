const { PrismaClient } = require('./src/generated/prisma');

async function testAPI() {
  const prisma = new PrismaClient();

  try {
    console.log('Testing database connection...');
    
    const programs = await prisma.program.findMany({
      include: { school: true },
      orderBy: { createdAt: "desc" },
    });

    console.log('Found programs:', programs.length);
    console.log('First program:', programs[0]);

    const data = programs.map((p) => ({
      id: p.id,
      title: p.title,
      school: p.school.name,
      city: p.city,
      countryCode: p.countryCode,
      tuitionAnnual: p.tuitionAnnual,
      applicationDeadline: p.applicationDeadline?.toISOString() ?? null,
    }));

    console.log('Formatted data:', JSON.stringify(data, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAPI();
