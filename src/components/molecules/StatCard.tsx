import React from 'react';

interface StatCardProps {
  label: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  iconColor: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, description, icon, iconColor }) => {
  return (
    <div className="glass-card flex flex-col h-full hover:border-white/20 transition-all group">
      <div className="flex justify-between items-start mb-6">
        <p className="text-sm font-bold text-white/60 group-hover:text-white transition-colors">{label}</p>
        <div className={`p-2 rounded-lg bg-white/5 ${iconColor}`}>
          {icon}
        </div>
      </div>
      <div className="mt-auto">
        <h2 className="text-3xl font-bold mb-2 tracking-tight">{value}</h2>
        <p className="text-[10px] text-white/20 uppercase tracking-widest">{description}</p>
      </div>
    </div>
  );
};
