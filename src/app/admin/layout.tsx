// admin/layout.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [showSidebar, setShowSidebar] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    const update = () => setCurrentTime(new Date().toLocaleString());
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-violet-950 text-violet-100 flex flex-col relative">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-violet-800 shadow-lg z-40 transform transition-transform duration-300 ease-in-out ${
          showSidebar ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 text-lg font-bold border-b border-violet-700">☰ Menu</div>
        <nav className="flex flex-col gap-4 p-4">
          <Link href="/admin" className="hover:underline">📊 Dashboard</Link>
          <Link href="/admin/accounts" className="hover:underline">👤 Accounts</Link>
          <Link href="/admin/post" className="hover:underline">👤Post</Link>
          <Link href="/admin/beginnerquestions" className="hover:underline">❓ Beginner Questions</Link>
        </nav>
      </div>

      {/* Dim overlay */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-opacity-50 z-30"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-violet-900 shadow-lg z-10 relative">
        <div className="flex items-center space-x-3">
          <button onClick={() => setShowSidebar(true)} className="text-xl font-bold">&#9776;</button>
          <div className="w-10 h-10 bg-white rounded-full" />
          <span className="text-xl font-bold">Admin: Gelosu</span>
        </div>
        {hasMounted && <div className="text-sm">{currentTime}</div>}
      </header>

      {/* Page Content */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
