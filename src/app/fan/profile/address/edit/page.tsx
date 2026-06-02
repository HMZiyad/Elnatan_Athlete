"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, MapPin } from 'lucide-react';
import { FanNavbar } from '@/components/organisms/fan/FanNavbar';
import { FanFooter } from '@/components/organisms/fan/FanFooter';
import { apiCall } from '@/utils/api';

function EditAddressContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const addressId = searchParams.get('id');

  const [label, setLabel] = useState('Home');
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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!addressId) {
      setError('No address ID provided.');
      setLoading(false);
      return;
    }

    const fetchAddress = async () => {
      try {
        setLoading(true);
        const res = await apiCall<{ data: any[] }>('/users/me/addresses');
        const address = res.data.find((a) => a.id === addressId);
        
        if (!address) {
          setError('Address not found.');
          return;
        }

        setLabel(address.label || 'Home');
        const parts = (address.full_name || '').split(' ');
        setFirstName(parts[0] || '');
        setLastName(parts.slice(1).join(' ') || '');
        
        // If street contains a comma, try to split it into address line 1 and 2
        const streetParts = (address.street || '').split(',');
        setAddressLine1(streetParts[0]?.trim() || '');
        setAddressLine2(streetParts.slice(1).join(',')?.trim() || '');

        setCity(address.city || '');
        setState(address.state || '');
        setZip(address.zip || '');
        setCountry(address.country || 'US');
        setPhone(address.phone || '');
        setIsDefault(address.is_default || false);
      } catch (err: any) {
        setError(err.message || 'Failed to load address.');
      } finally {
        setLoading(false);
      }
    };

    fetchAddress();
  }, [addressId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressId) return;
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const fullName = `${firstName} ${lastName}`.trim();
      const street = addressLine2 ? `${addressLine1}, ${addressLine2}` : addressLine1;

      await apiCall(`/users/me/addresses/${addressId}`, {
        method: 'PUT',
        body: JSON.stringify({
          label,
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

      setSuccess('Address updated successfully! Redirecting...');
      setTimeout(() => {
        router.push('/fan/profile?tab=address');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update address.');
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!addressId) return;
    if (!confirm('Are you sure you want to delete this address?')) return;
    
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      await apiCall(`/users/me/addresses/${addressId}`, {
        method: 'DELETE',
      });

      setSuccess('Address deleted successfully! Redirecting...');
      setTimeout(() => {
        router.push('/fan/profile?tab=address');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to delete address.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-white/40 uppercase tracking-widest text-xs">
        Loading address data...
      </div>
    );
  }

  return (
    <div className="bg-[#121212] rounded-3xl p-6 md:p-10 border border-white/5">
      <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
        <h2 className="text-xl font-bold uppercase">Address Form</h2>
        <button 
          type="button"
          onClick={handleDelete}
          disabled={saving}
          className="text-red-500 font-bold hover:bg-red-500/10 px-4 py-2 rounded-lg transition-colors text-sm cursor-pointer"
        >
          Delete Address
        </button>
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

      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-white/40 uppercase tracking-widest">First Name</label>
            <input 
              type="text" 
              value={firstName} 
              onChange={(e) => setFirstName(e.target.value)}
              required
              disabled={saving}
              className="w-full bg-dark-400 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Last Name</label>
            <input 
              type="text" 
              value={lastName} 
              onChange={(e) => setLastName(e.target.value)}
              required
              disabled={saving}
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
              value={addressLine1} 
              onChange={(e) => setAddressLine1(e.target.value)}
              required
              disabled={saving}
              className="w-full bg-dark-400 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-white/30" 
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Address Line 2 (Optional)</label>
          <input 
            type="text" 
            value={addressLine2} 
            onChange={(e) => setAddressLine2(e.target.value)}
            disabled={saving}
            className="w-full bg-dark-400 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30" 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-white/40 uppercase tracking-widest">City</label>
            <input 
              type="text" 
              value={city} 
              onChange={(e) => setCity(e.target.value)}
              required
              disabled={saving}
              className="w-full bg-dark-400 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-white/40 uppercase tracking-widest">State / Province</label>
            <input 
              type="text" 
              value={state} 
              onChange={(e) => setState(e.target.value)}
              disabled={saving}
              className="w-full bg-dark-400 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Zip / Postal Code</label>
            <input 
              type="text" 
              value={zip} 
              onChange={(e) => setZip(e.target.value)}
              required
              disabled={saving}
              className="w-full bg-dark-400 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Country</label>
            <select 
              value={country} 
              onChange={(e) => setCountry(e.target.value)}
              disabled={saving}
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
            value={phone} 
            onChange={(e) => setPhone(e.target.value)}
            disabled={saving}
            className="w-full bg-dark-400 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30" 
          />
        </div>

        <label className="flex items-center gap-3 cursor-pointer mt-4">
          <input 
            type="checkbox" 
            checked={isDefault} 
            onChange={(e) => setIsDefault(e.target.checked)}
            disabled={saving}
            className="w-5 h-5 rounded border-white/20 bg-dark-400 accent-primary" 
          />
          <span className="text-sm text-white/80">Set as default shipping address</span>
        </label>

        <div className="pt-6 border-t border-white/5 flex gap-4">
          <button 
            type="submit" 
            disabled={saving}
            className="flex-1 bg-white text-black font-bold py-4 rounded-xl hover:bg-white/90 transition-all cursor-pointer text-center text-sm"
          >
            {saving ? 'Updating...' : 'Update Address'}
          </button>
          <Link href="/fan/profile?tab=address" className="flex-1 bg-transparent border border-white/20 text-white font-bold py-4 rounded-xl hover:bg-white/5 transition-colors text-center text-sm">
            Cancel
          </Link>
        </div>

      </form>
    </div>
  );
}

export default function EditAddressPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A] text-white">
      <FanNavbar />
      
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <Link href="/fan/profile?tab=address" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-8 text-sm font-medium">
          <ChevronLeft size={16} />
          Back to Address Book
        </Link>

        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold font-heading uppercase tracking-tight text-white mb-2">Edit Address</h1>
          <p className="text-white/60">Update your shipping or billing address details below.</p>
        </div>

        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        }>
          <EditAddressContent />
        </Suspense>
      </main>

      <FanFooter />
    </div>
  );
}
