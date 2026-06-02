"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingCart, Menu, X, User, Package, Heart, LogOut, ChevronDown } from 'lucide-react';
import { apiCall } from '@/utils/api';

const navLinks = [
  { label: 'Home', href: '/fan' },
  { label: 'Explore', href: '/fan/explore' },
  { label: 'Leaderboard', href: '/fan/leaderboard' },
  { label: 'Shop', href: '/fan/shop' },
  { label: 'Favorites', href: '/fan/favorites' },
  { label: 'About us', href: '/fan/about-us' },
];

export const FanNavbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState<{ fullName: string; email: string; avatarUrl?: string | null } | null>(null);
  
  useEffect(() => {
    // Check login state on mount and path change
    const authState = localStorage.getItem('isLoggedIn');
    const token = localStorage.getItem('uag_token');
    const loggedIn = authState === 'true' && !!token;
    setIsLoggedIn(loggedIn);

    if (loggedIn) {
      const fetchNavbarProfile = async () => {
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
          console.error('Failed to fetch navbar profile:', err);
        }
      };
      fetchNavbarProfile();
    } else {
      setUserProfile(null);
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    localStorage.removeItem('uag_token');
    setIsLoggedIn(false);
    setUserProfile(null);
    setIsProfileOpen(false);
    setMobileMenuOpen(false);
    router.push('/login');
  };


  return (
    <nav className="sticky top-0 z-50 bg-dark-400/90 backdrop-blur-md border-b border-white/5">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-12 xl:px-20">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/fan" className="flex-shrink-0">
            <div className="relative w-32 h-8">
              <Image
                src="/assets/logo.png"
                alt="Underrated"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'text-white'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <Link href="/fan/cart" className="relative p-2 text-white/60 hover:text-white transition-colors group" aria-label="Cart">
                  <ShoppingCart size={20} className="group-hover:scale-110 transition-transform" />
                  <span className="absolute top-0 right-0 w-4 h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-dark-400">
                    2
                  </span>
                </Link>
                
                <div className="relative hidden md:block">
                  <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                  >
                    <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white/10 relative">
                      <Image 
                        src={userProfile?.avatarUrl || "/assets/athelete_auth.png"} 
                        alt="Profile" 
                        fill
                        className="object-cover"
                      />
                    </div>
                    <ChevronDown size={14} className={`text-white/60 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Profile Dropdown */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-[#121212] border border-white/10 rounded-2xl shadow-2xl py-2 z-50">
                      <div className="px-4 py-3 border-b border-white/5 mb-2">
                        <p className="text-sm font-bold text-white">{userProfile?.fullName || 'User'}</p>
                        <p className="text-xs text-white/40">{userProfile?.email || ''}</p>
                      </div>
                      
                      <div className="px-2 space-y-1">
                        <Link href="/fan/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                          <User size={16} />
                          My Profile
                        </Link>
                        <Link href="/fan/profile?tab=orders" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                          <Package size={16} />
                          My Orders
                        </Link>
                        <Link href="/fan/favorites" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                          <Heart size={16} />
                          Favorites
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
              </>
            ) : (
              <>
                <button className="p-2 text-white/60 hover:text-white transition-colors" aria-label="Cart">
                  <ShoppingCart size={20} />
                </button>
                <Link
                  href="/login"
                  className="hidden sm:inline-flex px-5 py-2 text-sm font-medium text-white/80 border border-white/20 rounded-full hover:bg-white/5 hover:text-white transition-all"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="hidden sm:inline-flex px-5 py-2 text-sm font-medium text-black bg-white rounded-full hover:bg-white/90 transition-all"
                >
                  Sign up
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-white/60 hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/5 bg-dark-400/95 backdrop-blur-md">
          <div className="px-4 py-4 space-y-1">
            {isLoggedIn && (
              <div className="flex items-center gap-3 px-4 py-3 mb-2 border-b border-white/5">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/10 relative">
                  <Image 
                    src={userProfile?.avatarUrl || "/assets/athelete_auth.png"} 
                    alt="Profile" 
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{userProfile?.fullName || 'User'}</p>
                  <p className="text-xs text-white/40">{userProfile?.email || ''}</p>
                </div>
              </div>
            )}
            
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'text-white bg-white/5'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            
            {isLoggedIn ? (
              <div className="pt-2 mt-2 border-t border-white/5 space-y-1">
                <Link href="/fan/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                  <User size={18} /> My Profile
                </Link>
                <Link href="/fan/profile?tab=orders" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                  <Package size={18} /> My Orders
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer">
                  <LogOut size={18} /> Log out
                </button>
              </div>
            ) : (
              <div className="flex gap-3 pt-4 px-4 border-t border-white/5">
                <Link
                  href="/login"
                  className="flex-1 text-center px-4 py-2.5 text-sm font-medium text-white/80 border border-white/20 rounded-full hover:bg-white/5 transition-all"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="flex-1 text-center px-4 py-2.5 text-sm font-medium text-black bg-white rounded-full hover:bg-white/90 transition-all"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
