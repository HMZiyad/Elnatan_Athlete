import React from 'react';
import Image from 'next/image';

interface AuthTemplateProps {
  children: React.ReactNode;
  imageSrc: string;
}

export const AuthTemplate: React.FC<AuthTemplateProps> = ({ children, imageSrc }) => {
  return (
    <div className="flex min-h-screen bg-black">
      {/* Left side: Image */}
      <div className="hidden lg:flex lg:w-1/2 p-6 h-screen sticky top-0">
        <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <Image
            src={imageSrc}
            alt="Athlete"
            fill
            className="object-cover"
            priority
          />
          {/* Subtle overlay to match the dark premium feel */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      </div>

      {/* Right side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-12 xl:p-24 overflow-y-auto">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
};
