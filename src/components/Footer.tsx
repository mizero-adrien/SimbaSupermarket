import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#0f172a] text-gray-400 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div>
          <div className="text-[#16a34a] font-bold text-xl mb-2">🛒 Simba Supermarket</div>
          <p className="text-sm leading-relaxed">Rwanda&apos;s freshest online supermarket. 552 products delivered to your door in Kigali.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/" className="hover:text-[#16a34a] transition-colors">Home</Link></li>
            <li><Link href="/products" className="hover:text-[#16a34a] transition-colors">Products</Link></li>
            <li><Link href="/about" className="hover:text-[#16a34a] transition-colors">About Us</Link></li>
            <li><Link href="/cart" className="hover:text-[#16a34a] transition-colors">Cart</Link></li>
            <li><Link href="/checkout" className="hover:text-[#16a34a] transition-colors">Checkout</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Contact</h4>
          <ul className="space-y-2 text-sm">
            <li>📧 info@simbasupermarket.rw</li>
            <li>📞 +250 788 000 000</li>
            <li>📍 Kigali, Rwanda</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800 py-4 text-center text-xs text-gray-600">
        © 2026 Simba Supermarket Rwanda. All rights reserved.
      </div>
    </footer>
  );
}
