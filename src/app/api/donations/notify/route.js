import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(request) {
  try {
    // PayHere sends form data, not JSON
    const formData = await request.formData();
    
    const merchant_id = formData.get("merchant_id");
    const order_id = formData.get("order_id");
    const payhere_amount = formData.get("payhere_amount");
    const payhere_currency = formData.get("payhere_currency");
    const status_code = formData.get("status_code");
    const md5sig = formData.get("md5sig");
    const payment_id = formData.get("payment_id");
    const method = formData.get("method");
    const status_message = formData.get("status_message");

    console.log("PayHere Notification Received:", {
      merchant_id,
      order_id,
      status_code,
      payment_id,
      status_message,
    });

    // Verify merchant ID
    if (merchant_id !== process.env.PAYHERE_MERCHANT_ID) {
      console.error("Invalid merchant ID");
      return NextResponse.json({ error: "Invalid merchant" }, { status: 400 });
    }

    // Find the donation
    const donation = await prisma.donation.findUnique({
      where: { id: order_id },
    });

    if (!donation) {
      console.error("Donation not found:", order_id);
      return NextResponse.json({ error: "Donation not found" }, { status: 404 });
    }

    // Verify MD5 signature
    const merchant_secret = process.env.PAYHERE_MERCHANT_SECRET;
    const hashedSecret = crypto
      .createHash("md5")
      .update(merchant_secret)
      .digest("hex")
      .toUpperCase();
    
    const hash = crypto
      .createHash("md5")
      .update(
        merchant_id +
        order_id +
        parseFloat(payhere_amount).toFixed(2) +
        payhere_currency +
        status_code +
        hashedSecret
      )
      .digest("hex")
      .toUpperCase();

    if (hash !== md5sig) {
      console.error("Invalid signature. Expected:", hash, "Got:", md5sig);
      
      // Update donation as FAILED due to signature mismatch
      await prisma.donation.update({
        where: { id: order_id },
        data: {
          status: "FAILED",
          gatewayOrderId: order_id,
          gatewayPaymentId: payment_id || "",
          gatewaySignature: md5sig || "",
        },
      });

      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Update donation based on status_code
    // 2 = SUCCESS, 0 = PENDING, -1 = CANCELED, -2 = FAILED, -3 = CHARGEDBACK
    let status = "FAILED";
    if (status_code === "2") {
      status = "SUCCESS";
    } else if (status_code === "0") {
      status = "CREATED"; // Pending
    }
    
    await prisma.donation.update({
      where: { id: order_id },
      data: {
        status,
        gatewayOrderId: order_id,
        gatewayPaymentId: payment_id || "",
        gatewaySignature: md5sig || "",
      },
    });

    console.log(`Donation ${order_id} updated to ${status}`);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("POST /api/donations/notify error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}