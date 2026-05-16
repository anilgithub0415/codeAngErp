import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TenantlistComponent } from './tenantlist/tenantlist.component';

const routes: Routes = [
  {path:'',component:TenantlistComponent},];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TenantmgtRoutingModule { }
