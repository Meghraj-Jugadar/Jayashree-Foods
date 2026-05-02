import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Review {
  id: number;
  userId: number;
  productId: number;
  rating: number;
  comment?: string;
  createdAt: string;
  user: { name: string };
  product: { name: string };
}

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly API = `${environment.apiUrl}/reviews`;

  constructor(private http: HttpClient) {}

  getReviews(filters: { productId?: number; page?: number; limit?: number } = {}): Observable<any> {
    let params = new HttpParams();
    if (filters.productId) params = params.set('productId', filters.productId);
    if (filters.page) params = params.set('page', filters.page);
    if (filters.limit) params = params.set('limit', filters.limit);
    return this.http.get<any>(this.API, { params });
  }

  createReview(data: { productId: number; rating: number; comment?: string }): Observable<any> {
    return this.http.post<any>(this.API, data);
  }

  deleteReview(id: number): Observable<any> {
    return this.http.delete<any>(`${this.API}/${id}`);
  }
}
