"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AdminLayout } from '@/components/templates/admin-view/AdminLayout';
import { User, Shield, Camera, Save, Lock } from 'lucide-react';

function SettingsContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'security') setActiveTab('security');
  }, [searchParams]);

  return (
    <div className="space-y-12">
      {/* Title Section */}
      <div>
        <h1 className="text-3xl font-bold text-black mb-1">Settings</h1>
        <p className="text-sm text-gray-400 font-medium tracking-tight">Manage your account and application preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Tabs Sidebar */}
        <div className="w-full lg:w-80 bg-white rounded-3xl border border-gray-100 shadow-sm p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl font-bold transition-all ${
              activeTab === 'profile' 
                ? 'bg-gray-100 text-black shadow-inner' 
                : 'text-gray-400 hover:text-black hover:bg-gray-50'
            }`}
          >
            <User size={20} />
            <span>Profile</span>
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl font-bold transition-all ${
              activeTab === 'security' 
                ? 'bg-gray-100 text-black shadow-inner' 
                : 'text-gray-400 hover:text-black hover:bg-gray-50'
            }`}
          >
            <Shield size={20} />
            <span>Security</span>
          </button>
        </div>

        {/* Form Area */}
        <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          {activeTab === 'profile' ? (
            <div className="p-10 space-y-10">
              <div>
                <h2 className="text-xl font-bold text-black mb-1">Profile Settings</h2>
                <p className="text-sm text-gray-400 font-medium tracking-tight">Update your personal information and credentials</p>
              </div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Profile Picture</p>
                  <div className="relative w-24 h-24 group">
                    <div className="w-full h-full rounded-full bg-gray-600 overflow-hidden border-4 border-gray-50">
                      <User size={48} className="text-white/20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <button className="absolute bottom-0 right-0 p-2 bg-cyan-500 text-white rounded-full border-2 border-white shadow-lg hover:scale-110 transition-transform">
                      <Camera size={14} />
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Full Name</p>
                    <input type="text" placeholder="John Smith" className="w-full bg-white border border-gray-100 rounded-xl py-4 px-6 text-sm focus:outline-none focus:border-black/20" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Email Address</p>
                    <input type="email" placeholder="smith@hospital.com" className="w-full bg-white border border-gray-100 rounded-xl py-4 px-6 text-sm focus:outline-none focus:border-black/20" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Phone Number</p>
                    <input type="text" placeholder="smith@hospital.com" className="w-full bg-white border border-gray-100 rounded-xl py-4 px-6 text-sm focus:outline-none focus:border-black/20" />
                  </div>
                </div>

                <button className="flex items-center gap-3 bg-black text-white px-10 py-4 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-xl shadow-black/10">
                  <Save size={18} />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-10 space-y-10">
              <div>
                <h2 className="text-xl font-bold text-black mb-1">Change Password</h2>
                <p className="text-sm text-gray-400 font-medium tracking-tight">Ensure your account uses a strong, unique password</p>
              </div>

              <div className="space-y-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Current Password</p>
                    <input type="password" placeholder="Enter your current password" className="w-full bg-white border border-gray-100 rounded-xl py-4 px-6 text-sm focus:outline-none focus:border-black/20" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">New Password</p>
                    <input type="password" placeholder="Enter your new password" className="w-full bg-white border border-gray-100 rounded-xl py-4 px-6 text-sm focus:outline-none focus:border-black/20" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Confirm New Password</p>
                    <input type="password" placeholder="Enter new password" className="w-full bg-white border border-gray-100 rounded-xl py-4 px-6 text-sm focus:outline-none focus:border-black/20" />
                  </div>
                </div>

                <button className="flex items-center gap-3 bg-black text-white px-10 py-4 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-xl shadow-black/10">
                  <Lock size={18} />
                  <span>Update Password</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminSettingsPage() {
  return (
    <AdminLayout>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
      }>
        <SettingsContent />
      </Suspense>
    </AdminLayout>
  );
}

