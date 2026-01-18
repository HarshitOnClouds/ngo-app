"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ProfilePage from "./profile";
import DonatePage from "./donate";
import PastDonationsPage from "./past-donations";

export default function MemberPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");

  // Redirect if not authenticated or not member
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  if (session?.user?.role !== "MEMBER") {
    router.push("/");
    return null;
  }

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-800 text-white flex flex-col">
        <div className="p-6 border-b border-blue-700">
          <h1 className="text-2xl font-bold">Member Portal</h1>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full text-left px-4 py-3 rounded-lg transition duration-200 ${
                  activeTab === "profile"
                    ? "bg-blue-600 font-semibold"
                    : "hover:bg-blue-700"
                }`}
              >
                 My Profile
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("donate")}
                className={`w-full text-left px-4 py-3 rounded-lg transition duration-200 ${
                  activeTab === "donate"
                    ? "bg-blue-600 font-semibold"
                    : "hover:bg-blue-700"
                }`}
              >
                 Make Donation
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("past-donations")}
                className={`w-full text-left px-4 py-3 rounded-lg transition duration-200 ${
                  activeTab === "past-donations"
                    ? "bg-blue-600 font-semibold"
                    : "hover:bg-blue-700"
                }`}
              >
                 My Donations
              </button>
            </li>
          </ul>
        </nav>

        <div className="p-4 border-t border-blue-700">
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
          >
             Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {activeTab === "profile" && <ProfilePage />}
          {activeTab === "donate" && <DonatePage />}
          {activeTab === "past-donations" && <PastDonationsPage />}
        </div>
      </main>
    </div>
  );
}
