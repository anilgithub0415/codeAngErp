import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DiscountOfferComponent } from './discount-offer/discount-offer.component';
import { PromotionLayoutComponent } from './promotion-layout/promotion-layout.component';
import { LineDiscountComponent } from './line-discount/line-discount.component';
import { DiscountTypeComponent } from './discount-type/discount-type.component';



const routes: Routes = 
[
    {
      path: '', 
      component: PromotionLayoutComponent,
          children: 
          [
              {path:'',component:DiscountOfferComponent},
               {path:'',component:LineDiscountComponent},
                 {path:'DiscountType',component:DiscountTypeComponent}
          ]
        }
      ]                  

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PromotionMgtRoutingModule { }
