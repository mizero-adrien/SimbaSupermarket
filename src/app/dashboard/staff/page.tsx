'use client';

import { useEffect, useState } from 'react';
import { Clock, CheckCircle, AlertCircle, XCircle, PackageCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getBranchOrders, updateOrderStatus } from '@/lib/dashboardData';
import { BranchOrder, OrderStatus } from '@/types';
import { formatPrice } from '@/lib/formatPrice';

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending:   { label: 'Pending',   color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',     icon: Clock },
  confirmed: { label: 'Confirmed', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',       icon: CheckCircle },
  preparing: { label: 'Preparing', color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20', icon: AlertCircle },
  ready:     { label: 'Ready',     color: 'text-[#16a34a] bg-green-50 dark:bg-green-900/20',    icon: CheckCircle },
  delivered: { label: 'Delivered', color: 'text-gray-600 bg-gray-100 dark:bg-gray-700',          icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'text-red-500 bg-red-50 dark:bg-red-900/20',           icon: XCircle },
};

export default function StaffOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<BranchOrder[]>([]);

  function loadOrders() {
    if (!user?.branchId || !user?.id) return;
    const all = getBranchOrders(user.branchId);
    setOrders(all.filter(o => o.assignedStaffId === user.id));
  }

  useEffect(() => { loadOrders(); }, [user]);

  function markPreparing(order: BranchOrder) {
    updateOrderStatus(order.branchId, order.id, 'preparing');
    loadOrders();
  }

  function markReady(order: BranchOrder) {
    updateOrderStatus(order.branchId, order.id, 'ready');
    loadOrders();
  }

  const active = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');
  const done = orders.filter(o => o.status === 'delivered' || o.status === 'ready');

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-light-text dark:text-dark-text">My Orders</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Orders assigned to you · {active.length} active
        </p>
      </div>

      {/* Active orders */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Active</h2>
        {active.length === 0 ? (
          <div className="bg-white dark:bg-dark-card rounded-card border border-light-border dark:border-dark-border p-10 text-center">
            <PackageCheck size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">No active orders assigned to you yet.</p>
            <p className="text-xs text-gray-400 mt-1">Ask your branch manager to assign you some orders.</p>
          </div>
        ) : (
          active.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(order => {
            const cfg = STATUS_CONFIG[order.status];
            const Icon = cfg.icon;
            return (
              <div
                key={order.id}
                className="bg-white dark:bg-dark-card rounded-card border border-light-border dark:border-dark-border p-5 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-xs text-gray-500">{order.id}</span>
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.color}`}>
                      <Icon size={10} /> {cfg.label}
                    </span>
                  </div>
                  <p className="font-semibold text-light-text dark:text-dark-text">{order.customerName}</p>
                  <p className="text-xs text-gray-500">{order.customerPhone} · {order.paymentMethod}</p>
                  <div className="pt-1 space-y-0.5">
                    {order.items.map((item, i) => (
                      <p key={i} className="text-sm text-gray-700 dark:text-gray-300">
                        {item.product.name} <span className="text-gray-400">×{item.quantity}</span>
                      </p>
                    ))}
                  </div>
                  <p className="text-sm font-bold text-light-text dark:text-dark-text pt-1">{formatPrice(order.total)}</p>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col gap-2 shrink-0">
                  {(order.status === 'confirmed' || order.status === 'pending') && (
                    <button
                      onClick={() => markPreparing(order)}
                      className="px-4 py-2 text-xs font-bold rounded-btn bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                    >
                      Start Preparing
                    </button>
                  )}
                  {order.status === 'preparing' && (
                    <button
                      onClick={() => markReady(order)}
                      className="px-4 py-2 text-xs font-bold rounded-btn bg-[#16a34a] text-white hover:bg-[#15803d] transition-colors"
                    >
                      Mark Ready for Pickup
                    </button>
                  )}
                  {order.status === 'ready' && (
                    <span className="px-4 py-2 text-xs font-bold rounded-btn bg-green-50 dark:bg-green-900/20 text-[#16a34a] border border-green-200 dark:border-green-800 text-center">
                      Awaiting Customer
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* Completed orders */}
      {done.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Completed / Ready</h2>
          <div className="bg-white dark:bg-dark-card rounded-card border border-light-border dark:border-dark-border divide-y divide-light-border dark:divide-dark-border">
            {done.map(order => {
              const cfg = STATUS_CONFIG[order.status];
              return (
                <div key={order.id} className="flex items-center gap-4 px-5 py-3.5 opacity-60">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-light-text dark:text-dark-text">{order.customerName}</p>
                    <p className="text-xs text-gray-500">{order.id} · {order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.color}`}>{cfg.label}</span>
                  <span className="text-sm font-semibold text-light-text dark:text-dark-text">{formatPrice(order.total)}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
