import React, { useState } from 'react';
import { Button } from '../../atoms/Button';
import { apiCall } from '../../../utils/api';

interface AgreementStepProps {
  onBack: () => void;
  onAgree: () => void;
}

export const AgreementStep: React.FC<AgreementStepProps> = ({ onBack, onAgree }) => {
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!agreed) return;

    setError('');
    setSubmitting(true);

    try {
      await apiCall('/athletes/me/onboarding/terms', {
        method: 'PUT',
        body: JSON.stringify({
          agreed_to_terms: true,
          agreed_to_privacy: true,
          agreed_to_earnings_policy: true,
        }),
      });
      onAgree();
    } catch (err: any) {
      setError(err.message || 'Failed to save terms agreement. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-16 max-w-4xl">
      <div className="space-y-4">
        <h2 className="text-6xl font-bold tracking-tight uppercase leading-none">Media Release & Terms of Use Agreement</h2>
        <p className="text-white/40 text-lg max-w-2xl">By participating, you agree to the following terms regarding your content and likeness.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-10 bg-dark-400 p-10 rounded-2xl border border-white/5 max-h-[500px] overflow-y-auto custom-scrollbar">
        {[
          { title: '1. PERMISSION TO USE CONTENT', text: 'You grant Underrated Athletes a worldwide, royalty-free license to use, edit, and publish your Content across social media, websites, and promotional materials.' },
          { title: '2. RIGHT TO PUBLICITY', text: 'Name and likeness may be used for editorial purposes without further approval. You waive the right to inspect finished products.' },
          { title: '3. NO COMPENSATION', text: 'Participation is voluntary. You acknowledge that exposure constitutes sufficient consideration for these rights.' },
          { title: '4. CONTENT OWNERSHIP', text: 'You warrant that you own the rights to the Content and it does not infringe on any third-party intellectual property.' },
          { title: '5. RELEASE OF LIABILITY', text: 'You release Underrated Athletes from claims related to libel, defamation, or invasion of privacy arising from Content use.' },
          { title: '6. AGE & CONSENT', text: 'If under 18, a legal guardian must provide consent on your behalf by allowing your continued participation.' }
        ].map((section, i) => (
          <div key={i} className="space-y-2">
            <h3 className="font-bold uppercase text-sm tracking-widest">{section.title}</h3>
            <p className="text-sm text-white/40 leading-relaxed">{section.text}</p>
          </div>
        ))}
      </div>

      <div className="space-y-8">
        <label className="flex items-center gap-4 cursor-pointer group w-fit">
          <div className={`w-6 h-6 rounded border flex items-center justify-center transition-all ${
            agreed ? 'bg-white border-white' : 'border-white/20 group-hover:border-white/40'
          }`}>
            {agreed && <div className="w-2 h-2 bg-black rounded-sm" />}
          </div>
          <input 
            type="checkbox" 
            className="hidden" 
            checked={agreed} 
            onChange={() => setAgreed(!agreed)} 
            disabled={submitting}
          />
          <span className="text-sm font-bold uppercase tracking-widest text-white/60 group-hover:text-white transition-colors">
            I Agree To The Media Release & Terms Of Use
          </span>
        </label>

        <div className="flex gap-4">
          <Button variant="outline" onClick={onBack} className="px-10 uppercase tracking-widest text-xs" disabled={submitting}>Back</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!agreed || submitting}
            className="px-12 uppercase tracking-widest text-xs group disabled:opacity-50"
          >
            {submitting ? 'Saving...' : 'Agree and Continue'} <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
