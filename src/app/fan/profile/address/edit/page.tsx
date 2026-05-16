"use client";

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, MapPin } from 'lucide-react';
import { FanNavbar } from '@/components/organisms/fan/FanNavbar';
import { FanFooter } from '@/components/organisms/fan/FanFooter';

export default function EditAddressPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A]">
      <FanNavbar />
      
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <Link href="/fan/profile?tab=address" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-8 text-sm font-medium">
          <ChevronLeft size={16} />
          Back to Address Book
        </Link>

        <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold font-heading uppercase tracking-tight text-white mb-2">Edit Address</h1>
            <p className="text-white/60">Update your shipping or billing address details below.</p>
          </div>
          <button className="text-red-500 font-bold hover:bg-red-500/10 px-4 py-2 rounded-lg transition-colors text-sm">
            Delete Address
          </button>
        </div>

        <div className="bg-[#121212] rounded-3xl p-6 md:p-10 border border-white/5">
          <form className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest">First Name</label>
                <input type="text" defaultValue="Jon" className="w-full bg-dark-400 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Last Name</label>
                <input type="text" defaultValue="Kabir" className="w-full bg-dark-400 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Address Line 1</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40">
                  <MapPin size={18} />
                </div>
                <input type="text" defaultValue="123 Athlete Way" className="w-full bg-dark-400 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-white/30" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Address Line 2 (Optional)</label>
              <input type="text" defaultValue="Apt 4B" className="w-full bg-dark-400 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest">City</label>
                <input type="text" defaultValue="New York" className="w-full bg-dark-400 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest">State / Province</label>
                <input type="text" defaultValue="NY" className="w-full bg-dark-400 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Zip / Postal Code</label>
                <input type="text" defaultValue="10001" className="w-full bg-dark-400 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Country</label>
                <select defaultValue="US" className="w-full bg-dark-400 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 appearance-none">
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="UK">United Kingdom</option>
                  <option value="AU">Australia</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Phone Number</label>
              <input type="tel" defaultValue="+1 (555) 123-4567" className="w-full bg-dark-400 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30" />
            </div>

            <label className="flex items-center gap-3 cursor-pointer mt-4">
              <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-white/20 bg-dark-400 accent-primary" />
              <span className="text-sm text-white/80">Set as default shipping address</span>
            </label>

            <div className="pt-6 border-t border-white/5 flex gap-4">
              <button type="button" className="flex-1 bg-white text-black font-bold py-4 rounded-xl hover:bg-white/90 transition-all">
                Update Address
              </button>
              <Link href="/fan/profile?tab=address" className="flex-1 bg-transparent border border-white/20 text-white font-bold py-4 rounded-xl hover:bg-white/5 transition-colors text-center">
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
