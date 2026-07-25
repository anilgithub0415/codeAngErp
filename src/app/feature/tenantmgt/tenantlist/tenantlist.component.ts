
import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, firstValueFrom } from 'rxjs'; // For handling Observable to Promise conversion

// PrimeNG Modules
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber'; // For numerical IDs if needed
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown'; // For selecting roles
import { CheckboxModule } from 'primeng/checkbox'; // For isActive
import { CalendarModule } from 'primeng/calendar';

// Your Application Specific Imports
import { TenantService } from '../../../core/services/tenant.service'; 
//import { Tenant, CreateTenantDto, UpdateTenantDto,TenantType, subscriptionPlanType } from '../../../core/models/tenant.model'; 
import { Tenant, CreateTenantDto, UpdateTenantDto} from '../../../core/models/tenant.model'; 
import { UserContextService } from '../../../core/services/user-context.service';
import { User } from '../../../core/models/user.model';

                                                                      // or import from backend entity if convenient.

// Interfaces for PrimeNG Table columns
interface Column {
    field: string;
    header: string;
    customExportHeader?: string;
}

interface UserTableColumn {
    title: string;
    dataKey: string;
}

// interface TenantTypeOption {
//     label: string; // Display label in dropdown
//     value: TenantType; // Actual enum value
// }

// interface subscriptionTypeOption {
//     label: string; // Display label in dropdown
//     value: subscriptionPlanType; // Actual enum value
// }
interface EnumOption {
    label: string; // Display label in dropdown
    value: string; // Actual enum value
}

// Define an extended UserFormModel that includes all possible fields needed for the form
// and frontend-only flags.
interface TenantFormModel extends Partial<Tenant> { // Partial<Tenant> makes all Tenant fields optional
    userName?: string;
    displayName?: string | null;
  //  tenantTypeName?: TenantType;subscriptionPlanName?:subscriptionPlanType;
  tenantTypeName?: string;subscriptionPlanName?:string;
    isActive?: boolean;
    isEmailVerified?: boolean;
    googleId?: string | null;
    password?: string; // Plaintext password for input (for create and explicit update)
    passwordChange?: boolean; // Frontend-only flag
    tenantId?: number // Required for CreateUserDto, optional otherwise
}


@Component({
  selector: 'app-tenantlist',
  standalone: true,
  // ... (imports and providers) ...imported yes
imports: [
      CommonModule,
      FormsModule,
      // PrimeNG Modules
      TableModule,
      ButtonModule,
      RippleModule,
      ToastModule,
      ToolbarModule,
      InputTextModule,
      InputNumberModule,
      DialogModule,
      TagModule,
      InputIconModule,
      IconFieldModule,
      ConfirmDialogModule,
      DropdownModule, // Added
      CheckboxModule, // Added
      CalendarModule
      // RatingModule, TextareaModule, SelectModule, RadioButtonModule (removed as not directly applicable to user CRUD)
  ],
providers:[MessageService,ConfirmationService],
  templateUrl: './tenantlist.component.html',
  styleUrl: './tenantlist.component.scss'
}) 
export class TenantlistComponent  implements OnInit {
  tenantDialog: boolean = false;
  tenants = signal<Tenant[]>([]);
  tenant: TenantFormModel = {}; // <--- THIS IS CRUCIAL: Type is UserFormModel now
  selectedTenants: Tenant[] | null = null;
  submitted: boolean = false;
  //tenantTypes:TenantTypeOption[]=[];
  //subscriptionTypes:subscriptionTypeOption[]=[];
  @ViewChild('dt') dt!: Table;
  exportColumns!: UserTableColumn[];
  cols!: Column[];

  // These will now be populated from backend API calls
  tenantTypes: EnumOption[] = [];
  subscriptionTypes: EnumOption[] = [];
  currentUser: User | null = null; 
  constructor(
    private usercontextService:UserContextService,
      private tenantService: TenantService,
      private messageService: MessageService,
      private confirmationService: ConfirmationService,
  ) {
    
    this.usercontextService.currentUserProfile$.subscribe(cuser=>{
            this.currentUser=cuser;
            var tid=this.currentUser?.tenantId
            this.loadTenants(tid!);
   })
  }

  
  ngOnInit(): void {
    var tid=this.currentUser?.tenantId;
   // this.loadTenants(tid!); 
  
   
    // Populate dropdown options by fetching from backend
    this.tenantService.getTenantTypes().subscribe({
        next: (data) => {
            this.tenantTypes = data.map(type => ({ label: type, value: type }));
        },
        error: (err) => console.error('Error fetching tenant types:', err)
    });
   
     // Populate dropdown options by fetching from backend
     this.tenantService.getSubscriptionPlans().subscribe({
        next: (data) => {
            this.subscriptionTypes = data.map(type => ({ label: type, value: type }));
        },
        error: (err) => console.error('Error fetching subscription types:', err)
    });
    
    this.cols = [
        { field: 'tenantName', header: 'tenantName', customExportHeader: 'Tenant Name' },
        { field: 'tenantId', header: 'Tenant ID' },
    ];
    this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));
  }

    // --- New Getters to simplify HTML conditions ---
    get dialogHeader(): string {
      return (this.tenant && this.tenant.tenantId) ? 'Edit Tenant' : 'New Tenant'; // Direct access to user.id
  }

  get isExistingTenant(): boolean {
      return !!this.tenant && typeof this.tenant.tenantId !== 'undefined'; // Direct access to tenantId     
  }
  // --- End New Getters ---


  /**
   * Loads tenants from the backend API.
   */
  loadTenants(tid:number): void {
   // alert('pass this:'+this.currentUser)
  // var tid=this.currentUser?.tenantId;
  // alert('fetching data of tid:'+tid)
      this.tenantService.getTenants().subscribe({
       
        
          next: (data:any) => {
              this.tenants.set(data);
              this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Tenants Loaded', life: 3000 });
          },
          error: (err:any) => {
              console.error('Error loading tenants:', err);
              this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load tenants.', life: 3000 });
          }
      });
  }
    /**
     * Handles global filtering for the PrimeNG table.
     * @param table The PrimeNG Table instance.
     * @param event The input event.
     */
    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }
    
    /**
     * Hides the user creation/edit dialog.
     */
    hideDialog(): void {
        this.tenantDialog = false;
        this.submitted = false;
    }

    openNew(): void {
        // Initialize with default values for a new user, and set passwordChange flag
        this.tenant = { isActive: true, tenantType: this.tenantTypes[0]?.value || '',  subscriptionPlan: this.subscriptionTypes[0]?.value || '', };
        this.submitted = false;
        this.tenantDialog = true;
    }

    editTenant(tenant: Tenant): void {
       
        // this.tenant = tenant;
        // this.submitted = false;
        // this.tenantDialog = true;
        this.tenant = { ...tenant }; // Create a copy for editing

        if (this.tenant.subscriptionEndDate) {
            this.tenant.subscriptionEndDate = new Date(this.tenant.subscriptionEndDate);
        }
        if (this.tenant.createdAt) {
            this.tenant.createdAt = new Date(this.tenant.createdAt);
        }
        if (this.tenant.updatedAt) {
            this.tenant.updatedAt = new Date(this.tenant.updatedAt);
        }
        console.log('Editing Tenant, subscriptionEndDate after conversion:', this.tenant.subscriptionEndDate);
        // --- END MODIFIED ---

        this.submitted = false;
        this.tenantDialog = true;
        
    }    
    
    deleteTenant(tenant: Tenant) {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete ' + tenant.tenantName + '?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                // this.tenants.set(this.tenants().filter((val) => val.tenantId !== tenant.tenantId));
                // this.tenant = {};
                // this.messageService.add({
                //     severity: 'success',
                //     summary: 'Successful',
                //     detail: 'Tenant Deleted',
                //     life: 3000
                // });
                 // --- MODIFIED: Call backend service for single delete ---
                 this.tenantService.deleteTenant(tenant.tenantId).subscribe({
                    next: () => {
                        this.loadTenants(this.currentUser?.tenantId!); // --- MODIFIED: Reload data from DB after successful deletion ---
                        this.tenant = {}; // Clear the form
                        this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Tenant Deleted', life: 3000 });
                    },
                    error: (err) => {
                        console.error('Error deleting tenant:', err);
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete tenant.', life: 3000 });
                    }
                });
            }
        });
    }

    saveTenant(): void {
        console.log('m sabving tenant');
        this.submitted = true;

        // Basic form validation for required fields
        if (typeof this.tenant.tenantName === 'string' && this.tenant.tenantName.trim() &&
            typeof this.tenant.tenantTypeName === 'string' && this.tenant.tenantTypeName.trim() 
            // && (this.isExistingTenant || (typeof this.tenant.tenantId === 'string' && this.tenant.tenantId.trim()))
        ) 
            { // Tenant ID required only for new tenants


            if (this.isExistingTenant) { // Existing tenant - Perform Update
                const tenantId = this.tenant.tenantId!; // 'id' is guaranteed for existing tenants via isExistingTenant
                const updateDto: UpdateTenantDto = {
                    tenantName: this.tenant.tenantName,
                    tenantType: this.tenant.tenantTypeName,
                    subscriptionPlan: this.tenant.subscriptionPlanName,
                    isActive: this.tenant.isActive,
                    subscriptionEndDate: this.tenant.subscriptionEndDate,
                    

                };
                // // Only include password in DTO if passwordChange is true and password is provided
                // if (this.tenant.passwordChange && this.tenant.password) {
                //     updateDto.password = this.tenant.password;
                // }

                this.tenantService.updateTenant(tenantId, updateDto).subscribe({
                    next: (updatedTenant) => {
                        this.loadTenants(this.currentUser?.tenantId!);
                        this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Tenant Updated', life: 3000 });
                        this.tenantDialog = false;
                        this.tenant = {};
                    },
                    error: (err) => {
                        console.error('Error updating tenant:', err);
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: `Failed to update tenant. ${err.error?.message || ''}`, life: 3000 });
                    }
                });
            } else { // New tenant - Perform Create
                const createDto: CreateTenantDto = {
                    tenantName: this.tenant.tenantName!,
                    tenantType: this.tenant.tenantTypeName,
                    subscriptionPlan: this.tenant.subscriptionPlanName,
                    
                };

                // // Add more validation for create-specific fields like password, tenantId
                // if (!createDto.password && !createDto.googleId) {
                //     this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'Password or Google ID required for new tenant.', life: 3000 });
                //     return;
                // }
                // if (!createDto.tenantId) {
                //     this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'Tenant ID is required for new tenant.', life: 3000 });
                //     return;
                // }

                this.tenantService.createTenant(createDto).subscribe({
                    next: (createdTenant) => {
                        this.loadTenants(this.currentUser?.tenantId!);
                        this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Tenant Created', life: 3000 });
                        this.tenantDialog = false;
                        this.tenant = {};
                    },
                    error: (err) => {
                        console.error('Error creating tenant:', err);
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: `Failed to create tenant. ${err.error?.message || ''}`, life: 3000 });
                    }
                });
            }
        } else {
            this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'Please fill in all required fields.', life: 3000 });
        }
    }

    /**
     * Helper to get severity for tags (e.g., for user status like 'Active'/'Inactive').
     * Adapting from original Tenant status logic.
     */
    getSeverity(isActive: boolean): string {
        return isActive ? 'success' : 'danger';
    }

}
