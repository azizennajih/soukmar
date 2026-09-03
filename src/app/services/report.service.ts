import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Report } from '../models/report.model';

@Injectable({ providedIn: 'root' })
export class ReportService {
  constructor(private api: ApiService) {}

  submit(data: { listingId?: string; reportedId: string; reason: string }): Observable<Report> {
    return this.api.post<Report>('/reports', data);
  }

  adminList(): Observable<Report[]> {
    return this.api.get<Report[]>('/reports/admin');
  }

  adminUpdate(id: string, data: { status: 'RESOLVED' | 'DISMISSED'; adminNote?: string }): Observable<Report> {
    return this.api.patch<Report>(`/reports/admin/${id}`, data);
  }
}
