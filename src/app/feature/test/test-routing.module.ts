import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TestFormlyFormComponent } from './test-formly-form/test-formly-form.component';

const routes: Routes = [
  {path:'',component:TestFormlyFormComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TestRoutingModule { }
