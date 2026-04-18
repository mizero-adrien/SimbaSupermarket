import Link from 'next/link';
import { Users, MapPin, ShieldCheck, Truck, Heart, Star } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="page-transition">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-[#16a34a] rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#f59e0b] rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-block bg-[#16a34a]/20 border border-[#16a34a]/30 rounded-full px-4 py-1 text-[#4ade80] text-sm font-medium mb-6">
            🇷🇼 About Us
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
            Feeding Kigali with{' '}
            <span className="text-[#16a34a]">Freshness & Pride</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            Simba Supermarket is Rwanda&apos;s premier online grocery store — bringing quality products and reliable delivery to your doorstep.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 px-4 bg-white dark:bg-dark-card">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-light-text dark:text-dark-text mb-6 text-center">Our Story</h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed text-center max-w-3xl mx-auto">
            Founded in Kigali, Simba Supermarket was born out of a simple idea: every Rwandan family deserves fast, affordable access to fresh groceries and daily essentials without leaving home. We started with a small catalog and a big dream — today we offer over 552 products across dozens of categories, all delivered across Kigali.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-4 bg-light-bg dark:bg-dark-bg">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-light-text dark:text-dark-text mb-10 text-center">What We Stand For</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: ShieldCheck, title: 'Quality Guaranteed', desc: 'Every product is verified for freshness and quality before it reaches your basket.', color: '#16a34a' },
              { icon: Truck, title: 'Fast Delivery', desc: 'Same-day delivery across Kigali so your groceries arrive when you need them.', color: '#f59e0b' },
              { icon: Heart, title: 'Community First', desc: 'We partner with local Rwandan farmers and suppliers to support the local economy.', color: '#ef4444' },
              { icon: Star, title: 'Best Prices', desc: 'Competitive pricing on all 552 products, with regular deals and discounts.', color: '#8b5cf6' },
              { icon: Users, title: 'Customer Focused', desc: 'Our team is always ready to help — in English, French, or Kinyarwanda.', color: '#0ea5e9' },
              { icon: MapPin, title: 'Rooted in Rwanda', desc: 'Proudly Kigali-based, we understand the needs of Rwandan households.', color: '#16a34a' },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="bg-white dark:bg-dark-card rounded-card border border-light-border dark:border-dark-border p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: `${color}20` }}>
                  <Icon size={22} style={{ color }} />
                </div>
                <h3 className="font-bold text-light-text dark:text-dark-text mb-2">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-14 px-4 bg-[#16a34a]">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-center text-white">
          {[
            { value: '552+', label: 'Products' },
            { value: '20+', label: 'Categories' },
            { value: '5,000+', label: 'Happy Customers' },
            { value: '1-Day', label: 'Delivery' },
          ].map(({ value, label }) => (
            <div key={label}>
              <div className="text-4xl font-extrabold mb-1">{value}</div>
              <div className="text-green-200 text-sm font-medium">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="py-16 px-4 bg-white dark:bg-dark-card">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-light-text dark:text-dark-text mb-4">Meet Our Team</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-10 max-w-xl mx-auto">
            A passionate group of Rwandans dedicated to making grocery shopping simple, affordable, and enjoyable.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { name: 'Amina Uwimana', role: 'CEO & Co-Founder', emoji: '👩🏾‍💼' },
              { name: 'Jean-Paul Habimana', role: 'Head of Logistics', emoji: '👨🏾‍🔧' },
              { name: 'Grace Mutesi', role: 'Customer Experience', emoji: '👩🏾‍💻' },
            ].map(({ name, role, emoji }) => (
              <div key={name} className="bg-light-bg dark:bg-dark-bg rounded-card border border-light-border dark:border-dark-border p-6">
                <div className="text-5xl mb-3">{emoji}</div>
                <h3 className="font-bold text-light-text dark:text-dark-text">{name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 px-4 bg-light-bg dark:bg-dark-bg text-center">
        <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-4">Ready to start shopping?</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Join thousands of Kigali families who trust Simba Supermarket.</p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold px-8 py-3 rounded-btn transition-colors shadow-lg"
        >
          Shop Now →
        </Link>
      </section>
    </div>
  );
}
