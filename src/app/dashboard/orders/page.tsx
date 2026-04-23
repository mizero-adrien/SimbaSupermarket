'use client';

import { useEffect, useState } from 'react';
import {
  Clock, CheckCircle, AlertCircle, XCircle,
  Search, Filter, Eye, ChevronDown,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getBranchOrders, updateOrderStatus } from '@/lib/dashboardData';
import { getAllBranches } from '@/lib/branches';
import { Branch, BranchOrder, OrderStatus } from '@/types';
import { formatPrice } from '@/lib/formatPrice';
import { addNoShowFlag, getNoShowFlagsByPhone } from '@/lib/reviewData';

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending:   { label: 'Pending',   color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',     icon: Clock },
  confirmed: { label: 'Confirmed', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',       icon: CheckCircle },
  preparing: { label: 'Preparing', color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20', icon: AlertCircle },
  ready:     { label: 'Ready',     color: 'text-[#16a34a] bg-green-50 dark:bg-green-900/20',    icon: CheckCircle },
  delivered: { label: 'Delivered', color: 'text-gray-600 bg-gray-100 dark:bg-gray-700',          icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'text-red-500 bg-red-50 dark:bg-red-900/20',           icon: XCircle },
};

const ALL_STATUSES: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<BranchOrder[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<BranchOrder | null>(null);
  const [allBranches, setAllBranches] = useState<Branch[]>([]);
  const [flagMessage, setFlagMessage] = useState('');
  const isSystemAdmin = user?.role === 'system_admin' || user?.role === 'admin';

  useEffect(() => {
    setAllBranches(getAllBranches());
  }, []);

  useEffect(() => {
    if (!user) return;
    if (isSystemAdmin) {
      const all = allBranches.flatMap(b => getBranchOrders(b.id));
      setOrders(all);
      return;
    }
    if (user.branchId) setOrders(getBranchOrders(user.branchId));
  }, [user, isSystemAdmin, allBranches]);

  function handleStatusChange(orderId: string, newStatus: OrderStatus) {
    const target = orders.find(o => o.id === orderId);
    if (!target) return;

    updateOrderStatus(target.branchId, orderId, newStatus);
    if (isSystemAdmin) {
      const all = allBranches.flatMap(b => getBranchOrders(b.id));
      setOrders(all);
    } else if (user?.branchId) {
      setOrders(getBranchOrders(user.branchId));
    }

    if (selectedOrder?.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
    }
  }

  function flagNoShow(order: BranchOrder) {
    addNoShowFlag({
      customerPhone: order.customerPhone,
      branchId: order.branchId,
      orderId: order.id,
      reason: 'Did not show up',
    });
    setFlagMessage(`No-show flag added for ${order.customerName}.`);
  }

  const filtered = orders.filter(o => {
    const matchSearch = !search || o.customerName.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchBranch = branchFilter === 'all' || o.branchId === branchFilter;
    return matchSearch && matchStatus && matchBranch;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-light-text dark:text-dark-text">Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">{orders.length} total orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or order ID…"
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-light-border dark:border-dark-border rounded-btn bg-white dark:bg-dark-card text-light-text dark:text-dark-text focus:outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]"
          />
        </div>
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as OrderStatus | 'all')}
            className="pl-8 pr-8 py-2.5 text-sm border border-light-border dark:border-dark-border rounded-btn bg-white dark:bg-dark-card text-light-text dark:text-dark-text focus:outline-none focus:border-[#16a34a] appearance-none"
          >
            <option value="all">All Statuses</option>
            {ALL_STATUSES.map(s => (
              <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        {isSystemAdmin && (
          <div className="relative">
            <select
              value={branchFilter}
              onChange={e => setBranchFilter(e.target.value)}
              className="pl-3 pr-8 py-2.5 text-sm border border-light-border dark:border-dark-border rounded-btn bg-white dark:bg-dark-card text-light-text dark:text-dark-text focus:outline-none focus:border-[#16a34a] appearance-none"
            >
              <option value="all">All Branches</option>
              {allBranches.map(branch => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        )}
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {(['all', ...ALL_STATUSES] as const).map(s => {
          const count = s === 'all' ? orders.length : orders.filter(o => o.status === s).length;
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                statusFilter === s
                  ? 'bg-[#16a34a] text-white border-[#16a34a]'
                  : 'bg-white dark:bg-dark-card border-light-border dark:border-dark-border text-light-text dark:text-dark-text hover:border-[#16a34a]'
              }`}
            >
              {s === 'all' ? 'All' : STATUS_CONFIG[s].label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${statusFilter === s ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700'}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Orders table */}
      <div className="bg-white dark:bg-dark-card rounded-card border border-light-border dark:border-dark-border overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-sm">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-light-border dark:border-dark-border bg-gray-50 dark:bg-slate-800">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Items</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-light-border dark:divide-dark-border">
                {filtered.map(order => {
                  const cfg = STATUS_CONFIG[order.status];
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-mono text-xs text-gray-500">{order.id}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-light-text dark:text-dark-text">{order.customerName}</p>
                        <p className="text-xs text-gray-500">{order.customerPhone}</p>
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <p className="text-gray-600 dark:text-gray-400">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                        <p className="text-xs text-gray-400">{order.paymentMethod}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-light-text dark:text-dark-text">{formatPrice(order.total)}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="relative group">
                          <select
                            value={order.status}
                            onChange={e => handleStatusChange(order.id, e.target.value as OrderStatus)}
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full border-0 cursor-pointer appearance-none pr-6 ${cfg.color}`}
                          >
                            {ALL_STATUSES.map(s => (
                              <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                            ))}
                          </select>
                          <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-1.5 text-gray-400 hover:text-[#16a34a] hover:bg-[#16a34a]/10 rounded-btn transition-colors"
                        >
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order detail modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white dark:bg-dark-card rounded-card border border-light-border dark:border-dark-border w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-light-border dark:border-dark-border">
              <h2 className="font-bold text-light-text dark:text-dark-text">Order Details</h2>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex justify-between">
                <div>
                  <p className="text-xs text-gray-500">Order ID</p>
                  <p className="font-mono text-sm font-semibold text-light-text dark:text-dark-text">{selectedOrder.id}</p>
                </div>
                <span className={`self-start text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_CONFIG[selectedOrder.status].color}`}>
                  {STATUS_CONFIG[selectedOrder.status].label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500">Customer</p>
                  <p className="font-medium text-light-text dark:text-dark-text">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="font-medium text-light-text dark:text-dark-text">{selectedOrder.customerPhone}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Payment</p>
                  <p className="font-medium text-light-text dark:text-dark-text">{selectedOrder.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Delivery</p>
                  <p className="font-medium text-light-text dark:text-dark-text capitalize">{selectedOrder.deliveryType}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-2">Items</p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-light-text dark:text-dark-text">{item.product.name} × {item.quantity}</span>
                      <span className="font-semibold text-light-text dark:text-dark-text">{formatPrice(item.product.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-light-border dark:border-dark-border pt-3 flex justify-between font-bold text-light-text dark:text-dark-text">
                <span>Total</span>
                <span>{formatPrice(selectedOrder.total)}</span>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Update Status</p>
                <div className="grid grid-cols-3 gap-2">
                  {ALL_STATUSES.map(s => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(selectedOrder.id, s)}
                      className={`px-2 py-1.5 text-xs font-semibold rounded-btn border transition-colors ${
                        selectedOrder.status === s
                          ? 'bg-[#16a34a] text-white border-[#16a34a]'
                          : 'border-light-border dark:border-dark-border text-light-text dark:text-dark-text hover:border-[#16a34a]'
                      }`}
                    >
                      {STATUS_CONFIG[s].label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-btn border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-900/30 p-3">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div>
                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">Customer risk</p>
                    <p className="text-xs text-amber-700/80 dark:text-amber-200/80">
                      No-show flags: {getNoShowFlagsByPhone(selectedOrder.customerPhone).length}
                    </p>
                  </div>
                  <button
                    onClick={() => flagNoShow(selectedOrder)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-btn bg-amber-500 text-white hover:bg-amber-600"
                  >
                    Flag No-Show
                  </button>
                </div>
                {flagMessage && <p className="text-xs text-amber-700 dark:text-amber-300">{flagMessage}</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
