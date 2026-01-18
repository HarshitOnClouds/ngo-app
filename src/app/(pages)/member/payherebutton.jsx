"use client";

import { useRef } from "react";

export default function PayHereButton({ paymentData, className, children }) {
  const formRef = useRef(null);

  const handlePayment = () => {
    if (formRef.current) {
      formRef.current.submit();
    }
  };

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  return (
    <>
      {/* Hidden form that redirects to PayHere */}
      <form
        ref={formRef}
        method="POST"
        action="https://sandbox.payhere.lk/pay/checkout"
        style={{ display: "none" }}
      >
        <input type="hidden" name="merchant_id" value={paymentData.merchantId} />
        <input type="hidden" name="return_url" value={`${baseUrl}/member?tab=past-donations`} />
        <input type="hidden" name="cancel_url" value={`${baseUrl}/member?tab=donate`} />
        <input type="hidden" name="notify_url" value={`${baseUrl}/api/donations/notify`} />
        <input type="hidden" name="order_id" value={paymentData.orderId} />
        <input type="hidden" name="items" value="Donation" />
        <input type="hidden" name="currency" value={paymentData.currency} />
        <input type="hidden" name="amount" value={paymentData.amount} />
        <input type="hidden" name="first_name" value={paymentData.firstName} />
        <input type="hidden" name="last_name" value={paymentData.lastName} />
        <input type="hidden" name="email" value={paymentData.email} />
        <input type="hidden" name="phone" value="" />
        <input type="hidden" name="address" value="" />
        <input type="hidden" name="city" value="" />
        <input type="hidden" name="country" value="Sri Lanka" />
        <input type="hidden" name="hash" value={paymentData.hash} />
      </form>

      {/* Visible button */}
      <button
        type="button"
        onClick={handlePayment}
        className={className}
      >
        {children}
      </button>
    </>
  );
}