import { NextResponse } from "next/server";
import { requireAdminOrOwner } from "@/lib/authorize";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    // Require admin or owner
    await requireAdminOrOwner();

    // Get donation counts by status
    const donationsByStatus = await prisma.donation.groupBy({
      by: ["status"],
      _count: true,
    });

    // Get total donations and amount
    const totalStats = await prisma.donation.aggregate({
      _count: true,
      _sum: {
        amount: true,
      },
    });

    // Get successful donations total
    const successStats = await prisma.donation.aggregate({
      where: { status: "SUCCESS" },
      _count: true,
      _sum: {
        amount: true,
      },
    });

    // Get top donors
    const topDonors = await prisma.donation.groupBy({
      by: ["userId"],
      where: { status: "SUCCESS" },
      _sum: {
        amount: true,
      },
      _count: true,
      orderBy: {
        _sum: {
          amount: "desc",
        },
      },
      take: 5,
    });

    // Fetch user details for top donors
    const topDonorsWithDetails = await Promise.all(
      topDonors.map(async (donor) => {
        const user = await prisma.user.findUnique({
          where: { id: donor.userId },
          select: {
            id: true,
            name: true,
            email: true,
          },
        });
        return {
          user,
          totalAmount: (donor._sum.amount || 0) / 100,
          donationCount: donor._count,
        };
      })
    );

    // Calculate success rate
    const successRate = totalStats._count > 0
      ? ((successStats._count / totalStats._count) * 100).toFixed(2)
      : 0;

    const stats = {
      totalDonations: totalStats._count,
      totalAmountCollected: (totalStats._sum.amount || 0) / 100,
      successfulDonations: successStats._count,
      successfulAmount: (successStats._sum.amount || 0) / 100,
      successRate: parseFloat(successRate),
      byStatus: donationsByStatus.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {}),
      topDonors: topDonorsWithDetails,
    };

    return NextResponse.json(stats);
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

    console.error("GET /api/donations/stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}