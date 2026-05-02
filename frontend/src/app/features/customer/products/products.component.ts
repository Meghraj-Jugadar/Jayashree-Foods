import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ToastService } from '../../../core/services/toast.service';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { Product, Category } from '../../../core/models/product.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-customer-products',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatPaginatorModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss',
})
export class CustomerProductsComponent implements OnInit, OnDestroy {
  private searchSubject = new Subject<void>();
  private destroy$ = new Subject<void>();
  products: Product[] = [];
  categories: Category[] = [];
  search = '';
  categoryId: any = '';
  page = 1;
  limit = 12;
  total = 0;
  apiBase = environment.apiUrl.replace('/api', '');

  constructor(private productService: ProductService, private cart: CartService, private toast: ToastService) {}

  ngOnInit(): void {
    this.load();
    this.productService.getCategories().subscribe(res => this.categories = res.data);
    this.searchSubject.pipe(debounceTime(350), takeUntil(this.destroy$)).subscribe(() => this.load());
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  load(): void {
    this.productService.getProducts({ page: this.page, limit: this.limit, search: this.search, categoryId: this.categoryId || undefined }).subscribe(res => {
      this.products = res.data;
      this.total = res.pagination.total;
    });
  }

  onSearch(): void { this.page = 1; this.searchSubject.next(); }

  setCategory(id: any): void { this.categoryId = id; this.page = 1; this.load(); }

  addToCart(product: Product): void {
    this.cart.addToCart(product);
    this.toast.success(`${product.name} added to cart`);
  }

  onPage(e: PageEvent): void { this.page = e.pageIndex + 1; this.limit = e.pageSize; this.load(); }
}
