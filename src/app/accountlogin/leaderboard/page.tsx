'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/app/components/navbar';
import Image from 'next/image';

const ITEMS_PER_PAGE = 10;

type LeaderboardUser = {
  id: number;
  username: string;
  icon: string;
  overallPoints: number;
  averageSpeed: string;
  rank?: number;
};

export default function LeaderboardPage() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch('/api/leaderboard');
        const data = await res.json();

        const sorted = data
          .sort((a: LeaderboardUser, b: LeaderboardUser) => b.overallPoints - a.overallPoints)
          .map((user: LeaderboardUser, index: number) => ({
            ...user,
            rank: index + 1,
          }));

        setUsers(sorted);
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const totalPages = Math.ceil(users.length / ITEMS_PER_PAGE);
  const paginatedUsers = users.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getAchievement = (points: number) => {
    if (points >= 270) return '🌟 Master Resolver';
    if (points >= 200) return '🏆 Ticket Pro';
    if (points >= 100) return '🎯 On the Way';
    return '📘 Beginner';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-400">🏆 Leaderboard</h1>

        {loading ? (
          <p className="text-center text-gray-400">Loading...</p>
        ) : (
          <>
            <ul className="space-y-2">
              {paginatedUsers.map((user) => (
                <li
                  key={user.id}
                  className="flex flex-wrap sm:flex-nowrap items-center bg-gray-800 p-3 rounded shadow text-sm sm:text-base"
                >
                  <div className="flex items-center gap-3 min-w-[200px]">
                    <span className="text-lg font-bold text-yellow-400">RANK #{user.rank}</span>
                    <Image
                      src={user.icon || '/icon/defaulticon.jpg'}
                      alt={`${user.username} Avatar`}
                      width={35}
                      height={35}
                      className="w-[35px] h-[35px] rounded-full object-cover"
                    />
                    <span className="font-semibold text-white">{user.username}</span>
                  </div>

                  <div className="flex flex-wrap sm:flex-nowrap gap-4 sm:gap-6 ml-4 mt-2 sm:mt-0 text-gray-300">
                    <span>
                      Total Points:{' '}
                      <span className="text-white font-bold">{user.overallPoints}</span>
                    </span>
                    <span>
                      Avg Speed:{' '}
                      <span className="text-white font-bold">{user.averageSpeed}s</span>
                    </span>
                    <span>
                      Achievement:{' '}
                      <span className="text-white">{getAchievement(user.overallPoints)}</span>
                    </span>
                  </div>
                </li>
              ))}
            </ul>

            {/* Pagination */}
            <div className="flex justify-center gap-3 mt-6">
              <button
                className="px-4 py-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-40"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Prev
              </button>
              <span className="text-gray-300 text-sm py-1">
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="px-4 py-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-40"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
