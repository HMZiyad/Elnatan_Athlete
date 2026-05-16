"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, SlidersHorizontal, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { FanNavbar } from '@/components/organisms/fan/FanNavbar';
import { FanFooter } from '@/components/organisms/fan/FanFooter';

const categories = ['All Items', 'T-Shirts', 'Pants', 'Hats'];

const products = [
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

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState('All Items');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 3;

  return (
    <div className="min-h-screen bg-dark-400 flex flex-col">
      <FanNavbar />

      <main className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-12 xl:px-20 py-12 md:py-16 w-full">
        {/* ─── HEADER ─── */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold font-heading uppercase tracking-tight mb-3">
            Shop Collection
          </h1>
          <p className="text-sm text-white/50 max-w-md leading-relaxed">
            Streetwear made for neurodivergent minds.
          </p>
        </div>

        {/* ─── FILTERS ROW ─── */}
        <div className="flex flex-wrap items-center gap-3 mb-12">
          {/* Category Pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 text-xs font-medium rounded-full border transition-all ${
                  activeCategory === cat
                    ? 'border-white text-white bg-white/5'
                    : 'border-white/15 text-white/50 hover:text-white hover:border-white/30'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search + Filter */}
          <div className="flex items-center gap-2 ml-auto">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                placeholder="Search item"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 w-48 sm:w-56 text-sm bg-dark-200 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-white/25 transition-all"
              />
            </div>
            <button className="p-2.5 bg-dark-200 border border-white/10 rounded-lg text-white/50 hover:text-white hover:border-white/25 transition-all">
              <SlidersHorizontal size={16} />
            </button>
          </div>
        </div>

        {/* ─── PRODUCTS GRID ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {products.map((product, index) => (
            <Link
              href={`/fan/shop/${index + 1}`}
              key={`${product.name}-${index}`}
              className="group bg-transparent transition-all block"
            >
              {/* Image area */}
              <div className="relative aspect-square bg-[#151515] rounded-2xl overflow-hidden mb-4 border border-white/5 group-hover:border-white/15 transition-colors">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Info area */}
              <div className="px-1">
                <h3 className="text-[15px] font-medium text-white/90 mb-2 truncate">
                  {product.name}
                </h3>
                
                {/* Rating */}
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
                
                {/* Price */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl font-bold">${product.price.toFixed(2)}</span>
                  <span className="text-sm text-white/30 line-through">${product.originalPrice.toFixed(2)}</span>
                </div>
                
                {/* Buttons */}
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

        {/* ─── PAGINATION ─── */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="p-2 text-white/40 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          {[1, 2, 3].map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-9 h-9 text-sm font-medium rounded-lg transition-all ${
                currentPage === page
                  ? 'bg-white text-black'
                  : 'text-white/50 border border-white/10 hover:border-white/30 hover:text-white'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="p-2 text-white/40 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </main>

      <FanFooter />
    </div>
  );
}
