"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, MapPin, Tag, BadgeCheck, Heart } from 'lucide-react';
import { FanNavbar } from '@/components/organisms/fan/FanNavbar';
import { FanFooter } from '@/components/organisms/fan/FanFooter';

const favoriteAthletes = [
  {
    name: 'Elara Vance',
    sport: 'Sprinting',
    location: 'Los Angeles, CA',
    votes: '42.8K',
    image: '/assets/athlete_sprinter.png',
    verified: true,
  },
  {
    name: 'Jaxon Reed',
    sport: 'Basketball',
    location: 'Brooklyn, NY',
    votes: '31.2K',
    image: '/assets/athlete_basketball.png',
    verified: true,
  },
  {
    name: 'Mia Soto',
    sport: 'MMA',
    location: 'Miami, FL',
    votes: '28.5K',
    image: '/assets/athlete_mma.png',
    verified: true,
  },
  {
    name: 'Tyrese Hill',
    sport: 'Football',
    location: 'Austin, TX',
    votes: '19.2K',
    image: '/assets/athlete_track.png',
    verified: true,
  },
];

export default function FavoritesPage() {
  return (
    <div className="min-h-screen bg-dark-400 flex flex-col">
      <FanNavbar />

      <main className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-12 xl:px-20 py-12 md:py-16 w-full">
        {/* ─── HEADER ─── */}
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold font-heading uppercase tracking-tight mb-3">
            Favorites
          </h1>
          <p className="text-sm text-white/50 max-w-md leading-relaxed">
            Athletes you follow and support, all in one place.
          </p>
        </div>

        {/* ─── ATHLETES GRID ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          {favoriteAthletes.map((athlete, index) => (
            <Link
              href={`/fan/athlete/${index + 1}`}
              key={`${athlete.name}-${index}`}
              className="group bg-dark-200 border border-white/5 rounded-2xl overflow-hidden hover:border-white/15 transition-all relative block"
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

                {/* Heart Icon - top right */}
                <button onClick={(e) => e.preventDefault()} className="absolute top-4 right-4 text-red-500 hover:scale-110 transition-transform">
                  <Heart size={20} className="fill-red-500" />
                </button>

                {/* Name & Location - bottom */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-1.5 mb-1">
                    <h3 className="text-base font-bold font-heading uppercase tracking-tight">
                      {athlete.name}
                    </h3>
                    {athlete.verified && (
                      <BadgeCheck size={16} className="text-[#3b82f6] fill-[#3b82f6]/20" />
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
      </main>

      <FanFooter />
    </div>
  );
}
