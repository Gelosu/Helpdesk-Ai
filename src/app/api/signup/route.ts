'use client';

import { useState } from 'react';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fname: '',
    lname: '',
    username: '',
    email: '',
    password: '',
  });

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      const maxSize = 2 * 1024 * 1024;

      if (!allowedTypes.includes(selected.type)) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid Image Type',
          text: 'Only JPG, PNG, WEBP, or GIF files are allowed.',
        });
        return;
      }

      if (selected.size > maxSize) {
        Swal.fire({
          icon: 'error',
          title: 'File Too Large',
          text: 'Maximum image size is 2MB.',
        });
        return;
      }

      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      Swal.fire({ icon: 'error', title: 'Missing Profile Image' });
      return;
    }

    const formData = new FormData();
    formData.append('fname', form.fname);
    formData.append('lname', form.lname);
    formData.append('username', form.username);
    formData.append('email', form.email);
    formData.append('password', form.password);
    formData.append('icon', file);

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) {
        Swal.fire({
          icon: 'error',
          title: 'Signup Failed',
          text: result.error || 'Something went wrong.',
        });
        return;
      }

      Swal.fire({
        icon: 'success',
        title: 'Account Created',
        text: 'Redirecting to login...',
        timer: 2000,
        showConfirmButton: false,
      });

      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error) {
      console.error('Signup error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Server Error',
        text: 'Try again later.',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-gray-800 p-6 rounded-lg shadow-md space-y-4"
      >
        <h2 className="text-2xl font-bold text-center mb-4">Sign Up</h2>

        <input
          type="text"
          name="fname"
          placeholder="First Name"
          value={form.fname}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-700"
          required
        />
        <input
          type="text"
          name="lname"
          placeholder="Last Name"
          value={form.lname}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-700"
          required
        />
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-700"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-700"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-700"
          required
        />

        <div className="text-center">
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Preview"
              className="w-24 h-24 rounded-full object-cover mx-auto mb-2"
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full text-sm"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded text-white font-semibold"
        >
          Create Account
        </button>
      </form>
    </div>
  );
}