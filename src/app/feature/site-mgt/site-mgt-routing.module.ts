import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SiteComponent } from './site.component';
import { ClientPurchaseComponent } from './client-purchase/client-purchase.component';
import { ProductUomConversionComponent } from '../../shared/components/product-uom-conversion/product-uom-conversion.component';
import { SitepurchaseComponent } from './sitepurchase/sitepurchase.component';
import { SiteuserComponent } from './siteuser/siteuser.component';

const routes: Routes = [
  {path:'',component:SiteComponent},
  {path:'siteusers',component:SiteuserComponent},
  {path:'sitepurchase',component:SitepurchaseComponent},
  {path:'UOMConversion',component:ProductUomConversionComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SiteMgtRoutingModule { }
