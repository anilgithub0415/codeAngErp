import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomerComponent } from './customer/customer.component';
import { TestComponent } from './test/test.component';
import { TestFormlySectionComponent } from './test-formly-section/test-formly-section.component';

const routes: Routes = [
  {path:'',component:CustomerComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerMgtRoutingModule { }
