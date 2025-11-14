import { NextResponse } from "next/server";

export async function GET() {
  // Temporary hardcoded data while we fix the database connection
  const programs = [
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
    },
    {
      id: "3",
      title: "Artificial Intelligence",
      school: "ETH Zurich",
      city: "Zurich",
      countryCode: "CH", 
      tuitionAnnual: 0,
      applicationDeadline: "2024-12-15T00:00:00.000Z"
    },
    {
      id: "4",
      title: "Machine Learning",
      school: "University of Edinburgh",
      city: "Edinburgh",
      countryCode: "GB",
      tuitionAnnual: 0,
      applicationDeadline: "2024-03-01T00:00:00.000Z"
    },
    {
      id: "5",
      title: "Business Administration",
      school: "Barcelona Technology School",
      city: "Barcelona", 
      countryCode: "ES",
      tuitionAnnual: 17500,
      applicationDeadline: "2024-06-01T00:00:00.000Z"
    },
    {
      id: "6",
      title: "International Business",
      school: "ESADE Ramon Llull University",
      city: "Barcelona",
      countryCode: "ES", 
      tuitionAnnual: 36400,
      applicationDeadline: "2024-05-15T00:00:00.000Z"
    }
  ];

  return NextResponse.json({ programs });
}


