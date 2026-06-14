import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductMasterComponent } from './product-master/product-master.component';
import { ProductvariantComponent } from './productvariant/productvariant.component';
import { ProductWithVariantComponent } from './product-with-variant/product-with-variant.component';

const routes: Routes = [
  {path:'',component:ProductMasterComponent},];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductmgtRoutingModule { }
