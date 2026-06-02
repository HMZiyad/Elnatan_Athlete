"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AdminInput } from '../../atoms/admin/AdminInput';
import { AdminButton } from '../../atoms/admin/AdminButton';
import { apiCall } from '../../../utils/api';

export const AdminSignupForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      // 1. Create admin account
      await apiCall('/admin/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, confirm_password: confirmPassword }),
      });

      // 2. Automatically log in
      const loginRes = await apiCall<{ data: { token: string } }>('/admin/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      localStorage.setItem('admin_token', loginRes.data.token);
      localStorage.setItem('adminLoggedIn', 'true');
      localStorage.setItem('admin_email', email);
      router.push('/admin/overview');
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <AdminInput 
          label="Email address"
          type="email"
          placeholder="esteban_schiller@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
        <AdminInput 
          label="Password"
          type="password"
          placeholder="*********"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />
        <AdminInput 
          label="Confirm Password"
          type="password"
          placeholder="*********"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={loading}
        />

        <div className="flex items-center justify-between text-sm pt-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black/10 accent-black cursor-pointer"
            />
            <span className="text-gray-700">Remember Password</span>
          </label>
          <Link 
            href="/admin/forgot-password" 
            className="text-gray-900 font-medium hover:underline"
          >
            Forget Password?
          </Link>
        </div>

        <div className="pt-2">
          <AdminButton type="submit" fullWidth disabled={loading}>
            {loading ? 'Creating account...' : 'Sign up'}
          </AdminButton>
        </div>
      </form>

      <div className="mt-8 text-center text-sm text-gray-500">
        Already have Account?{' '}
        <Link href="/admin/login" className="text-gray-900 font-medium hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
};
