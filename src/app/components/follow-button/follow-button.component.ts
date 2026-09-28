import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { I18nService } from '../../services/i18n.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { IconComponent } from '../icon/icon.component';

/** Follow/unfollow toggle for a seller or buyer profile — same [Input]/
 * [Output] toggle shape as app-block-button, kept as a separate component
 * since following and blocking are unrelated actions with their own
 * confirmation/styling rules (no confirm() here: following isn't
 * destructive, unlike blocking). */
@Component({
  selector: 'app-follow-button',
  imports: [CommonModule, TranslatePipe, IconComponent],
  templateUrl: './follow-button.component.html',
  styleUrl: './follow-button.component.scss'
})
export class FollowButtonComponent {
  @Input({ required: true }) userId!: string;
  @Input() following = false;
  @Output() followingChange = new EventEmitter<boolean>();
  @Output() followerCountChange = new EventEmitter<number>();

  private userService = inject(UserService);
  i18n = inject(I18nService);

  submitting = signal(false);

  toggle() {
    if (this.submitting()) return;
    this.submitting.set(true);
    const req$ = this.following ? this.userService.unfollowUser(this.userId) : this.userService.followUser(this.userId);
    req$.subscribe({
      next: ({ following, followerCount }) => {
        this.following = following;
        this.followingChange.emit(following);
        this.followerCountChange.emit(followerCount);
        this.submitting.set(false);
      },
      error: () => { this.submitting.set(false); }
    });
  }
}
