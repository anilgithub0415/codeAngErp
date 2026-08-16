
import { Component, OnInit } from '@angular/core';

import { ActivatedRoute } from '@angular/router';

import { ButtonTabsComponent, TabDirective } from '../../../../../shared/components/button-tabs/button-tabs.component';

@Component({
  selector: 'app-info-multitenant',
  imports: [ButtonTabsComponent,TabDirective],
  templateUrl: './info-multitenant.component.html',
  styleUrl: './info-multitenant.component.scss'
})
export class InfoMultitenantComponent implements OnInit{
myTabConfig:any;
activeTab: string = 'RFQ'; // 2. Create a property for the active tab (default to first tab)

  // 3. Inject ActivatedRoute in the constructor
  constructor(private route: ActivatedRoute) {}

  ngOnInit(){
     this.myTabConfig = [
    { label: 'Quotation', id: 'Quotation' },  
    
    { label: 'Workflows', id: 'Workflows' },  
    
        { label: 'Other', id: 'Other' },  
    
    
  ];

   this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.activeTab = params['tab'];
      }
    });
  }

}
