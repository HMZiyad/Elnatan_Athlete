import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AdminLayout } from '@/components/templates/admin-view/AdminLayout';
import { Search, Filter, MapPin } from 'lucide-react';

export default function AdminVerificationPage() {
  const athletes = [
    { id: 1, name: 'Devon Carter', location: 'Los Angeles, CA', tags: ['Sprinting', 'Basketball', 'Rising'], image: '/assets/athelete_auth.png' },
    { id: 2, name: 'Devon Carter', location: 'Los Angeles, CA', tags: ['Sprinting', 'Basketball', 'Rising'], image: '/assets/athelete_auth.png' },
    { id: 3, name: 'Devon Carter', location: 'Los Angeles, CA', tags: ['Sprinting', 'Basketball', 'Rising'], image: '/assets/athelete_auth.png' },
  ];

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

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {athletes.map((athlete, i) => (
            <div key={i} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 flex flex-col items-center text-center group hover:shadow-xl hover:shadow-black/5 transition-all">
              <div className="w-32 h-32 rounded-full overflow-hidden mb-6 border-4 border-gray-50 group-hover:border-black/5 transition-all">
                <Image src={athlete.image} alt={athlete.name} width={128} height={128} className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
              </div>
              
              <h3 className="text-2xl font-bold text-black mb-1">{athlete.name}</h3>
              <div className="flex items-center gap-1 text-gray-400 mb-6 font-medium text-sm">
                <MapPin size={14} />
                <span>{athlete.location}</span>
              </div>

              <div className="flex gap-2 mb-10">
                {athlete.tags.map(tag => (
                  <span key={tag} className="px-4 py-1.5 bg-gray-50 text-gray-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-gray-100">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex gap-3 w-full">
                <Link 
                  href={`/admin/id-verification/${athlete.id}`}
                  className="flex-1 bg-green-500 text-white font-bold py-3 rounded-xl hover:bg-green-600 transition-all text-xs uppercase tracking-widest"
                >
                  Review
                </Link>
                <button className="flex-1 bg-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-600 transition-all text-xs uppercase tracking-widest">
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
