"use client";

import { useState, useEffect } from "react";
import PayHereButton from "./payherebutton";

export default function DonatePage() {
  const [amount, setAmount] = useState("");
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const predefinedAmounts = [100, 500, 1000, 5000, 10000];

  const handlePredefinedAmount = (value) => {
    setAmount(value.toString());
    setError("");
  };

  const handlePreparePayment = async () => {
    const donationAmount = parseFloat(amount);

    if (!donationAmount || donationAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/payhere/generate-hash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: donationAmount }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to prepare payment");
      }

      const data = await response.json();
      setPaymentData(data);
    } catch (err) {
      console.error("Payment preparation error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Make a Donation</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donation Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Choose Amount
          </h3>

          {/* Predefined Amounts */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {predefinedAmounts.map((value) => (
              <button
                key={value}
                onClick={() => handlePredefinedAmount(value)}
                className={`py-3 px-4 rounded-lg font-semibold transition duration-200 ${
                  amount === value.toString()
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                LKR {value}
              </button>
            ))}
          </div>

          {/* Custom Amount */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Or Enter Custom Amount (LKR)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter amount"
              min="1"
            />
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {!paymentData ? (
            <button
              onClick={handlePreparePayment}
              disabled={loading || !amount}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Preparing..." : "Proceed to Payment"}
            </button>
          ) : (
            <PayHereButton
              paymentData={paymentData}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
            >
              Pay LKR {paymentData.amount} with PayHere
            </PayHereButton>
          )}
        </div>

        {/* Info Panel */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Why Donate?
          </h3>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              Support our community initiatives
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              Help those in need
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              Secure payment via PayHere
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              Track your donation history
            </li>
          </ul>

          <div className="mt-6 p-4 bg-white rounded-lg border border-blue-200">
            <p className="text-sm text-gray-600">
              <strong>Note:</strong> You will be redirected to PayHere's secure
              payment gateway to complete your donation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
