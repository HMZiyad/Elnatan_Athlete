import React, { useState, useRef } from 'react';
import { Video, Plus, Camera, Play, Globe, Link as LinkIcon, Trash2 } from 'lucide-react';
import { Input } from '../../atoms/Input';
import { Button } from '../../atoms/Button';
import { apiCall, apiUpload } from '../../../utils/api';
import Image from 'next/image';

interface StoryStepProps {
  onBack: () => void;
  onGoLive: () => void;
}

export const StoryStep: React.FC<StoryStepProps> = ({ onBack, onGoLive }) => {
  const [bio, setBio] = useState('');
  const [highlightClipUrl, setHighlightClipUrl] = useState('');
  const [instagram, setInstagram] = useState('');
  const [twitter, setTwitter] = useState('');
  const [youtube, setYoutube] = useState('');
  const [website, setWebsite] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingPhotoIdx, setUploadingPhotoIdx] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const videoInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const activePhotoIdxRef = useRef<number>(0);

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setUploadingVideo(true);
    try {
      const res = await apiUpload(file, 'clip');
      const url = res.url.startsWith('http') ? res.url : `http://localhost:8080${res.url}`;
      setHighlightClipUrl(url);
    } catch (err: any) {
      setError(err.message || 'Failed to upload video');
    } finally {
      setUploadingVideo(false);
    }
  };

  const handlePhotoClick = (index: number) => {
    activePhotoIdxRef.current = index;
    photoInputRef.current?.click();
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const index = activePhotoIdxRef.current;
    setError('');
    setUploadingPhotoIdx(index);

    try {
      // 1. Upload file
      const uploadRes = await apiUpload(file, 'photo');
      const url = uploadRes.url.startsWith('http') ? uploadRes.url : `http://localhost:8080${uploadRes.url}`;

      // 2. Link photo to athlete media profile
      await apiCall('/athletes/me/media', {
        method: 'POST',
        body: JSON.stringify({
          type: 'photo',
          url: url,
        }),
      });

      // Update local state list
      const newPhotos = [...photos];
      newPhotos[index] = url;
      setPhotos(newPhotos);
    } catch (err: any) {
      setError(err.message || 'Failed to upload photo');
    } finally {
      setUploadingPhotoIdx(null);
    }
  };

  const handleSubmit = async () => {
    if (!bio) {
      setError('Bio is required');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      await apiCall('/athletes/me/onboarding/story', {
        method: 'PUT',
        body: JSON.stringify({
          bio: bio,
          highlight_clip_url: highlightClipUrl,
          socials: {
            instagram: instagram,
            twitter_x: twitter,
            youtube: youtube,
            website: website,
          },
        }),
      });
      onGoLive();
    } catch (err: any) {
      setError(err.message || 'Failed to save story. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-16 max-w-4xl">
      <div className="space-y-4">
        <h2 className="text-6xl font-bold tracking-tight uppercase leading-none">Your Story</h2>
        <p className="text-white/40 text-lg">What makes you underrated? Show us, don't just tell us.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-12">
        {/* Bio */}
        <div className="space-y-4">
          <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Your Bio</p>
          <div className="relative">
            <textarea 
              maxLength={240}
              className="w-full bg-dark-400 border border-white/5 rounded-lg p-6 text-sm focus:outline-none focus:border-white/20 focus:bg-dark-300 transition-all text-white min-h-[140px] placeholder:text-white/10"
              placeholder="Two-time national champion. No sponsor. Training out of a community track because my country deserves a sub-22 sprinter."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              disabled={submitting}
            />
            <div className="absolute bottom-4 right-4 text-[10px] text-white/20 font-bold">{bio.length}/240</div>
          </div>
        </div>

        {/* Highlight Clip */}
        <div className="space-y-4">
          <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Highlight Clip</p>
          <div className="border-2 border-dashed border-white/5 rounded-2xl p-12 flex flex-col items-center justify-center text-center bg-dark-400 hover:bg-dark-300 transition-all group relative">
            {uploadingVideo ? (
              <div className="py-8 text-sm font-bold uppercase tracking-wider text-white/60">Uploading highlight clip...</div>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Video className="text-white/40" />
                </div>
                <h3 className="text-xl font-bold mb-2">Highlight clip link or file</h3>
                <p className="text-xs text-white/40 max-w-[280px] leading-relaxed mb-8 font-medium">
                  MP4 or MOV - up to 200MB - or paste a YouTube/Instagram URL
                </p>
                
                <div className="flex gap-3 w-full max-w-md">
                  <input 
                    type="text" 
                    placeholder="Paste URL here..."
                    className="flex-1 bg-black/40 border border-white/5 rounded-lg px-4 py-3 text-xs focus:outline-none focus:border-white/20 text-white"
                    value={highlightClipUrl}
                    onChange={(e) => setHighlightClipUrl(e.target.value)}
                    disabled={submitting}
                  />
                  <button 
                    onClick={() => videoInputRef.current?.click()}
                    type="button"
                    disabled={submitting}
                    className="bg-white text-black text-[10px] font-bold uppercase tracking-widest px-6 py-3 rounded-lg flex items-center gap-2 cursor-pointer hover:bg-white/90"
                  >
                    <Plus size={14} /> Upload File
                  </button>
                </div>
                <input 
                  type="file" 
                  ref={videoInputRef} 
                  onChange={handleVideoUpload} 
                  accept="video/*" 
                  className="hidden" 
                />
              </>
            )}
          </div>
        </div>

        {/* Photos */}
        <div className="space-y-4">
          <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Photos (Up to 6)</p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div 
                key={i} 
                onClick={() => !submitting && handlePhotoClick(i)}
                className="aspect-square rounded-xl bg-dark-400 border border-white/5 flex items-center justify-center cursor-pointer hover:bg-dark-300 transition-all text-white/10 hover:text-white/40 overflow-hidden relative"
              >
                {photos[i] ? (
                  <Image src={photos[i]} alt={`Gallery ${i}`} fill className="object-cover" />
                ) : uploadingPhotoIdx === i ? (
                  <span className="text-[8px] uppercase tracking-wider text-white/40 font-bold">...</span>
                ) : (
                  <Plus size={20} />
                )}
              </div>
            ))}
          </div>
          <input 
            type="file" 
            ref={photoInputRef} 
            onChange={handlePhotoUpload} 
            accept="image/*" 
            className="hidden" 
          />
        </div>

        {/* Socials */}
        <div className="space-y-6">
          <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Socials (Optional)</p>
          <div className="space-y-3">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/20 group-hover:text-white/40 transition-colors">
                <Camera size={18} />
              </div>
              <input 
                type="text"
                className="w-full bg-dark-400 border border-white/5 rounded-lg py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-white/20 focus:bg-dark-300 transition-all text-white placeholder:text-white/10"
                placeholder="Instagram handle"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                disabled={submitting}
              />
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/20 group-hover:text-white/40 transition-colors">
                <Globe size={18} />
              </div>
              <input 
                type="text"
                className="w-full bg-dark-400 border border-white/5 rounded-lg py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-white/20 focus:bg-dark-300 transition-all text-white placeholder:text-white/10"
                placeholder="X handle"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                disabled={submitting}
              />
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/20 group-hover:text-white/40 transition-colors">
                <Play size={18} />
              </div>
              <input 
                type="text"
                className="w-full bg-dark-400 border border-white/5 rounded-lg py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-white/20 focus:bg-dark-300 transition-all text-white placeholder:text-white/10"
                placeholder="YouTube channel"
                value={youtube}
                onChange={(e) => setYoutube(e.target.value)}
                disabled={submitting}
              />
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/20 group-hover:text-white/40 transition-colors">
                <LinkIcon size={18} />
              </div>
              <input 
                type="text"
                className="w-full bg-dark-400 border border-white/5 rounded-lg py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-white/20 focus:bg-dark-300 transition-all text-white placeholder:text-white/10"
                placeholder="Personal Website URL"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                disabled={submitting}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-12">
        <Button variant="outline" onClick={onBack} className="px-10 uppercase tracking-widest text-xs" disabled={submitting}>Back</Button>
        <Button onClick={handleSubmit} className="px-12 uppercase tracking-widest text-xs group" disabled={submitting}>
          {submitting ? 'Saving...' : 'Go Live'} <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
        </Button>
      </div>
    </div>
  );
};
