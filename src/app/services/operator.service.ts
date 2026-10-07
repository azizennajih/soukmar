import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';

export interface OperatorInfo {
  name: string; street: string; zipCity: string; country: string; phone: string; email: string; vatId: string;
}

const TOKENS: Record<string, keyof OperatorInfo> = {
  '{op_name}': 'name', '{op_street}': 'street', '{op_zipcity}': 'zipCity', '{op_country}': 'country',
  '{op_phone}': 'phone', '{op_email}': 'email', '{op_vat}': 'vatId',
};

/** Provider details for the legal pages. They come from the backend at runtime (they live in the
 * server's environment, not in this public repository) and replace the {op_*} tokens in the texts. */
@Injectable({ providedIn: 'root' })
export class OperatorService {
  private api = inject(ApiService);
  readonly info = signal<OperatorInfo | null>(null);
  private requested = false;

  /** Loads the details once (also during server-side rendering, so crawlers see the finished page). */
  load(): void {
    if (this.requested) return;
    this.requested = true;
    this.api.get<OperatorInfo>('/legal/operator').subscribe({
      next: (data) => this.info.set(data),
      error: () => { this.requested = false; },
    });
  }

  /** Replaces the {op_*} tokens of a legal text with the provider's details. */
  fill(text: string): string {
    const info = this.info();
    return Object.entries(TOKENS).reduce((out, [token, field]) => out.split(token).join(info?.[field] ?? ''), text);
  }
}
