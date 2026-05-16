"use client";

import React from 'react';
import Image from 'next/image';
import { ArrowUp, ArrowDown, Minus, ChevronLeft, ChevronRight } from 'lucide-react';
import { FanNavbar } from '@/components/organisms/fan/FanNavbar';
import { FanFooter } from '@/components/organisms/fan/FanFooter';

const leaderboardData = [
  {
    rank: '04',
    name: 'Marco Velez',
    handle: '@marcovz',
    location: 'Buenos Aires',
    sport: 'Football',
    votes: '33.5k',
    movement: 'same',
    movementValue: '0',
    tier: 'RISING',
    avatar: '/assets/athlete_basketball.png',
  },
  {
    rank: '05',
    name: 'Nova Hill',
    handle: '@novaclimbs',
    location: 'Boulder, CO',
    sport: 'Climbing',
    votes: '29.9k',
    movement: 'down',
    movementValue: '-2',
    tier: 'RISING',
    avatar: '/assets/athlete_sprinter.png',
  },
  {
    rank: '06',
    name: 'Kai Brooks',
    handle: '@kaibrooks',
    location: 'Lisbon, PT',
    sport: 'Skateboarding',
    votes: '24.5k',
    movement: 'up',
    movementValue: '+2',
    tier: 'ROOKIE',
    avatar: '/assets/fetured_athlete.png',
  },
];

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-dark-400">
      <FanNavbar />

      <div className="w-full mx-auto px-4 sm:px-6 lg:px-12 xl:px-20 py-12 md:py-16">
        {/* ─── HEADER ─── */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold font-heading uppercase tracking-tight mb-3">
            Leaderboard
          </h1>
          <p className="text-sm text-white/50 max-w-lg leading-relaxed">
            Updated every hour. Top 100 earn this month. Movement reflects last 7 days.
          </p>
        </div>

        {/* ─── TOP 3 PODIUM ─── */}
        <div className="flex flex-col md:flex-row items-start justify-center gap-5 md:gap-8 mt-12 mb-20 max-w-5xl mx-auto">
          {/* Rank 2 — Maya Reyes */}
          <div className="w-full md:w-[280px] lg:w-[320px] order-2 md:order-1 relative rounded-2xl overflow-visible md:mt-28">
            <div className="relative rounded-2xl overflow-hidden h-[380px] md:h-[420px] border border-[#d97706]/30 hover:border-[#d97706]/50 transition-all">
              <Image src="/assets/athlete_track.png" alt="Maya Reyes" fill className="object-cover grayscale-[40%]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

              {/* Name & sport */}
              <div className="absolute bottom-6 left-5 z-10">
                <h3 className="text-xl font-bold font-heading uppercase tracking-tight">Maya Reyes</h3>
                <p className="text-sm text-white/60 mt-1">Track & Field</p>
              </div>

              {/* Rank number */}
              <div className="absolute bottom-[-0.5rem] right-3 text-[8rem] md:text-[9rem] font-bold font-heading leading-none text-transparent [-webkit-text-stroke:2px_rgba(255,255,255,0.6)] select-none pointer-events-none">
                2
              </div>
            </div>
            {/* Vote badge — top left, overlapping */}
            <div className="absolute -top-3 -left-3 z-20 bg-dark-400/90 backdrop-blur-md px-3 py-1.5 rounded-md border border-[#d97706]/30 shadow-lg">
              <span className="text-sm font-bold text-white">41.1K Votes</span>
            </div>
          </div>

          {/* Rank 1 — Devon Carter (Center, tallest) */}
          <div className="w-full md:w-[320px] lg:w-[360px] order-1 md:order-2 relative rounded-2xl overflow-visible">
            <div className="relative rounded-2xl overflow-hidden h-[420px] md:h-[480px] border border-[#d97706]/40 hover:border-[#d97706]/60 transition-all shadow-[0_0_40px_rgba(217,119,6,0.1)]">
              <Image src="/assets/fetured_athlete.png" alt="Devon Carter" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

              {/* Name & sport */}
              <div className="absolute bottom-6 left-5 z-10">
                <h3 className="text-2xl font-bold font-heading uppercase tracking-tight">Devon Carter</h3>
                <p className="text-sm text-white/60 mt-1">Basketball</p>
              </div>

              {/* Rank number */}
              <div className="absolute bottom-[-0.5rem] right-3 text-[9rem] md:text-[10rem] font-bold font-heading leading-none text-transparent [-webkit-text-stroke:3px_rgba(255,255,255,0.9)] select-none pointer-events-none drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]">
                1
              </div>
            </div>
            {/* Vote badge — top left, overlapping */}
            <div className="absolute -top-3 -left-3 z-20 bg-dark-400/90 backdrop-blur-md px-3 py-1.5 rounded-md border border-[#d97706]/40 shadow-lg">
              <span className="text-sm font-bold text-white">54.3K Votes</span>
            </div>
          </div>

          {/* Rank 3 — Layla Okafor */}
          <div className="w-full md:w-[280px] lg:w-[320px] order-3 relative rounded-2xl overflow-visible md:mt-28">
            <div className="relative rounded-2xl overflow-hidden h-[380px] md:h-[420px] border border-[#d97706]/30 hover:border-[#d97706]/50 transition-all">
              <Image src="/assets/athlete_mma.png" alt="Layla Okafor" fill className="object-cover grayscale-[40%]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

              {/* Name & sport */}
              <div className="absolute bottom-6 left-5 z-10">
                <h3 className="text-xl font-bold font-heading uppercase tracking-tight">Layla Okafor</h3>
                <p className="text-sm text-white/60 mt-1">Climbing & MMA</p>
              </div>

              {/* Rank number */}
              <div className="absolute bottom-[-0.5rem] right-3 text-[8rem] md:text-[9rem] font-bold font-heading leading-none text-transparent [-webkit-text-stroke:2px_rgba(255,255,255,0.6)] select-none pointer-events-none">
                3
              </div>
            </div>
            {/* Vote badge — top left, overlapping */}
            <div className="absolute -top-3 -left-3 z-20 bg-dark-400/90 backdrop-blur-md px-3 py-1.5 rounded-md border border-[#d97706]/30 shadow-lg">
              <span className="text-sm font-bold text-white">39.4K Votes</span>
            </div>
          </div>
        </div>

        {/* ─── LEADERBOARD TABLE ─── */}
        <div className="bg-[#121212] border border-white/5 rounded-2xl overflow-hidden mb-20">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-white/5 text-[10px] text-white/40 uppercase tracking-widest bg-[#151515]">
                  <th className="py-4 px-6 font-medium w-24">Rank</th>
                  <th className="py-4 px-6 font-medium">Athlete</th>
                  <th className="py-4 px-6 font-medium w-48">Sport</th>
                  <th className="py-4 px-6 font-medium w-32">Votes</th>
                  <th className="py-4 px-6 font-medium w-32">Movement</th>
                  <th className="py-4 px-6 font-medium w-32">Tier</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {leaderboardData.map((row, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="py-5 px-6 text-xl font-medium text-white/60">{row.rank}</td>
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden relative bg-dark-300 shrink-0">
                          <Image src={row.avatar} alt={row.name} fill className="object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-white/90">{row.name}</p>
                          <p className="text-[11px] text-white/40 mt-0.5">{row.handle} • {row.location}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-6 text-white/70 text-sm">{row.sport}</td>
                    <td className="py-5 px-6 font-medium text-white/90">{row.votes}</td>
                    <td className="py-5 px-6">
                      <div className={`flex items-center gap-1.5 ${row.movement === 'up' ? 'text-[#3B82F6]' : row.movement === 'down' ? 'text-[#EF4444]' : 'text-white/40'}`}>
                        {row.movement === 'up' && <ArrowUp size={14} />}
                        {row.movement === 'down' && <ArrowDown size={14} />}
                        {row.movement === 'same' && <Minus size={14} />}
                        <span className="text-sm font-medium">{row.movementValue}</span>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                        row.tier === 'RISING' 
                          ? 'bg-[#1e3a8a]/20 text-[#3B82F6] border-[#3B82F6]/20' 
                          : 'bg-[#78350f]/20 text-[#d97706] border-[#d97706]/20'
                      }`}>
                        {row.tier}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-[#151515] flex items-center justify-between text-[10px] font-bold tracking-widest text-white/30 uppercase">
            <span>Showing 4-6 of 250 athletes</span>
            <div className="flex items-center gap-4">
              <button className="hover:text-white transition-colors p-1"><ChevronLeft size={16} /></button>
              <button className="hover:text-white transition-colors p-1"><ChevronRight size={16} /></button>
            </div>
          </div>
        </div>
      </div>

      <FanFooter />
    </div>
  );
}
