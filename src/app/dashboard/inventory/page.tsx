'use client';

import { useEffect, useState } from 'react';
import { Search, AlertTriangle, Package, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  getOrInitBranchInventory,
  updateProductStock,
  markProductOutOfStock,
  saveBranchProducts,
} from '@/lib/dashboardData';
import { getMasterProducts } from '@/lib/productData';
import { BranchProduct } from '@/types';
import { formatPrice } from '@/lib/formatPrice';

export default function InventoryPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<BranchProduct[]>([]);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [editStock, setEditStock] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  function load() {
    if (!user?.branchId) return;
    setProducts(getOrInitBranchInventory(user.branchId));
  }

  useEffect(() => { load(); }, [user]);

  function handleResetInventory() {
    if (!user?.branchId) return;
    const seeded: BranchProduct[] = getMasterProducts().map(p => ({
      ...p,
      branchId: user.branchId!,
      stock: 50,
      isAvailable: true,
      addedAt: new Date().toISOString(),
    }));
    saveBranchProducts(user.branchId, seeded);
    setProducts(seeded);
  }

  function saveEdit(productId: string | number) {
    if (!user?.branchId) return;
    const n = parseInt(editStock, 10);
    if (isNaN(n) || n < 0) return;
    const updated = updateProductStock(user.branchId, productId, n);
    setProducts(updated);
    setEditingId(null);
  }

  function handleMarkOutOfStock(productId: string | number) {
    if (!user?.branchId) return;
    const updated = markProductOutOfStock(user.branchId, productId);
    setProducts(updated);
  }

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category))).sort()];

  const filtered = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'all' || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const outOfStock = products.filter(p => p.stock === 0).length;
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= 5).length;

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-light-text dark:text-dark-text">Inventory</h1>
          <p className="text-sm text-gray-500 mt-0.5">{products.length} products · {outOfStock} out of stock · {lowStock} low stock</p>
        </div>
        <button
          onClick={handleResetInventory}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-btn border border-light-border dark:border-dark-border text-light-text dark:text-dark-text hover:border-[#16a34a] transition-colors"
        >
          <RefreshCw size={14} /> Reset to 50 each
        </button>
      </div>

      {/* Alert banners */}
      {(outOfStock > 0 || lowStock > 0) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {outOfStock > 0 && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-btn bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
              <AlertTriangle size={15} />
              <span><strong>{outOfStock}</strong> product{outOfStock !== 1 ? 's' : ''} out of stock</span>
            </div>
          )}
          {lowStock > 0 && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-btn bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-sm">
              <AlertTriangle size={15} />
              <span><strong>{lowStock}</strong> product{lowStock !== 1 ? 's' : ''} running low (≤5)</span>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products…"
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-light-border dark:border-dark-border rounded-btn bg-white dark:bg-dark-card text-light-text dark:text-dark-text focus:outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="px-3 py-2.5 text-sm border border-light-border dark:border-dark-border rounded-btn bg-white dark:bg-dark-card text-light-text dark:text-dark-text focus:outline-none focus:border-[#16a34a]"
        >
          {categories.map(c => (
            <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>
          ))}
        </select>
      </div>

      {/* Product table */}
      <div className="bg-white dark:bg-dark-card rounded-card border border-light-border dark:border-dark-border overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Package size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">No products found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-light-border dark:border-dark-border bg-gray-50 dark:bg-slate-800">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Category</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Price</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-light-border dark:divide-dark-border">
                {filtered.map(product => {
                  const isEditing = editingId === product.id;
                  const stockColor = product.stock === 0
                    ? 'text-red-600 bg-red-50 dark:bg-red-900/20'
                    : product.stock <= 5
                    ? 'text-amber-600 bg-amber-50 dark:bg-amber-900/20'
                    : 'text-[#16a34a] bg-green-50 dark:bg-green-900/20';

                  return (
                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-light-text dark:text-dark-text">{product.name}</p>
                      </td>
                      <td className="px-5 py-3.5 hidden sm:table-cell">
                        <span className="text-xs text-gray-500">{product.category}</span>
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <span className="text-sm text-light-text dark:text-dark-text">{formatPrice(product.price)}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              value={editStock}
                              onChange={e => setEditStock(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') saveEdit(product.id);
                                if (e.key === 'Escape') setEditingId(null);
                              }}
                              autoFocus
                              className="w-20 px-2 py-1 text-sm border border-[#16a34a] rounded-btn bg-white dark:bg-dark-card text-light-text dark:text-dark-text focus:outline-none"
                            />
                            <button onClick={() => saveEdit(product.id)} className="text-xs font-semibold text-[#16a34a] hover:underline">Save</button>
                            <button onClick={() => setEditingId(null)} className="text-xs text-gray-400 hover:text-gray-600">✕</button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setEditingId(product.id); setEditStock(String(product.stock)); }}
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${stockColor} hover:opacity-80 transition-opacity`}
                          >
                            {product.stock === 0 ? 'Out of stock' : `${product.stock} left`}
                          </button>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {product.stock > 0 && (
                          <button
                            onClick={() => handleMarkOutOfStock(product.id)}
                            className="text-xs text-red-500 hover:text-red-700 hover:underline font-medium"
                          >
                            Mark out of stock
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
