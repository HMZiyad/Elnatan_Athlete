"use client";

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, MapPin } from 'lucide-react';
import { DashboardLayout } from '@/components/templates/athlete-view/DashboardLayout';

export default function AddAddressPage() {
  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <Link href="/athlete/profile?tab=address" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-8 text-sm font-medium">
          <ChevronLeft size={16} />
          Back to Profile Settings
        </Link>

        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold font-heading uppercase tracking-tight text-white mb-2">Add New Address</h1>
          <p className="text-white/60">Enter your address details below.</p>
        </div>

        <div className="bg-[#121212] rounded-3xl p-6 md:p-10 border border-white/5">
          <form className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest">First Name</label>
                <input type="text" placeholder="e.g. Maya" className="w-full bg-dark-400 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Last Name</label>
                <input type="text" placeholder="e.g. Reyes" className="w-full bg-dark-400 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Address Line 1</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40">
                  <MapPin size={18} />
                </div>
                <input type="text" placeholder="Street address or P.O. Box" className="w-full bg-dark-400 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-white/30" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Address Line 2 (Optional)</label>
              <input type="text" placeholder="Apartment, suite, unit, building, floor, etc." className="w-full bg-dark-400 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest">City</label>
                <input type="text" placeholder="e.g. New York" className="w-full bg-dark-400 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest">State / Province</label>
                <input type="text" placeholder="e.g. NY" className="w-full bg-dark-400 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Zip / Postal Code</label>
                <input type="text" placeholder="e.g. 10001" className="w-full bg-dark-400 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Country</label>
                <select className="w-full bg-dark-400 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 appearance-none">
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="UK">United Kingdom</option>
                  <option value="AU">Australia</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Phone Number</label>
              <input type="tel" placeholder="+1 (555) 000-0000" className="w-full bg-dark-400 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30" />
            </div>

            <label className="flex items-center gap-3 cursor-pointer mt-4">
              <input type="checkbox" className="w-5 h-5 rounded border-white/20 bg-dark-400 accent-primary" />
              <span className="text-sm text-white/80">Set as default address</span>
            </label>

            <div className="pt-6 border-t border-white/5 flex gap-4">
              <button type="button" className="flex-1 bg-white text-black font-bold py-4 rounded-xl hover:bg-white/90 transition-all">
                Save Address
              </button>
              <Link href="/athlete/profile?tab=address" className="flex-1 bg-transparent border border-white/20 text-white font-bold py-4 rounded-xl hover:bg-white/5 transition-colors text-center">
                Cancel
              </Link>
            </div>

          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
