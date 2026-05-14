import React from 'react';
import Image from 'next/image';
import { AdminLayout } from '@/components/templates/admin-view/AdminLayout';
import { Search, Filter, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminVerificationDetailPage() {
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
            <span className="text-sm font-bold text-black">Pending Verification</span>
            <span className="bg-gray-200 text-black text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center">4</span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search Orders..." 
              className="w-full bg-white border border-gray-100 rounded-xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-black/20"
            />
          </div>
          <button className="p-4 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-black transition-all">
            <Filter size={20} />
          </button>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12">
          <div className="flex justify-between items-start mb-12">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-50">
                <Image src="/assets/athelete_auth.png" alt="Devon Carter" width={80} height={80} className="object-cover opacity-80" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-black mb-1">Devon Carter</h2>
                <p className="text-sm text-gray-400 font-medium">@devoncater</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-black uppercase tracking-widest mb-1">Submit Date: 19-02-2026</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Doc 1 */}
            <div className="group cursor-pointer">
              <div className="aspect-video bg-black rounded-2xl overflow-hidden relative border border-gray-100">
                <Image 
                  src="/assets/athelete_auth.png" 
                  alt="Government ID" 
                  layout="fill" 
                  className="object-cover opacity-50 group-hover:opacity-70 transition-opacity" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-center">
                  <span className="text-white font-bold text-4xl opacity-20">123</span>
                </div>
              </div>
              <div className="mt-6 p-6 bg-gray-50 rounded-2xl border border-gray-100 group-hover:border-black/10 transition-all">
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-black mb-1">DOC TYPE 01</p>
                <h3 className="text-lg font-bold text-black">Government ID</h3>
              </div>
            </div>

            {/* Doc 2 */}
            <div className="group cursor-pointer">
              <div className="aspect-video bg-black rounded-2xl overflow-hidden relative border border-gray-100">
                <Image 
                  src="/assets/athelete_auth.png" 
                  alt="Competition Cert" 
                  layout="fill" 
                  className="object-cover opacity-50 group-hover:opacity-70 transition-opacity" 
                />
              </div>
              <div className="mt-6 p-6 bg-gray-50 rounded-2xl border border-gray-100 group-hover:border-black/10 transition-all">
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-black mb-1">DOC TYPE 02</p>
                <h3 className="text-lg font-bold text-black">Competition Cert.</h3>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button className="px-12 py-4 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-all shadow-xl shadow-green-500/10 uppercase tracking-widest text-xs">
              Approve
            </button>
            <button className="px-12 py-4 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all shadow-xl shadow-red-500/10 uppercase tracking-widest text-xs">
              Decline
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
