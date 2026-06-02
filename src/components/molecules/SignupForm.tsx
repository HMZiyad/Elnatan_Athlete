"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bolt, Users, ArrowRight } from 'lucide-react';
import { RoleCard } from './RoleCard';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { apiCall } from '../../utils/api';

interface SignupFormProps {
  onRoleChange?: (role: 'athlete' | 'fan') => void;
}

export const SignupForm = ({ onRoleChange }: SignupFormProps) => {
  const [role, setRole] = useState<'athlete' | 'fan'>('athlete');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRoleSelect = (newRole: 'athlete' | 'fan') => {
    setRole(newRole);
    if (onRoleChange) {
      onRoleChange(newRole);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Clear old session elements
    localStorage.removeItem('uag_token');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');

    try {
      // 1. Register user
      await apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          full_name: fullName,
          email: email,
          password: password,
          role: role,
        }),
      });

      if (role === 'fan') {
        router.push('/login?registered=true');
      } else {
        // 2. Automatically log in to retrieve token
        const loginRes = await apiCall<{ data: { token: string; user: { role: string } } }>('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password, role }),
        });

        localStorage.setItem('uag_token', loginRes.data.token);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userRole', loginRes.data.user.role);
        router.push('/athlete/onboarding');
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    localStorage.removeItem('uag_token');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
  }, []);


  return (
    <div className="w-full max-w-md space-y-8">
      {/* Tabs */}
      <div className="flex border-b border-white/10">
        <button 
          type="button"
          className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-white border-b-2 border-white cursor-pointer"
        >
          Sign Up
        </button>
        <button 
          type="button"
          className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white transition-all cursor-pointer"
          onClick={() => router.push('/login')}
        >
          Log In
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight uppercase mb-2">
            Create Account
          </h1>
          <p className="text-sm text-white/40">
            Three steps to your shot.
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

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Inputs */}
          <div className="space-y-4">
            <Input 
              label="Full Name"
              type="text"
              placeholder="Maya Reyes"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              disabled={loading}
            />
            <Input 
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
            <Input 
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {/* Action */}
          <Button type="submit" fullWidth className="group uppercase" disabled={loading}>
            {loading ? 'Registering...' : `Join as ${role}`} <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </form>

        {/* Footer */}
        <p className="text-center text-[10px] text-white/20 uppercase tracking-widest leading-loose">
          By continuing you agree to UAG's<br/>
          <a href="#" className="text-white/40 hover:text-white transition-colors">Terms</a> and <a href="#" className="text-white/40 hover:text-white transition-colors">Privacy</a>.
          <br/>
          Already have an account? <Link href="/login" className="text-white/40 hover:text-white transition-colors">Log in</Link>
        </p>
      </div>
    </div>
  );
};
