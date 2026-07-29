import { Component } from '@angular/core';
import { ClientProductCatalogComponent } from '../../product-catalog/client-product-catalog/client-product-catalog.component';
import { ClientDashboardHeaderComponent } from '../../dashboard-header/client-dashboard-header/client-dashboard-header.component';
import { ClientOrderManagementComponent } from '../../order-management/client-order-management/client-order-management.component';
import { ClientBillingAccountComponent } from '../../billing-account/client-billing-account/client-billing-account.component';
import { ClientPromotionsComponent } from '../../promotions-rebates/client-promotions/client-promotions.component';
import { ClientSupportCenterComponent } from '../../support-center/client-support-center/client-support-center.component';
import { ClientNotificationsComponent } from '../../notifications/client-notifications/client-notifications.component';

@Component({
  selector: 'app-client-dashboard.component',
  imports: [
    ClientDashboardHeaderComponent,
    ClientProductCatalogComponent,ClientOrderManagementComponent,ClientBillingAccountComponent,
    ClientPromotionsComponent,ClientSupportCenterComponent,ClientNotificationsComponent
  ],
  templateUrl: './client-dashboard.component.component.html',
  styleUrl: './client-dashboard.component.component.scss'
})
export class ClientDashboardComponentComponent {

}
