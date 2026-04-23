import { BranchReview, NoShowFlag } from '@/types';

const REVIEWS_KEY = 'simba_branch_reviews';
const FLAGS_KEY = 'simba_no_show_flags';

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;

  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function getBranchReviews(branchId: string): BranchReview[] {
  return readJson<BranchReview[]>(REVIEWS_KEY, []).filter(review => review.branchId === branchId);
}

export function addBranchReview(review: Omit<BranchReview, 'id' | 'createdAt'>) {
  const reviews = readJson<BranchReview[]>(REVIEWS_KEY, []);
  const next: BranchReview = {
    ...review,
    id: `review-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  writeJson(REVIEWS_KEY, [next, ...reviews]);
  return next;
}

export function getBranchReviewSummary(branchId: string) {
  const reviews = getBranchReviews(branchId);
  const count = reviews.length;
  const average = count > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / count
    : 0;

  return {
    count,
    average,
  };
}

export function getAllNoShowFlags(): NoShowFlag[] {
  return readJson<NoShowFlag[]>(FLAGS_KEY, []);
}

export function getNoShowFlagsByPhone(customerPhone: string): NoShowFlag[] {
  const normalized = normalizePhone(customerPhone);
  return getAllNoShowFlags().filter(flag => normalizePhone(flag.customerPhone) === normalized);
}

export function addNoShowFlag(flag: Omit<NoShowFlag, 'id' | 'createdAt'>) {
  const flags = getAllNoShowFlags();
  const next: NoShowFlag = {
    ...flag,
    id: `flag-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  writeJson(FLAGS_KEY, [next, ...flags]);
  return next;
}

export function getDepositRequirement(customerPhone: string) {
  const flagCount = getNoShowFlagsByPhone(customerPhone).length;
  if (flagCount >= 4) return { amount: 10000, flagCount };
  if (flagCount >= 2) return { amount: 5000, flagCount };
  if (flagCount >= 1) return { amount: 3000, flagCount };
  return { amount: 2000, flagCount };
}

function normalizePhone(phone: string) {
  return phone.replace(/\s+/g, '').replace(/-/g, '');
}
