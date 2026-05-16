"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AdminInput } from '../../atoms/admin/AdminInput';
import { AdminButton } from '../../atoms/admin/AdminButton';

export const AdminLoginForm = () => {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/admin/overview');
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <AdminInput 
            label="Email address"
            type="email"
            placeholder="esteban_schiller@gmail.com"
            required
          />
          <AdminInput 
            label="Password"
            type="password"
            placeholder="*********"
            required
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

        <AdminButton type="submit" fullWidth>
          Sign in
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
