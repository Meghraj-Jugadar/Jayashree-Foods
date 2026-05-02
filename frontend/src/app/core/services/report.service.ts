import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/order.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly API = `${environment.apiUrl}/reports`;

  constructor(private http: HttpClient) {}

  getSalesReport(filters: { startDate?: string; endDate?: string } = {}): Observable<ApiResponse<any>> {
    let params = new HttpParams();
    if (filters.startDate) params = params.set('startDate', filters.startDate);
    if (filters.endDate) params = params.set('endDate', filters.endDate);
    return this.http.get<ApiResponse<any>>(`${this.API}/sales`, { params });
  }

  exportCSV(filters: { startDate?: string; endDate?: string } = {}): void {
    let params = new HttpParams();
    if (filters.startDate) params = params.set('startDate', filters.startDate);
    if (filters.endDate) params = params.set('endDate', filters.endDate);
    const token = localStorage.getItem('token');
    const url = `${this.API}/export/csv?${params.toString()}`;
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', '');
    // Use fetch with auth header for download
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.blob())
      .then(blob => {
        const blobUrl = URL.createObjectURL(blob);
        a.href = blobUrl;
        a.download = `sales-report-${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(blobUrl);
      });
  }
}
