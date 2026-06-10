'use client';

import { useEffect, useMemo, useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag, Clock, CheckCircle, AlertCircle, XCircle,
  Package, Truck, CreditCard, MapPin, ChevronDown, ChevronUp,
  User, LogOut, Save, Eye, EyeOff, ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import OrderCardSkeleton from '@/components/skeletons/OrderCardSkeleton';
import { getAllBranches } from '@/lib/branches';
import { getCustomerOrders } from '@/lib/dashboardData';
import { BranchOrder, OrderStatus } from '@/types';
import { formatPrice } from '@/lib/formatPrice';

// â”€â”€â”€ Status config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending:   { label: 'Pending',          color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200',     icon: Clock },
  confirmed: { label: 'Confirmed',        color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200',         icon: CheckCircle },
  preparing: { label: 'Preparing',        color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 border-purple-200', icon: AlertCircle },
  ready:     { label: 'Ready for Pickup', color: 'text-green-600 bg-green-50 dark:bg-green-900/20 border-green-200',     icon: CheckCircle },
  delivered: { label: 'Delivered',        color: 'text-gray-600 bg-gray-100 dark:bg-gray-700 border-gray-200',           icon: CheckCircle },
  cancelled: { label: 'Cancelled',        color: 'text-red-500 bg-red-50 dark:bg-red-900/20 border-red-200',             icon: XCircle },
};

const TIMELINE: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'delivered'];

const ORDER_TABS = [
  { key: 'all',       label: 'All' },
  { key: 'active',    label: 'Active' },
  { key: 'delivered', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
] as const;
type OrderTabKey = typeof ORDER_TABS[number]['key'];

// â”€â”€â”€ Order timeline â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function OrderTimeline({ status }: { status: OrderStatus }) {
  if (status === 'cancelled') return null;
  const currentIndex = TIMELINE.indexOf(status);
  return (
    <div className="flex items-center mt-3">
      {TIMELINE.map((s, i) => {
        const done = i <= currentIndex;
        const active = i === currentIndex;
        return (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold border-2 transition-colors ${
              done
                ? active ? 'bg-[#f59e0b] border-[#f59e0b] text-white' : 'bg-green-500 border-green-500 text-white'
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

// â”€â”€â”€ Order card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function OrderCard({ order, branchName }: { order: BranchOrder; branchName: string }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[order.status];
  const Icon = cfg.icon;
  const date = new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="bg-white dark:bg-dark-card rounded-card border border-light-border dark:border-dark-border overflow-hidden">
      <div className="flex items-start justify-between gap-3 px-5 py-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-light-text dark:text-dark-text font-mono">{order.id}</span>
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${cfg.color}`}>
              <Icon size={10} /> {cfg.label}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
            <span className="flex items-center gap-1"><MapPin size={11} />{branchName}</span>
            <span>{date}</span>
            <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-base font-extrabold text-[#f59e0b]">{formatPrice(order.total)}</p>
          <button onClick={() => setExpanded(v => !v)} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-0.5 ml-auto mt-1">
            {expanded ? 'Less' : 'Details'} {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>
      </div>

      <div className="px-5 pb-4">
        <OrderTimeline status={order.status} />
      </div>

      {expanded && (
        <div className="border-t border-light-border dark:border-dark-border px-5 py-4 space-y-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Items</p>
            <div className="space-y-1.5">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-light-text dark:text-dark-text">{item.product.name} <span className="text-gray-400">Ã—{item.quantity}</span></span>
                  <span className="font-semibold">{formatPrice(item.product.price * item.quantity)}</span>
                </div>
              ))}
              {order.deliveryFee > 0 && (
                <div className="flex justify-between text-sm border-t border-light-border dark:border-dark-border pt-1.5 mt-1.5">
                  <span className="text-gray-500 flex items-center gap-1"><Truck size={12} />Delivery fee</span>
                  <span className="text-gray-500">{formatPrice(order.deliveryFee)}</span>
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-gray-50 dark:bg-slate-800 rounded-btn p-3">
              <p className="text-gray-400 mb-0.5">Fulfillment</p>
              <p className="font-semibold capitalize flex items-center gap-1">
                {order.deliveryType === 'pickup' ? <Package size={12} /> : <Truck size={12} />} {order.deliveryType}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-slate-800 rounded-btn p-3">
              <p className="text-gray-400 mb-0.5">Payment</p>
              <p className="font-semibold flex items-center gap-1"><CreditCard size={12} />{order.paymentMethod}</p>
            </div>
            {order.address && (
              <div className="col-span-2 bg-gray-50 dark:bg-slate-800 rounded-btn p-3">
                <p className="text-gray-400 mb-0.5">Address</p>
                <p className="font-semibold">{order.address}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// â”€â”€â”€ Profile / Settings tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function ProfileTab() {
  const { user, updateProfile } = useAuth();
  const isGoogleAccount = user?.password?.startsWith('google-') ?? false;

  const [info, setInfo] = useState({ name: user?.name ?? '', phone: user?.phone ?? '', email: user?.email ?? '' });
  const [infoMsg, setInfoMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [infoSaving, setInfoSaving] = useState(false);

  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' });
  const [showPwd, setShowPwd] = useState({ current: false, next: false, confirm: false });
  const [pwdMsg, setPwdMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pwdSaving, setPwdSaving] = useState(false);

  function handleInfoSave(e: FormEvent) {
    e.preventDefault();
    if (!info.name.trim()) { setInfoMsg({ ok: false, text: 'Name is required.' }); return; }
    if (!info.email.trim() || !/^\S+@\S+\.\S+$/.test(info.email)) { setInfoMsg({ ok: false, text: 'Enter a valid email.' }); return; }
    setInfoSaving(true);
    const result = updateProfile({ name: info.name.trim(), phone: info.phone.trim(), email: info.email.trim().toLowerCase() });
    setInfoSaving(false);
    setInfoMsg(result.ok ? { ok: true, text: 'Profile updated successfully.' } : { ok: false, text: result.error ?? 'Update failed.' });
    setTimeout(() => setInfoMsg(null), 3500);
  }

  function handlePwdSave(e: FormEvent) {
    e.preventDefault();
    if (!pwd.current) { setPwdMsg({ ok: false, text: 'Enter your current password.' }); return; }
    if (pwd.current !== user?.password) { setPwdMsg({ ok: false, text: 'Current password is incorrect.' }); return; }
    if (pwd.next.length < 6) { setPwdMsg({ ok: false, text: 'New password must be at least 6 characters.' }); return; }
    if (pwd.next !== pwd.confirm) { setPwdMsg({ ok: false, text: 'Passwords do not match.' }); return; }
    setPwdSaving(true);
    const result = updateProfile({ password: pwd.next });
    setPwdSaving(false);
    if (result.ok) {
      setPwdMsg({ ok: true, text: 'Password changed successfully.' });
      setPwd({ current: '', next: '', confirm: '' });
    } else {
      setPwdMsg({ ok: false, text: result.error ?? 'Failed to update password.' });
    }
    setTimeout(() => setPwdMsg(null), 3500);
  }

  const inputCls = 'w-full px-3 py-2.5 text-sm border border-light-border dark:border-dark-border rounded-btn bg-white dark:bg-dark-bg text-light-text dark:text-dark-text focus:outline-none focus:border-[#f59e0b] transition-colors';

  return (
    <div className="space-y-5">
      {/* Personal info */}
      <div className="bg-white dark:bg-dark-card rounded-card border border-light-border dark:border-dark-border p-5">
        <h3 className="font-bold text-light-text dark:text-dark-text mb-4">Personal Information</h3>
        <form onSubmit={handleInfoSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Full Name</label>
            <input value={info.name} onChange={e => setInfo(p => ({ ...p, name: e.target.value }))} placeholder="Your full name" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Email Address</label>
            <input type="email" value={info.email} onChange={e => setInfo(p => ({ ...p, email: e.target.value }))} placeholder="you@example.com" className={inputCls} />
            {isGoogleAccount && (
              <p className="text-xs text-amber-600 mt-1 flex items-center gap-1"><ShieldCheck size={12} />Signed in with Google â€” email changes apply to your Simba profile only.</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Phone Number <span className="text-gray-400 font-normal">(optional)</span></label>
            <input value={info.phone} onChange={e => setInfo(p => ({ ...p, phone: e.target.value }))} placeholder="+250 7XX XXX XXX" className={inputCls} />
          </div>

          {infoMsg && (
            <p className={`text-sm px-3 py-2 rounded-btn ${infoMsg.ok ? 'bg-green-50 text-green-700 dark:bg-green-900/20' : 'bg-red-50 text-red-600 dark:bg-red-900/20'}`}>
              {infoMsg.text}
            </p>
          )}

          <button type="submit" disabled={infoSaving} className="flex items-center gap-2 bg-[#f59e0b] hover:bg-amber-400 text-white font-semibold px-5 py-2.5 rounded-btn text-sm disabled:opacity-60 transition-colors">
            <Save size={15} /> {infoSaving ? 'Savingâ€¦' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Password */}
      {!isGoogleAccount && (
        <div className="bg-white dark:bg-dark-card rounded-card border border-light-border dark:border-dark-border p-5">
          <h3 className="font-bold text-light-text dark:text-dark-text mb-4">Change Password</h3>
          <form onSubmit={handlePwdSave} className="space-y-4">
            {(['current', 'next', 'confirm'] as const).map((field) => {
              const labels = { current: 'Current Password', next: 'New Password', confirm: 'Confirm New Password' };
              return (
                <div key={field}>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">{labels[field]}</label>
                  <div className="relative">
                    <input
                      type={showPwd[field] ? 'text' : 'password'}
                      value={pwd[field]}
                      onChange={e => setPwd(p => ({ ...p, [field]: e.target.value }))}
                      placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                      className={inputCls + ' pr-10'}
                    />
                    <button type="button" onClick={() => setShowPwd(p => ({ ...p, [field]: !p[field] }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPwd[field] ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              );
            })}

            {pwdMsg && (
              <p className={`text-sm px-3 py-2 rounded-btn ${pwdMsg.ok ? 'bg-green-50 text-green-700 dark:bg-green-900/20' : 'bg-red-50 text-red-600 dark:bg-red-900/20'}`}>
                {pwdMsg.text}
              </p>
            )}

            <button type="submit" disabled={pwdSaving} className="flex items-center gap-2 bg-[#f59e0b] hover:bg-amber-400 text-white font-semibold px-5 py-2.5 rounded-btn text-sm disabled:opacity-60 transition-colors">
              <ShieldCheck size={15} /> {pwdSaving ? 'Updatingâ€¦' : 'Update Password'}
            </button>
          </form>
        </div>
      )}

      {isGoogleAccount && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-card p-4 text-sm text-blue-700 dark:text-blue-300 flex items-start gap-2">
          <ShieldCheck size={16} className="shrink-0 mt-0.5" />
          <span>Your account is linked to Google. Password management is handled by Google â€” you can sign in with Google at any time.</span>
        </div>
      )}
    </div>
  );
}

// â”€â”€â”€ Main page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const PAGE_TABS = [
  { key: 'orders',  label: 'My Orders', icon: ShoppingBag },
  { key: 'profile', label: 'Profile & Settings', icon: User },
] as const;
type PageTab = typeof PAGE_TABS[number]['key'];

export default function AccountPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<BranchOrder[]>([]);
  const [ordersLoaded, setOrdersLoaded] = useState(false);
  const [pageTab, setPageTab] = useState<PageTab>('orders');
  const [orderTab, setOrderTab] = useState<OrderTabKey>('all');
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
    setOrdersLoaded(true);
  }, [user, router]);

  // Keep orders in sync after profile tab edits (user could have changed nothing but good practice)
  useEffect(() => {
    if (user?.role === 'customer') setOrders(getCustomerOrders(user.id));
  }, [user]);

  const filtered = useMemo(() => {
    if (orderTab === 'all') return orders;
    if (orderTab === 'active') return orders.filter(o => ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status));
    if (orderTab === 'delivered') return orders.filter(o => o.status === 'delivered');
    return orders.filter(o => o.status === 'cancelled');
  }, [orders, orderTab]);

  const totalSpent = useMemo(() => orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0), [orders]);
  const activeCount = orders.filter(o => ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status)).length;

  if (!mounted || !user) return null;

  const initial = user.name?.charAt(0).toUpperCase() ?? '?';
  const memberSince = new Date(user.createdAt ?? Date.now()).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg page-transition">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* Profile header card */}
        <div className="bg-white dark:bg-dark-card rounded-card border border-light-border dark:border-dark-border p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#f59e0b] flex items-center justify-center text-white text-2xl font-extrabold shrink-0 shadow-md">
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
              { icon: ShoppingBag, label: 'Orders',      value: String(orders.length) },
              { icon: Clock,       label: 'Active',      value: String(activeCount) },
              { icon: CreditCard,  label: 'Total Spent', value: formatPrice(totalSpent) },
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

        {/* Page-level tabs */}
        <div className="flex gap-2 border-b border-light-border dark:border-dark-border pb-0">
          {PAGE_TABS.map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => setPageTab(t.key)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                  pageTab === t.key
                    ? 'border-[#f59e0b] text-[#f59e0b]'
                    : 'border-transparent text-gray-500 hover:text-light-text dark:hover:text-dark-text'
                }`}
              >
                <Icon size={15} /> {t.label}
              </button>
            );
          })}
        </div>

        {/* Orders tab */}
        {pageTab === 'orders' && (
          <div className="space-y-4">
            {/* Order filter tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              {ORDER_TABS.map(t => (
                <button
                  key={t.key}
                  onClick={() => setOrderTab(t.key)}
                  className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                    orderTab === t.key
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

            {!ordersLoaded ? (
              Array.from({ length: 3 }).map((_, i) => <OrderCardSkeleton key={i} />)
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-dark-card rounded-card border border-light-border dark:border-dark-border">
                <ShoppingBag size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">No orders here yet</p>
                <Link href="/products" className="mt-4 inline-flex items-center gap-2 bg-[#f59e0b] text-white px-5 py-2 rounded-btn text-sm font-semibold hover:bg-amber-400 transition-colors">
                  Start Shopping
                </Link>
              </div>
            ) : (
              filtered.map(order => (
                <OrderCard key={order.id} order={order} branchName={branchMap[order.branchId] ?? order.branchId} />
              ))
            )}
          </div>
        )}

        {/* Profile tab */}
        {pageTab === 'profile' && <ProfileTab />}

      </div>
    </div>
  );
}
