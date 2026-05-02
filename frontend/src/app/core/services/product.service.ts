import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, Category } from '../models/product.model';
import { ApiResponse, PaginatedResponse } from '../models/order.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly API = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getProducts(filters: any = {}): Observable<PaginatedResponse<Product>> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params = params.set(k, String(v)); });
    return this.http.get<PaginatedResponse<Product>>(`${this.API}/products`, { params });
  }

  getProduct(id: number): Observable<ApiResponse<Product>> {
    return this.http.get<ApiResponse<Product>>(`${this.API}/products/${id}`);
  }

  createProduct(data: FormData): Observable<ApiResponse<Product>> {
    return this.http.post<ApiResponse<Product>>(`${this.API}/products`, data);
  }

  updateProduct(id: number, data: FormData): Observable<ApiResponse<Product>> {
    return this.http.put<ApiResponse<Product>>(`${this.API}/products/${id}`, data);
  }

  deleteProduct(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.API}/products/${id}`);
  }

  getCategories(): Observable<ApiResponse<Category[]>> {
    return this.http.get<ApiResponse<Category[]>>(`${this.API}/categories`);
  }

  createCategory(data: Partial<Category>): Observable<ApiResponse<Category>> {
    return this.http.post<ApiResponse<Category>>(`${this.API}/categories`, data);
  }

  updateCategory(id: number, data: Partial<Category>): Observable<ApiResponse<Category>> {
    return this.http.put<ApiResponse<Category>>(`${this.API}/categories/${id}`, data);
  }

  deleteCategory(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.API}/categories/${id}`);
  }
}
