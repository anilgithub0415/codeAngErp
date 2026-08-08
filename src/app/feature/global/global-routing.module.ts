// src/app/feature/global/global-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HSNTaxRuleComponent } from './hsntax-rule/hsntax-rule.component';
import { SubscriptionPlanComponent } from './subscription-plan/subscription-plan.component';
import { TenantComponent } from './tenant/tenant.component';
import { PermissionJunctionComponent } from './permission-junction/permission-junction.component';
import { superAdminGuard } from '../../core/guards/super-admin.guard';
import { GlobalLayoutComponent } from './global-layout/global-layout.component';
import { MigrateDBComponent } from './migrate-db/migrate-db.component';
import { DiagnosisComponent } from './diagnosis/diagnosis.component';

import { SecuritySettingsComponent } from './security-settings/security-settings.component';
import { TenantTypesComponent } from './tenant-types/tenant-types.component';
import { TenantStrategiesComponent } from './tenant-strategies/tenant-strategies.component';
import { TenantKanbanCardComponent } from './Kanban/tenant-kanban-card/tenant-kanban-card.component';
import { TenantKanbanBoardComponent } from './views/tenant-kanban-board/tenant-kanban-board.component';
import { TenantProfileTabsComponent } from './views/tenant-profile-tabs/tenant-profile-tabs.component';
import { DbStatusComponent } from './db-status/db-status.component';
import { PendingworkComponent } from './pendingwork/pendingwork.component';
import { InfoJunctionComponent } from './info-junction/info-junction.component';

// src/app/feature/global/global-routing.module.ts
const routes: Routes = [
  {
    path: '',
    component:GlobalLayoutComponent,
   // canActivateChild: [superAdminGuard], // 💡 Protects every tab transition reactively
    children: [
      { path: '', component: HSNTaxRuleComponent },
      { path: 'tenant', component: TenantComponent },
      { path: 'dbStatus', component: DbStatusComponent },
      { path: 'subscription', component: SubscriptionPlanComponent },

      { path: 'RolePermissionJunction', component: PermissionJunctionComponent },
      {path:'TenantTypes',component:TenantTypesComponent},
         {
                 path:'tenantProfile/:id',
                 component:TenantProfileTabsComponent
               },
      {path:'KanbanBoard',component:TenantKanbanBoardComponent},
      
      
      {path:'TenantStrategies',component:TenantStrategiesComponent},
      {path:'diagnosis',component:DiagnosisComponent},
      {path:'pendingworks',component:PendingworkComponent},
      {path:'infojunction',component:InfoJunctionComponent},
      { path: 'migrateDB', component: MigrateDBComponent },
      
      { path: 'SucuritySettings', component: SecuritySettingsComponent },

      {
              path:'tenantProfile/:id',
              component:TenantProfileTabsComponent
            },
    ]
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GlobalRoutingModule { }
