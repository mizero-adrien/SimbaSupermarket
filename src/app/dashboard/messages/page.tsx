'use client';

import { useEffect, useState } from 'react';
import { Mail, Trash2, MailOpen, Clock, Search } from 'lucide-react';
import { ContactMessage } from '@/types';
import { getContactMessages, markMessageRead, deleteContactMessage } from '@/lib/contactData';

export default function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    setMessages(getContactMessages());
  }, []);

  function openMessage(msg: ContactMessage) {
    if (!msg.read) {
      markMessageRead(msg.id);
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, read: true } : m));
    }
    setSelected(msg);
  }

  function handleDelete(id: string) {
    deleteContactMessage(id);
    setMessages(prev => prev.filter(m => m.id !== id));
    if (selected?.id === id) setSelected(null);
  }

  const filtered = messages.filter(m =>
    query === '' ||
    m.name.toLowerCase().includes(query.toLowerCase()) ||
    m.subject.toLowerCase().includes(query.toLowerCase()) ||
    m.email.toLowerCase().includes(query.toLowerCase())
  );

  const unread = messages.filter(m => !m.read).length;

  return (
    <div className="space-y-4 max-w-6xl">
      <div>
        <h1 className="text-2xl font-extrabold text-light-text dark:text-dark-text">Messages</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {unread > 0 ? `${unread} unread message${unread !== 1 ? 's' : ''}` : 'All messages read'}
        </p>
      </div>

      <div className="flex gap-4 h-[calc(100vh-220px)] min-h-[480px]">
        {/* Message list */}
        <div className="w-full lg:w-80 xl:w-96 shrink-0 flex flex-col bg-white dark:bg-dark-card rounded-card border border-light-border dark:border-dark-border overflow-hidden">
          <div className="p-3 border-b border-light-border dark:border-dark-border">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search messages..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm border border-light-border dark:border-dark-border rounded-btn bg-gray-50 dark:bg-slate-800 text-light-text dark:text-dark-text placeholder-gray-400 focus:outline-none focus:border-[#16a34a]"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-light-border dark:divide-dark-border">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400 py-12">
                <Mail size={36} strokeWidth={1.2} />
                <p className="text-sm">{query ? 'No results found' : 'No messages yet'}</p>
              </div>
            ) : (
              filtered.map(msg => (
                <button
                  key={msg.id}
                  onClick={() => openMessage(msg)}
                  className={`w-full text-left px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors ${
                    selected?.id === msg.id ? 'bg-[#16a34a]/5 border-l-2 border-[#16a34a]' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {!msg.read && (
                        <span className="w-2 h-2 rounded-full bg-[#16a34a] shrink-0 mt-1" />
                      )}
                      <div className="min-w-0">
                        <p className={`text-sm truncate ${!msg.read ? 'font-bold text-light-text dark:text-dark-text' : 'font-medium text-gray-600 dark:text-gray-300'}`}>
                          {msg.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{msg.subject}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-400 shrink-0 mt-0.5">
                      {new Date(msg.createdAt).toLocaleDateString('en-RW', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 truncate mt-1 pl-4">{msg.message}</p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Message detail */}
        <div className="hidden lg:flex flex-1 flex-col bg-white dark:bg-dark-card rounded-card border border-light-border dark:border-dark-border overflow-hidden">
          {selected ? (
            <>
              <div className="px-6 py-4 border-b border-light-border dark:border-dark-border flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-light-text dark:text-dark-text">{selected.subject}</h2>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span className="font-medium text-light-text dark:text-dark-text">{selected.name}</span>
                    <span>·</span>
                    <a href={`mailto:${selected.email}`} className="text-[#16a34a] hover:underline">{selected.email}</a>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {new Date(selected.createdAt).toLocaleString('en-RW', { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-btn bg-[#16a34a] text-white hover:bg-green-700 transition-colors"
                  >
                    <MailOpen size={13} />
                    Reply
                  </a>
                  <button
                    onClick={() => handleDelete(selected.id)}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-btn border border-red-200 dark:border-red-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 size={13} />
                    Delete
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <p className="text-sm text-light-text dark:text-dark-text leading-relaxed whitespace-pre-wrap">{selected.message}</p>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
              <Mail size={48} strokeWidth={1} />
              <p className="text-sm">Select a message to read</p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile detail modal */}
      {selected && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/40 flex items-end" onClick={() => setSelected(null)}>
          <div className="w-full bg-white dark:bg-dark-card rounded-t-2xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-light-border dark:border-dark-border">
              <h2 className="font-bold text-light-text dark:text-dark-text">{selected.subject}</h2>
              <p className="text-xs text-gray-500 mt-0.5">{selected.name} · {selected.email}</p>
            </div>
            <div className="p-5">
              <p className="text-sm text-light-text dark:text-dark-text leading-relaxed whitespace-pre-wrap">{selected.message}</p>
            </div>
            <div className="px-5 pb-6 flex gap-3">
              <a
                href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-btn bg-[#16a34a] text-white text-sm font-semibold"
              >
                <MailOpen size={14} /> Reply
              </a>
              <button
                onClick={() => handleDelete(selected.id)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-btn border border-red-200 text-red-500 text-sm font-semibold"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
