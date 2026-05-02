export interface Role {
  id: number;
  name: 'admin' | 'customer';
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  isActive: boolean;
  role: Role;
  createdAt: string;
  addresses?: { fullName: string; phone: string; line1: string; line2?: string | null; city: string; state: string; pincode: string; label: string }[];
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}
