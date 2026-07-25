import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClientPortalLayoutComponent } from './components/client-portal-layout/client-portal-layout.component';
import { SiteComponent } from './site/site.component';
import { UserMgrComponent } from '../usermgt/user-mgr/user-mgr.component';
import { ClientPurchaseMgrComponent } from './client-purchase-mgr/client-purchase-mgr.component';
import { QuotationMgrComponent } from '../quotation-mgt/quotation-mgr/quotation-mgr.component';
import { ReceivedQuotesNOffersComponent } from './received-quotes-noffers/received-quotes-noffers.component';

const routes: Routes = [
  {
    path: '', // ⚠️ MUST be an empty string because '/app/clientportal' is already consumed by the parent router
    component: ClientPortalLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'receivedQuotesNOffers', // Standardize your landing target to a child route that exists
        pathMatch: 'full'
      },

      {
        path: 'receivedQuotesNOffers',
        component: ReceivedQuotesNOffersComponent
      },
      {
        path: 'sites',
        component: SiteComponent
      },
      {
        path: 'siteusers',
        component: UserMgrComponent
      },
      {
        path: 'sitepurchase',
        component: ClientPurchaseMgrComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientPortalRoutingModule { }
