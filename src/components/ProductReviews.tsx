'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LogIn } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  getProductReviews,
  addProductReview,
  getProductRatingSummary,
  hasUserReviewedProduct,
} from '@/lib/reviewData';
import { ProductReview } from '@/types';
import StarRating from './StarRating';

interface Props {
  productId: string | number;
}

function InteractiveStars({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="text-2xl leading-none transition-colors"
          aria-label={`${star} star`}
        >
          <span className={(hover || value) >= star ? 'text-amber-400' : 'text-gray-300 dark:text-gray-600'}>
            ★
          </span>
        </button>
      ))}
    </div>
  );
}

export default function ProductReviews({ productId }: Props) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [summary, setSummary] = useState({ count: 0, average: 0 });
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  function refresh() {
    const r = getProductReviews(productId);
    setReviews(r);
    setSummary(getProductRatingSummary(productId));
    if (user) setAlreadyReviewed(hasUserReviewedProduct(productId, user.id));
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { refresh(); }, [productId, user]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (rating === 0) { setError('Please select a star rating.'); return; }
    addProductReview({
      productId,
      userId: user.id,
      userName: user.name,
      rating,
      comment: comment.trim(),
    });
    setSuccess(true);
    setRating(0);
    setComment('');
    setError('');
    refresh();
  }

  const LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  return (
    <section className="mt-12 pt-8 border-t border-light-border dark:border-dark-border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-light-text dark:text-dark-text">Customer Reviews</h2>
        {summary.count > 0 && (
          <div className="flex items-center gap-2">
            <StarRating rating={summary.average} size="md" />
            <span className="text-sm text-gray-500">({summary.count} {summary.count === 1 ? 'review' : 'reviews'})</span>
          </div>
        )}
      </div>

      {/* Summary bar */}
      {summary.count > 0 && (
        <div className="bg-gray-50 dark:bg-slate-800/50 rounded-card border border-light-border dark:border-dark-border p-5 mb-6 flex items-center gap-6">
          <div className="text-center shrink-0">
            <p className="text-4xl font-black text-light-text dark:text-dark-text">{summary.average.toFixed(1)}</p>
            <StarRating rating={summary.average} size="md" />
            <p className="text-xs text-gray-500 mt-1">{summary.count} {summary.count === 1 ? 'review' : 'reviews'}</p>
          </div>
          <div className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map(star => {
              const starCount = reviews.filter(r => r.rating === star).length;
              const pct = summary.count > 0 ? (starCount / summary.count) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="w-3 text-right">{star}</span>
                  <span className="text-amber-400 text-[10px]">★</span>
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-5 text-right">{starCount}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Review form */}
      <div className="mb-8">
        {!user ? (
          <div className="flex items-center gap-3 p-4 rounded-card border border-light-border dark:border-dark-border bg-gray-50 dark:bg-slate-800/40">
            <LogIn size={18} className="text-[#16a34a] shrink-0" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <Link href="/auth/login" className="font-semibold text-[#16a34a] hover:underline">Sign in</Link>
              {' '}to leave a review for this product.
            </p>
          </div>
        ) : alreadyReviewed ? (
          <div className="p-4 rounded-card border border-[#16a34a]/30 bg-[#16a34a]/5 text-sm text-[#16a34a] dark:text-green-400">
            ✓ You have already reviewed this product. Thank you for your feedback!
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-slate-800/40 rounded-card border border-light-border dark:border-dark-border p-5 space-y-4">
            <h3 className="font-semibold text-light-text dark:text-dark-text">Rate this product</h3>

            {success && (
              <div className="p-3 rounded-btn bg-[#16a34a]/10 border border-[#16a34a]/30 text-sm text-[#16a34a] dark:text-green-400">
                ✓ Review submitted! Thank you.
              </div>
            )}

            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Your rating <span className="text-red-500">*</span></p>
              <div className="flex items-center gap-3">
                <InteractiveStars value={rating} onChange={setRating} />
                {rating > 0 && (
                  <span className="text-sm font-medium text-amber-600 dark:text-amber-400">{LABELS[rating]}</span>
                )}
              </div>
              {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1.5">
                Comment <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                rows={3}
                placeholder="Share your experience with this product..."
                className="w-full px-3 py-2 text-sm border border-light-border dark:border-dark-border rounded-btn bg-white dark:bg-dark-bg text-light-text dark:text-dark-text focus:outline-none focus:border-[#16a34a] resize-none"
              />
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">Reviewing as <span className="font-medium">{user.name}</span></p>
              <button
                type="submit"
                className="px-5 py-2 bg-[#f59e0b] hover:bg-[#d97706] text-white text-sm font-bold rounded-btn transition-colors"
              >
                Submit Review
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Reviews list */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map(review => (
            <article key={review.id} className="bg-white dark:bg-dark-card rounded-card border border-light-border dark:border-dark-border p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <p className="text-sm font-semibold text-light-text dark:text-dark-text">{review.userName}</p>
                  <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                </div>
                <StarRating rating={review.rating} size="sm" />
              </div>
              {review.comment && (
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{review.comment}</p>
              )}
            </article>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">
          No reviews yet. Be the first to review this product!
        </p>
      )}
    </section>
  );
}
