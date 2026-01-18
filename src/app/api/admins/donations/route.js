import { NextResponse } from "next/server";
import { requireAdminOrOwner } from "@/lib/authorize";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    // Require admin or owner
    await requireAdminOrOwner();

    // Fetch all donations with user details
    const donations = await prisma.donation.findMany({
      select: {
        id: true,
        amount: true,
        status: true,
        gateway: true,
        gatewayOrderId: true,
        gatewayPaymentId: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Convert amount from cents to LKR
    const formattedDonations = donations.map(donation => ({
      ...donation,
      amount: donation.amount / 100,
    }));

    return NextResponse.json({
      total: formattedDonations.length,
      donations: formattedDonations,
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

    console.error("GET /api/admin/donations error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}