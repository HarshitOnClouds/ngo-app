import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { requireOwner } from "@/lib/authorize";
import { prisma } from "@/lib/prisma";

/**
 * Generate a unique email based on admin name
 */
async function generateUniqueEmail(name) {
  const baseName = name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "_")
    .substring(0, 20);

  let email;
  let exists = true;

  while (exists) {
    const suffix = Math.random().toString(36).substring(2, 6);
    email = `${baseName}_${suffix}@ngo.com`;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    exists = !!existingUser;
  }

  return email;
}

/**
 * Generate a random password
 */
function generatePassword() {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

/**
 * GET - List all admins (owner only)
 */
export async function GET(request) {
  try {
    await requireOwner();

    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      total: admins.length,
      admins,
    });
  } catch (error) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    if (error.message === "FORBIDDEN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    console.error("GET /api/admins error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST - Create admin (owner only)
 */
export async function POST(request) {
  try {
    await requireOwner();

    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { error: "Valid name is required" },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();

    // Generate unique email and password
    const email = await generateUniqueEmail(trimmedName);
    const plainPassword = generatePassword();
    const hashedPassword = await hash(plainPassword, 12);

    // Create the admin user
    const admin = await prisma.user.create({
      data: {
        name: trimmedName,
        email,
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    // Return admin credentials (password shown ONLY ONCE)
    return NextResponse.json(
      {
        message: "Admin created successfully",
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          password: plainPassword, // Show only once
          role: admin.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "Unauthorized - Please login" },
        { status: 401 }
      );
    }
    if (error.message === "FORBIDDEN") {
      return NextResponse.json(
        { error: "Forbidden - Only owners can create admins" },
        { status: 403 }
      );
    }

    console.error("POST /api/admins error:", error);
    return NextResponse.json(
      { error: "Internal server error: " + error.message },
      { status: 500 }
    );
  }
}


