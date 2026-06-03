"use client";

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/templates/admin-view/AdminLayout';
import { AdminStatsCard } from '@/components/molecules/AdminStatsCard';
import { FileText, Package, Users, DollarSign } from 'lucide-react';
import { apiCall } from '@/utils/api';

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiCall<{ success: boolean; data: any }>('/admin/stats');
        setStats(res.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch dashboard stats.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-black mb-4"></div>
          <p className="text-gray-500 text-sm">Loading overview stats...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error || !stats) {
    return (
      <AdminLayout>
        <div className="p-12 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-red-500 font-bold mb-2">Error Loading Dashboard</p>
          <p className="text-gray-400 text-xs">{error || 'Unable to retrieve statistics.'}</p>
        </div>
      </AdminLayout>
    );
  }

  const formatRevenue = (val: number) => {
    if (val >= 1000) {
      return `$${(val / 1000).toFixed(2)}K`;
    }
    return `$${val.toFixed(2)}`;
  };

  const statCards = [
    { 
      title: 'Total Orders', 
      value: stats.total_orders.toString(), 
      description: 'All orders placed by customers', 
      icon: <FileText size={24} />, 
      iconBgClass: 'bg-blue-500/10',
      iconTextClass: 'text-blue-500',
      blurClass: 'bg-blue-500/20'
    },
    { 
      title: 'Total Products', 
      value: stats.total_products.toString(), 
      description: 'Products available for customers', 
      icon: <Package size={24} />, 
      iconBgClass: 'bg-orange-500/10',
      iconTextClass: 'text-orange-500',
      blurClass: 'bg-orange-500/20'
    },
    { 
      title: 'Total Customers', 
      value: stats.total_customers.toString(), 
      description: 'Registered fans on the platform', 
      icon: <Users size={24} />, 
      iconBgClass: 'bg-purple-500/10',
      iconTextClass: 'text-purple-500',
      blurClass: 'bg-purple-500/20'
    },
    { 
      title: 'Total Revenue', 
      value: formatRevenue(stats.total_revenue || 0), 
      description: 'Total revenue generated', 
      icon: <DollarSign size={24} />, 
      iconBgClass: 'bg-green-500/10',
      iconTextClass: 'text-green-500',
      blurClass: 'bg-green-500/20'
    },
  ];

  const defaultChartData = [
    { day: 'Mon', value: 0 },
    { day: 'Tue', value: 0 },
    { day: 'Wed', value: 0 },
    { day: 'Thu', value: 0 },
    { day: 'Fri', value: 0 },
    { day: 'Sat', value: 0 },
    { day: 'Sun', value: 0 },
  ];

  const chartData = stats.weekly_order_chart && stats.weekly_order_chart.length > 0
    ? stats.weekly_order_chart.map((d: any) => ({ day: d.day, value: d.orders || 0 }))
    : defaultChartData;

  const maxVal = Math.max(...chartData.map((d: any) => d.value), 10);
  const yLabels = [
    maxVal,
    Math.round(maxVal * 0.8),
    Math.round(maxVal * 0.6),
    Math.round(maxVal * 0.4),
    Math.round(maxVal * 0.2),
    0
  ];

  return (
    <AdminLayout>
      <div className="space-y-12">
        {/* Title */}
        <div>
          <h1 className="text-3xl font-bold text-black mb-1">Dashboard Overview</h1>
          <p className="text-sm text-gray-400 font-medium tracking-tight">Welcome back, here's your overall total order overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {statCards.map((stat, i) => (
            <AdminStatsCard key={i} {...stat} />
          ))}
        </div>

        {/* Chart Section */}
        <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-xl font-bold text-black">Total Orders last 7 days</h2>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-500"></div>
              <span className="text-sm font-medium text-gray-500">Orders</span>
            </div>
          </div>

          <div className="relative h-80 flex items-end justify-between px-10 border-b border-gray-50 pb-8">
            {/* Y-Axis labels */}
            <div className="absolute left-0 inset-y-0 flex flex-col justify-between text-[10px] font-bold text-gray-300 py-8">
              {yLabels.map((lbl, idx) => (
                <span key={idx}>{lbl}</span>
              ))}
            </div>

            {/* Grid lines */}
            <div className="absolute inset-0 left-10 py-8 flex flex-col justify-between pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-full border-t border-gray-50"></div>
              ))}
            </div>

            {/* Bars */}
            {chartData.map((data: any, i: number) => (
              <div key={i} className="flex flex-col items-center gap-4 group relative z-10">
                <div 
                  className="w-10 bg-gray-600 rounded-lg hover:bg-black transition-all cursor-pointer relative"
                  style={{ height: `${(data.value / maxVal) * 100}%` }}
                >
                  {/* Tooltip */}
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {data.value}
                  </div>
                </div>
                <span className="text-xs font-bold text-gray-400">{data.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
