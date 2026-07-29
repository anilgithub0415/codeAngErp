import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ButtonTabsComponent, TabDirective } from '../../../../shared/components/button-tabs/button-tabs.component';
import { ToastModule } from 'primeng/toast';
import { ClientRequiremnetComponent } from '../../../customer-mgt/Components/profile-tabs/ClientRequirement/client-requiremnet/client-requiremnet.component';
import { InteractionLogComponent } from '../../../customer-mgt/Components/profile-tabs/interaction-log/interaction-log.component';
import { QuotationMgrComponent } from '../../../quotation-mgt/quotation-mgr/quotation-mgr.component';
import { TenantStrategiesComponent } from '../../tenant-strategies/tenant-strategies.component';
import { PermissionJunctionComponent } from '../../permission-junction/permission-junction.component';
import { FormJSONsComponent } from '../../form-jsons/form-jsons.component';
import { TenantService } from '../../../../core/services/tenant.service';
import { tap } from 'rxjs';
import { TenantKanbanCardComponent } from '../../Kanban/tenant-kanban-card/tenant-kanban-card.component';

@Component({
  selector: 'app-tenant-profile-tabs',
    imports: [ButtonTabsComponent,TabDirective, 
          ToastModule,
          ClientRequiremnetComponent,InteractionLogComponent,QuotationMgrComponent,
          TenantStrategiesComponent, PermissionJunctionComponent, FormJSONsComponent,
          TenantKanbanCardComponent
        ],
  templateUrl: './tenant-profile-tabs.component.html',
  styleUrl: './tenant-profile-tabs.component.scss'
})
export class TenantProfileTabsComponent implements OnInit{
  private route = inject(ActivatedRoute);
  tenantId!:number;
 private tenantService=inject(TenantService);
tenant!:any;

  clientId!:number;
  myTabConfig:any;


  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(){
    this.tenantId = parseInt(this.route.snapshot.paramMap.get('id')!);
    this.clientId = parseInt(this.route.snapshot.paramMap.get('id')!);
    
     
     this.myTabConfig = [
      { label: 'TenantStrategy', id: 'TenantStrategy' }, 
    { label: 'Junction', id: 'Junction' },    
    { label: 'FormJSONs', id: 'FormJSONs' },   
    
    { label: 'TenantCard', id: 'TenantCard' },   
     
    
  ];
  
    this.getTenant().subscribe();
  }
  
    getTenant() {
    return this.tenantService.getTenant(this.tenantId).pipe(
        tap((aTenant: any) => {
          
          this.tenant = JSON.parse(JSON.stringify(aTenant)); 
  console.log('.................................Tenat.....',aTenant);
  
          
                  // this.headerData.clientName=this.tenant.commercialContactPerson;
                  //         this.headerData.companyName=this.tenant.tenantName;
                  //        this.headerData.lastLoginTimestamp= this.formatLoginDate(localStorage.getItem('lastLoginAt'))
  this.cdr.detectChanges(); 
  
          
          
        })
      );
      
    }

}

