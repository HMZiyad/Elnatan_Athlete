"use client";

import React from 'react';
import { LayoutDashboard, Wallet, LogOut, Bell, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 flex flex-col sticky top-0 h-screen bg-dark-400">
        <div className="p-8">
          <div className="flex items-center gap-2 mb-12">
            <Image src="/assets/logo.png" alt="UAG Logo" width={120} height={40} className="object-contain" />
          </div>

          <nav className="space-y-2">
            <p className="text-[10px] uppercase tracking-widest text-white/20 font-bold mb-4 ml-4">Main Menu</p>
            <Link 
              href="/athlete/overview" 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                isActive('/athlete/overview') ? 'bg-white/5 text-white' : 'text-white/40 hover:text-white'
              }`}
            >
              <LayoutDashboard size={18} />
              Overview
            </Link>
            <Link 
              href="/athlete/earnings" 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                isActive('/athlete/earnings') ? 'bg-white/5 text-white' : 'text-white/40 hover:text-white'
              }`}
            >
              <Wallet size={18} />
              Earnings
            </Link>
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-white/5">
          <button className="flex items-center gap-3 text-red-500 hover:text-red-400 transition-all font-medium">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="h-20 border-b border-white/5 flex items-center justify-end px-12 gap-6 bg-dark-400/50 backdrop-blur-sm sticky top-0 z-50">
          <button className="p-2 text-white/40 hover:text-white relative">
            <Bell size={20} />
            <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-black" />
          </button>
          
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="text-right">
              <p className="text-sm font-bold">Jon Kabir</p>
              <p className="text-[10px] text-white/40 uppercase tracking-widest">Admin</p>
            </div>
            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/10 group-hover:border-white/30 transition-all">
              <Image src="/assets/athelete_auth.png" alt="Profile" fill className="object-cover" />
            </div>
            <ChevronDown size={16} className="text-white/40 group-hover:text-white transition-all" />
          </div>
        </header>

        {/* Content Area */}
        <main className="p-12 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
