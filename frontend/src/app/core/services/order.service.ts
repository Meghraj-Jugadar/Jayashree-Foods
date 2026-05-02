import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order, DashboardStats, PaginatedResponse, ApiResponse } from '../models/order.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly API = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  createOrder(data: { items: { productId: number; quantity: number }[]; notes?: string; addressId?: number | null }): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(this.API, data);
  }

  getOrders(filters: any = {}): Observable<PaginatedResponse<Order>> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params = params.set(k, String(v)); });
    return this.http.get<PaginatedResponse<Order>>(this.API, { params });
  }

  getOrder(id: number): Observable<ApiResponse<Order>> {
    return this.http.get<ApiResponse<Order>>(`${this.API}/${id}`);
  }

  updateStatus(id: number, status: string): Observable<ApiResponse<Order>> {
    return this.http.patch<ApiResponse<Order>>(`${this.API}/${id}/status`, { status });
  }

  getDashboardStats(): Observable<ApiResponse<DashboardStats>> {
    return this.http.get<ApiResponse<DashboardStats>>(`${this.API}/dashboard`);
  }
}
