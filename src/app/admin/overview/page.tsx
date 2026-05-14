import React from 'react';
import { AdminLayout } from '@/components/templates/admin-view/AdminLayout';
import { AdminStatsCard } from '@/components/molecules/AdminStatsCard';
import { FileText, Package, Users, DollarSign } from 'lucide-react';

export default function AdminOverviewPage() {
  const stats = [
    { 
      title: 'Total Orders', 
      value: '125', 
      description: 'All orders placed by customers', 
      icon: <FileText size={24} />, 
      iconColor: 'bg-blue-500' 
    },
    { 
      title: 'Total Products', 
      value: '34', 
      description: 'Products available for customers', 
      icon: <Package size={24} />, 
      iconColor: 'bg-orange-500' 
    },
    { 
      title: 'Total Customer', 
      value: '642', 
      description: 'Customers who placed orders', 
      icon: <Users size={24} />, 
      iconColor: 'bg-purple-500' 
    },
    { 
      title: 'Total Revenue', 
      value: '$82.12K', 
      description: 'Total revenue generated', 
      icon: <DollarSign size={24} />, 
      iconColor: 'bg-green-500' 
    },
  ];

  const chartData = [
    { day: 'Mon', value: 22 },
    { day: 'Tue', value: 28 },
    { day: 'Wed', value: 20 },
    { day: 'Thu', value: 25 },
    { day: 'Fri', value: 34 },
    { day: 'Sat', value: 18 },
    { day: 'Sun', value: 26 },
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <AdminStatsCard key={i} {...stat} />
          ))}
        </div>

        {/* Chart Section */}
        <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-xl font-bold text-black">Total Orders last month</h2>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-500"></div>
              <span className="text-sm font-medium text-gray-500">Orders</span>
            </div>
          </div>

          <div className="relative h-80 flex items-end justify-between px-10 border-b border-gray-50 pb-8">
            {/* Y-Axis labels */}
            <div className="absolute left-0 inset-y-0 flex flex-col justify-between text-[10px] font-bold text-gray-300 py-8">
              <span>40</span>
              <span>32</span>
              <span>24</span>
              <span>16</span>
              <span>8</span>
              <span>0</span>
            </div>

            {/* Grid lines */}
            <div className="absolute inset-0 left-10 py-8 flex flex-col justify-between pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-full border-t border-gray-50"></div>
              ))}
            </div>

            {/* Bars */}
            {chartData.map((data, i) => (
              <div key={i} className="flex flex-col items-center gap-4 group relative z-10">
                <div 
                  className="w-10 bg-gray-600 rounded-lg hover:bg-black transition-all cursor-pointer relative"
                  style={{ height: `${(data.value / 40) * 100}%` }}
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
