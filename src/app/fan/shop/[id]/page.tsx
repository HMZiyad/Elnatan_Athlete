"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Minus, Plus, ThumbsUp, ThumbsDown, ChevronDown, ShoppingCart } from 'lucide-react';
import { FanNavbar } from '@/components/organisms/fan/FanNavbar';
import { FanFooter } from '@/components/organisms/fan/FanFooter';

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const colors = [
  { id: 'navy', hex: '#1e3a8a' },
  { id: 'beige', hex: '#d6d3d1' },
  { id: 'purple', hex: '#7e22ce' },
];

const reviews = [
  {
    id: 1,
    author: 'William Davis',
    avatar: '/assets/fetured_athlete.png',
    rating: 5,
    text: 'Absolutely love this TShirt! The feels soft and premium, and it fits perfectly. I wear it everywhere great quality for the price!',
  },
  {
    id: 2,
    author: 'Lucas Kie',
    avatar: '/assets/athlete_basketball.png',
    rating: 4,
    text: 'Excellent craftsmanship! Fabric quality is really good. Perfect for daily wear. Looks even better in person.',
  },
  {
    id: 3,
    author: 'Lien jual',
    avatar: '/assets/athlete_track.png',
    rating: 5,
    text: 'Great value for money. The tshirt is warm and looks classy. I ordered my usual size and it fits well.',
  },
];

const similarProducts = [
  {
    name: 'Underrated Premium T-Shirt',
    image: '/assets/tshirt.png',
    price: 280.0,
    originalPrice: 390.0,
    rating: 5,
    reviews: 29,
  },
  {
    name: 'Underrated Premium Sweatshirt',
    image: '/assets/product_sweatshirt.png',
    price: 159.99,
    originalPrice: 290.0,
    rating: 5,
    reviews: 29,
  },
  {
    name: 'Underrated Premium Vest',
    image: '/assets/product_vest.png',
    price: 280.0,
    originalPrice: 390.0,
    rating: 5,
    reviews: 29,
  },
  {
    name: 'Underrated Premium HAT',
    image: '/assets/product_hat.png',
    price: 280.0,
    originalPrice: 390.0,
    rating: 5,
    reviews: 29,
  },
];

export default function SingleProductPage() {
  const [activeImage, setActiveImage] = useState('/assets/tshirt.png');
  const [selectedSize, setSelectedSize] = useState('XS');
  const [selectedColor, setSelectedColor] = useState('navy');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');

  const thumbnails = [
    '/assets/tshirt.png',
    '/assets/product_sweatshirt.png',
    '/assets/product_vest.png',
  ];

  return (
    <div className="min-h-screen bg-dark-400 flex flex-col">
      <FanNavbar />

      <main className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-12 xl:px-20 py-8 w-full">
        {/* Breadcrumb */}
        <div className="text-xs text-white/50 mb-8">
          Categories / Man /
        </div>

        {/* ─── PRODUCT TOP SECTION ─── */}
        <div className="flex flex-col lg:flex-row gap-12 mb-20">
          {/* Images Left */}
          <div className="w-full lg:w-1/2 flex flex-col gap-4">
            <div className="relative aspect-square bg-[#151515] rounded-2xl overflow-hidden border border-white/5">
              <Image src={activeImage} alt="Product" fill className="object-cover" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              {thumbnails.map((thumb, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(thumb)}
                  className={`relative aspect-square bg-[#151515] rounded-xl overflow-hidden border ${activeImage === thumb ? 'border-white' : 'border-white/5'} transition-all`}
                >
                  <Image src={thumb} alt={`Thumbnail ${idx}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Details Right */}
          <div className="w-full lg:w-1/2">
            <div className="text-[#22c55e] text-sm font-medium mb-4">In Stock</div>
            <h1 className="text-3xl md:text-4xl font-bold font-heading uppercase tracking-tight mb-2">
              UNDERRATED PREMIUM T-SHIRT
            </h1>
            <p className="text-sm text-white/70 mb-4 font-medium">Drop Shoulder T-shirt</p>
            <p className="text-sm text-white/50 leading-relaxed mb-6 max-w-md">
              A stylish Drop Shoulder T-shirt designed to elevate your look with a modern fit and bold, confident feel.
            </p>

            <div className="flex items-end gap-3 mb-4">
              <span className="text-3xl font-bold">${(280.00).toFixed(2)}</span>
              <span className="text-lg text-white/30 line-through mb-1">${(390.00).toFixed(2)}</span>
            </div>

            <div className="flex items-center gap-2 mb-8">
              <span className="text-sm font-bold">5.0</span>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className="text-[#d97706] fill-[#d97706]" />
                ))}
              </div>
              <span className="text-sm text-[#3b82f6] hover:underline cursor-pointer">(245 Review)</span>
            </div>

            <div className="w-full h-px bg-white/10 mb-8" />

            <div className="flex flex-wrap gap-12 mb-8">
              {/* Size */}
              <div>
                <h3 className="text-sm font-medium text-white mb-3">Available Size</h3>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-10 h-10 flex items-center justify-center text-xs font-bold rounded bg-white/5 border ${
                        selectedSize === size 
                          ? 'bg-[#3b82f6] text-white border-[#3b82f6]' 
                          : 'text-white border-white/10 hover:border-white/30'
                      } transition-all`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div>
                <h3 className="text-sm font-medium text-white mb-3">Colors</h3>
                <div className="flex gap-3">
                  {colors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setSelectedColor(color.id)}
                      className={`w-8 h-8 rounded border-2 transition-all ${
                        selectedColor === color.id ? 'border-white scale-110' : 'border-transparent hover:border-white/30'
                      }`}
                      style={{ backgroundColor: color.hex }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="w-full h-px bg-white/10 mb-8" />

            {/* Quantity & Add to Cart */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-white mb-3">Quantity</h3>
              <div className="flex gap-4">
                <div className="flex items-center border border-white/20 rounded bg-white/5 h-12">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-full flex items-center justify-center text-white/70 hover:text-white transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <div className="w-10 text-center text-sm font-bold bg-white text-black h-full flex items-center justify-center border-x border-white/20">
                    {quantity}
                  </div>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-full flex items-center justify-center text-white/70 hover:text-white transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                
                <button className="flex-1 h-12 bg-white text-black font-bold text-sm uppercase tracking-widest rounded hover:bg-white/90 transition-colors">
                  Add to cart
                </button>
              </div>
            </div>

            <p className="text-lg italic font-medium text-white/90">
              Limited stock available — grab yours now
            </p>
          </div>
        </div>

        {/* ─── TABS: Details vs Reviews ─── */}
        <div className="mb-20">
          <div className="flex items-center justify-center border-b border-white/10 mb-8">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-8 py-4 text-sm font-medium transition-all ${
                activeTab === 'details' 
                  ? 'text-white border-b-2 border-[#3b82f6]' 
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              Product Details
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-8 py-4 text-sm font-medium transition-all ${
                activeTab === 'reviews' 
                  ? 'text-white border-b-2 border-[#3b82f6]' 
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              Review and Ratings
            </button>
          </div>

          <div className="max-w-4xl mx-auto">
            {activeTab === 'details' && (
              <div className="animate-in fade-in duration-300">
                <h2 className="text-2xl font-bold font-heading uppercase tracking-tight mb-4">DESCRIPTION</h2>
                <div className="text-sm text-white/60 leading-relaxed space-y-4 mb-8">
                  <p>
                    Step into your bold side with the Urban Classic Premium Cotton T-Shirt — designed for those who think differently and express it fearlessly. This piece blends everyday comfort with standout design, making it perfect for creative minds and streetwear lovers.
                  </p>
                  <p>
                    Whether you're out with friends or deep in your own creative zone, this t-shirt keeps you comfortable while letting your style speak loud and clear.
                  </p>
                </div>

                <h3 className="text-base font-bold mb-3 text-white/90">Why You'll Love It</h3>
                <ul className="list-disc list-inside text-sm text-white/60 space-y-2 mb-8 ml-2">
                  <li>Soft, breathable premium cotton for all-day comfort</li>
                  <li>Relaxed fit for a modern streetwear look</li>
                  <li>Eye-catching graphic design that stands out</li>
                  <li>Durable print that won't fade easily</li>
                  <li>Perfect for casual wear, hangouts, or creative sessions</li>
                </ul>

                <h3 className="text-base font-bold mb-3 text-white/90">Product Details</h3>
                <ul className="list-disc list-inside text-sm text-white/60 space-y-2 ml-2">
                  <li>Fabric: 100% Premium Cotton</li>
                  <li>Fit: Regular / Relaxed Fit</li>
                  <li>Neck: Round Neck</li>
                  <li>Sleeve: Short Sleeve</li>
                  <li>Print Type: High-quality graphic print</li>
                  <li>Gender: Unisex</li>
                  <li>Season: All-season wear</li>
                </ul>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="animate-in fade-in duration-300">
                <h2 className="text-2xl font-bold font-heading uppercase tracking-tight mb-6">REVIEWS</h2>
                
                <div className="flex items-center gap-3 mb-8">
                  <span className="text-sm text-white/50">Sort by</span>
                  <button className="flex items-center gap-2 px-3 py-1.5 text-sm border border-white/20 rounded-md text-white/80 hover:bg-white/5">
                    Newest <ChevronDown size={14} />
                  </button>
                </div>

                <div className="space-y-8">
                  {reviews.map((review) => (
                    <div key={review.id} className="flex gap-4">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 bg-dark-300">
                        <Image src={review.avatar} alt={review.author} fill className="object-cover" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-white mb-1">{review.author}</h4>
                        <div className="flex items-center gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={12} 
                              className={i < review.rating ? 'text-[#d97706] fill-[#d97706]' : 'text-white/20'} 
                            />
                          ))}
                        </div>
                        <p className="text-sm text-white/60 leading-relaxed mb-3">
                          {review.text}
                        </p>
                        <div className="flex items-center gap-4 text-xs font-medium text-white/50">
                          <button className="hover:text-white transition-colors">Reply</button>
                          <button className="hover:text-white transition-colors flex items-center gap-1.5"><ThumbsUp size={14} /></button>
                          <button className="hover:text-white transition-colors flex items-center gap-1.5"><ThumbsDown size={14} /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ─── SIMILAR PRODUCTS ─── */}
        <div className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold font-heading uppercase tracking-tight mb-10 text-center">
            Similar Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarProducts.map((product, index) => (
              <Link
                href={`/fan/shop/${index + 1}`}
                key={`${product.name}-${index}`}
                className="group bg-transparent transition-all block"
              >
                <div className="relative aspect-square bg-[#151515] rounded-2xl overflow-hidden mb-4 border border-white/5 group-hover:border-white/15 transition-colors">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <div className="px-1">
                  <h3 className="text-[15px] font-medium text-white/90 mb-2 truncate">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={i < product.rating ? 'text-[#d97706] fill-[#d97706]' : 'text-white/20'}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-white/40">({product.reviews} Reviews)</span>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl font-bold">${product.price.toFixed(2)}</span>
                    <span className="text-sm text-white/30 line-through">${product.originalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={(e) => e.preventDefault()} className="flex-1 px-4 py-2.5 text-xs font-bold border border-white/20 rounded-full text-white/80 hover:bg-white/5 hover:text-white transition-all uppercase tracking-widest">
                      Add to Cart
                    </button>
                    <button onClick={(e) => e.preventDefault()} className="flex-1 px-4 py-2.5 text-xs font-bold bg-white text-black rounded-full hover:bg-white/90 transition-all uppercase tracking-widest">
                      Buy Now
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <FanFooter />
    </div>
  );
}
