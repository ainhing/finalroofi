import { Injectable } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

@Injectable({
  providedIn: 'root'
})
export class Notificationservice {
  private container: HTMLElement | null = null;

  constructor() {
    this.createContainer();
  }

  private createContainer() {
    if (typeof document !== 'undefined') {
      this.container = document.createElement('div');
      this.container.id = 'notification-container';
      this.container.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 10px;
      `;
      document.body.appendChild(this.container);
    }
  }

  show(message: string, type: NotificationType = 'info', duration: number = 3000) {
    if (!this.container) {
      this.createContainer();
    }
    if (!this.container) return;

    const icons: Record<NotificationType, string> = {
      success: 'ri-checkbox-circle-fill',
      error: 'ri-close-circle-fill',
      warning: 'ri-error-warning-fill',
      info: 'ri-information-fill'
    };

    const colors: Record<NotificationType, string> = {
      success: '#4caf50',
      error: '#f44336',
      warning: '#ff9800',
      info: '#2196f3'
    };

    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
      <i class="${icons[type]}" style="font-size: 20px;"></i>
      <span>${message}</span>
      <button style="
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 0;
        margin-left: auto;
      ">
        <i class="ri-close-line" style="font-size: 18px;"></i>
      </button>
    `;

    notification.style.cssText = `
      background: ${colors[type]};
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 300px;
      max-width: 400px;
      animation: slideInRight 0.3s ease;
    `;

    this.container.appendChild(notification);

    // Close button
    const closeBtn = notification.querySelector('button');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.remove(notification);
      });
    }

    // Auto remove
    if (duration > 0) {
      setTimeout(() => {
        this.remove(notification);
      }, duration);
    }
  }

  private remove(notification: HTMLElement) {
    notification.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => {
      notification.remove();
    }, 300);
  }

  success(message: string, duration?: number) {
    this.show(message, 'success', duration);
  }

  error(message: string, duration?: number) {
    this.show(message, 'error', duration);
  }

  warning(message: string, duration?: number) {
    this.show(message, 'warning', duration);
  }

  info(message: string, duration?: number) {
    this.show(message, 'info', duration);
  }
}
