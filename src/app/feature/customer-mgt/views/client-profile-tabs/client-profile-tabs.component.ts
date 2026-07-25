import { Component, inject, OnInit } from '@angular/core';
import { ButtonTabsComponent, TabDirective } from '../../../../shared/components/button-tabs/button-tabs.component';
import { ToastModule } from 'primeng/toast';
import { ClientRequiremnetComponent } from '../../Components/profile-tabs/ClientRequirement/client-requiremnet/client-requiremnet.component';
import { InteractionLogComponent } from '../../Components/profile-tabs/interaction-log/interaction-log.component';
import { QuotationMgrComponent } from '../../../quotation-mgt/quotation-mgr/quotation-mgr.component';
import { ActivatedRoute } from '@angular/router';
import { CustomerService } from '../../../../core/services/customer.service';
import { tap } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { KanbanCardComponent } from '../../kanban/kanban-card/kanban-card.component';
import { Customer } from '../../../../core/models/customer.model';

@Component({
  selector: 'app-client-profile-tabs',
  imports: [CommonModule,ButtonTabsComponent,TabDirective, 
        ToastModule,
        ClientRequiremnetComponent,InteractionLogComponent,QuotationMgrComponent],
  templateUrl: './client-profile-tabs.component.html',
  styleUrl: './client-profile-tabs.component.scss'
})
export class ClientProfileTabsComponent implements OnInit{
  private route = inject(ActivatedRoute); 
  private authServ=inject(AuthService);
  private customerService=inject(CustomerService);
  clientId!:number;
  myTabConfig:any;

  tenantId!:number;
  customer:any;

  ngOnInit(){
    this.tenantId=this.authServ.getTenantId()!;
    this.clientId = parseInt(this.route.snapshot.paramMap.get('id')!);
    
            this.myTabConfig = [
              { label: 'ClientRequirement', id: 'ClientRequirement' }, 
              { label: 'InteractionLog', id: 'InteractionLog' },    
              { label: 'Quotation', id: 'Quotation' },   
            ];
            
   this.getCustomer(this.clientId).subscribe();
    }

    getCustomer(clientId: number) {
  return this.customerService.getCustomer(this.tenantId, clientId).pipe(
    tap((aCust: Customer) => {
      // 💡 FIX: Assigns directly as an object mapping reference node
      this.customer = aCust; 
      console.log('Single customer payload resolved:', this.customer);
    })
  );
}

}
