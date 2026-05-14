import React from 'react';
import { DashboardLayout } from '@/components/templates/athlete-view/DashboardLayout';
import { TrendingUp, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/atoms/Button';

export default function EarningsPage() {
  const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const values = [70, 50, 95, 60, 40, 90]; // Percentages for the bars

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl">
        {/* Top Section */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Balance Card */}
          <div className="flex-[2] glass-card border-white/5 p-10 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-4">Available Balance</p>
                <h1 className="text-6xl font-bold tracking-tighter mb-8">$3,847.20</h1>
              </div>
              <div className="bg-accent-green/10 text-accent-green px-4 py-2 rounded-full flex items-center gap-2 text-xs font-bold">
                <TrendingUp size={14} /> +$1,240 this week
              </div>
            </div>
            
            <Button className="w-fit px-12 uppercase tracking-widest text-xs">
              Withdraw
            </Button>
          </div>

          {/* Side Stats */}
          <div className="flex-1 space-y-4">
            {[
              { label: 'Lifetime Earned', value: '$24,780' },
              { label: 'Pending', value: '$642' },
              { label: 'This Year', value: '$11,840' }
            ].map((stat, i) => (
              <div key={i} className="glass-card border-white/5 p-6 flex flex-col justify-center">
                <p className="text-[10px] uppercase tracking-widest text-white/20 font-bold mb-2">{stat.label}</p>
                <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Earnings Chart */}
        <div className="glass-card border-white/5 p-10">
          <h2 className="text-xl font-bold uppercase tracking-tight mb-12">Monthly Earnings</h2>
          
          <div className="relative h-64 flex items-end justify-between gap-4 px-4">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[10px] text-white/20 font-bold pointer-events-none">
              <span>2000</span>
              <span>500</span>
              <span>300</span>
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
