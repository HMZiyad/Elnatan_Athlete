"use client";

import React, { useState } from 'react';
import { Input } from '../../atoms/Input';
import { Button } from '../../atoms/Button';

interface SportStepProps {
  onBack: () => void;
  onContinue: () => void;
}

export const SportStep: React.FC<SportStepProps> = ({ onBack, onContinue }) => {
  const sports = ['Track & Field', 'Basketball', 'Hockey', 'Football', 'Baseball', 'Other'];
  const [selectedSport, setSelectedSport] = useState('Track & Field');

  const levels = [
    { title: 'Amateur', subtitle: 'Up & Coming' },
    { title: 'Semi Pro', subtitle: 'Reg Competition' },
    { title: 'College', subtitle: 'Varsity Level' },
    { title: 'Pro', subtitle: 'Elite Tier' }
  ];
  const [selectedLevel, setSelectedLevel] = useState('Amateur');

  return (
    <div className="space-y-16 max-w-4xl">
      <div className="space-y-4">
        <h2 className="text-6xl font-bold tracking-tight uppercase leading-none">Your discipline.</h2>
        <p className="text-white/40 text-lg">Pick a sport and tell us where you stand.</p>
      </div>

      <div className="space-y-12">
        {/* Sport Selection */}
        <div className="space-y-4">
          <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Pick your sport</p>
          <div className="flex flex-wrap gap-3">
            {sports.map(sport => (
              <button
                key={sport}
                onClick={() => setSelectedSport(sport)}
                className={`px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                  selectedSport === sport 
                    ? 'bg-white text-black' 
                    : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
                }`}
              >
                {sport}
              </button>
            ))}
          </div>
        </div>

        {/* Level Selection */}
        <div className="space-y-4">
          <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Current Level</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {levels.map(level => (
              <button
                key={level.title}
                onClick={() => setSelectedLevel(level.title)}
                className={`p-6 rounded-xl border transition-all text-left group ${
                  selectedLevel === level.title
                    ? 'bg-white/5 border-white'
                    : 'bg-white/5 border-white/5 hover:border-white/20'
                }`}
              >
                <h3 className="text-xl font-bold uppercase mb-1">{level.title}</h3>
                <p className="text-[8px] uppercase tracking-widest text-white/20 font-black group-hover:text-white/40 transition-all">{level.subtitle}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="space-y-6">
          <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Top Stats</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="200m Sprint" placeholder="22.84s" />
            <Input label="Best Season Year" placeholder="2023" />
            <Input label="Avg Points / Game" placeholder="28.4" />
            <Input label="Personal Best" placeholder="98.2" />
          </div>
        </div>

        {/* Recent Achievements */}
        <div className="space-y-4">
          <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Recent Achievements</p>
          <textarea 
            className="w-full bg-dark-400 border border-white/5 rounded-lg p-6 text-sm focus:outline-none focus:border-white/20 focus:bg-dark-300 transition-all text-white min-h-[120px] placeholder:text-white/10"
            placeholder="2x National 200m champion • 4th at African U23s • Featured in Runner's World."
          />
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
