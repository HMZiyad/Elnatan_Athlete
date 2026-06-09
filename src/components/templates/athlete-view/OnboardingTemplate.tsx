import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface OnboardingTemplateProps {
  children: React.ReactNode;
  step: string;
  totalSteps: string;
  title: string;
}

export const OnboardingTemplate: React.FC<OnboardingTemplateProps> = ({ 
  children, 
  step, 
  totalSteps, 
  title 
}) => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="p-8 flex justify-between items-center border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Image src="/assets/logo.png" alt="UAG Logo" width={100} height={32} className="object-contain" priority style={{ width: 'auto', height: 'auto' }} />
        </div>
        
        <div className="text-sm font-medium tracking-tight">
          Step {step} / {totalSteps} {title}
        </div>

        <div className="flex gap-4">
          <Link href="/login" className="px-6 py-2 rounded-full border border-white/20 text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-all">
            Log in
          </Link>
          <Link href="/signup" className="px-6 py-2 rounded-full bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-white/90 transition-all">
            Sign up
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center py-20 px-8">
        <div className="w-full max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  );
};
