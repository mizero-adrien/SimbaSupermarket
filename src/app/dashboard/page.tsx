'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  ShoppingCart, Package, TrendingUp, Users,
  Clock, CheckCircle, AlertCircle, XCircle, ChevronRight, ArrowUpRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getAllBranches, getBranchById } from '@/lib/branches';
import { getBranchOrders } from '@/lib/dashboardData';
import { BranchOrder, OrderStatus } from '@/types';
import { formatPrice } from '@/lib/formatPrice';

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: React.ElementType; pie: string }> = {
  pending:   { label: 'Pending',   color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',     icon: Clock,         pie: '#f59e0b' },
  confirmed: { label: 'Confirmed', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',        icon: CheckCircle,   pie: '#3b82f6' },
  preparing: { label: 'Preparing', color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',  icon: AlertCircle,   pie: '#8b5cf6' },
  ready:     { label: 'Ready',     color: 'text-green-600 bg-green-50 dark:bg-green-900/20',     icon: CheckCircle,   pie: '#16a34a' },
  delivered: { label: 'Delivered', color: 'text-gray-600 bg-gray-100 dark:bg-gray-700',          icon: CheckCircle,   pie: '#6b7280' },
  cancelled: { label: 'Cancelled', color: 'text-red-500 bg-red-50 dark:bg-red-900/20',           icon: XCircle,       pie: '#ef4444' },
};

const CAT_COLORS = ['#f59e0b', '#3b82f6', '#8b5cf6', '#16a34a', '#f43f5e', '#06b6d4'];

function RevenueTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-btn px-3 py-2 shadow-lg text-sm">
      <p className="font-semibold text-light-text dark:text-dark-text">{label}</p>
      <p className="text-[#f59e0b] font-bold">{formatPrice(payload[0].value)}</p>
    </div>
  );
}

function CategoryTooltip({ active, payload }: { active?: boolean; payload?: { value: number; name: string }[] }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-btn px-3 py-2 shadow-lg text-sm">
      <p className="text-light-text dark:text-dark-text font-semibold">{payload[0].name}</p>
      <p className="text-[#f59e0b] font-bold">{payload[0].value} items</p>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<BranchOrder[]>([]);
  const [mounted, setMounted] = useState(false);

  const isSystemAdmin = user?.role === 'system_admin' || user?.role === 'admin';
  const branch = user?.branchId ? getBranchById(user.branchId) : null;

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!user) return;
    if (isSystemAdmin) {
      setOrders(getAllBranches().flatMap(b => getBranchOrders(b.id)));
    } else if (user.branchId) {
      setOrders(getBranchOrders(user.branchId));
    }
  }, [user, isSystemAdmin]);

  const revenue = orders.reduce((s, o) => o.status !== 'cancelled' ? s + o.total : s, 0);
  const pending = orders.filter(o => o.status === 'pending').length;
  const customers = new Set(orders.map(o => o.customerId)).size;

  const recentOrders = useMemo(() =>
    [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5),
    [orders]
  );

  const statusCounts = useMemo(() =>
    orders.reduce<Record<string, number>>((acc, o) => { acc[o.status] = (acc[o.status] ?? 0) + 1; return acc; }, {}),
    [orders]
  );

  // Last 7 days revenue
  const revenueByDay = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });
      const total = orders
        .filter(o => o.status !== 'cancelled' && new Date(o.createdAt).toDateString() === d.toDateString())
        .reduce((s, o) => s + o.total, 0);
      days.push({ day: label, revenue: total });
    }
    return days;
  }, [orders]);

  // Top categories by quantity ordered
  const topCategories = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach(o => o.items.forEach(item => {
      const cat = item.product.category;
      counts[cat] = (counts[cat] ?? 0) + item.quantity;
    }));
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }));
  }, [orders]);

  // Status donut data
  const statusPieData = useMemo(() =>
    (Object.keys(STATUS_CONFIG) as OrderStatus[])
      .map(s => ({ name: STATUS_CONFIG[s].label, value: statusCounts[s] ?? 0, color: STATUS_CONFIG[s].pie }))
      .filter(d => d.value > 0),
    [statusCounts]
  );

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-light-text dark:text-dark-text">
          {isSystemAdmin ? 'System Admin Dashboard' : branch ? branch.name : 'Dashboard'}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Welcome back, {user?.name}
          {isSystemAdmin
            ? <span className="ml-1">— Full platform access</span>
            : branch && <span className="ml-1">— {branch.location}</span>}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue',    value: formatPrice(revenue),   icon: TrendingUp,  color: 'text-[#f59e0b]',  bg: 'bg-[#f59e0b]/10' },
          { label: 'Total Orders',     value: String(orders.length),  icon: ShoppingCart, color: 'text-blue-600',   bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Pending Orders',   value: String(pending),        icon: Clock,        color: 'text-amber-600',  bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: isSystemAdmin ? 'Unique Customers' : 'Customers', value: String(customers), icon: Users, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white dark:bg-dark-card rounded-card border border-light-border dark:border-dark-border p-5">
              <div className={`w-10 h-10 rounded-btn ${stat.bg} flex items-center justify-center mb-3`}>
                <Icon size={20} className={stat.color} />
              </div>
              <p className="text-2xl font-extrabold text-light-text dark:text-dark-text">{stat.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Revenue bar chart + Status donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-dark-card rounded-card border border-light-border dark:border-dark-border p-5">
          <h2 className="font-bold text-light-text dark:text-dark-text mb-1">Revenue — Last 7 Days</h2>
          <p className="text-xs text-gray-500 mb-4">Non-cancelled orders only</p>
          {mounted && (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueByDay} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => v === 0 ? '0' : `${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<RevenueTooltip />} cursor={{ fill: '#f59e0b15' }} />
                <Bar dataKey="revenue" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white dark:bg-dark-card rounded-card border border-light-border dark:border-dark-border p-5">
          <h2 className="font-bold text-light-text dark:text-dark-text mb-1">Order Status</h2>
          <p className="text-xs text-gray-500 mb-2">Distribution by status</p>
          {mounted && statusPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusPieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, name) => [`${v} orders`, name]} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-sm text-gray-400">No orders yet</div>
          )}
        </div>
      </div>

      {/* Top categories + Recent orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white dark:bg-dark-card rounded-card border border-light-border dark:border-dark-border p-5">
          <h2 className="font-bold text-light-text dark:text-dark-text mb-1">Top Categories</h2>
          <p className="text-xs text-gray-500 mb-4">By items ordered</p>
          {mounted && topCategories.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topCategories} layout="vertical" barSize={16}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={80} />
                <Tooltip content={<CategoryTooltip />} cursor={{ fill: '#f59e0b15' }} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {topCategories.map((_, i) => (
                    <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-sm text-gray-400">No data yet</div>
          )}
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-dark-card rounded-card border border-light-border dark:border-dark-border">
          <div className="flex items-center justify-between px-5 py-4 border-b border-light-border dark:border-dark-border">
            <h2 className="font-bold text-light-text dark:text-dark-text">Recent Orders</h2>
            <Link href="/dashboard/orders" className="text-xs text-[#f59e0b] font-semibold flex items-center gap-0.5 hover:underline">
              View all <ChevronRight size={13} />
            </Link>
          </div>
          <div className="divide-y divide-light-border dark:divide-dark-border">
            {recentOrders.length === 0 ? (
              <p className="text-center text-sm text-gray-500 py-10">No orders yet</p>
            ) : (
              recentOrders.map(order => {
                const cfg = STATUS_CONFIG[order.status];
                const Icon = cfg.icon;
                return (
                  <div key={order.id} className="flex items-center gap-4 px-5 py-3.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-light-text dark:text-dark-text truncate">{order.customerName}</p>
                      <p className="text-xs text-gray-500 truncate">{order.id} · {order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-light-text dark:text-dark-text">{formatPrice(order.total)}</p>
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.color}`}>
                        <Icon size={10} />
                        {cfg.label}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div className="px-5 pb-4 pt-3">
            <Link
              href="/dashboard/orders"
              className="w-full flex items-center justify-center gap-1.5 text-sm font-semibold text-[#f59e0b] border border-[#f59e0b] rounded-btn py-2 hover:bg-[#f59e0b]/5 transition-colors"
            >
              Manage Orders <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { href: '/dashboard/products',  icon: Package,      label: 'Add Product',  color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
          { href: '/dashboard/orders',    icon: ShoppingCart, label: 'View Orders',  color: 'text-[#f59e0b] bg-[#f59e0b]/10' },
          { href: '/dashboard/categories',icon: TrendingUp,   label: 'Categories',   color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
          { href: '/dashboard/settings',  icon: Users,        label: 'Settings',     color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
        ].map(action => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className="flex flex-col items-center gap-2 bg-white dark:bg-dark-card rounded-card border border-light-border dark:border-dark-border p-5 hover:border-[#f59e0b] hover:-translate-y-0.5 transition-all duration-200 text-center"
            >
              <div className={`w-10 h-10 rounded-btn ${action.color} flex items-center justify-center`}>
                <Icon size={20} />
              </div>
              <span className="text-sm font-semibold text-light-text dark:text-dark-text">{action.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
