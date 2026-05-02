import { Component, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { ToastService } from '../../../core/services/toast.service';
import { DashboardStats, Order, OrderStatus } from '../../../core/models/order.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterModule, TitleCasePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  loading = true;
  maxRevenue = 0;
  selectedOrder: Order | null = null;
  detailCache: Record<number, Order> = {};
  statuses: OrderStatus[] = ['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'];

  constructor(private orderService: OrderService, private toast: ToastService) {}

  ngOnInit(): void {
    this.orderService.getDashboardStats().subscribe({
      next: (res) => {
        this.stats = res.data;
        this.maxRevenue = Math.max(...res.data.monthlyRevenue.map(m => m.revenue), 1);
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  get greeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }

  getBarPct(revenue: number): number {
    return Math.max((revenue / this.maxRevenue) * 100, 2);
  }

  getStatusCount(status: string): number {
    return this.stats?.ordersByStatus.find(s => s.status === status)?._count?.id ?? 0;
  }

  getStatusPercent(status: string): number {
    const total = this.stats?.totalOrders || 1;
    return Math.round((this.getStatusCount(status) / total) * 100);
  }

  openDetail(order: Order): void {
    if (this.detailCache[order.id]) { this.selectedOrder = this.detailCache[order.id]; return; }
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
        this.selectedOrder!.status = status as OrderStatus;
        this.detailCache[this.selectedOrder!.id] = { ...this.selectedOrder! };
        const o = this.stats?.recentOrders.find(x => x.id === this.selectedOrder!.id);
        if (o) o.status = status as OrderStatus;
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

  statusColor(s: string): string {
    const map: Record<string, string> = {
      PENDING: '#e65100', PROCESSING: '#1565c0',
      COMPLETED: '#2e7d32', CANCELLED: '#c62828',
    };
    return map[s] || '#999';
  }

  get avgOrderValue(): number {
    if (!this.stats || !this.stats.totalOrders) return 0;
    return this.stats.totalRevenue / this.stats.totalOrders;
  }
}
