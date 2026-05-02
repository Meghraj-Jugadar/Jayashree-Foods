import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Payment, ApiResponse } from '../models/order.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly API = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  processPayment(orderId: number, method: string = 'SIMULATED'): Observable<ApiResponse<Payment>> {
    return this.http.post<ApiResponse<Payment>>(`${this.API}/process`, { orderId, method });
  }

  getPaymentByOrder(orderId: number): Observable<ApiResponse<Payment>> {
    return this.http.get<ApiResponse<Payment>>(`${this.API}/order/${orderId}`);
  }
}
