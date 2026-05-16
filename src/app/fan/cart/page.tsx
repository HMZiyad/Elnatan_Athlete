import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import { FanNavbar } from '@/components/organisms/fan/FanNavbar';
import { FanFooter } from '@/components/organisms/fan/FanFooter';

export default function CartPage() {
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
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A]">
      <FanNavbar />
      
      <main className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-12 xl:px-20 py-12">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold font-heading uppercase tracking-tight text-white mb-2">Your Cart</h1>
          <p className="text-white/60">Review your items before proceeding to checkout</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Cart Items List */}
          <div className="flex-1 space-y-6">
            {cartItems.map((item) => (
              <div key={item.id} className="flex gap-6 p-6 rounded-2xl bg-[#121212] border border-white/5">
                {/* Product Image */}
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl bg-white/5 flex items-center justify-center p-4">
                  <Image 
                    src={item.image} 
                    alt={item.name} 
                    width={100} 
                    height={100} 
                    className="object-contain w-full h-full"
                  />
                </div>

                {/* Product Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">{item.name}</h3>
                      <p className="text-sm text-white/50 mb-1">Size: {item.size} • Color: {item.color}</p>
                    </div>
                    <p className="text-lg font-bold text-white">${item.price.toFixed(2)}</p>
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center gap-4 bg-black/40 rounded-full px-4 py-2 border border-white/10">
                      <button className="text-white/50 hover:text-white transition-colors">
                        <Minus size={16} />
                      </button>
                      <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                      <button className="text-white/50 hover:text-white transition-colors">
                        <Plus size={16} />
                      </button>
                    </div>
                    
                    <button className="text-white/40 hover:text-red-500 transition-colors flex items-center gap-2 text-sm font-medium">
                      <Trash2 size={16} />
                      <span className="hidden sm:inline">Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-[400px]">
            <div className="sticky top-24 bg-[#121212] rounded-3xl p-8 border border-white/5">
              <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6 pb-6 border-b border-white/10">
                <div className="flex justify-between text-white/70">
                  <span>Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Shipping</span>
                  <span className="font-medium">${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Tax</span>
                  <span className="font-medium">Calculated at checkout</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-8">
                <span className="text-lg text-white font-medium">Total</span>
                <span className="text-2xl font-bold text-white">${total.toFixed(2)}</span>
              </div>

              <Link 
                href="/fan/checkout" 
                className="w-full flex items-center justify-center gap-3 bg-white text-black py-4 rounded-full font-bold hover:bg-white/90 transition-all group"
              >
                Proceed to Checkout
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-white/40">
                <span>Secure Checkout</span>
                <span>•</span>
                <span>Free returns within 30 days</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <FanFooter />
    </div>
  );
}
