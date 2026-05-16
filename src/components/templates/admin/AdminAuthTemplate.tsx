import React from 'react';
import Image from 'next/image';

interface AdminAuthTemplateProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const AdminAuthTemplate: React.FC<AdminAuthTemplateProps> = ({ children, title, subtitle }) => {
  return (
    <div className="flex min-h-screen bg-[#fafafa] items-center justify-center p-4">
      <div className="w-full max-w-[450px] bg-white rounded-xl shadow-sm border border-gray-100 p-8 sm:p-10">
        <div className="flex flex-col items-center mb-8">
          {/* Logo container */}
          <div className="relative w-48 h-16 mb-6">
            <Image
              src="/assets/logo.png"
              alt="Underrate Logo"
              fill
              className="object-contain invert contrast-200"
              priority
            />
          </div>
          
          <h1 className="text-2xl font-medium text-gray-900 mb-2">{title}</h1>
          {subtitle && (
            <p className="text-sm text-gray-500 text-center">{subtitle}</p>
          )}
        </div>

        {children}
      </div>
    </div>
  );
};
