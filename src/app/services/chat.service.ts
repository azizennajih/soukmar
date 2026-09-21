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
  offerStatus?: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COUNTERED' | 'CANCELLED';
  senderId: string;
  receiverId: string;
  conversationId?: string;
  createdAt: string;
  sender?: { id: string; name: string };
}

interface RatedUser { id: string; name: string; avgRating?: number | null; reviewCount?: number; emailVerified?: boolean; phoneVerified?: boolean; idVerified?: boolean; }

export interface Conversation {
  id: string;
  listingId: string;
  buyerId: string;
  listing: { id: string; title: string; price?: number; currency: string; images: string[]; userId: string; status: string; user: RatedUser };
  buyer: RatedUser;
  messages: ChatMessage[];
  updatedAt: string;
  blockedByMe?: boolean;
  blockedByThem?: boolean;
}

export type CallState = 'idle' | 'outgoing' | 'incoming' | 'active';

export interface IncomingCallInfo {
  conversationId: string;
  fromUserId: string;
  fromUserName: string;
}

// Google's public STUN servers — free, no signup, no ongoing cost. No TURN
// relay is configured, so calls only connect when both peers are directly
// reachable (no relay fallback behind strict/symmetric NATs) — an accepted
// tradeoff for a zero-cost calling feature.
const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

@Injectable({ providedIn: 'root' })
export class ChatService {
  private socket: Socket | null = null;
  messages$ = new BehaviorSubject<ChatMessage[]>([]);
  typing$ = new BehaviorSubject<boolean>(false);
  listingStatus$ = new BehaviorSubject<{ listingId: string; status: string } | null>(null);

  callState$ = new BehaviorSubject<CallState>('idle');
  incomingCall$ = new BehaviorSubject<IncomingCallInfo | null>(null);
  remoteStream$ = new BehaviorSubject<MediaStream | null>(null);
  muted$ = new BehaviorSubject<boolean>(false);
  callError$ = new BehaviorSubject<string | null>(null);

  private pc: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private activeCallConversationId: string | null = null;
  private pendingOfferSdp: RTCSessionDescriptionInit | null = null;

  constructor(private api: ApiService) {}

  connect(token: string) {
    if (this.socket?.connected) return;
    this.socket = io('http://127.0.0.1:3000', { auth: { token } });
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
    this.socket.on('listing_status_changed', (data: { listingId: string; status: string }) => {
      this.listingStatus$.next(data);
    });

    this.socket.on('call_offer', (data: { conversationId: string; sdp: RTCSessionDescriptionInit; fromUserId: string; fromUserName: string }) => {
      if (this.callState$.getValue() !== 'idle') {
        // Already on a call elsewhere — decline automatically instead of leaving the caller hanging.
        this.socket?.emit('call_end', { conversationId: data.conversationId });
        return;
      }
      this.pendingOfferSdp = data.sdp;
      this.activeCallConversationId = data.conversationId;
      this.incomingCall$.next({ conversationId: data.conversationId, fromUserId: data.fromUserId, fromUserName: data.fromUserName });
      this.callState$.next('incoming');
    });

    this.socket.on('call_answer', async (data: { conversationId: string; sdp: RTCSessionDescriptionInit }) => {
      if (!this.pc || data.conversationId !== this.activeCallConversationId) return;
      await this.pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
      this.callState$.next('active');
    });

    this.socket.on('call_ice_candidate', async (data: { conversationId: string; candidate: RTCIceCandidateInit }) => {
      if (!this.pc || data.conversationId !== this.activeCallConversationId) return;
      try { await this.pc.addIceCandidate(new RTCIceCandidate(data.candidate)); } catch { /* candidate arrived after teardown — safe to ignore */ }
    });

    this.socket.on('call_end', (data: { conversationId: string }) => {
      if (data.conversationId !== this.activeCallConversationId) return;
      this.teardownCall();
    });
  }

  disconnect() {
    this.teardownCall();
    this.socket?.disconnect();
    this.socket = null;
    this.messages$.next([]);
  }

  private createPeerConnection(conversationId: string): RTCPeerConnection {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    pc.onicecandidate = (e) => {
      if (e.candidate) this.socket?.emit('call_ice_candidate', { conversationId, candidate: e.candidate });
    };
    pc.ontrack = (e) => this.remoteStream$.next(e.streams[0]);
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') this.teardownCall();
    };
    return pc;
  }

  async startCall(conversationId: string) {
    if (this.callState$.getValue() !== 'idle') return;
    this.callError$.next(null);
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      this.callError$.next('mic_denied');
      return;
    }
    this.activeCallConversationId = conversationId;
    this.pc = this.createPeerConnection(conversationId);
    this.localStream.getTracks().forEach(t => this.pc!.addTrack(t, this.localStream!));
    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    this.socket?.emit('call_offer', { conversationId, sdp: offer });
    this.callState$.next('outgoing');
  }

  async acceptCall() {
    const info = this.incomingCall$.getValue();
    if (!info || !this.pendingOfferSdp) return;
    this.callError$.next(null);
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      this.callError$.next('mic_denied');
      this.rejectCall();
      return;
    }
    this.pc = this.createPeerConnection(info.conversationId);
    this.localStream.getTracks().forEach(t => this.pc!.addTrack(t, this.localStream!));
    await this.pc.setRemoteDescription(new RTCSessionDescription(this.pendingOfferSdp));
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);
    this.socket?.emit('call_answer', { conversationId: info.conversationId, sdp: answer });
    this.incomingCall$.next(null);
    this.callState$.next('active');
  }

  rejectCall() {
    const info = this.incomingCall$.getValue();
    if (info) this.socket?.emit('call_end', { conversationId: info.conversationId });
    this.teardownCall();
  }

  endCall() {
    if (this.activeCallConversationId) this.socket?.emit('call_end', { conversationId: this.activeCallConversationId });
    this.teardownCall();
  }

  toggleMute() {
    if (!this.localStream) return;
    const nowMuted = !this.muted$.getValue();
    this.localStream.getAudioTracks().forEach(t => t.enabled = !nowMuted);
    this.muted$.next(nowMuted);
  }

  private teardownCall() {
    this.localStream?.getTracks().forEach(t => t.stop());
    this.localStream = null;
    this.pc?.close();
    this.pc = null;
    this.pendingOfferSdp = null;
    this.activeCallConversationId = null;
    this.remoteStream$.next(null);
    this.incomingCall$.next(null);
    this.muted$.next(false);
    this.callState$.next('idle');
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

  cancelOffer(messageId: string, conversationId: string, listingId: string) {
    this.socket?.emit('cancel_offer', { messageId, conversationId, listingId });
  }

  cancelReservation(conversationId: string, listingId: string) {
    this.socket?.emit('cancel_reservation', { conversationId, listingId });
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
