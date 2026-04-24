'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Tag,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  Store,
  ShoppingBag,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getBranchById } from '@/lib/branches';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/products', label: 'Products', icon: Package },
  { href: '/dashboard/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/dashboard/categories', label: 'Categories', icon: Tag },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const branch = user?.branchId ? getBranchById(user.branchId) : null;
  const isSystemAdmin = user?.role === 'system_admin' || user?.role === 'admin';

  function handleLogout() {
    logout();
    router.push('/');
  }

  function isActive(item: typeof NAV_ITEMS[0]) {
    if (item.exact) return pathname === item.href;
    return (pathname ?? '').startsWith(item.href);
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-light-border dark:border-dark-border ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 bg-[#16a34a] rounded-btn flex items-center justify-center text-white font-bold text-sm shrink-0">
          S
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="font-bold text-sm text-light-text dark:text-dark-text truncate">Simba Dashboard</p>
            <p className="text-xs text-gray-500 truncate">{isSystemAdmin ? 'System Admin' : branch?.name ?? 'Branch Representative'}</p>
          </div>
        )}
      </div>

      {/* Branch info pill */}
      {!collapsed && branch && (
        <div className="mx-3 mt-3 p-3 rounded-btn bg-[#16a34a]/10 border border-[#16a34a]/20">
          <div className="flex items-center gap-2">
            <Store size={14} className="text-[#16a34a] shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#16a34a] truncate">{branch.name}</p>
              <p className="text-xs text-gray-500 truncate">{branch.location}</p>
            </div>
          </div>
        </div>
      )}

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-btn text-sm font-medium transition-colors ${
                active
                  ? 'bg-[#16a34a] text-white'
                  : 'text-light-text dark:text-dark-text hover:bg-gray-100 dark:hover:bg-slate-700'
              } ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-light-border dark:border-dark-border px-3 py-3 space-y-1">
        <Link
          href="/products"
          onClick={() => setMobileOpen(false)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-btn text-sm font-medium text-light-text dark:text-dark-text hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Storefront' : undefined}
        >
          <ShoppingBag size={18} className="shrink-0" />
          {!collapsed && <span>Storefront</span>}
        </Link>

        {!collapsed && user && (
          <div className="px-3 py-2">
            <p className="text-xs font-semibold text-light-text dark:text-dark-text truncate">{user.name}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        )}

        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-btn text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(v => !v)}
        className="lg:hidden fixed top-4 left-4 z-50 w-9 h-9 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-btn shadow-md flex items-center justify-center"
      >
        <Menu size={18} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside className={`lg:hidden fixed top-0 left-0 h-full w-64 bg-white dark:bg-dark-card border-r border-light-border dark:border-dark-border z-50 shadow-xl transition-transform duration-200 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex flex-col h-screen sticky top-0 bg-white dark:bg-dark-card border-r border-light-border dark:border-dark-border transition-all duration-200 ${collapsed ? 'w-16' : 'w-60'}`}>
        {sidebarContent}
        <button
          onClick={() => setCollapsed(v => !v)}
          className="absolute -right-3 top-20 w-6 h-6 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
        >
          <ChevronLeft size={12} className={`transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </aside>
    </>
  );
}
