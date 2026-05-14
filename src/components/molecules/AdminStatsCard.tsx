import React from 'react';

interface AdminStatsCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  iconColor: string;
}

export const AdminStatsCard: React.FC<AdminStatsCardProps> = ({ 
  title, 
  value, 
  description, 
  icon, 
  iconColor 
}) => {
  return (
    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-gray-400 font-medium text-lg">{title}</h3>
        <div className={`p-3 rounded-xl ${iconColor} bg-opacity-10 text-${iconColor.split('-')[1]}-500 group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
      </div>
      
      <div className="space-y-4">
        <p className="text-4xl font-bold text-black">{value}</p>
        <p className="text-sm text-gray-400 font-medium">{description}</p>
      </div>

      {/* Subtle background decoration */}
      <div className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full ${iconColor} bg-opacity-5 blur-2xl group-hover:scale-150 transition-transform duration-700`}></div>
    </div>
  );
};
