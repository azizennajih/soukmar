import { Pipe, PipeTransform, inject } from '@angular/core';
import { I18nService } from '../services/i18n.service';

@Pipe({ name: 'T', standalone: true, pure: false })
export class TranslatePipe implements PipeTransform {
  private i18n = inject(I18nService);

  transform(key: string): string {
    this.i18n._tick(); // subscribe to ticks so pipe re-evaluates on lang change
    return this.i18n.t(key);
  }
}
