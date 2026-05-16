"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Heart, MapPin, BadgeCheck, Trophy, Medal, Star, Tag, ArrowUpRight } from 'lucide-react';
import { FanNavbar } from '@/components/organisms/fan/FanNavbar';
import { FanFooter } from '@/components/organisms/fan/FanFooter';

const risingAthletes = [
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

export default function AthleteProfilePage() {
  return (
    <div className="min-h-screen bg-dark-400 flex flex-col">
      <FanNavbar />

      <main className="flex-1 w-full pb-20">
        {/* ─── HERO SECTION ─── */}
        <div className="relative h-[600px] w-full overflow-hidden">
          {/* Background Image */}
          <Image 
            src="/assets/fetured_athlete.png" 
            alt="Devon Carter" 
            fill 
            className="object-cover object-top"
            priority
          />
          {/* Gradients for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-[#0A0A0A]" />

          <div className="absolute inset-0 w-full mx-auto px-4 sm:px-6 lg:px-12 xl:px-20 pt-8 pb-12 flex flex-col justify-between">
            <Link 
              href="/fan/explore" 
              className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors w-fit text-sm font-medium"
            >
              <ArrowLeft size={16} />
              Back to explore
            </Link>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/20 bg-white/10 backdrop-blur-md">
                    Rank #1
                  </span>
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/20 bg-white/10 backdrop-blur-md">
                    Basketball
                  </span>
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-[#3B82F6]/20 bg-[#1e3a8a]/20 text-[#3B82F6] backdrop-blur-md">
                    RISING
                  </span>
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-4xl md:text-6xl font-bold font-heading uppercase tracking-tight text-white drop-shadow-lg">
                    Devon Carter
                  </h1>
                  <BadgeCheck size={32} className="text-[#3b82f6] fill-[#3b82f6]/20 shrink-0" />
                </div>
                
                <div className="flex items-center gap-4 text-sm font-medium text-white/80">
                  <span>@devoncarter</span>
                  <div className="flex items-center gap-1">
                    <MapPin size={14} className="text-white/50" />
                    <span>Los Angeles, CA</span>
                  </div>
                </div>
              </div>

              <button className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-black rounded-lg font-bold uppercase tracking-widest text-sm hover:bg-white/90 transition-colors w-full md:w-auto shrink-0 shadow-xl shadow-white/5">
                <Heart size={16} className="text-red-500 fill-transparent" />
                Vote
              </button>
            </div>
          </div>
        </div>

        <div className="w-full mx-auto px-4 sm:px-6 lg:px-12 xl:px-20 mt-[-3rem] relative z-10">
          {/* ─── STATS BAR ─── */}
          <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4 mb-20 shadow-2xl">
            {/* Stat 1 */}
            <div className="flex-1 flex flex-col items-center justify-center text-center w-full">
              <Heart size={20} className="text-red-500 fill-red-500/20 mb-3" />
              <div className="text-3xl md:text-4xl font-bold font-heading uppercase tracking-tight mb-2">54.3K</div>
              <div className="text-xs text-white/50 uppercase tracking-widest font-bold">Total votes</div>
            </div>
            {/* Divider */}
            <div className="w-full md:w-px h-px md:h-16 bg-white/10" />
            {/* Stat 2 */}
            <div className="flex-1 flex flex-col items-center justify-center text-center w-full">
              <Medal size={20} className="text-[#22c55e] mb-3" />
              <div className="text-3xl md:text-4xl font-bold font-heading uppercase tracking-tight mb-2">#1</div>
              <div className="text-xs text-white/50 uppercase tracking-widest font-bold">Global Rank</div>
            </div>
            {/* Divider */}
            <div className="w-full md:w-px h-px md:h-16 bg-white/10" />
            {/* Stat 3 */}
            <div className="flex-1 flex flex-col items-center justify-center text-center w-full">
              <Trophy size={20} className="text-[#eab308] mb-3" />
              <div className="text-3xl md:text-4xl font-bold font-heading uppercase tracking-tight mb-2">28</div>
              <div className="text-xs text-white/50 uppercase tracking-widest font-bold">Achievements</div>
            </div>
          </div>

          {/* ─── STORY & PHOTOS SPLIT ─── */}
          <div className="flex flex-col lg:flex-row gap-16 mb-24">
            {/* Left: Story & Achievements */}
            <div className="w-full lg:w-1/2">
              <div className="mb-16">
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-3">The Story</p>
                <h2 className="text-2xl md:text-3xl font-bold font-heading uppercase tracking-tight mb-6">
                  Built in the shadows. Ready for the lights.
                </h2>
                <div className="text-sm text-white/60 leading-relaxed space-y-4">
                  <p>
                    6'4" guard out of Memphis. Averaged 28.4 ppg last season at a D2 school nobody scouts.
                  </p>
                  <p>
                    Every vote on UAG translates directly into visibility, sponsorship leads and a slice of the monthly creator pool. Devon represents what this platform was built for talent the system overlooks.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-xl md:text-2xl font-bold font-heading uppercase tracking-tight mb-6">
                  Recent Achievements
                </h2>
                <div className="space-y-4">
                  {[
                    { year: '2025', desc: 'Regional Champion . Best basketball player', badge: 'Gold' },
                    { year: '2024', desc: 'National Invitational . Top 3 basketball player', badge: 'Top 3' },
                    { year: '2023', desc: 'Featured . Sport Magazine Rookie List', badge: 'Press' },
                  ].map((ach, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border border-white/10 rounded-xl bg-[#121212]">
                      <div className="flex items-center gap-6">
                        <span className="text-sm font-bold text-white/50">{ach.year}</span>
                        <span className="text-sm font-medium text-white/90">{ach.desc}</span>
                      </div>
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-[#d97706]/40 text-[#d97706] bg-[#78350f]/10">
                        {ach.badge}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Photos */}
            <div className="w-full lg:w-1/2">
              <h2 className="text-xl md:text-2xl font-bold font-heading uppercase tracking-tight mb-6">
                Photos
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  '/assets/athlete_basketball.png',
                  '/assets/athlete_basketball.png',
                  '/assets/athlete_basketball.png',
                  '/assets/athlete_basketball.png'
                ].map((src, idx) => (
                  <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 group cursor-pointer">
                    <Image 
                      src={src} 
                      alt={`Action shot ${idx + 1}`} 
                      fill 
                      className="object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ─── ATHLETES ALSO RISING ─── */}
          <div>
            <h2 className="text-2xl md:text-3xl font-bold font-heading uppercase tracking-tight mb-8">
              Athletes Also Rising
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {risingAthletes.map((athlete, index) => (
                <Link
                  href={`/fan/athlete/${index + 1}`}
                  key={`${athlete.name}-${index}`}
                  className="group bg-[#121212] border border-white/5 rounded-2xl overflow-hidden hover:border-white/15 transition-all relative block"
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />

                    {/* Sport tag - top left */}
                    <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-[#0a0a0a]/70 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
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
                  <div className="p-4 bg-[#121212]">
                    <div className="w-full h-px bg-white/5 mb-3" />
                    <div className="mb-3">
                      <p className="text-[10px] uppercase tracking-widest text-white/40 mb-0.5 font-bold">Vote</p>
                      <p className="text-lg font-bold">{athlete.votes}</p>
                    </div>
                    <div
                      className="flex items-center justify-between text-[10px] uppercase tracking-widest text-white/40 font-bold hover:text-white transition-colors group/link"
                    >
                      <span>View Details</span>
                      <ArrowUpRight size={14} className="group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </main>

      <FanFooter />
    </div>
  );
}
