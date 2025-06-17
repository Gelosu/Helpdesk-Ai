'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react'; // If using Lucide for icons

export default function HomePage() {
  const [username, setUsername] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    setMobileMenuOpen(false);
    router.push('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-4 sm:px-6 py-4 bg-black shadow relative">
        <div className="flex items-center">
          {/* Hamburger button on mobile */}
          <button
            className="sm:hidden text-blue-600 mr-4"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo */}
          <Link href="/" className="text-xl sm:text-2xl font-bold text-blue-600 hover:text-blue-800">
            HelpDesk AI
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden sm:flex space-x-6 text-blue-700 font-medium items-center">
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

        {/* Mobile Menu (dropdown) */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-gray-900 flex flex-col px-6 py-4 space-y-3 z-20 sm:hidden">
            <Link href="/docs" className="hover:text-blue-400" onClick={() => setMobileMenuOpen(false)}>Support</Link>
            <Link href="/support" className="hover:text-blue-400" onClick={() => setMobileMenuOpen(false)}>Leaderboard</Link>
            <Link href="/support" className="hover:text-blue-400" onClick={() => setMobileMenuOpen(false)}>Contacts</Link>
            {!username ? (
              <Link href="/login" className="hover:text-blue-400" onClick={() => setMobileMenuOpen(false)}>Login</Link>
            ) : (
              <button
                onClick={handleLogout}
                className="text-left text-blue-400 hover:text-blue-600"
              >
                Logout ({username})
              </button>
            )}
          </div>
        )}
      </nav>

      {/* CONTENT */}
      <main className="flex-grow flex flex-col items-center justify-start px-4 pt-8 sm:pt-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-4">Welcome to HelpDesk AI!</h1>
        <p className="text-center max-w-2xl mb-8 text-gray-300 text-sm sm:text-base">
          Your journey to becoming a Helpdesk Expert Champion starts here. Gain real-world 
          support experience, respond to user challenges, and rise through the ranks. 
          Whether you're just starting out or a seasoned tech support pro, HelpDesk AI 
          is your training ground to master empathy, technical skills, and time pressure.
        </p>

        {/* THREAD FEED STYLE */}
        <div className="w-full max-w-2xl bg-gray-900 p-4 rounded-lg mb-10 shadow-lg">
          <p className="text-sm text-gray-400 mb-2">🏆 Achievements Feed</p>
          <div className="bg-gray-800 p-3 rounded mb-2">
            <p><span className="font-semibold text-blue-400">{username || 'User'}</span> completed the "Beginner Basics" challenge!</p>
            <p className="text-xs text-gray-500">2 hours ago</p>
          </div>
          <div className="bg-gray-800 p-3 rounded mb-2">
            <p><span className="font-semibold text-blue-400">SupportMaster88</span> reached Intermediate Level!</p>
            <p className="text-xs text-gray-500">5 hours ago</p>
          </div>
        </div>

        {/* CHALLENGE OPTIONS */}
        <h2 className="text-lg sm:text-xl font-semibold mb-4 text-center px-2">
          Ready for the challenge to be a HelpDesk Expert Champion?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-16 w-full max-w-5xl px-2 sm:px-0">
          {[
            { title: 'Beginner', desc: 'Start your journey with basic challenges.', color: 'bg-green-600' },
            { title: 'Intermediate', desc: 'Tackle realistic and complex issues.', color: 'bg-yellow-500' },
            { title: 'Pro', desc: 'Face high-pressure, expert-level tasks.', color: 'bg-red-600' },
            { title: 'Quick Mode', desc: 'Fast-paced mixed challenge mode.', color: 'bg-purple-600' },
          ].map((mode) => (
            <div
              key={mode.title}
              className={`transform hover:scale-105 transition-transform duration-300 p-5 rounded-xl text-center shadow-lg cursor-pointer ${mode.color}`}
            >
              <h3 className="text-base sm:text-lg font-bold">{mode.title}</h3>
              <p className="text-sm mt-2">{mode.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
