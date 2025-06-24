'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-black">
      {/* NAVBAR */}
      <nav className="w-full bg-black shadow-md px-6 py-4 relative text-white">
        <div className="flex items-center justify-between">
          {/* Left: Logo + Menu Icon */}
          <div className="flex items-center">
            <button
              className="sm:hidden text-blue-600 mr-4"
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Link href="/" className="text-xl sm:text-2xl font-bold text-blue-600 hover:text-blue-800">
              HelpDesk AI
            </Link>
          </div>

          {/* Right: Desktop Login Only */}
          <div className="hidden sm:flex space-x-6 text-blue-700 font-medium items-center">
            <Link href="/login" className="hover:text-blue-500">Login</Link>
          </div>
        </div>

        {/* Mobile Dropdown: Login Only */}
        {menuOpen && (
          <div className="absolute top-full left-0 w-full bg-gray-900 flex flex-col px-6 py-4 space-y-3 z-20 sm:hidden">
            <Link href="/login" onClick={() => setMenuOpen(false)} className="hover:text-blue-400">
              Login
            </Link>
          </div>
        )}
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
