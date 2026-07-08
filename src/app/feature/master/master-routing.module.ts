import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VendorComponent } from './vendor/vendor.component';
import { CityComponent } from './city/city/city.component';
import { DistrictComponent } from './district/district/district.component';

const routes: Routes = [
  {path:'',component:VendorComponent},
  {path:'city',component:CityComponent},
  {path:'district',component:DistrictComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MasterRoutingModule { }
