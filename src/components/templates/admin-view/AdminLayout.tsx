"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  FileCheck, 
  Users, 
  LogOut,
  Bell,
  ChevronDown,
  X,
  Settings,
  User
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState('admin@uag.com');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const email = localStorage.getItem('admin_email');
      if (email) setAdminEmail(email);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('admin_email');
    router.push('/admin/login');
  };

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Overview', href: '/admin/overview' },
    { icon: <Package size={20} />, label: 'Product', href: '/admin/products' },
    { icon: <ShoppingCart size={20} />, label: 'Orders', href: '/admin/orders' },
    { icon: <FileCheck size={20} />, label: 'ID Verification', href: '/admin/id-verification' },
    { icon: <Users size={20} />, label: 'Customers', href: '/admin/customers' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <div className="flex min-h-screen bg-[#F8F9FA]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0A0A0A] text-white flex flex-col fixed h-full z-30">
        <div className="p-8">
          <Image src="/assets/logo.png" alt="UAG Logo" width={120} height={40} className="object-contain" />
        </div>

        <nav className="flex-1 mt-10 px-4 space-y-2">
          <p className="px-4 text-[10px] uppercase tracking-widest text-white/30 font-bold mb-4">Main Menu</p>
          {menuItems.map((item) => (
            <Link 
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive(item.href) 
                  ? 'bg-white/10 text-white font-bold' 
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.icon}
              <span className="text-sm tracking-tight">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-lg transition-all group"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold uppercase tracking-widest">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col">
        {/* Header */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-end px-12 gap-8 sticky top-0 z-20">
          <button className="relative p-2 text-gray-400 hover:text-black transition-colors">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full border-2 border-white"></span>
          </button>

          <div className="relative">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 group"
            >
              <div className="text-right">
                <p className="text-sm font-bold text-black">{adminEmail.split('@')[0]}</p>
                <p className="text-[10px] text-gray-400 font-medium">{adminEmail}</p>
              </div>
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-50 group-hover:border-gray-200 transition-all">
                <Image src="/assets/athelete_auth.png" alt="Admin" width={40} height={40} className="object-cover" />
              </div>
              <ChevronDown size={16} className={`text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Profile Dropdown */}
            {isProfileOpen && (
              <div className="absolute top-full right-0 mt-4 w-72 bg-white rounded-2xl shadow-2xl shadow-black/5 border border-gray-100 p-6 z-50">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                      <Image src="/assets/athelete_auth.png" alt="Admin" width={48} height={48} className="object-cover" />
                    </div>
                    <div>
                      <p className="font-bold text-black">{adminEmail.split('@')[0]}</p>
                      <span className="bg-gray-100 text-[10px] font-bold px-3 py-1 rounded-full text-gray-500 uppercase tracking-tighter">Admin</span>
                    </div>
                  </div>
                  <button onClick={() => setIsProfileOpen(false)} className="text-gray-300 hover:text-black">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-1 py-4 border-t border-gray-50">
                  <Link href="/admin/settings" className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-50 text-sm font-medium transition-all group">
                    <div className="flex items-center gap-3">
                      <User size={18} className="text-gray-400" />
                      Profile
                    </div>
                  </Link>
                  <Link href="/admin/settings?tab=security" className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-50 text-sm font-medium transition-all group">
                    <div className="flex items-center gap-3">
                      <Settings size={18} className="text-gray-400" />
                      Settings
                    </div>
                    <ChevronDown size={16} className="-rotate-90 text-gray-300" />
                  </Link>
                </div>

                <button 
                  onClick={handleLogout}
                  className="w-full bg-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 uppercase tracking-widest text-xs mt-4"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="p-12">
          {children}
        </main>
      </div>
    </div>
  );
};
