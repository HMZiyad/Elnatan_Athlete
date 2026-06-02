"use client";

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/templates/athlete-view/DashboardLayout';
import { StatCard } from '@/components/molecules/StatCard';
import { DollarSign, Heart, Eye, Share2 } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { apiCall } from '@/utils/api';

interface StatsData {
  total_earnings: number;
  total_votes: number;
  total_profile_views: number;
  current_rank: number;
  tier: string;
}

interface ProfileData {
  full_name: string;
}

interface ReferralData {
  referral_code: string;
  referral_link: string;
  earnings_per_signup: number;
  lifetime_tip_percentage: number;
}

export default function OverviewPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [referral, setReferral] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch data in parallel
        const [statsRes, profileRes, referralRes] = await Promise.all([
          apiCall<{ data: StatsData }>('/athletes/me/stats'),
          apiCall<{ data: ProfileData }>('/athletes/me/profile'),
          apiCall<{ data: ReferralData }>('/athletes/me/referral'),
        ]);

        setStats(statsRes.data);
        setProfile(profileRes.data);
        setReferral(referralRes.data);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleCopyCode = () => {
    if (!referral?.referral_code) return;
    navigator.clipboard.writeText(referral.referral_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    if (!referral?.referral_link) return;
    navigator.clipboard.writeText(referral.referral_link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShare = () => {
    if (!referral?.referral_link) return;
    if (navigator.share) {
      navigator.share({
        title: 'Join UAG Sports',
        text: `Support me on UAG! Use my referral code: ${referral.referral_code}`,
        url: referral.referral_link,
      }).catch(console.error);
    } else {
      handleCopyLink();
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center text-white/40 uppercase tracking-widest text-xs">
          Loading dashboard...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl">
        {/* Error alert if any */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Welcome Banner */}
        <div className="glass-card bg-gradient-to-r from-dark-100 to-transparent p-10 border-white/5">
          <h1 className="text-3xl font-bold mb-3 uppercase tracking-tight">
            Welcome, {profile?.full_name || 'Athlete'}!
          </h1>
          <p className="text-white/40 max-w-xl">
            {stats && stats.current_rank > 0 ? (
              `You are currently ranked #${stats.current_rank} in the global leaderboard (${stats.tier} Tier). Keep posting, momentum is real.`
            ) : (
              "Complete your onboarding to join the leaderboard and start earning from fan votes."
            )}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            label="Total Earnings"
            value={`$${(stats?.total_earnings || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            description="Available + Lifetime Earnings"
            icon={<DollarSign size={20} />}
            iconColor="text-accent-green"
          />
          <StatCard 
            label="Total Votes"
            value={(stats?.total_votes || 0).toLocaleString()}
            description="Total votes received from fans"
            icon={<Heart size={20} />}
            iconColor="text-red-500"
          />
          <StatCard 
            label="Total Profile Views"
            value={(stats?.total_profile_views || 0).toLocaleString()}
            description="Total unique views on your profile card"
            icon={<Eye size={20} />}
            iconColor="text-orange-400"
          />
        </div>

        {/* Referral Section */}
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-[2] glass-card border-white/5 space-y-8">
            <div>
              <h2 className="text-3xl font-bold uppercase tracking-tighter leading-none mb-4">
                Referral code: Share your code. Earn every time.
              </h2>
              <p className="text-sm text-white/40 leading-relaxed max-w-2xl">
                Every fan who signs up or votes with your code puts money in your pocket. 
                <span className="text-white font-bold ml-1">${(referral?.earnings_per_signup || 0.50).toFixed(2)}</span> per signup + 
                <span className="text-white font-bold ml-1">{referral?.lifetime_tip_percentage || 10}%</span> of their lifetime tips.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 bg-black border border-white/10 rounded-lg p-4 flex items-center justify-between group">
                  <span className="text-sm font-medium tracking-widest text-white/60">
                    {referral?.referral_code || 'PENDING'}
                  </span>
                  <button 
                    onClick={handleCopyCode}
                    className="text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white transition-all cursor-pointer"
                  >
                    {copiedCode ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <Button 
                  onClick={handleShare}
                  className="flex gap-2 items-center bg-primary text-white hover:bg-primary/90 rounded-lg border-0 cursor-pointer"
                >
                  <Share2 size={16} /> Share
                </Button>
              </div>

              <div className="bg-black border border-white/10 rounded-lg p-4 flex items-center justify-between">
                <span className="text-sm font-medium text-white/40 truncate select-all">
                  {referral?.referral_link || 'Pending onboarding approval'}
                </span>
                <button 
                  onClick={handleCopyLink}
                  className="text-xs font-bold uppercase tracking-widest text-primary hover:text-primary/80 transition-all whitespace-nowrap ml-4 cursor-pointer"
                >
                  {copiedLink ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 glass-card border-white/5 bg-dark-200/50">
            <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-6">Referral Earnings Program</p>
            
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <p className="text-sm text-white/60 leading-tight">Signup Bonus</p>
                <p className="text-2xl font-bold text-accent-green">
                  ${(referral?.earnings_per_signup || 0.50).toFixed(2)}
                </p>
              </div>
              <div className="flex justify-between items-center py-4 border-t border-white/5">
                <p className="text-sm text-white/60">Tip Commission Share</p>
                <p className="text-xl font-bold">{referral?.lifetime_tip_percentage || 10}%</p>
              </div>
              <div className="flex justify-between items-center py-4 border-t border-white/5">
                <p className="text-sm text-white/60">Payout Basis</p>
                <p className="text-sm text-white/80">Direct Deposit</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
