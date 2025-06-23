'use client';

import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const [registeredUsers, setRegisteredUsers] = useState<number>(0);
  const [activeUsers] = useState<number>(87); // You can replace this later with real logic
  const [logs] = useState<string[]>([
    'Accessed Admin Page',
    'Viewed Questions List',
    'Last login from IP: 192.168.1.5',
  ]);

  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const res = await fetch('/api/accounts');
        const data = await res.json();
        setRegisteredUsers(data.length);
      } catch (error) {
        console.error('Failed to fetch user count:', error);
      }
    };

    fetchUserCount();
  }, []);

  return (
    <div className="grid md:grid-cols-3 gap-6 text-center">
      <div className="bg-violet-800 p-6 rounded shadow">
        <h2 className="text-xl font-bold">Registered Users</h2>
        <p className="text-3xl">{registeredUsers}</p>
      </div>

      <div className="bg-violet-800 p-6 rounded shadow">
        <h2 className="text-xl font-bold">Active Users</h2>
        <p className="text-3xl">{activeUsers}</p>
      </div>

      <div className="bg-violet-800 p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-2">Logs</h2>
        <ul className="text-left list-disc list-inside space-y-1">
          {logs.map((log, i) => (
            <li key={i}>{log}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
