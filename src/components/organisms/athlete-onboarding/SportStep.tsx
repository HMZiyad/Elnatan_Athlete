import React, { useState } from 'react';
import { Input } from '../../atoms/Input';
import { Button } from '../../atoms/Button';
import { apiCall } from '../../../utils/api';

interface SportStepProps {
  onBack: () => void;
  onContinue: () => void;
}

const SPORT_STATS_CONFIG: Record<string, { key: string; label: string; placeholder: string }[]> = {
  'Track & Field': [
    { key: 'sprint_200m', label: '200m Sprint', placeholder: '22.84s' },
    { key: 'best_season_year', label: 'Best Season Year', placeholder: '2023' },
    { key: 'personal_best', label: 'Personal Best', placeholder: '9.8s' },
    { key: 'rank', label: 'National Rank', placeholder: '1st' }
  ],
  'Basketball': [
    { key: 'points_per_game', label: 'Avg Points / Game', placeholder: '28.4' },
    { key: 'assists_per_game', label: 'Avg Assists / Game', placeholder: '8.2' },
    { key: 'rebounds_per_game', label: 'Avg Rebounds / Game', placeholder: '10.5' },
    { key: 'steals_per_game', label: 'Avg Steals / Game', placeholder: '2.1' },
  ],
  'Football': [
    { key: 'goals', label: 'Goals', placeholder: '12' },
    { key: 'assists', label: 'Assists', placeholder: '8' },
    { key: 'pass_completion', label: 'Pass Completion %', placeholder: '85%' },
    { key: 'tackles', label: 'Tackles', placeholder: '45' },
  ],
  'Hockey': [
    { key: 'goals', label: 'Goals', placeholder: '15' },
    { key: 'assists', label: 'Assists', placeholder: '20' },
    { key: 'points', label: 'Total Points', placeholder: '35' },
    { key: 'plus_minus', label: '+/- Rating', placeholder: '+10' },
  ],
  'Baseball': [
    { key: 'batting_avg', label: 'Batting Average', placeholder: '.310' },
    { key: 'home_runs', label: 'Home Runs', placeholder: '25' },
    { key: 'rbis', label: 'RBIs', placeholder: '80' },
    { key: 'stolen_bases', label: 'Stolen Bases', placeholder: '15' },
  ],
  'Other': [
    { key: 'stat_1', label: 'Primary Stat', placeholder: 'Value' },
    { key: 'stat_2', label: 'Secondary Stat', placeholder: 'Value' },
    { key: 'stat_3', label: 'Tertiary Stat', placeholder: 'Value' },
    { key: 'stat_4', label: 'Quaternary Stat', placeholder: 'Value' },
  ]
};

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
  
  const [stats, setStats] = useState<Record<string, string>>({});
  const [achievements, setAchievements] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSportChange = (sport: string) => {
    setSelectedSport(sport);
    setStats({}); // Clear stats when sport changes
  };

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
          stats: stats,
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
                onClick={() => handleSportChange(sport)}
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
            {(SPORT_STATS_CONFIG[selectedSport] || SPORT_STATS_CONFIG['Other']).map((statConfig) => (
              <Input 
                key={statConfig.key}
                label={statConfig.label} 
                placeholder={statConfig.placeholder} 
                value={stats[statConfig.key] || ''}
                onChange={(e) => setStats({ ...stats, [statConfig.key]: e.target.value })}
                disabled={submitting}
              />
            ))}
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
