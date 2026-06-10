import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-[#0f172a] text-gray-500 dark:text-gray-400 border-t border-light-border dark:border-slate-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="text-[#16a34a] font-bold text-xl mb-2">Simba Supermarket</div>
          <p className="text-sm leading-relaxed mb-4">
            Rwanda&apos;s freshest online supermarket. 552 products delivered to your door in Kigali.
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-600">Kigali, Rwanda &mdash; Est. 2024</p>
        </div>

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
      <div className="border-t border-light-border dark:border-slate-800 py-4 text-center text-xs text-gray-400 dark:text-gray-600">
        &copy; 2026 Simba Supermarket Rwanda. All rights reserved.
      </div>
    </footer>
  );
}
