import React, { useState } from 'react';
import { Input } from '../../atoms/Input';
import { Button } from '../../atoms/Button';
import { apiCall } from '../../../utils/api';

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
  const [sprint200m, setSprint200m] = useState('');
  const [bestSeasonYear, setBestSeasonYear] = useState('');
  const [avgPoints, setAvgPoints] = useState('');
  const [personalBest, setPersonalBest] = useState('');
  const [achievements, setAchievements] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);

    try {
      await apiCall('/athletes/me/onboarding/sport', {
        method: 'PUT',
        body: JSON.stringify({
          sport: selectedSport,
          level: selectedLevel,
          recent_achievements: achievements,
          stats: {
            sprint_200m: sprint200m,
            best_season_year: bestSeasonYear,
            avg_points_per_game: avgPoints,
            personal_best: personalBest,
          },
        }),
      });
      onContinue();
    } catch (err: any) {
      setError(err.message || 'Failed to save sport details. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-16 max-w-4xl">
      <div className="space-y-4">
        <h2 className="text-6xl font-bold tracking-tight uppercase leading-none">Your discipline.</h2>
        <p className="text-white/40 text-lg">Pick a sport and tell us where you stand.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-12">
        {/* Sport Selection */}
        <div className="space-y-4">
          <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Pick your sport</p>
          <div className="flex flex-wrap gap-3">
            {sports.map(sport => (
              <button
                key={sport}
                onClick={() => setSelectedSport(sport)}
                disabled={submitting}
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
                disabled={submitting}
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
            <Input 
              label="200m Sprint" 
              placeholder="22.84s" 
              value={sprint200m}
              onChange={(e) => setSprint200m(e.target.value)}
              disabled={submitting}
            />
            <Input 
              label="Best Season Year" 
              placeholder="2023" 
              value={bestSeasonYear}
              onChange={(e) => setBestSeasonYear(e.target.value)}
              disabled={submitting}
            />
            <Input 
              label="Avg Points / Game" 
              placeholder="28.4" 
              value={avgPoints}
              onChange={(e) => setAvgPoints(e.target.value)}
              disabled={submitting}
            />
            <Input 
              label="Personal Best" 
              placeholder="98.2" 
              value={personalBest}
              onChange={(e) => setPersonalBest(e.target.value)}
              disabled={submitting}
            />
          </div>
        </div>

        {/* Recent Achievements */}
        <div className="space-y-4">
          <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Recent Achievements</p>
          <textarea 
            className="w-full bg-dark-400 border border-white/5 rounded-lg p-6 text-sm focus:outline-none focus:border-white/20 focus:bg-dark-300 transition-all text-white min-h-[120px] placeholder:text-white/10"
            placeholder="2x National 200m champion • 4th at African U23s • Featured in Runner's World."
            value={achievements}
            onChange={(e) => setAchievements(e.target.value)}
            disabled={submitting}
          />
        </div>
      </div>

      <div className="flex gap-4 pt-12">
        <Button variant="outline" onClick={onBack} className="px-10 uppercase tracking-widest text-xs" disabled={submitting}>Back</Button>
        <Button onClick={handleSubmit} className="px-12 uppercase tracking-widest text-xs group" disabled={submitting}>
          {submitting ? 'Saving...' : 'Continue'} <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
        </Button>
      </div>
    </div>
  );
};
