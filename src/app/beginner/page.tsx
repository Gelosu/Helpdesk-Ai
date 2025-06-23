'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function BeginnerInstructionsPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-700 text-white px-4 py-10 flex flex-col items-center">
      <div className="w-full max-w-2xl bg-gray-900 p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-4 text-center text-blue-500">
          Beginner Challenge Instructions
        </h1>

        <ul className="list-disc list-inside space-y-3 text-gray-300 text-base sm:text-lg">
          <li><strong className="text-white">Be honest</strong> in resolving tickets.</li>
          <li>You have <strong className="text-white">3 Quick Assists</strong> (highlighted answers or tips).</li>
          <li>Finish tickets as <strong className="text-white">quickly as possible</strong> — more tickets resolved in less time means more points.</li>
          <li>There are a <strong className="text-white">maximum of 30 questions</strong>.</li>
          <li>Each question has <strong className="text-white">4 options</strong> — and may allow multiple selections.</li>
        </ul>

        <div className="mt-8 text-center">
          <Link href="/beginner/questions">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg font-semibold transition-transform transform hover:scale-105">
              Let’s Begin!
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
