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
  User,
  Clock,
  PackageCheck,
  UserPlus
} from 'lucide-react';
import { apiCall } from '@/utils/api';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState('admin@uag.com');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const email = localStorage.getItem('admin_email');
      if (email) setAdminEmail(email);
    }
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await apiCall<{ data: any[] }>('/admin/notifications');
      setNotifications(res.data || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch(type) {
      case 'new_order': return <ShoppingCart size={16} className="text-blue-500" />;
      case 'delivered_order': return <PackageCheck size={16} className="text-green-500" />;
      case 'athlete_application': return <UserPlus size={16} className="text-amber-500" />;
      default: return <Bell size={16} className="text-gray-400" />;
    }
  };

  const getNotificationLink = (type: string) => {
    if (type.includes('order')) return '/admin/orders';
    if (type === 'athlete_application') return '/admin/id-verification';
    return '/admin/overview';
  };

  const timeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

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
          <Image src="/assets/logo.png" alt="UAG Logo" width={120} height={40} className="object-contain" priority style={{ width: 'auto', height: 'auto' }} />
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
          <div className="relative">
            <button 
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2 text-gray-400 hover:text-black transition-colors"
            >
              <Bell size={20} />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute top-full right-0 mt-4 w-80 bg-white rounded-2xl shadow-2xl shadow-black/5 border border-gray-100 z-50 overflow-hidden flex flex-col max-h-[400px]">
                <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50 shrink-0">
                  <h3 className="font-bold text-sm">Notifications</h3>
                  <span className="text-xs font-bold text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">{notifications.length}</span>
                </div>
                
                <div className="overflow-y-auto flex-1">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-sm text-gray-400">
                      No new notifications
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      {notifications.map((notif, idx) => (
                        <Link 
                          key={notif.id || idx}
                          href={getNotificationLink(notif.type)}
                          onClick={() => setIsNotificationsOpen(false)}
                          className="flex gap-3 p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors group"
                        >
                          <div className="w-8 h-8 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center shrink-0">
                            {getNotificationIcon(notif.type)}
                          </div>
                          <div>
                            <p className="text-sm text-gray-700 font-medium leading-snug group-hover:text-black">{notif.title}</p>
                            <div className="flex items-center gap-1 mt-1 text-gray-400">
                              <Clock size={12} />
                              <span className="text-xs">{timeAgo(notif.timestamp)}</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

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
