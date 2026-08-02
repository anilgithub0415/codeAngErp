import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-client-support-center',schemas:[CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule,CardModule, DropdownModule],
  templateUrl: './client-support-center.component.html',
  styleUrl: './client-support-center.component.scss'
})
export class ClientSupportCenterComponent {
// Support status counter
supportSummary = {
  openTickets: 2
};

// Target backing variable for the p-dropdown item select
selectedSupportAction: any = null;

// Categorized wholesale support array mapping all requested operations
supportOptions = [
  { label: 'Raise Complaint', value: 'COMPLAINT', icon: 'pi pi-exclamation-triangle', color: '#ef4444', description: 'Log logistics, delivery quality, or short shipment gaps' },
  { label: 'Replacement Request', value: 'REPLACEMENT', icon: 'pi pi-refresh', color: '#3b82f6', description: 'Exchange defective mop heads, broken shafts, or leaky cleaner jugs' },
  { label: 'Return Request', value: 'RETURN', icon: 'pi pi-backward', color: '#f59e0b', description: 'Send back unordered overstock elements under contract conditions' },
  { label: 'Service Tickets', value: 'TICKETS', icon: 'pi pi-ticket', color: '#6366f1', description: 'Review progress logs or update ongoing investigation threads' },
  { label: 'Chat', value: 'CHAT', icon: 'pi pi-comments', color: '#22c55e', description: 'Instantly connect with a support specialist on duty right now' },
  { label: 'Account Manager', value: 'AM_DETAILS', icon: 'pi pi-user', color: '#a855f7', description: 'Contact assigned B2B commercial supervisor directly' }
];

// Dropdown change listener to route action paths smoothly
onSupportActionSelect(event: any) {
  if (!event.value) return;
  console.log('Routing wholesale customer support node to: ', event.value);
  // Implement structural navigation handling based on event.value strategy
}

// Separate handler button logic for the fast live-chat anchor node
initiateLiveChat() {
  console.log('Activating real-time support socket interface...');
}

}
