import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { ApiResponse, PaginatedResponse } from '../models/order.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly API = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getUsers(filters: any = {}): Observable<PaginatedResponse<User>> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params = params.set(k, String(v)); });
    return this.http.get<PaginatedResponse<User>>(this.API, { params });
  }

  getUser(id: number): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.API}/${id}`);
  }

  toggleStatus(id: number): Observable<ApiResponse<{ isActive: boolean }>> {
    return this.http.patch<ApiResponse<{ isActive: boolean }>>(`${this.API}/${id}/toggle-status`, {});
  }
}
