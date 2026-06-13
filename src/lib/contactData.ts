import { ContactMessage } from '@/types';

const KEY = 'simba_contact_messages';

export function getContactMessages(): ContactMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ContactMessage[]) : [];
  } catch {
    return [];
  }
}

export function saveContactMessage(data: Omit<ContactMessage, 'id' | 'createdAt' | 'read'>): ContactMessage {
  const message: ContactMessage = {
    ...data,
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    read: false,
  };
  const all = getContactMessages();
  localStorage.setItem(KEY, JSON.stringify([message, ...all]));
  return message;
}

export function markMessageRead(id: string): void {
  const all = getContactMessages().map(m => m.id === id ? { ...m, read: true } : m);
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function deleteContactMessage(id: string): void {
  const all = getContactMessages().filter(m => m.id !== id);
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function getUnreadCount(): number {
  return getContactMessages().filter(m => !m.read).length;
}
