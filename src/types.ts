export type UserRole = 'customer' | 'admin' | 'logistics';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  photoURL?: string;
  role: UserRole;
  phoneNumber?: string;
  createdAt: string;
  isBlocked?: boolean;
  addresses?: Address[];
  loyaltyPoints?: number;
  favorites?: string[]; // Array of product IDs
}

export interface Address {
  id: string;
  name: string; // Home, Work, etc.
  street: string;
  city: string;
  isDefault: boolean;
}

export interface Store {
  id: string;
  name: string;
  city: string;
  address: string;
  location?: { lat: number; lng: number };
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  subCategory?: string;
  imageUrl: string;
  stock: number;
  isActive: boolean;
  isPromo: boolean;
  promoPrice?: number;
  createdAt?: any;
  updatedAt?: any;
}

export type OrderStatus = 'pending' | 'paid' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
export type PaymentMethod = 'mobile_money' | 'card' | 'in_store';
export type PaymentStatus = 'pending' | 'completed' | 'failed';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  customerId: string;
  storeId: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentTransactionId?: string;
  pickupSlot: string;
  createdAt: string;
  updatedAt: string;
}
