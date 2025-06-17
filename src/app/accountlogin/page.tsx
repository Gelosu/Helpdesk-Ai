'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [username, setUsername] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedUser = sessionStorage.getItem('username');
    if (storedUser) {
      setUsername(storedUser);
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('username');
    setUsername(null);
    setDropdownOpen(false);
    router.push('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-black">
      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-6 py-4 bg-black shadow">
        <Link href="/" className="text-xl font-bold text-blue-600 hover:text-blue-800">
          HelpDesk AI
        </Link>

        <div className="relative text-blue-700 font-medium">
          <div className="flex space-x-6 items-center">
            <Link href="/docs" className="hover:text-blue-500">Support</Link>
            <Link href="/support" className="hover:text-blue-500">Leaderboard</Link>
            <Link href="/support" className="hover:text-blue-500">Contacts</Link>

            {!username ? (
              <Link href="/login" className="hover:text-blue-500">Login</Link>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="hover:text-blue-500 focus:outline-none"
                >
                  {username}
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-32 bg-white rounded shadow-md z-10">
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* CONTENT */}
      <main className="flex-grow flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md h-64 bg-blue-500 rounded-xl flex items-center justify-center text-white text-2xl font-semibold shadow-lg">
          Blue Box (Placeholder)
        </div>
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
