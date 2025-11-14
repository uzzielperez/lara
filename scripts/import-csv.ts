import { PrismaClient } from '../src/generated/prisma';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "file:../prisma/dev.db"
    }
  }
});

interface SchoolData {
  name: string;
  countryCode: string;
  city: string;
  website?: string;
  description?: string;
}

interface ProgramData {
  schoolName: string;
  title: string;
  degreeLevel: 'BACHELORS' | 'MASTERS' | 'PHD' | 'DIPLOMA';
  durationMonths?: number;
  tuitionAnnual?: number;
  currency?: string;
  applicationDeadline?: Date;
  language?: string;
  city: string;
  countryCode: string;
  description?: string;
}

async function parseCSV(filePath: string): Promise<any[]> {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  
  if (lines.length === 0) {
    throw new Error('CSV file is empty');
  }

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    const row: any = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    data.push(row);
  }

  return data;
}

async function importSchools(csvPath: string) {
  console.log('📚 Importing schools...');
  
  const data = await parseCSV(csvPath);
  const schools: SchoolData[] = data.map(row => ({
    name: row.name || row.school_name || row.schoolName,
    countryCode: row.countryCode || row.country_code || row.country,
    city: row.city,
    website: row.website || row.url,
    description: row.description || row.desc
  }));

  let imported = 0;
  let skipped = 0;

  for (const schoolData of schools) {
    try {
      // Check if school already exists
      const existing = await prisma.school.findFirst({
        where: {
          name: schoolData.name,
          countryCode: schoolData.countryCode,
          city: schoolData.city
        }
      });

      if (existing) {
        console.log(`⏭️  Skipping existing school: ${schoolData.name}`);
        skipped++;
        continue;
      }

      await prisma.school.create({
        data: schoolData
      });

      console.log(`✅ Imported school: ${schoolData.name}`);
      imported++;
    } catch (error) {
      console.error(`❌ Error importing school ${schoolData.name}:`, error);
    }
  }

  console.log(`\n📊 Schools import complete: ${imported} imported, ${skipped} skipped`);
}

async function importPrograms(csvPath: string) {
  console.log('🎓 Importing programs...');
  
  const data = await parseCSV(csvPath);
  const programs: ProgramData[] = data.map(row => ({
    schoolName: row.schoolName || row.school_name || row.school,
    title: row.title || row.program_name || row.program,
    degreeLevel: (row.degreeLevel || row.degree_level || row.degree || 'BACHELORS').toUpperCase() as any,
    durationMonths: row.durationMonths ? parseInt(row.durationMonths) : undefined,
    tuitionAnnual: row.tuitionAnnual ? parseInt(row.tuitionAnnual) : undefined,
    currency: row.currency || 'EUR',
    applicationDeadline: row.applicationDeadline || row.deadline ? new Date(row.applicationDeadline || row.deadline) : undefined,
    language: row.language || row.lang,
    city: row.city,
    countryCode: row.countryCode || row.country_code || row.country,
    description: row.description || row.desc
  }));

  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (const programData of programs) {
    try {
      // Find the school
      const school = await prisma.school.findFirst({
        where: {
          name: programData.schoolName
        }
      });

      if (!school) {
        console.log(`⚠️  School not found for program: ${programData.title} (${programData.schoolName})`);
        errors++;
        continue;
      }

      // Check if program already exists
      const existing = await prisma.program.findFirst({
        where: {
          title: programData.title,
          schoolId: school.id
        }
      });

      if (existing) {
        console.log(`⏭️  Skipping existing program: ${programData.title}`);
        skipped++;
        continue;
      }

      await prisma.program.create({
        data: {
          schoolId: school.id,
          title: programData.title,
          degreeLevel: programData.degreeLevel,
          durationMonths: programData.durationMonths,
          tuitionAnnual: programData.tuitionAnnual,
          currency: programData.currency,
          applicationDeadline: programData.applicationDeadline,
          language: programData.language,
          city: programData.city,
          countryCode: programData.countryCode,
          description: programData.description
        }
      });

      console.log(`✅ Imported program: ${programData.title}`);
      imported++;
    } catch (error) {
      console.error(`❌ Error importing program ${programData.title}:`, error);
      errors++;
    }
  }

  console.log(`\n📊 Programs import complete: ${imported} imported, ${skipped} skipped, ${errors} errors`);
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
Usage: npm run import-csv <csv-file> [type]

Examples:
  npm run import-csv schools.csv schools
  npm run import-csv programs.csv programs
  npm run import-csv data.csv all

CSV Format for Schools:
  name,countryCode,city,website,description

CSV Format for Programs:
  schoolName,title,degreeLevel,durationMonths,tuitionAnnual,currency,applicationDeadline,language,city,countryCode,description
    `);
    process.exit(1);
  }

  const csvPath = args[0];
  const type = args[1] || 'all';

  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV file not found: ${csvPath}`);
    process.exit(1);
  }

  try {
    if (type === 'schools' || type === 'all') {
      await importSchools(csvPath);
    }
    
    if (type === 'programs' || type === 'all') {
      await importPrograms(csvPath);
    }

    console.log('\n🎉 Import completed successfully!');
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
