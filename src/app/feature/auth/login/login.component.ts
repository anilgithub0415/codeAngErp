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
import { NgxPermissionsService } from 'ngx-permissions';
import { ContextUiService } from '../../../core/services/context-ui.service';
import { LayoutService } from '../../../layout/service/layout.service';

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
  private permissionsService = inject(NgxPermissionsService);

  constructor(
    private formBuilder: FormBuilder
     ,    private authService: AuthService
     ,  private router: Router // Inject Router
     ,  private contextUiService: ContextUiService
     , private layoutService:LayoutService
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
        
        // 1. [PRESERVED] Handle Permissions & Storage
        const userPermissions = response.permissions || [];
        localStorage.setItem('user_permissions', JSON.stringify(userPermissions));
        if (response.tenantId) {
          localStorage.setItem('tenant_id', response.tenantId);
        }
        console.log('loading permissions:', userPermissions);
        console.log('.....................availableContexts:', response.availableContexts);
        
        this.permissionsService.loadPermissions(userPermissions);

        // 2. [NEW] Evaluate Contexts Routing Logic
        const contexts = response.availableContexts;

        if (contexts && contexts.length > 1) {
          console.log('Multiple contexts found. Triggering selection mechanism.', contexts.length);
          
          // Trigger the UI Service to open the PrimeNG dialog in AppComponent
          this.contextUiService.openSelectionDialog(contexts);
          
          // Note: We do NOT navigate yet. Navigation happens in AppComponent 
          // after the user clicks "Select" inside the dialog.
          
        } else if (contexts && contexts.length === 1) {
  console.log('Single context detected. Building clean transactional context request...');
  
  // 🚨 FIX: Extract the first item object from the array explicitly using [0]
  const targetContext = contexts[0]; 
  
  const contextPayload: any = {
    userId: Number(response.userId), 
    refreshToken: response.refresh_token, // Fresh token straight from login response
    tenantId: Number(targetContext.tenantId),
    roleName: targetContext.roleName
  };

  this.authService.setActiveContext(contextPayload).subscribe({
    next: () => {
      console.log('Auto-selection successful.');
      
      const userId = this.authService.getUserId();
      if (targetContext.tenantId && userId) {
         this.layoutService.loadUserPreferences(Number(targetContext.tenantId), userId);
      }
      this.authService.updateCurrentUserRoleAndPermissions();
      this.authService.setLoginStatus(true);
      
      this.router.navigate(['/app']); 
    },
    error: (err) => {
      console.error('Auto-selection backend processing error:', err);
      this.errorMessage = 'Failed to load user workspace context.';
      this.authService.logout(response.refresh_token!);
    }
  });
}



         else {
          console.warn('No contexts found after login.');
          this.errorMessage = 'No active workspaces found for this user account.';
          this.authService.logout(this.authService.getRefreshToken());
        }
      },
      error: (error) => {
        console.error('Login failed:', error);
        this.errorMessage = 'Invalid userId or password.'; 
      },
    }); 
    
  } else {
    this.errorMessage = 'Please fill out all required fields.';
  }
}

  
  // Inside your LoginComponent TS file



  }
