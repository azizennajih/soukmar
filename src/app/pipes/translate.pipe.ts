import { Pipe, PipeTransform, inject } from '@angular/core';
import { I18nService } from '../services/i18n.service';

@Pipe({ name: 'T', standalone: true, pure: false })
export class TranslatePipe implements PipeTransform {
  private i18n = inject(I18nService);

  transform(key: string): string {
    // Reading lang() makes Angular track this signal and re-run on change
    this.i18n.lang();
    return this.i18n.t(key);
  }
}
