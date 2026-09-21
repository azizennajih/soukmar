import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { LocalizedRouterLinkDirective } from '../../directives/localized-router-link.directive';
import { AuthService } from '../../services/auth.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { I18nService } from '../../services/i18n.service';

@Component({
  selector: 'app-parametres',
  imports: [CommonModule, RouterLink, LocalizedRouterLinkDirective, TranslatePipe],
  templateUrl: './parametres.component.html',
  styleUrl: './parametres.component.scss'
})
export class ParametresComponent implements OnInit {
  constructor(public auth: AuthService, private router: Router, private i18n: I18nService) {}

  ngOnInit() {
    if (!this.auth.isLoggedIn) { this.router.navigate(this.i18n.withLang(['/auth/login'])); return; }
  }

  logout() {
    this.auth.logout();
  }
}
