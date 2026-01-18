import { NextResponse } from "next/server";
import crypto from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount } = await request.json();

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Valid amount is required" },
        { status: 400 }
      );
    }

    // Create donation record
    const donation = await prisma.donation.create({
      data: {
        userId: session.user.id,
        amount: Math.round(amount * 100), // Store in cents
        status: "CREATED",
        gateway: "PAYHERE",
      },
    });

    const merchantId = process.env.PAYHERE_MERCHANT_ID;
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
    const orderId = donation.id;
    const amountFormatted = amount.toFixed(2);
    const currency = "LKR";

    // Generate MD5 hash
    // Format: merchant_id + order_id + amount + currency + md5(merchant_secret)
    const hashedSecret = crypto
      .createHash("md5")
      .update(merchantSecret)
      .digest("hex")
      .toUpperCase();

    const hash = crypto
      .createHash("md5")
      .update(merchantId + orderId + amountFormatted + currency + hashedSecret)
      .digest("hex")
      .toUpperCase();

    return NextResponse.json({
      hash,
      orderId,
      merchantId,
      amount: amountFormatted,
      currency,
      firstName: session.user.name?.split(" ")[0] || "Donor",
      lastName: session.user.name?.split(" ").slice(1).join(" ") || "",
      email: session.user.email,
    });
  } catch (error) {
    console.error("Error generating hash:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}