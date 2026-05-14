"use client";

import React from 'react';
import { FileText, Shield, ArrowRight } from 'lucide-react';
import { Button } from '../../atoms/Button';

interface VerificationStepProps {
  onBack: () => void;
  onContinue: () => void;
}

export const VerificationStep: React.FC<VerificationStepProps> = ({ onBack, onContinue }) => {
  return (
    <div className="space-y-16 max-w-4xl">
      <div className="space-y-4">
        <h2 className="text-6xl font-bold tracking-tight uppercase leading-none">ID Verification</h2>
        <p className="text-white/40 text-lg max-w-lg">UAG is for athletes who put in the work when no one is watching.</p>
      </div>

      <div className="space-y-8">
        {/* Upload Area */}
        <div className="border-2 border-dashed border-white/5 rounded-2xl p-24 flex flex-col items-center justify-center text-center bg-dark-400 hover:bg-dark-300 transition-all group cursor-pointer">
          <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <FileText className="text-white/40" />
          </div>
          <h3 className="text-xl font-bold mb-2 uppercase tracking-tight">Upload ID Document</h3>
          <p className="text-xs text-white/20 uppercase tracking-widest font-black mb-6">
            JPEG, PNG, or PDF • Max 10MB
          </p>
          <p className="text-sm text-white/40 font-bold hover:text-white transition-colors underline underline-offset-4 decoration-white/20">
            Click to browse
          </p>
        </div>

        {/* Security Banner */}
        <div className="bg-accent-green/5 border border-accent-green/10 rounded-xl p-6 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-accent-green/10 flex items-center justify-center flex-shrink-0">
            <Shield size={20} className="text-accent-green" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-accent-green">Data security</h4>
            <p className="text-sm text-white/40 leading-relaxed">
              All documents are end-to-end encrypted and synced to your devices. Available without internet.
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-12">
        <Button variant="outline" onClick={onBack} className="px-10 uppercase tracking-widest text-xs">Back</Button>
        <Button onClick={onContinue} className="px-12 uppercase tracking-widest text-xs group">
          Continue <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
        </Button>
      </div>
    </div>
  );
};
