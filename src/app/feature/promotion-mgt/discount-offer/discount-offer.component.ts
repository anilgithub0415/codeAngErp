import { Component, OnInit } from '@angular/core';
import { ButtonTabsComponent, TabDirective } from '../../../shared/components/button-tabs/button-tabs.component';
import { LineDiscountComponent } from '../line-discount/line-discount.component';

@Component({
  selector: 'app-discount-offer',
  imports: [ButtonTabsComponent,TabDirective,
   LineDiscountComponent
  ],
  templateUrl: './discount-offer.component.html',
  styleUrl: './discount-offer.component.scss'
})
export class DiscountOfferComponent implements OnInit{
myTabConfig:any;
  ngOnInit(){
     this.myTabConfig = [
      { label: 'LineDiscount', id: 'LineDiscount' }, 
    { label: 'QuantityVolumeDiscount', id: 'QuantityVolumeDiscount' },    
    // { label: 'SeasonalDiscount', id: 'SeasonalDiscount' },   
    // { label: 'OrderValueDiscount', id: 'OrderValueDiscount' },   
    // { label: 'ProductBundling', id: 'ProductBundling' },   
    // { label: 'Payment Discount', id: 'PaymentDiscount' }, 
    
  ];
  }

}
