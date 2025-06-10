import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  AfterViewChecked
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessagingService, Message } from '../../../../services/messaging.service';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit, AfterViewInit, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  messages: Message[] = [];
  newMessage = '';
  userId!: number;
  loading = true;
  user: any = null;
  shouldScroll = false;
  currentPage = 1;
  hasMoreMessages = true;
  isLoadingMore = false;
  private isUserScrolling = false;

  constructor(
    private route: ActivatedRoute,
    private messagingService: MessagingService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.userId = +params['id'];
      this.fetchMessages();
    });
  }

  ngAfterViewInit(): void {
    this.setupScrollListener();
    this.scrollToBottom();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll && !this.isUserScrolling) {
      this.scrollToBottom();
    }
  }

  setupScrollListener(): void {
    if (this.messagesContainer) {
      this.messagesContainer.nativeElement.addEventListener('scroll', () => {
        const element = this.messagesContainer.nativeElement;
        const atTop = element.scrollTop === 0;
        const atBottom = element.scrollHeight - element.scrollTop === element.clientHeight;

        // Check if user is scrolling up to load more messages
        if (atTop && this.hasMoreMessages && !this.isLoadingMore) {
          this.loadMoreMessages();
        }

        // Track if user is manually scrolling
        this.isUserScrolling = !atBottom;
        
        // Auto-scroll only if user is at bottom
        this.shouldScroll = atBottom;
      });
    }
  }

  fetchMessages() {
    this.loading = true;
    this.currentPage = 1;
    this.messagingService.getConversation(this.userId, this.currentPage).subscribe(res => {
      this.messages = res.data.messages || [];
      this.user = res.data.user || null;
      this.hasMoreMessages = res.data.hasMore || false;
      this.loading = false;
      this.shouldScroll = true;
      this.isUserScrolling = false;
    });
  }

  loadMoreMessages(): void {
    if (this.isLoadingMore || !this.hasMoreMessages) return;
    
    this.isLoadingMore = true;
    const previousScrollHeight = this.messagesContainer.nativeElement.scrollHeight;
    
    this.messagingService.getConversation(this.userId, this.currentPage + 1).subscribe(res => {
      const olderMessages = res.data.messages || [];
      this.messages = [...olderMessages, ...this.messages];
      this.hasMoreMessages = res.data.hasMore || false;
      this.currentPage++;
      this.isLoadingMore = false;
      
      // Maintain scroll position after loading older messages
      setTimeout(() => {
        const newScrollHeight = this.messagesContainer.nativeElement.scrollHeight;
        this.messagesContainer.nativeElement.scrollTop = newScrollHeight - previousScrollHeight;
      }, 50);
    });
  }

  sendMessage() {
    if (!this.newMessage.trim()) return;

    this.messagingService.sendMessage({
      message: this.newMessage,
      receiver_id: this.userId
    }).subscribe(() => {
      this.newMessage = '';
      this.shouldScroll = true;
      this.isUserScrolling = false;
      this.fetchMessages(); // will scroll after loading
    });
  }

  scrollToBottom(): void {
    try {
      setTimeout(() => {
        if (this.messagesContainer && this.shouldScroll) {
          this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
        }
      }, 100);
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  markAsRead() {
    this.messagingService.markAsRead(this.userId).subscribe();
  }

  getFormattedDate(date: string): string {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    };
    return new Date(date).toLocaleDateString('en-US', options);
  }

  getMessageClass(message: Message): string {
    return message.sender_id === this.userId ? 'message-received' : 'message-sent';
  }
}
