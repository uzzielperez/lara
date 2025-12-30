import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hash } from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.userProfile.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password (for future use when implementing password storage)
    await hash(password, 10);

    // Create user
    // Note: For NextAuth with database sessions, we need to create the user through NextAuth
    // For now, we'll create a UserProfile and the user will be created on first sign-in
    const userProfile = await prisma.userProfile.create({
      data: {
        email,
        name: name || undefined,
        // Store hashed password temporarily - in production, use NextAuth's user management
        // For MVP, we'll handle this through the credentials provider
      },
    });

    return NextResponse.json(
      { message: "User created successfully", userId: userProfile.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}

