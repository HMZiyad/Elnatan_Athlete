import React from 'react';

interface RoleCardProps {
  role: string;
  description: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

export const RoleCard: React.FC<RoleCardProps> = ({ role, description, icon, isActive, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 flex flex-col p-4 rounded-xl border transition-all text-left group ${
        isActive 
          ? 'border-white bg-dark-300' 
          : 'border-white/10 bg-dark-300/50 hover:border-white/20'
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-lg ${isActive ? 'text-white' : 'text-white/40'}`}>
          {icon}
        </div>
        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
          isActive ? 'border-white' : 'border-white/20'
        }`}>
          {isActive && <div className="w-2 h-2 rounded-full bg-white" />}
        </div>
      </div>
      <h3 className={`text-sm font-bold uppercase tracking-wider mb-1 ${isActive ? 'text-white' : 'text-white/60'}`}>
        {role}
      </h3>
      <p className={`text-[10px] uppercase tracking-widest ${isActive ? 'text-white/40' : 'text-white/20'}`}>
        {description}
      </p>
    </button>
  );
};
