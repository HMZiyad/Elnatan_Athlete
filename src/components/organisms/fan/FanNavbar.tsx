"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Menu, X } from 'lucide-react';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          <div className="flex items-center gap-3">
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
            <div className="flex gap-3 pt-4 px-4">
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
          </div>
        </div>
      )}
    </nav>
  );
};
