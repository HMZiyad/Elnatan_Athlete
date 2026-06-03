"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, SlidersHorizontal, Star, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { FanNavbar } from '@/components/organisms/fan/FanNavbar';
import { FanFooter } from '@/components/organisms/fan/FanFooter';
import { apiCall } from '@/utils/api';

const categories = ['All Items', 'T-Shirts', 'Pants', 'Hats'];

export default function ShopPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('All Items');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const catParam = activeCategory !== 'All Items' ? `&category=${encodeURIComponent(activeCategory)}` : '';
        const res = await apiCall<{ data: any[]; meta: any }>(
          `/products?page=${currentPage}&per_page=12&search=${encodeURIComponent(searchQuery)}${catParam}`
        );
        setProducts(res.data || []);
        if (res.meta) {
          setTotalPages(Math.ceil(res.meta.total / res.meta.per_page) || 1);
        }
      } catch (err) {
        console.error('Failed to fetch products', err);
      } finally {
        setLoading(false);
      }
    };
    
    const timer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timer);
  }, [currentPage, searchQuery, activeCategory]);

  const handleAddToCart = async (e: React.MouseEvent, product: any, buyNow: boolean = false) => {
    e.preventDefault();
    try {
      const size = product.sizes?.length > 0 ? product.sizes[0] : '';
      const color = product.colors?.length > 0 ? product.colors[0] : '';
      await apiCall('/cart', {
        method: 'POST',
        body: JSON.stringify({ product_id: product.id, quantity: 1, size, color })
      });
      if (buyNow) {
        router.push('/fan/cart');
      } else {
        alert('Added to cart!');
      }
    } catch (err) {
      console.error('Failed to add to cart', err);
      alert('Failed to add to cart.');
    }
  };

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
                onClick={() => { setActiveCategory(cat); setCurrentPage(1); }}
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
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="pl-9 pr-4 py-2 w-48 sm:w-56 text-sm bg-dark-200 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-white/25 transition-all"
              />
            </div>
            <button className="p-2.5 bg-dark-200 border border-white/10 rounded-lg text-white/50 hover:text-white hover:border-white/25 transition-all">
              <SlidersHorizontal size={16} />
            </button>
          </div>
        </div>

        {/* ─── PRODUCTS GRID ─── */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-white/50" size={32} />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-white/50">
            No products found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {products.map((product) => {
              const image = product.image_url
                ? (product.image_url.startsWith('http') ? product.image_url : `http://localhost:8080${product.image_url}`)
                : '/assets/tshirt.png';
              
              return (
                <Link
                  href={`/fan/shop/${product.id}`}
                  key={product.id}
                  className="group bg-transparent transition-all block"
                >
                  {/* Image area */}
                  <div className="relative aspect-square bg-[#151515] rounded-2xl overflow-hidden mb-4 border border-white/5 group-hover:border-white/15 transition-colors">
                    <Image
                      src={image}
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
                            className={i < (product.rating || 5) ? 'text-[#d97706] fill-[#d97706]' : 'text-white/20'}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-white/40">({product.review_count || 0} Reviews)</span>
                    </div>
                    
                    {/* Price */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xl font-bold">${(product.price || 0).toFixed(2)}</span>
                      {product.original_price && (
                        <span className="text-sm text-white/30 line-through">${product.original_price.toFixed(2)}</span>
                      )}
                    </div>
                    
                    {/* Buttons */}
                    <div className="flex gap-2">
                      <button onClick={(e) => handleAddToCart(e, product, false)} className="flex-1 px-4 py-2.5 text-xs font-bold border border-white/20 rounded-full text-white/80 hover:bg-white/5 hover:text-white transition-all uppercase tracking-widest">
                        Add to Cart
                      </button>
                      <button onClick={(e) => handleAddToCart(e, product, true)} className="flex-1 px-4 py-2.5 text-xs font-bold bg-white text-black rounded-full hover:bg-white/90 transition-all uppercase tracking-widest">
                        Buy Now
                      </button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* ─── PAGINATION ─── */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mb-8">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 text-white/40 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
        )}
      </main>

      <FanFooter />
    </div>
  );
}
