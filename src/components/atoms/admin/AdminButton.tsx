import React from 'react';

interface AdminButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  fullWidth?: boolean;
}

export const AdminButton: React.FC<AdminButtonProps> = ({ 
  children, 
  fullWidth = false,
  className = '',
  ...props 
}) => {
  return (
    <button 
      className={`inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 py-3.5 px-6 text-sm bg-black text-white hover:bg-gray-900 shadow-sm ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
