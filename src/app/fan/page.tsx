"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Star, Gamepad2, Handshake, Heart, Target, ShoppingCart } from 'lucide-react';
import { FanNavbar } from '@/components/organisms/fan/FanNavbar';
import { FanFooter } from '@/components/organisms/fan/FanFooter';

/* ───────────────────────── DATA ───────────────────────── */

const featuredAthletes = [
  {
    name: 'Maya Reyes',
    sport: 'Track & Field',
    image: '/assets/athlete_track.png',
  },
  {
    name: 'Devon Carter',
    sport: 'Basketball',
    image: '/assets/fetured_athlete.png',
  },
  {
    name: 'Layla Okafor',
    sport: 'Climbing & MMA',
    image: '/assets/athlete_mma.png',
  },
];

const platformFeatures = [
  {
    icon: <Gamepad2 size={24} />,
    title: 'For Athletes',
    description: 'Showcase your talent, track your performance, and earn the recognition you deserve.',
  },
  {
    icon: <Handshake size={24} />,
    title: 'For Brands',
    description: 'Discover rising talent early, promote your brand, and build strong partnerships.',
  },
  {
    icon: <Heart size={24} />,
    title: 'For Fans',
    description: 'Discover athletes, vote for your favorites, and support their journey forward.',
  },
  {
    icon: <Target size={24} />,
    title: 'Our Mission',
    description: 'Connect athletes, fans, and brands in one platform to build a fair sports ecosystem.',
  },
];

const featuredProducts = [
  {
    name: 'Underrated Premium T-Shirt',
    image: '/assets/tshirt.png',
    price: 280.0,
    originalPrice: 390.0,
    rating: 4.5,
    reviews: 29,
  },
  {
    name: 'Underrated Premium Sweatshirt',
    image: '/assets/product_sweatshirt.png',
    price: 159.99,
    originalPrice: 290.0,
    rating: 4.5,
    reviews: 29,
  },
  {
    name: 'Underrated Premium Vest',
    image: '/assets/product_vest.png',
    price: 280.0,
    originalPrice: 390.0,
    rating: 4.5,
    reviews: 29,
  },
  {
    name: 'Underrated Premium HAT',
    image: '/assets/product_hat.png',
    price: 280.0,
    originalPrice: 390.0,
    rating: 4.5,
    reviews: 29,
  },
];

/* ───────────────────────── COMPONENT ───────────────────────── */

export default function FanHomePage() {
  return (
    <div className="min-h-screen bg-dark-400">
      <FanNavbar />

      {/* ─── HERO SECTION ─── */}
      <section className="relative w-full h-[70vh] md:h-[80vh] overflow-hidden">
        <Image
          src="/assets/fan_hero.png"
          alt="Athletes on track"
          fill
          className="object-cover"
          priority
        />
        {/* Dark overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-400 via-dark-400/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-dark-400/70 to-transparent" />

        <div className="relative z-10 flex flex-col justify-end h-full w-full mx-auto px-4 sm:px-6 lg:px-12 xl:px-20 pb-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-heading uppercase tracking-tight leading-tight max-w-2xl">
            Underrated for those who&apos;ve earned
          </h1>
          <p className="mt-4 text-sm md:text-base text-white/60 max-w-lg">
            Street performance, minimal. Build different, worn by few.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/fan/shop"
              className="px-6 py-3 text-sm font-medium border border-white/30 rounded-full text-white hover:bg-white/10 transition-all"
            >
              Shop Collection
            </Link>
            <Link
              href="/fan/explore"
              className="px-6 py-3 text-sm font-medium border border-white/30 rounded-full text-white hover:bg-white/10 transition-all"
            >
              Explore Athletes
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FEATURED ATHLETES ─── */}
      <section className="w-full mx-auto px-4 sm:px-6 lg:px-12 xl:px-20 py-20">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl md:text-3xl font-bold font-heading uppercase tracking-tight">
            Featured Athletes
          </h2>
          <Link href="/fan/explore" className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">
            View All <ArrowUpRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredAthletes.map((athlete) => (
            <Link
              key={athlete.name}
              href="/fan/explore"
              className="group relative bg-dark-200 rounded-2xl overflow-hidden aspect-[3/4] hover:ring-1 hover:ring-white/20 transition-all"
            >
              <Image
                src={athlete.image}
                alt={athlete.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-between">
                <div>
                  <h3 className="text-xl font-bold font-heading uppercase tracking-tight">
                    {athlete.name}
                  </h3>
                  <p className="text-sm text-white/50 mt-1">{athlete.sport}</p>
                </div>
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ArrowUpRight size={18} className="text-black" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── ONE PLATFORM SECTION ─── */}
      <section className="w-full mx-auto px-4 sm:px-6 lg:px-12 xl:px-20 py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold font-heading uppercase tracking-tight mb-3">
            One platform. Endless opportunities.
          </h2>
          <p className="text-sm text-white/50 max-w-lg mx-auto">
            Empowering athletes to shine, fans to support, and brands to discover real talent.
          </p>
          <div className="mt-6 w-full h-px bg-white/10" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {platformFeatures.map((feature) => (
            <div
              key={feature.title}
              className="bg-dark-200 border border-white/5 rounded-2xl p-6 hover:border-white/15 transition-all group"
            >
              <div className="w-12 h-12 bg-dark-300 rounded-xl flex items-center justify-center mb-5 text-white/60 group-hover:text-white transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-sm font-bold font-heading uppercase tracking-wide mb-3">
                {feature.title}
              </h3>
              <p className="text-xs text-white/40 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FEATURED PRODUCTS ─── */}
      <section className="w-full mx-auto px-4 sm:px-6 lg:px-12 xl:px-20 py-20">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl md:text-3xl font-bold font-heading uppercase tracking-tight">
            Featured Products
          </h2>
          <Link href="/fan/shop" className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">
            View All <ArrowUpRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product, index) => (
            <Link
              key={product.name}
              href={`/fan/shop/${index + 1}`}
              className="group bg-dark-200 border border-white/5 rounded-2xl overflow-hidden hover:border-white/15 transition-all block"
            >
              <div className="relative aspect-square bg-dark-300 overflow-hidden">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5">
                <h3 className="text-sm font-semibold mb-2 truncate">{product.name}</h3>
                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        className={i < Math.floor(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-white/20'}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-white/40">({product.reviews} Reviews)</span>
                </div>
                {/* Price */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg font-bold">${product.price.toFixed(2)}</span>
                  <span className="text-sm text-white/30 line-through">${product.originalPrice.toFixed(2)}</span>
                </div>
                {/* Buttons */}
                <div className="flex gap-2">
                  <button onClick={(e) => e.preventDefault()} className="flex-1 px-3 py-2 text-xs font-medium border border-white/20 rounded-lg text-white/80 hover:bg-white/5 transition-all flex items-center justify-center gap-1.5">
                    <ShoppingCart size={13} /> Add to Cart
                  </button>
                  <button onClick={(e) => e.preventDefault()} className="flex-1 px-3 py-2 text-xs font-medium bg-white text-black rounded-lg hover:bg-white/90 transition-all">
                    Buy Now
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section className="relative w-full h-[50vh] overflow-hidden">
        <Image
          src="/assets/cta_banner.png"
          alt="Athlete on track"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading uppercase tracking-tight max-w-2xl leading-tight">
            Ready to show the world what you&apos;re made of?
          </h2>
          <p className="mt-4 text-sm text-white/50 max-w-lg">
            Join as athlete underrated talent. Build your profile, collect votes, and start earning today.
          </p>
          <Link
            href="/signup"
            className="mt-8 px-8 py-3 text-sm font-medium border border-white/40 rounded-full text-white hover:bg-white/10 transition-all"
          >
            Join as an Athlete
          </Link>
        </div>
      </section>

      <FanFooter />
    </div>
  );
}
