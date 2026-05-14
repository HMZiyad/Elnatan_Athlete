"use client";

import React from 'react';
import { Video, Plus, Camera, Play, Globe, Link as LinkIcon } from 'lucide-react';
import { Input } from '../../atoms/Input';
import { Button } from '../../atoms/Button';

interface StoryStepProps {
  onBack: () => void;
  onGoLive: () => void;
}

export const StoryStep: React.FC<StoryStepProps> = ({ onBack, onGoLive }) => {
  return (
    <div className="space-y-16 max-w-4xl">
      <div className="space-y-4">
        <h2 className="text-6xl font-bold tracking-tight uppercase leading-none">Your Story</h2>
        <p className="text-white/40 text-lg">What makes you underrated? Show us, don't just tell us.</p>
      </div>

      <div className="space-y-12">
        {/* Bio */}
        <div className="space-y-4">
          <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Your Bio</p>
          <div className="relative">
            <textarea 
              className="w-full bg-dark-400 border border-white/5 rounded-lg p-6 text-sm focus:outline-none focus:border-white/20 focus:bg-dark-300 transition-all text-white min-h-[140px] placeholder:text-white/10"
              placeholder="Two-time national champion. No sponsor. Training out of a community track because my country deserves a sub-22 sprinter."
            />
            <div className="absolute bottom-4 right-4 text-[10px] text-white/20 font-bold">0/240</div>
          </div>
        </div>

        {/* Highlight Clip */}
        <div className="space-y-4">
          <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Highlight Clip</p>
          <div className="border-2 border-dashed border-white/5 rounded-2xl p-12 flex flex-col items-center justify-center text-center bg-dark-400 hover:bg-dark-300 transition-all group cursor-pointer">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Video className="text-white/40" />
            </div>
            <h3 className="text-xl font-bold mb-2">Drop your clip here</h3>
            <p className="text-xs text-white/40 max-w-[280px] leading-relaxed mb-8 font-medium">
              MP4 or MOV - up to 200MB - or paste a YouTube/Instagram URL
            </p>
            
            <div className="flex gap-3 w-full max-w-md">
              <input 
                type="text" 
                placeholder="Paste URL here..."
                className="flex-1 bg-black/40 border border-white/5 rounded-lg px-4 py-3 text-xs focus:outline-none focus:border-white/20"
              />
              <button className="bg-white text-black text-[10px] font-bold uppercase tracking-widest px-6 py-3 rounded-lg flex items-center gap-2">
                <Plus size={14} /> Browse File
              </button>
            </div>
          </div>
        </div>

        {/* Photos */}
        <div className="space-y-4">
          <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Photos (Up to 6)</p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square rounded-xl bg-dark-400 border border-white/5 flex items-center justify-center cursor-pointer hover:bg-dark-300 transition-all text-white/10 hover:text-white/40">
                <Plus size={20} />
              </div>
            ))}
          </div>
        </div>

        {/* Socials */}
        <div className="space-y-6">
          <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Socials (Optional)</p>
          <div className="space-y-3">
            {[
              { icon: <Camera size={18} />, label: 'Instagram handle' },
              { icon: <Globe size={18} />, label: 'X handle' },
              { icon: <Play size={18} />, label: 'YouTube channel' },
              { icon: <LinkIcon size={18} />, label: 'Personal Website URL' }
            ].map((social, i) => (
              <div key={i} className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/20 group-hover:text-white/40 transition-colors">
                  {social.icon}
                </div>
                <input 
                  type="text"
                  className="w-full bg-dark-400 border border-white/5 rounded-lg py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-white/20 focus:bg-dark-300 transition-all text-white placeholder:text-white/10"
                  placeholder={social.label}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-12">
        <Button variant="outline" onClick={onBack} className="px-10 uppercase tracking-widest text-xs">Back</Button>
        <Button onClick={onGoLive} className="px-12 uppercase tracking-widest text-xs group">
          Go Live <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
        </Button>
      </div>
    </div>
  );
};
