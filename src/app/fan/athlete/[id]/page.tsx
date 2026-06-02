"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Heart, MapPin, BadgeCheck, Trophy, Medal, Tag, ArrowUpRight } from 'lucide-react';
import { FanNavbar } from '@/components/organisms/fan/FanNavbar';
import { FanFooter } from '@/components/organisms/fan/FanFooter';
import { apiCall } from '@/utils/api';

export default function AthleteProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [athleteData, setAthleteData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Voting states
  const [voting, setVoting] = useState(false);
  const [hasVotedToday, setHasVotedToday] = useState(false);
  const [voteCount, setVoteCount] = useState(0);
  const [voteSuccessMsg, setVoteSuccessMsg] = useState('');
  const [voteErrorMsg, setVoteErrorMsg] = useState('');

  // Rising athletes (sidebar/footer recommendation)
  const [risingAthletes, setRisingAthletes] = useState<any[]>([]);

  // Auth check
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true');
    }
  }, []);

  // Fetch athlete profile & vote status
  useEffect(() => {
    if (!id) return;

    const fetchAthleteProfile = async () => {
      setLoading(true);
      setError('');
      try {
        // 1. Fetch public profile
        const profileRes = await apiCall<{ success: boolean; data: any }>(`/athletes/${id}`);
        setAthleteData(profileRes.data);
        setVoteCount(profileRes.data.total_votes || 0);

        // 2. Fetch vote status if user is logged in
        if (typeof window !== 'undefined' && localStorage.getItem('isLoggedIn') === 'true') {
          try {
            const statusRes = await apiCall<{ success: boolean; data: { has_voted_today: boolean } }>(
              `/athletes/${id}/vote-status`
            );
            setHasVotedToday(statusRes.data.has_voted_today);
          } catch (e) {
            // Ignore error or silent fail for vote-status check (e.g. if expired)
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load athlete profile');
      } finally {
        setLoading(false);
      }
    };

    fetchAthleteProfile();
  }, [id]);

  // Fetch other rising athletes
  useEffect(() => {
    const fetchRisingAthletes = async () => {
      try {
        const res = await apiCall<{ success: boolean; data: any[] }>('/athletes?page=1&per_page=5');
        // Filter out the current athlete if present
        const filtered = (res.data || []).filter((ath: any) => ath.id !== id).slice(0, 4);
        setRisingAthletes(filtered);
      } catch (err) {
        // Silent fail for recommendations
      }
    };
    fetchRisingAthletes();
  }, [id]);

  // Handle casting a vote
  const handleVote = async () => {
    if (!isLoggedIn) {
      router.push(`/login?redirect=/fan/athlete/${id}`);
      return;
    }

    setVoting(true);
    setVoteSuccessMsg('');
    setVoteErrorMsg('');

    try {
      const res = await apiCall<{ success: boolean; data: { new_total_votes: number } }>(
        `/athletes/${id}/vote`,
        { method: 'POST' }
      );
      setHasVotedToday(true);
      setVoteCount(res.data.new_total_votes);
      setVoteSuccessMsg('Vote cast successfully!');
      
      // Auto clear success message after 5 seconds
      setTimeout(() => setVoteSuccessMsg(''), 5000);
    } catch (err: any) {
      setVoteErrorMsg(err.message || 'Failed to submit vote. Please try again.');
      
      // Auto clear error message after 5 seconds
      setTimeout(() => setVoteErrorMsg(''), 5000);
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-400 flex flex-col">
        <FanNavbar />
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white mb-4"></div>
          <p className="text-white/60 text-sm">Loading athlete profile...</p>
        </div>
        <FanFooter />
      </div>
    );
  }

  if (error || !athleteData) {
    return (
      <div className="min-h-screen bg-dark-400 flex flex-col">
        <FanNavbar />
        <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center">
          <p className="text-red-400 mb-2 font-medium">Error loading profile</p>
          <p className="text-white/40 text-xs mb-6 max-w-md">{error || 'Athlete profile not found or unapproved.'}</p>
          <Link href="/fan/explore" className="px-6 py-2.5 border border-white/10 rounded-lg text-white/80 hover:text-white hover:border-white/20 transition-all text-sm font-medium">
            Back to Explore
          </Link>
        </div>
        <FanFooter />
      </div>
    );
  }

  const avatar = athleteData.avatar_url
    ? (athleteData.avatar_url.startsWith('http') ? athleteData.avatar_url : `http://localhost:8080${athleteData.avatar_url}`)
    : '/assets/athelete_auth.png';

  const defaultPhotos = [
    '/assets/athlete_basketball.png',
    '/assets/athlete_mma.png',
    '/assets/athlete_sprinter.png',
    '/assets/athlete_track.png',
  ];

  const profilePhotos = athleteData.photos && athleteData.photos.length > 0
    ? athleteData.photos.map((url: string) => url.startsWith('http') ? url : `http://localhost:8080${url}`)
    : defaultPhotos;

  return (
    <div className="min-h-screen bg-dark-400 flex flex-col">
      <FanNavbar />

      <main className="flex-1 w-full pb-20">
        {/* ─── HERO SECTION ─── */}
        <div className="relative h-[600px] w-full overflow-hidden">
          {/* Background Image */}
          <Image 
            src={avatar} 
            alt={athleteData.full_name} 
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
                  {athleteData.rank && (
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/20 bg-white/10 backdrop-blur-md text-white">
                      Rank #{athleteData.rank}
                    </span>
                  )}
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/20 bg-white/10 backdrop-blur-md text-white">
                    {athleteData.sport}
                  </span>
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-[#3B82F6]/20 bg-[#1e3a8a]/20 text-[#3B82F6] backdrop-blur-md">
                    {athleteData.tier || 'RISING'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-4xl md:text-6xl font-bold font-heading uppercase tracking-tight text-white drop-shadow-lg">
                    {athleteData.full_name}
                  </h1>
                  {athleteData.verified && (
                    <BadgeCheck size={32} className="text-[#3b82f6] fill-[#3b82f6]/20 shrink-0" />
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-sm font-medium text-white/80">
                  <span>@{athleteData.username}</span>
                  <div className="flex items-center gap-1">
                    <MapPin size={14} className="text-white/50" />
                    <span>{athleteData.location || 'USA'}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 w-full md:w-auto shrink-0">
                <button 
                  onClick={handleVote}
                  disabled={voting || hasVotedToday}
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-black disabled:bg-white/40 disabled:text-black/50 disabled:cursor-not-allowed rounded-lg font-bold uppercase tracking-widest text-sm hover:bg-white/90 transition-colors w-full md:w-auto shadow-xl shadow-white/5"
                >
                  <Heart size={16} className={`text-red-500 ${hasVotedToday ? 'fill-red-500' : 'fill-transparent'}`} />
                  {voting ? 'Casting...' : hasVotedToday ? 'Voted Today' : 'Vote'}
                </button>
                {voteSuccessMsg && (
                  <p className="text-emerald-400 text-xs font-bold text-center mt-1 animate-pulse">{voteSuccessMsg}</p>
                )}
                {voteErrorMsg && (
                  <p className="text-red-400 text-xs font-bold text-center mt-1">{voteErrorMsg}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="w-full mx-auto px-4 sm:px-6 lg:px-12 xl:px-20 mt-[-3rem] relative z-10">
          {/* ─── STATS BAR ─── */}
          <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4 mb-20 shadow-2xl">
            {/* Stat 1 */}
            <div className="flex-1 flex flex-col items-center justify-center text-center w-full">
              <Heart size={20} className="text-red-500 fill-red-500/20 mb-3" />
              <div className="text-3xl md:text-4xl font-bold font-heading uppercase tracking-tight mb-2">
                {voteCount >= 1000 ? `${(voteCount / 1000).toFixed(1)}K` : voteCount}
              </div>
              <div className="text-xs text-white/50 uppercase tracking-widest font-bold">Total votes</div>
            </div>
            {/* Divider */}
            <div className="w-full md:w-px h-px md:h-16 bg-white/10" />
            {/* Stat 2 */}
            <div className="flex-1 flex flex-col items-center justify-center text-center w-full">
              <Medal size={20} className="text-[#22c55e] mb-3" />
              <div className="text-3xl md:text-4xl font-bold font-heading uppercase tracking-tight mb-2">
                {athleteData.rank ? `#${athleteData.rank}` : '--'}
              </div>
              <div className="text-xs text-white/50 uppercase tracking-widest font-bold">Global Rank</div>
            </div>
            {/* Divider */}
            <div className="w-full md:w-px h-px md:h-16 bg-white/10" />
            {/* Stat 3 */}
            <div className="flex-1 flex flex-col items-center justify-center text-center w-full">
              <Trophy size={20} className="text-[#eab308] mb-3" />
              <div className="text-3xl md:text-4xl font-bold font-heading uppercase tracking-tight mb-2">
                {athleteData.tier || 'RISING'}
              </div>
              <div className="text-xs text-white/50 uppercase tracking-widest font-bold">Athlete Tier</div>
            </div>
          </div>

          {/* ─── STORY & PHOTOS SPLIT ─── */}
          <div className="flex flex-col lg:flex-row gap-16 mb-24">
            {/* Left: Story & Achievements */}
            <div className="w-full lg:w-1/2">
              <div className="mb-16">
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-3">The Story</p>
                <h2 className="text-2xl md:text-3xl font-bold font-heading uppercase tracking-tight mb-6">
                  {athleteData.full_name} profile details
                </h2>
                <div className="text-sm text-white/60 leading-relaxed space-y-4">
                  {athleteData.bio ? (
                    <p>{athleteData.bio}</p>
                  ) : (
                    <p>No story details have been configured for this athlete profile yet. Every vote translates directly into visibility, sponsorship leads and a slice of the monthly creator pool.</p>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-xl md:text-2xl font-bold font-heading uppercase tracking-tight mb-6">
                  Athlete Details
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-white/10 rounded-xl bg-[#121212]">
                    <div className="flex items-center gap-6">
                      <span className="text-sm font-bold text-white/50">Sport Type</span>
                      <span className="text-sm font-medium text-white/90">{athleteData.sport}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-white/10 rounded-xl bg-[#121212]">
                    <div className="flex items-center gap-6">
                      <span className="text-sm font-bold text-white/50">Location</span>
                      <span className="text-sm font-medium text-white/90">{athleteData.location || 'USA'}</span>
                    </div>
                  </div>
                  {athleteData.socials && Object.values(athleteData.socials).some(Boolean) && (
                    <div className="flex flex-col p-4 border border-white/10 rounded-xl bg-[#121212] gap-2">
                      <span className="text-sm font-bold text-white/50 mb-1">Social Links</span>
                      <div className="flex flex-wrap gap-4 text-xs font-semibold uppercase tracking-wider text-[#3B82F6]">
                        {athleteData.socials.instagram && (
                          <a href={athleteData.socials.instagram} target="_blank" rel="noopener noreferrer" className="hover:underline">Instagram</a>
                        )}
                        {athleteData.socials.twitter_x && (
                          <a href={athleteData.socials.twitter_x} target="_blank" rel="noopener noreferrer" className="hover:underline">Twitter/X</a>
                        )}
                        {athleteData.socials.youtube && (
                          <a href={athleteData.socials.youtube} target="_blank" rel="noopener noreferrer" className="hover:underline">YouTube</a>
                        )}
                        {athleteData.socials.website && (
                          <a href={athleteData.socials.website} target="_blank" rel="noopener noreferrer" className="hover:underline">Website</a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Photos */}
            <div className="w-full lg:w-1/2">
              <h2 className="text-xl md:text-2xl font-bold font-heading uppercase tracking-tight mb-6">
                Photos
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {profilePhotos.map((src: string, idx: number) => (
                  <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 group cursor-pointer">
                    <Image 
                      src={src} 
                      alt={`${athleteData.full_name} gallery ${idx + 1}`} 
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
          {risingAthletes.length > 0 && (
            <div>
              <h2 className="text-2xl md:text-3xl font-bold font-heading uppercase tracking-tight mb-8">
                Athletes Also Rising
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {risingAthletes.map((athlete) => {
                  const athAvatar = athlete.avatar_url
                    ? (athlete.avatar_url.startsWith('http') ? athlete.avatar_url : `http://localhost:8080${athlete.avatar_url}`)
                    : '/assets/athelete_auth.png';

                  const athVotes = athlete.total_votes >= 1000
                    ? `${(athlete.total_votes / 1000).toFixed(1)}K`
                    : athlete.total_votes.toString();

                  return (
                    <Link
                      href={`/fan/athlete/${athlete.id}`}
                      key={athlete.id}
                      className="group bg-[#121212] border border-white/5 rounded-2xl overflow-hidden hover:border-white/15 transition-all relative block"
                    >
                      {/* Image area */}
                      <div className="relative aspect-[4/5] overflow-hidden">
                        <Image
                          src={athAvatar}
                          alt={athlete.full_name}
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
                          {athlete.rank ? `#${athlete.rank}` : `--`}
                        </div>

                        {/* Name & Location - bottom */}
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="flex items-center gap-1.5 mb-1">
                            <h3 className="text-base font-bold font-heading uppercase tracking-tight">
                              {athlete.full_name}
                            </h3>
                            {athlete.verified && (
                              <BadgeCheck size={16} className="text-[#3b82f6] fill-[#3b82f6]/20" />
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-white/50">
                            <MapPin size={12} />
                            <span>{athlete.location || 'USA'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Info area */}
                      <div className="p-4 bg-[#121212]">
                        <div className="w-full h-px bg-white/5 mb-3" />
                        <div className="mb-3">
                          <p className="text-[10px] uppercase tracking-widest text-white/40 mb-0.5 font-bold">Vote</p>
                          <p className="text-lg font-bold">{athVotes}</p>
                        </div>
                        <div
                          className="flex items-center justify-between text-[10px] uppercase tracking-widest text-white/40 font-bold hover:text-white transition-colors group/link"
                        >
                          <span>View Details</span>
                          <ArrowUpRight size={14} className="group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </main>

      <FanFooter />
    </div>
  );
}
