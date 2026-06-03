"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowUp, ArrowDown, Minus, ChevronLeft, ChevronRight } from 'lucide-react';
import { FanNavbar } from '@/components/organisms/fan/FanNavbar';
import { FanFooter } from '@/components/organisms/fan/FanFooter';
import { apiCall } from '../../../utils/api';

export default function LeaderboardPage() {
  const router = useRouter();
  const [topThree, setTopThree] = useState<any[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLeaderboard = async (pageNum: number) => {
    try {
      const response = await apiCall<{ 
        data: { top_three: any[]; table: any[] };
        meta: { total: number }
      }>(`/athletes/leaderboard?page=${pageNum}&per_page=20`);
      
      setTopThree(response.data.top_three || []);
      setTableData(response.data.table || []);
      setTotal(response.meta.total || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to load leaderboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(page);
  }, [page]);

  const getRankedAthlete = (rank: number) => {
    return topThree.find(a => a.rank === rank) || null;
  };

  const first = getRankedAthlete(1);
  const second = getRankedAthlete(2);
  const third = getRankedAthlete(3);

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

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs px-4 py-3 rounded-lg max-w-5xl mx-auto mb-10 text-center">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center text-white/40 uppercase tracking-widest text-xs">
            Loading leaderboard...
          </div>
        ) : (
          <>
            {/* ─── TOP 3 PODIUM ─── */}
            <div className="flex flex-col md:flex-row items-start justify-center gap-5 md:gap-8 mt-12 mb-20 max-w-5xl mx-auto">
              {/* Rank 2 */}
              <Link href={second?.athlete_id ? `/fan/athlete/${second.athlete_id}` : '#'} className="block w-full md:w-[280px] lg:w-[320px] order-2 md:order-1 relative rounded-2xl overflow-visible md:mt-28 group">
                <div className="relative rounded-2xl overflow-hidden h-[380px] md:h-[420px] border border-[#d97706]/30 group-hover:border-[#d97706]/60 transition-all bg-dark-300">
                  <Image 
                    src={second?.avatar_url || "/assets/athlete_track.png"} 
                    alt={second?.full_name || "Rank 2"} 
                    fill 
                    className="object-cover grayscale-[40%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                  {/* Name & sport */}
                  <div className="absolute bottom-6 left-5 z-10">
                    <h3 className="text-xl font-bold font-heading uppercase tracking-tight group-hover:text-[#d97706] transition-colors">{second?.full_name || "Position 2"}</h3>
                    <p className="text-sm text-white/60 mt-1">{second?.sport || "TBD"}</p>
                  </div>

                  {/* Rank number */}
                  <div className="absolute bottom-[-0.5rem] right-3 text-[8rem] md:text-[9rem] font-bold font-heading leading-none text-transparent [-webkit-text-stroke:2px_rgba(255,255,255,0.6)] select-none pointer-events-none group-hover:[-webkit-text-stroke:2px_rgba(217,119,6,0.6)] transition-all">
                    2
                  </div>
                </div>
                {/* Vote badge */}
                <div className="absolute -top-3 -left-3 z-20 bg-dark-400/90 backdrop-blur-md px-3 py-1.5 rounded-md border border-[#d97706]/30 shadow-lg">
                  <span className="text-sm font-bold text-white">{second?.total_votes || 0} Votes</span>
                </div>
              </Link>

              {/* Rank 1 */}
              <Link href={first?.athlete_id ? `/fan/athlete/${first.athlete_id}` : '#'} className="block w-full md:w-[320px] lg:w-[360px] order-1 md:order-2 relative rounded-2xl overflow-visible group">
                <div className="relative rounded-2xl overflow-hidden h-[420px] md:h-[480px] border border-[#d97706]/40 group-hover:border-[#d97706] transition-all shadow-[0_0_40px_rgba(217,119,6,0.1)] group-hover:shadow-[0_0_40px_rgba(217,119,6,0.4)] bg-dark-300">
                  <Image 
                    src={first?.avatar_url || "/assets/fetured_athlete.png"} 
                    alt={first?.full_name || "Rank 1"} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-all duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                  {/* Name & sport */}
                  <div className="absolute bottom-6 left-5 z-10">
                    <h3 className="text-2xl font-bold font-heading uppercase tracking-tight group-hover:text-[#d97706] transition-colors">{first?.full_name || "Position 1"}</h3>
                    <p className="text-sm text-white/60 mt-1">{first?.sport || "TBD"}</p>
                  </div>

                  {/* Rank number */}
                  <div className="absolute bottom-[-0.5rem] right-3 text-[9rem] md:text-[10rem] font-bold font-heading leading-none text-transparent [-webkit-text-stroke:3px_rgba(255,255,255,0.9)] select-none pointer-events-none drop-shadow-[0_0_20px_rgba(255,255,255,0.15)] group-hover:[-webkit-text-stroke:3px_rgba(217,119,6,0.9)] transition-all">
                    1
                  </div>
                </div>
                {/* Vote badge */}
                <div className="absolute -top-3 -left-3 z-20 bg-dark-400/90 backdrop-blur-md px-3 py-1.5 rounded-md border border-[#d97706]/40 shadow-lg">
                  <span className="text-sm font-bold text-white">{first?.total_votes || 0} Votes</span>
                </div>
              </Link>

              {/* Rank 3 */}
              <Link href={third?.athlete_id ? `/fan/athlete/${third.athlete_id}` : '#'} className="block w-full md:w-[280px] lg:w-[320px] order-3 relative rounded-2xl overflow-visible md:mt-28 group">
                <div className="relative rounded-2xl overflow-hidden h-[380px] md:h-[420px] border border-[#d97706]/30 group-hover:border-[#d97706]/60 transition-all bg-dark-300">
                  <Image 
                    src={third?.avatar_url || "/assets/athlete_mma.png"} 
                    alt={third?.full_name || "Rank 3"} 
                    fill 
                    className="object-cover grayscale-[40%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                  {/* Name & sport */}
                  <div className="absolute bottom-6 left-5 z-10">
                    <h3 className="text-xl font-bold font-heading uppercase tracking-tight group-hover:text-[#d97706] transition-colors">{third?.full_name || "Position 3"}</h3>
                    <p className="text-sm text-white/60 mt-1">{third?.sport || "TBD"}</p>
                  </div>

                  {/* Rank number */}
                  <div className="absolute bottom-[-0.5rem] right-3 text-[8rem] md:text-[9rem] font-bold font-heading leading-none text-transparent [-webkit-text-stroke:2px_rgba(255,255,255,0.6)] select-none pointer-events-none group-hover:[-webkit-text-stroke:2px_rgba(217,119,6,0.6)] transition-all">
                    3
                  </div>
                </div>
                {/* Vote badge */}
                <div className="absolute -top-3 -left-3 z-20 bg-dark-400/90 backdrop-blur-md px-3 py-1.5 rounded-md border border-[#d97706]/30 shadow-lg">
                  <span className="text-sm font-bold text-white">{third?.total_votes || 0} Votes</span>
                </div>
              </Link>
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
                    {tableData.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-white/30 uppercase tracking-widest text-xs font-bold">
                          No other athletes ranked yet
                        </td>
                      </tr>
                    ) : (
                      tableData.map((row, i) => {
                        const rankStr = row.rank < 10 ? `0${row.rank}` : `${row.rank}`;
                        return (
                          <tr 
                            key={row.athlete_id || i} 
                            onClick={() => { if (row.athlete_id) router.push(`/fan/athlete/${row.athlete_id}`); }}
                            className="border-b border-white/5 hover:bg-white/[0.05] transition-colors cursor-pointer"
                          >
                            <td className="py-5 px-6 text-xl font-medium text-white/60">{rankStr}</td>
                            <td className="py-5 px-6">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full overflow-hidden relative bg-dark-300 shrink-0">
                                  <Image src={row.avatar_url || "/assets/athlete_basketball.png"} alt={row.full_name} fill className="object-cover" />
                                </div>
                                <div>
                                  <p className="font-bold text-white/90">{row.full_name}</p>
                                  <p className="text-[11px] text-white/40 mt-0.5">{row.handle || `@${row.username || "athlete"}`} • {row.location || "N/A"}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-5 px-6 text-white/70 text-sm">{row.sport || "N/A"}</td>
                            <td className="py-5 px-6 font-medium text-white/90">{row.total_votes || 0}</td>
                            <td className="py-5 px-6">
                              <div className={`flex items-center gap-1.5 ${row.movement === 'up' ? 'text-[#3B82F6]' : row.movement === 'down' ? 'text-[#EF4444]' : 'text-white/40'}`}>
                                {row.movement === 'up' && <ArrowUp size={14} />}
                                {row.movement === 'down' && <ArrowDown size={14} />}
                                {row.movement === 'same' && <Minus size={14} />}
                                <span className="text-sm font-medium">{row.movement_value || 0}</span>
                              </div>
                            </td>
                            <td className="py-5 px-6">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                                row.tier === 'ELITE'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : row.tier === 'RISING'
                                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              }`}>
                                {row.tier || 'ROOKIE'}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              <div className="p-4 bg-[#151515] flex items-center justify-between text-[10px] font-bold tracking-widest text-white/30 uppercase">
                <span>Total Athletes: {total}</span>
                <div className="flex items-center gap-4">
                  <button 
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    className="hover:text-white transition-colors p-1 disabled:opacity-30 disabled:hover:text-white/30"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span>Page {page} of {Math.max(1, Math.ceil(total / 20))}</span>
                  <button 
                    disabled={page >= Math.ceil(total / 20)}
                    onClick={() => setPage(page + 1)}
                    className="hover:text-white transition-colors p-1 disabled:opacity-30 disabled:hover:text-white/30"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <FanFooter />
    </div>
  );
}
