import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ProductService } from '../../../core/services/product.service';
import { ToastService } from '../../../core/services/toast.service';
import { Category } from '../../../core/models/product.model';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
})
export class AdminCategoriesComponent implements OnInit {
  categories: Category[] = [];
  showForm = false;
  editingId: number | null = null;
  deleteConfirmId: number | null = null;
  form!: FormGroup;

  constructor(private productService: ProductService, private fb: FormBuilder, private toast: ToastService) {}

  ngOnInit(): void { this.load(); this.initForm(); }

  initForm(): void {
    this.form = this.fb.group({ name: ['', Validators.required], description: [''] });
  }

  load(): void {
    this.productService.getCategories().subscribe(res => this.categories = res.data);
  }

  openAdd(): void { this.editingId = null; this.initForm(); this.showForm = true; }

  openEdit(c: Category): void {
    this.editingId = c.id;
    this.form.patchValue({ name: c.name, description: c.description });
    this.showForm = true;
  }

  cancelForm(): void { this.showForm = false; this.editingId = null; }

  save(): void {
    const req = this.editingId
      ? this.productService.updateCategory(this.editingId, this.form.value)
      : this.productService.createCategory(this.form.value);
    req.subscribe({
      next: () => { this.toast.success(this.editingId ? 'Category updated' : 'Category created'); this.cancelForm(); this.load(); },
      error: (err) => this.toast.error(err.error?.message || 'Failed to save'),
    });
  }

  confirmDelete(id: number): void { this.deleteConfirmId = id; }
  cancelDelete(): void { this.deleteConfirmId = null; }

  deleteCategory(id: number): void {
    this.productService.deleteCategory(id).subscribe({
      next: () => { this.toast.success('Category deleted'); this.deleteConfirmId = null; this.load(); },
      error: (err) => this.toast.error(err.error?.message || 'Failed to delete'),
    });
  }

  private readonly palettes = [
    { color: '#1a237e', bg: '#e8eaf6', light: '#f5f6ff' }, // indigo
    { color: '#1b5e20', bg: '#e8f5e9', light: '#f4fbf4' }, // green
    { color: '#b71c1c', bg: '#fce4ec', light: '#fff5f7' }, // red
    { color: '#e65100', bg: '#fff3e0', light: '#fffaf5' }, // orange
    { color: '#4a148c', bg: '#f3e5f5', light: '#faf4fc' }, // purple
    { color: '#006064', bg: '#e0f7fa', light: '#f2fdfe' }, // cyan
    { color: '#f57f17', bg: '#fff8e1', light: '#fffdf0' }, // amber
    { color: '#880e4f', bg: '#fce4ec', light: '#fff5f8' }, // pink
    { color: '#01579b', bg: '#e3f2fd', light: '#f3f9ff' }, // blue
    { color: '#33691e', bg: '#f1f8e9', light: '#f8fcf3' }, // light-green
  ];

  palette(index: number): { color: string; bg: string; light: string } {
    return this.palettes[index % this.palettes.length];
  }

  iconFor(name: string): string {
    const n = name.toLowerCase();
    if (n.includes('beverage') || n.includes('drink')) return 'local_cafe';
    if (n.includes('snack') || n.includes('chip')) return 'cookie';
    if (n.includes('dairy') || n.includes('milk')) return 'egg';
    if (n.includes('fruit') || n.includes('veg')) return 'eco';
    if (n.includes('meat') || n.includes('chicken')) return 'set_meal';
    if (n.includes('bakery') || n.includes('bread')) return 'bakery_dining';
    return 'category';
  }
}
