'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle, Truck, CreditCard, Phone, Smartphone, Banknote, Loader2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatPrice } from '@/lib/formatPrice';
import { getProductImage } from '@/lib/products';

const DELIVERY_FEE_STANDARD = 2000;
const EXPRESS_FEE = 3000;
const FREE_DELIVERY_THRESHOLD = 50000;
const DISTRICTS = ['Gasabo', 'Kicukiro', 'Nyarugenge', 'Other'];

interface DeliveryForm {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  district: string;
  deliveryType: 'standard' | 'express';
  notes: string;
}

interface Errors {
  [key: string]: string;
}

type PaymentMethod = 'mtn' | 'airtel' | 'cod';

const steps = [
  { id: 1, label: 'Delivery', icon: Truck },
  { id: 2, label: 'Payment', icon: CreditCard },
  { id: 3, label: 'Confirmation', icon: CheckCircle },
];

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, i) => {
        const Icon = step.icon;
        const isCompleted = currentStep > step.id;
        const isActive = currentStep === step.id;
        return (
          <div key={step.id} className="flex items-center">
            <div className={`flex flex-col items-center`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                isCompleted ? 'bg-[#16a34a] text-white' :
                isActive ? 'bg-[#f59e0b] text-white' :
                'bg-gray-200 dark:bg-slate-700 text-gray-400'
              }`}>
                {isCompleted ? <CheckCircle size={18} /> : <Icon size={18} />}
              </div>
              <span className={`text-xs font-medium mt-1 ${isActive ? 'text-[#f59e0b]' : isCompleted ? 'text-[#16a34a]' : 'text-gray-400'}`}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-16 sm:w-24 h-0.5 mx-2 mb-4 ${currentStep > step.id ? 'bg-[#16a34a]' : 'bg-gray-200 dark:bg-slate-700'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mtn');
  const [momoPhone, setMomoPhone] = useState('');
  const [placing, setPlacing] = useState(false);
  const [orderId] = useState(() => `SB-${Math.floor(100000 + Math.random() * 900000)}`);

  const [form, setForm] = useState<DeliveryForm>({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    district: 'Gasabo',
    deliveryType: 'standard',
    notes: '',
  });
  const [errors, setErrors] = useState<Errors>({});

  const deliveryFee = (() => {
    if (form.deliveryType === 'express') return EXPRESS_FEE;
    return totalPrice >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE_STANDARD;
  })();
  const grandTotal = totalPrice + deliveryFee;

  function validateDelivery(): boolean {
    const errs: Errors = {};
    if (form.fullName.trim().length < 3) errs.fullName = 'Full name must be at least 3 characters';
    if (!/^\+?250\d{9}$/.test(form.phone.replace(/\s/g, ''))) {
      errs.phone = 'Enter a valid Rwandan phone number (+250 followed by 9 digits)';
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Enter a valid email address';
    }
    if (form.address.trim().length < 8) errs.address = 'Address must be at least 8 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleDeliverySubmit() {
    if (validateDelivery()) setStep(2);
  }

  async function handlePlaceOrder() {
    setPlacing(true);
    await new Promise(r => setTimeout(r, 2000));
    clearCart();
    setStep(3);
    setPlacing(false);
  }

  const OrderSummaryWidget = () => (
    <div className="bg-white dark:bg-dark-card rounded-card border border-light-border dark:border-dark-border p-4">
      <h3 className="font-bold text-sm text-light-text dark:text-dark-text mb-3">{t('Order Summary')}</h3>
      <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
        {items.map(({ product, quantity }) => (
          <div key={product.id} className="flex items-center gap-2 text-xs">
            <div className="relative w-8 h-8 rounded bg-gray-100 dark:bg-slate-700 overflow-hidden shrink-0">
              <Image src={getProductImage(product)} alt={product.name} fill className="object-cover" sizes="32px" />
            </div>
            <span className="flex-1 line-clamp-1 text-gray-600 dark:text-gray-400">{product.name} ×{quantity}</span>
            <span className="font-medium text-light-text dark:text-dark-text shrink-0">{formatPrice(product.price * quantity)}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-light-border dark:border-dark-border pt-2 space-y-1 text-xs">
        <div className="flex justify-between text-gray-500">
          <span>Subtotal</span><span>{formatPrice(totalPrice)}</span>
        </div>
        <div className="flex justify-between text-gray-500">
          <span>{t('Delivery')}</span>
          <span>{deliveryFee === 0 ? t('Free') : formatPrice(deliveryFee)}</span>
        </div>
        <div className="flex justify-between font-bold text-sm text-light-text dark:text-dark-text pt-1">
          <span>{t('Total')}</span><span className="text-[#f59e0b]">{formatPrice(grandTotal)}</span>
        </div>
      </div>
    </div>
  );

  if (items.length === 0 && step !== 3) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex flex-col items-center justify-center gap-4 px-4">
        <div className="text-5xl">🛒</div>
        <h2 className="text-xl font-bold text-light-text dark:text-dark-text">Your cart is empty</h2>
        <Link href="/products" className="bg-[#f59e0b] text-white font-bold px-6 py-2 rounded-btn hover:bg-[#d97706] transition-colors">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg page-transition">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-light-text dark:text-dark-text mb-6 text-center">{t('Checkout')}</h1>
        <StepIndicator currentStep={step} />

        {/* Step 1: Delivery */}
        {step === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-dark-card rounded-card border border-light-border dark:border-dark-border p-6">
                <h2 className="text-lg font-bold text-light-text dark:text-dark-text mb-5 flex items-center gap-2">
                  <Truck size={18} className="text-[#16a34a]" /> {t('Delivery')} Details
                </h2>

                <div className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.fullName}
                      onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                      placeholder="e.g. Jean Pierre Uwimana"
                      className={`w-full px-3 py-2.5 text-sm border rounded-btn bg-white dark:bg-dark-card text-light-text dark:text-dark-text focus:outline-none focus:border-[#16a34a] ${errors.fullName ? 'border-red-500' : 'border-light-border dark:border-dark-border'}`}
                    />
                    {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="+250 7XX XXX XXX"
                      className={`w-full px-3 py-2.5 text-sm border rounded-btn bg-white dark:bg-dark-card text-light-text dark:text-dark-text focus:outline-none focus:border-[#16a34a] ${errors.phone ? 'border-red-500' : 'border-light-border dark:border-dark-border'}`}
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">
                      Email Address <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="you@example.com"
                      className={`w-full px-3 py-2.5 text-sm border rounded-btn bg-white dark:bg-dark-card text-light-text dark:text-dark-text focus:outline-none focus:border-[#16a34a] ${errors.email ? 'border-red-500' : 'border-light-border dark:border-dark-border'}`}
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">
                      Delivery Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.address}
                      onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                      placeholder="e.g. KG 5 Ave, Kacyiru, Kigali"
                      className={`w-full px-3 py-2.5 text-sm border rounded-btn bg-white dark:bg-dark-card text-light-text dark:text-dark-text focus:outline-none focus:border-[#16a34a] ${errors.address ? 'border-red-500' : 'border-light-border dark:border-dark-border'}`}
                    />
                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                  </div>

                  {/* District */}
                  <div>
                    <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">District</label>
                    <select
                      value={form.district}
                      onChange={e => setForm(f => ({ ...f, district: e.target.value }))}
                      className="w-full px-3 py-2.5 text-sm border border-light-border dark:border-dark-border rounded-btn bg-white dark:bg-dark-card text-light-text dark:text-dark-text focus:outline-none focus:border-[#16a34a]"
                    >
                      {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  {/* Delivery type */}
                  <div>
                    <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">Delivery Time</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label className={`flex items-start gap-3 p-3 rounded-card border cursor-pointer transition-colors ${form.deliveryType === 'standard' ? 'border-[#16a34a] bg-[#16a34a]/5' : 'border-light-border dark:border-dark-border'}`}>
                        <input type="radio" name="delivery" value="standard" checked={form.deliveryType === 'standard'} onChange={() => setForm(f => ({ ...f, deliveryType: 'standard' }))} className="mt-0.5 accent-[#16a34a]" />
                        <div>
                          <p className="text-sm font-semibold text-light-text dark:text-dark-text">Standard (1-2 days)</p>
                          <p className="text-xs text-gray-500">{totalPrice >= FREE_DELIVERY_THRESHOLD ? 'Free delivery' : `${formatPrice(DELIVERY_FEE_STANDARD)} — Free over 50k`}</p>
                        </div>
                      </label>
                      <label className={`flex items-start gap-3 p-3 rounded-card border cursor-pointer transition-colors ${form.deliveryType === 'express' ? 'border-[#f59e0b] bg-[#f59e0b]/5' : 'border-light-border dark:border-dark-border'}`}>
                        <input type="radio" name="delivery" value="express" checked={form.deliveryType === 'express'} onChange={() => setForm(f => ({ ...f, deliveryType: 'express' }))} className="mt-0.5 accent-[#f59e0b]" />
                        <div>
                          <p className="text-sm font-semibold text-light-text dark:text-dark-text">Express (same day)</p>
                          <p className="text-xs text-gray-500">+{formatPrice(EXPRESS_FEE)} extra</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">
                      Additional Notes <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <textarea
                      value={form.notes}
                      onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                      placeholder="Any special delivery instructions..."
                      rows={3}
                      className="w-full px-3 py-2.5 text-sm border border-light-border dark:border-dark-border rounded-btn bg-white dark:bg-dark-card text-light-text dark:text-dark-text focus:outline-none focus:border-[#16a34a] resize-none"
                    />
                  </div>

                  <button
                    onClick={handleDeliverySubmit}
                    className="w-full bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold py-3 rounded-btn transition-colors mt-2"
                  >
                    Continue to Payment →
                  </button>
                </div>
              </div>
            </div>
            <div className="lg:col-span-1">
              <OrderSummaryWidget />
            </div>
          </div>
        )}

        {/* Step 2: Payment */}
        {step === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-dark-card rounded-card border border-light-border dark:border-dark-border p-6">
                <h2 className="text-lg font-bold text-light-text dark:text-dark-text mb-5 flex items-center gap-2">
                  <CreditCard size={18} className="text-[#16a34a]" /> Payment Method
                </h2>

                <div className="space-y-3 mb-6">
                  {/* MTN MoMo */}
                  <label className={`flex items-start gap-3 p-4 rounded-card border cursor-pointer transition-colors ${paymentMethod === 'mtn' ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/10' : 'border-light-border dark:border-dark-border'}`}>
                    <input type="radio" name="payment" value="mtn" checked={paymentMethod === 'mtn'} onChange={() => setPaymentMethod('mtn')} className="mt-1 accent-yellow-500" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Smartphone size={16} className="text-yellow-500" />
                        <p className="font-semibold text-sm text-light-text dark:text-dark-text">MTN Mobile Money</p>
                      </div>
                      {paymentMethod === 'mtn' && (
                        <div className="mt-3 space-y-3">
                          <input
                            type="tel"
                            value={momoPhone}
                            onChange={e => setMomoPhone(e.target.value)}
                            placeholder="MoMo number: +250 7XX XXX XXX"
                            className="w-full px-3 py-2 text-sm border border-light-border dark:border-dark-border rounded-btn bg-white dark:bg-dark-card text-light-text dark:text-dark-text focus:outline-none focus:border-yellow-400"
                          />
                          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-btn p-3 text-xs text-yellow-800 dark:text-yellow-300">
                            📱 After clicking <strong>Place Order</strong>, you will receive a USSD prompt on your phone. Enter your MoMo PIN to complete payment.
                          </div>
                        </div>
                      )}
                    </div>
                  </label>

                  {/* Airtel Money */}
                  <label className={`flex items-start gap-3 p-4 rounded-card border cursor-pointer transition-colors ${paymentMethod === 'airtel' ? 'border-red-400 bg-red-50 dark:bg-red-900/10' : 'border-light-border dark:border-dark-border'}`}>
                    <input type="radio" name="payment" value="airtel" checked={paymentMethod === 'airtel'} onChange={() => setPaymentMethod('airtel')} className="mt-1 accent-red-500" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Phone size={16} className="text-red-500" />
                        <p className="font-semibold text-sm text-light-text dark:text-dark-text">Airtel Money</p>
                      </div>
                      {paymentMethod === 'airtel' && (
                        <div className="mt-3 space-y-3">
                          <input
                            type="tel"
                            value={momoPhone}
                            onChange={e => setMomoPhone(e.target.value)}
                            placeholder="Airtel number: +250 7XX XXX XXX"
                            className="w-full px-3 py-2 text-sm border border-light-border dark:border-dark-border rounded-btn bg-white dark:bg-dark-card text-light-text dark:text-dark-text focus:outline-none focus:border-red-400"
                          />
                          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-btn p-3 text-xs text-red-800 dark:text-red-300">
                            📱 After clicking <strong>Place Order</strong>, you will receive a prompt on your phone. Enter your Airtel Money PIN to complete payment.
                          </div>
                        </div>
                      )}
                    </div>
                  </label>

                  {/* Cash on Delivery */}
                  <label className={`flex items-start gap-3 p-4 rounded-card border cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-[#16a34a] bg-[#16a34a]/5' : 'border-light-border dark:border-dark-border'}`}>
                    <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="mt-1 accent-[#16a34a]" />
                    <div>
                      <div className="flex items-center gap-2">
                        <Banknote size={16} className="text-[#16a34a]" />
                        <p className="font-semibold text-sm text-light-text dark:text-dark-text">Cash on Delivery</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Pay when your order arrives at your door.</p>
                    </div>
                  </label>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="px-4 py-3 border border-light-border dark:border-dark-border rounded-btn text-sm font-medium text-light-text dark:text-dark-text hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={placing}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#f59e0b] hover:bg-[#d97706] disabled:opacity-70 text-white font-bold py-3 rounded-btn transition-colors"
                  >
                    {placing ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>{t('Place Order')} — {formatPrice(grandTotal)}</>
                    )}
                  </button>
                </div>
              </div>
            </div>
            <div className="lg:col-span-1">
              <OrderSummaryWidget />
              <div className="mt-3 bg-white dark:bg-dark-card rounded-card border border-light-border dark:border-dark-border p-4 text-xs text-gray-500">
                <p className="font-semibold text-light-text dark:text-dark-text mb-1">Delivery to:</p>
                <p>{form.fullName}</p>
                <p>{form.address}, {form.district}</p>
                <p>{form.phone}</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="max-w-lg mx-auto text-center">
            <div className="bg-white dark:bg-dark-card rounded-card border border-light-border dark:border-dark-border p-8">
              <div className="flex items-center justify-center mb-6">
                <div className="w-20 h-20 bg-[#16a34a] rounded-full flex items-center justify-center">
                  <svg viewBox="0 0 52 52" className="w-12 h-12">
                    <circle cx="26" cy="26" r="25" fill="none" stroke="white" strokeWidth="2" opacity="0.3" />
                    <path
                      fill="none"
                      stroke="white"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="animate-checkmark"
                      d="M14 27l8 8 16-16"
                    />
                  </svg>
                </div>
              </div>

              <h2 className="text-2xl font-extrabold text-light-text dark:text-dark-text mb-2">
                Order Placed Successfully! 🎉
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                Thank you for your order. We&apos;ll confirm shortly.
              </p>

              <div className="bg-gray-50 dark:bg-slate-800 rounded-card p-4 mb-6 text-left space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Order Number</span>
                  <span className="font-bold text-[#16a34a]">#{orderId}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Delivery</span>
                  <span className="font-medium text-light-text dark:text-dark-text">
                    {form.deliveryType === 'express' ? 'Same day' : '1-2 business days'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Payment</span>
                  <span className="font-medium text-light-text dark:text-dark-text capitalize">
                    {paymentMethod === 'mtn' ? 'MTN MoMo' : paymentMethod === 'airtel' ? 'Airtel Money' : 'Cash on Delivery'}
                  </span>
                </div>
                <div className="flex justify-between text-sm border-t border-light-border dark:border-dark-border pt-2">
                  <span className="font-bold text-light-text dark:text-dark-text">{t('Total')}</span>
                  <span className="font-extrabold text-[#f59e0b]">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/"
                  className="flex-1 bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold py-3 rounded-btn transition-colors text-center"
                >
                  {t('Continue Shopping')}
                </Link>
                <button className="flex-1 border border-light-border dark:border-dark-border text-light-text dark:text-dark-text font-semibold py-3 rounded-btn hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                  Track Order
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
