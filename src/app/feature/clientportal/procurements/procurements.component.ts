import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';


import { QuotationMgrComponent } from '../../quotation-mgt/quotation-mgr/quotation-mgr.component';
import { ClientPurchaseMgrComponent } from '../CRUD/client-purchase-mgr/client-purchase-mgr.component';

import { ButtonTabsComponent,TabDirective } from '../../../shared/components/button-tabs/button-tabs.component';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { RFQComponent } from '../components/rfq/rfq.component';

import { SiteComponent } from '../site/site.component';
import { ActivatedRoute } from '@angular/router';
import { ClientPOMgrComponent } from '../components/client-PO/client-po-mgr/client-po-mgr.component';
import { ClientRFQMgrComponent } from '../components/client-rfq-mgr/client-rfq-mgr.component';
@Component({
  selector: 'app-procurements',schemas:[CUSTOM_ELEMENTS_SCHEMA],
  imports: [ButtonTabsComponent,TabDirective, 
      ToastModule, TableModule,
      QuotationMgrComponent,      ClientPOMgrComponent, ClientRFQMgrComponent, SiteComponent],
  templateUrl: './procurements.component.html',
  styleUrl: './procurements.component.scss'
})
export class ProcurementsComponent implements OnInit{
myTabConfig:any;
activeTab: string = 'InternalPOs'; // 2. Create a property for the active tab (default to first tab)

  // 3. Inject ActivatedRoute in the constructor
  constructor(private route: ActivatedRoute) {}

  ngOnInit(){
     this.myTabConfig = [
    { label: 'ActiveOrders', id: 'ActiveOrders' },  
      { label: 'Internal POs', id: 'InternalPOs' }, 
    { label: 'ClientRFQ', id: 'ClientRFQ' },  
    { label: 'ReceivedQuotations', id: 'ReceivedQuotations' },   
    { label: 'Sites', id: 'Sites' },  
    
    // { label: 'DeliveryLocations', id: 'DeliveryLocations' },   
    // { label: 'My Offers And Contract', id: 'ContractNOffers' },   
    //            { label: 'Standing Orders ', id: 'StandingOrders ' }, 
    //            { label: 'Material safety data sheet', id: 'MSDS' }, 
    
  ];

   this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.activeTab = params['tab'];
      }
    });
  }

}

