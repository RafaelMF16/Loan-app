import { Injectable, signal } from '@angular/core';

export type NotificationType = 'success' | 'error';

export interface Notification {
  id: number;
  type: NotificationType;
  message: string;
}

let nextId = 0;

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly _notifications = signal<Notification[]>([]);
  readonly notifications = this._notifications.asReadonly();

  success(message: string): void {
    const id = ++nextId;
    this._notifications.update((list) => [...list, { id, type: 'success', message }]);
    setTimeout(() => this.dismiss(id), 4000);
  }

  error(message: string): void {
    const id = ++nextId;
    this._notifications.update((list) => [...list, { id, type: 'error', message }]);
  }

  dismiss(id: number): void {
    this._notifications.update((list) => list.filter((n) => n.id !== id));
  }
}
