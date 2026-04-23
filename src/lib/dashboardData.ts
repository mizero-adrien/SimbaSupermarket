import { BranchOrder, BranchProduct, OrderStatus } from '@/types';

export function getBranchOrders(branchId: string): BranchOrder[] {
  try {
    const raw = localStorage.getItem(`simba_orders_${branchId}`);
    return raw ? JSON.parse(raw) : generateSeedOrders(branchId);
  } catch {
    return [];
  }
}

export function saveBranchOrders(branchId: string, orders: BranchOrder[]) {
  localStorage.setItem(`simba_orders_${branchId}`, JSON.stringify(orders));
}

export function getBranchProducts(branchId: string): BranchProduct[] {
  try {
    const raw = localStorage.getItem(`simba_products_${branchId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveBranchProducts(branchId: string, products: BranchProduct[]) {
  localStorage.setItem(`simba_products_${branchId}`, JSON.stringify(products));
}

export function updateOrderStatus(branchId: string, orderId: string, status: OrderStatus) {
  const orders = getBranchOrders(branchId);
  const updated = orders.map(o =>
    o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o
  );
  saveBranchOrders(branchId, updated);
  return updated;
}

const CUSTOMER_NAMES = [
  'Alice Mutoni', 'Bob Nkurunziza', 'Clara Uwase', 'David Habimana',
  'Emma Ingabire', 'Felix Ndayisaba', 'Grace Mukamana', 'Henry Nzeyimana',
  'Isabelle Uwineza', 'Jean Pierre Bizimana',
];

const STATUSES: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'delivered'];

function generateSeedOrders(branchId: string): BranchOrder[] {
  const seed = branchId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const rand = (n: number, s: number) => ((seed * 9301 + 49297 * (s + 1)) % 233280 / 233280 * n) | 0;

  return Array.from({ length: 15 }, (_, i) => ({
    id: `ORD-${branchId.slice(0, 3).toUpperCase()}-${1000 + i}`,
    branchId,
    customerId: `cust-${i}`,
    customerName: CUSTOMER_NAMES[rand(CUSTOMER_NAMES.length, i * 3)],
    customerPhone: `+250 78${rand(9, i)}${rand(9, i + 1)} ${rand(9, i + 2)}${rand(9, i + 3)}${rand(9, i + 4)} ${rand(9, i + 5)}${rand(9, i + 6)}${rand(9, i + 7)}`,
    items: [
      {
        product: { id: `p${i}`, name: ['Rice 5kg', 'Cooking Oil 2L', 'Sugar 1kg', 'Milk 1L', 'Bread'][rand(5, i)], category: 'Grains & Cereals', price: [4500, 3200, 1800, 1200, 800][rand(5, i)] },
        quantity: rand(4, i) + 1,
      },
    ],
    total: (rand(20, i) + 5) * 1000,
    deliveryFee: [0, 1000, 2000][rand(3, i)],
    status: STATUSES[rand(STATUSES.length, i * 7)],
    paymentMethod: ['MTN MoMo', 'Airtel Money', 'Cash'][rand(3, i)],
    deliveryType: ['delivery', 'pickup'][rand(2, i)],
    address: `KG ${rand(500, i)} St, Kigali`,
    createdAt: new Date(Date.now() - rand(7, i) * 86400000 - rand(24, i) * 3600000).toISOString(),
    updatedAt: new Date().toISOString(),
  }));
}
