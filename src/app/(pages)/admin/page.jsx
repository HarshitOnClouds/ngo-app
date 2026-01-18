"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import StatsPage from "./stats";
import RegistrationsPage from "./registerations";
import DonationsPage from "./donations";
import CreateAdminPage from "./create-admin";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("stats");

  // Redirect if not authenticated or not admin/owner
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

  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "OWNER") {
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
      <aside className="w-64 bg-indigo-800 text-white flex flex-col">
        <div className="p-6 border-b border-indigo-700">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-sm text-indigo-200 mt-1">
            {session?.user?.name}
          </p>
          <p className="text-xs text-indigo-300">
            {session?.user?.role}
          </p>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => setActiveTab("stats")}
                className={`w-full text-left px-4 py-3 rounded-lg transition duration-200 ${
                  activeTab === "stats"
                    ? "bg-indigo-600 font-semibold"
                    : "hover:bg-indigo-700"
                }`}
              >
                📊 Stats
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("registrations")}
                className={`w-full text-left px-4 py-3 rounded-lg transition duration-200 ${
                  activeTab === "registrations"
                    ? "bg-indigo-600 font-semibold"
                    : "hover:bg-indigo-700"
                }`}
              >
                👥 Registrations
              </button>
            </li>
            
            <li>
              <button
                onClick={() => setActiveTab("donations")}
                className={`w-full text-left px-4 py-3 rounded-lg transition duration-200 ${
                  activeTab === "donations"
                    ? "bg-indigo-600 font-semibold"
                    : "hover:bg-indigo-700"
                }`}
              >
                💰 Donations
              </button>
            </li>
            {session?.user?.role === "OWNER" && (
              <li>
                <button
                  onClick={() => setActiveTab("create-admin")}
                  className={`w-full text-left px-4 py-3 rounded-lg transition duration-200 ${
                    activeTab === "create-admin"
                      ? "bg-green-600 font-semibold"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  👤 Create Admin
                </button>
              </li>
            )}
          </ul>
        </nav>

        <div className="p-4 border-t border-indigo-700">
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {activeTab === "stats" && <StatsPage />}

          {activeTab === "registrations" && <RegistrationsPage />}

          {activeTab === "donations" && <DonationsPage />}

          {activeTab === "create-admin" && <CreateAdminPage />}
        </div>
      </main>
    </div>
  );
}