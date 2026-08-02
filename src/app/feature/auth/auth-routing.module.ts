import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
//import { ProfileComponent } from './profile/profile.component';
import { AccountComponent } from './account/account.component';
import { SignupandregisterComponent } from './signupandregister/signupandregister.component';
import { AuthLayoutComponent } from './auth-layout/auth-layout.component';



const routes: Routes = 
[
    {
      path: '', 
      component: AuthLayoutComponent,
          children: 
          [
            {path:'',component:LoginComponent},
            {path:'login',component:LoginComponent},
            {path:'signupandregister',component:SignupandregisterComponent},
            //{path:'profile',component:ProfileComponent},
            {path:'account',component:AccountComponent}
          ]
    }        
 
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
