'use client';

import { useState } from 'react';
import {
  Mail, Phone, MapPin, Clock, Send, MessageCircle,
  ChevronDown, CheckCircle2,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const SOCIAL_LINKS = [
  {
    label: 'Facebook',
    href: '#',
    color: '#1877f2',
    path: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z',
  },
  {
    label: 'Instagram',
    href: '#',
    color: '#e1306c',
    path: 'M16 4H8a4 4 0 0 0-4 4v8a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4V8a4 4 0 0 0-4-4zm-4 9a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm4.5-8a1 1 0 1 1 0 2 1 1 0 0 1 0-2z',
  },
  {
    label: 'X / Twitter',
    href: '#',
    color: '#000',
    path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
  },
];

const FAQ_ITEMS = [
  {
    q: 'What are your delivery hours?',
    a: 'We deliver Monday – Saturday, 8 AM – 8 PM. Sunday delivery is available in selected zones. Same-day delivery applies to orders placed before 2 PM.',
  },
  {
    q: 'How do I track my order?',
    a: 'Once your order is confirmed you will receive an SMS with a tracking link. You can also check your order status from the My Orders section in your account.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept Mobile Money (MTN MoMo & Airtel Money), cash on delivery, and major debit/credit cards through our secure payment gateway.',
  },
  {
    q: 'Can I return or exchange a product?',
    a: 'Yes — if a product arrives damaged or is not what you ordered, contact us within 24 hours of delivery and we will arrange a free replacement or full refund.',
  },
  {
    q: 'Do you deliver outside Kigali?',
    a: 'Currently we deliver across Kigali. Expansion to other provinces is underway — follow our social channels for updates.',
  },
];

const CONTACT_INFO = [
  { icon: Phone, label: 'Phone', value: '+250 788 000 000', href: 'tel:+250788000000', color: '#16a34a' },
  { icon: Mail, label: 'Email', value: 'info@simbasupermarket.rw', href: 'mailto:info@simbasupermarket.rw', color: '#6366f1' },
  { icon: MapPin, label: 'Address', value: 'KG 123 St, Kacyiru, Kigali, Rwanda', href: '#map', color: '#f59e0b' },
  { icon: Clock, label: 'Hours', value: 'Mon – Sat: 8 AM – 8 PM', href: null, color: '#ef4444' },
];

export default function ContactPage() {
  const { t } = useLanguage();

  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  function validate() {
    const e: Partial<typeof form> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email is required';
    if (!form.subject.trim()) e.subject = 'Subject is required';
    if (form.message.trim().length < 10) e.message = 'Message must be at least 10 characters';
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSending(true);
    await new Promise(r => setTimeout(r, 1200));
    setSending(false);
    setSent(true);
    setForm({ name: '', email: '', subject: '', message: '' });
  }

  return (
    <div className="page-transition">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white py-12 sm:py-16 md:py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-72 h-72 bg-[#16a34a] rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#f59e0b] rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#16a34a]/20 border border-[#16a34a]/30 rounded-full px-4 py-1 text-[#4ade80] text-sm font-medium mb-6">
            <MessageCircle size={14} />
            {t('We\'d love to hear from you')}
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-5">
            {t('Get in')}{' '}
            <span className="text-[#f59e0b]">{t('Touch')}</span>
          </h1>
          <p className="text-lg text-gray-300 max-w-xl mx-auto">
            {t('Have a question, complaint, or just want to say hello? Our team is ready to help in English, French, or Kinyarwanda.')}
          </p>
        </div>
      </section>

      {/* Contact info cards */}
      <section className="bg-white dark:bg-dark-card border-b border-light-border dark:border-dark-border">
        <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CONTACT_INFO.map(({ icon: Icon, label, value, href, color }) => {
            const inner = (
              <div className="flex items-start gap-4 p-5 rounded-card border border-light-border dark:border-dark-border hover:shadow-md transition-shadow h-full bg-white dark:bg-dark-card">
                <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}18` }}>
                  <Icon size={20} style={{ color }} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{t(label)}</p>
                  <p className="text-sm font-semibold text-light-text dark:text-dark-text leading-snug">{value}</p>
                </div>
              </div>
            );
            return href ? (
              <a key={label} href={href} className="block">
                {inner}
              </a>
            ) : (
              <div key={label}>{inner}</div>
            );
          })}
        </div>
      </section>

      {/* Form + extra info */}
      <section className="py-8 sm:py-14 px-4 bg-light-bg dark:bg-dark-bg">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-10">
          {/* Contact form */}
          <div className="lg:col-span-3">
            <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-1">{t('Send us a message')}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{t('We usually respond within a few hours on business days.')}</p>

            {sent ? (
              <div className="flex flex-col items-center justify-center gap-4 py-16 bg-white dark:bg-dark-card rounded-card border border-light-border dark:border-dark-border text-center px-8">
                <div className="w-16 h-16 rounded-full bg-[#16a34a]/10 flex items-center justify-center">
                  <CheckCircle2 size={36} className="text-[#16a34a]" />
                </div>
                <h3 className="text-xl font-bold text-light-text dark:text-dark-text">{t('Message sent!')}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm">
                  {t('Thank you for reaching out. A member of our team will get back to you as soon as possible.')}
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="mt-2 text-sm font-semibold text-[#16a34a] hover:underline"
                >
                  {t('Send another message')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="bg-white dark:bg-dark-card rounded-card border border-light-border dark:border-dark-border p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field label={t('Your Name')} error={errors.name}>
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Amina Uwimana"
                      className={inputCls(!!errors.name)}
                    />
                  </Field>
                  <Field label={t('Email Address')} error={errors.email}>
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="amina@example.com"
                      className={inputCls(!!errors.email)}
                    />
                  </Field>
                </div>

                <Field label={t('Subject')} error={errors.subject}>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                    placeholder={t('e.g. Delivery issue, Product question...')}
                    className={inputCls(!!errors.subject)}
                  />
                </Field>

                <Field label={t('Message')} error={errors.message}>
                  <textarea
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    rows={5}
                    placeholder={t('Tell us how we can help you...')}
                    className={`${inputCls(!!errors.message)} resize-none`}
                  />
                </Field>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full flex items-center justify-center gap-2 bg-[#16a34a] hover:bg-green-700 text-white font-bold py-3 rounded-btn transition-colors disabled:opacity-60"
                >
                  {sending ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      {t('Sending...')}
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      {t('Send Message')}
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Sidebar info */}
          <div className="lg:col-span-2 space-y-6">
            {/* WhatsApp CTA */}
            <div className="bg-[#16a34a] text-white rounded-card p-6">
              <div className="flex items-center gap-3 mb-3">
                <MessageCircle size={22} />
                <h3 className="font-bold text-lg">{t('Chat on WhatsApp')}</h3>
              </div>
              <p className="text-white/80 text-sm mb-4">
                {t('Prefer a quick chat? Message us directly on WhatsApp for instant support.')}
              </p>
              <a
                href="https://wa.me/250788000000"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-[#16a34a] font-bold px-5 py-2.5 rounded-btn hover:bg-gray-50 transition-colors text-sm"
              >
                <MessageCircle size={15} />
                {t('Open WhatsApp')}
              </a>
            </div>

            {/* Business hours */}
            <div className="bg-white dark:bg-dark-card rounded-card border border-light-border dark:border-dark-border p-6">
              <h3 className="font-bold text-light-text dark:text-dark-text mb-4 flex items-center gap-2">
                <Clock size={16} className="text-[#f59e0b]" />
                {t('Business Hours')}
              </h3>
              <ul className="space-y-2 text-sm">
                {[
                  { day: 'Monday – Friday', hours: '8:00 AM – 8:00 PM' },
                  { day: 'Saturday', hours: '9:00 AM – 7:00 PM' },
                  { day: 'Sunday', hours: '10:00 AM – 5:00 PM' },
                ].map(({ day, hours }) => (
                  <li key={day} className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>{day}</span>
                    <span className="font-semibold text-light-text dark:text-dark-text">{hours}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social links */}
            <div className="bg-white dark:bg-dark-card rounded-card border border-light-border dark:border-dark-border p-6">
              <h3 className="font-bold text-light-text dark:text-dark-text mb-4">{t('Follow Us')}</h3>
              <div className="flex gap-3">
                {SOCIAL_LINKS.map(({ href, label, color, path }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="w-10 h-10 rounded-full border border-light-border dark:border-dark-border flex items-center justify-center text-gray-500 dark:text-gray-400 hover:shadow-md transition-all"
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = color; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = ''; }}
                  >
                    <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" aria-hidden>
                      <path d={path} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section id="map" className="bg-white dark:bg-dark-card">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-6 text-center">{t('Find Us in Kigali')}</h2>
          <div className="rounded-card overflow-hidden border border-light-border dark:border-dark-border shadow-sm">
            <iframe
              title="Simba Supermarket Kigali"
              src="https://www.openstreetmap.org/export/embed.html?bbox=30.04,−1.98,30.12,−1.92&layer=mapnik&marker=-1.9441,30.0619"
              width="100%"
              height="380"
              style={{ border: 0, display: 'block' }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <p className="text-center text-xs text-gray-400 mt-2">
            KG 123 St, Kacyiru, Kigali, Rwanda ·{' '}
            <a
              href="https://www.openstreetmap.org/?mlat=-1.9441&mlon=30.0619#map=15/-1.9441/30.0619"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#16a34a] hover:underline"
            >
              {t('Open in maps')}
            </a>
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14 px-4 bg-light-bg dark:bg-dark-bg">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-2 text-center">{t('Frequently Asked Questions')}</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm text-center mb-8">{t('Answers to common questions about shopping with Simba Supermarket.')}</p>
          <div className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} className="bg-white dark:bg-dark-card rounded-card border border-light-border dark:border-dark-border overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left gap-3"
                  aria-expanded={openFaq === i}
                >
                  <span className="text-sm font-semibold text-light-text dark:text-dark-text">{t(item.q)}</span>
                  <ChevronDown
                    size={16}
                    className={`shrink-0 text-gray-400 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed border-t border-light-border dark:border-dark-border pt-3">
                    {t(item.a)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function inputCls(hasError: boolean) {
  return `w-full px-3 py-2.5 text-sm border rounded-btn bg-white dark:bg-dark-bg text-light-text dark:text-dark-text placeholder-gray-400 focus:outline-none transition-colors ${
    hasError
      ? 'border-red-400 focus:border-red-500'
      : 'border-light-border dark:border-dark-border focus:border-[#16a34a]'
  }`;
}
