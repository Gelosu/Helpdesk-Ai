'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/components/navbar';
import bcrypt from 'bcryptjs';

export default function ProfileSettings() {
  const router = useRouter();
  const [userData, setUserData] = useState({
    id: 0,
    fname: '',
    lname: '',
    username: '',
    email: '',
    password: '',
    icon: '',
  });

  const [originalData, setOriginalData] = useState<typeof userData | null>(null);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [previewIcon, setPreviewIcon] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    const storedUsername = sessionStorage.getItem('username');
    if (!storedUsername) {
      router.push('/login');
      return;
    }

    (async () => {
      try {
        const res = await fetch(`/api/accounts?search=${storedUsername}`);
        const data = await res.json();
        const matchedUser = data.find((u: any) => u.username === storedUsername);
        if (matchedUser) {
          const fetchedData = {
            id: matchedUser.id,
            fname: matchedUser.fname,
            lname: matchedUser.lname,
            username: matchedUser.username,
            email: matchedUser.email,
            password: '••••••••',
            icon: matchedUser.icons || '',
          };
          setUserData(fetchedData);
          setOriginalData(fetchedData);
        }
      } catch (err) {
        console.error('Failed to fetch user data:', err);
      }
    })();

    setAchievements(['Coming soon...']);
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setUserData({ ...userData, [e.target.name]: e.target.value });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewIcon(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append('id', userData.id.toString());
      formData.append('fname', userData.fname);
      formData.append('lname', userData.lname);
      formData.append('username', userData.username);
      formData.append('email', userData.email);

      if (userData.password && userData.password !== '••••••••') {
        const regex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-])(?=.*\d).{8,}$/;
        if (!regex.test(userData.password)) {
          alert('Password must meet requirements.');
          return;
        }
        formData.append('password', userData.password);
      }

      if (selectedFile) {
        formData.append('icon', selectedFile);
      }

      const res = await fetch('/api/accounts/', {
        method: 'PUT',
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) {
        alert(result.error || 'Update failed.');
        return;
      }

      sessionStorage.setItem('username', userData.username);
      window.dispatchEvent(new Event('usernameUpdated'));
      alert('✅ Profile updated successfully!');
    } catch (err) {
      console.error('Update failed:', err);
      alert('An error occurred.');
    }
  };

  const handleDiscard = () => {
    if (originalData) {
      setUserData(originalData);
      setPreviewIcon(null);
      setSelectedFile(null);
    }
  };

  const hasChanges =
    (originalData &&
      (
        userData.fname !== originalData.fname ||
        userData.lname !== originalData.lname ||
        userData.username !== originalData.username ||
        userData.email !== originalData.email ||
        (userData.password && userData.password !== '••••••••')
      )) ||
    previewIcon !== null;

  return (
    <div className="min-h-screen bg-gray-800 text-white">
      <Navbar />
      <div className="px-4 sm:px-8 py-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">Profile Settings</h1>
        <div className="max-w-3xl mx-auto bg-gray-900 p-6 rounded-xl shadow-lg">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="relative w-50 h-60">
              <Image
                src={previewIcon || userData.icon}
                alt="Profile Icon"
                width={96}
                height={96}
                className="w-48 h-48 rounded-full object-cover border-2 border-white"
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
              <div>
                <label className="text-sm">Username</label>
                <input
                  name="username"
                  value={userData.username}
                  onChange={handleChange}
                  className="w-full bg-gray-800 rounded p-2 mt-1"
                />
              </div>
              <div>
                <label className="text-sm">Email</label>
                <input
                  type="email"
                  name="email"
                  value={userData.email}
                  onChange={handleChange}
                  className="w-full bg-gray-800 rounded p-2 mt-1"
                />
              </div>
              <div>
                <label className="text-sm">First Name</label>
                <input
                  name="fname"
                  value={userData.fname}
                  onChange={handleChange}
                  className="w-full bg-gray-800 rounded p-2 mt-1"
                />
              </div>
              <div>
                <label className="text-sm">Last Name</label>
                <input
                  name="lname"
                  value={userData.lname}
                  onChange={handleChange}
                  className="w-full bg-gray-800 rounded p-2 mt-1"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm">Password</label>
                <input
                  type="password"
                  name="password"
                  value={userData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-gray-800 rounded p-2 mt-1"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-2">
            {hasChanges && (
              <button
                onClick={handleDiscard}
                className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500"
              >
                Discard
              </button>
            )}
            <button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white font-semibold"
            >
              Save Changes
            </button>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-2">Achievements</h2>
            {achievements.length ? (
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                {achievements.map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No achievements yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
