import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

const BASE_URL = 'http://localhost:3000/api';

@Injectable({ providedIn: 'root' })
export class UploadService {
  constructor(private http: HttpClient) {}

  uploadImages(files: File[]): Observable<{ urls: string[] }> {
    const token = localStorage.getItem('soukmar_token');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
    const form = new FormData();
    files.forEach(f => form.append('images', f));
    return this.http.post<{ urls: string[] }>(`${BASE_URL}/upload`, form, { headers });
  }

  uploadFile(file: File): Observable<string> {
    const token = localStorage.getItem('soukmar_token');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
    const form = new FormData();
    form.append('images', file);
    return new Observable(observer => {
      this.http.post<{ urls: string[] }>(`${BASE_URL}/upload`, form, { headers }).subscribe({
        next: res => { observer.next(res.urls[0]); observer.complete(); },
        error: err => observer.error(err)
      });
    });
  }
}
