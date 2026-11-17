import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { apiBase } from '../config/api.config';

const BASE_URL = apiBase();

@Injectable({ providedIn: 'root' })
export class UploadService {
  constructor(private http: HttpClient) {}

  uploadImages(files: File[], type: 'listing' | 'avatar' | 'idVerification' | 'banner' = 'listing'): Observable<{ urls: string[] }> {
    const token = localStorage.getItem('soukmar_token');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
    const form = new FormData();
    files.forEach(f => form.append('images', f));
    form.append('type', type);
    return this.http.post<{ urls: string[] }>(`${BASE_URL}/upload`, form, { headers });
  }

  uploadFile(file: File, type: 'listing' | 'avatar' | 'idVerification' | 'banner' = 'avatar'): Observable<string> {
    const token = localStorage.getItem('soukmar_token');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
    const form = new FormData();
    form.append('images', file);
    form.append('type', type);
    return new Observable(observer => {
      this.http.post<{ urls: string[] }>(`${BASE_URL}/upload`, form, { headers }).subscribe({
        next: res => { observer.next(res.urls[0]); observer.complete(); },
        error: err => observer.error(err)
      });
    });
  }

  /** One photo for a chat message: the server strips metadata and stores it privately; returns its signed URL. */
  uploadChatImage(file: File): Observable<string> {
    const token = localStorage.getItem('soukmar_token');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
    const form = new FormData();
    form.append('image', file);
    return this.http.post<{ url: string }>(`${BASE_URL}/upload/chat`, form, { headers }).pipe(map(res => res.url));
  }
}
