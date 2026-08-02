import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-client-notifications',
  imports: [CardModule],
  templateUrl: './client-notifications.component.html',
  styleUrl: './client-notifications.component.scss'
})
export class ClientNotificationsComponent {
// Count of current unread high priority activities
unreadCount: number = 3;

// Active data stream model showing the last notification received in time sequence
latestNotification = {
  category: 'Order Dispatch',
  message: 'Shipment with 200x Premium Cotton Mops out for delivery via Route 4 Truck.',
  icon: 'pi pi-truck',
  color: '#3b82f6',
  timeAgo: '10m ago'
};

// Open complete modal pane interface
openNotificationCenter() {
  console.log('Opening full history overlay dashboard view...');
  // Logic to open a p-sidebar or navigation page for the wholesale notifications stream
}

}
