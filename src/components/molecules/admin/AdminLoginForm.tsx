"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AdminInput } from '../../atoms/admin/AdminInput';
import { AdminButton } from '../../atoms/admin/AdminButton';
import { apiCall } from '../../../utils/api';

export const AdminLoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiCall<{ data: { token: string } }>('/admin/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      localStorage.setItem('admin_token', response.data.token);
      localStorage.setItem('adminLoggedIn', 'true');
      localStorage.setItem('admin_email', email);
      router.push('/admin/overview');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
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
        </div>

        <div className="flex items-center justify-between text-sm">
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

        <AdminButton type="submit" fullWidth disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </AdminButton>
      </form>

      <div className="mt-8 text-center text-sm text-gray-500">
        Don't have any account?{' '}
        <Link href="/admin/signup" className="text-gray-900 font-medium hover:underline">
          Create an Account
        </Link>
      </div>
    </div>
  );
};
