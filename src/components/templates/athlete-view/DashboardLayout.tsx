"use client";

import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Wallet, LogOut, Bell, ChevronDown, User, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { apiCall } from '@/utils/api';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<{ fullName: string; email: string; avatarUrl?: string | null } | null>(null);
  const [userRole, setUserRole] = useState<string>('User');

  useEffect(() => {
    const authState = localStorage.getItem('isLoggedIn');
    const token = localStorage.getItem('uag_token');
    const role = localStorage.getItem('userRole');
    if (role) setUserRole(role);

    const loggedIn = authState === 'true' && !!token;
    if (!loggedIn) {
      router.push('/login');
      return;
    }

    const fetchDashboardProfile = async () => {
      try {
        const role = localStorage.getItem('userRole');
        if (role === 'athlete') {
          const res = await apiCall<{ data: { full_name: string; email: string; avatar_url?: string | null } }>('/athletes/me/profile');
          setUserProfile({
            fullName: res.data.full_name,
            email: res.data.email,
            avatarUrl: res.data.avatar_url,
          });
        } else {
          const res = await apiCall<{ data: { first_name: string; last_name: string; email: string; avatar_url?: string | null } }>('/fans/me/profile');
          setUserProfile({
            fullName: `${res.data.first_name} ${res.data.last_name}`,
            email: res.data.email,
            avatarUrl: res.data.avatar_url,
          });
        }
      } catch (err) {
        console.error('Failed to fetch dashboard profile:', err);
      }
    };
    fetchDashboardProfile();
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    localStorage.removeItem('uag_token');
    setUserProfile(null);
    router.push('/login');
  };


  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 flex flex-col sticky top-0 h-screen bg-dark-400">
        <div className="p-8">
          <div className="flex items-center gap-2 mb-12">
            <Image src="/assets/logo.png" alt="UAG Logo" width={120} height={40} className="object-contain" priority style={{ width: 'auto', height: 'auto' }} />
          </div>

          <nav className="space-y-2">
            <p className="text-[10px] uppercase tracking-widest text-white/20 font-bold mb-4 ml-4">Main Menu</p>
            <Link 
              href="/athlete/overview" 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                pathname === '/athlete/overview' ? 'bg-white/5 text-white' : 'text-white/40 hover:text-white'
              }`}
            >
              <LayoutDashboard size={18} />
              Overview
            </Link>
            <Link 
              href="/athlete/earnings" 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                pathname === '/athlete/earnings' ? 'bg-white/5 text-white' : 'text-white/40 hover:text-white'
              }`}
            >
              <Wallet size={18} />
              Earnings
            </Link>
            
            <p className="text-[10px] uppercase tracking-widest text-white/20 font-bold mb-4 ml-4 mt-8">Settings</p>
            <Link 
              href="/athlete/profile" 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                isActive('/athlete/profile') ? 'bg-white/5 text-white' : 'text-white/40 hover:text-white'
              }`}
            >
              <User size={18} />
              Profile
            </Link>
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-white/5">
          <button onClick={handleLogout} className="flex items-center w-full gap-3 text-red-500 hover:text-red-400 hover:bg-red-500/10 px-4 py-3 rounded-lg transition-all font-medium cursor-pointer">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-20 border-b border-white/5 flex items-center justify-end px-12 gap-6 bg-dark-400/50 backdrop-blur-sm sticky top-0 z-50">
          <button className="p-2 text-white/40 hover:text-white relative">
            <Bell size={20} />
            <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-black" />
          </button>
          
          <div className="relative">
            <div 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold">{userProfile?.fullName || 'User'}</p>
                <p className="text-[10px] text-white/40 uppercase tracking-widest">
                  {userRole}
                </p>
              </div>
              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/10 group-hover:border-white/30 transition-all">
                <Image src={userProfile?.avatarUrl || "/assets/athlete_mma.png"} alt="Profile" fill className="object-cover" />
              </div>
              <ChevronDown size={16} className={`text-white/40 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
            </div>

            {/* Profile Dropdown */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-[#121212] border border-white/10 rounded-2xl shadow-2xl py-2 z-50">
                <div className="px-4 py-3 border-b border-white/5 mb-2">
                  <p className="text-sm font-bold text-white">{userProfile?.fullName || 'User'}</p>
                  <p className="text-xs text-white/40">{userProfile?.email || ''}</p>
                </div>
                
                <div className="px-2 space-y-1">
                  <Link href="/athlete/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                    <User size={16} />
                    My Profile
                  </Link>
                  <Link href="/athlete/profile?tab=address" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                    <MapPin size={16} />
                    Addresses
                  </Link>
                </div>
                
                <div className="px-2 mt-2 pt-2 border-t border-white/5">
                  <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer">
                    <LogOut size={16} />
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
