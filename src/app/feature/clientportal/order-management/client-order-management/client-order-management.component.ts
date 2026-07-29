import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-client-order-management',
  imports: [CardModule],
  templateUrl: './client-order-management.component.html',
  styleUrl: './client-order-management.component.scss'
})
export class ClientOrderManagementComponent {
purchaseCount = 4; // Backordered replenishment batches
    activeSalesOrders = 12; // Picking/Packing queue count
}
