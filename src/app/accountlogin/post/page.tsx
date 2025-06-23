'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PostPage() {
  const [username, setUsername] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [postText, setPostText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedBadge, setSelectedBadge] = useState('');
  const router = useRouter();

  useEffect(() => {
    const storedUser = sessionStorage.getItem('username');
    const storedId = sessionStorage.getItem('user_id');
    setUsername(storedUser);
    if (storedId) {
      setUserId(Number(storedId));
    }
  }, []);

  const handlePostSubmit = async () => {
    if (postText.trim() === '') return;
    if (!userId) {
      alert('User ID missing. Please log in again.');
      return;
    }

    const formData = new FormData();
    formData.append('user_id', userId.toString());
    formData.append('content', postText);
    formData.append('badge', selectedBadge || '');

    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      const response = await fetch('/api/post', {
       
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        alert('✅ Post created successfully!');
        setPostText('');
        setSelectedBadge('');
        setImageFile(null);
      } else {
        console.error('Server error:', result.error || 'Failed to post.');
      }
    } catch (error) {
      console.error('Client error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-2xl mx-auto bg-gray-900 p-6 rounded-lg shadow">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 rounded-full bg-gray-500 mr-3" />
          <span className="font-bold">{username || 'User'}</span>
        </div>

        <textarea
          className="w-full p-3 rounded bg-gray-800 text-white mb-3 resize-none"
          rows={4}
          maxLength={250}
          placeholder="What's on your mind?"
          value={postText}
          onChange={(e) => setPostText(e.target.value)}
        />

        <div className="flex items-center justify-between flex-wrap gap-2">
          <select
            className="p-2 rounded bg-gray-700 text-white"
            value={selectedBadge}
            onChange={(e) => setSelectedBadge(e.target.value)}
          >
            <option value="">🎖 Share Achievement</option>
            <option value="Beginner Badge">Beginner Badge</option>
            <option value="Fast Responder">Fast Responder</option>
            <option value="Bug Buster">Bug Buster</option>
          </select>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && file.size > 3 * 1024 * 1024) {
                alert('Max file size is 3MB.');
              } else {
                setImageFile(file || null);
              }
            }}
            className="text-sm text-gray-300"
          />

          <button
            onClick={handlePostSubmit}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white"
          >
            Create Post
          </button>
        </div>
      </div>
    </div>
  );
}
