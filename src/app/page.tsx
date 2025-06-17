'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-black">
      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-6 py-4 bg-black shadow">
        {/* Left: HelpDesk AI */}
        <Link href="/" className="text-xl font-bold text-blue-600 hover:text-blue-800">
          HelpDesk AI
        </Link>

        {/* Right: Options */}
        <div className="flex space-x-6 text-blue-700 font-medium">
          <Link href="/docs" className="hover:text-blue-500">Support</Link>
          <Link href="/support" className="hover:text-blue-500">Leaderboard</Link>
          <Link href="/support" className="hover:text-blue-500">Contacts</Link>
          <Link href="/login" className="hover:text-blue-500">Login</Link>
        </div>
      </nav>

      {/* CONTENT */}
      <main className="flex-grow flex flex-col items-center justify-center px-4">
        {/* Blue Box */}
        <div className="w-full max-w-md h-64 bg-blue-500 rounded-xl flex items-center justify-center text-white text-2xl font-semibold shadow-lg">
          Blue Box (Placeholder)
        </div>

        {/* Caption */}
        <p className="mt-6 text-center text-white text-sm max-w-lg">
          In a helpdesk role, challenges often include managing high ticket volume,
          maintaining a calm demeanor under pressure, and providing consistent, 
          quality service across diverse issues. This is a test of both technical 
          ability and emotional resilience.
        </p>
      </main>
    </div>
  );
}
