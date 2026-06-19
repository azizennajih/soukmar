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
}
