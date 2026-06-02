"use client";

import React, { useState, useRef } from 'react';
import { Camera, MapPin, Calendar } from 'lucide-react';
import { Input } from '../../atoms/Input';
import { Button } from '../../atoms/Button';
import { apiCall, apiUpload } from '../../../utils/api';
import Image from 'next/image';

interface IdentityStepProps {
  onContinue: () => void;
}

export const IdentityStep: React.FC<IdentityStepProps> = ({ onContinue }) => {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [location, setLocation] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setUploading(true);
    try {
      const res = await apiUpload(file, 'avatar');
      // Backend returns relative URL or full URL, let's normalize it to serve from local server
      const url = res.url.startsWith('http') ? res.url : `http://localhost:8080${res.url}`;
      setAvatarUrl(url);
    } catch (err: any) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!fullName || !username || !dateOfBirth || !location) {
      setError('Please fill in all required fields');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      await apiCall('/athletes/me/onboarding/identity', {
        method: 'PUT',
        body: JSON.stringify({
          full_name: fullName,
          username: username,
          date_of_birth: dateOfBirth, // date in YYYY-MM-DD
          location: location,
          profile_photo_url: avatarUrl || undefined,
        }),
      });
      onContinue();
    } catch (err: any) {
      setError(err.message || 'Failed to save identity. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-20 items-start">
      {/* Form Area */}
      <div className="flex-1 space-y-12">
        <div className="space-y-4">
          <h2 className="text-6xl font-bold tracking-tight uppercase leading-none">Who are you?</h2>
          <p className="text-white/40 text-lg">The basics fans will see on your card.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-8">
          {/* Profile Photo Upload */}
          <div className="glass-card border-white/5 p-8 flex items-center gap-8">
            <div 
              onClick={handleUploadClick}
              className="w-24 h-24 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:border-white/40 transition-all overflow-hidden relative bg-dark-300"
            >
              {avatarUrl ? (
                <Image src={avatarUrl} alt="Preview" fill className="object-cover" />
              ) : (
                <Camera className="text-white/20" />
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-[10px] text-white font-bold uppercase tracking-wider">
                  Uploading...
                </div>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
            <div>
              <h3 className="font-bold text-lg mb-1">Profile photo</h3>
              <p className="text-xs text-white/40 uppercase tracking-widest font-bold">JPG or PNG, 600x600 or larger.</p>
            </div>
          </div>

          {/* Basic Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
              label="Full Name" 
              placeholder="Maya Reyes" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={submitting}
            />
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">User Name</p>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/20 text-sm">
                  uag.com/@
                </div>
                <input 
                  type="text"
                  className="w-full bg-dark-400 border border-white/5 rounded-lg py-4 pl-24 pr-4 text-sm focus:outline-none focus:border-white/20 focus:bg-dark-300 transition-all text-white placeholder:text-white/10"
                  placeholder="mayareyes"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={submitting}
                />
              </div>
            </div>
            <Input 
              label="Date of Birth" 
              type="date"
              placeholder="yyyy-mm-dd" 
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              disabled={submitting}
            />
            <Input 
              label="Location" 
              placeholder="Lagos, Nigeria" 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={submitting}
            />
          </div>
        </div>

        <div className="flex gap-4 pt-12">
          <Button variant="outline" className="px-10 uppercase tracking-widest text-xs" disabled={submitting}>Back</Button>
          <Button onClick={handleSubmit} className="px-12 uppercase tracking-widest text-xs group" disabled={submitting}>
            {submitting ? 'Saving...' : 'Continue'} <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
          </Button>
        </div>
      </div>

      {/* Preview Sidebar */}
      <div className="w-full lg:w-80 sticky top-32">
        <div className="glass-card border-white/5 overflow-hidden">
          <div className="aspect-[3/4] relative bg-dark-400">
            {avatarUrl ? (
              <Image src={avatarUrl} alt="Preview" fill className="object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-white/5">
                <Camera size={64} />
              </div>
            )}
            
            {/* Overlay Info */}
            <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black to-transparent pt-20 text-center z-10">
              <div className="w-20 h-20 rounded-full border-4 border-black mx-auto mb-4 overflow-hidden bg-dark-300 relative">
                <Image src={avatarUrl || "/assets/athelete_auth.png"} alt="Profile" fill className="object-cover" />
              </div>
              <h3 className="text-xl font-bold tracking-tight uppercase mb-1 truncate">{fullName || "Your Name"}</h3>
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-4 truncate">
                @{username || "yourhandle"} • {location || "Lagos, NG"}
              </p>
              
              <div className="bg-orange-500/10 text-orange-500 text-[8px] uppercase tracking-widest font-black px-3 py-1 rounded-full w-fit mx-auto border border-orange-500/20 mb-6">
                🏆 Rookie
              </div>

              <div className="grid grid-cols-3 border-t border-white/5 pt-6 gap-2">
                <div>
                  <p className="text-[8px] uppercase tracking-widest text-white/20 font-black mb-1">Rank</p>
                  <p className="text-sm font-bold">--</p>
                </div>
                <div>
                  <p className="text-[8px] uppercase tracking-widest text-white/20 font-black mb-1">XP</p>
                  <p className="text-sm font-bold">--</p>
                </div>
                <div>
                  <p className="text-[8px] uppercase tracking-widest text-white/20 font-black mb-1">Level</p>
                  <p className="text-sm font-bold">--</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
