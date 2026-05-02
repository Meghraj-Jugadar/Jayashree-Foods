import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CartService } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order.service';
import { PaymentService } from '../../../core/services/payment.service';
import { AddressService } from '../../../core/services/address.service';
import { ToastService } from '../../../core/services/toast.service';
import { Address } from '../../../core/models/address.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatIconModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent implements OnInit {
  paymentMethod = 'SIMULATED';
  notes = '';
  placing = false;
  apiBase = environment.apiUrl.replace('/api', '');

  paymentOptions = [
    { value: 'SIMULATED', label: 'Simulated', icon: 'science' },
    { value: 'CASH',      label: 'Cash',      icon: 'payments' },
    { value: 'CARD',      label: 'Card',      icon: 'credit_card' },
    { value: 'UPI',       label: 'UPI',       icon: 'qr_code' },
  ];

  addresses: Address[] = [];
  selectedAddressId: number | null = null;

  constructor(
    public cart: CartService,
    private orderService: OrderService,
    private paymentService: PaymentService,
    private addressService: AddressService,
    private toast: ToastService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.addressService.getAddresses().subscribe(res => {
      this.addresses = res.data;
      const def = this.addresses.find(a => a.isDefault);
      if (def) this.selectedAddressId = def.id;
    });
  }

  get selectedAddress(): Address | undefined {
    return this.addresses.find(a => a.id === this.selectedAddressId);
  }

  placeOrder(): void {
    if (!this.selectedAddressId) {
      this.toast.error('Please select a delivery address');
      return;
    }

    this.placing = true;
    const items = this.cart.cartItems().map(i => ({ productId: i.product.id, quantity: i.quantity }));

    this.orderService.createOrder({ items, notes: this.notes, addressId: this.selectedAddressId }).subscribe({
      next: (res) => {
        const orderId = res.data.id;
        this.paymentService.processPayment(orderId, this.paymentMethod).subscribe({
          next: (payRes) => {
            this.placing = false;
            this.cart.clearCart();
            if (payRes.data.status === 'COMPLETED') {
              this.toast.success('Order placed & payment successful!');
            } else {
              this.toast.error('Order placed but payment failed. Try again.');
            }
            this.router.navigate(['/customer/orders']);
          },
          error: () => {
            this.placing = false;
            this.toast.error('Order placed but payment failed.');
            this.router.navigate(['/customer/orders']);
          },
        });
      },
      error: (err) => {
        this.placing = false;
        this.toast.error(err.error?.message || 'Failed to place order');
      },
    });
  }
}
