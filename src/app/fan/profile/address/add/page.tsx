"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, MapPin } from 'lucide-react';
import { FanNavbar } from '@/components/organisms/fan/FanNavbar';
import { FanFooter } from '@/components/organisms/fan/FanFooter';
import { apiCall } from '@/utils/api';

export default function AddAddressPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('US');
  const [phone, setPhone] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const fullName = `${firstName} ${lastName}`.trim();
      const street = addressLine2 ? `${addressLine1}, ${addressLine2}` : addressLine1;

      await apiCall('/users/me/addresses', {
        method: 'POST',
        body: JSON.stringify({
          label: isDefault ? 'Home' : 'Shipping',
          full_name: fullName,
          street,
          city,
          state,
          zip,
          country,
          phone,
          is_default: isDefault,
        }),
      });

      setSuccess('Address added successfully! Redirecting...');
      setTimeout(() => {
        router.push('/fan/profile?tab=address');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to create address.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A] text-white">
      <FanNavbar />
      
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <Link href="/fan/profile?tab=address" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-8 text-sm font-medium">
          <ChevronLeft size={16} />
          Back to Address Book
        </Link>

        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold font-heading uppercase tracking-tight text-white mb-2">Add New Address</h1>
          <p className="text-white/60">Enter your shipping or billing address details below.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        <div className="bg-[#121212] rounded-3xl p-6 md:p-10 border border-white/5">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest">First Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Jon" 
                  value={firstName} 
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full bg-dark-400 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Last Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Kabir" 
                  value={lastName} 
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full bg-dark-400 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Address Line 1</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40">
                  <MapPin size={18} />
                </div>
                <input 
                  type="text" 
                  placeholder="Street address or P.O. Box" 
                  value={addressLine1} 
                  onChange={(e) => setAddressLine1(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full bg-dark-400 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-white/30" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Address Line 2 (Optional)</label>
              <input 
                type="text" 
                placeholder="Apartment, suite, unit, building, floor, etc." 
                value={addressLine2} 
                onChange={(e) => setAddressLine2(e.target.value)}
                disabled={loading}
                className="w-full bg-dark-400 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30" 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest">City</label>
                <input 
                  type="text" 
                  placeholder="e.g. New York" 
                  value={city} 
                  onChange={(e) => setCity(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full bg-dark-400 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest">State / Province</label>
                <input 
                  type="text" 
                  placeholder="e.g. NY" 
                  value={state} 
                  onChange={(e) => setState(e.target.value)}
                  disabled={loading}
                  className="w-full bg-dark-400 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Zip / Postal Code</label>
                <input 
                  type="text" 
                  placeholder="e.g. 10001" 
                  value={zip} 
                  onChange={(e) => setZip(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full bg-dark-400 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Country</label>
                <select 
                  value={country} 
                  onChange={(e) => setCountry(e.target.value)}
                  disabled={loading}
                  className="w-full bg-dark-400 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 appearance-none"
                >
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="UK">United Kingdom</option>
                  <option value="AU">Australia</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Phone Number</label>
              <input 
                type="tel" 
                placeholder="+1 (555) 000-0000" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
                className="w-full bg-dark-400 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30" 
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer mt-4">
              <input 
                type="checkbox" 
                checked={isDefault} 
                onChange={(e) => setIsDefault(e.target.checked)}
                disabled={loading}
                className="w-5 h-5 rounded border-white/20 bg-dark-400 accent-primary" 
              />
              <span className="text-sm text-white/80">Set as default shipping address</span>
            </label>

            <div className="pt-6 border-t border-white/5 flex gap-4">
              <button 
                type="submit" 
                disabled={loading}
                className="flex-1 bg-white text-black font-bold py-4 rounded-xl hover:bg-white/90 transition-all cursor-pointer text-center text-sm"
              >
                {loading ? 'Saving...' : 'Save Address'}
              </button>
              <Link href="/fan/profile?tab=address" className="flex-1 bg-transparent border border-white/20 text-white font-bold py-4 rounded-xl hover:bg-white/5 transition-colors text-center text-sm">
                Cancel
              </Link>
            </div>

          </form>
        </div>
      </main>

      <FanFooter />
    </div>
  );
}
