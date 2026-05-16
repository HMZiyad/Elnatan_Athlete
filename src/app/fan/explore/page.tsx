"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, MapPin, Search, SlidersHorizontal, Tag, BadgeCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { FanNavbar } from '@/components/organisms/fan/FanNavbar';
import { FanFooter } from '@/components/organisms/fan/FanFooter';

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

const athletes = [
  {
    name: 'Elara Vance',
    sport: 'Sprinting',
    location: 'Los Angeles, CA',
    votes: '42.8K',
    rank: 1,
    image: '/assets/athlete_sprinter.png',
    verified: true,
  },
  {
    name: 'Jaxon Reed',
    sport: 'Basketball',
    location: 'Brooklyn, NY',
    votes: '31.2K',
    rank: 2,
    image: '/assets/athlete_basketball.png',
    verified: true,
  },
  {
    name: 'Mia Soto',
    sport: 'MMA',
    location: 'Miami, FL',
    votes: '28.5K',
    rank: 3,
    image: '/assets/athlete_mma.png',
    verified: true,
  },
  {
    name: 'Tyrese Hill',
    sport: 'Football',
    location: 'Austin, TX',
    votes: '19.2K',
    rank: 4,
    image: '/assets/athlete_track.png',
    verified: true,
  },
  {
    name: 'Elara Vance',
    sport: 'Sprinting',
    location: 'Los Angeles, CA',
    votes: '42.8K',
    rank: 1,
    image: '/assets/athlete_sprinter.png',
    verified: true,
  },
  {
    name: 'Jaxon Reed',
    sport: 'Basketball',
    location: 'Brooklyn, NY',
    votes: '31.2K',
    rank: 2,
    image: '/assets/athlete_basketball.png',
    verified: true,
  },
  {
    name: 'Mia Soto',
    sport: 'MMA',
    location: 'Miami, FL',
    votes: '28.5K',
    rank: 3,
    image: '/assets/athlete_mma.png',
    verified: true,
  },
  {
    name: 'Tyrese Hill',
    sport: 'Football',
    location: 'Austin, TX',
    votes: '19.2K',
    rank: 4,
    image: '/assets/athlete_track.png',
    verified: true,
  },
];

/* ───────────────────────── COMPONENT ───────────────────────── */

export default function ExplorePage() {
  const [activeCategory, setActiveCategory] = useState('All Items');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 3;

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
                onClick={() => setActiveCategory(cat)}
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
                placeholder="Search item"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 w-48 sm:w-56 text-sm bg-dark-200 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-white/25 transition-all"
              />
            </div>
            <button className="p-2.5 bg-dark-200 border border-white/10 rounded-lg text-white/50 hover:text-white hover:border-white/25 transition-all">
              <SlidersHorizontal size={16} />
            </button>
          </div>
        </div>

        {/* ─── ATHLETES GRID ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {athletes.map((athlete, index) => (
            <Link
              href={`/fan/athlete/${index + 1}`}
              key={`${athlete.name}-${index}`}
              className="group bg-dark-200 border border-white/5 rounded-2xl overflow-hidden hover:border-white/15 transition-all block"
            >
              {/* Image area */}
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src={athlete.image}
                  alt={athlete.name}
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
                  #{athlete.rank}
                </div>

                {/* Name & Location - bottom */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-1.5 mb-1">
                    <h3 className="text-base font-bold font-heading uppercase tracking-tight">
                      {athlete.name}
                    </h3>
                    {athlete.verified && (
                      <BadgeCheck size={16} className="text-blue-400 fill-blue-400/20" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-white/50">
                    <MapPin size={12} />
                    <span>{athlete.location}</span>
                  </div>
                </div>
              </div>

              {/* Info area */}
              <div className="p-4">
                <div className="w-full h-px bg-white/10 mb-3" />
                <div className="mb-3">
                  <p className="text-[10px] uppercase tracking-widest text-white/40 mb-0.5">Vote</p>
                  <p className="text-lg font-bold">{athlete.votes}</p>
                </div>
                <div
                  className="flex items-center justify-between text-[10px] uppercase tracking-widest text-white/40 font-bold group-hover:text-white transition-colors"
                >
                  <span>View Details</span>
                  <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* ─── PAGINATION ─── */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="p-2 text-white/40 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          {[1, 2, 3].map((page) => (
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
      </div>

      <FanFooter />
    </div>
  );
}
