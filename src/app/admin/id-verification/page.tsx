"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AdminLayout } from '@/components/templates/admin-view/AdminLayout';
import { Search, MapPin } from 'lucide-react';
import { apiCall } from '@/utils/api';

export default function AdminVerificationPage() {
  const [athletes, setAthletes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchVerifications = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch only pending verifications
      const res = await apiCall<{ data: any[] }>(
        `/admin/verifications?status=pending&search=${encodeURIComponent(searchQuery)}`
      );
      setAthletes(res.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load pending verifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchVerifications();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleDecline = async (verificationId: string) => {
    if (!confirm('Are you sure you want to decline this verification request?')) return;

    try {
      await apiCall(`/admin/verifications/${verificationId}`, {
        method: 'PUT',
        body: JSON.stringify({ decision: 'rejected', notes: 'Decline from verification dashboard list.' }),
      });
      fetchVerifications();
    } catch (err: any) {
      alert(err.message || 'Failed to reject verification request');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-12">
        {/* Title Section */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-black mb-1">ID Verification</h1>
            <p className="text-sm text-gray-400 font-medium tracking-tight">Review and manage submitted ID verifications</p>
          </div>
          <div className="flex items-center gap-3 bg-gray-50 px-6 py-3 rounded-xl border border-gray-100">
            <span className="text-sm font-bold text-black">Pending Verification</span>
            <span className="bg-gray-200 text-black text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center">
              {athletes.length}
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by athlete name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-100 rounded-xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-black/20"
            />
          </div>
        </div>

        {/* Error handling */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-4 rounded-xl">
            {error}
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-black mb-4"></div>
            <p className="text-gray-500 text-sm">Loading pending verifications...</p>
          </div>
        ) : athletes.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm p-12">
            <p className="text-gray-500 font-bold mb-2">No pending verifications</p>
            <p className="text-gray-400 text-xs">All athlete profiles are currently processed.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {athletes.map((athlete) => {
              const image = athlete.avatar_url
                ? (athlete.avatar_url.startsWith('http') ? athlete.avatar_url : `http://localhost:8080${athlete.avatar_url}`)
                : '/assets/athelete_auth.png';

              return (
                <div key={athlete.verification_id} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 flex flex-col items-center text-center group hover:shadow-xl hover:shadow-black/5 transition-all">
                  <div className="w-32 h-32 rounded-full overflow-hidden mb-6 border-4 border-gray-50 group-hover:border-black/5 transition-all relative">
                    <Image src={image} alt={athlete.full_name} fill className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-black mb-1">{athlete.full_name}</h3>
                  <div className="flex items-center gap-1 text-gray-400 mb-6 font-medium text-sm">
                    <MapPin size={14} />
                    <span>{athlete.location || 'USA'}</span>
                  </div>

                  <div className="flex gap-2 mb-10">
                    <span className="px-4 py-1.5 bg-gray-50 text-gray-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-gray-100">
                      {athlete.sport}
                    </span>
                    <span className="px-4 py-1.5 bg-gray-50 text-gray-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-gray-100">
                      {athlete.status}
                    </span>
                  </div>

                  <div className="flex gap-3 w-full">
                    <Link 
                      href={`/admin/id-verification/${athlete.verification_id}`}
                      className="flex-1 bg-green-500 text-white font-bold py-3 rounded-xl hover:bg-green-600 transition-all text-xs uppercase tracking-widest flex items-center justify-center"
                    >
                      Review
                    </Link>
                    <button 
                      onClick={() => handleDecline(athlete.verification_id)}
                      className="flex-1 bg-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-600 transition-all text-xs uppercase tracking-widest"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
