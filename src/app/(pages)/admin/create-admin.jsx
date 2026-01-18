"use client";

import { useState, useEffect } from "react";

export default function CreateAdminPage() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);
  const [adminsList, setAdminsList] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoadingAdmins(true);
      const response = await fetch("/api/admins");
      
      if (!response.ok) {
        throw new Error("Failed to fetch admins");
      }

      const data = await response.json();
      setAdminsList(data.admins || []);
    } catch (err) {
      console.error("Error fetching admins:", err);
    } finally {
      setLoadingAdmins(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(null);
    setLoading(true);

    try {
      const response = await fetch("/api/admins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create admin");
        setLoading(false);
        return;
      }

      // Success - show credentials
      setSuccess(data.admin);
      setName(""); // Clear form
      
      // Refresh admins list
      await fetchAdmins();
    } catch (err) {
      console.error("Create admin error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyCredentials = () => {
    if (!success) return;

    const credentials = `Admin Credentials\n\nName: ${success.name}\nEmail: ${success.email}\nPassword: ${success.password}\n\nPlease save these credentials securely. The password will not be shown again.`;
    
    navigator.clipboard.writeText(credentials);
    alert("Credentials copied to clipboard!");
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Create Admin</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create Admin Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Add New Admin
          </h3>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Admin Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter admin name"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Admin"}
            </button>
          </form>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-700">
              <strong>Note:</strong> Email and password will be auto-generated
              and shown only once. Make sure to save them securely.
            </p>
          </div>
        </div>

        {/* Credentials Display or Admins List */}
        <div className="bg-white rounded-lg shadow p-6">
          {success ? (
            <>
              <h3 className="text-lg font-semibold text-green-700 mb-4">
                ✓ Admin Created Successfully!
              </h3>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <p className="text-sm font-semibold text-yellow-800 mb-2">
                  ⚠️ Important: Save these credentials now!
                </p>
                <p className="text-xs text-yellow-700">
                  The password will not be shown again after you leave this page.
                </p>
              </div>

              <div className="space-y-3 mb-4">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-xs text-gray-500 mb-1">Name</p>
                  <p className="font-semibold text-gray-800">{success.name}</p>
                </div>

                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-xs text-gray-500 mb-1">Email</p>
                  <p className="font-mono text-sm text-gray-800">{success.email}</p>
                </div>

                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-xs text-gray-500 mb-1">Password</p>
                  <p className="font-mono text-sm text-red-600 font-bold">
                    {success.password}
                  </p>
                </div>
              </div>

              <button
                onClick={copyCredentials}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
              >
                📋 Copy Credentials
              </button>

              <button
                onClick={() => setSuccess(null)}
                className="w-full mt-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition duration-200"
              >
                Create Another Admin
              </button>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Existing Admins
              </h3>

              {loadingAdmins ? (
                <p className="text-gray-600">Loading admins...</p>
              ) : adminsList.length === 0 ? (
                <p className="text-gray-500 text-sm">No admins created yet.</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {adminsList.map((admin) => (
                    <div
                      key={admin.id}
                      className="bg-gray-50 p-3 rounded-lg border border-gray-200"
                    >
                      <p className="font-semibold text-gray-800">{admin.name}</p>
                      <p className="text-sm text-gray-600">{admin.email}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Created: {new Date(admin.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
