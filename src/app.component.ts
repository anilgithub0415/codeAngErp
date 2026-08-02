
import { Component, OnInit, AfterViewInit, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
//import { NgxPermissionsModule } from 'ngx-permissions';
import { ContextSelectionDialogComponent } from './app/shared/components/context-selection-dialog/context-selection-dialog/context-selection-dialog.component'; // Import the new component
import  { CommonModule } from '@angular/common'; // Needed for *ngIf
import { AuthService } from './app/core/services/auth.service';
import { Observable, distinctUntilChanged, filter, take, tap } from 'rxjs';
import { EmitEvent, EventBusService, Events } from './app/core/services/event-bus.service';
import { UserContextService } from './app/core/services/user-context.service';
import { ToastModule } from 'primeng/toast';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MessageService } from 'primeng/api';
import { LookupService } from './app/core/services/lookup.service';
import { FORMLY_CONFIG, provideFormlyCore } from '@ngx-formly/core';

import { withFormlyPrimeNG } from '@ngx-formly/primeng'; 
import { SpinnerComponent } from './app/shared/components/spinner/spinner.component';
import { ContextUiService } from './app/core/services/context-ui.service';
import { LayoutService } from './app/layout/service/layout.service';
// Interface for AvailableContext (copy from AuthService or define globally if shared)
interface AvailableContext {
    tenantId: number;displayName:string;
    tenantName: string;tenantType: string;
    roleName: string;
    permissions: string[];
}
export function registerLookupExtension(lookupService:LookupService, authServ:AuthService){

  return {
    extensions:[
      {
        name:'lookup-injector',
        extension:{
          prePopulate:async(field:any)=>{
             const tenantId= authServ.getTenantId();          
            const lookupKey = field.props?.['lookupKey'];
            if(!lookupKey) return; 
            //hardcoded tenantid here
            await lookupService.getLookupDataByKey(lookupKey,tenantId!).subscribe({
              next:(x:any[])=>{
                  
                  field.props.options=x;

                  }                   
            });
            
            
          }
        }
      }
    ]
  }
}

@Component({
    selector: 'app-root',
    standalone: true,
    schemas:[CUSTOM_ELEMENTS_SCHEMA],
    imports: [SpinnerComponent,RouterModule,FormsModule,
        CommonModule,
      ToastModule,
       // BrowserAnimationsModule,
    ContextSelectionDialogComponent
    // NgxPermissionsModule - configure forRoot
//NgxPermissionsModule, // <-- Add this here
],
providers:[
  provideFormlyCore(
      withFormlyPrimeNG() 
    ),
  LookupService,AuthService,
  {
    provide: FORMLY_CONFIG,
    multi:true,
    useFactory:registerLookupExtension,
    deps:[LookupService, AuthService]
  }
],
    template: `<span *ngIf='loadingContext'>Wait...</span>
    <app-spinner></app-spinner>
    <router-outlet *ngIf='!loadingContext'></router-outlet>
    <app-context-selection-dialog 
    [(visible)]="showContextSelectionDialog" 
    [contexts]="availableContextsForSelection"
    (contextSelected)="handleContextSelection($event)"
    (logoutInitiated)="handleLogout()">
</app-context-selection-dialog>
 <!-- This component listens for messages from the MessageService -->
<p-toast></p-toast>`
})
export class AppComponent implements OnInit {
    showContextSelectionDialog: boolean = false;
    loadingContext:boolean=false;
    availableContextsForSelection: AvailableContext[] | null = null;
    
    public authService=inject(AuthService)

    constructor( private router: Router, 
      //all these were used for context-selection that is any one role out of all
      // private eventbusService:EventBusService
      //   ,  private usercontextService:UserContextService,
      //   private contextUiService: ContextUiService,private layoutService:LayoutService
        ) {
         
           

         this.authService.isLoggedIn$.pipe(
            distinctUntilChanged(),            
          ).subscribe(isloggedin=>{
                                
                                
                                                             
                                
          })

        // this.usercontextService.currentUserProfile$.pipe(
        //     distinctUntilChanged(),            
        //   ).subscribe(profile=>{
        //     alert('got profile:')
        //                         console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaa wait...............................................profile:.......',profile);                    
        //   })


        }
    private sub: any; private subHandleContSelect:any;

//ngAfterViewInit():void{ }

    // ngOnInit(): void {
    //     //alert('app comp afterviewinit..........')
    //     // Subscribe to authentication status changes
    //  this.sub=   this.authService.isLoggedIn$.pipe(
        
    //     distinctUntilChanged(),
    //     filter(isAuthenticated => isAuthenticated === true),
    //     take(1)
    //       ).subscribe(isAuthenticated => {
    //         if (isAuthenticated) {  

              
    //             //this.usercontextService.currentUserProfile$.subscribe(profile=>{console.log('i got profile here:');
    //            // console.log(profile);})  

    //             this.loadingContext=true;
    //            //  alert('app component calling getAvailableContexts')
    //             const contexts = this.authService.getAvailableContexts();
    //             if (contexts && contexts.length > 1) {
    //                 this.availableContextsForSelection = contexts;
    //                 this.showContextSelectionDialog = true; // Show dialog if multiple contexts
    //             } else if (contexts && contexts.length === 1) {
    //                 // Automatically set context if only one is available
                 
    //                 this.authService.setActiveContext(contexts[0]).subscribe({
    //                     next: () =>{ console.log('Auto-selected single context.'),    this.loadingContext=false;},
    //                     error: (err) => console.error('Auto-selection failed:', err)
    //                 });
    //             } else {
    //                 // No contexts or error, might need to logout or show error
    //                 console.warn('No contexts found after login or contexts array is empty.');
    //                 var rt=this.authService.getRefreshToken();
    //                 this.authService.logout(rt);
    //             }
    //         } else {
    //             this.showContextSelectionDialog = false; // Hide dialog on logout
    //             this.availableContextsForSelection = null;
    //         }
    //     });

    //     // Initial check on load
    //     if (this.authService.hasAuthToken()) {
    //         // Trigger the subscription logic
    //       //  this.authService.is.next(true); //pending some thing is incorrect
    //     }
    // }




ngOnInit() {
 this.loadingContext = false; 
      //all these were used for context-selection that is any one role out of all
    
  // this.contextUiService.dialogState$.subscribe(state => {
  //   this.showContextSelectionDialog = state.visible;
  //   this.availableContextsForSelection = state.contexts;}
}

handleContextSelection(event: any) {
       //all this commented code was used for context-selection that is any one role out of all
  // console.log('Assigning context to AuthService:', event);

  // this.authService.setActiveContext(event).subscribe({
  //   next: () => {
  //     console.log('Active context assigned. Completing application state setup...');

  //     // 1. Fetch user data for the specific chosen context
  //     const userId = this.authService.getUserId(); 
  //     const tenantId = event.tenantId || localStorage.getItem('tenant_id');
      
  //     if (tenantId && userId) {
  //       this.layoutService.loadUserPreferences(parseInt(tenantId), userId);
  //     }

  //     // 2. Build permissions and roles for this context
  //     this.authService.updateCurrentUserRoleAndPermissions();

  //     // 3. Mark the user as fully logged in AFTER state is ready
  //     // This triggers header components and layouts to safely render
  //     this.authService.setLoginStatus(true); 

  //     // 4. Close the dialog UI
  //     this.contextUiService.closeSelectionDialog();
      
  //     // 5. Navigate to the page now that all states are initialized
  //     this.router.navigate(['/app']); 
  //   },
  //   error: (err) => {
  //     console.error('Failed to set active context:', err);
  //     this.authService.logout(this.authService.getRefreshToken());
  //     this.contextUiService.closeSelectionDialog();
  //     this.router.navigate(['/auth/login']);
  //   }
  // });

  console.log('Context selection dialog event captured but ignored (flag is false).');
}



    ngOnDestroy() {
        this.sub.unsubscribe(); this.subHandleContSelect.unsubscribe();
      } 
    

handleLogout(): void {
    this.showContextSelectionDialog = false;
    this.authService.logout(this.authService.getRefreshToken());
     this.router.navigate(['/auth/login']);
}


}

