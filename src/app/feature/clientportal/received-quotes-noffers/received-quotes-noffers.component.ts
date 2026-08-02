import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';

import { InternalPOsComponent } from '../components/internal-pos/internal-pos.component';
import { QuotationMgrComponent } from '../../quotation-mgt/quotation-mgr/quotation-mgr.component';
import { ClientPurchaseMgrComponent } from '../CRUD/client-purchase-mgr/client-purchase-mgr.component';

import { ButtonTabsComponent,TabDirective } from '../../../shared/components/button-tabs/button-tabs.component';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { RFQComponent } from '../components/rfq/rfq.component';
import { ClientRFQComponent } from '../components/client-rfq/client-rfq.component';
@Component({
  selector: 'app-received-quotes-noffers',schemas:[CUSTOM_ELEMENTS_SCHEMA],
  imports: [ButtonTabsComponent,TabDirective, 
      ToastModule, TableModule,
      QuotationMgrComponent,      InternalPOsComponent, ClientRFQComponent],
  templateUrl: './received-quotes-noffers.component.html',
  styleUrl: './received-quotes-noffers.component.scss'
})
export class ReceivedQuotesNOffersComponent implements OnInit{
myTabConfig:any;
  ngOnInit(){
     this.myTabConfig = [
      { label: 'Internal POs', id: 'InternalPOs' }, 
    { label: 'ClientRFQ', id: 'ClientRFQ' },  
    { label: 'ReceivedQuotations', id: 'ReceivedQuotations' },   
    // { label: 'DeliveryLocations', id: 'DeliveryLocations' },   
    // { label: 'My Offers And Contract', id: 'ContractNOffers' },   
    //            { label: 'Standing Orders ', id: 'StandingOrders ' }, 
    //            { label: 'Material safety data sheet', id: 'MSDS' }, 
    
  ];
  }

}
