"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, MapPin, CreditCard, Lock, CheckCircle2 } from 'lucide-react';
import { FanNavbar } from '@/components/organisms/fan/FanNavbar';
import { FanFooter } from '@/components/organisms/fan/FanFooter';

export default function CheckoutPage() {
  const [selectedAddress, setSelectedAddress] = useState('home');
  const [selectedPayment, setSelectedPayment] = useState('card1');
  const [orderComplete, setOrderComplete] = useState(false);

  const cartItems = [
    {
      id: 1,
      name: "Pro Performance T-Shirt",
      size: "L",
      color: "Black",
      price: 45.00,
      quantity: 1,
      image: "/assets/product_sweatshirt.png"
    },
    {
      id: 2,
      name: "Elite Training Shorts",
      size: "M",
      color: "Navy",
      price: 35.00,
      quantity: 1,
      image: "/assets/product_vest.png"
    }
  ];

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 5.00;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

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
              Thank you for your purchase. Your order #ORD-84392 has been received and is being processed. We'll send you an email with tracking details shortly.
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className={`relative flex flex-col p-5 rounded-2xl border cursor-pointer transition-all ${
                  selectedAddress === 'home' ? 'border-primary bg-primary/5' : 'border-white/10 hover:border-white/30'
                }`}>
                  <input 
                    type="radio" 
                    name="address" 
                    className="absolute top-5 right-5 w-5 h-5 accent-primary" 
                    checked={selectedAddress === 'home'}
                    onChange={() => setSelectedAddress('home')}
                  />
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin size={16} className="text-primary" />
                    <span className="font-bold text-white">Home</span>
                  </div>
                  <p className="text-sm text-white/70">Jon Kabir</p>
                  <p className="text-sm text-white/50 mt-1">123 Athlete Way, Apt 4B<br/>New York, NY 10001<br/>United States</p>
                  <Link href="/fan/profile/address/edit" className="text-xs text-white/40 hover:text-white mt-4 inline-block">Edit</Link>
                </label>

                <label className={`relative flex flex-col p-5 rounded-2xl border cursor-pointer transition-all ${
                  selectedAddress === 'gym' ? 'border-primary bg-primary/5' : 'border-white/10 hover:border-white/30'
                }`}>
                  <input 
                    type="radio" 
                    name="address" 
                    className="absolute top-5 right-5 w-5 h-5 accent-primary" 
                    checked={selectedAddress === 'gym'}
                    onChange={() => setSelectedAddress('gym')}
                  />
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin size={16} className={selectedAddress === 'gym' ? 'text-primary' : 'text-white/40'} />
                    <span className="font-bold text-white">Gym</span>
                  </div>
                  <p className="text-sm text-white/70">Jon Kabir</p>
                  <p className="text-sm text-white/50 mt-1">456 Training Center Blvd<br/>Brooklyn, NY 11201<br/>United States</p>
                  <Link href="/fan/profile/address/edit" className="text-xs text-white/40 hover:text-white mt-4 inline-block">Edit</Link>
                </label>
              </div>
            </section>

            {/* Step 2: Payment Method */}
            <section className="bg-[#121212] rounded-3xl p-8 border border-white/5">
              <h2 className="text-xl font-bold text-white flex items-center gap-3 mb-6">
                <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">2</span>
                Payment Method
              </h2>

              <div className="space-y-4">
                <label className={`relative flex items-center p-5 rounded-2xl border cursor-pointer transition-all ${
                  selectedPayment === 'card1' ? 'border-primary bg-primary/5' : 'border-white/10 hover:border-white/30'
                }`}>
                  <input 
                    type="radio" 
                    name="payment" 
                    className="w-5 h-5 accent-primary mr-4" 
                    checked={selectedPayment === 'card1'}
                    onChange={() => setSelectedPayment('card1')}
                  />
                  <div className="flex-1 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-8 bg-white rounded flex items-center justify-center px-1">
                        <span className="text-blue-600 font-bold italic text-xs">VISA</span>
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">Visa ending in 4242</p>
                        <p className="text-xs text-white/50">Expires 12/26</p>
                      </div>
                    </div>
                  </div>
                </label>

                <label className={`relative flex items-center p-5 rounded-2xl border cursor-pointer transition-all ${
                  selectedPayment === 'card2' ? 'border-primary bg-primary/5' : 'border-white/10 hover:border-white/30'
                }`}>
                  <input 
                    type="radio" 
                    name="payment" 
                    className="w-5 h-5 accent-primary mr-4" 
                    checked={selectedPayment === 'card2'}
                    onChange={() => setSelectedPayment('card2')}
                  />
                  <div className="flex-1 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-8 bg-[#FF5F00] rounded flex items-center justify-center px-1">
                        <div className="flex">
                           <div className="w-4 h-4 bg-red-600 rounded-full"></div>
                           <div className="w-4 h-4 bg-yellow-400 rounded-full -ml-2 mix-blend-multiply"></div>
                        </div>
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">Mastercard ending in 8899</p>
                        <p className="text-xs text-white/50">Expires 08/28</p>
                      </div>
                    </div>
                  </div>
                </label>

                <button className="w-full py-4 border border-dashed border-white/20 rounded-2xl text-white/60 hover:text-white hover:border-white/50 transition-colors flex items-center justify-center gap-2 text-sm font-medium">
                  <CreditCard size={16} />
                  Add New Payment Method
                </button>
              </div>
            </section>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-[400px]">
            <div className="sticky top-24 bg-[#121212] rounded-3xl p-8 border border-white/5">
              <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center p-2 flex-shrink-0">
                      <Image 
                        src={item.image} 
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
                  <span>Estimated Tax</span>
                  <span className="font-medium text-white">${tax.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-8">
                <span className="text-lg text-white font-medium">Total</span>
                <span className="text-2xl font-bold text-white">${total.toFixed(2)}</span>
              </div>

              <button 
                onClick={() => setOrderComplete(true)}
                className="w-full flex items-center justify-center gap-3 bg-white text-black py-4 rounded-full font-bold hover:bg-white/90 transition-all group"
              >
                <Lock size={18} />
                Pay ${total.toFixed(2)}
              </button>
              
              <div className="mt-6 flex flex-col items-center gap-2">
                <p className="text-xs text-white/40 text-center">
                  By completing this order, you agree to our Terms of Service and Privacy Policy.
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
