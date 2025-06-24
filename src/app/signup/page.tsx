'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Swal from 'sweetalert2';

export default function SignupPage() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [icon, setIcon] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [errors, setErrors] = useState({
    passwordMismatch: false,
    passwordInvalid: false,
  });

  const [submitting, setSubmitting] = useState(false);

  const passwordRegex =
    /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+{}:;<>,.?~\\/-])(?=.*\d)[A-Za-z\d!@#$%^&*()_+{}:;<>,.?~\\/-]{8,}$/;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === 'password' || name === 'confirmPassword') {
      const isInvalid = !passwordRegex.test(name === 'password' ? value : form.password);
      const isMismatch =
        name === 'password' ? value !== form.confirmPassword : value !== form.password;

      setErrors({
        passwordInvalid: isInvalid,
        passwordMismatch: isMismatch,
      });
    }
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      const maxSize = 2 * 1024 * 1024;

      if (!allowedTypes.includes(file.type)) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid Image Type',
          text: 'Only JPG, PNG, WEBP, or GIF files are allowed.',
        });
        return;
      }

      if (file.size > maxSize) {
        Swal.fire({
          icon: 'error',
          title: 'File Too Large',
          text: 'Maximum image size is 2MB.',
        });
        return;
      }

      setIcon(file);
      setIconPreview(URL.createObjectURL(file));
    }
  };

  const isFormValid =
    form.firstName &&
    form.lastName &&
    form.username &&
    form.email &&
    passwordRegex.test(form.password) &&
    form.password === form.confirmPassword &&
    icon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('fname', form.firstName);
      formData.append('lname', form.lastName);
      formData.append('username', form.username);
      formData.append('email', form.email);
      formData.append('password', form.password);
      if (icon) formData.append('icon', icon);

      const res = await fetch('/api/signup', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Account Created',
          text: 'Redirecting to login...',
          timer: 2000,
          showConfirmButton: false,
        });
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Signup Failed',
          text: data.error || 'Something went wrong.',
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Server Error',
        text: 'An unexpected error occurred.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-800 px-4 py-4 relative">
      <div className="absolute top-4 left-4">
        <Link href="/" className="text-lg font-bold text-blue-500 hover:text-blue-300">
          HelpDesk AI
        </Link>
      </div>

      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-lg">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Create Your Account
          </h2>

          {/* Icon Upload */}
          <div className="flex flex-col items-center mb-6">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-24 h-24 rounded-full border-4 border-blue-500 flex items-center justify-center cursor-pointer overflow-hidden bg-gray-100 shadow-md hover:opacity-90"
            >
              {iconPreview ? (
                <img src={iconPreview} alt="Icon Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-400 text-sm text-center px-2">+</span>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-2">Click to add icon (required)</p>
            <input
              type="file"
              accept="image/*"
              onChange={handleIconChange}
              ref={fileInputRef}
              className="hidden"
              required
            />
          </div>

          <form className="space-y-4" onSubmit={handleSubmit} encType="multipart/form-data">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  className="mt-1 w-full px-4 py-2 border rounded-lg text-black"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  className="mt-1 w-full px-4 py-2 border rounded-lg text-black"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Preferred Username</label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                className="mt-1 w-full px-4 py-2 border rounded-lg text-black"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="mt-1 w-full px-4 py-2 border rounded-lg text-black"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="mt-1 w-full px-4 py-2 border rounded-lg text-black"
                required
              />
              {errors.passwordInvalid && (
                <p className="text-sm text-red-500 mt-1">
                  Password must be at least 8 characters, include a number, an uppercase letter, and
                  a special character.
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                className="mt-1 w-full px-4 py-2 border rounded-lg text-black"
                required
              />
              {errors.passwordMismatch && (
                <p className="text-sm text-red-500 mt-1">Passwords do not match.</p>
              )}
            </div>

            <button
              type="submit"
              disabled={!isFormValid || submitting}
              className={`w-full py-2 rounded-lg text-white font-semibold transition ${
                isFormValid && !submitting
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {submitting ? 'Creating...' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}