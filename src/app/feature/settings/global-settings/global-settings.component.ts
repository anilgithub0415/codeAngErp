// import { Component, OnInit, signal, viewChild, ViewChild } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { Observable, Subscription, firstValueFrom } from 'rxjs'; // For handling Observable to Promise conversion

// // PrimeNG Modules
// import { ConfirmationService, MessageService } from 'primeng/api';
// import { Table, TableModule } from 'primeng/table';
// import { ButtonModule } from 'primeng/button';
// import { RippleModule } from 'primeng/ripple';
// import { ToastModule } from 'primeng/toast';
// import { ToolbarModule } from 'primeng/toolbar';
// import { InputTextModule } from 'primeng/inputtext';
// import { InputNumberModule } from 'primeng/inputnumber'; // For numerical IDs if needed
// import { DialogModule } from 'primeng/dialog';
// import { TagModule } from 'primeng/tag';
// import { InputIconModule } from 'primeng/inputicon';
// import { IconFieldModule } from 'primeng/iconfield';
// import { ConfirmDialogModule } from 'primeng/confirmdialog';
// import { DropdownModule } from 'primeng/dropdown'; // For selecting roles
// import { CheckboxModule } from 'primeng/checkbox'; // For isActive

// // Your Application Specific Imports
// import { SecuritySettingsService } from '../../../core/services/settings.service';
// //import { Tenant, CreateTenantDto, UpdateTenantDto,TenantType, subscriptionPlanType } from '../../../core/models/tenant.model'; 
// import { Settings,UpdateGlobalsettingsDto } from '../../../core/models/global-settings';
// import { TenantService } from '../../../core/services/tenant.service';
// import { TabsModule } from 'primeng/tabs';

//                                                                       // or import from backend entity if convenient.

// // Interfaces for PrimeNG Table columns
// interface Column {
//     field: string;
//     header: string;
//     customExportHeader?: string;
// }

// interface UserTableColumn {
//     title: string;
//     dataKey: string;
// }

// interface EnumOption {
//     label: string; // Display label in dropdown
//     value: string; // Actual enum value
// }

// // Define an extended UserFormModel that includes all possible fields needed for the form
// // and frontend-only flags.
// interface SettingFormModel extends Partial<Settings> { // Partial<Globalsetting> makes all Globalsetting fields optional
//   settingKey?:string;
//   accessTokenLifetime?:number;
//   refreshTokenLifetime?:number;
// }

// interface SubscriptionPlanFormModel {
//   PlanName?:string;
// }
// interface TenantTypesFormModel extends Partial<Settings> { // Partial<Globalsetting> makes all Globalsetting fields optional
//   TypeName?:string;
// }
// @Component({
//   selector: 'app-global-settings',
//   standalone: true,
//   // ... (imports and providers) ...imported yes
// imports: [
//       CommonModule,
//       FormsModule,
//       // PrimeNG Modules
//       TableModule,
//       ButtonModule,
//       RippleModule,
//       ToastModule,
//       ToolbarModule,
//       InputTextModule,
//       InputNumberModule,
//       DialogModule,
//       TagModule,
//       InputIconModule,
//       IconFieldModule,
//       ConfirmDialogModule,
//       DropdownModule, // Added
//       CheckboxModule, // Added   
//       TabsModule   
//   ],
  
// providers:[MessageService,ConfirmationService],
//   templateUrl: './global-settings.component.html',
//   styleUrl: './global-settings.component.scss'
// })
// export class GlobalSettingsComponent implements OnInit {
//   addeditTenantType:string='';addeditSubscriptionPlan:string='';

//   SettingDialog: boolean = false; TenantTypesDialog: boolean = true; SubscriptionPlansDialog: boolean = true;
//   Setting: SettingFormModel = {};  aTenantType: TenantTypesFormModel = {}; aSubscriptionPlan: SubscriptionPlanFormModel = {};// <--- THIS IS CRUCIAL: Type is UserFormModel now

//   TenantTypes!: string[];// signal<TType[]>([]);
//   SubscriptionPlans!:string[];
  
//   submittedSetting: boolean = false;submittedTenantTypes: boolean = false;submittedSubscriptionPlans: boolean = false;
//   @ViewChild('dt') dt!: Table;
//   exportColumns!: UserTableColumn[];
//   cols!: Column[];
// colsTType!:Column[];
//   // These will now be populated from backend API calls
// //  tenantTypes: EnumOption[] = [];
// //  subscriptionTypes: EnumOption[] = [];

//   constructor(
//     private settingService: SecuritySettingsService, private tenantService:TenantService,
//       private messageService: MessageService,
//       private confirmationService: ConfirmationService
//   ) {}

//   ngOnInit(): void {
    
  
//     this.loadSetting();this.loadTenantTypes();this.loadSubscriptionPlans();
//     this.cols = [
//         { field: 'accessTokenLifetime', header: 'accessTokenLifetime', customExportHeader: 'accessTokenLifetime' },
//         { field: 'refreshTokenLifetime', header: 'refreshTokenLifetime' },
//     ];
//     this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));
//   }

//     // --- New Getters to simplify HTML conditions ---
//     get dialogHeader(): string {
//       return (this.Setting && this.Setting.settingKey) ? 'Edit Globalsetting' : 'New Globalsetting'; // Direct access to user.id
//   }

// //   get isExistingGlobalsettings(): boolean {
// //       return !!this.Globalsetting && typeof this.Globalsetting.settingKey !== 'undefined'; // Direct access to tenantId     
// //   }
//   // --- End New Getters ---


//   /**
//    * Loads Settings from the backend API.
//    */
//   loadSetting(): void {
//       this.settingService.getSecuritySettings().subscribe({
//           next: (data:any) => {
//              // this.Settings.set(data); console.log('aaaaaaaaaaaaaaaaaaa',this.Settings);
//               this.Setting=data;
//               this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Setting Loaded', life: 3000 });
//           },
//           error: (err:any) => {
//               console.error('Error loading Setting:', err);
//               this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load Settings.', life: 3000 });
//           }
//       });
//   }

//   loadTenantTypes(): void {
//     this.tenantService.getTenantTypes().subscribe({
//         next: (data:any) => {
//           this.TenantTypes=data;
          
//             this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'TenantTypes Loaded', life: 3000 });
//         },
//         error: (err:any) => {
//             console.error('Error loading TenantTypes:', err);
//             this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load TenantTypes.', life: 3000 });
//         }
//     });

//     this.colsTType = [
//       { field: 'TypeName', header: 'TypeName', customExportHeader: 'TenantType' },
    
//   ];
// }
  
// loadSubscriptionPlans(): void {
//   this.tenantService.getSubscriptionPlans().subscribe({
//       next: (data:any) => {
//         this.SubscriptionPlans=data;
        
//           this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'SubscriptionPlans Loaded', life: 3000 });
//       },
//       error: (err:any) => {
//           console.error('Error loading SubscriptionPlans:', err);
//           this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load SubscriptionPlans.', life: 3000 });
//       }
//   });

//   this.colsTType = [
//     { field: 'TypeName', header: 'TypeName', customExportHeader: 'TenantType' },
  
// ];
// }
//   hideSettingDialog(): void {
//     this.SettingDialog = false;
//     this.submittedSetting = false;
//    }
//    hideTenantTypesDialog(): void {
//     this.TenantTypesDialog = false;
//     this.submittedTenantTypes = false;
//    }

   

//    saveSetting(): void {
//        this.submittedSetting = true;
//     // Basic form validation for required fields
//     if (typeof this.Setting.accessTokenLifetime === 'string' 
//       && this.Setting.accessTokenLifetime>0 && this.Setting.accessTokenLifetime<3600         
//        ) 
//         { 
//             // const tenantId = this.tenant.tenantId!; // 'id' is guaranteed for existing tenants via isExistingTenant
//             const updateDto: UpdateGlobalsettingsDto = {
//                 accessTokenLifetime: this.Setting.accessTokenLifetime,
//                 refreshTokenLifetime: this.Setting.refreshTokenLifetime              
//             };
           
//               this.settingService.refreshSettings(updateDto).subscribe({
//                 next: (updatedTenant) => {
//                     this.loadSetting();
//                     this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Settings Updated', life: 3000 });
//                     this.SettingDialog = false;
//                     //this.Setting = {};
//                 },
//                 error: (err) => {
//                     console.error('Error updating setting:', err);
//                     this.messageService.add({ severity: 'error', summary: 'Error', detail: `Failed to update setting. ${err.error?.message || ''}`, life: 3000 });
//                 }
//             });
        
//     } else {
//         this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'Please fill in all required fields.', life: 3000 });
//     }
// }
// edittenanttype(ptenanttype:any){
//   this.addeditTenantType='edit';
//   this.aTenantType=ptenanttype;
// }
// saveTenantTypes(): void{

// }

// }
