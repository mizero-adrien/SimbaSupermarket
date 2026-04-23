'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ShoppingCart, Package, TrendingUp, Users,
  ArrowUpRight, Clock, CheckCircle, AlertCircle, XCircle, ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getAllBranches, getBranchById } from '@/lib/branches';
import { getBranchOrders } from '@/lib/dashboardData';
import { BranchOrder, OrderStatus } from '@/types';
import { formatPrice } from '@/lib/formatPrice';

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending:   { label: 'Pending',   color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',   icon: Clock },
  confirmed: { label: 'Confirmed', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',     icon: CheckCircle },
  preparing: { label: 'Preparing', color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20', icon: AlertCircle },
  ready:     { label: 'Ready',     color: 'text-[#16a34a] bg-green-50 dark:bg-green-900/20',  icon: CheckCircle },
  delivered: { label: 'Delivered', color: 'text-gray-600 bg-gray-100 dark:bg-gray-700',        icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'text-red-500 bg-red-50 dark:bg-red-900/20',         icon: XCircle },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<BranchOrder[]>([]);

  const isSystemAdmin = user?.role === 'system_admin' || user?.role === 'admin';
  const branch = user?.branchId ? getBranchById(user.branchId) : null;

  useEffect(() => {
    if (!user) return;

    if (isSystemAdmin) {
      const all = getAllBranches().flatMap(b => getBranchOrders(b.id));
      setOrders(all);
      return;
    }

    if (user.branchId) {
      setOrders(getBranchOrders(user.branchId));
    }
  }, [user, isSystemAdmin]);

  const revenue = orders.reduce((s, o) => o.status !== 'cancelled' ? s + o.total : s, 0);
  const pending = orders.filter(o => o.status === 'pending').length;
  const customers = new Set(orders.map(o => o.customerId)).size;

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const statusCounts = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {});

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
          { label: 'Total Revenue', value: formatPrice(revenue), icon: TrendingUp, color: 'text-[#16a34a]', bg: 'bg-[#16a34a]/10' },
          { label: 'Total Orders', value: String(orders.length), icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Pending Orders', value: String(pending), icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="lg:col-span-2 bg-white dark:bg-dark-card rounded-card border border-light-border dark:border-dark-border">
          <div className="flex items-center justify-between px-5 py-4 border-b border-light-border dark:border-dark-border">
            <h2 className="font-bold text-light-text dark:text-dark-text">Recent Orders</h2>
            <Link href="/dashboard/orders" className="text-xs text-[#16a34a] font-semibold flex items-center gap-0.5 hover:underline">
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
        </div>

        {/* Order status breakdown */}
        <div className="bg-white dark:bg-dark-card rounded-card border border-light-border dark:border-dark-border">
          <div className="px-5 py-4 border-b border-light-border dark:border-dark-border">
            <h2 className="font-bold text-light-text dark:text-dark-text">Order Status</h2>
          </div>
          <div className="p-5 space-y-3">
            {(Object.keys(STATUS_CONFIG) as OrderStatus[]).map(status => {
              const cfg = STATUS_CONFIG[status];
              const count = statusCounts[status] ?? 0;
              const pct = orders.length > 0 ? Math.round((count / orders.length) * 100) : 0;
              const Icon = cfg.icon;
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${cfg.color} px-2 py-0.5 rounded-full`}>
                      <Icon size={10} />
                      {cfg.label}
                    </span>
                    <span className="text-xs font-semibold text-light-text dark:text-dark-text">{count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                    <div className="h-full bg-[#16a34a] rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="px-5 pb-5">
            <Link
              href="/dashboard/orders"
              className="w-full flex items-center justify-center gap-1.5 text-sm font-semibold text-[#16a34a] border border-[#16a34a] rounded-btn py-2 hover:bg-[#16a34a]/5 transition-colors"
            >
              Manage Orders <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { href: '/dashboard/products', icon: Package, label: 'Add Product', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
          { href: '/dashboard/orders', icon: ShoppingCart, label: 'View Orders', color: 'text-[#16a34a] bg-green-50 dark:bg-green-900/20' },
          { href: '/dashboard/categories', icon: TrendingUp, label: 'Categories', color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
          { href: '/dashboard/settings', icon: Users, label: 'Settings', color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
        ].map(action => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className="flex flex-col items-center gap-2 bg-white dark:bg-dark-card rounded-card border border-light-border dark:border-dark-border p-5 hover:border-[#16a34a] hover:-translate-y-0.5 transition-all duration-200 text-center"
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
