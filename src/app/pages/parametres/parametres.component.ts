import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-parametres',
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './parametres.component.html',
  styleUrl: './parametres.component.scss'
})
export class ParametresComponent implements OnInit {
  constructor(public auth: AuthService, private router: Router) {}

  ngOnInit() {
    if (!this.auth.isLoggedIn) { this.router.navigate(['/auth/login']); return; }
  }

  logout() {
    this.auth.logout();
  }
}
