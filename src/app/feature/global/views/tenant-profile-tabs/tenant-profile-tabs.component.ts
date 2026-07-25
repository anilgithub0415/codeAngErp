import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ButtonTabsComponent, TabDirective } from '../../../../shared/components/button-tabs/button-tabs.component';
import { ToastModule } from 'primeng/toast';
import { ClientRequiremnetComponent } from '../../../customer-mgt/Components/profile-tabs/ClientRequirement/client-requiremnet/client-requiremnet.component';
import { InteractionLogComponent } from '../../../customer-mgt/Components/profile-tabs/interaction-log/interaction-log.component';
import { QuotationMgrComponent } from '../../../quotation-mgt/quotation-mgr/quotation-mgr.component';

@Component({
  selector: 'app-tenant-profile-tabs',
    imports: [ButtonTabsComponent,TabDirective, 
          ToastModule,
          ClientRequiremnetComponent,InteractionLogComponent,QuotationMgrComponent],
  templateUrl: './tenant-profile-tabs.component.html',
  styleUrl: './tenant-profile-tabs.component.scss'
})
export class TenantProfileTabsComponent implements OnInit{
  private route = inject(ActivatedRoute);
  
  clientId!:number;
  myTabConfig:any;


  ngOnInit(){
    this.clientId = parseInt(this.route.snapshot.paramMap.get('id')!);
    
     this.myTabConfig = [
      { label: 'TenantStrategy', id: 'TenantStrategy' }, 
    { label: 'Type', id: 'Type' },    
    
  ];
  }
}

