import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { PricingComponent } from './pricing/pricing.component';
import { FeaturesComponent } from './features/features.component';
import { PublicLayoutComponent } from './public-layout/public-layout.component';



const routes: Routes = 
[
    {
      path: '', 
      component: PublicLayoutComponent,
          children: 
          [
            {path:'',component:LandingPageComponent},
            {path:'pricing',component:PricingComponent},
            {path:'features',component:FeaturesComponent}  
          ]
        }  
]            

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicRoutingModule { }
