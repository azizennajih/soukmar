import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BrowserStorageService } from './browser-storage.service';

const BASE_URL = 'http://127.0.0.1:3000/api';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private storage = inject(BrowserStorageService);

  constructor(private http: HttpClient) {}

  private headers(): HttpHeaders {
    const token = this.storage.getItem('soukmar_token');
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  get<T>(path: string, params?: Record<string, string>): Observable<T> {
    let p = new HttpParams();
    if (params) Object.entries(params).forEach(([k, v]) => { if (v) p = p.set(k, v); });
    return this.http.get<T>(`${BASE_URL}${path}`, { headers: this.headers(), params: p });
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<T>(`${BASE_URL}${path}`, body, { headers: this.headers() });
  }

  put<T>(path: string, body: unknown): Observable<T> {
    return this.http.put<T>(`${BASE_URL}${path}`, body, { headers: this.headers() });
  }

  delete<T>(path: string, body?: unknown): Observable<T> {
    return this.http.delete<T>(`${BASE_URL}${path}`, { headers: this.headers(), body });
  }

  patch<T>(path: string, body: unknown): Observable<T> {
    return this.http.patch<T>(`${BASE_URL}${path}`, body, { headers: this.headers() });
  }
}
