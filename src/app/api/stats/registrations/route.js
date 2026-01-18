import { NextResponse } from "next/server";
import { requireAdminOrOwner } from "@/lib/authorize";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    await requireAdminOrOwner();

    const totalRegistrations = await prisma.user.count({
      where: { role: "MEMBER" }
    });

    return NextResponse.json({
      total: totalRegistrations
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

    console.error("GET /api/stats/registrations error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
