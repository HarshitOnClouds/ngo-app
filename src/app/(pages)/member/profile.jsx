"use client";

import { useState, useEffect } from "react";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/user/profile");
      if (!response.ok) throw new Error("Failed to fetch profile");
      
      const data = await response.json();
      setProfile(data);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        Error: {error}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Full Name</label>
              <p className="text-lg text-gray-900 mt-1">{profile?.name}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Email Address</label>
              <p className="text-lg text-gray-900 mt-1">{profile?.email}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Role</label>
              <p className="text-lg text-gray-900 mt-1">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                  {profile?.role}
                </span>
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Member Since</label>
              <p className="text-lg text-gray-900 mt-1">
                {new Date(profile?.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric"
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-6">
            <h4 className="text-sm font-medium text-blue-100 mb-2">Total Donations</h4>
            <p className="text-4xl font-bold">{profile?.stats?.totalDonations || 0}</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-lg p-6">
            <h4 className="text-sm font-medium text-green-100 mb-2">Successful</h4>
            <p className="text-4xl font-bold">{profile?.stats?.successfulDonations || 0}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow-lg p-6">
            <h4 className="text-sm font-medium text-purple-100 mb-2">Total Amount</h4>
            <p className="text-3xl font-bold">
              LKR {(profile?.stats?.totalAmountDonated || 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Impact Section */}
      <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Your Impact</h3>
        <p className="text-gray-700">
          Thank you for your generous support! Your {profile?.stats?.successfulDonations || 0} successful donation
          {(profile?.stats?.successfulDonations || 0) !== 1 ? "s" : ""} totaling LKR{" "}
          {(profile?.stats?.totalAmountDonated || 0).toLocaleString()} have made a real difference in our mission.
        </p>
      </div>
    </div>
  );
}
