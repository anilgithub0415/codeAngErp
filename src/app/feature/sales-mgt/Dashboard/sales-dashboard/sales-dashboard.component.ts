import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ButtonTabsComponent, TabDirective } from '../../../../shared/components/button-tabs/button-tabs.component';
import { SalesOrderMgrComponent } from '../../Components/sales-order-mgr/sales-order-mgr.component';
import { ClientPOMgrComponent } from '../../../clientportal/components/client-PO/client-po-mgr/client-po-mgr.component';



@Component({
  selector: 'app-sales-dashboard',
  imports: [ButtonTabsComponent,TabDirective,SalesOrderMgrComponent,ClientPOMgrComponent],
  templateUrl: './sales-dashboard.component.html',
  styleUrl: './sales-dashboard.component.scss'
})
export class SalesDashboardComponent implements OnInit{
myTabConfig:any;
activeTab: string = 'Sales'; // 2. Create a property for the active tab (default to first tab)

  // 3. Inject ActivatedRoute in the constructor
  constructor(private route: ActivatedRoute) {}

  ngOnInit(){
     this.myTabConfig = [
    { label: 'Sales', id: 'Sales' },  
      { label: 'Received Client POs', id: 'received_clientRFQs'},
      { label: 'Approval Pending Client POs', id: 'clientPOs'}
    
    
  ];

   this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.activeTab = params['tab'];
      }
    });
  }

}

