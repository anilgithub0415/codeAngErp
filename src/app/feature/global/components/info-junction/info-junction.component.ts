import { Component, OnInit } from '@angular/core';
import { ButtonTabsComponent,TabDirective } from '../../../../shared/components/button-tabs/button-tabs.component';
import { ActivatedRoute } from '@angular/router';
import { InfoRFQComponent } from './info-rfq/info-rfq.component';
import { InfoUIComponent } from './info-ui/info-ui.component';
import { InfoPricesComponent } from './info-prices/info-prices.component';
import { InfoMultitenantComponent } from './info-multitenant/info-multitenant.component';


@Component({
  selector: 'app-info-junction',
  imports: [ButtonTabsComponent,TabDirective, InfoRFQComponent, InfoUIComponent, InfoPricesComponent, InfoMultitenantComponent],
  templateUrl: './info-junction.component.html',
  styleUrl: './info-junction.component.scss'
})
export class InfoJunctionComponent implements OnInit{
myTabConfig:any;
activeTab: string = 'RFQ'; // 2. Create a property for the active tab (default to first tab)

  // 3. Inject ActivatedRoute in the constructor
  constructor(private route: ActivatedRoute) {}

  ngOnInit(){
     this.myTabConfig = [
    { label: 'RFQ', id: 'RFQ' },  
        { label: 'UI', id: 'UI' },  
      { label: 'DeleteRules', id: 'DeleteRules'},
      { label: 'Prices', id: 'Prices'},
      { label: 'multitenant', id: 'multitenant'}
    
    
  ];

   this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.activeTab = params['tab'];
      }
    });
  }

}
