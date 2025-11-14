# CSV Import Guide

This guide explains how to import your school and program data from CSV files into your study abroad application.

## 🚀 Quick Start

### 1. Import Schools
```bash
npm run import-csv your-schools.csv schools
```

### 2. Import Programs
```bash
npm run import-csv your-programs.csv programs
```

### 3. Import Both
```bash
npm run import-csv your-data.csv all
```

## 📋 CSV Format Requirements

### Schools CSV Format
Your CSV should have these columns (case-insensitive):
- `name` - School name
- `countryCode` - ISO 3166-1 alpha-2 country code (e.g., "DE", "US", "GB")
- `city` - City name
- `website` - School website URL (optional)
- `description` - School description (optional)

**Example:**
```csv
name,countryCode,city,website,description
"Technical University of Munich",DE,Munich,https://www.tum.de,"Leading technical university in Germany"
"University of Amsterdam",NL,Amsterdam,https://www.uva.nl,"Research university in the Netherlands"
```

### Programs CSV Format
Your CSV should have these columns (case-insensitive):
- `schoolName` - Must match a school name from your schools data
- `title` - Program title
- `degreeLevel` - BACHELORS, MASTERS, PHD, or DIPLOMA
- `durationMonths` - Program duration in months (optional)
- `tuitionAnnual` - Annual tuition in smallest currency unit (optional)
- `currency` - Currency code (default: EUR)
- `applicationDeadline` - Date in YYYY-MM-DD format (optional)
- `language` - Language of instruction (optional)
- `city` - City where program is located
- `countryCode` - ISO 3166-1 alpha-2 country code
- `description` - Program description (optional)

**Example:**
```csv
schoolName,title,degreeLevel,durationMonths,tuitionAnnual,currency,applicationDeadline,language,city,countryCode,description
"Technical University of Munich","Computer Science",BACHELORS,36,0,EUR,"2024-07-15",English,Munich,DE,"Bachelor's program in Computer Science"
"University of Amsterdam","Artificial Intelligence",MASTERS,24,15000,EUR,"2024-04-01",English,Amsterdam,NL,"Master's program in AI"
```

## 🔧 Advanced Usage

### Custom Column Names
The script is flexible with column names. It will recognize these variations:
- `name` or `school_name` or `schoolName`
- `countryCode` or `country_code` or `country`
- `website` or `url`
- `description` or `desc`
- `schoolName` or `school_name` or `school`
- `title` or `program_name` or `program`
- `degreeLevel` or `degree_level` or `degree`
- `applicationDeadline` or `deadline`

### Error Handling
- Duplicate schools/programs are automatically skipped
- Invalid data is logged with error messages
- The script continues processing even if individual records fail

### Database Location
The script automatically connects to your SQLite database at `prisma/dev.db`.

## 📊 Verification

After importing, you can verify your data by:

1. **Check the web app**: Visit http://localhost:3000 and browse programs
2. **Database inspection**: Use Prisma Studio or SQLite browser
3. **API endpoints**: Test your API endpoints for schools and programs

## 🛠️ Troubleshooting

### Common Issues

1. **"CSV file not found"**
   - Make sure the CSV file path is correct
   - Use relative paths from the project root

2. **"School not found for program"**
   - Ensure school names in programs CSV match exactly with schools CSV
   - Import schools before programs

3. **"Database connection error"**
   - Run `npm run db:generate` to ensure Prisma client is generated
   - Check that `prisma/dev.db` exists

4. **"Invalid date format"**
   - Use YYYY-MM-DD format for dates
   - Leave empty for optional date fields

### Getting Help

If you encounter issues:
1. Check the error messages in the console
2. Verify your CSV format matches the examples
3. Ensure your database is properly set up
4. Try importing schools first, then programs

## 📝 Sample Files

Check the `sample-schools.csv` and `sample-programs.csv` files in your project root for reference examples.
