import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClientPortalLayoutComponent } from './components/client-portal-layout/client-portal-layout.component';
import { SiteComponent } from './site/site.component';
import { UserMgrComponent } from '../usermgt/user-mgr/user-mgr.component';
import { ClientPurchaseMgrComponent } from './CRUD/client-purchase-mgr/client-purchase-mgr.component';
import { QuotationMgrComponent } from '../quotation-mgt/quotation-mgr/quotation-mgr.component';
import { ReceivedQuotesNOffersComponent } from './received-quotes-noffers/received-quotes-noffers.component';
import { Dashboard1Component } from './samplesComponents/dashboard1/dashboard1.component';
import { Dashboard2Component } from './samplesComponents/dashboard2/dashboard2.component';
import { Dashboard3Component } from './samplesComponents/dashboard3/dashboard3.component';
import { Dashboard4Component } from './samplesComponents/dashboard4/dashboard4.component';
import { ProcurementPadComponent } from './components/procurement-pad/procurement-pad.component';
import { Dashboard5Component } from './samplesComponents/dashboard5/dashboard5.component';
import { SampleDashboardMainComponent } from './samplesComponents/sample-dashboard-main/sample-dashboard-main.component';
import { DashboardComponent } from '../dashboard/dashboard/dashboard.component';
import { ClientDashboardComponentComponent } from './Dashboard/client-dashboard.component/client-dashboard.component.component';

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
        path: 'dashboard',
        component: ClientDashboardComponentComponent
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
