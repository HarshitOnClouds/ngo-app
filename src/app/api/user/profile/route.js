import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    // Require authenticated user
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch user profile with donation stats
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: { donations: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get donation statistics
    const donationStats = await prisma.donation.aggregate({
      where: {
        userId: session.user.id,
        status: "SUCCESS",
      },
      _sum: { amount: true },
      _count: true,
    });

    const profile = {
      ...user,
      stats: {
        totalDonations: user._count.donations,
        successfulDonations: donationStats._count,
        totalAmountDonated: (donationStats._sum.amount || 0) / 100,
      },
    };

    // Remove _count from response
    delete profile._count;

    return NextResponse.json(profile);
  } catch (error) {
    console.error("GET /api/user/profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}