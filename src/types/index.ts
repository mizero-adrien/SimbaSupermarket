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
  branchId?: string;
  status?: OrderStatus;
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
export type UserRole = 'customer' | 'branch_representative' | 'branch_manager' | 'admin' | 'system_admin';

export type Language = 'en' | 'fr' | 'rw';

export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';

export interface BranchTestimonial {
  reviewer: string;
  quote: string;
  address: string;
  sentiment: 'positive' | 'mixed' | 'negative';
}

export interface BranchReview {
  id: string;
  branchId: string;
  customerName: string;
  rating: number;
  comment: string;
  pickupType: 'pickup' | 'delivery';
  createdAt: string;
}

export interface NoShowFlag {
  id: string;
  customerPhone: string;
  branchId: string;
  orderId?: string;
  reason: string;
  createdAt: string;
}

export interface Branch {
  id: string;
  name: string;
  location: string;
  address: string;
  coordinates?: string;
  phone: string;
  hours: string;
  image: string;
  isOpen: boolean;
  managerId?: string;
  rating: number;
  reviewCount: number;
  description: string;
  services: string[];
  highlights: string[];
  mapUrl: string;
  testimonials: BranchTestimonial[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  branchId?: string;
  createdAt: string;
  phone?: string;
}

export interface BranchProduct extends Product {
  branchId: string;
  stock: number;
  isAvailable: boolean;
  addedAt: string;
}

export interface BranchOrder {
  id: string;
  branchId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  items: CartItem[];
  total: number;
  deliveryFee: number;
  status: OrderStatus;
  paymentMethod: string;
  deliveryType: string;
  address: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
