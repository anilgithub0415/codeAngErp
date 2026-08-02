// //--pending
// //After subscribe immedietely if user visit profile page getting error
// //in loadUserProfileAndBuildForm method at line
// //    const userTenantType =this.currentUser!.tenant['tenantTypeName'];




// import { Component, OnInit, ViewChild } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; // Core Reactive Forms imports

// // PrimeNG Modules for UI
// import { InputTextModule } from 'primeng/inputtext';
// import { ButtonModule } from 'primeng/button';
// import { DropdownModule } from 'primeng/dropdown'; // If you need dynamic dropdowns
// import { ToastModule } from 'primeng/toast';
// import { MessageService } from 'primeng/api';
// import { FileUploadModule, FileUpload } from 'primeng/fileupload'; // NEW: FileUploadModule, FileUpload
// import { FluidModule } from 'primeng/fluid';

// // Your existing enums and services
// import { Tenant, TenantType } from '../../../core/models/tenant.model'; // Import TenantType
// import { AuthService } from '../../../core/services/auth.service';
// import { UserService } from '../../../core/services/user.service';
// import { UpdateUserDto, User } from '../../../core/models/user.model';
// import { UserContextService } from '../../../core/services/user-context.service';
// import { TenantService } from '../../../core/services/tenant.service';
// import { distinctUntilChanged, filter } from 'rxjs';

// // --- 1. Define the Configuration Model for a Single Form Field ---
// interface ProfileFieldConfig {
//     key: string;            // The name of the form control (e.g., 'instituteName')
//     label: string;          // Label for the input field
//     type: 'text' | 'email' | 'url' | 'number' | 'dropdown'; // HTML input type or custom type
//     required?: boolean;     // Whether the field is mandatory
//     minLength?: number;     // Min length validator
//     maxLength?: number;     // Max length validator
//     options?: { label: string; value: string }[]; // For dropdowns
// }

// // --- 2. Define the Overall Form Configuration based on TenantType ---
// // This map holds different field sets for different tenant types.
// const PROFILE_FORM_CONFIG: { [key in TenantType]?: ProfileFieldConfig[] } = {
//     [TenantType.INSTITUTE]: [
//         { key: 'instituteName', label: 'Institute Name', type: 'text', required: true, minLength: 3 },
//         { key: 'websiteUrl', label: 'Website URL', type: 'url', required: false },
//         { key: 'contactPerson', label: 'Contact Person', type: 'text', required: true },
//         { key: 'adminEmail', label: 'Admin Email', type: 'email', required: true } // Common field
//     ],
//     [TenantType.INDIVIDUAL_STUDENT]: [
//         { key: 'favoriteSubject', label: 'Favorite Subject', type: 'text', required: true },
//         { key: 'learningGoal', label: 'Learning Goal', type: 'text', required: false, maxLength: 200 },
//         { key: 'studentId', label: 'Student ID', type: 'text', required: false }, // Could be system-generated
//         { key: 'parentEmail', label: 'Parent Email (Optional)', type: 'email', required: false }
//     ],
//     // Add configurations for other TenantTypes as needed
//     // [TenantType.INDIVIDUAL_TEACHER]: [ ... ]
// };


// // --- Helper function to chunk an array into smaller arrays (for rows) ---
// function chunkArray<T>(array: T[], chunkSize: number): T[][] {
//     const chunks: T[][] = [];
//     for (let i = 0; i < array.length; i += chunkSize) {
//         chunks.push(array.slice(i, i + chunkSize));
//     }
//     return chunks;
// }


// @Component({
//   selector: 'app-profile',
//   standalone: true,
//   imports: [
//       CommonModule,
//       ReactiveFormsModule, // <--- IMPORTANT for Reactive Forms
//       InputTextModule,
//       ButtonModule,
//       DropdownModule,
//       ToastModule, // For MessageService
//       FluidModule,FileUploadModule
//   ],
//   templateUrl: './profile.component.html',
//   styleUrl: './profile.component.scss',
//   providers: [MessageService] 
// })
// export class ProfileComponent {
    
//   profileForm!: FormGroup; // Our dynamic form group
//   dynamicFields: ProfileFieldConfig[] = []; // The fields to render for the current user's tenant type
//   dynamicFieldRows: ProfileFieldConfig[][] = []; // NEW: Array of arrays for rows
//   currentUser: User | null = null; // To hold the user's data
//   isLoading: boolean = true; // Loading state for data fetch
//   showProfileUploader:boolean=false;
//   @ViewChild('profilePicUploader') profilePicUploader!: FileUpload; // Reference to p-fileUpload component

//   constructor(
//     private usercontextService:UserContextService,
//       private fb: FormBuilder, // FormBuilder helps create form controls
//       private authService: AuthService,
//       private userService: UserService,private tenantService:TenantService,
//       private messageService: MessageService,
//   ) { 
//         this.usercontextService.currentUserProfile$.pipe(
//         distinctUntilChanged(),
//         filter((cuser:any) => cuser!=null),
//         ).subscribe(cuser=>{this.currentUser=cuser;  console.log('in profile, cuser:',cuser);

//         this.loadUserProfileAndBuildForm();
//         })
// }

//   ngOnInit(): void {
   
//   }

//   private async loadUserProfileAndBuildForm()  {
//       this.isLoading = true;
//       const userId = this.authService.getUserId(); // Get ID of logged-in user
//       if (!userId) {
//           this.messageService.add({ severity: 'error', summary: 'Error', detail: 'User not logged in.', life: 3000 });
//           this.isLoading = false;
//           return;
//       }

//     //   this.userService.getUser(userId).subscribe({
//     //       next: (user) => {
//     //           this.currentUser = user;
//     //           // Assuming tenantType is directly available on the User object
//     //           // If not, you might need to fetch the Tenant separately or ensure User includes Tenant details.
              
//     //           //const userTenantType = user.tenantType; // Assuming user.tenantType is a string matching TenantType enum values
//     //          // const userTenantType = 'INSTITUTE';
//     //           const userTenantType = 'INDIVIDUAL_STUDENT';
//     //            // Assuming user.tenantType is a string matching TenantType enum values
//     //           // --- Dynamic Form Building Logic ---
//     //           if (userTenantType && PROFILE_FORM_CONFIG[userTenantType as TenantType]) {
//     //               this.dynamicFields = PROFILE_FORM_CONFIG[userTenantType as TenantType]!;
//     //               this.buildForm(user); // Pass the fetched user data to pre-fill the form
//     //           } else {
//     //               this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'No specific profile configuration found for your tenant type.', life: 5000 });
//     //               this.dynamicFields = []; // No dynamic fields
//     //               this.profileForm = this.fb.group({}); // Empty form group
//     //           }
//     //           this.isLoading = false;
//     //       },
//     //       error: (err) => {
//     //           console.error('Error fetching user profile:', err);
//     //           this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load user profile.', life: 3000 });
//     //           this.isLoading = false;
//     //       }
//     //   });
//     //    this.userService.getUser(userId).subscribe({
//       //  next: (user) => {
//           //  this.currentUser = user;

// //          var userTenantType =TenantType.INDIVIDUAL_STUDENT;//this.currentUser!.userTenantContexts![0].tenantId['tenantTypeName'];


// const currentActiveContext = this.authService.loadActiveContext();
// console.log('....................currentActiveContext',currentActiveContext);


// //var userTenantType ;
//       //    var tid=this.currentUser!.userTenantContexts![0].tenantId; console.log('tid is ..............',tid);
          
//                 //   const data:any =await  this.tenantService.getTenants(tid); console.log('data is ..................................:',data);
                   
//                //    var userTenantType=data[0].tenantType=='INSTITUTE'?TenantType.INSTITUTE:TenantType.INDIVIDUAL_STUDENT
// //   this.tenantService.getTenants(tid).subscribe({
       
        
// //     next: (data:any) => {
// //         console.log('found data[0].tenantType:',data[0].tenantTypeName);
        
// //         userTenantType=data[0].tenantTypeName=='INSTITUTE'?TenantType.INSTITUTE:TenantType.INDIVIDUAL_STUDENT
// //        this.buildaformbyuserTenantType(userTenantType)
// //     },
// //     error: (err:any) => {
// //         console.error('Error loading a tenant of tenantId:', err);
// //         this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load tenant data.', life: 3000 });
// //     }
// // });


                                     
//         // },
//         // error: (err) => {
//         //     console.error('Error fetching user profile:', err);
//         //     this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load user profile.', life: 3000 });
//         //     this.isLoading = false;
//         // }
//    // });

//    //const  userTenantType=   currentActiveContext?.tenantType=='INSTITUTE'?TenantType.INSTITUTE:TenantType.INDIVIDUAL_STUDENT;
//    // 1. Fetch the actual current object snapshot state instead of the boolean return
// const activeContextData = this.authService.activeContext$.subscribe();//?.value || (this.authService as any)._activeContext?.value;

// // 2. Safely evaluate your conditional assignment expression
// const userTenantType = activeContextData?.tenantType == 'INSTITUTE' 
//     ? TenantType.INSTITUTE 
//     : TenantType.INDIVIDUAL_STUDENT;

//    this.buildaformbyuserTenantType(userTenantType)

//   }

//         buildaformbyuserTenantType(userTenantType:any){
//             if (userTenantType && PROFILE_FORM_CONFIG[userTenantType as TenantType]) {
//                 this.dynamicFields = PROFILE_FORM_CONFIG[userTenantType as TenantType]!;
//                 this.dynamicFieldRows = chunkArray(this.dynamicFields, 2); // NEW: Chunk into rows of 2
//                 this.buildForm(this.currentUser!);
//             } else {
//                 this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'No specific profile configuration found for your tenant type or tenant type is missing.', life: 5000 });
//                 this.dynamicFields = [];
//                 this.dynamicFieldRows = []; // Clear rows as well
//                 this.profileForm = this.fb.group({});
//             }
//             this.isLoading = false;  
//         }

//   private buildForm(user: User): void {
//       const formControls: { [key: string]: any } = {};

//       this.dynamicFields.forEach(field => {
//           const validators = [];
//           if (field.required) {
//               validators.push(Validators.required);
//           }
//           if (field.minLength) {
//               validators.push(Validators.minLength(field.minLength));
//           }
//           if (field.maxLength) {
//               validators.push(Validators.maxLength(field.maxLength));
//           }
//           if (field.type === 'email') {
//               validators.push(Validators.email);
//           }
//           if (field.type === 'url') {
//               // Basic URL pattern, consider a more robust regex for production
//               validators.push(Validators.pattern(/^(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/[a-zA-Z0-9]+\.[^\s]{2,}|[a-zA-Z0-9]+\.[^\s]{2,})$/));
//           }

//           // Initialize control with existing user data if available
//           // Note: This assumes the 'key' in ProfileFieldConfig matches a property on the User object
//           const initialValue = (user as any)[field.key] || ''; // Use 'as any' here for flexibility, or map explicitly

//           formControls[field.key] = [initialValue, validators];
//       });

//       // Add common profile fields (like displayName) that are always present
//       formControls['displayName'] = [user.displayName || '', Validators.required];
//       formControls['profilePictureUrl'] = [user.profilePictureUrl || '']; // Assuming this is also on the user model

//       this.profileForm = this.fb.group(formControls);
//   }

  
//     /**
//      * Handles the successful upload of a profile picture.
//      * The `event.originalEvent.body` should contain the URL of the uploaded image from the backend.
//      */
//     onProfilePictureUpload(event: any): void {
//         const response = event.originalEvent.body; // Assuming backend sends JSON response with URL
//         if (response && response.profilePictureUrl) {
//             const uploadedUrl = response.profilePictureUrl;
//             this.profileForm.get('profilePictureUrl')?.setValue(uploadedUrl);
//             this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Profile picture uploaded!' });
//             console.log('Uploaded profile picture URL:', uploadedUrl);
//             // Optionally, update currentUser immediately to show new picture
//             if (this.currentUser) {
//                 this.currentUser.profilePictureUrl = uploadedUrl;
//             }
//         } else {
//             this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to get uploaded picture URL.' });
//             console.error('Upload response missing profilePictureUrl:', response);
//         }
//     }

//     /**
//      * Triggers the upload of the selected file(s) if using basic mode.
//      */
//     uploadProfilePicture(): void {
//         if (this.profilePicUploader) {
//             this.profilePicUploader.upload();
//         }
//     }
//   onSaveProfile(): void {
//       if (this.profileForm.valid && this.currentUser) {
//           const formValue = this.profileForm.value;
//           const updateDto: UpdateUserDto = {
//               displayName: formValue.displayName,
//               profilePictureUrl: formValue.profilePictureUrl, // Assuming this is part of your UpdateUserDto
//               // Dynamically add other fields based on dynamicFields config
//               ...this.dynamicFields.reduce((acc, field) => {
//                   if (formValue[field.key] !== undefined) {
//                       (acc as any)[field.key] = formValue[field.key];
//                   }
//                   return acc;
//               }, {})
//           };

//           // Assuming your UserService.updateUser can handle these additional fields
//           // You might need a more generic UpdateUserDto or a specific UpdateProfileDto
//           this.userService.updateUser(this.currentUser.id, updateDto).subscribe({
//               next: (updatedUser) => {
//                   this.currentUser = updatedUser; // Update local user data
//                   this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Profile updated successfully!', life: 3000 });
//               },
//               error: (err) => {
//                   console.error('Profile update failed:', err);
//                   this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update profile.', life: 3000 });
//               }
//           });
//       } else {
//           this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'Please fill out all required fields correctly.', life: 3000 });
//           this.profileForm.markAllAsTouched(); // Show validation errors
//       }
//   }

//    // --- New method to toggle uploader visibility ---
//    toggleProfileUploader(): void {
//     this.showProfileUploader = !this.showProfileUploader;
// }

// }
