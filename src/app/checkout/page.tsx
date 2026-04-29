'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  CheckCircle,
  Truck,
  CreditCard,
  Phone,
  Smartphone,
  Banknote,
  Loader2,
  Store,
  Clock3,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatPrice } from '@/lib/formatPrice';
import { getProductImage } from '@/lib/products';
import { getDepositRequirement } from '@/lib/reviewData';
import { getAllBranches } from '@/lib/branches';
import { getBranchOrders, saveBranchOrders, decrementStockForOrder } from '@/lib/dashboardData';
import { BranchOrder } from '@/types';

const DELIVERY_FEE_STANDARD = 2000;
const EXPRESS_FEE = 3000;
const FREE_DELIVERY_THRESHOLD = 50000;
const DISTRICTS = ['Gasabo', 'Kicukiro', 'Nyarugenge', 'Other'];
const PICKUP_SLOTS = ['08:00 - 10:00', '10:00 - 12:00', '12:00 - 14:00', '14:00 - 16:00', '16:00 - 18:00'];

interface CheckoutForm {
  fullName: string;
  phone: string;
  email: string;
  fulfillmentMethod: 'pickup' | 'delivery';
  branchId: string;
  pickupDate: string;
  pickupSlot: string;
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
  { id: 1, label: 'Details', icon: Truck },
  { id: 2, label: 'Payment', icon: CreditCard },
  { id: 3, label: 'Confirmation', icon: CheckCircle },
];

function StepIndicator({ currentStep, labels }: { currentStep: number; labels: Record<number, string> }) {
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, i) => {
        const Icon = step.icon;
        const isCompleted = currentStep > step.id;
        const isActive = currentStep === step.id;
        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  isCompleted
                    ? 'bg-[#16a34a] text-white'
                    : isActive
                      ? 'bg-[#f59e0b] text-white'
                      : 'bg-gray-200 dark:bg-slate-700 text-gray-400'
                }`}
              >
                {isCompleted ? <CheckCircle size={18} /> : <Icon size={18} />}
              </div>
              <span
                className={`text-xs font-medium mt-1 ${
                  isActive ? 'text-[#f59e0b]' : isCompleted ? 'text-[#16a34a]' : 'text-gray-400'
                }`}
              >
                {labels[step.id]}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-16 sm:w-24 h-0.5 mx-2 mb-4 ${
                  currentStep > step.id ? 'bg-[#16a34a]' : 'bg-gray-200 dark:bg-slate-700'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { t, language } = useLanguage();
  const branches = useMemo(() => getAllBranches().filter(branch => branch.isOpen), []);

  const tr = (en: string, fr: string, rw: string) =>
    language === 'fr' ? fr : language === 'rw' ? rw : en;

  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mtn');
  const [momoPhone, setMomoPhone] = useState('');
  const [placing, setPlacing] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [orderId] = useState(() => `SB-${Math.floor(100000 + Math.random() * 900000)}`);

  const [form, setForm] = useState<CheckoutForm>({
    fullName: '',
    phone: '',
    email: '',
    fulfillmentMethod: 'pickup',
    branchId: '',
    pickupDate: '',
    pickupSlot: '',
    address: '',
    district: 'Gasabo',
    deliveryType: 'standard',
    notes: '',
  });
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (!form.branchId && branches.length > 0) {
      setForm(prev => ({ ...prev, branchId: branches[0].id }));
    }
  }, [branches, form.branchId]);

  const deliveryFee = (() => {
    if (form.fulfillmentMethod === 'pickup') return 0;
    if (form.deliveryType === 'express') return EXPRESS_FEE;
    return totalPrice >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE_STANDARD;
  })();

  const grandTotal = totalPrice + deliveryFee;
  const depositRequirement = getDepositRequirement(form.phone);
  const payableNow = form.fulfillmentMethod === 'pickup' ? depositRequirement.amount : grandTotal;
  const selectedBranch = branches.find(branch => branch.id === form.branchId);

  function validateDetails(): boolean {
    const errs: Errors = {};

    if (form.fullName.trim().length < 3) errs.fullName = tr('Full name must be at least 3 characters', 'Le nom complet doit contenir au moins 3 caractères', 'Amazina yuzuye agomba kuba nibura inyuguti 3');
    if (!/^\+?250\d{9}$/.test(form.phone.replace(/\s/g, ''))) {
      errs.phone = tr('Enter a valid Rwandan phone number (+250 followed by 9 digits)', 'Entrez un numéro rwandais valide (+250 suivi de 9 chiffres)', 'Andika nimero yo mu Rwanda yemewe (+250 ikurikiwe n\'imibare 9)');
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = tr('Enter a valid email address', 'Entrez une adresse e-mail valide', 'Andika imeli yemewe');
    }

    if (!form.branchId) errs.branchId = tr('Please select a branch', 'Veuillez sélectionner une succursale', 'Hitamo ishami');

    if (form.fulfillmentMethod === 'pickup') {
      if (!form.pickupDate) errs.pickupDate = tr('Pick-up date is required', 'La date de retrait est requise', 'Itariki yo gufata irakenewe');
      if (!form.pickupSlot) errs.pickupSlot = tr('Pick-up time is required', 'L\'heure de retrait est requise', 'Igihe cyo gufata kirakenewe');
    }

    if (form.fulfillmentMethod === 'delivery' && form.address.trim().length < 8) {
      errs.address = tr('Address must be at least 8 characters', 'L\'adresse doit contenir au moins 8 caractères', 'Aderesi igomba kuba nibura inyuguti 8');
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleDetailsSubmit() {
    if (validateDetails()) setStep(2);
  }

  async function handlePlaceOrder() {
    setPaymentError('');

    if (form.fulfillmentMethod === 'pickup' && paymentMethod === 'cod') {
      setPaymentError(tr('Pick-up orders require MoMo deposit payment at checkout.', 'Les retraits exigent le paiement d\'un acompte MoMo au paiement.', 'Itegeko ryo gufata risaba kwishyura ubwishyu bw\'ibanze bwa MoMo kuri checkout.'));
      return;
    }

    if ((paymentMethod === 'mtn' || paymentMethod === 'airtel') && !momoPhone.trim()) {
      setPaymentError(tr('Enter your MoMo phone number to continue.', 'Entrez votre numéro MoMo pour continuer.', 'Andika nimero yawe ya MoMo kugira ngo ukomeze.'));
      return;
    }

    if (!form.branchId) {
      setPaymentError(tr('Select a branch before placing order.', 'Sélectionnez une succursale avant de passer commande.', 'Hitamo ishami mbere yo kohereza itegeko.'));
      return;
    }

    setPlacing(true);

    const previousOrders = getBranchOrders(form.branchId);
    const customerKey = form.phone.replace(/\D+/g, '').slice(-9) || Date.now().toString();
    const orderNote = form.fulfillmentMethod === 'pickup'
      ? `Pickup: ${form.pickupDate} ${form.pickupSlot}${form.notes ? ` | ${form.notes}` : ''}`
      : form.notes;

    const nextOrder: BranchOrder = {
      id: orderId,
      branchId: form.branchId,
      customerId: `guest-${customerKey}`,
      customerName: form.fullName,
      customerPhone: form.phone,
      customerEmail: form.email || undefined,
      items,
      total: grandTotal,
      deliveryFee,
      status: 'pending',
      paymentMethod: paymentMethod === 'mtn' ? 'MTN MoMo' : paymentMethod === 'airtel' ? 'Airtel Money' : 'Cash',
      deliveryType: form.fulfillmentMethod,
      address: form.fulfillmentMethod === 'pickup' ? selectedBranch?.address ?? 'Branch Pickup' : form.address,
      notes: orderNote || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveBranchOrders(form.branchId, [nextOrder, ...previousOrders]);
    decrementStockForOrder(form.branchId, items);

    await new Promise(resolve => setTimeout(resolve, 2000));
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
            <span className="flex-1 line-clamp-1 text-gray-600 dark:text-gray-400">{product.name} x{quantity}</span>
            <span className="font-medium text-light-text dark:text-dark-text shrink-0">{formatPrice(product.price * quantity)}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-light-border dark:border-dark-border pt-2 space-y-1 text-xs">
        <div className="flex justify-between text-gray-500">
          <span>{tr('Subtotal', 'Sous-total', 'Igiteranyo cya mbere')}</span><span>{formatPrice(totalPrice)}</span>
        </div>
        <div className="flex justify-between text-gray-500">
          <span>{form.fulfillmentMethod === 'pickup' ? tr('Pickup Fee', 'Frais de retrait', 'Amafaranga yo gufata') : t('Delivery')}</span>
          <span>{deliveryFee === 0 ? t('Free') : formatPrice(deliveryFee)}</span>
        </div>
        <div className="flex justify-between font-bold text-sm text-light-text dark:text-dark-text pt-1">
          <span>{t('Total')}</span><span className="text-[#f59e0b]">{formatPrice(grandTotal)}</span>
        </div>
      </div>
      <div className="mt-3 rounded-btn border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-600 dark:text-slate-300">
        <p className="font-semibold text-light-text dark:text-dark-text">{tr('Deposit requirement', 'Exigence d\'acompte', 'Ibisabwa by\'ubwishyu bw\'ibanze')}</p>
        <p>
          {formatPrice(depositRequirement.amount)} {tr('refundable deposit', 'acompte remboursable', 'ubwishyu bw\'ibanze busubizwa')}
          {depositRequirement.flagCount > 0
            ? tr(
              ` based on ${depositRequirement.flagCount} no-show flag${depositRequirement.flagCount > 1 ? 's' : ''}`,
              ` selon ${depositRequirement.flagCount} signalement${depositRequirement.flagCount > 1 ? 's' : ''} d'absence`,
              ` bitewe n'ibimenyetso ${depositRequirement.flagCount} byo kutaza`
            )
            : ''}
          .
        </p>
      </div>
      <div className="mt-2 rounded-btn border border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
        <p className="font-semibold">{tr('Payable now', 'À payer maintenant', 'Bigomba kwishyurwa ubu')}</p>
        <p>{formatPrice(payableNow)} {form.fulfillmentMethod === 'pickup' ? tr('deposit', 'acompte', 'ubwishyu bw\'ibanze') : tr('total payment', 'paiement total', 'ubwishyu bwose')}.</p>
      </div>
    </div>
  );

  if (items.length === 0 && step !== 3) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex flex-col items-center justify-center gap-4 px-4">
        <div className="text-5xl">🛒</div>
        <h2 className="text-xl font-bold text-light-text dark:text-dark-text">{tr('Your cart is empty', 'Votre panier est vide', 'Igitebo cyawe kirimo ubusa')}</h2>
        <Link href="/products" className="bg-[#f59e0b] text-white font-bold px-6 py-2 rounded-btn hover:bg-[#d97706] transition-colors">
          {tr('Start Shopping', 'Commencer vos achats', 'Tangira guhaha')}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg page-transition">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-light-text dark:text-dark-text mb-6 text-center">{t('Checkout')}</h1>
        <StepIndicator
          currentStep={step}
          labels={{
            1: tr('Details', 'Détails', 'Ibisobanuro'),
            2: tr('Payment', 'Paiement', 'Kwishyura'),
            3: tr('Confirmation', 'Confirmation', 'Kwemeza'),
          }}
        />

        {step === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-dark-card rounded-card border border-light-border dark:border-dark-border p-6">
                <h2 className="text-lg font-bold text-light-text dark:text-dark-text mb-5 flex items-center gap-2">
                  <Truck size={18} className="text-[#16a34a]" /> {tr('Checkout Details (Pick-up First)', 'Détails de paiement (Retrait d\'abord)', 'Ibisobanuro bya checkout (Fata mbere)')}
                </h2>

                <div className="mb-4 p-3 rounded-btn border border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-900/20 text-xs text-amber-700 dark:text-amber-300">
                  {tr('Simba checkout is pick-up first: choose your branch and time, pay a small refundable deposit, and your branch starts preparing immediately.', 'Le checkout Simba commence par le retrait : choisissez la succursale et l\'heure, payez un petit acompte remboursable et la préparation démarre immédiatement.', 'Checkout ya Simba itangirana no gufata: hitamo ishami n\'igihe, wishyure ubwishyu bw\'ibanze busubizwa kandi ishami ritangire gutegura ako kanya.')}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">{tr('Full Name', 'Nom complet', 'Amazina yuzuye')} <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={form.fullName}
                      onChange={e => setForm(prev => ({ ...prev, fullName: e.target.value }))}
                      placeholder="e.g. Jean Pierre Uwimana"
                      className={`w-full px-3 py-2.5 text-sm border rounded-btn bg-white dark:bg-dark-card text-light-text dark:text-dark-text focus:outline-none focus:border-[#16a34a] ${errors.fullName ? 'border-red-500' : 'border-light-border dark:border-dark-border'}`}
                    />
                    {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">{tr('Phone Number', 'Numéro de téléphone', 'Nimero ya telefoni')} <span className="text-red-500">*</span></label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+250 7XX XXX XXX"
                      className={`w-full px-3 py-2.5 text-sm border rounded-btn bg-white dark:bg-dark-card text-light-text dark:text-dark-text focus:outline-none focus:border-[#16a34a] ${errors.phone ? 'border-red-500' : 'border-light-border dark:border-dark-border'}`}
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    <p className="text-xs text-gray-500 mt-1">
                      {tr('Deposit today:', 'Acompte aujourd\'hui :', 'Ubwishyu bw\'ibanze uyu munsi:')} <span className="font-semibold text-[#f59e0b]">{formatPrice(depositRequirement.amount)}</span>
                      {depositRequirement.flagCount > 0
                        ? tr(
                          ` for ${depositRequirement.flagCount} no-show flag${depositRequirement.flagCount > 1 ? 's' : ''}`,
                          ` pour ${depositRequirement.flagCount} signalement${depositRequirement.flagCount > 1 ? 's' : ''} d'absence`,
                          ` ku bimenyetso ${depositRequirement.flagCount} byo kutaza`
                        )
                        : ''}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">{tr('Email Address', 'Adresse e-mail', 'Aderesi ya imeli')} <span className="text-gray-400 font-normal">({tr('optional', 'optionnel', 'si ngombwa')})</span></label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="you@example.com"
                      className={`w-full px-3 py-2.5 text-sm border rounded-btn bg-white dark:bg-dark-card text-light-text dark:text-dark-text focus:outline-none focus:border-[#16a34a] ${errors.email ? 'border-red-500' : 'border-light-border dark:border-dark-border'}`}
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">{tr('Fulfillment method', 'Mode de réception', 'Uburyo bwo kwakira')}</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label className={`flex items-start gap-3 p-3 rounded-card border cursor-pointer transition-colors ${form.fulfillmentMethod === 'pickup' ? 'border-[#f59e0b] bg-[#f59e0b]/5' : 'border-light-border dark:border-dark-border'}`}>
                        <input type="radio" checked={form.fulfillmentMethod === 'pickup'} onChange={() => setForm(prev => ({ ...prev, fulfillmentMethod: 'pickup' }))} className="mt-0.5 accent-[#f59e0b]" />
                        <div>
                          <p className="text-sm font-semibold text-light-text dark:text-dark-text">{tr('Pick-up (Recommended)', 'Retrait (Recommandé)', 'Fata (Byiza)')}</p>
                          <p className="text-xs text-gray-500">{tr('Faster prep and branch collection', 'Préparation plus rapide et retrait en succursale', 'Gutegura vuba no gufatira ku ishami')}</p>
                        </div>
                      </label>
                      <label className={`flex items-start gap-3 p-3 rounded-card border cursor-pointer transition-colors ${form.fulfillmentMethod === 'delivery' ? 'border-[#16a34a] bg-[#16a34a]/5' : 'border-light-border dark:border-dark-border'}`}>
                        <input type="radio" checked={form.fulfillmentMethod === 'delivery'} onChange={() => setForm(prev => ({ ...prev, fulfillmentMethod: 'delivery' }))} className="mt-0.5 accent-[#16a34a]" />
                        <div>
                          <p className="text-sm font-semibold text-light-text dark:text-dark-text">{t('Delivery')}</p>
                          <p className="text-xs text-gray-500">{tr('Home delivery option', 'Option de livraison à domicile', 'Uburyo bwo kugeza mu rugo')}</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">{tr('Pick-up branch', 'Succursale de retrait', 'Ishami ryo gufatiraho')} <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Store size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <select
                        value={form.branchId}
                        onChange={e => setForm(prev => ({ ...prev, branchId: e.target.value }))}
                        className={`w-full pl-9 pr-3 py-2.5 text-sm border rounded-btn bg-white dark:bg-dark-card text-light-text dark:text-dark-text focus:outline-none focus:border-[#16a34a] ${errors.branchId ? 'border-red-500' : 'border-light-border dark:border-dark-border'}`}
                      >
                        <option value="">{tr('Select a branch', 'Choisir une succursale', 'Hitamo ishami')}</option>
                        {branches.map(branch => (
                          <option key={branch.id} value={branch.id}>{branch.name} - {branch.location}</option>
                        ))}
                      </select>
                    </div>
                    {errors.branchId && <p className="text-red-500 text-xs mt-1">{errors.branchId}</p>}
                  </div>

                  {form.fulfillmentMethod === 'pickup' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">{tr('Pick-up date', 'Date de retrait', 'Itariki yo gufata')} <span className="text-red-500">*</span></label>
                        <input
                          type="date"
                          value={form.pickupDate}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={e => setForm(prev => ({ ...prev, pickupDate: e.target.value }))}
                          className={`w-full px-3 py-2.5 text-sm border rounded-btn bg-white dark:bg-dark-card text-light-text dark:text-dark-text focus:outline-none focus:border-[#16a34a] ${errors.pickupDate ? 'border-red-500' : 'border-light-border dark:border-dark-border'}`}
                        />
                        {errors.pickupDate && <p className="text-red-500 text-xs mt-1">{errors.pickupDate}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">{tr('Pick-up slot', 'Créneau de retrait', 'Igihe cyo gufata')} <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <Clock3 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <select
                            value={form.pickupSlot}
                            onChange={e => setForm(prev => ({ ...prev, pickupSlot: e.target.value }))}
                            className={`w-full pl-9 pr-3 py-2.5 text-sm border rounded-btn bg-white dark:bg-dark-card text-light-text dark:text-dark-text focus:outline-none focus:border-[#16a34a] ${errors.pickupSlot ? 'border-red-500' : 'border-light-border dark:border-dark-border'}`}
                          >
                            <option value="">{tr('Select time', 'Choisir une heure', 'Hitamo igihe')}</option>
                            {PICKUP_SLOTS.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                          </select>
                        </div>
                        {errors.pickupSlot && <p className="text-red-500 text-xs mt-1">{errors.pickupSlot}</p>}
                      </div>
                    </div>
                  )}

                  {form.fulfillmentMethod === 'delivery' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">{tr('Delivery Address', 'Adresse de livraison', 'Aderesi yo kugezaho')} <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={form.address}
                          onChange={e => setForm(prev => ({ ...prev, address: e.target.value }))}
                          placeholder="e.g. KG 5 Ave, Kacyiru, Kigali"
                          className={`w-full px-3 py-2.5 text-sm border rounded-btn bg-white dark:bg-dark-card text-light-text dark:text-dark-text focus:outline-none focus:border-[#16a34a] ${errors.address ? 'border-red-500' : 'border-light-border dark:border-dark-border'}`}
                        />
                        {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">{tr('District', 'District', 'Akarere')}</label>
                        <select
                          value={form.district}
                          onChange={e => setForm(prev => ({ ...prev, district: e.target.value }))}
                          className="w-full px-3 py-2.5 text-sm border border-light-border dark:border-dark-border rounded-btn bg-white dark:bg-dark-card text-light-text dark:text-dark-text focus:outline-none focus:border-[#16a34a]"
                        >
                          {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">{tr('Delivery Time', 'Délai de livraison', 'Igihe cyo kugeza')}</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <label className={`flex items-start gap-3 p-3 rounded-card border cursor-pointer transition-colors ${form.deliveryType === 'standard' ? 'border-[#16a34a] bg-[#16a34a]/5' : 'border-light-border dark:border-dark-border'}`}>
                            <input type="radio" checked={form.deliveryType === 'standard'} onChange={() => setForm(prev => ({ ...prev, deliveryType: 'standard' }))} className="mt-0.5 accent-[#16a34a]" />
                            <div>
                              <p className="text-sm font-semibold text-light-text dark:text-dark-text">{tr('Standard (1-2 days)', 'Standard (1-2 jours)', 'Bisanzwe (iminsi 1-2)')}</p>
                              <p className="text-xs text-gray-500">{totalPrice >= FREE_DELIVERY_THRESHOLD ? tr('Free delivery', 'Livraison gratuite', 'Kohereza ubuntu') : `${formatPrice(DELIVERY_FEE_STANDARD)} - ${tr('Free over 50k', 'Gratuit au-delà de 50k', 'Ubuntu hejuru ya 50k')}`}</p>
                            </div>
                          </label>
                          <label className={`flex items-start gap-3 p-3 rounded-card border cursor-pointer transition-colors ${form.deliveryType === 'express' ? 'border-[#f59e0b] bg-[#f59e0b]/5' : 'border-light-border dark:border-dark-border'}`}>
                            <input type="radio" checked={form.deliveryType === 'express'} onChange={() => setForm(prev => ({ ...prev, deliveryType: 'express' }))} className="mt-0.5 accent-[#f59e0b]" />
                            <div>
                              <p className="text-sm font-semibold text-light-text dark:text-dark-text">{tr('Express (same day)', 'Express (même jour)', 'Byihuse (uwo munsi)')}</p>
                              <p className="text-xs text-gray-500">+{formatPrice(EXPRESS_FEE)} {tr('extra', 'supplément', 'inyongera')}</p>
                            </div>
                          </label>
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">{tr('Additional Notes', 'Notes supplémentaires', 'Andi makuru')} <span className="text-gray-400 font-normal">({tr('optional', 'optionnel', 'si ngombwa')})</span></label>
                    <textarea
                      value={form.notes}
                      onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Any special instructions..."
                      rows={3}
                      className="w-full px-3 py-2.5 text-sm border border-light-border dark:border-dark-border rounded-btn bg-white dark:bg-dark-card text-light-text dark:text-dark-text focus:outline-none focus:border-[#16a34a] resize-none"
                    />
                  </div>

                  <button onClick={handleDetailsSubmit} className="w-full bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold py-3 rounded-btn transition-colors mt-2">
                    {tr('Continue to Payment', 'Continuer vers le paiement', 'Komeza ujye kwishyura')} {'->'}
                  </button>
                </div>
              </div>
            </div>
            <div className="lg:col-span-1">
              <OrderSummaryWidget />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-dark-card rounded-card border border-light-border dark:border-dark-border p-6">
                <h2 className="text-lg font-bold text-light-text dark:text-dark-text mb-5 flex items-center gap-2">
                  <CreditCard size={18} className="text-[#16a34a]" /> {tr('Payment Method', 'Méthode de paiement', 'Uburyo bwo kwishyura')}
                </h2>

                <div className="mb-4 p-3 rounded-btn border border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-900/20 text-xs text-amber-700 dark:text-amber-300">
                  {form.fulfillmentMethod === 'pickup'
                    ? tr(
                      `You are paying a refundable deposit of ${formatPrice(depositRequirement.amount)} to confirm pick-up.`,
                      `Vous payez un acompte remboursable de ${formatPrice(depositRequirement.amount)} pour confirmer le retrait.`,
                      `Uri kwishyura ubwishyu bw'ibanze busubizwa bwa ${formatPrice(depositRequirement.amount)} kugira ngo wemeze gufata.`
                    )
                    : tr(
                      `You are paying the full delivery amount of ${formatPrice(grandTotal)}.`,
                      `Vous payez le montant total de livraison de ${formatPrice(grandTotal)}.`,
                      `Uri kwishyura amafaranga yose yo kugeza angana na ${formatPrice(grandTotal)}.`
                    )}
                </div>

                <div className="space-y-3 mb-6">
                  <label className={`flex items-start gap-3 p-4 rounded-card border cursor-pointer transition-colors ${paymentMethod === 'mtn' ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/10' : 'border-light-border dark:border-dark-border'}`}>
                    <input type="radio" checked={paymentMethod === 'mtn'} onChange={() => setPaymentMethod('mtn')} className="mt-1 accent-yellow-500" />
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
                            {tr('After clicking Place Order, you will receive a USSD prompt on your phone.', 'Après avoir cliqué sur Commander, vous recevrez une invite USSD sur votre téléphone.', 'Nukanda Ohereza Itegeko, urabona ubutumwa bwa USSD kuri telefoni yawe.')}
                          </div>
                        </div>
                      )}
                    </div>
                  </label>

                  <label className={`flex items-start gap-3 p-4 rounded-card border cursor-pointer transition-colors ${paymentMethod === 'airtel' ? 'border-red-400 bg-red-50 dark:bg-red-900/10' : 'border-light-border dark:border-dark-border'}`}>
                    <input type="radio" checked={paymentMethod === 'airtel'} onChange={() => setPaymentMethod('airtel')} className="mt-1 accent-red-500" />
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
                            {tr('After clicking Place Order, you will receive a payment prompt on your phone.', 'Après avoir cliqué sur Commander, vous recevrez une invite de paiement sur votre téléphone.', 'Nukanda Ohereza Itegeko, urabona ubutumwa bwo kwishyura kuri telefoni yawe.')}
                          </div>
                        </div>
                      )}
                    </div>
                  </label>

                  <label className={`flex items-start gap-3 p-4 rounded-card border transition-colors ${paymentMethod === 'cod' ? 'border-[#16a34a] bg-[#16a34a]/5' : 'border-light-border dark:border-dark-border'} ${form.fulfillmentMethod === 'pickup' ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
                    <input
                      type="radio"
                      disabled={form.fulfillmentMethod === 'pickup'}
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="mt-1 accent-[#16a34a]"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <Banknote size={16} className="text-[#16a34a]" />
                        <p className="font-semibold text-sm text-light-text dark:text-dark-text">{tr('Cash on Delivery', 'Paiement à la livraison', 'Kwishyura wakiriye')}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {form.fulfillmentMethod === 'pickup'
                          ? tr('Not available for pick-up deposit orders.', 'Non disponible pour les commandes retrait avec acompte.', 'Ntiboneka ku mategeko yo gufata asaba ubwishyu bw\'ibanze.')
                          : tr('Pay when your order arrives.', 'Payez à la réception de votre commande.', 'Wishyura igihe itegeko rigeze.')}
                      </p>
                    </div>
                  </label>
                </div>

                {paymentError && (
                  <div className="mb-4 p-3 rounded-btn border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/20 text-xs text-red-700 dark:text-red-300">
                    {paymentError}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="px-4 py-3 border border-light-border dark:border-dark-border rounded-btn text-sm font-medium text-light-text dark:text-dark-text hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    {'<-'} {tr('Back', 'Retour', 'Subira inyuma')}
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={placing}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#f59e0b] hover:bg-[#d97706] disabled:opacity-70 text-white font-bold py-3 rounded-btn transition-colors"
                  >
                    {placing ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        {tr('Processing...', 'Traitement...', 'Birimo gutunganywa...')}
                      </>
                    ) : (
                      <>
                        {form.fulfillmentMethod === 'pickup'
                          ? `${tr('Pay Deposit & Place Order', 'Payer l\'acompte et commander', 'Ishyura ubwishyu bw\'ibanze kandi wohereze itegeko')} - ${formatPrice(payableNow)}`
                          : `${t('Place Order')} - ${formatPrice(payableNow)}`}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
            <div className="lg:col-span-1">
              <OrderSummaryWidget />
              <div className="mt-3 bg-white dark:bg-dark-card rounded-card border border-light-border dark:border-dark-border p-4 text-xs text-gray-500">
                <p className="font-semibold text-light-text dark:text-dark-text mb-1">{form.fulfillmentMethod === 'pickup' ? tr('Pickup details:', 'Détails du retrait :', 'Ibisobanuro byo gufata:') : tr('Delivery to:', 'Livraison à :', 'Gezwa kuri:')}</p>
                <p>{form.fullName}</p>
                {form.fulfillmentMethod === 'pickup'
                  ? <p>{selectedBranch?.name ?? tr('Selected branch', 'Succursale sélectionnée', 'Ishami ryatoranyijwe')} - {selectedBranch?.location ?? ''}</p>
                  : <p>{form.address}, {form.district}</p>}
                {form.fulfillmentMethod === 'pickup' && <p>{form.pickupDate || tr('Date pending', 'Date en attente', 'Itariki itaratangwa')} - {form.pickupSlot || tr('Time pending', 'Heure en attente', 'Igihe kitaratangwa')}</p>}
                <p>{form.phone}</p>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="max-w-lg mx-auto text-center">
            <div className="bg-white dark:bg-dark-card rounded-card border border-light-border dark:border-dark-border p-8">
              <div className="flex items-center justify-center mb-6">
                <div className="w-20 h-20 bg-[#16a34a] rounded-full flex items-center justify-center">
                  <svg viewBox="0 0 52 52" className="w-12 h-12">
                    <circle cx="26" cy="26" r="25" fill="none" stroke="white" strokeWidth="2" opacity="0.3" />
                    <path fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="animate-checkmark" d="M14 27l8 8 16-16" />
                  </svg>
                </div>
              </div>

              <h2 className="text-2xl font-extrabold text-light-text dark:text-dark-text mb-2">{tr('Order Placed Successfully!', 'Commande passée avec succès !', 'Itegeko ryoherejwe neza!')}</h2>
              <p className="text-gray-500 text-sm mb-6">{tr('Your selected branch has received the order and will start preparing it.', 'La succursale sélectionnée a reçu la commande et commence la préparation.', 'Ishami wahisemo ryakiriye itegeko kandi ritangira kuritegura.')}</p>

              <div className="bg-gray-50 dark:bg-slate-800 rounded-card p-4 mb-6 text-left space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{tr('Order Number', 'Numéro de commande', 'Nimero y\'itegeko')}</span>
                  <span className="font-bold text-[#16a34a]">#{orderId}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{tr('Method', 'Méthode', 'Uburyo')}</span>
                  <span className="font-medium text-light-text dark:text-dark-text">
                    {form.fulfillmentMethod === 'pickup' ? tr('Branch Pick-up', 'Retrait en succursale', 'Fatira ku ishami') : (form.deliveryType === 'express' ? tr('Same day delivery', 'Livraison le jour même', 'Kugeza uwo munsi') : tr('1-2 business days delivery', 'Livraison en 1-2 jours ouvrés', 'Kugeza mu minsi 1-2 y\'akazi'))}
                  </span>
                </div>
                {form.fulfillmentMethod === 'pickup' && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">{tr('Branch', 'Succursale', 'Ishami')}</span>
                      <span className="font-medium text-light-text dark:text-dark-text">{selectedBranch?.name ?? '-'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">{tr('Pick-up time', 'Heure de retrait', 'Igihe cyo gufata')}</span>
                      <span className="font-medium text-light-text dark:text-dark-text">{form.pickupDate} {form.pickupSlot}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">{tr('Deposit paid now', 'Acompte payé maintenant', 'Ubwishyu bw\'ibanze bwishyuwe ubu')}</span>
                      <span className="font-medium text-light-text dark:text-dark-text">{formatPrice(payableNow)}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between text-sm border-t border-light-border dark:border-dark-border pt-2">
                  <span className="font-bold text-light-text dark:text-dark-text">{t('Total')}</span>
                  <span className="font-extrabold text-[#f59e0b]">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/" className="flex-1 bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold py-3 rounded-btn transition-colors text-center">
                  {t('Continue Shopping')}
                </Link>
                <Link href="/branches" className="flex-1 border border-light-border dark:border-dark-border text-light-text dark:text-dark-text font-semibold py-3 rounded-btn hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-center">
                  {tr('View Branches', 'Voir les succursales', 'Reba amashami')}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
