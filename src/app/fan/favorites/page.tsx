"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, MapPin, Tag, BadgeCheck, Star } from 'lucide-react';
import { FanNavbar } from '@/components/organisms/fan/FanNavbar';
import { FanFooter } from '@/components/organisms/fan/FanFooter';
import { apiCall } from '@/utils/api';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await apiCall<{ data: any[] }>('/fans/me/favorites');
        setFavorites(res.data || []);
      } catch (err) {
        console.error('Failed to fetch favorites', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, []);

  const formatVotes = (votes: number) => {
    if (votes >= 1000) return (votes / 1000).toFixed(1) + 'K';
    return votes.toString();
  };

  const handleUnfavorite = async (e: React.MouseEvent, athleteId: string) => {
    e.preventDefault();
    try {
      await apiCall(`/fans/me/favorites/${athleteId}`, { method: 'DELETE' });
      setFavorites(prev => prev.filter(a => a.athlete_id !== athleteId));
    } catch (err: any) {
      alert(err.message || 'Failed to remove from favorites.');
    }
  };

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
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-20 text-white/50">
            You haven't added any favorite athletes yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
            {favorites.map((athlete, index) => {
              const imageSrc = athlete.avatar_url
                ? (athlete.avatar_url.startsWith('http') ? athlete.avatar_url : `http://localhost:8080${athlete.avatar_url}`)
                : '/assets/avatar_placeholder.png';

              return (
                <Link
                  href={`/fan/athlete/${athlete.athlete_id}`}
                  key={athlete.athlete_id}
                  className="group bg-dark-200 border border-white/5 rounded-2xl overflow-hidden hover:border-white/15 transition-all relative block"
                >
                  {/* Image area */}
                  <div className="relative aspect-[4/5] overflow-hidden bg-dark-300">
                    <Image
                      src={imageSrc}
                      alt={athlete.full_name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                    {/* Sport tag - top left */}
                    <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-dark-400/70 backdrop-blur-sm px-3 py-1.5 rounded-full">
                      <Tag size={12} className="text-white/60" />
                      <span className="text-xs font-medium text-white/80">{athlete.sport || 'Athlete'}</span>
                    </div>

                    {/* Star Icon - top right */}
                    <button 
                      onClick={(e) => handleUnfavorite(e, athlete.athlete_id)} 
                      className="absolute top-4 right-4 text-yellow-500 hover:scale-110 transition-transform z-10 bg-dark-400/50 p-1.5 rounded-full backdrop-blur-sm"
                      title="Remove from favorites"
                    >
                      <Star size={16} className="fill-yellow-500" />
                    </button>

                    {/* Name & Location - bottom */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center gap-1.5 mb-1">
                        <h3 className="text-base font-bold font-heading uppercase tracking-tight truncate">
                          {athlete.full_name}
                        </h3>
                        {athlete.verified && (
                          <BadgeCheck size={16} className="text-[#3b82f6] fill-[#3b82f6]/20 shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-white/50 truncate">
                        <MapPin size={12} className="shrink-0" />
                        <span className="truncate">{athlete.location || 'Unknown Location'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Info area */}
                  <div className="p-4">
                    <div className="w-full h-px bg-white/10 mb-3" />
                    <div className="mb-3">
                      <p className="text-[10px] uppercase tracking-widest text-white/40 mb-0.5">Vote</p>
                      <p className="text-lg font-bold">{formatVotes(athlete.total_votes)}</p>
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
      </main>

      <FanFooter />
    </div>
  );
}
