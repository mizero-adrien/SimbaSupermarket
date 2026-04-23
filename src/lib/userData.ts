import { User, UserRole } from '@/types';
import { DEMO_USERS } from '@/lib/branches';

const USERS_STORAGE_KEY = 'simba_users';

function getDemoIds() {
  return new Set(DEMO_USERS.map(u => u.id));
}

export function getAllUsers(): User[] {
  if (typeof window === 'undefined') return DEMO_USERS;

  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    const stored: User[] = raw ? JSON.parse(raw) : [];
    const demoIds = getDemoIds();
    const customUsers = stored.filter(u => !demoIds.has(u.id));
    return [...DEMO_USERS, ...customUsers];
  } catch {
    return DEMO_USERS;
  }
}

export function saveAllUsers(users: User[]) {
  if (typeof window === 'undefined') return;

  const demoIds = getDemoIds();
  const customOnly = users.filter(u => !demoIds.has(u.id));
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(customOnly));
}

export function createUser(data: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  branchId?: string;
}): { ok: boolean; error?: string; user?: User } {
  const users = getAllUsers();
  if (users.some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
    return { ok: false, error: 'An account with this email already exists.' };
  }

  const user: User = {
    id: `user-${Date.now()}`,
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    password: data.password,
    role: data.role,
    phone: data.phone,
    branchId: data.branchId,
    createdAt: new Date().toISOString(),
  };

  saveAllUsers([...users, user]);
  return { ok: true, user };
}

export function updateUser(userId: string, patch: Partial<Omit<User, 'id' | 'createdAt'>>) {
  const users = getAllUsers();
  const updated = users.map(u => (u.id === userId ? { ...u, ...patch } : u));
  saveAllUsers(updated);
  return updated.find(u => u.id === userId) ?? null;
}

export function getUserByEmail(email: string): User | null {
  const target = email.trim().toLowerCase();
  return getAllUsers().find(u => u.email.toLowerCase() === target) ?? null;
}

export function resetUserPassword(email: string, nextPassword: string): { ok: boolean; error?: string } {
  const target = getUserByEmail(email);
  if (!target) return { ok: false, error: 'Account not found.' };
  updateUser(target.id, { password: nextPassword });
  return { ok: true };
}

export function deleteUser(userId: string): { ok: boolean; error?: string } {
  const demoIds = getDemoIds();
  if (demoIds.has(userId)) {
    return { ok: false, error: 'Demo users cannot be deleted.' };
  }

  const users = getAllUsers();
  const next = users.filter(u => u.id !== userId);
  saveAllUsers(next);
  return { ok: true };
}
