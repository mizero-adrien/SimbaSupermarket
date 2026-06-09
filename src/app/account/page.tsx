'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag, Clock, CheckCircle, AlertCircle, XCircle,
  Package, Truck, CreditCard, MapPin, ChevronDown, ChevronUp,
  User, LogOut,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getAllBranches } from '@/lib/branches';
import { getCustomerOrders } from '@/lib/dashboardData';
import { BranchOrder, OrderStatus } from '@/types';
import { formatPrice } from '@/lib/formatPrice';

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending:   { label: 'Pending',   color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200',   icon: Clock },
  confirmed: { label: 'Confirmed', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200',       icon: CheckCircle },
  preparing: { label: 'Preparing', color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 border-purple-200', icon: AlertCircle },
  ready:     { label: 'Ready for Pickup', color: 'text-green-600 bg-green-50 dark:bg-green-900/20 border-green-200', icon: CheckCircle },
  delivered: { label: 'Delivered', color: 'text-gray-600 bg-gray-100 dark:bg-gray-700 border-gray-200',         icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'text-red-500 bg-red-50 dark:bg-red-900/20 border-red-200',           icon: XCircle },
};

const TIMELINE: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'delivered'];

const TABS = [
  { key: 'all',       label: 'All Orders' },
  { key: 'active',    label: 'Active' },
  { key: 'delivered', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
] as const;

type TabKey = typeof TABS[number]['key'];

function OrderTimeline({ status }: { status: OrderStatus }) {
  if (status === 'cancelled') return null;
  const currentIndex = TIMELINE.indexOf(status);
  return (
    <div className="flex items-center gap-0 mt-3">
      {TIMELINE.map((s, i) => {
        const done = i <= currentIndex;
        const active = i === currentIndex;
        return (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold border-2 transition-colors ${
              done
                ? active
                  ? 'bg-[#f59e0b] border-[#f59e0b] text-white'
                  : 'bg-green-500 border-green-500 text-white'
                : 'bg-gray-100 dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-400'
            }`}>
              {done && !active ? <CheckCircle size={13} /> : i + 1}
            </div>
            {i < TIMELINE.length - 1 && (
              <div className={`flex-1 h-0.5 ${i < currentIndex ? 'bg-green-400' : 'bg-gray-200 dark:bg-slate-600'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function OrderCard({ order, branchName }: { order: BranchOrder; branchName: string }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[order.status];
  const Icon = cfg.icon;
  const date = new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="bg-white dark:bg-dark-card rounded-card border border-light-border dark:border-dark-border overflow-hidden">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 px-5 py-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-light-text dark:text-dark-text font-mono">{order.id}</span>
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${cfg.color}`}>
              <Icon size={10} />
              {cfg.label}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
            <span className="flex items-center gap-1"><MapPin size={11} />{branchName}</span>
            <span>{date}</span>
            <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-base font-extrabold text-[#f59e0b]">{formatPrice(order.total)}</p>
          <button
            onClick={() => setExpanded(v => !v)}
            className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-0.5 ml-auto mt-1"
          >
            {expanded ? 'Less' : 'Details'}
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>
      </div>

      {/* Status timeline */}
      <div className="px-5 pb-4">
        <OrderTimeline status={order.status} />
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-light-border dark:border-dark-border px-5 py-4 space-y-4">
          {/* Items */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Items</p>
            <div className="space-y-1.5">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-light-text dark:text-dark-text">{item.product.name} <span className="text-gray-400">×{item.quantity}</span></span>
                  <span className="font-semibold text-light-text dark:text-dark-text">{formatPrice(item.product.price * item.quantity)}</span>
                </div>
              ))}
              {order.deliveryFee > 0 && (
                <div className="flex items-center justify-between text-sm border-t border-light-border dark:border-dark-border pt-1.5 mt-1.5">
                  <span className="text-gray-500 flex items-center gap-1"><Truck size={12} />Delivery fee</span>
                  <span className="text-gray-500">{formatPrice(order.deliveryFee)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Order meta */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-gray-50 dark:bg-slate-800 rounded-btn p-3">
              <p className="text-gray-400 mb-0.5">Fulfillment</p>
              <p className="font-semibold text-light-text dark:text-dark-text capitalize flex items-center gap-1">
                {order.deliveryType === 'pickup' ? <Package size={12} /> : <Truck size={12} />}
                {order.deliveryType}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-slate-800 rounded-btn p-3">
              <p className="text-gray-400 mb-0.5">Payment</p>
              <p className="font-semibold text-light-text dark:text-dark-text flex items-center gap-1">
                <CreditCard size={12} />{order.paymentMethod}
              </p>
            </div>
            {order.address && (
              <div className="col-span-2 bg-gray-50 dark:bg-slate-800 rounded-btn p-3">
                <p className="text-gray-400 mb-0.5">Address</p>
                <p className="font-semibold text-light-text dark:text-dark-text">{order.address}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AccountPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<BranchOrder[]>([]);
  const [tab, setTab] = useState<TabKey>('all');
  const [mounted, setMounted] = useState(false);

  const branchMap = useMemo(() => {
    const map: Record<string, string> = {};
    getAllBranches().forEach(b => { map[b.id] = b.name; });
    return map;
  }, []);

  useEffect(() => {
    setMounted(true);
    if (!user) { router.push('/auth/login'); return; }
    if (user.role !== 'customer') { router.push('/dashboard'); return; }
    setOrders(getCustomerOrders(user.id));
  }, [user, router]);

  const filtered = useMemo(() => {
    if (tab === 'all') return orders;
    if (tab === 'active') return orders.filter(o => ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status));
    if (tab === 'delivered') return orders.filter(o => o.status === 'delivered');
    if (tab === 'cancelled') return orders.filter(o => o.status === 'cancelled');
    return orders;
  }, [orders, tab]);

  const totalSpent = useMemo(() =>
    orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0),
    [orders]
  );
  const activeCount = orders.filter(o => ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status)).length;

  if (!mounted || !user) return null;

  const initial = user.name?.charAt(0).toUpperCase() ?? '?';
  const memberSince = new Date(user.createdAt ?? Date.now()).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg page-transition">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* Profile card */}
        <div className="bg-white dark:bg-dark-card rounded-card border border-light-border dark:border-dark-border p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#f59e0b] flex items-center justify-center text-white text-2xl font-extrabold shrink-0">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-extrabold text-light-text dark:text-dark-text">{user.name}</h1>
              <p className="text-sm text-gray-500">{user.email}</p>
              {user.phone && <p className="text-sm text-gray-500">{user.phone}</p>}
              <p className="text-xs text-gray-400 mt-0.5">Member since {memberSince}</p>
            </div>
            <button
              onClick={() => { logout(); router.push('/'); }}
              className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 border border-red-200 hover:border-red-300 px-3 py-1.5 rounded-btn transition-colors shrink-0"
            >
              <LogOut size={13} /> Logout
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-5">
            {[
              { icon: ShoppingBag, label: 'Total Orders', value: orders.length },
              { icon: Clock,       label: 'Active',       value: activeCount },
              { icon: User,        label: 'Total Spent',  value: formatPrice(totalSpent) },
            ].map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="rounded-btn bg-gray-50 dark:bg-slate-800 px-3 py-3 text-center">
                  <Icon size={16} className="text-[#f59e0b] mx-auto mb-1" />
                  <p className="text-base font-extrabold text-light-text dark:text-dark-text">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Orders section */}
        <div>
          <h2 className="text-lg font-bold text-light-text dark:text-dark-text mb-3">My Orders</h2>

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 mb-4" style={{ scrollbarWidth: 'none' }}>
            {TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                  tab === t.key
                    ? 'bg-[#f59e0b] text-white'
                    : 'bg-white dark:bg-dark-card border border-light-border dark:border-dark-border text-light-text dark:text-dark-text hover:border-[#f59e0b]'
                }`}
              >
                {t.label}
                {t.key === 'active' && activeCount > 0 && (
                  <span className="ml-1.5 bg-white/30 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{activeCount}</span>
                )}
              </button>
            ))}
          </div>

          {/* Order list */}
          {filtered.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-dark-card rounded-card border border-light-border dark:border-dark-border">
              <ShoppingBag size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">No orders here yet</p>
              <Link href="/products" className="mt-4 inline-flex items-center gap-2 bg-[#f59e0b] text-white px-5 py-2 rounded-btn text-sm font-semibold hover:bg-[#d97706] transition-colors">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  branchName={branchMap[order.branchId] ?? order.branchId}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
