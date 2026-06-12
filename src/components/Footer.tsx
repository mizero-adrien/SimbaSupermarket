'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin, Truck, ShieldCheck, Headphones, RotateCcw } from 'lucide-react';

const trustBadges = [
  { icon: Truck, label: 'Free Delivery', sub: 'Orders over 50,000 RWF' },
  { icon: ShieldCheck, label: 'Secure Payment', sub: '100% protected' },
  { icon: Headphones, label: '24/7 Support', sub: 'Always here to help' },
  { icon: RotateCcw, label: 'Easy Returns', sub: 'Hassle-free returns' },
];

function SocialIcon({ name }: { name: 'facebook' | 'instagram' | 'x' | 'whatsapp' }) {
  switch (name) {
    case 'facebook':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
          <path fill="currentColor" d="M13.5 22v-8.2h2.8l.4-3.2h-3.2V8.6c0-.9.2-1.6 1.7-1.6h1.7V4.1c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H8v3.2h2.7V22h2.8z" />
        </svg>
      );
    case 'instagram':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
          <path fill="currentColor" d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 2.8A5.2 5.2 0 1 1 6.8 12 5.2 5.2 0 0 1 12 6.8zm0 2a3.2 3.2 0 1 0 3.2 3.2A3.2 3.2 0 0 0 12 8.8zm5.4-2.7a1.2 1.2 0 1 1-1.2 1.2 1.2 1.2 0 0 1 1.2-1.2z" />
        </svg>
      );
    case 'x':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
          <path fill="currentColor" d="M18.9 2H22l-6.8 7.8L23.2 22h-6.6l-5.2-6.7L5.6 22H2.5l7.3-8.4L.8 2h6.8l4.7 6.1L18.9 2zm-1.2 18h1.7L6.7 4H4.9l12.8 16z" />
        </svg>
      );
    case 'whatsapp':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
          <path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.8 4.9-1.3A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-2.9.8.8-2.8-.2-.3A8 8 0 1 1 12 20zm4.4-5.8c-.2-.1-1.5-.7-1.7-.8s-.3-.1-.4.1-.6.8-.7 1-.3.1-.6 0a6.5 6.5 0 0 1-1.9-1.2 7.2 7.2 0 0 1-1.4-1.8c-.1-.2 0-.3.1-.4l.4-.5c.1-.1.1-.3.2-.4s0-.2 0-.3-.4-1-.5-1.4-.3-.4-.4-.4h-.4c-.1 0-.4.1-.6.3s-.8.8-.8 1.9.8 2.2.9 2.4c.1.2 1.4 2.3 3.5 3.1 2.1.8 2.1.5 2.5.5s1.2-.5 1.4-1 .2-.9.1-1c-.1-.1-.2-.1-.4-.2z" />
        </svg>
      );
  }
}

export default function Footer() {
  return (
    <footer className="bg-[#f7f7f2] dark:bg-[#0f172a] text-gray-500 dark:text-gray-400 border-t border-light-border dark:border-slate-800 mt-16">

      {/* Trust badges strip */}
      <div className="border-b border-light-border dark:border-slate-800 bg-white dark:bg-[#0f172a]">
        <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {trustBadges.map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#16a34a]/10 flex items-center justify-center shrink-0">
                <Icon size={18} className="text-[#16a34a]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-white">{label}</p>
                <p className="text-xs text-gray-400">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main columns */}
      <div className="max-w-7xl mx-auto px-4 py-10 sm:py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {/* Brand */}
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="text-[#16a34a] font-bold text-xl mb-2">Simba Supermarket</div>
          <p className="text-sm leading-relaxed mb-4">
            Rwanda&apos;s freshest online supermarket. 552 products delivered to your door in Kigali.
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-600 mb-5">Kigali, Rwanda &mdash; Est. 2024</p>

          {/* Social links */}
          <div className="flex items-center gap-3">
            {[
              { label: 'Facebook', href: '#', name: 'facebook' as const },
              { label: 'Instagram', href: '#', name: 'instagram' as const },
              { label: 'X', href: '#', name: 'x' as const },
              { label: 'WhatsApp', href: '#', name: 'whatsapp' as const },
            ].map(({ label, href, name }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="w-8 h-8 rounded-full border border-light-border dark:border-slate-700 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:border-[#16a34a] hover:text-[#16a34a] transition-colors"
              >
                <SocialIcon name={name} />
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-gray-800 dark:text-white font-semibold mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/" className="hover:text-[#16a34a] transition-colors">Home</Link></li>
            <li><Link href="/products" className="hover:text-[#16a34a] transition-colors">Products</Link></li>
            <li><Link href="/branches" className="hover:text-[#16a34a] transition-colors">Our Branches</Link></li>
            <li><Link href="/about" className="hover:text-[#16a34a] transition-colors">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-[#16a34a] transition-colors">Contact Us</Link></li>
          </ul>
        </div>

        {/* Customer */}
        <div>
          <h4 className="text-gray-800 dark:text-white font-semibold mb-3">Customer</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/cart" className="hover:text-[#16a34a] transition-colors">My Cart</Link></li>
            <li><Link href="/account" className="hover:text-[#16a34a] transition-colors">My Orders</Link></li>
            <li><Link href="/checkout" className="hover:text-[#16a34a] transition-colors">Checkout</Link></li>
            <li><Link href="/auth/login" className="hover:text-[#16a34a] transition-colors">Login</Link></li>
            <li><Link href="/auth/signup" className="hover:text-[#16a34a] transition-colors">Sign Up</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-gray-800 dark:text-white font-semibold mb-3">Contact</h4>
          <ul className="space-y-3 text-sm">
            <li>
              <a href="mailto:info@simbasupermarket.rw" className="flex items-center gap-2 hover:text-[#16a34a] transition-colors">
                <Mail size={14} className="shrink-0 text-[#f59e0b]" />
                info@simbasupermarket.rw
              </a>
            </li>
            <li>
              <a href="tel:+250788000000" className="flex items-center gap-2 hover:text-[#16a34a] transition-colors">
                <Phone size={14} className="shrink-0 text-[#f59e0b]" />
                +250 788 000 000
              </a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin size={14} className="shrink-0 mt-0.5 text-[#f59e0b]" />
              KG 123 St, Kacyiru, Kigali, Rwanda
            </li>
          </ul>
          <Link
            href="/contact"
            className="inline-block mt-4 text-xs font-semibold px-4 py-1.5 rounded-full border border-[#16a34a]/40 text-[#16a34a] dark:text-[#4ade80] hover:bg-[#16a34a]/10 transition-colors"
          >
            Send us a message &rarr;
          </Link>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-light-border dark:border-slate-800 py-4 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400 dark:text-gray-600">
            &copy; 2026 Simba Supermarket Rwanda. All rights reserved.
          </p>
          {/* Payment method badges */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 mr-1">We accept:</span>
            {['VISA', 'MTN', 'Airtel', 'M-PESA'].map(method => (
              <span
                key={method}
                className="text-[9px] md:text-[10px] font-bold px-1.5 md:px-2 py-0.5 rounded border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-800"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
