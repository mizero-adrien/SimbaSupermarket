export interface Product {
  id: string | number;
  name: string;
  category: string;
  price: number;
  image?: string;
  description?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  deliveryFee: number;
  customerName: string;
  phone: string;
  email?: string;
  address: string;
  district: string;
  paymentMethod: string;
  deliveryType: string;
  notes?: string;
  createdAt: Date;
}

export type Language = 'en' | 'fr' | 'rw';

export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';
