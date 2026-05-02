import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ProductService } from '../../../core/services/product.service';
import { ToastService } from '../../../core/services/toast.service';
import { Product, Category } from '../../../core/models/product.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss',
})
export class AdminProductsComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  showForm = false;
  editingId: number | null = null;
  deleteConfirmId: number | null = null;
  form!: FormGroup;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  search = '';
  page = 1;
  limit = 12;
  total = 0;
  apiBase = environment.apiUrl.replace('/api', '');

  constructor(private productService: ProductService, private fb: FormBuilder, private toast: ToastService) {}

  ngOnInit(): void {
    this.loadProducts();
    this.productService.getCategories().subscribe(res => this.categories = res.data);
    this.initForm();
  }

  initForm(): void {
    this.form = this.fb.group({
      name:        ['', Validators.required],
      categoryId:  ['', Validators.required],
      price:       ['', [Validators.required, Validators.min(0)]],
      stock:       ['', [Validators.required, Validators.min(0)]],
      description: [''],
    });
    this.selectedFile = null;
    this.imagePreview = null;
  }

  loadProducts(): void {
    this.productService.getProducts({ page: this.page, limit: this.limit, search: this.search })
      .subscribe(res => { this.products = res.data; this.total = res.pagination.total; });
  }

  onSearch(): void { this.page = 1; this.loadProducts(); }

  get pageStart(): number { return this.total === 0 ? 0 : (this.page - 1) * this.limit + 1; }
  get pageEnd(): number   { return Math.min(this.page * this.limit, this.total); }
  prevPage(): void { if (this.page > 1) { this.page--; this.loadProducts(); } }
  nextPage(): void { if (this.pageEnd < this.total) { this.page++; this.loadProducts(); } }

  openAdd(): void { this.editingId = null; this.initForm(); this.showForm = true; }

  openEdit(p: Product): void {
    this.editingId = p.id;
    this.initForm();
    this.form.patchValue({ name: p.name, categoryId: p.categoryId, price: p.price, stock: p.stock, description: p.description });
    this.imagePreview = p.imageUrl ? this.apiBase + p.imageUrl : null;
    this.showForm = true;
  }

  cancelForm(): void { this.showForm = false; this.editingId = null; }

  onFileChange(e: Event): void {
    const input = e.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => this.imagePreview = reader.result as string;
      reader.readAsDataURL(this.selectedFile);
    }
  }

  saveProduct(): void {
    const fd = new FormData();
    Object.entries(this.form.value).forEach(([k, v]) => { if (v !== null && v !== undefined) fd.append(k, String(v)); });
    if (this.selectedFile) fd.append('image', this.selectedFile);

    const req = this.editingId
      ? this.productService.updateProduct(this.editingId, fd)
      : this.productService.createProduct(fd);

    req.subscribe({
      next: () => { this.toast.success(this.editingId ? 'Product updated' : 'Product created'); this.cancelForm(); this.loadProducts(); },
      error: () => this.toast.error('Failed to save product'),
    });
  }

  confirmDelete(id: number): void { this.deleteConfirmId = id; }
  cancelDelete(): void { this.deleteConfirmId = null; }

  deleteProduct(id: number): void {
    this.productService.deleteProduct(id).subscribe({
      next: () => { this.toast.success('Product deleted'); this.deleteConfirmId = null; this.loadProducts(); },
      error: () => this.toast.error('Failed to delete product'),
    });
  }

  searchFocused = false;

  private readonly accents = [
    { color: '#1a237e', bg: '#e8eaf6' },
    { color: '#1b5e20', bg: '#e8f5e9' },
    { color: '#b71c1c', bg: '#fce4ec' },
    { color: '#e65100', bg: '#fff3e0' },
    { color: '#4a148c', bg: '#f3e5f5' },
    { color: '#006064', bg: '#e0f7fa' },
    { color: '#f57f17', bg: '#fff8e1' },
    { color: '#01579b', bg: '#e3f2fd' },
  ];

  accentColor(i: number): string { return this.accents[i % this.accents.length].color; }
  accentBg(i: number): string    { return this.accents[i % this.accents.length].bg; }

  imgSrc(p: Product): string {
    return p.imageUrl ? this.apiBase + p.imageUrl : 'assets/no-image.png';
  }

  stockClass(stock: number): string {
    if (stock === 0) return 'out';
    if (stock < 10) return 'low';
    return 'ok';
  }

  stockLabel(stock: number): string {
    if (stock === 0) return 'Out of Stock';
    if (stock < 10) return 'Low Stock';
    return 'In Stock';
  }
}
