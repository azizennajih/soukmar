import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';
import { firstValueFrom } from 'rxjs';

export interface ChatMessage {
  id: string;
  content: string;
  type: 'TEXT' | 'OFFER' | 'SYSTEM';
  offerAmount?: number;
  offerStatus?: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COUNTERED';
  senderId: string;
  receiverId: string;
  conversationId?: string;
  createdAt: string;
  sender?: { id: string; name: string };
}

export interface Conversation {
  id: string;
  listingId: string;
  buyerId: string;
  listing: { id: string; title: string; price?: number; currency: string; images: string[]; userId: string; user: { id: string; name: string } };
  buyer: { id: string; name: string };
  messages: ChatMessage[];
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private socket: Socket | null = null;
  messages$ = new BehaviorSubject<ChatMessage[]>([]);
  typing$ = new BehaviorSubject<boolean>(false);

  constructor(private api: ApiService) {}

  connect(token: string) {
    if (this.socket?.connected) return;
    this.socket = io('http://localhost:3000', { auth: { token } });
    this.socket.on('connect', () => console.log('Socket connected'));
    this.socket.on('new_message', (msg: ChatMessage) => {
      this.messages$.next([...this.messages$.getValue(), msg]);
    });
    this.socket.on('offer_updated', (updated: ChatMessage) => {
      const msgs = this.messages$.getValue().map(m => m.id === updated.id ? updated : m);
      this.messages$.next(msgs);
    });
    this.socket.on('user_typing', (data: { isTyping: boolean }) => {
      this.typing$.next(data.isTyping);
    });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.messages$.next([]);
  }

  joinConversation(conversationId: string) {
    this.socket?.emit('join_conversation', conversationId);
  }

  sendMessage(conversationId: string, receiverId: string, listingId: string, content: string) {
    this.socket?.emit('send_message', { conversationId, receiverId, listingId, content });
  }

  sendOffer(conversationId: string, receiverId: string, listingId: string, amount: number) {
    this.socket?.emit('send_offer', { conversationId, receiverId, listingId, amount });
  }

  respondOffer(messageId: string, conversationId: string, status: 'ACCEPTED' | 'REJECTED') {
    this.socket?.emit('respond_offer', { messageId, conversationId, status });
  }

  emitTyping(conversationId: string, isTyping: boolean) {
    this.socket?.emit('typing', { conversationId, isTyping });
  }

  getConversations(): Promise<Conversation[]> {
    return firstValueFrom(this.api.get<Conversation[]>('/chat/conversations'));
  }

  getOrCreateConversation(listingId: string): Promise<Conversation> {
    return firstValueFrom(this.api.post<Conversation>('/chat/conversations', { listingId }));
  }

  getMessages(conversationId: string): Promise<ChatMessage[]> {
    return firstValueFrom(this.api.get<ChatMessage[]>(`/chat/conversations/${conversationId}/messages`));
  }
}
