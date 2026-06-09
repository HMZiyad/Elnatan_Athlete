"use client";

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/templates/athlete-view/DashboardLayout';
import { TrendingUp, Copy, Users, Zap } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { apiCall } from '@/utils/api';

interface EarningsData {
  available_balance: number;
  lifetime_earned: number;
  pending: number;
}

export default function EarningsPage() {
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [error, setError] = useState('');

  const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const values = [70, 50, 95, 60, 40, 90]; // Percentages for the bars

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        setLoading(true);
        setError('');
        const [resEarnings, resRef] = await Promise.all([
          apiCall<{ data: EarningsData }>('/athletes/me/earnings'),
          apiCall<{ data: { referral_code: string | null } }>('/athletes/me/referral')
        ]);
        setEarnings(resEarnings.data);
        setReferralCode(resRef.data.referral_code);
      } catch (err: any) {
        setError(err.message || 'Failed to load earnings statistics.');
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, []);

  const handleWithdrawClick = () => {
    alert("Withdrawal system is processed via Stripe Connect. Your request will be reviewed by admin.");
  };

  const handleGenerateReferral = async () => {
    try {
      setGeneratingCode(true);
      const res = await apiCall<{ data: { referral_code: string } }>('/athletes/me/referral', { method: 'POST' });
      setReferralCode(res.data.referral_code);
    } catch (err: any) {
      setError(err.message || 'Failed to generate referral code.');
    } finally {
      setGeneratingCode(false);
    }
  };

  const handleCopyReferral = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode);
      alert('Referral code copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center text-white/40 uppercase tracking-widest text-xs">
          Loading earnings...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl">
        {/* Error Alert */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Top Section */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Balance Card */}
          <div className="flex-[2] glass-card border-white/5 p-10 flex flex-col justify-between bg-gradient-to-br from-dark-300 to-dark-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-4">Available Balance</p>
                <h1 className="text-6xl font-bold tracking-tighter mb-8">
                  ${(earnings?.available_balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h1>
              </div>
              <div className="bg-accent-green/10 text-accent-green px-4 py-2 rounded-full flex items-center gap-2 text-xs font-bold">
                <TrendingUp size={14} /> Active Balance
              </div>
            </div>
            
            <Button 
              onClick={handleWithdrawClick}
              className="w-fit px-12 uppercase tracking-widest text-xs cursor-pointer"
            >
              Withdraw
            </Button>
          </div>

          {/* Side Stats */}
          <div className="flex-1 space-y-4">
            {[
              { label: 'Lifetime Earned', value: `$${(earnings?.lifetime_earned || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
              { label: 'Pending', value: `$${(earnings?.pending || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
              { label: 'This Year (Est.)', value: `$${(earnings?.lifetime_earned || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` }
            ].map((stat, i) => (
              <div key={i} className="glass-card border-white/5 p-6 flex flex-col justify-center bg-dark-300">
                <p className="text-[10px] uppercase tracking-widest text-white/20 font-bold mb-2">{stat.label}</p>
                <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Referral Section */}
        <div className="glass-card border-white/5 p-10 bg-gradient-to-r from-primary/10 to-transparent border-l-4 border-l-primary flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
              <Users size={28} />
            </div>
            <div>
              <h2 className="text-xl font-bold uppercase tracking-tight mb-2">Refer Fans, Earn 10%</h2>
              <p className="text-sm text-white/60 max-w-md">
                Share your unique referral code with your fans. When they use it during checkout in the UAG Shop, you will earn a 10% commission on their entire purchase!
              </p>
            </div>
          </div>
          
          <div className="bg-dark-400 p-6 rounded-2xl border border-white/10 w-full md:w-auto min-w-[300px]">
            <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-3 text-center md:text-left">Your Referral Code</p>
            {referralCode ? (
              <div className="flex gap-2">
                <div className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 font-mono text-lg font-bold text-center tracking-wider text-primary">
                  {referralCode}
                </div>
                <button 
                  onClick={handleCopyReferral}
                  className="bg-white/10 hover:bg-white/20 transition-colors px-4 rounded-xl flex items-center justify-center text-white cursor-pointer"
                  title="Copy Code"
                >
                  <Copy size={18} />
                </button>
              </div>
            ) : (
              <Button 
                onClick={handleGenerateReferral} 
                disabled={generatingCode}
                className="w-full flex items-center justify-center gap-2 uppercase tracking-widest text-xs py-3 cursor-pointer"
              >
                <Zap size={14} />
                {generatingCode ? 'Generating...' : 'Generate Code Now'}
              </Button>
            )}
          </div>
        </div>

        {/* Monthly Earnings Chart */}
        <div className="glass-card border-white/5 p-10 bg-dark-300">
          <h2 className="text-xl font-bold uppercase tracking-tight mb-12">Monthly Earnings</h2>
          
          <div className="relative h-64 flex items-end justify-between gap-4 px-4">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[10px] text-white/20 font-bold pointer-events-none">
              <span>High</span>
              <span>Mid</span>
              <span>Low</span>
              <span>0</span>
            </div>

            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between py-1 pointer-events-none">
              <div className="border-t border-white/5 border-dashed w-full" />
              <div className="border-t border-white/5 border-dashed w-full" />
              <div className="border-t border-white/5 border-dashed w-full" />
              <div className="border-t border-white/10 w-full" />
            </div>

            {/* Bars */}
            {months.map((month, i) => (
              <div key={month} className="flex-1 flex flex-col items-center gap-4 group">
                <div 
                  className="w-full max-w-[40px] bg-white/20 group-hover:bg-white transition-all rounded-sm relative overflow-hidden"
                  style={{ height: `${values[i]}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
                <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">{month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
