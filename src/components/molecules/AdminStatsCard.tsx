import React from 'react';

interface AdminStatsCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  iconBgClass: string;
  iconTextClass: string;
  blurClass: string;
}

export const AdminStatsCard: React.FC<AdminStatsCardProps> = ({ 
  title, 
  value, 
  description, 
  icon, 
  iconBgClass,
  iconTextClass,
  blurClass
}) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group flex flex-col justify-between h-full min-h-[160px]">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-gray-500 font-bold text-sm uppercase tracking-wider w-2/3">{title}</h3>
        <div className={`p-3 rounded-xl ${iconBgClass} ${iconTextClass} group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
      </div>
      
      <div className="space-y-1 relative z-10">
        <p className="text-3xl font-black text-black">{value}</p>
        <p className="text-xs text-gray-400 font-medium line-clamp-2">{description}</p>
      </div>

      {/* Subtle background decoration */}
      <div className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full ${blurClass} blur-2xl group-hover:scale-150 transition-transform duration-700`}></div>
    </div>
  );
};
