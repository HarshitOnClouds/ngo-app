import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            NGO Management System
          </h1>
          <p className="text-gray-600">
            Registration & Donation Platform
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/login"
            className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg text-center transition duration-200"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="block w-full bg-white hover:bg-gray-50 text-indigo-600 font-semibold py-3 px-4 rounded-lg border-2 border-indigo-600 text-center transition duration-200"
          >
            Register as Member
          </Link>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Part of NSS IIT Roorkee Open Project</p>
        </div>
      </div>
    </div>
  );
}
