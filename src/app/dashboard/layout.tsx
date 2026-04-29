'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
    if (!isLoading && user && user.role === 'customer') {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center">
        <span className="w-8 h-8 border-2 border-[#16a34a] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const ALLOWED_ROLES = ['branch_representative', 'branch_manager', 'branch_staff', 'admin', 'system_admin'];
  if (!user || !ALLOWED_ROLES.includes(user.role)) return null;

  return (
    <div className="flex min-h-screen bg-light-bg dark:bg-dark-bg">
      <DashboardSidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <main className="flex-1 p-6 lg:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
