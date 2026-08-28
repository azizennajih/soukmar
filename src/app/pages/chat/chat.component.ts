import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ChatService, ChatMessage, Conversation } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-chat',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesEnd') messagesEnd!: ElementRef;

  conversations: Conversation[] = [];
  activeConv?: Conversation;
  messages: ChatMessage[] = [];
  messageText = '';
  offerAmount = '';
  showOfferInput = false;
  partnerTyping = false;
  loading = false;
  sendingOffer = false;
  listingStatus = '';

  private subs: Subscription[] = [];
  private typingTimer: ReturnType<typeof setTimeout> | null = null;
  private shouldScroll = false;

  constructor(
    public auth: AuthService,
    public chatService: ChatService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    if (!this.auth.isLoggedIn) { this.router.navigate(['/auth/login']); return; }
    const token = localStorage.getItem('soukmar_token')!;
    this.chatService.connect(token);

    this.subs.push(
      this.chatService.messages$.subscribe(msgs => {
        this.messages = msgs;
        this.shouldScroll = true;
        this.cdr.markForCheck();
      }),
      this.chatService.typing$.subscribe(t => {
        this.partnerTyping = t;
        this.cdr.markForCheck();
      }),
      this.chatService.listingStatus$.subscribe(data => {
        if (data && this.activeConv?.listingId === data.listingId) {
          this.listingStatus = data.status;
          this.cdr.markForCheck();
        }
      })
    );

    await this.loadConversations();

    const listingId = this.route.snapshot.queryParamMap.get('listing');
    if (listingId) {
      try {
        const conv = await this.chatService.getOrCreateConversation(listingId);
        await this.openConversation(conv);
      } catch (e: unknown) {
        const err = e as { error?: { error?: string } };
        if (err?.error?.error) alert(err.error.error);
      }
    }
  }

  async loadConversations() {
    this.conversations = await this.chatService.getConversations();
    this.cdr.markForCheck();
  }

  async openConversation(conv: Conversation) {
    this.activeConv = conv;
    this.showOfferInput = false;
    this.listingStatus = conv.listing.status || '';
    this.loading = true;
    this.cdr.markForCheck();

    const msgs = await this.chatService.getMessages(conv.id);
    this.chatService.messages$.next(msgs);
    this.chatService.joinConversation(conv.id);
    this.loading = false;
    this.shouldScroll = true;
    this.cdr.markForCheck();
  }

  cancelReservation() {
    if (!this.activeConv) return;
    if (!confirm('Réservation annuler? L\'annonce redevient active.')) return;
    this.chatService.cancelReservation(this.activeConv.id, this.activeConv.listingId);
    this.listingStatus = 'ACTIVE';
    this.cdr.markForCheck();
  }

  sendMessage() {
    if (!this.messageText.trim() || !this.activeConv) return;
    const partnerId = this.getPartnerId();
    this.chatService.sendMessage(this.activeConv.id, partnerId, this.activeConv.listingId, this.messageText.trim());
    this.messageText = '';
    this.chatService.emitTyping(this.activeConv.id, false);
  }

  sendOffer() {
    const amount = parseFloat(this.offerAmount);
    if (!amount || amount <= 0 || !this.activeConv) return;
    const partnerId = this.getPartnerId();
    this.chatService.sendOffer(this.activeConv.id, partnerId, this.activeConv.listingId, amount);
    this.offerAmount = '';
    this.showOfferInput = false;
  }

  respondOffer(msg: ChatMessage, status: 'ACCEPTED' | 'REJECTED') {
    if (!this.activeConv) return;
    this.chatService.respondOffer(msg.id, this.activeConv.id, status);
  }

  onTyping() {
    if (!this.activeConv) return;
    this.chatService.emitTyping(this.activeConv.id, true);
    if (this.typingTimer) clearTimeout(this.typingTimer);
    this.typingTimer = setTimeout(() => this.chatService.emitTyping(this.activeConv!.id, false), 2000);
  }

  onEnter(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.sendMessage(); }
  }

  getPartnerId(): string {
    const me = this.auth.currentUser()!.id;
    return this.activeConv!.listing.userId === me
      ? this.activeConv!.buyerId
      : this.activeConv!.listing.userId;
  }

  getPartnerName(): string {
    const me = this.auth.currentUser()!.id;
    return this.activeConv!.listing.userId === me
      ? this.activeConv!.buyer.name
      : this.activeConv!.listing.user.name;
  }

  isMine(msg: ChatMessage): boolean {
    return msg.senderId === this.auth.currentUser()?.id;
  }

  isOffer(msg: ChatMessage): boolean { return msg.type === 'OFFER'; }
  isSystem(msg: ChatMessage): boolean { return msg.type === 'SYSTEM'; }

  canRespond(msg: ChatMessage): boolean {
    return msg.type === 'OFFER' && msg.offerStatus === 'PENDING' && !this.isMine(msg);
  }

  canCancel(msg: ChatMessage): boolean {
    return msg.type === 'OFFER' && msg.offerStatus === 'PENDING' && this.isMine(msg);
  }

  cancelOffer(msg: ChatMessage) {
    if (!this.activeConv) return;
    if (!confirm('Annuler votre offre ?')) return;
    this.chatService.cancelOffer(msg.id, this.activeConv.id, this.activeConv.listingId);
  }

  getConvPartner(conv: Conversation): string {
    const me = this.auth.currentUser()!.id;
    return conv.listing.userId === me ? conv.buyer.name : conv.listing.user.name;
  }

  getLastMessage(conv: Conversation): string {
    const last = conv.messages[0];
    if (!last) return 'Aucun message';
    if (last.type === 'OFFER') return `Offre: ${last.offerAmount} MAD`;
    return last.content.slice(0, 40);
  }

  ngAfterViewChecked() {
    if (!this.shouldScroll) return;
    this.shouldScroll = false;
    const el = this.messagesEnd?.nativeElement;
    if (el) {
      const container = el.closest('.chat__messages');
      if (container) container.scrollTop = container.scrollHeight;
    }
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
    if (this.typingTimer) clearTimeout(this.typingTimer);
  }
}
