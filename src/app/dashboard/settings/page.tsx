'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Settings, UserPlus, Store, Trash2, Save, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Branch, User, UserRole } from '@/types';
import { createUser, deleteUser, getAllUsers, updateUser } from '@/lib/userData';
import { getAllBranches, removeBranchById, upsertBranch } from '@/lib/branches';

interface UserForm {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  branchId: string;
}

interface BranchForm {
  id: string;
  name: string;
  location: string;
  address: string;
  phone: string;
  hours: string;
  image: string;
}

const initialUserForm: UserForm = {
  name: '',
  email: '',
  password: 'Branch@2024',
  role: 'branch_representative',
  branchId: '',
};

const initialBranchForm: BranchForm = {
  id: '',
  name: '',
  location: '',
  address: '',
  phone: '',
  hours: 'Mon–Sun: 7:00 AM – 10:00 PM',
  image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=400&fit=crop',
};

export default function DashboardSettingsPage() {
  const { user } = useAuth();
  const isSystemAdmin = user?.role === 'system_admin' || user?.role === 'admin';

  const [users, setUsers] = useState<User[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [userForm, setUserForm] = useState<UserForm>(initialUserForm);
  const [branchForm, setBranchForm] = useState<BranchForm>(initialBranchForm);

  function refresh() {
    setUsers(getAllUsers());
    setBranches(getAllBranches());
  }

  useEffect(() => {
    refresh();
  }, []);

  function handleCreateUser(e: FormEvent) {
    e.preventDefault();
    if (!isSystemAdmin) return;

    const roleNeedsBranch = userForm.role === 'branch_representative' || userForm.role === 'branch_manager';
    const result = createUser({
      name: userForm.name,
      email: userForm.email,
      password: userForm.password,
      role: userForm.role,
      branchId: roleNeedsBranch ? userForm.branchId || undefined : undefined,
    });

    if (!result.ok) return;
    setUserForm(initialUserForm);
    refresh();
  }

  function handleRoleChange(targetUser: User, nextRole: UserRole) {
    if (!isSystemAdmin) return;
    const needsBranch = nextRole === 'branch_representative' || nextRole === 'branch_manager';
    const fallbackBranch = branches[0]?.id;

    updateUser(targetUser.id, {
      role: nextRole,
      branchId: needsBranch ? targetUser.branchId ?? fallbackBranch : undefined,
    });
    refresh();
  }

  function handleAssignBranch(targetUser: User, branchId: string) {
    if (!isSystemAdmin) return;
    updateUser(targetUser.id, { branchId });
    refresh();
  }

  function handleDeleteUser(userId: string) {
    if (!isSystemAdmin) return;
    deleteUser(userId);
    refresh();
  }

  function handleCreateOrUpdateBranch(e: FormEvent) {
    e.preventDefault();
    if (!isSystemAdmin) return;

    const id = branchForm.id.trim() || branchForm.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
    if (!id) return;

    const existing = branches.find(b => b.id === id);
    const payload: Branch = {
      id,
      name: branchForm.name.trim(),
      location: branchForm.location.trim(),
      address: branchForm.address.trim(),
      coordinates: existing?.coordinates,
      phone: branchForm.phone.trim(),
      hours: branchForm.hours.trim(),
      image: branchForm.image.trim() || initialBranchForm.image,
      isOpen: existing?.isOpen ?? true,
      managerId: existing?.managerId,
      rating: existing?.rating ?? 4.0,
      reviewCount: existing?.reviewCount ?? 1,
      description: existing?.description ?? `${branchForm.name.trim()} official branch profile`,
      services: existing?.services ?? ['Fresh Produce', 'Pantry Staples'],
      highlights: existing?.highlights ?? ['Official Simba branch'],
      mapUrl: existing?.mapUrl ?? `https://maps.google.com/?q=${encodeURIComponent(branchForm.address.trim() || branchForm.name.trim())}`,
      testimonials: existing?.testimonials ?? [],
    };

    upsertBranch(payload);
    setBranchForm(initialBranchForm);
    refresh();
  }

  function startBranchEdit(branch: Branch) {
    setBranchForm({
      id: branch.id,
      name: branch.name,
      location: branch.location,
      address: branch.address,
      phone: branch.phone,
      hours: branch.hours,
      image: branch.image,
    });
  }

  function handleDeleteBranch(branchId: string) {
    if (!isSystemAdmin) return;
    removeBranchById(branchId);

    const allUsers = getAllUsers();
    allUsers
      .filter(u => u.branchId === branchId)
      .forEach(u => updateUser(u.id, { branchId: undefined, role: 'customer' }));

    refresh();
  }

  return (
    <div className="max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-light-text dark:text-dark-text">System Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage users, branch representatives, and branch profiles</p>
      </div>

      {!isSystemAdmin && (
        <div className="rounded-card border border-amber-200 bg-amber-50 text-amber-700 px-4 py-3 text-sm">
          You are a branch representative. Only System Admin can perform management CRUD operations.
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <section className="bg-white dark:bg-dark-card rounded-card border border-light-border dark:border-dark-border p-5">
          <h2 className="font-bold text-light-text dark:text-dark-text flex items-center gap-2 mb-3">
            <UserPlus size={16} className="text-[#16a34a]" /> Create User / Branch Representative
          </h2>

          <form className="space-y-3" onSubmit={handleCreateUser}>
            <input
              placeholder="Full name"
              value={userForm.name}
              disabled={!isSystemAdmin}
              onChange={e => setUserForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-light-border dark:border-dark-border rounded-btn bg-white dark:bg-dark-bg"
            />
            <input
              type="email"
              placeholder="Email"
              value={userForm.email}
              disabled={!isSystemAdmin}
              onChange={e => setUserForm(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-light-border dark:border-dark-border rounded-btn bg-white dark:bg-dark-bg"
            />
            <input
              type="text"
              placeholder="Password"
              value={userForm.password}
              disabled={!isSystemAdmin}
              onChange={e => setUserForm(prev => ({ ...prev, password: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-light-border dark:border-dark-border rounded-btn bg-white dark:bg-dark-bg"
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                value={userForm.role}
                disabled={!isSystemAdmin}
                onChange={e => setUserForm(prev => ({ ...prev, role: e.target.value as UserRole }))}
                className="px-3 py-2 text-sm border border-light-border dark:border-dark-border rounded-btn bg-white dark:bg-dark-bg"
              >
                <option value="branch_representative">Branch Representative</option>
                <option value="system_admin">System Admin</option>
                <option value="customer">Customer</option>
              </select>
              <select
                value={userForm.branchId}
                disabled={!isSystemAdmin || !(userForm.role === 'branch_representative' || userForm.role === 'branch_manager')}
                onChange={e => setUserForm(prev => ({ ...prev, branchId: e.target.value }))}
                className="px-3 py-2 text-sm border border-light-border dark:border-dark-border rounded-btn bg-white dark:bg-dark-bg"
              >
                <option value="">Select branch</option>
                {branches.map(branch => (
                  <option key={branch.id} value={branch.id}>{branch.name}</option>
                ))}
              </select>
            </div>

            <button disabled={!isSystemAdmin} className="w-full py-2 text-sm font-semibold text-white bg-[#16a34a] rounded-btn disabled:opacity-60">
              Create Account
            </button>
          </form>
        </section>

        <section className="bg-white dark:bg-dark-card rounded-card border border-light-border dark:border-dark-border p-5">
          <h2 className="font-bold text-light-text dark:text-dark-text flex items-center gap-2 mb-3">
            <Store size={16} className="text-[#16a34a]" /> Branch CRUD
          </h2>

          <form className="space-y-3" onSubmit={handleCreateOrUpdateBranch}>
            <input
              placeholder="Branch ID (optional when creating)"
              value={branchForm.id}
              disabled={!isSystemAdmin}
              onChange={e => setBranchForm(prev => ({ ...prev, id: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-light-border dark:border-dark-border rounded-btn bg-white dark:bg-dark-bg"
            />
            <input
              placeholder="Branch name"
              value={branchForm.name}
              disabled={!isSystemAdmin}
              onChange={e => setBranchForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-light-border dark:border-dark-border rounded-btn bg-white dark:bg-dark-bg"
            />
            <input
              placeholder="Location"
              value={branchForm.location}
              disabled={!isSystemAdmin}
              onChange={e => setBranchForm(prev => ({ ...prev, location: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-light-border dark:border-dark-border rounded-btn bg-white dark:bg-dark-bg"
            />
            <input
              placeholder="Address"
              value={branchForm.address}
              disabled={!isSystemAdmin}
              onChange={e => setBranchForm(prev => ({ ...prev, address: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-light-border dark:border-dark-border rounded-btn bg-white dark:bg-dark-bg"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                placeholder="Phone"
                value={branchForm.phone}
                disabled={!isSystemAdmin}
                onChange={e => setBranchForm(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-light-border dark:border-dark-border rounded-btn bg-white dark:bg-dark-bg"
              />
              <input
                placeholder="Hours"
                value={branchForm.hours}
                disabled={!isSystemAdmin}
                onChange={e => setBranchForm(prev => ({ ...prev, hours: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-light-border dark:border-dark-border rounded-btn bg-white dark:bg-dark-bg"
              />
            </div>
            <input
              placeholder="Image URL"
              value={branchForm.image}
              disabled={!isSystemAdmin}
              onChange={e => setBranchForm(prev => ({ ...prev, image: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-light-border dark:border-dark-border rounded-btn bg-white dark:bg-dark-bg"
            />

            <button disabled={!isSystemAdmin} className="w-full py-2 text-sm font-semibold text-white bg-[#16a34a] rounded-btn disabled:opacity-60 flex items-center justify-center gap-2">
              <Save size={14} /> Save Branch
            </button>
          </form>
        </section>
      </div>

      <section className="bg-white dark:bg-dark-card rounded-card border border-light-border dark:border-dark-border overflow-hidden">
        <div className="px-5 py-4 border-b border-light-border dark:border-dark-border">
          <h2 className="font-bold text-light-text dark:text-dark-text flex items-center gap-2">
            <Shield size={16} className="text-[#16a34a]" /> Users and Role Assignment
          </h2>
        </div>

        <div className="divide-y divide-light-border dark:divide-dark-border">
          {users.map(item => (
            <div key={item.id} className="px-5 py-3 flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-light-text dark:text-dark-text truncate">{item.name}</p>
                <p className="text-xs text-gray-500 truncate">{item.email}</p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={item.role}
                  disabled={!isSystemAdmin}
                  onChange={e => handleRoleChange(item, e.target.value as UserRole)}
                  className="px-2 py-1.5 text-xs border border-light-border dark:border-dark-border rounded-btn bg-white dark:bg-dark-bg"
                >
                  <option value="customer">Customer</option>
                  <option value="branch_representative">Branch Representative</option>
                  <option value="system_admin">System Admin</option>
                </select>

                {(item.role === 'branch_representative' || item.role === 'branch_manager') && (
                  <select
                    value={item.branchId ?? ''}
                    disabled={!isSystemAdmin}
                    onChange={e => handleAssignBranch(item, e.target.value)}
                    className="px-2 py-1.5 text-xs border border-light-border dark:border-dark-border rounded-btn bg-white dark:bg-dark-bg"
                  >
                    <option value="">Select branch</option>
                    {branches.map(branch => (
                      <option key={branch.id} value={branch.id}>{branch.name}</option>
                    ))}
                  </select>
                )}

                {isSystemAdmin && (
                  <button onClick={() => handleDeleteUser(item.id)} className="p-2 border border-light-border dark:border-dark-border rounded-btn text-red-500">
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white dark:bg-dark-card rounded-card border border-light-border dark:border-dark-border overflow-hidden">
        <div className="px-5 py-4 border-b border-light-border dark:border-dark-border">
          <h2 className="font-bold text-light-text dark:text-dark-text">Branch Directory</h2>
        </div>
        <div className="divide-y divide-light-border dark:divide-dark-border">
          {branches.map(branch => (
            <div key={branch.id} className="px-5 py-3 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-light-text dark:text-dark-text">{branch.name}</p>
                <p className="text-xs text-gray-500">{branch.id} · {branch.location}</p>
              </div>
              {isSystemAdmin && (
                <div className="flex items-center gap-2">
                  <button onClick={() => startBranchEdit(branch)} className="px-3 py-1.5 text-xs font-semibold border border-light-border dark:border-dark-border rounded-btn text-blue-600">
                    Edit
                  </button>
                  <button onClick={() => handleDeleteBranch(branch.id)} className="px-3 py-1.5 text-xs font-semibold border border-light-border dark:border-dark-border rounded-btn text-red-500">
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <div className="rounded-card border border-light-border dark:border-dark-border bg-white dark:bg-dark-card p-4 text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
        <Settings size={15} className="text-[#16a34a]" />
        System Admin can assign branch-representative roles to a specific branch and manage users, branches, categories, products, and orders with full CRUD.
      </div>
    </div>
  );
}
