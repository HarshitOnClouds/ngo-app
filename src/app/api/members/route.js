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
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { donations: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Add donation stats for each member
    const membersWithStats = await Promise.all(
      members.map(async (member) => {
        const donationStats = await prisma.donation.aggregate({
          where: { userId: member.id },
          _sum: { amount: true },
          _count: true,
        });

        return {
          ...member,
          totalDonations: donationStats._count,
          totalAmount: donationStats._sum.amount || 0,
        };
      })
    );

    return NextResponse.json({
      total: membersWithStats.length,
      members: membersWithStats,
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

    console.error("GET /api/view-members error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
