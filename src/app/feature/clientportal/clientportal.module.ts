import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClientPortalRoutingModule } from './clientportal-routing.module';
import { ClientPortalLayoutComponent } from './components/client-portal-layout/client-portal-layout.component';
import { SiteComponent } from './site/site.component';
import { UserMgrComponent } from '../usermgt/user-mgr/user-mgr.component';
import { ClientPurchaseMgrComponent } from './CRUD/client-purchase-mgr/client-purchase-mgr.component';


@NgModule({
  declarations: [ClientPortalLayoutComponent,
    SiteComponent,
    UserMgrComponent,
    ClientPurchaseMgrComponent],
  imports: [
    CommonModule,
    ClientPortalRoutingModule
  ]
})
export class ClientPortalModule { }
