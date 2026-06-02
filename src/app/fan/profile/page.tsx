"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { User, Package, MapPin, CreditCard, LogOut, Camera, Edit2, Plus, ArrowRight } from 'lucide-react';
import { FanNavbar } from '@/components/organisms/fan/FanNavbar';
import { FanFooter } from '@/components/organisms/fan/FanFooter';
import { apiCall } from '@/utils/api';

interface FanProfileData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  avatar_url?: string | null;
  member_since?: string;
}

function ProfileContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('personal');

  // Input states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [memberSince, setMemberSince] = useState('2026');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    localStorage.removeItem('uag_token');
    router.push('/login');
  };

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['personal', 'orders', 'address', 'payment'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const [addresses, setAddresses] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  const fetchAddresses = async () => {
    try {
      const res = await apiCall<{ data: any[] }>('/users/me/addresses');
      setAddresses(res.data || []);
    } catch (err) {
      console.error('Failed to fetch addresses:', err);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const res = await apiCall<{ data: any[] }>('/users/me/payment-methods');
      setPaymentMethods(res.data || []);
    } catch (err) {
      console.error('Failed to fetch payment methods:', err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await apiCall<{ data: any[] }>('/fans/me/orders');
      setOrders(res.data || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await apiCall<{ data: FanProfileData }>('/fans/me/profile');
        setFirstName(res.data.first_name || '');
        setLastName(res.data.last_name || '');
        setEmail(res.data.email || '');
        setPhone(res.data.phone || '');
        setMemberSince(res.data.member_since || '2026');
        setAvatarUrl(res.data.avatar_url || '');

        await Promise.all([
          fetchAddresses(),
          fetchPaymentMethods(),
          fetchOrders()
        ]);
      } catch (err: any) {
        setError(err.message || 'Failed to load profile.');
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

  const handleSetDefaultPaymentMethod = async (id: string) => {
    setError('');
    setSuccessMsg('');
    try {
      await apiCall(`/users/me/payment-methods/${id}/set-default`, { method: 'PUT' });
      setSuccessMsg('Default payment method updated!');
      fetchPaymentMethods();
    } catch (err: any) {
      setError(err.message || 'Failed to set default payment method.');
    }
  };

  const handleDeletePaymentMethod = async (id: string) => {
    if (!confirm('Are you sure you want to delete this payment method?')) return;
    setError('');
    setSuccessMsg('');
    try {
      await apiCall(`/users/me/payment-methods/${id}`, { method: 'DELETE' });
      setSuccessMsg('Payment method deleted successfully!');
      fetchPaymentMethods();
    } catch (err: any) {
      setError(err.message || 'Failed to delete payment method.');
    }
  };

  const handleAddPaymentMethod = async () => {
    const stripePM = prompt('Enter Stripe Payment Method ID (e.g. pm_card_visa or any Stripe PM token):');
    if (!stripePM) return;
    setError('');
    setSuccessMsg('');
    setSaving(true);
    try {
      await apiCall('/users/me/payment-methods', {
        method: 'POST',
        body: JSON.stringify({ stripe_payment_method_id: stripePM }),
      });
      setSuccessMsg('Payment method added successfully!');
      fetchPaymentMethods();
    } catch (err: any) {
      setError(err.message || 'Failed to add payment method.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveChanges = async () => {
    setError('');
    setSuccessMsg('');
    setSaving(true);
    try {
      // 1. Update Profile Information
      await apiCall('/fans/me/profile', {
        method: 'PUT',
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          phone,
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
        await apiCall('/fans/me/password', {
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
    { id: 'personal', label: 'Personal Info', icon: <User size={18} /> },
    { id: 'orders', label: 'My Orders', icon: <Package size={18} /> },
    { id: 'address', label: 'Address Book', icon: <MapPin size={18} /> },
    { id: 'payment', label: 'Payment Methods', icon: <CreditCard size={18} /> },
  ];

  if (loading) {
    return (
      <div className="py-20 text-center text-white/40 uppercase tracking-widest text-xs">
        Loading profile data...
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 lg:gap-12 animate-in fade-in duration-300">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 flex-shrink-0 space-y-2">
        {/* User Card */}
        <div className="bg-[#121212] rounded-3xl p-6 border border-white/5 mb-6 text-center">
          <div className="relative w-24 h-24 mx-auto mb-4 group">
            <div className="w-full h-full rounded-full overflow-hidden border-2 border-white/10 relative">
              <Image 
                src={avatarUrl || "/assets/athelete_auth.png"} 
                alt={`${firstName} ${lastName}`} 
                fill
                className="object-cover"
              />
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full hover:scale-110 transition-transform cursor-pointer">
              <Camera size={14} />
            </button>
          </div>
          <h2 className="text-lg font-bold text-white mb-1">{firstName} {lastName}</h2>
          <p className="text-xs text-white/50">Member since {memberSince}</p>
        </div>

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
          <div className="my-2 border-t border-white/5"></div>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-sm font-medium text-red-500 hover:bg-red-500/10 transition-all cursor-pointer">
            <LogOut size={18} />
            Log out
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 bg-[#121212] rounded-3xl p-6 md:p-10 border border-white/5">
        
        {/* Tab 1: Personal Info */}
        {activeTab === 'personal' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div>
              <h2 className="text-2xl font-bold font-heading uppercase tracking-tight text-white mb-2">Personal Info</h2>
              <p className="text-sm text-white/50">Manage your basic account details.</p>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest">First Name</label>
                <input 
                  type="text" 
                  value={firstName} 
                  onChange={(e) => setFirstName(e.target.value)} 
                  disabled={saving}
                  className="w-full bg-dark-400 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Last Name</label>
                <input 
                  type="text" 
                  value={lastName} 
                  onChange={(e) => setLastName(e.target.value)} 
                  disabled={saving}
                  className="w-full bg-dark-400 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Email</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  disabled={saving}
                  className="w-full bg-dark-400 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Phone</label>
                <input 
                  type="tel" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  disabled={saving}
                  className="w-full bg-dark-400 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30" 
                />
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
              className="bg-white text-black font-bold px-8 py-3 rounded-full hover:bg-white/90 transition-all disabled:opacity-50 cursor-pointer font-heading tracking-wide uppercase text-sm"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}

        {/* Tab 2: Orders */}
        {activeTab === 'orders' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div>
              <h2 className="text-2xl font-bold font-heading uppercase tracking-tight text-white mb-2">My Orders</h2>
              <p className="text-sm text-white/50">View and track your previous orders.</p>
            </div>

            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="bg-dark-400 rounded-2xl p-6 border border-white/5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/5">
                    <div>
                      <p className="text-sm font-bold text-white mb-1">Order #{order.order_number}</p>
                      <p className="text-xs text-white/50">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                        order.status === 'processing' ? 'bg-green-500/10 text-green-500' : 'bg-white/10 text-white/70'
                      }`}>
                        {order.status}
                      </span>
                      <p className="font-bold text-white">${order.total.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-xl bg-[#121212] border border-white/10 flex items-center justify-center p-2">
                      <Package size={32} className="text-white/40" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white/70">Subtotal: ${order.subtotal.toFixed(2)} | Shipping: ${order.shipping.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
              {orders.length === 0 && (
                <div className="py-10 text-center text-xs text-white/30 uppercase tracking-widest font-bold">
                  No orders found.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Address Book */}
        {activeTab === 'address' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold font-heading uppercase tracking-tight text-white mb-2">Address Book</h2>
                <p className="text-sm text-white/50">Manage your shipping and billing addresses.</p>
              </div>
              <Link href="/fan/profile/address/add" className="inline-flex items-center justify-center gap-2 bg-white text-black font-bold px-6 py-3 rounded-full hover:bg-white/90 transition-all text-sm">
                <Plus size={18} />
                Add New
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <Link href={`/fan/profile/address/edit?id=${addr.id}`} className="text-sm font-bold text-white flex items-center gap-2 hover:text-primary transition-colors">
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

        {/* Tab 4: Payment Methods */}
        {activeTab === 'payment' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold font-heading uppercase tracking-tight text-white mb-2">Payment Methods</h2>
                <p className="text-sm text-white/50">Manage your saved cards and payment options.</p>
              </div>
              <button 
                onClick={handleAddPaymentMethod}
                className="inline-flex items-center justify-center gap-2 bg-white text-black font-bold px-6 py-3 rounded-full hover:bg-white/90 transition-all text-sm cursor-pointer"
              >
                <Plus size={18} />
                Add New Card
              </button>
            </div>

            <div className="space-y-4 max-w-2xl">
              {paymentMethods.map((pm) => (
                <div key={pm.id} className={`flex items-center justify-between p-6 rounded-2xl border ${pm.is_default ? 'border-primary bg-primary/5' : 'border-white/10 bg-dark-400'}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-10 bg-white rounded-md flex items-center justify-center">
                      <span className="text-blue-600 font-bold italic text-lg uppercase">{pm.brand}</span>
                    </div>
                    <div>
                      <p className="font-bold text-white flex items-center gap-2">
                        {pm.brand.toUpperCase()} ending in {pm.last_four}
                        {pm.is_default && (
                          <span className="bg-primary text-white text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full">Default</span>
                        )}
                      </p>
                      <p className="text-sm text-white/50">Expires {pm.expires_month}/{pm.expires_year}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {!pm.is_default && (
                      <button 
                        onClick={() => handleSetDefaultPaymentMethod(pm.id)}
                        className="text-sm text-white/40 hover:text-white transition-colors cursor-pointer"
                      >
                        Set Default
                      </button>
                    )}
                    <span className="text-white/20">|</span>
                    <button 
                      onClick={() => handleDeletePaymentMethod(pm.id)}
                      className="text-sm text-red-500/70 hover:text-red-500 transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              {paymentMethods.length === 0 && (
                <div className="py-10 text-center text-xs text-white/30 uppercase tracking-widest font-bold">
                  No payment methods saved. Click 'Add New Card' to add a Stripe card.
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A]">
      <FanNavbar />
      
      <main className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-12 xl:px-20 py-12">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        }>
          <ProfileContent />
        </Suspense>
      </main>

      <FanFooter />
    </div>
  );
}
