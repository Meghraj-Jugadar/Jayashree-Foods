import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { OrderService } from '../../../core/services/order.service';
import { ToastService } from '../../../core/services/toast.service';
import { Order, OrderStatus } from '../../../core/models/order.model';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, TitleCasePipe],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss',
})
export class AdminOrdersComponent implements OnInit {
  orders: Order[] = [];
  statuses: OrderStatus[] = ['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'];
  search = '';
  statusFilter = '';
  page = 1;
  limit = 15;
  total = 0;

  selectedOrder: Order | null = null;
  detailCache: Record<number, Order> = {};

  constructor(private orderService: OrderService, private toast: ToastService) {}

  ngOnInit(): void { this.loadOrders(); }

  loadOrders(): void {
    this.orderService.getOrders({ page: this.page, limit: this.limit, search: this.search, status: this.statusFilter })
      .subscribe(res => { this.orders = res.data; this.total = res.pagination.total; });
  }

  onSearch(): void { this.page = 1; this.loadOrders(); }

  get pageStart(): number { return this.total === 0 ? 0 : (this.page - 1) * this.limit + 1; }
  get pageEnd(): number   { return Math.min(this.page * this.limit, this.total); }
  prevPage(): void { if (this.page > 1) { this.page--; this.loadOrders(); } }
  nextPage(): void { if (this.pageEnd < this.total) { this.page++; this.loadOrders(); } }

  openDetail(order: Order): void {
    if (this.detailCache[order.id]) {
      this.selectedOrder = this.detailCache[order.id];
      return;
    }
    this.orderService.getOrder(order.id).subscribe(res => {
      this.detailCache[order.id] = res.data;
      this.selectedOrder = res.data;
    });
  }

  closeDetail(): void { this.selectedOrder = null; }

  updateStatus(status: string): void {
    if (!this.selectedOrder) return;
    this.orderService.updateStatus(this.selectedOrder.id, status).subscribe({
      next: () => {
        this.toast.success('Status updated');
        // update in list and cache
        const o = this.orders.find(x => x.id === this.selectedOrder!.id);
        if (o) o.status = status as OrderStatus;
        this.selectedOrder!.status = status as OrderStatus;
        this.detailCache[this.selectedOrder!.id] = { ...this.selectedOrder! };
      },
      error: () => this.toast.error('Failed to update status'),
    });
  }

  statusIcon(s: string): string {
    const map: Record<string, string> = {
      PENDING: 'schedule', PROCESSING: 'autorenew',
      COMPLETED: 'check_circle', CANCELLED: 'cancel',
    };
    return map[s] || 'help';
  }

  searchFocused = false;

  setStatus(s: string): void { this.statusFilter = s; this.onSearch(); }
}
