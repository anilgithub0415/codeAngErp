import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { ButtonTabsComponent, TabDirective } from '../../../../shared/components/button-tabs/button-tabs.component';
import { ActivatedRoute } from '@angular/router';
import { TenantComponent } from '../tenant/tenant.component';
import { DbStatusComponent } from '../db-status/db-status.component';
import { HSNTaxRuleComponent } from '../hsntax-rule/hsntax-rule.component';
import { DiagnosisComponent } from '../diagnosis/diagnosis.component';
import { MigrateDBComponent } from '../migrate-db/migrate-db.component';
import { PendingworkComponent } from '../pendingwork/pendingwork.component';
import { SubscriptionPlanComponent } from '../subscription-plan/subscription-plan.component';
import { TenantTypesComponent } from '../tenant-types/tenant-types.component';
import { InfoJunctionComponent } from '../info-junction/info-junction.component';
import { SecuritySettingsComponent } from '../security-settings/security-settings.component';

@Component({
  selector: 'app-global-dashboard',schemas:[CUSTOM_ELEMENTS_SCHEMA],
  imports: [ButtonTabsComponent,TabDirective,
    TenantComponent,DbStatusComponent,HSNTaxRuleComponent,DiagnosisComponent,MigrateDBComponent,
    PendingworkComponent,SubscriptionPlanComponent,TenantTypesComponent,
    InfoJunctionComponent,SecuritySettingsComponent
  ],
  templateUrl: './global-dashboard.component.html',
  styleUrl: './global-dashboard.component.scss'
})
export class GlobalDashboardComponent implements OnInit{
myTabConfig:any;
activeTab: string = 'InternalPOs'; // 2. Create a property for the active tab (default to first tab)

  // 3. Inject ActivatedRoute in the constructor
  constructor(private route: ActivatedRoute) {}

  ngOnInit(){
     this.myTabConfig = [
    { label: 'Tenant', id: 'Tenant' },  
      { label: 'dbStatus', id: 'dbStatus' }, 
      { label: 'HSNs', id: 'HSNs' }, 
      { label: 'Diagnosis', id: 'Diagnosis' }, 
      { label: 'MigrateDB', id: 'MigrateDB' }, 
      { label: 'PendingWorks', id: 'PendingWorks' }, 
      { label: 'SubScriptionPlan', id: 'SubScriptionPlan' }, 
      { label: 'TenantTypes', id: 'TenantTypes' }, 


      { label: 'InfoJunction', id: 'InfoJunction' }, 
      { label: 'SecuritySettings', id: 'SecuritySettings' }, 
      
      

     ]

     }

}
