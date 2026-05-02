export interface Category {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  _count?: { products: number };
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  imageUrl?: string;
  categoryId: number;
  category: Category;
  isActive: boolean;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
