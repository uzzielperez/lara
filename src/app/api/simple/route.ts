import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ 
    message: "Simple API working",
    programs: [
      {
        id: "1",
        title: "Computer Science",
        school: "Technical University of Munich",
        city: "Munich",
        countryCode: "DE",
        tuitionAnnual: 0,
        applicationDeadline: null
      },
      {
        id: "2", 
        title: "Data Science",
        school: "University of Amsterdam",
        city: "Amsterdam",
        countryCode: "NL",
        tuitionAnnual: 15000,
        applicationDeadline: "2024-04-01T00:00:00.000Z"
      }
    ]
  });
}
