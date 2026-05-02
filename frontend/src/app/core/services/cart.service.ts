import { Injectable, signal, computed } from '@angular/core';
import { CartItem, Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private items = signal<CartItem[]>([]);

  cartItems = this.items.asReadonly();
  cartCount = computed(() => this.items().reduce((sum, i) => sum + i.quantity, 0));
  cartTotal = computed(() => this.items().reduce((sum, i) => sum + i.product.price * i.quantity, 0));

  addToCart(product: Product, quantity = 1): void {
    const current = this.items();
    const existing = current.find(i => i.product.id === product.id);
    if (existing) {
      this.items.set(current.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i));
    } else {
      this.items.set([...current, { product, quantity }]);
    }
  }

  updateQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) { this.removeFromCart(productId); return; }
    this.items.set(this.items().map(i => i.product.id === productId ? { ...i, quantity } : i));
  }

  removeFromCart(productId: number): void {
    this.items.set(this.items().filter(i => i.product.id !== productId));
  }

  clearCart(): void {
    this.items.set([]);
  }
}
