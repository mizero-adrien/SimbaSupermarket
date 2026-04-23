'use client';

import { FormEvent, useEffect, useState } from 'react';
import { FolderTree, Pencil, Trash2, Save, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { createProduct, deleteCategory, getMasterProducts, getProductCategories, renameCategory } from '@/lib/productData';

export default function DashboardCategoriesPage() {
  const { user } = useAuth();
  const [productsCount, setProductsCount] = useState(0);
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const isSystemAdmin = user?.role === 'system_admin' || user?.role === 'admin';

  function refresh() {
    const products = getMasterProducts();
    setProductsCount(products.length);
    setCategories(getProductCategories(products));
  }

  useEffect(() => {
    refresh();
  }, []);

  function handleCreateCategory(e: FormEvent) {
    e.preventDefault();
    if (!isSystemAdmin) return;

    const name = newCategory.trim();
    if (!name) return;

    // Categories are derived from products, so create a hidden seed product that can be edited later.
    createProduct({
      name: `${name} Starter Item`,
      category: name,
      price: 1000,
      description: 'Placeholder product created by system admin. You can edit or delete it from Products.',
      image: undefined,
    });

    setNewCategory('');
    refresh();
  }

  function handleRenameCategory(oldName: string) {
    const nextName = renameValue.trim();
    if (!isSystemAdmin || !nextName || nextName === oldName) return;
    renameCategory(oldName, nextName);
    setEditing(null);
    setRenameValue('');
    refresh();
  }

  function handleDeleteCategory(name: string) {
    if (!isSystemAdmin) return;
    deleteCategory(name);
    refresh();
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-light-text dark:text-dark-text">Categories Management</h1>
        <p className="text-sm text-gray-500 mt-0.5">{categories.length} categories · {productsCount} products</p>
      </div>

      {!isSystemAdmin && (
        <div className="rounded-card border border-amber-200 bg-amber-50 text-amber-700 px-4 py-3 text-sm">
          Branch representatives can review category data. Only System Admin can perform CRUD actions.
        </div>
      )}

      <div className="bg-white dark:bg-dark-card rounded-card border border-light-border dark:border-dark-border p-5">
        <h2 className="font-bold text-light-text dark:text-dark-text mb-3">Create Category</h2>
        <form className="flex flex-col sm:flex-row gap-2" onSubmit={handleCreateCategory}>
          <input
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
            disabled={!isSystemAdmin}
            placeholder="New category name"
            className="flex-1 px-3 py-2 text-sm border border-light-border dark:border-dark-border rounded-btn bg-white dark:bg-dark-bg"
          />
          <button
            type="submit"
            disabled={!isSystemAdmin}
            className="px-4 py-2 text-sm font-semibold text-white bg-[#16a34a] rounded-btn disabled:opacity-60"
          >
            Add Category
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-dark-card rounded-card border border-light-border dark:border-dark-border overflow-hidden">
        <div className="px-5 py-4 border-b border-light-border dark:border-dark-border">
          <h2 className="font-bold text-light-text dark:text-dark-text">Category List</h2>
        </div>

        <div className="divide-y divide-light-border dark:divide-dark-border">
          {categories.map(category => (
            <div key={category.name} className="px-5 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-btn bg-[#16a34a]/10 text-[#16a34a] flex items-center justify-center">
                <FolderTree size={16} />
              </div>

              <div className="min-w-0 flex-1">
                {editing === category.name ? (
                  <input
                    value={renameValue}
                    onChange={e => setRenameValue(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-light-border dark:border-dark-border rounded-btn bg-white dark:bg-dark-bg"
                  />
                ) : (
                  <p className="text-sm font-semibold text-light-text dark:text-dark-text truncate">{category.name}</p>
                )}
                <p className="text-xs text-gray-500">{category.count} products</p>
              </div>

              {isSystemAdmin && (
                <div className="flex items-center gap-1.5">
                  {editing === category.name ? (
                    <>
                      <button onClick={() => handleRenameCategory(category.name)} className="p-2 border rounded-btn border-light-border dark:border-dark-border text-[#16a34a]">
                        <Save size={14} />
                      </button>
                      <button onClick={() => { setEditing(null); setRenameValue(''); }} className="p-2 border rounded-btn border-light-border dark:border-dark-border text-gray-500">
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { setEditing(category.name); setRenameValue(category.name); }} className="p-2 border rounded-btn border-light-border dark:border-dark-border text-blue-600">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDeleteCategory(category.name)} className="p-2 border rounded-btn border-light-border dark:border-dark-border text-red-500">
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
          {categories.length === 0 && <p className="p-6 text-sm text-gray-500 text-center">No categories found.</p>}
        </div>
      </div>
    </div>
  );
}
