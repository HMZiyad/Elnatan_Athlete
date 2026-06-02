"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { AdminLayout } from '@/components/templates/admin-view/AdminLayout';
import { Search, Filter, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { apiCall } from '@/utils/api';

export default function AdminVerificationDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [verification, setVerification] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchVerificationDetail = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await apiCall<{ data: any[] }>('/admin/verifications?per_page=100');
        const match = (res.data || []).find((v: any) => v.verification_id === id);
        if (match) {
          setVerification(match);
        } else {
          setError('Verification details not found.');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load verification details.');
      } finally {
        setLoading(false);
      }
    };

    fetchVerificationDetail();
  }, [id]);

  const handleReview = async (decision: 'approved' | 'rejected') => {
    if (!id) return;

    setSubmitting(true);
    try {
      await apiCall(`/admin/verifications/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ decision, notes }),
      });
      alert(`Athlete verification was successfully ${decision}!`);
      router.push('/admin/id-verification');
    } catch (err: any) {
      alert(err.message || 'Failed to submit review decision.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-black mb-4"></div>
          <p className="text-gray-500 text-sm">Loading verification details...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error || !verification) {
    return (
      <AdminLayout>
        <div className="p-12 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-red-500 font-bold mb-2">Error Loading Verification</p>
          <p className="text-gray-400 text-xs mb-6">{error || 'Verification request not found.'}</p>
          <Link href="/admin/id-verification" className="px-6 py-2.5 border border-gray-100 rounded-lg text-gray-500 hover:text-black transition-all text-sm font-medium">
            Back to Verification List
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const avatar = verification.avatar_url
    ? (verification.avatar_url.startsWith('http') ? verification.avatar_url : `http://localhost:8080${verification.avatar_url}`)
    : '/assets/athelete_auth.png';

  const docUrl = verification.id_document_url
    ? (verification.id_document_url.startsWith('http') ? verification.id_document_url : `http://localhost:8080${verification.id_document_url}`)
    : '/assets/athelete_auth.png';

  return (
    <AdminLayout>
      <div className="space-y-12">
        {/* Title Section */}
        <div className="flex justify-between items-end">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <Link href="/admin/id-verification" className="p-2 bg-white border border-gray-100 rounded-lg text-gray-400 hover:text-black transition-all">
                <ArrowLeft size={18} />
              </Link>
              <h1 className="text-3xl font-bold text-black">ID Verification</h1>
            </div>
            <p className="text-sm text-gray-400 font-medium tracking-tight">Review and manage submitted ID verifications</p>
          </div>
          <div className="flex items-center gap-3 bg-gray-50 px-6 py-3 rounded-xl border border-gray-100">
            <span className="text-sm font-bold text-black">Verification Status</span>
            <span className="bg-gray-200 text-black text-[10px] font-black px-3 py-1 rounded-full flex items-center justify-center uppercase tracking-wider">
              {verification.status}
            </span>
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12">
          <div className="flex justify-between items-start mb-12">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-50 relative">
                <Image src={avatar} alt={verification.full_name} fill className="object-cover opacity-80" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-black mb-1">{verification.full_name}</h2>
                <p className="text-sm text-gray-400 font-medium">{verification.sport} Athlete Profile</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-black uppercase tracking-widest mb-1">
                Submitted: {new Date(verification.submitted_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 mb-12">
            {/* Gov ID Doc */}
            <div className="group cursor-pointer">
              <div className="aspect-video bg-black rounded-2xl overflow-hidden relative border border-gray-100 max-w-2xl mx-auto">
                <Image 
                  src={docUrl} 
                  alt="Government ID Document" 
                  fill 
                  className="object-contain opacity-80 group-hover:opacity-100 transition-opacity" 
                />
              </div>
              <div className="mt-6 p-6 bg-gray-50 rounded-2xl border border-gray-100 group-hover:border-black/10 transition-all max-w-2xl mx-auto">
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-black mb-1">UPLOADED DOCUMENT</p>
                <h3 className="text-lg font-bold text-black mb-2">Government ID / Passport</h3>
                <a href={docUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline font-bold uppercase tracking-wider">
                  Open File in New Tab
                </a>
              </div>
            </div>
          </div>

          {/* Notes Box */}
          <div className="mb-10 max-w-2xl mx-auto">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">Reviewer Decision Notes</p>
            <textarea
              rows={4}
              placeholder="Provide reasons for approval or decline details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-white border border-gray-100 rounded-xl p-4 text-sm focus:outline-none focus:border-black/20"
            />
          </div>

          <div className="flex gap-4 max-w-2xl mx-auto">
            <button 
              onClick={() => handleReview('approved')}
              disabled={submitting}
              className="flex-1 py-4 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-all shadow-xl shadow-green-500/10 uppercase tracking-widest text-xs disabled:opacity-50"
            >
              Approve
            </button>
            <button 
              onClick={() => handleReview('rejected')}
              disabled={submitting}
              className="flex-1 py-4 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all shadow-xl shadow-red-500/10 uppercase tracking-widest text-xs disabled:opacity-50"
            >
              Decline
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
