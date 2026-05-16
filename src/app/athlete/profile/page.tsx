"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { User, MapPin, Camera, Edit2, Plus, Trash2, Play } from 'lucide-react';
import { DashboardLayout } from '@/components/templates/athlete-view/DashboardLayout';

function ProfileContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['personal', 'address'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const tabs = [
    { id: 'personal', label: 'Profile Settings', icon: <User size={18} /> },
    { id: 'address', label: 'Address Book', icon: <MapPin size={18} /> },
  ];

  return (
    <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 flex-shrink-0 space-y-2">
        <nav className="bg-[#121212] rounded-3xl p-3 border border-white/5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-sm font-medium transition-all ${
                activeTab === tab.id 
                  ? 'bg-white/10 text-white font-bold' 
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 bg-[#121212] rounded-3xl p-6 md:p-10 border border-white/5">
        
        {/* Tab 1: Profile Settings */}
        {activeTab === 'personal' && (
          <div className="space-y-12 animate-in fade-in duration-300">
            <div>
              <h2 className="text-2xl font-bold font-heading uppercase tracking-tight text-white mb-2">Profile Settings</h2>
              <p className="text-sm text-white/50">Manage your identity, sport details, and story.</p>
            </div>

            {/* Profile Picture */}
            <div className="flex items-center gap-6 pb-8 border-b border-white/5">
              <div className="relative w-24 h-24 group">
                <div className="w-full h-full rounded-full overflow-hidden border-2 border-white/10">
                  <Image 
                    src="/assets/athlete_mma.png" 
                    alt="Maya Reyes" 
                    width={96} 
                    height={96} 
                    className="object-cover"
                  />
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg hover:scale-110 transition-transform">
                  <Camera size={14} />
                </button>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Profile Picture</h3>
                <p className="text-xs text-white/50 mb-3">Upload a high-quality photo representing your brand.</p>
                <button className="text-xs font-bold text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-colors">
                  Change Photo
                </button>
              </div>
            </div>

            {/* Identity Details */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white border-b border-white/5 pb-2">Identity</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Full Name</label>
                  <input type="text" defaultValue="Maya Reyes" className="w-full bg-dark-400 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Email Address</label>
                  <input type="email" defaultValue="maya.reyes@example.com" className="w-full bg-dark-400 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Phone Number</label>
                  <input type="tel" defaultValue="+1 (555) 987-6543" className="w-full bg-dark-400 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Date of Birth</label>
                  <input type="date" defaultValue="2002-08-15" className="w-full bg-dark-400 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 [color-scheme:dark]" />
                </div>
              </div>
            </div>

            {/* Sport Details */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white border-b border-white/5 pb-2">Sport Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Primary Sport</label>
                  <select defaultValue="MMA" className="w-full bg-dark-400 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 appearance-none">
                    <option value="Basketball">Basketball</option>
                    <option value="Football">American Football</option>
                    <option value="Soccer">Soccer</option>
                    <option value="Track">Track & Field</option>
                    <option value="MMA">Mixed Martial Arts</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Position / Weight Class</label>
                  <input type="text" defaultValue="Strawweight" className="w-full bg-dark-400 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Key Achievements (Comma separated)</label>
                  <input type="text" defaultValue="Regional Champion 2024, Undefeated Amateur Record" className="w-full bg-dark-400 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30" />
                </div>
              </div>
            </div>

            {/* Story Details */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white border-b border-white/5 pb-2">Your Story</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Biography</label>
                  <textarea 
                    rows={4} 
                    defaultValue="Fighting out of Brooklyn, NY. Dedicated to martial arts since age 10. Turning pro this year." 
                    className="w-full bg-dark-400 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 resize-none"
                  ></textarea>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Instagram Link</label>
                  <input type="url" defaultValue="https://instagram.com/mayareyes_mma" className="w-full bg-dark-400 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Twitter / X Link</label>
                  <input type="url" defaultValue="https://x.com/mayareyes_mma" className="w-full bg-dark-400 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30" />
                </div>
              </div>
            </div>

            {/* Media Gallery */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <h3 className="text-lg font-bold text-white">Media Gallery</h3>
                <button className="text-xs font-bold text-black bg-white hover:bg-white/90 px-4 py-2 rounded-full transition-colors flex items-center gap-2 shadow-lg shadow-white/5">
                  <Plus size={14} /> Add Media
                </button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                 {/* Video Item */}
                 <div className="relative aspect-video bg-dark-400 rounded-xl overflow-hidden group">
                   <Image src="/assets/athlete_mma.png" alt="Highlight Reel" fill className="object-cover" />
                   <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                     <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                       <Play size={16} className="text-white fill-white ml-1" />
                     </div>
                   </div>
                   <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                     <button className="p-2 bg-white/10 text-white rounded-full hover:bg-white hover:text-black transition-colors" title="Edit">
                       <Edit2 size={16} />
                     </button>
                     <button className="p-2 bg-red-500/20 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-colors" title="Delete">
                       <Trash2 size={16} />
                     </button>
                   </div>
                 </div>

                 {/* Photo Item */}
                 <div className="relative aspect-video bg-dark-400 rounded-xl overflow-hidden group">
                   <Image src="/assets/athlete_mma.png" alt="Training" fill className="object-cover" />
                   <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                     <button className="p-2 bg-white/10 text-white rounded-full hover:bg-white hover:text-black transition-colors" title="Edit">
                       <Edit2 size={16} />
                     </button>
                     <button className="p-2 bg-red-500/20 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-colors" title="Delete">
                       <Trash2 size={16} />
                     </button>
                   </div>
                 </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5">
              <h3 className="text-lg font-bold text-white mb-4">Change Password</h3>
              <div className="space-y-4 max-w-md">
                <input type="password" placeholder="Current Password" className="w-full bg-dark-400 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30" />
                <input type="password" placeholder="New Password" className="w-full bg-dark-400 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30" />
                <input type="password" placeholder="Confirm New Password" className="w-full bg-dark-400 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30" />
              </div>
            </div>

            <button className="w-full md:w-auto bg-white text-black font-bold px-8 py-4 rounded-full hover:bg-white/90 transition-all shadow-xl shadow-white/5">
              Save All Changes
            </button>
          </div>
        )}

        {/* Tab 2: Address Book */}
        {activeTab === 'address' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold font-heading uppercase tracking-tight text-white mb-2">Address Book</h2>
                <p className="text-sm text-white/50">Manage your shipping and billing addresses.</p>
              </div>
              <Link href="/athlete/profile/address/add" className="inline-flex items-center justify-center gap-2 bg-white text-black font-bold px-6 py-3 rounded-full hover:bg-white/90 transition-all text-sm">
                <Plus size={18} />
                Add New
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Default Address */}
              <div className="relative p-6 rounded-2xl border border-primary bg-primary/5">
                <span className="absolute top-4 right-4 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Default</span>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <MapPin size={20} />
                  </div>
                  <span className="font-bold text-white text-lg">Training Camp</span>
                </div>
                <p className="text-white/80 font-medium mb-1">Maya Reyes</p>
                <p className="text-sm text-white/50 leading-relaxed">
                  789 Elite Striking Gym<br/>
                  Brooklyn, NY 11201<br/>
                  United States
                </p>
                <p className="text-sm text-white/50 mt-2">+1 (555) 987-6543</p>
                
                <div className="flex items-center gap-4 mt-6 pt-6 border-t border-white/10">
                  <Link href="/athlete/profile/address/edit" className="text-sm font-bold text-white flex items-center gap-2 hover:text-primary transition-colors">
                    <Edit2 size={14} /> Edit
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function AthleteProfilePage() {
  return (
    <DashboardLayout>
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold font-heading uppercase tracking-tight text-white mb-2">Settings</h1>
        <p className="text-white/60">Update your athlete profile and preferences.</p>
      </div>

      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }>
        <ProfileContent />
      </Suspense>
    </DashboardLayout>
  );
}
