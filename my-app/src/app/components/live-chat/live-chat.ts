import { Component, OnInit, OnDestroy } from '@angular/core';

interface ChatMessage {
  text: string;
  isBot: boolean;
  timestamp: string;
}

@Component({
  selector: 'app-live-chat',
  standalone: false,
  template: `
    <!-- Chat Button -->
    <button 
      class="live-chat-button"
      (click)="toggle()"
      [attr.aria-label]="isOpen ? 'Đóng chat' : 'Mở chat'">
      <i [class]="isOpen ? 'ri-close-line' : 'ri-customer-service-2-fill'"></i>
    </button>

    <!-- Chat Box -->
    <div class="live-chat-box" *ngIf="isOpen">
      <div class="chat-header">
        <div>
          <h3>ROOFI Support</h3>
          <p>Online - Phản hồi ngay</p>
        </div>
        <button class="chat-close" (click)="close()">
          <i class="ri-close-line"></i>
        </button>
      </div>

      <div class="chat-messages" #messagesContainer>
        <div *ngFor="let message of messages" 
             class="chat-message"
             [ngClass]="message.isBot ? 'bot-message' : 'user-message'">
          <div class="message-avatar" *ngIf="message.isBot">
            <i class="ri-customer-service-line"></i>
          </div>
          <div class="message-content" [ngClass]="message.isBot ? 'bot-content' : 'user-content'">
            <p>{{ message.text }}</p>
            <span class="message-time">{{ message.timestamp }}</span>
          </div>
        </div>
      </div>

      <div class="chat-input-area">
        <div class="input-row">
          <input 
            type="text" 
            placeholder="Nhập tin nhắn..." 
            [(ngModel)]="inputMessage"
            (keypress.enter)="sendMessage()"
            #messageInput>
          <button class="chat-send" (click)="sendMessage()">
            <i class="ri-send-plane-fill"></i>
          </button>
        </div>
        <div class="quick-replies">
          <button 
            *ngFor="let quickReply of quickReplies"
            class="quick-reply-btn"
            (click)="sendQuickReply(quickReply)">
            {{ quickReply }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .live-chat-button {
      position: fixed;
      bottom: 30px;
      right: 30px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: var(--eco-green, #4caf50);
      color: white;
      border: none;
      font-size: 28px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 9998;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .live-chat-button:hover {
      transform: scale(1.1);
    }

    .live-chat-box {
      position: fixed;
      bottom: 100px;
      right: 30px;
      width: 350px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.2);
      z-index: 9998;
      display: flex;
      flex-direction: column;
      max-height: 500px;
    }

    .chat-header {
      background: var(--eco-green, #4caf50);
      color: white;
      padding: 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-radius: 12px 12px 0 0;
    }

    .chat-header h3 {
      font-size: 16px;
      margin: 0 0 3px 0;
    }

    .chat-header p {
      font-size: 12px;
      opacity: 0.9;
      margin: 0;
    }

    .chat-close {
      background: none;
      border: none;
      color: white;
      font-size: 24px;
      cursor: pointer;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .chat-messages {
      height: 300px;
      overflow-y: auto;
      padding: 15px;
      background: #f9f9f9;
      flex: 1;
    }

    .chat-message {
      margin-bottom: 15px;
      display: flex;
      gap: 10px;
    }

    .user-message {
      justify-content: flex-end;
    }

    .message-avatar {
      width: 35px;
      height: 35px;
      border-radius: 50%;
      background: var(--eco-green, #4caf50);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 18px;
      flex-shrink: 0;
    }

    .message-content {
      padding: 10px 15px;
      border-radius: 12px;
      max-width: 70%;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }

    .bot-content {
      background: white;
    }

    .user-content {
      background: var(--eco-green, #4caf50);
      color: white;
    }

    .message-content p {
      font-size: 14px;
      line-height: 1.5;
      margin: 0 0 5px 0;
    }

    .message-time {
      font-size: 11px;
      color: #888;
      opacity: 0.8;
    }

    .user-content .message-time {
      color: white;
      opacity: 0.8;
    }

    .chat-input-area {
      padding: 15px;
      background: white;
      border-top: 1px solid #eee;
      border-radius: 0 0 12px 12px;
    }

    .input-row {
      display: flex;
      gap: 10px;
      margin-bottom: 10px;
    }

    .input-row input {
      flex: 1;
      padding: 10px 15px;
      border: 1px solid #ddd;
      border-radius: 20px;
      outline: none;
      font-size: 14px;
    }

    .chat-send {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--eco-green, #4caf50);
      color: white;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    }

    .quick-replies {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .quick-reply-btn {
      padding: 6px 12px;
      border: 1px solid var(--eco-green, #4caf50);
      background: white;
      color: var(--eco-green, #4caf50);
      border-radius: 15px;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.3s;
    }

    .quick-reply-btn:hover {
      background: var(--eco-green, #4caf50);
      color: white;
    }

    @media (max-width: 750px) {
      .live-chat-box {
        width: calc(100% - 20px);
        right: 10px;
        bottom: 90px;
      }
    }
  `]
})
export class LiveChat implements OnInit, OnDestroy {
  isOpen = false;
  inputMessage = '';
  messages: ChatMessage[] = [];
  quickReplies = [
    'Tôi muốn tư vấn sản phẩm',
    'Kiểm tra đơn hàng',
    'Chính sách đổi trả'
  ];

  ngOnInit() {
    // Thêm message chào mừng
    this.addBotMessage('Xin chào! 👋 Chúng tôi có thể giúp gì cho bạn?');
  }

  ngOnDestroy() {
    // Cleanup nếu cần
  }

  toggle() {
    this.isOpen = !this.isOpen;
  }

  open() {
    this.isOpen = true;
  }

  close() {
    this.isOpen = false;
  }

  sendMessage() {
    if (!this.inputMessage.trim()) return;

    this.addUserMessage(this.inputMessage);
    const message = this.inputMessage;
    this.inputMessage = '';

    // Simulate bot response
    setTimeout(() => {
      this.addBotMessage('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong giây lát. 😊');
    }, 1000);
  }

  sendQuickReply(message: string) {
    this.inputMessage = message;
    this.sendMessage();
  }

  private addUserMessage(text: string) {
    this.messages.push({
      text,
      isBot: false,
      timestamp: 'Vừa xong'
    });
    this.scrollToBottom();
  }

  private addBotMessage(text: string) {
    this.messages.push({
      text,
      isBot: true,
      timestamp: 'Vừa xong'
    });
    this.scrollToBottom();
  }

  private scrollToBottom() {
    setTimeout(() => {
      const container = document.querySelector('.chat-messages');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  }
}
