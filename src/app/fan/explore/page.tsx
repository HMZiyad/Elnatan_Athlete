"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, MapPin, Search, SlidersHorizontal, Tag, BadgeCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { FanNavbar } from '@/components/organisms/fan/FanNavbar';
import { FanFooter } from '@/components/organisms/fan/FanFooter';
import { apiCall } from '@/utils/api';

/* ───────────────────────── DATA ───────────────────────── */

const categories = [
  'All Items',
  'Track & Field',
  'Basketball',
  'MMA',
  'Football',
  'Climbing',
  'Skateboarding',
];

/* ───────────────────────── COMPONENT ───────────────────────── */

export default function ExplorePage() {
  const [activeCategory, setActiveCategory] = useState('All Items');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [athletes, setAthletes] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch approved athletes list dynamically
  useEffect(() => {
    let active = true;
    const fetchTimer = setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const sportParam = activeCategory === 'All Items' ? '' : activeCategory;
        const res = await apiCall<{ data: any[]; meta?: { total: number; per_page: number; page: number } }>(
          `/athletes?sport=${encodeURIComponent(sportParam)}&search=${encodeURIComponent(searchQuery)}&page=${currentPage}&per_page=8`
        );
        if (active) {
          setAthletes(res.data || []);
          if (res.meta) {
            setTotalPages(Math.ceil(res.meta.total / res.meta.per_page) || 1);
          } else {
            setTotalPages(1);
          }
        }
      } catch (err: any) {
        if (active) {
          setError(err.message || 'Failed to fetch athletes');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }, 300); // 300ms search debounce

    return () => {
      active = false;
      clearTimeout(fetchTimer);
    };
  }, [activeCategory, searchQuery, currentPage]);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-dark-400">
      <FanNavbar />

      <div className="w-full mx-auto px-4 sm:px-6 lg:px-12 xl:px-20 py-12 md:py-16">
        {/* ─── HEADER ─── */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold font-heading uppercase tracking-tight mb-3">
            Explore Athletes
          </h1>
          <p className="text-sm text-white/50 max-w-md leading-relaxed">
            Search, filter and find the next breakout. Every profile here is
            <br className="hidden sm:block" />
            one click away from rising.
          </p>
        </div>

        {/* ─── FILTERS ROW ─── */}
        <div className="flex flex-wrap items-center gap-3 mb-12">
          {/* Category Pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-4 py-2 text-xs font-medium rounded-full border transition-all ${
                  activeCategory === cat
                    ? 'border-white text-white bg-white/5'
                    : 'border-white/15 text-white/50 hover:text-white hover:border-white/30'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search + Filter */}
          <div className="flex items-center gap-2 ml-auto">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                placeholder="Search athlete..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9 pr-4 py-2 w-48 sm:w-56 text-sm bg-dark-200 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-white/25 transition-all"
              />
            </div>
            <button className="p-2.5 bg-dark-200 border border-white/10 rounded-lg text-white/50 hover:text-white hover:border-white/25 transition-all">
              <SlidersHorizontal size={16} />
            </button>
          </div>
        </div>

        {/* ─── ATHLETES GRID ─── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white mb-4"></div>
            <p className="text-white/60 text-sm">Loading athletes...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 border border-white/5 rounded-2xl bg-dark-200/50">
            <p className="text-red-400 mb-2">Error loading athletes</p>
            <p className="text-white/40 text-xs">{error}</p>
          </div>
        ) : athletes.length === 0 ? (
          <div className="text-center py-20 border border-white/5 rounded-2xl bg-dark-200/50">
            <p className="text-white/60 mb-2 font-medium">No athletes found</p>
            <p className="text-white/40 text-xs">Try adjusting your filters or search keywords.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {athletes.map((athlete) => {
              const avatar = athlete.avatar_url
                ? (athlete.avatar_url.startsWith('http') ? athlete.avatar_url : `http://localhost:8080${athlete.avatar_url}`)
                : '/assets/athelete_auth.png';

              const votesFormatted = athlete.total_votes >= 1000
                ? `${(athlete.total_votes / 1000).toFixed(1)}K`
                : athlete.total_votes.toString();

              return (
                <Link
                  href={`/fan/athlete/${athlete.id}`}
                  key={athlete.id}
                  className="group bg-dark-200 border border-white/5 rounded-2xl overflow-hidden hover:border-white/15 transition-all block"
                >
                  {/* Image area */}
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Image
                      src={avatar}
                      alt={athlete.full_name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                    {/* Sport tag - top left */}
                    <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-dark-400/70 backdrop-blur-sm px-3 py-1.5 rounded-full">
                      <Tag size={12} className="text-white/60" />
                      <span className="text-xs font-medium text-white/80">{athlete.sport}</span>
                    </div>

                    {/* Rank badge - top right */}
                    <div className="absolute top-4 right-4 text-sm font-bold text-white/80">
                      {athlete.rank ? `#${athlete.rank}` : `--`}
                    </div>

                    {/* Name & Location - bottom */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center gap-1.5 mb-1">
                        <h3 className="text-base font-bold font-heading uppercase tracking-tight">
                          {athlete.full_name}
                        </h3>
                        {athlete.verified && (
                          <BadgeCheck size={16} className="text-blue-400 fill-blue-400/20" />
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-white/50">
                        <MapPin size={12} />
                        <span>{athlete.location || 'USA'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Info area */}
                  <div className="p-4">
                    <div className="w-full h-px bg-white/10 mb-3" />
                    <div className="mb-3">
                      <p className="text-[10px] uppercase tracking-widest text-white/40 mb-0.5">Vote</p>
                      <p className="text-lg font-bold">{votesFormatted}</p>
                    </div>
                    <div
                      className="flex items-center justify-between text-[10px] uppercase tracking-widest text-white/40 font-bold group-hover:text-white transition-colors"
                    >
                      <span>View Details</span>
                      <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* ─── PAGINATION ─── */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 text-white/40 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-9 h-9 text-sm font-medium rounded-lg transition-all ${
                  currentPage === page
                    ? 'bg-white text-black'
                    : 'text-white/50 border border-white/10 hover:border-white/30 hover:text-white'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 text-white/40 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      <FanFooter />
    </div>
  );
}
