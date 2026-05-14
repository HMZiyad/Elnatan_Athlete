import React from 'react';
import { DashboardLayout } from '@/components/templates/athlete-view/DashboardLayout';
import { StatCard } from '@/components/molecules/StatCard';
import { DollarSign, Heart, Eye, Copy, Share2 } from 'lucide-react';
import { Button } from '@/components/atoms/Button';

export default function OverviewPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl">
        {/* Welcome Banner */}
        <div className="glass-card bg-gradient-to-r from-dark-100 to-transparent p-10 border-white/5">
          <h1 className="text-3xl font-bold mb-3 uppercase tracking-tight">Welcome, Jon Kabir!</h1>
          <p className="text-white/40 max-w-xl">
            You're 2,150 votes from claiming the #1 spot. Keep posting momentum is real.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            label="Total Earnings"
            value="$2,840"
            description="Earnings"
            icon={<DollarSign size={20} />}
            iconColor="text-accent-green"
          />
          <StatCard 
            label="Total Vote"
            value="48.2K"
            description="All orders placed by customers"
            icon={<Heart size={20} />}
            iconColor="text-red-500"
          />
          <StatCard 
            label="Total Profile views"
            value="84.2K"
            description="Customers who placed orders"
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
                <span className="text-white font-bold ml-1">$0.50</span> per signup + 
                <span className="text-white font-bold ml-1">10%</span> of their lifetime tips.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 bg-black border border-white/10 rounded-lg p-4 flex items-center justify-between group">
                  <span className="text-sm font-medium tracking-widest text-white/60">UAG-MAYAREYES</span>
                  <button className="text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white transition-all">
                    Copy
                  </button>
                </div>
                <Button className="flex gap-2 items-center bg-primary text-white hover:bg-primary/90 rounded-lg border-0">
                  <Share2 size={16} /> Share
                </Button>
              </div>

              <div className="bg-black border border-white/10 rounded-lg p-4 flex items-center justify-between">
                <span className="text-sm font-medium text-white/40 truncate">
                  https://uag.app/r/UAG-MAYAREYES
                </span>
                <button className="text-xs font-bold uppercase tracking-widest text-primary hover:text-primary/80 transition-all whitespace-nowrap ml-4">
                  Copy Link
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 glass-card border-white/5 bg-dark-200/50">
            <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-6">Referral Earnings</p>
            
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <p className="text-sm text-white/60 leading-tight">Total Paid<br/>Out</p>
                <p className="text-2xl font-bold text-accent-green">$486.50</p>
              </div>
              <div className="flex justify-between items-center py-4 border-t border-white/5">
                <p className="text-sm text-white/60">Sign ups</p>
                <p className="text-xl font-bold">214</p>
              </div>
              <div className="flex justify-between items-center py-4 border-t border-white/5">
                <p className="text-sm text-white/60">Votes via Code</p>
                <p className="text-xl font-bold">1,082</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
