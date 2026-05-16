"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { User, Package, MapPin, CreditCard, LogOut, Camera, Edit2, Plus, ArrowRight } from 'lucide-react';
import { FanNavbar } from '@/components/organisms/fan/FanNavbar';
import { FanFooter } from '@/components/organisms/fan/FanFooter';

function ProfileContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('personal');

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    router.push('/login');
  };

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['personal', 'orders', 'address', 'payment'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: <User size={18} /> },
    { id: 'orders', label: 'My Orders', icon: <Package size={18} /> },
    { id: 'address', label: 'Address Book', icon: <MapPin size={18} /> },
    { id: 'payment', label: 'Payment Methods', icon: <CreditCard size={18} /> },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 flex-shrink-0 space-y-2">
        {/* User Card */}
        <div className="bg-[#121212] rounded-3xl p-6 border border-white/5 mb-6 text-center">
          <div className="relative w-24 h-24 mx-auto mb-4 group">
            <div className="w-full h-full rounded-full overflow-hidden border-2 border-white/10">
              <Image 
                src="/assets/athelete_auth.png" 
                alt="Jon Kabir" 
                width={96} 
                height={96} 
                className="object-cover"
              />
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full hover:scale-110 transition-transform">
              <Camera size={14} />
            </button>
          </div>
          <h2 className="text-lg font-bold text-white mb-1">Jon Kabir</h2>
          <p className="text-xs text-white/50">Member since 2026</p>
        </div>

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
          <div className="my-2 border-t border-white/5"></div>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-sm font-medium text-red-500 hover:bg-red-500/10 transition-all cursor-pointer">
            <LogOut size={18} />
            Log out
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 bg-[#121212] rounded-3xl p-6 md:p-10 border border-white/5">
        
        {/* Tab 1: Personal Info */}
        {activeTab === 'personal' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div>
              <h2 className="text-2xl font-bold font-heading uppercase tracking-tight text-white mb-2">Personal Info</h2>
              <p className="text-sm text-white/50">Manage your basic account details.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest">First Name</label>
                <input type="text" defaultValue="Jon" className="w-full bg-dark-400 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Last Name</label>
                <input type="text" defaultValue="Kabir" className="w-full bg-dark-400 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Email</label>
                <input type="email" defaultValue="jon.kabir@example.com" className="w-full bg-dark-400 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Phone</label>
                <input type="tel" defaultValue="+1 (555) 123-4567" className="w-full bg-dark-400 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30" />
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

            <button className="bg-white text-black font-bold px-8 py-3 rounded-full hover:bg-white/90 transition-all">
              Save Changes
            </button>
          </div>
        )}

        {/* Tab 2: Orders */}
        {activeTab === 'orders' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div>
              <h2 className="text-2xl font-bold font-heading uppercase tracking-tight text-white mb-2">My Orders</h2>
              <p className="text-sm text-white/50">View and track your previous orders.</p>
            </div>

            <div className="space-y-6">
              {/* Order Card */}
              <div className="bg-dark-400 rounded-2xl p-6 border border-white/5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/5">
                  <div>
                    <p className="text-sm font-bold text-white mb-1">Order #ORD-84392</p>
                    <p className="text-xs text-white/50">Placed on May 15, 2026</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-bold uppercase tracking-widest">
                      Processing
                    </span>
                    <p className="font-bold text-white">$91.80</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex -space-x-4">
                    <div className="w-16 h-16 rounded-xl bg-[#121212] border border-white/10 flex items-center justify-center p-2 z-20">
                      <Image src="/assets/product_sweatshirt.png" alt="Product" width={48} height={48} className="object-contain" />
                    </div>
                    <div className="w-16 h-16 rounded-xl bg-[#121212] border border-white/10 flex items-center justify-center p-2 z-10">
                      <Image src="/assets/product_vest.png" alt="Product" width={48} height={48} className="object-contain" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white/70">Pro Performance T-Shirt + 1 more item</p>
                  </div>
                  <button className="hidden md:flex items-center gap-2 text-sm text-primary font-medium hover:text-white transition-colors">
                    Track Order <ArrowRight size={16} />
                  </button>
                </div>
              </div>
              
              {/* Past Order */}
              <div className="bg-dark-400 rounded-2xl p-6 border border-white/5 opacity-70 hover:opacity-100 transition-opacity">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/5">
                  <div>
                    <p className="text-sm font-bold text-white mb-1">Order #ORD-77210</p>
                    <p className="text-xs text-white/50">Placed on April 02, 2026</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="px-3 py-1 rounded-full bg-white/10 text-white/70 text-xs font-bold uppercase tracking-widest">
                      Delivered
                    </span>
                    <p className="font-bold text-white">$125.50</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-xl bg-[#121212] border border-white/10 flex items-center justify-center p-2">
                    <Image src="/assets/product_hat.png" alt="Product" width={48} height={48} className="object-contain" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white/70">Classic Snapback Cap</p>
                  </div>
                  <button className="hidden md:flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors">
                    View Details <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Address Book */}
        {activeTab === 'address' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold font-heading uppercase tracking-tight text-white mb-2">Address Book</h2>
                <p className="text-sm text-white/50">Manage your shipping and billing addresses.</p>
              </div>
              <Link href="/fan/profile/address/add" className="inline-flex items-center justify-center gap-2 bg-white text-black font-bold px-6 py-3 rounded-full hover:bg-white/90 transition-all text-sm">
                <Plus size={18} />
                Add New
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Default Address */}
              <div className="relative p-6 rounded-2xl border border-primary bg-primary/5">
                <span className="absolute top-4 right-4 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Default</span>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <MapPin size={20} />
                  </div>
                  <span className="font-bold text-white text-lg">Home</span>
                </div>
                <p className="text-white/80 font-medium mb-1">Jon Kabir</p>
                <p className="text-sm text-white/50 leading-relaxed">
                  123 Athlete Way, Apt 4B<br/>
                  New York, NY 10001<br/>
                  United States
                </p>
                <p className="text-sm text-white/50 mt-2">+1 (555) 123-4567</p>
                
                <div className="flex items-center gap-4 mt-6 pt-6 border-t border-white/10">
                  <Link href="/fan/profile/address/edit" className="text-sm font-bold text-white flex items-center gap-2 hover:text-primary transition-colors">
                    <Edit2 size={14} /> Edit
                  </Link>
                </div>
              </div>

              {/* Other Address */}
              <div className="relative p-6 rounded-2xl border border-white/10 bg-dark-400">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50">
                    <MapPin size={20} />
                  </div>
                  <span className="font-bold text-white text-lg">Gym</span>
                </div>
                <p className="text-white/80 font-medium mb-1">Jon Kabir</p>
                <p className="text-sm text-white/50 leading-relaxed">
                  456 Training Center Blvd<br/>
                  Brooklyn, NY 11201<br/>
                  United States
                </p>
                <p className="text-sm text-white/50 mt-2">+1 (555) 987-6543</p>
                
                <div className="flex items-center gap-4 mt-6 pt-6 border-t border-white/10">
                  <Link href="/fan/profile/address/edit" className="text-sm font-bold text-white flex items-center gap-2 hover:text-primary transition-colors">
                    <Edit2 size={14} /> Edit
                  </Link>
                  <button className="text-sm font-bold text-white/40 hover:text-red-500 transition-colors ml-auto">
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Payment Methods */}
        {activeTab === 'payment' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold font-heading uppercase tracking-tight text-white mb-2">Payment Methods</h2>
                <p className="text-sm text-white/50">Manage your saved cards and payment options.</p>
              </div>
              <button className="inline-flex items-center justify-center gap-2 bg-white text-black font-bold px-6 py-3 rounded-full hover:bg-white/90 transition-all text-sm">
                <Plus size={18} />
                Add New Card
              </button>
            </div>

            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center justify-between p-6 rounded-2xl border border-primary bg-primary/5">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-10 bg-white rounded-md flex items-center justify-center">
                    <span className="text-blue-600 font-bold italic text-lg">VISA</span>
                  </div>
                  <div>
                    <p className="font-bold text-white flex items-center gap-2">
                      Visa ending in 4242
                      <span className="bg-primary text-white text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full">Default</span>
                    </p>
                    <p className="text-sm text-white/50">Expires 12/26</p>
                  </div>
                </div>
                <button className="text-white/40 hover:text-white transition-colors">
                  <Edit2 size={18} />
                </button>
              </div>

              <div className="flex items-center justify-between p-6 rounded-2xl border border-white/10 bg-dark-400">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-10 bg-[#FF5F00] rounded-md flex items-center justify-center">
                    <div className="flex">
                       <div className="w-5 h-5 bg-red-600 rounded-full"></div>
                       <div className="w-5 h-5 bg-yellow-400 rounded-full -ml-3 mix-blend-multiply"></div>
                    </div>
                  </div>
                  <div>
                    <p className="font-bold text-white">Mastercard ending in 8899</p>
                    <p className="text-sm text-white/50">Expires 08/28</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button className="text-sm text-white/40 hover:text-white transition-colors">Set Default</button>
                  <span className="text-white/20">|</span>
                  <button className="text-sm text-red-500/70 hover:text-red-500 transition-colors">Remove</button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A]">
      <FanNavbar />
      
      <main className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-12 xl:px-20 py-12">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        }>
          <ProfileContent />
        </Suspense>
      </main>

      <FanFooter />
    </div>
  );
}
