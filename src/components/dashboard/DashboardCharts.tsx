'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { formatPrice } from '@/lib/formatPrice';

const CAT_COLORS = ['#f59e0b', '#3b82f6', '#8b5cf6', '#16a34a', '#f43f5e', '#06b6d4'];

function RevenueTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-btn px-3 py-2 shadow-lg text-sm">
      <p className="font-semibold text-light-text dark:text-dark-text">{label}</p>
      <p className="text-[#f59e0b] font-bold">{formatPrice(payload[0].value)}</p>
    </div>
  );
}

function CategoryTooltip({ active, payload }: { active?: boolean; payload?: { value: number; name: string }[] }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-btn px-3 py-2 shadow-lg text-sm">
      <p className="text-light-text dark:text-dark-text font-semibold">{payload[0].name}</p>
      <p className="text-[#f59e0b] font-bold">{payload[0].value} items</p>
    </div>
  );
}

interface RevenueChartProps {
  data: { day: string; revenue: number }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} barSize={32}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
        <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => v === 0 ? '0' : `${(v / 1000).toFixed(0)}k`} />
        <Tooltip content={<RevenueTooltip />} cursor={{ fill: '#f59e0b15' }} />
        <Bar dataKey="revenue" fill="#f59e0b" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

interface StatusPieProps {
  data: { name: string; value: number; color: string }[];
}

export function StatusPieChart({ data }: StatusPieProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} cx="50%" cy="45%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
          {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
        </Pie>
        <Tooltip formatter={(v, name) => [`${v} orders`, name]} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

interface CategoryChartProps {
  data: { name: string; value: number }[];
}

export function CategoryChart({ data }: CategoryChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" barSize={16}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={80} />
        <Tooltip content={<CategoryTooltip />} cursor={{ fill: '#f59e0b15' }} />
        <Bar dataKey="value" radius={[0, 6, 6, 0]}>
          {data.map((_, i) => <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
