import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RippleModule } from 'primeng/ripple';
import { StyleClassModule } from 'primeng/styleclass';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { TopbarWidget } from '../../../pages/landing/components/topbarwidget.component'; 
import { HeroWidget } from '../../../pages/landing/components/herowidget'; 
import { FeaturesWidget } from '../../../pages/landing/components/featureswidget';
import { HighlightsWidget } from '../../../pages/landing/components/highlightswidget';
import { PricingWidget } from '../../../pages/landing/components/pricingwidget';
import { FooterWidget } from '../../../pages/landing/components/footerwidget';

import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router'; // Import Router for navigation
// NgxPermissionsModule
//import { NgxPermissionsModule } from 'ngx-permissions'; 
@Component({
  selector: 'app-landing-page',
  imports: [CommonModule,TopbarWidget,
    //HeroWidget,FeaturesWidget,HighlightsWidget,PricingWidget,FooterWidget,
  
    // NgxPermissionsModule - configure forRoot
//NgxPermissionsModule 
],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss'
})
export class LandingPageComponent implements OnInit{
  userIsLoggedIn:boolean=false;usersID:number|null=0;

  constructor(private AuthServ:AuthService
    ,  private router: Router){

  }
  ngOnInit(): void {
    this.userIsLoggedIn = this.AuthServ.isLoggedIn();
    this.usersID=this.AuthServ.getUserId();
  }
  isLoggedIn(){
    var tf=this.AuthServ.isLoggedIn(); alert('isLoggedin tf:'+tf);
    
      //if loggedin navigate to app
        if(tf){
                this.router.navigate(['/app']); 
          }

    return tf;

  }
  // loginStatusChanged(e:any){
  //   this.userIsLoggedIn = this.AuthServ.isLoggedIn();
  // }
}
