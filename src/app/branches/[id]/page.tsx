'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Clock, ArrowLeft, ShoppingBag, Store, Star, BadgeCheck, ExternalLink } from 'lucide-react';
import { Branch, Product } from '@/types';
import { getAllBranches, getBranchById } from '@/lib/branches';
import ProductCard from '@/components/ProductCard';
import { getMasterProducts } from '@/lib/productData';
import { deterministicShuffle } from '@/lib/products';
import { addBranchReview, getBranchReviewSummary, getBranchReviews } from '@/lib/reviewData';

export default function BranchDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [allBranches, setAllBranches] = useState<Branch[]>([]);
  const [reviews, setReviews] = useState(getBranchReviews(id));
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewName, setReviewName] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const branch = getBranchById(id);
  const reviewSummary = getBranchReviewSummary(id);

  useEffect(() => {
    setAllProducts(getMasterProducts());
    setAllBranches(getAllBranches());
    setReviews(getBranchReviews(id));
  }, [id]);

  const branchProducts = useMemo(() => {
    if (!branch) return [];
    const seed = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return deterministicShuffle(allProducts, seed).slice(0, 24);
  }, [id, branch, allProducts]);

  function submitReview() {
    if (!reviewName.trim() || !reviewComment.trim()) return;
    addBranchReview({
      branchId: id,
      customerName: reviewName.trim(),
      rating: reviewRating,
      comment: reviewComment.trim(),
      pickupType: 'pickup',
    });
    setReviews(getBranchReviews(id));
    setReviewName('');
    setReviewComment('');
    setReviewRating(5);
  }

  if (!branch) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <Store size={48} className="mx-auto text-gray-300 mb-3" />
          <h1 className="text-xl font-bold text-light-text dark:text-dark-text">Branch not found</h1>
          <Link href="/branches" className="mt-4 inline-block text-[#16a34a] hover:underline text-sm">
            ← Back to branches
          </Link>
        </div>
      </div>
    );
  }

  const categories = Array.from(new Set(branchProducts.map(p => p.category)));
  const displayedRating = reviewSummary.count > 0 ? reviewSummary.average : branch.rating;
  const displayedReviewCount = reviewSummary.count > 0 ? reviewSummary.count : branch.reviewCount;

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg page-transition">
      {/* Branch hero */}
      <div className="relative h-56 md:h-72 overflow-hidden">
        <Image
          src={branch.image}
          alt={branch.name}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/70" />
        <div className="absolute bottom-0 left-0 right-0 p-6 max-w-7xl mx-auto">
          <Link href="/branches" className="inline-flex items-center gap-1.5 text-white/80 hover:text-white text-sm mb-3 transition-colors">
            <ArrowLeft size={14} />
            All Branches
          </Link>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white">{branch.name}</h1>
              <p className="text-white/70 text-sm mt-1">{branch.location}</p>
              <div className="mt-2 inline-flex items-center gap-1.5 bg-black/30 backdrop-blur px-2.5 py-1 rounded-full">
                <Star size={13} className="text-amber-400" fill="currentColor" />
                <span className="text-sm font-semibold text-white">{displayedRating.toFixed(1)}</span>
                <span className="text-xs text-white/75">({displayedReviewCount}+ reviews)</span>
              </div>
            </div>
            <span className={`shrink-0 text-sm font-bold px-3 py-1 rounded-full ${
              branch.isOpen ? 'bg-[#16a34a] text-white' : 'bg-gray-500 text-white'
            }`}>
              {branch.isOpen ? '🟢 Open Now' : '🔴 Closed'}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          <div className="lg:col-span-2 bg-white dark:bg-dark-card rounded-card border border-light-border dark:border-dark-border p-5">
            <h2 className="text-base font-bold text-light-text dark:text-dark-text mb-2">Branch Profile</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{branch.description}</p>

            <div className="space-y-2">
              {branch.highlights.map(highlight => (
                <div key={highlight} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <BadgeCheck size={15} className="shrink-0 text-[#16a34a] mt-0.5" />
                  <span>{highlight}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-dark-card rounded-card border border-light-border dark:border-dark-border p-5">
            <h2 className="text-base font-bold text-light-text dark:text-dark-text mb-2">Services</h2>
            <div className="flex flex-wrap gap-2">
              {branch.services.map(service => (
                <span
                  key={service}
                  className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#16a34a]/10 text-[#166534] dark:text-green-300"
                >
                  {service}
                </span>
              ))}
            </div>

            <Link
              href={branch.mapUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#16a34a] hover:underline"
            >
              Open in Google Maps <ExternalLink size={14} />
            </Link>
          </div>
        </div>

        {/* Info strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          {[
            { icon: MapPin, label: 'Address', value: branch.address },
            { icon: Phone, label: 'Phone', value: branch.phone },
            { icon: Clock, label: 'Hours', value: branch.hours },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3 bg-white dark:bg-dark-card rounded-card border border-light-border dark:border-dark-border p-4">
              <Icon size={18} className="text-[#16a34a] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                <p className="text-sm font-medium text-light-text dark:text-dark-text">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Category pills */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 mb-6">
          <span className="text-sm font-semibold text-light-text dark:text-dark-text shrink-0">Categories:</span>
          {categories.map(cat => (
            <Link
              key={cat}
              href={`/products?category=${encodeURIComponent(cat)}`}
              className="shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border border-light-border dark:border-dark-border bg-white dark:bg-dark-card text-light-text dark:text-dark-text hover:border-[#16a34a] hover:text-[#16a34a] transition-colors"
            >
              {cat}
            </Link>
          ))}
        </div>

        <div className="mb-10">
          <h2 className="text-lg font-bold text-light-text dark:text-dark-text mb-4">Customer Reviews</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {branch.testimonials.map((review, index) => (
              <article
                key={`${review.reviewer}-${index}`}
                className="bg-white dark:bg-dark-card rounded-card border border-light-border dark:border-dark-border p-4"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="text-sm font-semibold text-light-text dark:text-dark-text">{review.reviewer}</p>
                    <p className="text-xs text-gray-500">{review.address}</p>
                  </div>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      review.sentiment === 'positive'
                        ? 'text-[#166534] bg-green-100 dark:bg-green-900/30 dark:text-green-300'
                        : review.sentiment === 'negative'
                          ? 'text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-300'
                          : 'text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-300'
                    }`}
                  >
                    {review.sentiment}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">&quot;{review.quote}&quot;</p>
              </article>
            ))}
            {reviews.map(review => (
              <article key={review.id} className="bg-white dark:bg-dark-card rounded-card border border-light-border dark:border-dark-border p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="text-sm font-semibold text-light-text dark:text-dark-text">{review.customerName}</p>
                    <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                    {review.rating}/5
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">{review.comment}</p>
              </article>
            ))}
          </div>

          <div className="bg-white dark:bg-dark-card rounded-card border border-light-border dark:border-dark-border p-4">
            <h3 className="font-bold text-light-text dark:text-dark-text mb-3">Rate your pickup experience</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <input
                type="text"
                value={reviewName}
                onChange={e => setReviewName(e.target.value)}
                placeholder="Your name"
                className="px-3 py-2 text-sm border border-light-border dark:border-dark-border rounded-btn bg-white dark:bg-dark-bg"
              />
              <select
                value={reviewRating}
                onChange={e => setReviewRating(Number(e.target.value))}
                className="px-3 py-2 text-sm border border-light-border dark:border-dark-border rounded-btn bg-white dark:bg-dark-bg"
              >
                {[5, 4, 3, 2, 1].map(value => <option key={value} value={value}>{value} stars</option>)}
              </select>
              <button
                onClick={submitReview}
                className="px-3 py-2 text-sm font-semibold text-white bg-[#f59e0b] rounded-btn hover:bg-[#d97706]"
              >
                Submit Review
              </button>
            </div>
            <textarea
              value={reviewComment}
              onChange={e => setReviewComment(e.target.value)}
              rows={3}
              placeholder="Tell others what the pickup experience was like..."
              className="w-full px-3 py-2 text-sm border border-light-border dark:border-dark-border rounded-btn bg-white dark:bg-dark-bg"
            />
            <p className="mt-2 text-xs text-gray-500">Demo review form. In a full rollout, this can be shown after a completed pickup or verified order.</p>
          </div>
        </div>

        {/* Products */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-light-text dark:text-dark-text flex items-center gap-2">
            <ShoppingBag size={18} className="text-[#16a34a]" />
            Products at this branch
          </h2>
          <span className="text-sm text-gray-500">{branchProducts.length} items</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {branchProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Other branches */}
        <div className="mt-12 pt-8 border-t border-light-border dark:border-dark-border">
          <h3 className="text-base font-bold text-light-text dark:text-dark-text mb-4">Other branches</h3>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {allBranches.filter(b => b.id !== id).slice(0, 5).map(b => (
              <Link
                key={b.id}
                href={`/branches/${b.id}`}
                className="shrink-0 flex items-center gap-2 bg-white dark:bg-dark-card rounded-card border border-light-border dark:border-dark-border px-4 py-3 hover:border-[#16a34a] transition-colors"
              >
                <span className={`w-2 h-2 rounded-full ${b.isOpen ? 'bg-[#16a34a]' : 'bg-gray-400'}`} />
                <div>
                  <p className="text-sm font-medium text-light-text dark:text-dark-text">{b.name}</p>
                  <p className="text-xs text-gray-500">{b.location}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
