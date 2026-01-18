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

    // Fetch user's donations
    const donations = await prisma.donation.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        amount: true,
        status: true,
        gateway: true,
        gatewayOrderId: true,
        gatewayPaymentId: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Convert amount from cents to LKR
    const formattedDonations = donations.map(donation => ({
      ...donation,
      amount: donation.amount / 100,
    }));

    // Calculate summary stats
    const stats = {
      totalDonations: donations.length,
      successfulDonations: donations.filter(d => d.status === "SUCCESS").length,
      totalAmountDonated: donations
        .filter(d => d.status === "SUCCESS")
        .reduce((sum, d) => sum + d.amount, 0) / 100,
    };

    return NextResponse.json({
      donations: formattedDonations,
      stats,
    });
  } catch (error) {
    console.error("GET /api/donations/history error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}