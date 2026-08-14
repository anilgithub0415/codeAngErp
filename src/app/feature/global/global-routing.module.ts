// src/app/feature/global/global-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HSNTaxRuleComponent } from './components/hsntax-rule/hsntax-rule.component';
import { SubscriptionPlanComponent } from './components/subscription-plan/subscription-plan.component';
import { TenantComponent } from './components/tenant/tenant.component';
import { PermissionJunctionComponent } from './permission-junction/permission-junction.component';
import { superAdminGuard } from '../../core/guards/super-admin.guard';
import { GlobalLayoutComponent } from './global-layout/global-layout.component';
import { MigrateDBComponent } from './components/migrate-db/migrate-db.component';
import { DiagnosisComponent } from './components/diagnosis/diagnosis.component';

import { SecuritySettingsComponent } from './components/security-settings/security-settings.component';
import { TenantTypesComponent } from './components/tenant-types/tenant-types.component';
import { TenantStrategiesComponent } from './components/tenant-strategies/tenant-strategies.component';
import { TenantKanbanCardComponent } from './Kanban/tenant-kanban-card/tenant-kanban-card.component';
import { TenantKanbanBoardComponent } from './views/tenant-kanban-board/tenant-kanban-board.component';
import { TenantProfileTabsComponent } from './views/tenant-profile-tabs/tenant-profile-tabs.component';
import { DbStatusComponent } from './components/db-status/db-status.component';
import { PendingworkComponent } from './components/pendingwork/pendingwork.component';
import { InfoJunctionComponent } from './components/info-junction/info-junction.component';
import { GlobalDashboardComponent } from './components/global-dashboard/global-dashboard.component';

// src/app/feature/global/global-routing.module.ts
const routes: Routes = [
  {
    path: '',
    component:GlobalLayoutComponent,
   // canActivateChild: [superAdminGuard], // 💡 Protects every tab transition reactively
    children: [

      { path: '', component: HSNTaxRuleComponent },
      { path: 'Dashboard', component: GlobalDashboardComponent },





      { path: 'RolePermissionJunction', component: PermissionJunctionComponent },

         {
                 path:'tenantProfile/:id',
                 component:TenantProfileTabsComponent
               },
      {path:'KanbanBoard',component:TenantKanbanBoardComponent},
      
      
      {path:'TenantStrategies',component:TenantStrategiesComponent},




      


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
