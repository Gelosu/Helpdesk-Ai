'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/app/components/navbar';
import Image from 'next/image';
import Loading from '@/app/components/loading';

const ITEMS_PER_PAGE = 2;

export default function HistoryPage() {
  const [username, setUsername] = useState('');
  const [userIcon, setUserIcon] = useState('/icon/defaulticon.jpg');
  const [results, setResults] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState({
    totalSolved: 0,
    averageTime: '0s',
  });
  const [latestAchievement, setLatestAchievement] = useState<string>('📘 Beginner');
  const [activeRate, setActiveRate] = useState<number>(100);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedId = sessionStorage.getItem('user_id');
    if (!storedId) {
      setLoading(false);
      return;
    }

    const fetchUserData = async () => {
      try {
        const userRes = await fetch(`/api/accounts?id=${storedId}`);
        if (!userRes.ok) throw new Error('Failed to fetch user');
        const userData = await userRes.json();

        setUsername(userData.username || 'Guest');
        setUserIcon(userData.icons || '/icon/defaulticon.jpg');

        const resultRes = await fetch('/api/results');
        const resultData = await resultRes.json();

        if (!resultData.success) {
          setLoading(false);
          return;
        }

        const userResults = resultData.results.filter((r: any) => r.username === userData.username);
        setResults(userResults);

        const maxCorrect = userResults.reduce((max: number, r: any) => Math.max(max, r.correct_answers), 0);
        const averageTime = userResults.length
          ? (
              userResults.reduce((acc: number, r: any) => acc + parseFloat(r.average_time_per_question), 0) / userResults.length
            ).toFixed(2)
          : '0.00';

        setStats({
          totalSolved: maxCorrect,
          averageTime: `${averageTime}s`,
        });

        const maxPoints = userResults.reduce((max: number, r: any) => Math.max(max, r.total_points), 0);
        setLatestAchievement(getAchievement(maxPoints));

        if (userResults.length > 0) {
          const latest = userResults[0];
          const lastLogin = new Date(latest.answered_at);
          const today = new Date();
          const dayDiff = Math.floor((+today - +lastLogin) / (1000 * 60 * 60 * 24));
          let active = 100 - dayDiff * 0.01;
          if (active < 75) active = 75;
          setActiveRate(parseFloat(active.toFixed(2)));
        }

        setLoading(false);
      } catch (err) {
        console.error('❌ Failed to load user or results:', err);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const getAchievement = (points: number) => {
    return points >= 270
      ? '🌟 Master Resolver'
      : points >= 200
      ? '🏆 Ticket Pro'
      : points >= 100
      ? '🎯 On the Way'
      : '📘 Beginner';
  };

  const getActiveRateColor = (rate: number) => {
    if (rate < 80) return 'bg-red-600';
    if (rate < 90) return 'bg-yellow-500';
    return 'bg-green-600';
  };

  const totalPages = Math.ceil(results.length / ITEMS_PER_PAGE);
  const paginatedResults = results.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-800 text-white">
      <Navbar />

      <div className="flex justify-center items-start pt-10 px-4">
        <div className="bg-gray-900 p-6 rounded-xl shadow-lg w-full max-w-2xl">
          {/* Username + Avatar */}
          <div className="flex items-center gap-4 mb-6">
            <Image
                src={userIcon}
                alt="User Icon"
                width={50}
                height={50}
                className="rounded-full object-cover border border-white"
                style={{ aspectRatio: '1 / 1' }}
                />

            <h2 className="text-xl font-bold">{username}</h2>
          </div>

          {/* Performance Summary */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Latest Performance Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800 p-4 rounded shadow text-center">
                <p className="text-2xl font-bold">{stats.totalSolved}</p>
                <p className="text-sm text-gray-400">Tickets Resolved</p>
              </div>
              <div className="bg-gray-800 p-4 rounded shadow text-center">
                <p className="text-2xl font-bold">{stats.averageTime}</p>
                <p className="text-sm text-gray-400">Average Time</p>
              </div>
              <div className="bg-gray-800 p-4 rounded shadow text-center">
                <p className="text-2xl font-bold">{latestAchievement}</p>
                <p className="text-sm text-gray-400">Highest Achievement</p>
              </div>
              <div className="bg-gray-800 p-4 rounded shadow text-center">
                <p className="text-2xl font-bold">
                  <span className={`inline-block px-2 py-0.5 rounded-full ${getActiveRateColor(activeRate)}`}>
                    {activeRate.toFixed(2)}%
                  </span>
                </p>
                <p className="text-sm text-gray-400">Active Rate</p>
              </div>
            </div>
          </div>

          {/* Challenge History */}
          <h3 className="text-lg font-semibold mb-2">Previous Challenges</h3>
          <ul className="space-y-2 mb-4">
            {paginatedResults.map((entry, i) => {
              const totalAnswered = entry.total_points / 10;
              const avgSpeed = entry.total_points > 0
                ? parseFloat(entry.average_time_per_question).toFixed(2)
                : '0.00';
              const achievement = getAchievement(entry.total_points);

              return (
                <li key={i} className="bg-gray-800 p-3 rounded shadow space-y-1">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold"></p>
                      <p className="text-xs text-gray-400">
                        {new Date(entry.answered_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-sm font-semibold px-3 py-1 rounded-full bg-green-600 text-white">
                      Beginner Challenge ✅
                    </span>
                  </div>
                  <div className="text-xs text-gray-300 pl-1">
                    <p>Total Answered: {totalAnswered}</p>
                    <p>Average Speed: {avgSpeed}s</p>
                    <p>Achievement: {achievement}</p>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-2">
              <button
                className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-40"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Prev
              </button>
              <span className="text-sm text-gray-300 px-2 py-1">
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-40"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
