import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { LocalizedRouterLinkDirective } from '../../directives/localized-router-link.directive';
import { ApiService } from '../../services/api.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

type State = 'ask' | 'working' | 'done' | 'error';

/** The page behind the unsubscribe link of every advertising e-mail. No login needed: the link carries a signed token.
 * It asks for one click instead of unsubscribing on load, so mail scanners that open links do not unsubscribe people by accident. */
@Component({
  selector: 'app-newsletter-abmelden',
  imports: [CommonModule, RouterLink, LocalizedRouterLinkDirective, TranslatePipe],
  templateUrl: './newsletter-abmelden.component.html',
  styleUrl: './newsletter-abmelden.component.scss'
})
export class NewsletterAbmeldenComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);

  state = signal<State>('ask');
  private token = '';

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('t') ?? '';
    if (!this.token) this.state.set('error');
  }

  async confirm() {
    this.state.set('working');
    try {
      await firstValueFrom(this.api.post(`/marketing/unsubscribe/${encodeURIComponent(this.token)}`, {}));
      this.state.set('done');
    } catch {
      this.state.set('error');
    }
  }
}
