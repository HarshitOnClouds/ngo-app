import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    // Require authenticated user
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { amount } = body;

    // Validate amount
    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Valid amount is required (in LKR)" },
        { status: 400 }
      );
    }

    // Create donation record with CREATED status
    const donation = await prisma.donation.create({
      data: {
        userId: session.user.id,
        amount: Math.round(amount * 100), // Store in cents
        status: "CREATED",
        gateway: "PAYHERE",
      },
    });

    // PayHere payment details
    const paymentData = {
      merchant_id: process.env.PAYHERE_MERCHANT_ID,
      return_url: `${process.env.NEXTAUTH_URL}/donations/success`,
      cancel_url: `${process.env.NEXTAUTH_URL}/donations/cancel`,
      notify_url: `${process.env.NEXTAUTH_URL}/api/donations/notify`,
      order_id: donation.id,
      items: "Donation",
      currency: "LKR",
      amount: amount.toFixed(2),
      first_name: session.user.name?.split(" ")[0] || "Donor",
      last_name: session.user.name?.split(" ").slice(1).join(" ") || "",
      email: session.user.email,
      phone: "",
      address: "",
      city: "",
      country: "Sri Lanka",
      sandbox: process.env.PAYHERE_SANDBOX === "true",
    };

    return NextResponse.json(
      {
        donationId: donation.id,
        paymentData,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/donations/create error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}