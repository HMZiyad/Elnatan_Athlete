"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, MapPin, CreditCard, Lock, CheckCircle2 } from 'lucide-react';
import { FanNavbar } from '@/components/organisms/fan/FanNavbar';
import { FanFooter } from '@/components/organisms/fan/FanFooter';
import { apiCall } from '@/utils/api';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { StripePaymentForm } from '@/components/organisms/fan/StripePaymentForm';

// Initialize stripe outside component to avoid recreating it
const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

export default function CheckoutPage() {
  const [cart, setCart] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  
  const [selectedAddress, setSelectedAddress] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('');
  
  const [orderComplete, setOrderComplete] = useState<{order_number: string} | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const handlePaymentMethodAdded = async () => {
    setShowPaymentForm(false);
    try {
      const pmRes = await apiCall<{ data: any[] }>('/users/me/payment-methods');
      const pmList = pmRes.data || [];
      setPaymentMethods(pmList);
      if (pmList.length > 0) {
        setSelectedPayment(pmList[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [cartRes, addressRes, pmRes] = await Promise.all([
          apiCall<{ data: any }>('/cart'),
          apiCall<{ data: any[] }>('/users/me/addresses').catch(() => ({ data: [] })),
          apiCall<{ data: any[] }>('/users/me/payment-methods').catch(() => ({ data: [] }))
        ]);
        
        setCart(cartRes.data);
        
        const addrList = addressRes.data || [];
        setAddresses(addrList);
        if (addrList.length > 0) {
          const defaultAddr = addrList.find(a => a.is_default) || addrList[0];
          setSelectedAddress(defaultAddr.id);
        }

        const pmList = pmRes.data || [];
        setPaymentMethods(pmList);
        if (pmList.length > 0) {
          const defaultPm = pmList.find(pm => pm.is_default) || pmList[0];
          setSelectedPayment(defaultPm.id);
        }
      } catch (err) {
        console.error('Failed to load checkout data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCheckout = async () => {
    if (!selectedAddress) {
      setError('Please select a shipping address');
      return;
    }
    if (!selectedPayment) {
      setError('Please select a payment method');
      return;
    }

    setProcessing(true);
    setError('');
    try {
      const res = await apiCall<{ data: any }>('/orders', {
        method: 'POST',
        body: JSON.stringify({
          address_id: selectedAddress,
          payment_method_id: selectedPayment
        })
      });
      setOrderComplete(res.data);
    } catch (err: any) {
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const cartItems = cart?.items || [];
  const subtotal = cart?.subtotal || 0;
  const shipping = cartItems.length > 0 ? 5.00 : 0;
  const tax = subtotal * 0.085; // 8.5% tax to match backend
  const total = subtotal + shipping + tax;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0A0A0A]">
        <FanNavbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </main>
        <FanFooter />
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0A0A0A]">
        <FanNavbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#121212] border border-white/10 rounded-3xl p-10 text-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} className="text-green-500" />
            </div>
            <h1 className="text-3xl font-bold font-heading uppercase tracking-tight text-white mb-4">Order Confirmed!</h1>
            <p className="text-white/60 mb-8">
              Thank you for your purchase. Your order #{orderComplete.order_number} has been received and is being processed. We'll send you an email with tracking details shortly.
            </p>
            <Link href="/fan/profile?tab=orders" className="block w-full bg-white text-black font-bold py-4 rounded-full hover:bg-white/90 transition-colors mb-4">
              View Order Details
            </Link>
            <Link href="/fan/shop" className="block w-full bg-transparent border border-white/20 text-white font-bold py-4 rounded-full hover:bg-white/5 transition-colors">
              Continue Shopping
            </Link>
          </div>
        </main>
        <FanFooter />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0A0A0A]">
        <FanNavbar />
        <main className="flex-1 flex flex-col items-center justify-center p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Your cart is empty</h2>
          <Link href="/fan/shop" className="bg-primary text-white font-bold px-8 py-3 rounded-full hover:bg-primary/90">
            Continue Shopping
          </Link>
        </main>
        <FanFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A]">
      <FanNavbar />
      
      <main className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-12 xl:px-20 py-12">
        <Link href="/fan/cart" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-8 text-sm font-medium">
          <ChevronLeft size={16} />
          Back to Cart
        </Link>

        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold font-heading uppercase tracking-tight text-white mb-2">Checkout</h1>
          <p className="text-white/60">Complete your order securely</p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl">
            {error}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Checkout Steps */}
          <div className="flex-1 space-y-8">
            
            {/* Step 1: Shipping Address */}
            <section className="bg-[#121212] rounded-3xl p-8 border border-white/5">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">1</span>
                  Shipping Address
                </h2>
                <Link href="/fan/profile/address/add" className="text-primary text-sm font-medium hover:underline">
                  Add New
                </Link>
              </div>

              {addresses.length === 0 ? (
                <div className="text-white/50 py-4">
                  You have no saved addresses. <Link href="/fan/profile/address/add" className="text-primary hover:underline">Add one now</Link>.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map(addr => (
                    <label key={addr.id} className={`relative flex flex-col p-5 rounded-2xl border cursor-pointer transition-all ${
                      selectedAddress === addr.id ? 'border-primary bg-primary/5' : 'border-white/10 hover:border-white/30'
                    }`}>
                      <input 
                        type="radio" 
                        name="address" 
                        className="absolute top-5 right-5 w-5 h-5 accent-primary" 
                        checked={selectedAddress === addr.id}
                        onChange={() => setSelectedAddress(addr.id)}
                      />
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin size={16} className={selectedAddress === addr.id ? 'text-primary' : 'text-white/40'} />
                        <span className="font-bold text-white">{addr.title || 'Address'}</span>
                      </div>
                      <p className="text-sm text-white/70">{addr.address_line_1}</p>
                      {addr.address_line_2 && <p className="text-sm text-white/50 mt-1">{addr.address_line_2}</p>}
                      <p className="text-sm text-white/50 mt-1">{addr.city}, {addr.state} {addr.postal_code}<br/>{addr.country}</p>
                    </label>
                  ))}
                </div>
              )}
            </section>

            {/* Step 2: Payment Method */}
            <section className="bg-[#121212] rounded-3xl p-8 border border-white/5">
              <h2 className="text-xl font-bold text-white flex items-center gap-3 mb-6">
                <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">2</span>
                Payment Method (Stripe)
              </h2>

              <div className="space-y-4">
                {paymentMethods.length === 0 ? (
                  <div className="text-white/50 py-4 text-sm">
                    You have no saved payment methods.
                  </div>
                ) : (
                  paymentMethods.map(pm => (
                    <label key={pm.id} className={`relative flex items-center p-5 rounded-2xl border cursor-pointer transition-all ${
                      selectedPayment === pm.id ? 'border-primary bg-primary/5' : 'border-white/10 hover:border-white/30'
                    }`}>
                      <input 
                        type="radio" 
                        name="payment" 
                        className="w-5 h-5 accent-primary mr-4" 
                        checked={selectedPayment === pm.id}
                        onChange={() => setSelectedPayment(pm.id)}
                      />
                      <div className="flex-1 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-8 bg-white/10 rounded flex items-center justify-center px-1">
                            <CreditCard size={18} className="text-white/70" />
                          </div>
                          <div>
                            <p className="font-bold text-white text-sm capitalize">{pm.brand || 'Card'} ending in {pm.last_four}</p>
                            <p className="text-xs text-white/50">Expires {pm.expires_month}/{pm.expires_year}</p>
                          </div>
                        </div>
                      </div>
                    </label>
                  ))
                )}

                {!stripePromise && (
                  <div className="text-red-400 text-sm p-3 bg-red-400/10 rounded-xl mb-4">
                    Stripe is not configured. Please add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to your environment variables to add a payment method.
                  </div>
                )}

                {showPaymentForm ? (
                  stripePromise ? (
                    <Elements stripe={stripePromise}>
                      <StripePaymentForm 
                        onSuccess={handlePaymentMethodAdded} 
                        onCancel={() => setShowPaymentForm(false)} 
                      />
                    </Elements>
                  ) : null
                ) : (
                  <button 
                    onClick={() => setShowPaymentForm(true)}
                    disabled={!stripePromise}
                    className="w-full py-4 border border-dashed border-white/20 rounded-2xl text-white/60 hover:text-white hover:border-white/50 transition-colors flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50"
                  >
                    <CreditCard size={16} />
                    Add New Payment Method
                  </button>
                )}
              </div>
            </section>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-[400px]">
            <div className="sticky top-24 bg-[#121212] rounded-3xl p-8 border border-white/5">
              <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {cartItems.map((item: any) => (
                  <div key={item.cart_item_id} className="flex gap-4">
                    <div className="relative w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center p-2 flex-shrink-0">
                      <Image 
                        src={item.image_url?.startsWith('http') ? item.image_url : `http://localhost:8080${item.image_url}`} 
                        alt={item.name} 
                        width={64} 
                        height={64} 
                        className="object-contain"
                      />
                      <span className="absolute -top-2 -right-2 w-5 h-5 bg-white text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 text-sm">
                      <h4 className="font-bold text-white leading-tight mb-1">{item.name}</h4>
                      <p className="text-white/50 text-xs mb-1">{item.size} / {item.color}</p>
                      <p className="font-medium text-white">${item.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 mb-6 pb-6 border-b border-white/10 pt-6 border-t border-white/10">
                <div className="flex justify-between text-white/70 text-sm">
                  <span>Subtotal</span>
                  <span className="font-medium text-white">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white/70 text-sm">
                  <span>Shipping</span>
                  <span className="font-medium text-white">${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white/70 text-sm">
                  <span>Estimated Tax (8.5%)</span>
                  <span className="font-medium text-white">${tax.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-8">
                <span className="text-lg text-white font-medium">Total</span>
                <span className="text-2xl font-bold text-white">${total.toFixed(2)}</span>
              </div>

              <button 
                onClick={handleCheckout}
                disabled={processing || !selectedAddress || !selectedPayment}
                className="w-full flex items-center justify-center gap-3 bg-white text-black py-4 rounded-full font-bold hover:bg-white/90 disabled:opacity-50 transition-all group"
              >
                <Lock size={18} />
                {processing ? 'Processing...' : `Pay $${total.toFixed(2)}`}
              </button>
              
              <div className="mt-6 flex flex-col items-center gap-2">
                <p className="text-xs text-white/40 text-center">
                  By completing this order, you agree to our Terms of Service and Privacy Policy. Payments are processed securely by Stripe.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <FanFooter />
    </div>
  );
}
