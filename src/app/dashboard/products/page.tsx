'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Package } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Product } from '@/types';
import { createProduct, deleteProduct, getMasterProducts, updateProduct } from '@/lib/productData';
import { formatPrice } from '@/lib/formatPrice';

interface ProductFormState {
  name: string;
  category: string;
  price: string;
  image: string;
  description: string;
}

const initialForm: ProductFormState = {
  name: '',
  category: '',
  price: '',
  image: '',
  description: '',
};

export default function DashboardProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState('');
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [form, setForm] = useState<ProductFormState>(initialForm);
  const isSystemAdmin = user?.role === 'system_admin' || user?.role === 'admin';

  useEffect(() => {
    setProducts(getMasterProducts());
  }, []);

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  }, [products, query]);

  function startEdit(product: Product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      category: product.category,
      price: String(product.price),
      image: product.image ?? '',
      description: product.description ?? '',
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(initialForm);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isSystemAdmin) return;

    const price = Number(form.price);
    if (!form.name.trim() || !form.category.trim() || Number.isNaN(price) || price <= 0) {
      return;
    }

    if (editingId) {
      const updated = updateProduct(editingId, {
        name: form.name.trim(),
        category: form.category.trim(),
        price,
        image: form.image.trim() || undefined,
        description: form.description.trim() || undefined,
      });
      setProducts(updated);
    } else {
      createProduct({
        name: form.name.trim(),
        category: form.category.trim(),
        price,
        image: form.image.trim() || undefined,
        description: form.description.trim() || undefined,
      });
      setProducts(getMasterProducts());
    }

    resetForm();
  }

  function handleDelete(productId: string | number) {
    if (!isSystemAdmin) return;
    const next = deleteProduct(productId);
    setProducts(next);
  }

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-light-text dark:text-dark-text">Products Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">{products.length} products in catalog</p>
        </div>
      </div>

      {!isSystemAdmin && (
        <div className="rounded-card border border-amber-200 bg-amber-50 text-amber-700 px-4 py-3 text-sm">
          Branch representatives can view products here. Only System Admin can create, update, or delete products.
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-1 bg-white dark:bg-dark-card rounded-card border border-light-border dark:border-dark-border p-5">
          <h2 className="font-bold text-light-text dark:text-dark-text mb-3">
            {editingId ? 'Edit Product' : 'Create Product'}
          </h2>

          <form className="space-y-3" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Product name"
              value={form.name}
              disabled={!isSystemAdmin}
              onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-light-border dark:border-dark-border rounded-btn bg-white dark:bg-dark-bg"
            />
            <input
              type="text"
              placeholder="Category"
              value={form.category}
              disabled={!isSystemAdmin}
              onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-light-border dark:border-dark-border rounded-btn bg-white dark:bg-dark-bg"
            />
            <input
              type="number"
              placeholder="Price"
              value={form.price}
              disabled={!isSystemAdmin}
              onChange={e => setForm(prev => ({ ...prev, price: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-light-border dark:border-dark-border rounded-btn bg-white dark:bg-dark-bg"
            />
            <input
              type="url"
              placeholder="Image URL (optional)"
              value={form.image}
              disabled={!isSystemAdmin}
              onChange={e => setForm(prev => ({ ...prev, image: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-light-border dark:border-dark-border rounded-btn bg-white dark:bg-dark-bg"
            />
            <textarea
              placeholder="Description (optional)"
              value={form.description}
              disabled={!isSystemAdmin}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 text-sm border border-light-border dark:border-dark-border rounded-btn bg-white dark:bg-dark-bg"
            />

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={!isSystemAdmin}
                className="flex-1 flex items-center justify-center gap-1.5 bg-[#16a34a] text-white text-sm font-semibold py-2 rounded-btn disabled:opacity-60"
              >
                <Plus size={14} />
                {editingId ? 'Update Product' : 'Add Product'}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} className="px-3 py-2 text-sm border rounded-btn border-light-border dark:border-dark-border">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="xl:col-span-2 bg-white dark:bg-dark-card rounded-card border border-light-border dark:border-dark-border">
          <div className="p-4 border-b border-light-border dark:border-dark-border flex items-center justify-between gap-3">
            <h2 className="font-bold text-light-text dark:text-dark-text">Product List</h2>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search products"
              className="w-52 px-3 py-2 text-sm border border-light-border dark:border-dark-border rounded-btn bg-white dark:bg-dark-bg"
            />
          </div>

          <div className="divide-y divide-light-border dark:divide-dark-border max-h-[70vh] overflow-auto">
            {filteredProducts.map(product => (
              <div key={product.id} className="flex items-center gap-3 px-4 py-3">
                <div className="w-9 h-9 rounded-btn bg-[#16a34a]/10 text-[#16a34a] flex items-center justify-center">
                  <Package size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-light-text dark:text-dark-text truncate">{product.name}</p>
                  <p className="text-xs text-gray-500 truncate">{product.category} · {formatPrice(product.price)}</p>
                </div>
                {isSystemAdmin && (
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => startEdit(product)} className="p-2 rounded-btn border border-light-border dark:border-dark-border text-blue-600">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="p-2 rounded-btn border border-light-border dark:border-dark-border text-red-500">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            ))}
            {filteredProducts.length === 0 && (
              <p className="p-6 text-sm text-gray-500 text-center">No products found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
