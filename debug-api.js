const { PrismaClient } = require('./src/generated/prisma');

async function debugAPI() {
  const prisma = new PrismaClient();

  try {
    console.log('Testing database connection...');
    
    // Test schools
    const schools = await prisma.school.findMany();
    console.log('Schools found:', schools.length);
    
    // Test programs
    const programs = await prisma.program.findMany({
      include: { school: true },
    });
    console.log('Programs found:', programs.length);
    
    if (programs.length > 0) {
      console.log('First program:', {
        id: programs[0].id,
        title: programs[0].title,
        school: programs[0].school.name,
        city: programs[0].city,
        countryCode: programs[0].countryCode
      });
    }

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

debugAPI();
