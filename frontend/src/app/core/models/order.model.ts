import { User } from './user.model';
import { Product } from './product.model';

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
export type PaymentMethod = 'SIMULATED' | 'CASH' | 'CARD' | 'UPI';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface OrderItem {
  id: number;
  productId: number;
  product: Product;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Payment {
  id: number;
  orderId: number;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  createdAt: string;
}

export interface OrderUser {
  id?: number;
  name: string;
  email?: string;
  phone?: string | null;
  address?: string | null;
}

export interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  user: OrderUser;
  status: OrderStatus;
  totalAmount: number;
  taxAmount: number;
  notes?: string;
  deliveryAddress?: string | null;
  orderItems: OrderItem[];
  payment?: Payment;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  monthlyOrders: number;
  dailyOrders: number;
  recentOrders: Order[];
  ordersByStatus: { status: OrderStatus; _count: { id: number } }[];
  monthlyRevenue: { month: string; revenue: number }[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
