import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  message: string;
  seen: boolean;
  created_at?: string;
  sender?: any;
  receiver?: any;
}

@Injectable({
  providedIn: 'root'
})
export class MessagingService {
  private baseUrl = 'http://127.0.0.1:8000/api/messages';

  constructor(private http: HttpClient) {}

  // Get all messages for authenticated user
  getMessages(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}`);
  }

  // Send a new message
  sendMessage(data: { message: string, receiver_id: number }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}`, data);
  }

  // Get conversation with a specific user
  getConversation(userId: number, p0: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/conversation/${userId}`);
  }

  // Mark all messages as read in a conversation
  markAsRead(userId: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/read/${userId}`, {});
  }

  // Get list of conversations (if implemented in backend)
  getConversationsList(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/conversations`);
  }

  // Get unread message count
  getUnreadCount(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/unread/count`);
  }

  // Get a specific message
  getMessageById(messageId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${messageId}`);
  }

  // Update a message
  updateMessage(messageId: number, data: { message: string }): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${messageId}`, data);
  }

  // Delete a message
  deleteMessage(messageId: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${messageId}`);
  }

  // Create a new conversation by receiver email
  createConversationByEmail(email: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/create-conversation`, { email });
  }
}
