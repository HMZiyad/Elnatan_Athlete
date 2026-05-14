import React from 'react';

interface AdminBadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'default';
}

export const AdminBadge: React.FC<AdminBadgeProps> = ({ 
  children, 
  variant = 'default' 
}) => {
  const styles = {
    success: 'bg-green-100 text-green-600 border-green-200',
    warning: 'bg-yellow-100 text-yellow-600 border-yellow-200',
    error: 'bg-red-100 text-red-600 border-red-200',
    default: 'bg-gray-100 text-gray-600 border-gray-200',
  };

  return (
    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[variant]}`}>
      {children}
    </span>
  );
};
