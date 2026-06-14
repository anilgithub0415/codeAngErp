
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
// Interface for AvailableContext (copy from AuthService or define globally if shared)
interface AvailableContext {
    tenantId: number;displayName:string;
    tenantName: string;tenantType: string;
    roleName: string;
    permissions: string[];
}
export function registerLookupExtension(lookupService:LookupService){

  return {
    extensions:[
      {
        name:'lookup-injector',
        extension:{
          prePopulate:async(field:any)=>{
                       
            const lookupKey = field.props?.['lookupKey'];
            if(!lookupKey) return; 
            //hardcoded tenantid here
            await lookupService.getLookupDataByKey('customerCategoryTypes',1).subscribe({
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
    imports: [RouterModule,FormsModule,
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
  LookupService,
  {
    provide: FORMLY_CONFIG,
    multi:true,
    useFactory:registerLookupExtension,
    deps:[LookupService]
  }
],
    template: `<span *ngIf='loadingContext'>Wait...</span>
    <router-outlet *ngIf='!loadingContext'></router-outlet>
    <app-context-selection-dialog
    [visible]="showContextSelectionDialog"
    [contexts]="availableContextsForSelection"
    (contextSelected)="handleContextSelection($event)"
    (logoutInitiated)="authService.logout(this.authService.getRefreshToken())"
></app-context-selection-dialog> <!-- This component listens for messages from the MessageService -->
<p-toast></p-toast>`
})
export class AppComponent implements OnInit {
    showContextSelectionDialog: boolean = false;
    loadingContext:boolean=false;
    availableContextsForSelection: AvailableContext[] | null = null;
    
public authService=inject(AuthService)
    constructor( private router: Router, private eventbusService:EventBusService
        ,  private usercontextService:UserContextService,
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


ngOnInit(): void {
    // First, check if a context is already active and saved in the service.
    // This prevents the dialog/auto-selection logic from running on every page refresh if a context is already set.
    if (this.authService.loadActiveContext()) {
        console.log('Active context already exists. Skipping selection logic.');
        this.loadingContext = false;
        return; // Exit the ngOnInit logic early
    }
  
    //alert('app component not found activecontext ')

    // If no active context is found, proceed with the subscription to isLoggedIn$.
    this.sub = this.authService.isLoggedIn$.pipe(
      distinctUntilChanged(),
      filter(isAuthenticated => isAuthenticated === true),
      take(1)
    ).subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.loadingContext = true;
        const contexts = this.authService.getAvailableContexts();
        
        if (contexts && contexts.length == 1) { console.log('yes context found .......with length 1'); } 
        
        if (contexts && contexts.length > 1) {
          this.availableContextsForSelection = contexts;
          this.showContextSelectionDialog = true;
          this.loadingContext = false;
        } else if (contexts && contexts.length === 1) {
          this.authService.setActiveContext(contexts[0]).subscribe({
            next: () => {
              console.log('Auto-selected single context.');
              this.loadingContext = false;
            },
            error: (err) => {
              console.error('Auto-selection failed:', err);
              this.authService.logout(this.authService.getRefreshToken());
            }
          });
        } else {
          console.warn('No contexts found after login or contexts array is empty.');
          this.authService.logout(this.authService.getRefreshToken());
        }
      } else {
        this.showContextSelectionDialog = false;
        this.availableContextsForSelection = null;
      }

     
    });
  
    // Your initial check on load block is no longer needed with the new logic at the start of ngOnInit
  }
    ngOnDestroy() {
        this.sub.unsubscribe(); this.subHandleContSelect.unsubscribe();
      } 
    handleContextSelection(selectedContext: AvailableContext): void {
        console.log('...object passing to setActveContext thru handleselection:',selectedContext);
        
        this.subHandleContSelect= this.authService.setActiveContext(selectedContext).subscribe({
            next: () => {
                
                this.showContextSelectionDialog = false; this.loadingContext=false; this.eventbusService.emit(new EmitEvent(Events.contextSelected,selectedContext))
                //this.router.navigate(['/app']); // Navigate to a default route after selection
                window.location.href="http://localhost:4200/app/usrmgt";
            },
            error: (err) => {
                console.error('Failed to set active context:', err);
                // Handle error, maybe show a message and logout
                var rt=this.authService.getRefreshToken();
                this.authService.logout(rt);
            }
        });
    }
}

