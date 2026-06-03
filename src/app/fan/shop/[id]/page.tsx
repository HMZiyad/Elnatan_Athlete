"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Star, Minus, Plus, ThumbsUp, ThumbsDown, ChevronDown, ShoppingCart, Loader2 } from 'lucide-react';
import { FanNavbar } from '@/components/organisms/fan/FanNavbar';
import { FanFooter } from '@/components/organisms/fan/FanFooter';
import { apiCall } from '@/utils/api';

// Removed static sizes and colors array; they will be dynamic

import { useRouter } from 'next/navigation';

// Removed static reviews array

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
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviewsList, setReviewsList] = useState<any[]>([]);

  const [activeImage, setActiveImage] = useState('/assets/tshirt.png');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');

  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await apiCall<{ data: any }>(`/products/${id}`);
        if (res.data) {
          setProduct(res.data);
          if (res.data.image_url) {
            const url = res.data.image_url.startsWith('http') ? res.data.image_url : `http://localhost:8080${res.data.image_url}`;
            setActiveImage(url);
          }
          if (res.data.sizes && res.data.sizes.length > 0) setSelectedSize(res.data.sizes[0]);
          if (res.data.colors && res.data.colors.length > 0) setSelectedColor(res.data.colors[0]);
        }
        
        const reviewsRes = await apiCall<{ data: any[] }>(`/products/${id}/reviews`);
        const fetchedReviews = reviewsRes.data || [];
        setReviewsList(fetchedReviews);
        
        try {
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const user = JSON.parse(userStr);
            const myReview = fetchedReviews.find((r: any) => r.user_id === user.id);
            if (myReview) {
              setNewReviewRating(myReview.rating || 5);
              setNewReviewText(myReview.comment || '');
            }
          }
        } catch (_) {}
      } catch (err) {
        console.error('Failed to fetch product details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async (buyNow = false) => {
    try {
      await apiCall('/cart', {
        method: 'POST',
        body: JSON.stringify({ product_id: id, quantity, size: selectedSize, color: selectedColor })
      });
      if (buyNow) {
        router.push('/fan/cart');
      } else {
        alert('Added to cart!');
      }
    } catch (err) {
      console.error('Failed to add to cart', err);
      alert('Failed to add to cart. Are you logged in?');
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewText.trim()) return;
    setSubmittingReview(true);
    try {
      const res = await apiCall<{ data: { review: any } }>('/products/' + id + '/reviews', {
        method: 'POST',
        body: JSON.stringify({ rating: newReviewRating, comment: newReviewText })
      });
      setReviewsList([res.data.review, ...reviewsList.filter(r => r.user_id !== res.data.review.user_id)]);
      setNewReviewText('');
      setNewReviewRating(5);
    } catch (err: any) {
      console.error('Failed to submit review', err);
      alert(err.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const thumbnails = product?.image_url 
    ? [product.image_url.startsWith('http') ? product.image_url : `http://localhost:8080${product.image_url}`] 
    : ['/assets/tshirt.png'];

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-400 flex flex-col">
        <FanNavbar />
        <main className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-12 xl:px-20 py-20 flex justify-center items-center">
          <Loader2 className="animate-spin text-white/50" size={48} />
        </main>
        <FanFooter />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-dark-400 flex flex-col">
        <FanNavbar />
        <main className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-12 xl:px-20 py-20 flex justify-center items-center">
          <p className="text-white/50">Product not found.</p>
        </main>
        <FanFooter />
      </div>
    );
  }

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
            <div className="text-[#22c55e] text-sm font-medium mb-4">{product.inventory > 0 ? 'In Stock' : 'Out of Stock'}</div>
            <h1 className="text-3xl md:text-4xl font-bold font-heading uppercase tracking-tight mb-2">
              {product.name}
            </h1>
            <p className="text-sm text-white/70 mb-4 font-medium">{product.category}</p>
            <p className="text-sm text-white/50 leading-relaxed mb-6 max-w-md">
              A stylish {product.category} designed to elevate your look with a modern fit and bold, confident feel.
            </p>

            <div className="flex items-end gap-3 mb-4">
              <span className="text-3xl font-bold">${(product.price || 0).toFixed(2)}</span>
              {product.original_price && (
                <span className="text-lg text-white/30 line-through mb-1">${(product.original_price).toFixed(2)}</span>
              )}
            </div>

            <div className="flex items-center gap-2 mb-8">
              <span className="text-sm font-bold">{(product.rating || 5).toFixed(1)}</span>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className={i < (product.rating || 5) ? 'text-[#d97706] fill-[#d97706]' : 'text-white/20'} />
                ))}
              </div>
              <span className="text-sm text-[#3b82f6] hover:underline cursor-pointer">({product.review_count || 0} Review{product.review_count !== 1 ? 's' : ''})</span>
            </div>

            <div className="w-full h-px bg-white/10 mb-8" />

            <div className="flex flex-wrap gap-12 mb-8">
              {/* Size */}
              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-white mb-3">Available Size</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size: string) => (
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
              )}

              {/* Color */}
              {product.colors && product.colors.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-white mb-3">Colors</h3>
                  <div className="flex gap-3">
                    {product.colors.map((color: string) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-3 py-1 text-sm rounded border transition-all ${
                          selectedColor === color 
                            ? 'bg-white text-black border-white' 
                            : 'bg-transparent text-white border-white/20 hover:border-white/50'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}
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
                
                <button 
                  onClick={() => handleAddToCart(false)}
                  className="flex-1 h-12 bg-white text-black font-bold text-sm uppercase tracking-widest rounded hover:bg-white/90 transition-colors"
                >
                  Add to cart
                </button>
                <button 
                  onClick={() => handleAddToCart(true)}
                  className="flex-1 h-12 bg-[#3b82f6] text-white font-bold text-sm uppercase tracking-widest rounded hover:bg-[#3b82f6]/90 transition-colors"
                >
                  Buy Now
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
                <div className="text-sm text-white/60 leading-relaxed space-y-4 mb-8 whitespace-pre-wrap">
                  {product.description || 'No description available for this product.'}
                </div>
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

                <div className="space-y-8 mb-12">
                  {reviewsList.length === 0 ? (
                    <p className="text-white/50 italic">No reviews yet. Be the first to review this product!</p>
                  ) : (
                    reviewsList.map((review: any) => (
                      <div key={review.id} className="flex gap-4">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 bg-dark-300 flex items-center justify-center">
                          {review.user_avatar_url ? (
                            <Image src={review.user_avatar_url.startsWith('http') ? review.user_avatar_url : `http://localhost:8080${review.user_avatar_url}`} alt={review.user_full_name} fill className="object-cover" />
                          ) : (
                            <span className="text-white/50 text-xs">U</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-white mb-1">{review.user_full_name || 'Anonymous'}</h4>
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
                            {review.comment}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="border-t border-white/10 pt-8 mt-8">
                  <h3 className="text-lg font-bold font-heading uppercase tracking-tight mb-4">Leave a Review</h3>
                  <form onSubmit={submitReview} className="space-y-4">
                    <div>
                      <label className="block text-sm text-white/70 mb-2">Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setNewReviewRating(star)}
                            className="hover:scale-110 transition-transform"
                          >
                            <Star 
                              size={24} 
                              className={star <= newReviewRating ? 'text-[#d97706] fill-[#d97706]' : 'text-white/20'} 
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-white/70 mb-2">Review</label>
                      <textarea
                        value={newReviewText}
                        onChange={(e) => setNewReviewText(e.target.value)}
                        placeholder="What do you think about this product?"
                        className="w-full bg-dark-300 border border-white/10 rounded-lg p-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 h-24 resize-none"
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      disabled={submittingReview || !newReviewText.trim()}
                      className="px-6 py-2 bg-[#3b82f6] text-white font-bold text-sm rounded-lg hover:bg-[#3b82f6]/90 disabled:opacity-50 transition-colors uppercase"
                    >
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
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
