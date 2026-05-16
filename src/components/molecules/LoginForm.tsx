"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bolt, Users, ArrowRight } from 'lucide-react';
import { RoleCard } from './RoleCard';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';

interface LoginFormProps {
  onRoleChange?: (role: 'athlete' | 'fan') => void;
}

export const LoginForm = ({ onRoleChange }: LoginFormProps) => {
  const [role, setRole] = useState<'athlete' | 'fan'>('athlete');
  const router = useRouter();

  const handleRoleSelect = (newRole: 'athlete' | 'fan') => {
    setRole(newRole);
    if (onRoleChange) {
      onRoleChange(newRole);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === 'fan') {
      router.push('/fan');
    } else {
      router.push('/athlete/overview');
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      {/* Tabs */}
      <div className="flex border-b border-white/10">
        <button 
          type="button"
          className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white transition-all cursor-pointer"
          onClick={() => router.push('/signup')}
        >
          Sign Up
        </button>
        <button 
          type="button"
          className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-white border-b-2 border-white cursor-pointer"
        >
          Log In
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight uppercase mb-2">
            Log in your account
          </h1>
          <p className="text-sm text-white/40">
            Please enter your email and password to continue.
          </p>
        </div>

        {/* Role Selection */}
        <div className="space-y-3">
          <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">I am a...</p>
          <div className="flex gap-4">
            <RoleCard 
              role="Athlete"
              description="Showcase + Earn"
              icon={<Bolt size={20} />}
              isActive={role === 'athlete'}
              onClick={() => handleRoleSelect('athlete')}
            />
            <RoleCard 
              role="Fan"
              description="Discover + Vote"
              icon={<Users size={20} />}
              isActive={role === 'fan'}
              onClick={() => handleRoleSelect('fan')}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Inputs */}
          <div className="space-y-4">
            <Input 
              label="Email"
              type="email"
              placeholder="you@example.com"
              required
            />
            <Input 
              label="Password"
              type="password"
              placeholder="••••••••"
              required
            />
          </div>

          {/* Action */}
          <Button type="submit" fullWidth className="group">
            LOG IN <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </form>

        {/* Footer */}
        <p className="text-center text-[10px] text-white/20 uppercase tracking-widest leading-loose">
          By continuing you agree to UAG's<br/>
          <a href="#" className="text-white/40 hover:text-white transition-colors">Terms</a> and <a href="#" className="text-white/40 hover:text-white transition-colors">Privacy</a>.
          <br/>
          Don't have an account? <Link href="/signup" className="text-white/40 hover:text-white transition-colors">Sign up</Link>
        </p>
      </div>
    </div>
  );
};
