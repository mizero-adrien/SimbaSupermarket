'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Clock, ChevronRight, Store, Star, Quote } from 'lucide-react';
import { Branch } from '@/types';
import { getAllBranches } from '@/lib/branches';
import { getBranchReviewSummary } from '@/lib/reviewData';

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);

  useEffect(() => {
    setBranches(getAllBranches());
  }, []);

  const openBranches = branches.filter(b => b.isOpen);
  const closedBranches = branches.filter(b => !b.isOpen);

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg page-transition">
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#0f172a] to-[#16a34a] text-white py-14 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <Store size={14} />
            {branches.length} Locations Across Rwanda
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">Our Branches</h1>
          <p className="text-white/80 text-base max-w-xl mx-auto">
            Find a Simba Supermarket near you. We&apos;re in Kigali and expanding across Rwanda.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Open branches */}
        <h2 className="text-lg font-bold text-light-text dark:text-dark-text mb-5 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#16a34a] inline-block" />
          Open Now — {openBranches.length} branches
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {openBranches.map(branch => (
            <BranchCard key={branch.id} branch={branch} />
          ))}
        </div>

        {closedBranches.length > 0 && (
          <>
            <h2 className="text-lg font-bold text-light-text dark:text-dark-text mb-5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gray-400 inline-block" />
              Temporarily Closed
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {closedBranches.map(branch => (
                <BranchCard key={branch.id} branch={branch} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function BranchCard({ branch }: { branch: Branch }) {
  const spotlightReview = branch.testimonials[0];
  const [rating, setRating] = useState(branch.rating);
  const [reviewCount, setReviewCount] = useState(branch.reviewCount);

  useEffect(() => {
    const summary = getBranchReviewSummary(branch.id);
    if (summary.count > 0) {
      setRating(summary.average);
      setReviewCount(summary.count);
    }
  }, [branch.id, branch.rating, branch.reviewCount]);

  return (
    <Link
      href={`/branches/${branch.id}`}
      className="group bg-white dark:bg-dark-card rounded-card border border-light-border dark:border-dark-border overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        <Image
          src={branch.image}
          alt={branch.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <span className="text-white font-bold text-base leading-tight">{branch.name}</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            branch.isOpen ? 'bg-[#16a34a] text-white' : 'bg-gray-500 text-white'
          }`}>
            {branch.isOpen ? 'Open' : 'Closed'}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-1 text-amber-500">
            <Star size={14} fill="currentColor" />
            <span className="text-sm font-semibold text-light-text dark:text-dark-text">{rating.toFixed(1)}</span>
          </div>
          <span className="text-xs text-gray-500">{reviewCount}+ reviews</span>
        </div>

        <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
          <MapPin size={14} className="shrink-0 mt-0.5 text-[#16a34a]" />
          <span className="line-clamp-2">{branch.address}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Phone size={14} className="shrink-0 text-[#16a34a]" />
          <span>{branch.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Clock size={14} className="shrink-0 text-[#16a34a]" />
          <span>{branch.hours}</span>
        </div>

        <div className="pt-1 pb-1 border-t border-light-border dark:border-dark-border">
          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
            {branch.description}
          </p>
        </div>

        {spotlightReview && (
          <div className="flex gap-2 p-2 rounded-btn bg-gray-50 dark:bg-slate-800/60">
            <Quote size={14} className="shrink-0 text-[#16a34a] mt-0.5" />
            <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
              &quot;{spotlightReview.quote}&quot;
            </p>
          </div>
        )}

        <div className="pt-1 flex items-center justify-between">
          <span className="text-xs font-medium text-[#16a34a] bg-[#16a34a]/10 px-2 py-0.5 rounded-full">
            {branch.location}
          </span>
          <span className="flex items-center gap-0.5 text-xs text-[#16a34a] font-semibold group-hover:gap-1 transition-all">
            View branch <ChevronRight size={13} />
          </span>
        </div>
      </div>
    </Link>
  );
}
