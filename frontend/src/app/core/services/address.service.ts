import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Address } from '../models/address.model';
import { ApiResponse } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class AddressService {
  private readonly API = `${environment.apiUrl}/addresses`;

  constructor(private http: HttpClient) {}

  getAddresses(): Observable<ApiResponse<Address[]>> {
    return this.http.get<ApiResponse<Address[]>>(this.API);
  }

  createAddress(data: Partial<Address>): Observable<ApiResponse<Address>> {
    return this.http.post<ApiResponse<Address>>(this.API, data);
  }

  updateAddress(id: number, data: Partial<Address>): Observable<ApiResponse<Address>> {
    return this.http.put<ApiResponse<Address>>(`${this.API}/${id}`, data);
  }

  deleteAddress(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.API}/${id}`);
  }

  setDefault(id: number): Observable<ApiResponse<Address>> {
    return this.http.patch<ApiResponse<Address>>(`${this.API}/${id}/default`, {});
  }
}
