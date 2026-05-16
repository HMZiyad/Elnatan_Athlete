"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { AdminInput } from '../../atoms/admin/AdminInput';
import { AdminButton } from '../../atoms/admin/AdminButton';

export const AdminForgotPasswordForm = () => {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/admin/verify');
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        <AdminInput 
          label="Email address"
          type="email"
          placeholder="esteban_schiller@gmail.com"
          required
        />
        
        <div className="pt-2">
          {/* Note: In the design the button says "Sign in" for some reason, but functionally it should proceed. Let's use "Sign in" to strictly match the design but it acts as a continue button */}
          <AdminButton type="submit" fullWidth>
            Sign in
          </AdminButton>
        </div>
      </form>
    </div>
  );
};
