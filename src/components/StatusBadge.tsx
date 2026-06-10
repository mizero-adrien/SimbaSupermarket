import { Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { OrderStatus } from '@/types';

const CONFIG: Record<OrderStatus, {
  label: string;
  bg: string;
  text: string;
  border: string;
  Icon: React.ElementType;
}> = {
  pending:   { label: 'Pending',          bg: 'bg-amber-50 dark:bg-amber-900/20',   text: 'text-amber-600',  border: 'border-amber-200 dark:border-amber-800',  Icon: Clock },
  confirmed: { label: 'Confirmed',        bg: 'bg-blue-50 dark:bg-blue-900/20',     text: 'text-blue-600',   border: 'border-blue-200 dark:border-blue-800',    Icon: CheckCircle },
  preparing: { label: 'Preparing',        bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600', border: 'border-purple-200 dark:border-purple-800', Icon: AlertCircle },
  ready:     { label: 'Ready for Pickup', bg: 'bg-green-50 dark:bg-green-900/20',   text: 'text-[#16a34a]',  border: 'border-green-200 dark:border-green-800',   Icon: CheckCircle },
  delivered: { label: 'Delivered',        bg: 'bg-gray-100 dark:bg-gray-700',       text: 'text-gray-600 dark:text-gray-300',  border: 'border-gray-200 dark:border-gray-600',    Icon: CheckCircle },
  cancelled: { label: 'Cancelled',        bg: 'bg-red-50 dark:bg-red-900/20',       text: 'text-red-500',    border: 'border-red-200 dark:border-red-800',       Icon: XCircle },
};

interface Props {
  status: OrderStatus;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'sm' }: Props) {
  const { label, bg, text, border, Icon } = CONFIG[status];
  const iconSize = size === 'sm' ? 10 : 13;
  const textCls = size === 'sm' ? 'text-xs' : 'text-sm';
  return (
    <span className={`inline-flex items-center gap-1 font-semibold px-2.5 py-0.5 rounded-full border ${textCls} ${bg} ${text} ${border}`}>
      <Icon size={iconSize} />
      {label}
    </span>
  );
}
