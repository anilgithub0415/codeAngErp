import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductMasterComponent } from './product-master/product-master.component';

import { ProductVariantComponent } from './product-variant/product-variant.component';

const routes: Routes = [
  {path:'',component:ProductMasterComponent},];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductmgtRoutingModule { }
