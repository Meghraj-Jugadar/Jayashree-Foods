import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { User, AuthResponse, LoginRequest, RegisterRequest } from '../models/user.model';
import { ApiResponse } from '../models/order.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = `${environment.apiUrl}/auth`;
  currentUser = signal<User | null>(this.getUserFromStorage());

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.API}/login`, credentials).pipe(
      tap(res => {
        if (res.success) {
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('user', JSON.stringify(res.data.user));
          this.currentUser.set(res.data.user);
        }
      })
    );
  }

  register(data: RegisterRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.API}/register`, data).pipe(
      tap(res => {
        if (res.success) {
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('user', JSON.stringify(res.data.user));
          this.currentUser.set(res.data.user);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    return this.currentUser()?.role?.name === 'admin';
  }

  updateProfile(data: Partial<User>): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.API}/profile`, data).pipe(
      tap(res => {
        if (res.success) {
          localStorage.setItem('user', JSON.stringify(res.data));
          this.currentUser.set(res.data);
        }
      })
    );
  }

  changePassword(data: { currentPassword: string; newPassword: string }): Observable<ApiResponse<null>> {
    return this.http.put<ApiResponse<null>>(`${this.API}/change-password`, data);
  }

  private getUserFromStorage(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}
