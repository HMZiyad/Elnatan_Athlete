"use client";

import React, { useState, useEffect, Suspense, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { User, MapPin, Camera, Edit2, Plus, Trash2, Play } from 'lucide-react';
import { DashboardLayout } from '@/components/templates/athlete-view/DashboardLayout';
import { apiCall, apiUpload } from '@/utils/api';

interface AthleteProfileData {
  full_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  username: string;
  location?: string;
  avatar_url?: string | null;
  sport?: string;
  position?: string;
  achievements?: string;
  bio?: string;
  socials?: {
    instagram?: string | null;
    twitter_x?: string | null;
    youtube?: string | null;
    website?: string | null;
  };
  media_gallery?: any[];
}

function ProfileContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('personal');

  // Input states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [sport, setSport] = useState('Track & Field');
  const [position, setPosition] = useState('');
  const [achievements, setAchievements] = useState('');
  const [bio, setBio] = useState('');
  const [instagram, setInstagram] = useState('');
  const [twitter, setTwitter] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [mediaGallery, setMediaGallery] = useState<any[]>([]);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['personal', 'address'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const [addresses, setAddresses] = useState<any[]>([]);

  const fetchAddresses = async () => {
    try {
      const res = await apiCall<{ data: any[] }>('/users/me/addresses');
      setAddresses(res.data || []);
    } catch (err) {
      console.error('Failed to fetch addresses:', err);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await apiCall<{ data: AthleteProfileData }>('/athletes/me/profile');
        const d = res.data;
        setFullName(d.full_name || '');
        setEmail(d.email || '');
        setPhone(d.phone || '');
        setDateOfBirth(d.date_of_birth || '');
        setSport(d.sport || 'Track & Field');
        setPosition(d.position || '');
        setAchievements(d.achievements || '');
        setBio(d.bio || '');
        setInstagram(d.socials?.instagram || '');
        setTwitter(d.socials?.twitter_x || '');
        setAvatarUrl(d.avatar_url || '');
        setMediaGallery(d.media_gallery || []);

        await fetchAddresses();
      } catch (err: any) {
        setError(err.message || 'Failed to load athlete profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSetDefaultAddress = async (id: string) => {
    setError('');
    setSuccessMsg('');
    try {
      await apiCall(`/users/me/addresses/${id}/set-default`, { method: 'PUT' });
      setSuccessMsg('Default address updated!');
      fetchAddresses();
    } catch (err: any) {
      setError(err.message || 'Failed to set default address.');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    setError('');
    setSuccessMsg('');
    try {
      await apiCall(`/users/me/addresses/${id}`, { method: 'DELETE' });
      setSuccessMsg('Address deleted successfully!');
      fetchAddresses();
    } catch (err: any) {
      setError(err.message || 'Failed to delete address.');
    }
  };


  const handleAvatarChangeClick = () => {
    avatarInputRef.current?.click();
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setSaving(true);
    try {
      const uploadRes = await apiUpload(file, 'avatar');
      const url = uploadRes.url.startsWith('http') ? uploadRes.url : `http://localhost:8080${uploadRes.url}`;
      
      // Update identity step with the new profile picture URL (or user avatar URL)
      await apiCall('/athletes/me/onboarding/identity', {
        method: 'PUT',
        body: JSON.stringify({
          full_name: fullName,
          username: email.split('@')[0], // placeholder username or unchanged
          date_of_birth: dateOfBirth || '2000-01-01',
          location: 'USA', // placeholder
          profile_photo_url: url,
        }),
      });

      setAvatarUrl(url);
      setSuccessMsg('Profile picture updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to upload avatar.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddMediaClick = () => {
    mediaInputRef.current?.click();
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setSaving(true);
    try {
      const uploadType = file.type.startsWith('video') ? 'clip' : 'photo';
      const uploadRes = await apiUpload(file, uploadType);
      const url = uploadRes.url.startsWith('http') ? uploadRes.url : `http://localhost:8080${uploadRes.url}`;
      
      const type = file.type.startsWith('video') ? 'video' : 'photo';
      const res = await apiCall<{ data: { id: string } }>('/athletes/me/media', {
        method: 'POST',
        body: JSON.stringify({
          type: type,
          url: url,
        }),
      });

      setMediaGallery([...mediaGallery, {
        id: res.data.id,
        type: type,
        url: url,
      }]);
      setSuccessMsg('Media uploaded successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to upload media.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMedia = async (mediaId: string) => {
    if (!confirm('Are you sure you want to delete this media item?')) return;
    setError('');
    setSaving(true);
    try {
      await apiCall(`/athletes/me/media/${mediaId}`, {
        method: 'DELETE',
      });
      setMediaGallery(mediaGallery.filter(m => m.id !== mediaId));
      setSuccessMsg('Media deleted successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to delete media.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveChanges = async () => {
    setError('');
    setSuccessMsg('');
    setSaving(true);
    try {
      // 1. Update Profile details
      await apiCall('/athletes/me/profile', {
        method: 'PUT',
        body: JSON.stringify({
          full_name: fullName,
          email: email,
          phone: phone,
          date_of_birth: dateOfBirth,
          sport: sport,
          position: position,
          achievements: achievements,
          bio: bio,
          socials: {
            instagram: instagram || null,
            twitter_x: twitter || null,
            youtube: null,
            website: null,
          },
        }),
      });

      // 2. Change password if fields are supplied
      if (currentPassword || newPassword || confirmPassword) {
        if (!currentPassword || !newPassword || !confirmPassword) {
          setError('Please fill in all password fields to update your password');
          setSaving(false);
          return;
        }
        if (newPassword !== confirmPassword) {
          setError('New passwords do not match');
          setSaving(false);
          return;
        }
        await apiCall('/athletes/me/password', {
          method: 'PUT',
          body: JSON.stringify({
            current_password: currentPassword,
            new_password: newPassword,
            confirm_password: confirmPassword,
          }),
        });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }

      setSuccessMsg('Changes saved successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'personal', label: 'Profile Settings', icon: <User size={18} /> },
    { id: 'address', label: 'Address Book', icon: <MapPin size={18} /> },
  ];

  if (loading) {
    return (
      <div className="py-20 text-center text-white/40 uppercase tracking-widest text-xs">
        Loading profile settings...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8">
      {/* Hidden file inputs */}
      <input type="file" ref={avatarInputRef} accept="image/*" className="hidden" onChange={handleAvatarUpload} />
      <input type="file" ref={mediaInputRef} accept="image/*,video/*" className="hidden" onChange={handleMediaUpload} />

      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 flex-shrink-0 space-y-2">
        <nav className="bg-[#121212] rounded-3xl p-3 border border-white/5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-sm font-medium transition-all cursor-pointer ${
                activeTab === tab.id 
                  ? 'bg-white/10 text-white font-bold' 
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 bg-[#121212] rounded-3xl p-6 md:p-10 border border-white/5">
        
        {/* Tab 1: Profile Settings */}
        {activeTab === 'personal' && (
          <div className="space-y-12 animate-in fade-in duration-300">
            <div>
              <h2 className="text-2xl font-bold font-heading uppercase tracking-tight text-white mb-2">Profile Settings</h2>
              <p className="text-sm text-white/50">Manage your identity, sport details, and story.</p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs px-4 py-3 rounded-lg">
                {successMsg}
              </div>
            )}

            {/* Profile Picture */}
            <div className="flex items-center gap-6 pb-8 border-b border-white/5">
              <div className="relative w-24 h-24 group shrink-0">
                <div className="w-full h-full rounded-full overflow-hidden border-2 border-white/10 relative">
                  <Image 
                    src={avatarUrl || "/assets/athlete_mma.png"} 
                    alt={fullName} 
                    fill
                    className="object-cover"
                  />
                </div>
                <button 
                  onClick={handleAvatarChangeClick} 
                  disabled={saving}
                  className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg hover:scale-110 transition-transform cursor-pointer"
                >
                  <Camera size={14} />
                </button>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Profile Picture</h3>
                <p className="text-xs text-white/50 mb-3">Upload a high-quality photo representing your brand.</p>
                <button 
                  onClick={handleAvatarChangeClick}
                  disabled={saving}
                  className="text-xs font-bold text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-colors cursor-pointer"
                >
                  Change Photo
                </button>
              </div>
            </div>

            {/* Identity Details */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white border-b border-white/5 pb-2">Identity</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Full Name</label>
                  <input 
                    type="text" 
                    value={fullName} 
                    onChange={(e) => setFullName(e.target.value)} 
                    disabled={saving}
                    className="w-full bg-dark-400 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Email Address</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    disabled={saving}
                    className="w-full bg-dark-400 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Phone Number</label>
                  <input 
                    type="tel" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    disabled={saving}
                    className="w-full bg-dark-400 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Date of Birth</label>
                  <input 
                    type="date" 
                    value={dateOfBirth} 
                    onChange={(e) => setDateOfBirth(e.target.value)} 
                    disabled={saving}
                    className="w-full bg-dark-400 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 [color-scheme:dark]" 
                  />
                </div>
              </div>
            </div>

            {/* Sport Details */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white border-b border-white/5 pb-2">Sport Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Primary Sport</label>
                  <select 
                    value={sport} 
                    onChange={(e) => setSport(e.target.value)} 
                    disabled={saving}
                    className="w-full bg-dark-400 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 appearance-none"
                  >
                    <option value="Basketball">Basketball</option>
                    <option value="Football">American Football</option>
                    <option value="Soccer">Soccer</option>
                    <option value="Track & Field">Track & Field</option>
                    <option value="MMA">Mixed Martial Arts</option>
                    <option value="Hockey">Hockey</option>
                    <option value="Baseball">Baseball</option>
                    <option value="Climbing">Climbing</option>
                    <option value="Skateboarding">Skateboarding</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Position / Weight Class</label>
                  <input 
                    type="text" 
                    value={position} 
                    onChange={(e) => setPosition(e.target.value)} 
                    disabled={saving}
                    className="w-full bg-dark-400 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30" 
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Key Achievements (Comma separated)</label>
                  <input 
                    type="text" 
                    value={achievements} 
                    onChange={(e) => setAchievements(e.target.value)} 
                    disabled={saving}
                    className="w-full bg-dark-400 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30" 
                  />
                </div>
              </div>
            </div>

            {/* Story Details */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white border-b border-white/5 pb-2">Your Story</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Biography</label>
                  <textarea 
                    rows={4} 
                    value={bio} 
                    onChange={(e) => setBio(e.target.value)} 
                    disabled={saving}
                    className="w-full bg-dark-400 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 resize-none"
                  ></textarea>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Instagram Link</label>
                  <input 
                    type="url" 
                    value={instagram} 
                    onChange={(e) => setInstagram(e.target.value)} 
                    disabled={saving}
                    className="w-full bg-dark-400 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Twitter / X Link</label>
                  <input 
                    type="url" 
                    value={twitter} 
                    onChange={(e) => setTwitter(e.target.value)} 
                    disabled={saving}
                    className="w-full bg-dark-400 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30" 
                  />
                </div>
              </div>
            </div>

            {/* Media Gallery */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <h3 className="text-lg font-bold text-white">Media Gallery</h3>
                <button 
                  onClick={handleAddMediaClick}
                  disabled={saving}
                  className="text-xs font-bold text-black bg-white hover:bg-white/90 px-4 py-2 rounded-full transition-colors flex items-center gap-2 shadow-lg shadow-white/5 cursor-pointer"
                >
                  <Plus size={14} /> Add Media
                </button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                 {mediaGallery.map((media) => (
                   <div key={media.id} className="relative aspect-video bg-dark-400 rounded-xl overflow-hidden group">
                     {media.type === 'video' ? (
                       <div className="w-full h-full relative bg-dark-200 flex items-center justify-center">
                         <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                           <Play size={16} className="text-white fill-white ml-1" />
                         </div>
                       </div>
                     ) : (
                       <Image src={media.url} alt="Gallery Image" fill className="object-cover" />
                     )}
                     <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                       <button 
                         onClick={() => handleDeleteMedia(media.id)}
                         disabled={saving}
                         className="p-2 bg-red-500/20 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-colors cursor-pointer" 
                         title="Delete"
                       >
                         <Trash2 size={16} />
                       </button>
                     </div>
                   </div>
                 ))}
                 {mediaGallery.length === 0 && (
                   <div className="col-span-full py-10 text-center text-xs text-white/30 uppercase tracking-widest font-bold">
                     No media uploaded yet
                   </div>
                 )}
              </div>
            </div>

            <div className="pt-6 border-t border-white/5">
              <h3 className="text-lg font-bold text-white mb-4">Change Password</h3>
              <div className="space-y-4 max-w-md">
                <input 
                  type="password" 
                  placeholder="Current Password" 
                  value={currentPassword} 
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={saving}
                  className="w-full bg-dark-400 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30" 
                />
                <input 
                  type="password" 
                  placeholder="New Password" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={saving}
                  className="w-full bg-dark-400 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30" 
                />
                <input 
                  type="password" 
                  placeholder="Confirm New Password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={saving}
                  className="w-full bg-dark-400 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30" 
                />
              </div>
            </div>

            <button 
              onClick={handleSaveChanges}
              disabled={saving}
              className="w-full md:w-auto bg-white text-black font-bold px-8 py-4 rounded-full hover:bg-white/90 transition-all shadow-xl shadow-white/5 cursor-pointer font-heading tracking-wide uppercase text-sm"
            >
              {saving ? 'Saving Changes...' : 'Save All Changes'}
            </button>
          </div>
        )}

        {/* Tab 2: Address Book */}
        {activeTab === 'address' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold font-heading uppercase tracking-tight text-white mb-2">Address Book</h2>
                <p className="text-sm text-white/50">Manage your shipping and billing addresses.</p>
              </div>
              <Link href="/athlete/profile/address/add" className="inline-flex items-center justify-center gap-2 bg-white text-black font-bold px-6 py-3 rounded-full hover:bg-white/90 transition-all text-sm">
                <Plus size={18} />
                Add New
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {addresses.map((addr) => (
                <div key={addr.id} className={`relative p-6 rounded-2xl border ${addr.is_default ? 'border-primary bg-primary/5' : 'border-white/10 bg-dark-400'}`}>
                  {addr.is_default && (
                    <span className="absolute top-4 right-4 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Default</span>
                  )}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${addr.is_default ? 'bg-primary/20 text-primary' : 'bg-white/5 text-white/50'}`}>
                      <MapPin size={20} />
                    </div>
                    <span className="font-bold text-white text-lg">{addr.label}</span>
                  </div>
                  <p className="text-white/80 font-medium mb-1">{addr.full_name}</p>
                  <p className="text-sm text-white/50 leading-relaxed">
                    {addr.street}<br/>
                    {addr.city}, {addr.state} {addr.zip}<br/>
                    {addr.country}
                  </p>
                  {addr.phone && <p className="text-sm text-white/50 mt-2">{addr.phone}</p>}
                  
                  <div className="flex items-center gap-4 mt-6 pt-6 border-t border-white/10">
                    <Link href={`/athlete/profile/address/edit?id=${addr.id}`} className="text-sm font-bold text-white flex items-center gap-2 hover:text-primary transition-colors">
                      <Edit2 size={14} /> Edit
                    </Link>
                    {!addr.is_default && (
                      <button 
                        onClick={() => handleSetDefaultAddress(addr.id)}
                        className="text-sm font-bold text-white/60 hover:text-primary transition-colors cursor-pointer"
                      >
                        Set Default
                      </button>
                    )}
                    <button 
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="text-sm font-bold text-white/40 hover:text-red-500 transition-colors ml-auto cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              {addresses.length === 0 && (
                <div className="col-span-2 py-10 text-center text-xs text-white/30 uppercase tracking-widest font-bold">
                  No addresses saved yet.
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function AthleteProfilePage() {
  return (
    <DashboardLayout>
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold font-heading uppercase tracking-tight text-white mb-2">Settings</h1>
        <p className="text-white/60">Update your athlete profile and preferences.</p>
      </div>

      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }>
        <ProfileContent />
      </Suspense>
    </DashboardLayout>
  );
}
