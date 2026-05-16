import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms'; // Added AbstractControl
import { Router } from '@angular/router'; // To redirect after registration

// PrimeNG Modules for UI
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { PasswordModule } from 'primeng/password'; // For password input

// Your existing enums and services
import { TenantType,SubscriptionPlan } from '../../../core/models/tenant.model';
import { AuthService } from '../../../core/services/auth.service';
import { TenantService } from '../../../core/services/tenant.service';
import { RegisterAndSubscribeDto } from '../../../core/models/auth.model'; // NEW: Registration DTO
import { PersonlistComponent } from '../../people/personlist/personlist.component';
import { Person } from '../../../core/models/person.model';
import { UserService } from '../../../core/services/user.service';
import { UserRole } from '../../../core/models/user.model';

// --- 1. Define the Configuration Model for a Single Form Field ---
interface SignupFieldConfig {
    key: string;
    label: string;
    type: 'text' | 'email' | 'password' | 'url' | 'number' | 'dropdown';
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    options?: { label: string; value: string }[]; // For dropdowns
}

// --- 2. Define the Overall Form Configuration based on TenantType ---
// This map holds different field sets for different tenant types.
const SIGNUP_FORM_CONFIG: { [key in TenantType]?: SignupFieldConfig[] } = {
    [TenantType.INSTITUTE]: [
        { key: 'instituteName', label: 'Institute Name', type: 'text', required: true, minLength: 3 },
        { key: 'websiteUrl', label: 'Website URL', type: 'url', required: false },
        { key: 'contactPerson', label: 'Contact Person', type: 'text', required: true }
    ],
    [TenantType.INDIVIDUAL_TEACHER]: [
        { key: 'teacherSpecialty', label: 'Teacher Specialty', type: 'text', required: true },
        { key: 'numStudentsExpected', label: 'Expected Students', type: 'number', required: false }
    ],
    [TenantType.INDIVIDUAL_STUDENT]: [
        { key: 'favoriteSubject', label: 'Favorite Subject', type: 'text', required: true },
        { key: 'learningGoal', label: 'Learning Goal', type: 'text', required: false, maxLength: 200 }
    ],
};

// --- Helper function to chunk an array into smaller arrays (for rows) ---
function chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
}

@Component({
  selector: 'app-signupandregister',
  
  standalone: true,
  imports: [
      CommonModule,
      ReactiveFormsModule,
      InputTextModule,
      ButtonModule,
      DropdownModule,
      ToastModule,
      PasswordModule // Added for password input
      ,PersonlistComponent
  ],
  templateUrl: './signupandregister.component.html',
  styleUrl: './signupandregister.component.scss',
  providers:[MessageService]
})
export class SignupandregisterComponent  implements OnInit {
  signupForm!: FormGroup;
  dynamicFields: SignupFieldConfig[] = [];
  dynamicFieldRows: SignupFieldConfig[][] = [];
  isLoading: boolean = false; // Initial loading state for form submission

  tenantTypes: { label: string; value: TenantType }[] = []; // Options for TenantType dropdown
  roleTypes: { label: string; value: string }[] = [];
  subscriptionPlans: { label: string; value: SubscriptionPlan }[] = []; // Options for SubscriptionPlan dropdown

  selectedPerson!:Person;

  constructor(
      private fb: FormBuilder,
      private authService: AuthService,
      private tenantService: TenantService, // To fetch lookup data
      private userService:UserService,
      private messageService: MessageService,
      private router: Router
  ) {}

  ngOnInit(): void {
      this.loadLookupData();
      this.buildBaseForm(); // Build the initial form without dynamic fields
  }

  private loadLookupData(): void {
      // Fetch Tenant Types
      this.tenantService.getTenantTypes().subscribe({
          next: (data) => {
              this.tenantTypes = data.map(type => ({ label: type, value: type as TenantType }));
          },
          error: (err) => {
              console.error('Error fetching tenant types:', err);
              this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load tenant types.', life: 3000 });
          }
      });

 // Fetch Role Types
 this.userService.getUserRoles().subscribe({
    next: (data) => {
        this.roleTypes = data.map(type => ({ label: type, value: type  }));
    },
    error: (err) => {
        console.error('Error fetching role types:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load role types.', life: 3000 });
    }
});
      // Fetch Subscription Plans
      this.tenantService.getSubscriptionPlans().subscribe({
          next: (data) => {
              this.subscriptionPlans = data.map(plan => ({ label: plan, value: plan as SubscriptionPlan }));
          },
          error: (err) => {
              console.error('Error fetching subscription plans:', err);
              this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load subscription plans.', life: 3000 });
          }
      });
  }

  private buildBaseForm(): void {
      this.signupForm = this.fb.group({
          // Common User Registration Fields
          userName: ['', [Validators.required, Validators.email]], // Email
          displayName: ['', Validators.required],
          password: ['', [Validators.required, Validators.minLength(6)]], // Min length for password
          confirmPassword: ['', Validators.required],

          // Common Tenant Creation Fields
          tenantType: [null, Validators.required], // Dropdown for tenant type
          roleType: [null,Validators.required],
          tenantName: ['', Validators.required], // Name of their institute/classroom/solo space
          subscriptionPlan: [null, Validators.required] // Dropdown for subscription plan
      }, {
          // Add a custom validator for password confirmation
          validators: this.passwordMatchValidator
      });

      // Listen for changes in tenantType to dynamically build fields
      this.signupForm.get('tenantType')?.valueChanges.subscribe(selectedType => {
          this.updateDynamicFields(selectedType);
      });
  }

  private updateDynamicFields(selectedType: TenantType): void {
      // Clear previous dynamic controls
      this.dynamicFields.forEach(field => {
          if (this.signupForm.get(field.key)) {
              this.signupForm.removeControl(field.key);
          }
      });

      // Get new dynamic fields based on selected type
      const newDynamicFields = SIGNUP_FORM_CONFIG[selectedType];
      if (newDynamicFields) {
          this.dynamicFields = newDynamicFields;
          this.dynamicFieldRows = chunkArray(this.dynamicFields, 2); // Chunk into rows of 2

          // Add new dynamic controls to the form group
          this.dynamicFields.forEach(field => {
              const validators = [];
              if (field.required) { validators.push(Validators.required); }
              if (field.minLength) { validators.push(Validators.minLength(field.minLength)); }
              if (field.maxLength) { validators.push(Validators.maxLength(field.maxLength)); }
              if (field.type === 'email') { validators.push(Validators.email); }
              if (field.type === 'url') { validators.push(Validators.pattern(/^(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/[a-zA-Z0-9]+\.[^\s]{2,}|[a-zA-Z0-9]+\.[^\s]{2,})$/)); }

              this.signupForm.addControl(field.key, this.fb.control('', validators));
          });
      } else {
          this.dynamicFields = [];
          this.dynamicFieldRows = [];
      }
  }

  // Custom validator to check if password and confirmPassword match
  private passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
      const password = control.get('password');
      const confirmPassword = control.get('confirmPassword');

      if (password && confirmPassword && password.value !== confirmPassword.value) {
          confirmPassword.setErrors({ passwordMismatch: true });
          return { passwordMismatch: true };
      } else if (confirmPassword && confirmPassword.hasError('passwordMismatch')) {
          confirmPassword.setErrors(null); // Clear error if they now match
      }
      return null;
  }

  onPersonSelected(person: any): void {
    this.selectedPerson = person; console.log(person,'..................... patching values');
    
    
    // Pre-fill user form with selected person's data
   // this.user.personId = person.id;
  //  this.user.person = person; // Store the full person object
  this.signupForm.get('userName')?.patchValue(person.contactEmail);
  this.signupForm.get('displayName')?.patchValue(`${person.firstName} ${person.lastName || ''}`.trim());
    //    this.user.userName = person.contactEmail; // Use person's email as user's userName
    //this.user.displayName = `${person.firstName} ${person.lastName || ''}`.trim();

    // Now open the main user dialog
   // this.userDialog = true;
}
  /**
   * Handles the registration and initial subscription process.
   */
  onRegister(): void {
      this.isLoading = true;
      this.signupForm.markAllAsTouched(); // Mark all controls as touched to show validation errors

      if (this.signupForm.valid) {
          const formValue = this.signupForm.value;

          const registerDto: RegisterAndSubscribeDto = {
            // firstName:this.selectedPerson.firstName,
            // lastname:this.selectedPerson.lastName,
            // contactEmail:this.selectedPerson.contactEmail,
            // contactPhone:this.selectedPerson.contactPhone,

              userName: formValue.userName,
              password: formValue.password,
              displayName: formValue.displayName,
              tenantName: formValue.tenantName,
              tenantType: formValue.tenantType,
              roleType:formValue.roleType,
              subscriptionPlan: formValue.subscriptionPlan,
              // Include dynamic fields
              ...this.dynamicFields.reduce((acc, field) => {
                  if (formValue[field.key] !== undefined) {
                      (acc as any)[field.key] = formValue[field.key];
                  }
                  return acc;
              }, {})
          };

          // Call your AuthService to handle registration and initial subscription
          this.authService.registerAndSubscribe(registerDto).subscribe({ // Assuming a new method in AuthService
              next: (response) => {
                  this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Registration successful! Redirecting to dashboard...', life: 3000 });
                  // After successful registration and backend login, redirect
                 
                  this.router.navigate(['/app/dashboard']); // Redirect to dashboard or a welcome page
              },
              error: (err) => {
                  console.error('Registration failed:', err);
                  this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message || 'Registration failed. Please try again.', life: 5000 });
                  this.isLoading = false;
              }
          });
      } else {
          this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'Please correct the errors in the form.', life: 5000 });
          this.isLoading = false;
      }
  }
}

