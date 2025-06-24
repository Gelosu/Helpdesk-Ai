'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [username, setUsername] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const storedUser = sessionStorage.getItem('username');
    setUsername(storedUser);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('username');
    setUsername(null);
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    router.push('/');
  };

  return (
    <nav className="flex justify-between items-center px-4 sm:px-6 py-4 bg-black shadow relative text-white">
      <div className="flex items-center">
        <button
          className="sm:hidden text-blue-600 mr-4"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <Link href="/accountlogin" className="text-xl sm:text-2xl font-bold text-blue-600 hover:text-blue-800">
          HelpDesk AI
        </Link>
      </div>

      {/* Desktop Menu */}
      <div className="hidden sm:flex space-x-6 text-blue-700 font-medium items-center">
        <Link href="/accountlogin/post" className="hover:text-blue-500">Threads</Link>
        <Link href="/accountlogin/leaderboard" className="hover:text-blue-500">Leaderboard</Link>
        <Link href="/accountlogin/contacts" className="hover:text-blue-500">Contacts</Link>
        {!username ? (
          <Link href="/login" className="hover:text-blue-500">Login</Link>
        ) : (
          <div className="relative">
            <button onClick={() => setDropdownOpen(prev => !prev)} className="hover:text-blue-500">
              {username}
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-gray-900 rounded shadow-md z-10 text-white">
                <Link
                  href="/accountlogin/profilesettings"
                  onClick={() => setDropdownOpen(false)}
                  className="block w-full text-left px-4 py-2 text-sm  hover:bg-gray-700"
                >
                  Profile Settings
                </Link>
                <Link
                  href="/accountlogin/history"
                  onClick={() => setDropdownOpen(false)}
                  className="block w-full text-left px-4 py-2 text-sm  hover:bg-gray-700"
                >
                  History Records
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm  hover:bg-gray-700"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-gray-900 flex flex-col px-6 py-4 space-y-3 z-20 sm:hidden">
          <Link href="/accountlogin/post" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-400">
            Threads
          </Link>
          <Link href="/accountlogin/leaderboard" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-400">
            Leaderboard
          </Link>
          <Link href="/accountlogin/contacts" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-400">
            Contacts
          </Link>
          {!username ? (
            <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-400">
              Login
            </Link>
          ) : (
            <>
              <Link href="/accountlogin/profilesettings" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-400">
                Profile Settings
              </Link>
              <Link href="/accountlogin/history" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-400">
                History Records
              </Link>
              <button
                onClick={handleLogout}
                className="text-left text-blue-400 hover:text-blue-600"
              >
                Logout ({username})
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
