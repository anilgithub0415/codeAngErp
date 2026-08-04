import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ButtonTabsComponent, TabDirective } from '../../../../shared/components/button-tabs/button-tabs.component';
import { ActivatedRoute } from '@angular/router';
import { QuotationMgrComponent } from '../../quotation-mgr/quotation-mgr.component';
import { ClientRFQMgrComponent } from '../../../clientportal/components/client-rfq-mgr/client-rfq-mgr.component';
import { RfqConversionService } from '../../../../core/services/rfq-conversion.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-quotation-dashboard',
  imports: [ButtonTabsComponent,TabDirective, QuotationMgrComponent, ClientRFQMgrComponent],
  templateUrl: './quotation-dashboard.component.html',
  styleUrl: './quotation-dashboard.component.scss'
})
export class QuotationDashboardComponent implements OnInit{
myTabConfig:any;
activeTab: string = 'Quotations'; // 2. Create a property for the active tab (default to first tab)
private conversionSub!:Subscription;

private conversionService=inject(RfqConversionService)
private cd=inject(ChangeDetectorRef)

  // 3. Inject ActivatedRoute in the constructor
  constructor(private route: ActivatedRoute) {}

  ngOnInit(){
     this.myTabConfig = [
    { label: 'Quotations', id: 'Quotations' },  
      { label: 'Received Client RFQ', id: 'received_clientRFQs'},
      { label: 'Approval Pending Client RFQ', id: 'clientRFQs_ApprovalPending'}
    
    
  ];

   this.conversionSub = this.conversionService.convertRfq$.subscribe(() => {
console.log('Dashboard caught event! Switching tab now to Quotations.');

    this.activeTab = 'Quotations'; 
     this.cd.markForCheck(); 
     this.cd.detectChanges   
    });

   this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.activeTab = params['tab'];
      }
    });
  }

    onTabChangedInUi(newTabId: string): void {
    this.activeTab = newTabId;
    this.cd.detectChanges();
  }


  ngOnDestroy(): void {
    if (this.conversionSub) this.conversionSub.unsubscribe();
  }
}
