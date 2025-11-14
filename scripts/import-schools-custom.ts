import { PrismaClient } from '../src/generated/prisma';
import * as fs from 'fs';

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

async function parseCustomCSV(filePath: string): Promise<SchoolData[]> {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  
  // Skip the first 3 lines (metadata) and start from line 4 (index 3)
  const dataLines = lines.slice(3);
  
  if (dataLines.length === 0) {
    throw new Error('No data found in CSV file');
  }

  const schools: SchoolData[] = [];

  for (let i = 0; i < dataLines.length; i++) {
    const line = dataLines[i].trim();
    if (!line) continue;

    // Split by comma, but handle quoted fields
    const fields = line.split(',').map(field => field.trim().replace(/^"|"$/g, ''));
    
    if (fields.length < 4) continue; // Skip incomplete rows

    const name = fields[0];
    const tuitionRange = fields[2];
    const schoolType = fields[3];
    const location = fields[4];
    const website = fields[5];
    const linkedin = fields[6];

    if (!name || name === 'Name of School') continue; // Skip header row

    // Extract city from location (handle cases like "Barcelona / Madrid")
    const city = location.split('/')[0].trim();
    
    // Set country code to ES for Spain
    const countryCode = 'ES';

    schools.push({
      name: name,
      countryCode: countryCode,
      city: city,
      website: website || undefined,
      description: `${schoolType} school in ${location}. Tuition: ${tuitionRange || 'Not specified'}`
    });
  }

  return schools;
}

async function importSchools() {
  console.log('📚 Importing schools from custom CSV format...');
  
  try {
    const schools = await parseCustomCSV('schools.csv');
    console.log(`Found ${schools.length} schools to import`);

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

    console.log(`\n📊 Import complete: ${imported} imported, ${skipped} skipped`);
  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importSchools();
