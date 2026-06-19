import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  form = { name: '', email: '', phone: '', city: '', password: '', confirm: '' };
  showPass = false;
  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  async submit() {
    if (this.form.password !== this.form.confirm) {
      this.error = 'Les mots de passe ne correspondent pas.'; return;
    }
    if (this.form.password.length < 6) {
      this.error = 'Le mot de passe doit contenir au moins 6 caractères.'; return;
    }
    this.loading = true;
    this.error = '';
    const result = await this.auth.register(
      this.form.name, this.form.email, this.form.password,
      this.form.phone, this.form.city
    );
    this.loading = false;
    if (result.ok) this.router.navigate(['/']);
    else this.error = result.error || 'Une erreur est survenue. Veuillez réessayer.';
  }
}
