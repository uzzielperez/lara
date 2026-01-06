import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

// User download - with paywall check
export async function GET(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user profile with subscription status
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!userProfile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get("id");

    if (!applicationId) {
      return NextResponse.json({ error: "Application ID is required" }, { status: 400 });
    }

    // Check if user owns this application
    const application = await prisma.application.findFirst({
      where: { 
        id: applicationId,
        userId: userProfile.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            nationalityCode: true,
            budgetMinMonthly: true,
            budgetMaxMonthly: true,
            targetCountries: true,
            degreeLevels: true,
            desiredStart: true,
          },
        },
        program: {
          include: {
            school: true,
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // PAYWALL CHECK: User must have PREMIUM subscription or have paid for download
    const hasPaidAccess = userProfile.subscriptionStatus === "PREMIUM" || 
                          userProfile.subscriptionStatus === "DOWNLOAD_PURCHASED";

    if (!hasPaidAccess) {
      return NextResponse.json({ 
        error: "Payment required",
        message: "Please purchase a download or upgrade to Premium to download your application.",
        requiresPayment: true,
        prices: {
          singleDownload: 4.99,
          premium: 19.99,
        }
      }, { status: 402 }); // 402 Payment Required
    }

    // Generate HTML for PDF (same as admin version)
    const html = generateApplicationHTML(application);
    
    const response = new NextResponse(html);
    response.headers.set("Content-Type", "text/html");
    response.headers.set(
      "Content-Disposition", 
      `attachment; filename="my-application-${application.program.title.replace(/[^a-z0-9]/gi, "-")}.html"`
    );
    
    return response;
  } catch (error) {
    console.error("Error generating download:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Check download access without downloading
export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!userProfile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    const hasPaidAccess = userProfile.subscriptionStatus === "PREMIUM" || 
                          userProfile.subscriptionStatus === "DOWNLOAD_PURCHASED";

    return NextResponse.json({
      hasAccess: hasPaidAccess,
      subscriptionStatus: userProfile.subscriptionStatus,
      prices: {
        singleDownload: 4.99,
        premium: 19.99,
      }
    });
  } catch (error) {
    console.error("Error checking access:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function generateApplicationHTML(application: {
  id: string;
  status: string;
  notes: string | null;
  appliedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    nationalityCode: string | null;
    budgetMinMonthly: number | null;
    budgetMaxMonthly: number | null;
    targetCountries: unknown;
    degreeLevels: unknown;
    desiredStart: Date | null;
  };
  program: {
    id: string;
    title: string;
    degreeLevel: string;
    durationMonths: number | null;
    city: string;
    countryCode: string;
    tuitionAnnual: number | null;
    currency: string;
    applicationDeadline: Date | null;
    language: string | null;
    description: string | null;
    school: {
      id: string;
      name: string;
      city: string;
      countryCode: string;
      website: string | null;
      description: string | null;
    };
  };
}) {
  const statusColors: Record<string, string> = {
    SAVED: "#6B7280",
    APPLIED: "#3B82F6",
    ACCEPTED: "#10B981",
    REJECTED: "#EF4444",
    WITHDRAWN: "#9CA3AF",
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Application - ${application.program.title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #1F2937;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid #0D4A42;
    }
    .header h1 { color: #0D4A42; font-size: 28px; margin-bottom: 8px; }
    .header p { color: #6B7280; font-size: 14px; }
    .status-badge {
      display: inline-block;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 14px;
      color: white;
      background-color: ${statusColors[application.status] || "#6B7280"};
      margin-top: 10px;
    }
    .section {
      margin-bottom: 30px;
      padding: 20px;
      background: #F9FAFB;
      border-radius: 8px;
      border: 1px solid #E5E7EB;
    }
    .section h2 {
      font-size: 18px;
      color: #0D4A42;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 1px solid #E5E7EB;
    }
    .field { margin-bottom: 12px; }
    .field label {
      display: block;
      font-size: 12px;
      color: #6B7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .field p { font-size: 15px; color: #1F2937; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #E5E7EB;
      text-align: center;
      font-size: 12px;
      color: #9CA3AF;
    }
    .logo { font-size: 20px; font-weight: bold; color: #0D4A42; }
    @media print {
      body { padding: 20px; }
      .section { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">🌏 Filipinas Abroad</div>
    <h1>My Study Program Application</h1>
    <div class="status-badge">${application.status}</div>
  </div>

  <div class="section">
    <h2>👤 My Information</h2>
    <div class="grid">
      <div class="field">
        <label>Full Name</label>
        <p>${application.user.name || "Not provided"}</p>
      </div>
      <div class="field">
        <label>Email</label>
        <p>${application.user.email || "Not provided"}</p>
      </div>
      <div class="field">
        <label>Nationality</label>
        <p>${application.user.nationalityCode || "Not provided"}</p>
      </div>
      <div class="field">
        <label>Budget (Monthly)</label>
        <p>${application.user.budgetMinMonthly && application.user.budgetMaxMonthly 
          ? `€${application.user.budgetMinMonthly} - €${application.user.budgetMaxMonthly}`
          : "Not provided"}</p>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>🎓 Program Details</h2>
    <div class="field">
      <label>Program Name</label>
      <p><strong>${application.program.title}</strong></p>
    </div>
    <div class="field">
      <label>Institution</label>
      <p>${application.program.school.name}</p>
    </div>
    <div class="grid">
      <div class="field">
        <label>Location</label>
        <p>${application.program.city}, ${application.program.countryCode}</p>
      </div>
      <div class="field">
        <label>Degree Level</label>
        <p>${application.program.degreeLevel}</p>
      </div>
      <div class="field">
        <label>Duration</label>
        <p>${application.program.durationMonths 
          ? `${application.program.durationMonths} months`
          : "Not specified"}</p>
      </div>
      <div class="field">
        <label>Tuition (Annual)</label>
        <p>${application.program.currency} ${application.program.tuitionAnnual?.toLocaleString() || "Not specified"}</p>
      </div>
      <div class="field">
        <label>Application Deadline</label>
        <p>${application.program.applicationDeadline 
          ? new Date(application.program.applicationDeadline).toLocaleDateString()
          : "Rolling admissions"}</p>
      </div>
    </div>
    ${application.program.school.website ? `
    <div class="field">
      <label>School Website</label>
      <p><a href="${application.program.school.website}">${application.program.school.website}</a></p>
    </div>
    ` : ""}
  </div>

  <div class="section">
    <h2>📋 Application Status</h2>
    <div class="grid">
      <div class="field">
        <label>Current Status</label>
        <p><strong>${application.status}</strong></p>
      </div>
      <div class="field">
        <label>Applied On</label>
        <p>${application.appliedAt 
          ? new Date(application.appliedAt).toLocaleDateString()
          : "Not yet applied"}</p>
      </div>
    </div>
    ${application.notes ? `
    <div class="field">
      <label>My Notes</label>
      <p>${application.notes}</p>
    </div>
    ` : ""}
  </div>

  <div class="footer">
    <p>Generated by Filipinas Abroad on ${new Date().toLocaleString()}</p>
    <p>www.filipinas-abroad.com</p>
  </div>
</body>
</html>
  `.trim();
}
