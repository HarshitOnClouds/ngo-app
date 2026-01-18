import { NextResponse } from "next/server";
import { requireAdminOrOwner } from "@/lib/authorize";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    await requireAdminOrOwner();

    const members = await prisma.user.findMany({
      where: { role: "MEMBER" },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        donations: {
          select: {
            amount: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate donation stats for each member
    const membersWithStats = members.map((member) => {
      const totalDonations = member.donations.length;
      const successfulDonations = member.donations.filter(
        (d) => d.status === "SUCCESS"
      ).length;
      const totalAmount = member.donations
        .filter((d) => d.status === "SUCCESS")
        .reduce((sum, d) => sum + d.amount, 0);

      return {
        id: member.id,
        name: member.name,
        email: member.email,
        createdAt: member.createdAt,
        totalDonations,
        successfulDonations,
        totalAmount,
      };
    });

    return NextResponse.json({
      members: membersWithStats,
      total: membersWithStats.length,
    });
  } catch (error) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    console.error("GET /api/view-members error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
