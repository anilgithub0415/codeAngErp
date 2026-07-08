import { Component, inject } from '@angular/core';
import { AppFloatingConfigurator } from '../../../layout/component/app.floatingconfigurator';

import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { FormGroup,FormBuilder,Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router'; // Import Router for navigation
import { ConfigService } from '../../../config.service';
@Component({
  selector: 'app-login',
  imports: [AppFloatingConfigurator,CommonModule,FormsModule,ReactiveFormsModule,ButtonModule,CheckboxModule,InputTextModule,PasswordModule,],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm!: FormGroup;
  errorMessage: string = '';

   private configService=inject(ConfigService)
    config_usersCreatedby:string='signup';

  constructor(
    private formBuilder: FormBuilder
     ,    private authService: AuthService
     ,  private router: Router // Inject Router
  )  {this.loginForm = this.formBuilder.group({
      UserName: ['', [Validators.required]],
      password: ['', [Validators.required]],
      rememberMe: [false], // Optional remember me checkbox
    });}
    ngOnInit(): void {
   
      this.configService.loadAppConfig().then((configResponse:any)=>{
        this.config_usersCreatedby=configResponse.config_useraddthru;
        console.log('its changed to:',configResponse.config_useraddthru);
     });

    }
    
    getConfig(){
       const globalConfigData=this.configService.config;
          if(globalConfigData){
            console.log('globalConfigData:',globalConfigData);
            
              this.config_usersCreatedby=globalConfigData.config_useraddthru;
          }
    }
  onSubmit(): void {
    if (this.loginForm?.valid) {
       const { UserName, password, rememberMe } = this.loginForm.value;

       this.authService.login(UserName, password).subscribe({
         next: (response) => { 
         


           this.errorMessage = '';
           // Navigate to the desired page after successful login
           this.router.navigate(['/app']); // Example: Navigate to the employees list
           //window.location.href="http://localhost:4200/app";
         },
         error: (error) => {
           console.error('Login failed:', error);
           this.errorMessage = 'Invalid userId or password.'; // Display an error message
           // Optionally handle different error codes from the server
         },
       }); 
      
    } else {
      this.errorMessage = 'Please fill out all required fields.';
    }
  }
  
  }
