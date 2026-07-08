import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HSNTaxRuleComponent } from './hsntax-rule/hsntax-rule.component';

const routes: Routes = [{path:'',component:HSNTaxRuleComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GlobalRoutingModule { }
