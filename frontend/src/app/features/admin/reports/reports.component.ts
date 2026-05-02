import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ReportService } from '../../../core/services/report.service';
import { ReviewService, Review } from '../../../core/services/review.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatPaginatorModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss',
})
export class AdminReportsComponent implements OnInit {
  activeTab: 'sales' | 'reviews' = 'sales';

  // Date filters
  startDate = new FormControl<string | null>(null);
  endDate   = new FormControl<string | null>(null);

  report: any = null;

  reviews: Review[] = [];
  reviewTotal = 0;
  reviewPage  = 1;
  reviewLimit = 10;

  constructor(
    private reportService: ReportService,
    private reviewService: ReviewService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.loadReport();
    this.loadReviews();
  }

  loadReport(): void {
    const s = this.startDate.value;
    const e = this.endDate.value;
    this.reportService.getSalesReport({
      startDate: s ? new Date(s).toISOString() : undefined,
      endDate:   e ? new Date(e).toISOString() : undefined,
    }).subscribe({
      next: (res) => this.report = res.data,
      error: () => this.toast.error('Failed to load report'),
    });
  }

  exportCSV(): void {
    const s = this.startDate.value;
    const e = this.endDate.value;
    this.reportService.exportCSV({
      startDate: s ? new Date(s).toISOString() : undefined,
      endDate:   e ? new Date(e).toISOString() : undefined,
    });
  }

  loadReviews(): void {
    this.reviewService.getReviews({ page: this.reviewPage, limit: this.reviewLimit }).subscribe({
      next: (res) => {
        this.reviews = res.data;
        this.reviewTotal = res.pagination?.total ?? res.data.length;
      },
      error: () => this.toast.error('Failed to load reviews'),
    });
  }

  deleteReview(id: number): void {
    this.reviewService.deleteReview(id).subscribe({
      next: () => { this.toast.success('Review deleted'); this.loadReviews(); },
      error: () => this.toast.error('Failed to delete review'),
    });
  }

  onReviewPage(e: PageEvent): void {
    this.reviewPage  = e.pageIndex + 1;
    this.reviewLimit = e.pageSize;
    this.loadReviews();
  }

  get avgRating(): number {
    if (!this.reviews.length) return 0;
    return this.reviews.reduce((s, r) => s + r.rating, 0) / this.reviews.length;
  }

  get ratingBreakdown(): { star: number; count: number; pct: number }[] {
    return [5, 4, 3, 2, 1].map(star => {
      const count = this.reviews.filter(r => r.rating === star).length;
      return { star, count, pct: this.reviews.length ? (count / this.reviews.length) * 100 : 0 };
    });
  }

  getProductPct(revenue: number): number {
    if (!this.report?.topProducts?.length) return 0;
    const max = Math.max(...this.report.topProducts.map((p: any) => p.revenue));
    return max ? (revenue / max) * 100 : 0;
  }

  stars(n: number): number[] { return Array(n).fill(0); }
}
