import { Component, inject } from '@angular/core';
import { NotificationService } from '../../../services/notification/notification.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [],
  templateUrl: './toast-container.html',
})
export class ToastContainerComponent {
  readonly notif = inject(NotificationService);
}
