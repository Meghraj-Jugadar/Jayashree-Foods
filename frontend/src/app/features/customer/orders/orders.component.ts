import { Component, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { OrderService } from '../../../core/services/order.service';
import { PdfService } from '../../../core/services/pdf.service';
import { ReviewService } from '../../../core/services/review.service';
import { ToastService } from '../../../core/services/toast.service';
import { Order } from '../../../core/models/order.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-customer-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatIconModule, MatPaginatorModule, TitleCasePipe],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss',
})
export class CustomerOrdersComponent implements OnInit {
  orders: Order[] = [];
  page = 1;
  limit = 10;
  total = 0;
  settings: any = {};
  activeFilter = '';
  reviewDraft: Record<number, { rating: number; comment: string }> = {};

  filters = [
    { label: 'All', value: '' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Processing', value: 'PROCESSING' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ];

  private readonly stepDefs = [
    { key: 'PENDING',    label: 'Placed',     icon: 'check_circle' },
    { key: 'PROCESSING', label: 'Processing', icon: 'autorenew' },
    { key: 'COMPLETED',  label: 'Delivered',  icon: 'local_shipping' },
  ];

  constructor(
    private orderService: OrderService,
    private pdfService: PdfService,
    private reviewService: ReviewService,
    private toast: ToastService,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    this.load();
    this.http.get<any>(`${environment.apiUrl}/settings`).subscribe(res => this.settings = res.data || {});
  }

  load(): void {
    const params: any = { page: this.page, limit: this.limit };
    if (this.activeFilter) params['status'] = this.activeFilter;
    this.orderService.getOrders(params).subscribe(res => {
      this.orders = res.data;
      this.total = res.pagination.total;
    });
  }

  setFilter(value: string): void { this.activeFilter = value; this.page = 1; this.load(); }

  getSteps(status: string): { label: string; icon: string; done: boolean; active: boolean }[] {
    if (status === 'CANCELLED') {
      return [{ label: 'Placed', icon: 'check_circle', done: true, active: false },
              { label: 'Cancelled', icon: 'cancel', done: false, active: true }];
    }
    const idx = this.stepDefs.findIndex(s => s.key === status);
    return this.stepDefs.map((s, i) => ({ ...s, done: i < idx, active: i === idx }));
  }

  downloadInvoice(order: Order): void {
    this.orderService.getOrder(order.id).subscribe(res => {
      this.pdfService.generateInvoice(res.data, this.settings);
    });
  }

  getDraft(productId: number): { rating: number; comment: string } {
    if (!this.reviewDraft[productId]) this.reviewDraft[productId] = { rating: 0, comment: '' };
    return this.reviewDraft[productId];
  }

  setRating(productId: number, rating: number): void {
    this.getDraft(productId).rating = rating;
  }

  submitReview(productId: number): void {
    const draft = this.getDraft(productId);
    if (!draft.rating) { this.toast.error('Please select a rating'); return; }
    this.reviewService.createReview({ productId, rating: draft.rating, comment: draft.comment }).subscribe({
      next: () => { this.toast.success('Review submitted!'); delete this.reviewDraft[productId]; },
      error: (err) => this.toast.error(err.error?.message || 'Failed to submit review'),
    });
  }

  stars(n: number): number[] { return Array(n).fill(0); }

  onPage(e: PageEvent): void { this.page = e.pageIndex + 1; this.limit = e.pageSize; this.load(); }
}
