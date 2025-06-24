'use client';

import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import Navbar from '@/app/components/navbar';

export default function ContactForm() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);

  useEffect(() => {
    const storedUsername = sessionStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);

      fetch(`/api/accounts?search=${encodeURIComponent(storedUsername)}`)
        .then((res) => res.json())
        .then((data) => {
          const user = data.find((u: any) => u.username === storedUsername);
          if (user && user.email) setEmail(user.email);
        })
        .catch(() => console.error('Failed to fetch user email'));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('description', description);
    if (attachment) formData.append('attachment', attachment);

    const res = await fetch('/api/contact', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();

    if (res.ok) {
      Swal.fire('Success!', `Your message was sent to the admin.\nTicket No: ${data.ticketNumber || 'N/A'}`, 'success');
      setDescription('');
      setAttachment(null);
      const inputFile = document.getElementById('attachment') as HTMLInputElement;
      if (inputFile) inputFile.value = '';
    } else {
      Swal.fire('Error', data.error || 'Something went wrong.', 'error');
    }
  };

  const maskEmail = (email: string) => {
    const [user] = email.split('@');
    return `${'*'.repeat(user.length)}@gmail.com`;
  };

  return (
    <div className="min-h-screen bg-gray-800">
      <Navbar />

      <div className="flex justify-center items-center pt-10 px-4">
        <div className="bg-gray-900 p-6 rounded-xl shadow-lg w-full max-w-md text-white">
          <h2 className="text-xl font-bold mb-4 text-center">📨 Contact Admin</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={username}
              readOnly
              className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-gray-400 cursor-not-allowed"
            />
            <input
              type="text"
              value={maskEmail(email)}
              readOnly
              className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-gray-400 cursor-not-allowed"
            />
            <textarea
              placeholder="Describe your concern..."
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 h-32 rounded bg-gray-800 border border-gray-700 resize-none focus:outline-none"
            />
            <input
              type="file"
              accept="image/*"
              id="attachment"
              onChange={(e) => setAttachment(e.target.files?.[0] || null)}
              className="w-full p-2 rounded bg-gray-800 text-sm text-gray-300 border border-gray-700 file:bg-violet-700 file:text-white file:rounded file:px-3 file:py-1"
            />
            <button
              type="submit"
              className="w-full bg-violet-700 hover:bg-violet-800 py-2 rounded font-semibold"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
