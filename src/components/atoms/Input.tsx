import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => {
  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
          {label}
        </label>
      )}
      <input
        className={`w-full bg-dark-400 border border-white/10 rounded-lg py-3 px-4 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-all 
          autofill:shadow-[0_0_0_30px_#0A0A0A_inset] autofill:text-fill-white ${className}`}
        {...props}
      />
    </div>
  );
};
