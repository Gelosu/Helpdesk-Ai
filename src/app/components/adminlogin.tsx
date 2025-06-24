'use client';

import { useState, useEffect } from 'react';
import bcrypt from 'bcryptjs';

interface Props {
  onSuccess: () => void;
}

export default function AdminLogin({ onSuccess }: Props) {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const res = await fetch(`/api/accounts?search=${encodeURIComponent(credentials.username)}`);
      const users = await res.json();

      const user = users.find((u: any) => u.username === credentials.username);
      if (!user) {
        setError('User not found');
        return;
      }

      if (credentials.username !== 'admin01') {
        setError('Unauthorized user');
        return;
      }

      const match = await bcrypt.compare(credentials.password, user.password.hash);
      if (!match) {
        setError('Incorrect password');
        return;
      }

      sessionStorage.setItem('admin_auth', 'true');
      onSuccess();
    } catch {
      setError('Failed to login');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
      <div className="bg-gray-900 p-6 rounded-xl shadow-lg w-80 text-white">
        <h2 className="text-xl font-bold mb-4 text-center">Admin Login</h2>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Username"
            value={credentials.username}
            onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
            className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            value={credentials.password}
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:outline-none"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            onClick={handleLogin}
            className="w-full bg-violet-700 hover:bg-violet-800 py-2 rounded font-semibold mt-2"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}
