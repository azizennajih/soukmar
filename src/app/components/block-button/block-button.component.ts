import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { I18nService } from '../../services/i18n.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-block-button',
  imports: [CommonModule, TranslatePipe],
  templateUrl: './block-button.component.html',
  styleUrl: './block-button.component.scss'
})
export class BlockButtonComponent {
  @Input({ required: true }) userId!: string;
  @Input() blocked = false;
  /** Compact style for tight spaces like the chat header. */
  @Input() compact = false;
  @Output() blockedChange = new EventEmitter<boolean>();

  private userService = inject(UserService);
  i18n = inject(I18nService);

  submitting = signal(false);

  toggle() {
    if (this.submitting()) return;
    if (!this.blocked && !confirm(this.i18n.t('block.confirm'))) return;

    this.submitting.set(true);
    const req$ = this.blocked ? this.userService.unblockUser(this.userId) : this.userService.blockUser(this.userId);
    req$.subscribe({
      next: ({ blocked }) => {
        this.blocked = blocked;
        this.blockedChange.emit(blocked);
        this.submitting.set(false);
      },
      error: () => { this.submitting.set(false); }
    });
  }
}
