//in saveuser 
//comment is:    // password can be included here if the form allows password changes for existing users
//below statemennts are commented, just check whether to uncomment it or let it be
//   isActive: this.user.isActive,
//isEmailVerified: this.user.isEmailVerified,

//optimization is pending 
// payload is heavy as we added so many things like permissions,tenantId, etc, we can use alternative like create new backend endpoint for getting permissions of user

//Pending - at backend we should crosscheck user has really desired permissions to do so

//hardcoding need to remove

import { Component, OnInit,AfterViewInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
//import { Observable, firstValueFrom } from 'rxjs'; // For handling Observable to Promise conversion

// PrimeNG Modules
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DragDropModule } from 'primeng/dragdrop';
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

// Your Application Specific Imports
import { UserService } from '../../../core/services/user.service'; // Angular-side UserService
import { User, CreateUserDto, UpdateUserDto, UserRole, urlphrases } from '../../../core/models/user.model'; // User interfaces/DTOs

import { UserContextService } from '../../../core/services/user-context.service';
import { AuthService } from '../../../core/services/auth.service';
import { NgxPermissionsModule, NgxPermissionsService } from 'ngx-permissions';
import { Observable, firstValueFrom,combineLatest, of, from, BehaviorSubject } from 'rxjs';
import { map, switchMap, catchError, shareReplay, distinctUntilChanged, filter  } from 'rxjs/operators';
import { DataScopeService } from '../../../core/services/datascope.service';
//import { PersonlistComponent } from '../../people/personlist/personlist.component';
import { Person } from '../../../core/models/person.model';
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

interface RoleOption {
    label: string; // Display label in dropdown
    value: UserRole; // Actual enum value
}
// This is the model for displaying users in the table,
// adding computed observable properties for permissions.
export interface UserDisplayModel extends User {
    canEdit$: Observable<boolean>;
    canDelete$: Observable<boolean>;
}
interface PrimeNgDropdownOption {
    label: string; // Display label in dropdown
    value: string; // Actual enum value
}

// Define an extended UserFormModel that includes all possible fields needed for the form
// and frontend-only flags.
// interface UserFormModel extends Partial<User> { // Partial<User> makes all User fields optional
//     userName?: string;
//     displayName?: string | null;
//     roleName?: string;
//     isActive?: boolean;
//     isEmailVerified?: boolean;
//     googleId?: string | null;
//     password?: string; // Plaintext password for input (for create and explicit update)
//     passwordChange?: boolean; // Frontend-only flag
//     tenantId?: number // Required for CreateUserDto, optional otherwise
// }

interface UserFormModel extends Partial<User> {
    passwordChange?: boolean; // Frontend-only flag for password change
    personId?: number; // To store the selected person's ID
    person?: Person; // To store the selected person object
    password?:string;
    roleNameInContext?:string;
    faculty_department?:string;
    faculty_designation?:string;
}

interface UserWithRole extends User{
       roleNameInContext?: string; // This property is now directly on the user object
  }
  

@Component({
    selector: 'app-user-list',
    standalone: true,
    // ... (imports and providers) ...imported yes
 imports: [
        CommonModule,
        FormsModule,
        // PrimeNG Modules
        TableModule,
        ButtonModule,DropdownModule,
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
        // RatingModule, TextareaModule, SelectModule, RadioButtonModule (removed as not directly applicable to user CRUD)
        NgxPermissionsModule,
        //PersonlistComponent
    ],
providers:[MessageService,ConfirmationService],
    templateUrl: './user-list.component.html', // This HTML file below
    styleUrl: './user-list.component.scss'
})
export class UserListComponent implements OnInit {

    //pls remove below
    isButtonDisabled: boolean = true;

  //  isButtonDisabled$!: Observable<boolean>;
  users$!: Observable<UserDisplayModel[]>;

    userDialog: boolean = false;
    users = signal<UserDisplayModel[]>([]);//users = signal<User[]>([]);
    user: UserFormModel = {}; // <--- THIS IS CRUCIAL: Type is UserFormModel now
    selectedUsers: User[] | null = null;
    submitted: boolean = false;
    userRoles: PrimeNgDropdownOption[] = [];
    @ViewChild('dt') dt!: Table;
    exportColumns!: UserTableColumn[];
    cols!: Column[];
    currentUser: User | null = null; 
  // Use a BehaviorSubject for userRoles so getFilteredAssignableRoles can react to it
  private _userRolesSubject = new BehaviorSubject<PrimeNgDropdownOption[]>([]);
  userRoles$: Observable<PrimeNgDropdownOption[]> = this._userRolesSubject.asObservable();

    // --- NEW: Observable property for assignable roles ---
    assignableRolesOptions$: Observable<PrimeNgDropdownOption[]> | undefined;
    // --- END NEW ---
// --- New properties for Person selection ---
personSelectionDialogVisible: boolean = false;
selectedPerson: Person | null = null;
initialPersonSearchCriteria: { email?: string; phone?: string; firstName?: string; lastName?: string; zipCode?: string; } = {};
// --- End new properties ---
  currentUserRole: string | null = null;
  tenantIdFromusercontext!:number;

    constructor(
        private usercontextService:UserContextService,
        private userService: UserService,
        private messageService: MessageService,
        private permissionsService: NgxPermissionsService, 
        private confirmationService: ConfirmationService,
        public authService:AuthService,
        private dataScopeService:DataScopeService
    
    ) {
    
      
      this.usercontextService.currentUserProfile$.pipe(
        distinctUntilChanged(),
        filter((cuser:any) => cuser!=null),
      ).subscribe(cuser=>{
              this.currentUser=cuser; 
              
              this.tenantIdFromusercontext=this.currentUser?.tenantId!
            
              this.loadUsers();// this.loadUsers(tid!);
     })
    }

   
    ngAfterViewInit(){
     //   this.permissionsService.loadPermissions(['user.create.Student'])
    }
    async   ngOnInit() {
        
                // --- NEW: Initialize the observable property here ---
        this.assignableRolesOptions$ = this.userRoles$.pipe(
            switchMap(allRoles => {
                if (allRoles.length === 0) {
                    return of([]);
                }


                const permissionChecks: Observable<[string, boolean]>[] = allRoles.map(roleOption =>
                                       
                    from(this.permissionsService.hasPermission(`user.assign_role.${roleOption.value}`)).pipe(
                        map(hasPerm => [roleOption.value, hasPerm] as [string, boolean]),
                        catchError(() => of([roleOption.value, true] as [string, boolean]))//false
                    )
                );

                return combineLatest(permissionChecks).pipe(
                    map(results => {
                        return allRoles.filter(roleOption => {
                            // results.map(r=>{console.log('r[0]:',r[0]);
                            // })
                            const result = results.find(r => r[0] === roleOption.value);
                            return result ? result[1] : false;
                           //return true;
                        });
                    }),
                    catchError(err => {
                        console.error('Error filtering assignable roles:', err);
                        return of([]);
                    })
                );
            }),
            shareReplay(1) // IMPORTANT: Caches the last emitted value and replays it to new subscribers
        );
        // --- END NEW ---
       // this.loadUsers();
              

       this.loadUserRoles();
        this.cols = [
            { field: 'userName', header: 'Email', customExportHeader: 'User Email' },
            { field: 'displayName', header: 'Display Name' },
            { field: 'role', header: 'Role' },
            { field: 'tenantId', header: 'Tenant ID' },
            { field: 'isActive', header: 'Active' }
        ];
        this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));
        this.authService.currentUserRole$.subscribe(role => {
        
            this.currentUserRole = role; // Keep track of the current logged-in user's role
        });
     
        
    }

    onDropdownChange(event: any) {
        // The 'value' property of the event object contains the newly selected value.
        console.log('Role Dropdown value changed to:', event.value);
        if(event.value==='Faculty'){
          
        }
        // Perform any other actions based on the new value
      }
    
    // --- New Getters to simplify HTML conditions ---
    get dialogHeader(): string {
        return (this.user && this.user.id) ? 'Edit User' : 'New User'; // Direct access to user.id
    }

    get isExistingUser(): boolean {
        return !!this.user && typeof this.user.id !== 'undefined'; // Direct access to user.id
    }
    // --- End New Getters ---

 loadUsers():void{
    
// --- MODIFIED: Load users using DataScopeService ---
        // Define the base URL and all possible view permissions for user list
        const userListBasePath = '/user'; // Your backend API endpoint for users
        // These are the *permissions* that grant view access to different *types* of users
     //   const userViewPermissions = ['Student', 'Faculty', 'Coordinator', 'InstituteAdmin', 'all', 'createdBySelf'];
     const userViewPermissions = ['Student', 'Faculty', 'Coordinator','AdmissionsOfficer', 'InstituteAdmin','StudentSolo','Assessor','ClassTeacher','ClassStudent'];

        this.users$ = this.dataScopeService.getScopedListUrl(
            userListBasePath,
            'user.view.', // The prefix for view permissions
            userViewPermissions
        ).pipe(
            switchMap(url => {
                if (!url) { // If DataScopeService couldn't form a valid URL (e.g., no tenantId)
                    console.warn('No valid URL for user list, returning empty.');
                    return of([]); // Return an empty array
                }
                
                
                // Call the userService to fetch data using the constructed URL
                return this.userService.getUsersByUrl(url).pipe(
                    map((data: User[]) => { // Map backend data to UserDisplayModel
                        return data.map(userBackend => {
                            const userDisplay: UserDisplayModel = {
                                ...userBackend,
                                canEdit$: this.getCanEditObservable(userBackend),
                                canDelete$: this.getCanDeleteObservable(userBackend)
                            };
                            return userDisplay;
                        });
                    }),
                    catchError(err => {
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load users with permissions.' });
                        console.error('Error loading scoped users:', err);
                        return of([]); // Return empty array on error
                    })
                );
            }),
            shareReplay(1) // Cache the last emitted list of users
        );

        
        
        // --- END MODIFIED ---
       
 }
    
    isCreatedbyself(thisiscreatedBy:number|undefined){
        return this.authService.getUserId()===thisiscreatedBy;
    }
    // Helper function to create the canEdit$ observable for a given user
    //logic  User type is extended by adding one more property 'roleNameInContext'
    //logic contra tag:roleNameInContext extra field
    private getCanEditObservable(userToEdit: UserWithRole): Observable<boolean> {
        console.log('usertoedit:',userToEdit.userTenantContexts)
        
        if (!userToEdit || !userToEdit.roleNameInContext) {
            return of(false);
        }

        const targetRole = userToEdit.roleNameInContext;
        const thisiscreatedBy=userToEdit.createdByUserId;

        return combineLatest([
            from(this.permissionsService.hasPermission('user.edit.created_by_self')).pipe(catchError(() => of(false))),
            from(this.permissionsService.hasPermission('user.edit.Student')).pipe(catchError(() => of(false))),
            from(this.permissionsService.hasPermission('user.edit.Faculty')).pipe(catchError(() => of(false))),
            from(this.permissionsService.hasPermission('user.edit.Coordinator')).pipe(catchError(() => of(false))),
            from(this.permissionsService.hasPermission('user.edit.AdmissionsOfficer')).pipe(catchError(() => of(false))),
            from(this.permissionsService.hasPermission('user.edit.InstituteAdmin')).pipe(catchError(() => of(false))),
            
            from(this.permissionsService.hasPermission('user.edit.Assessor')).pipe(catchError(() => of(false))),
            from(this.permissionsService.hasPermission('user.edit.ClassStudent')).pipe(catchError(() => of(false))),

            // Add other specific edit permissions as needed
            // For 'user.edit.created_by_self':
            // from(this.permissionsService.hasPermission('user.edit.created_by_self')).pipe(
            //     map(hasPerm => hasPerm && this.authService.getUserId() === userToEdit.createdByUserId), // You need createdByUserId in UserBackendModel
            //     catchError(() => of(false))
            // )
        ]).pipe(
            map(([canEditUsercreated_by_self,canEditStudent, canEditFaculty,  canEditCoordinator,canEditInstituteAdmin, canEditAdmissionsOfficer
                 , canEditAssessor, caneditClassStudent]) => {
             
                if  (this.authService.getUserId()===userToEdit.id) //his own record
                { return true;  } //whatever may be usertoedit  loggedin user's record must be editable by himself
                if (canEditUsercreated_by_self && (this.authService.getUserId()===thisiscreatedBy)) //createdby currentuser
                {
                    return true;
                }
                if (targetRole === 'Student' && canEditStudent )  {    return true;   }
                if (targetRole === 'Faculty' &&  canEditFaculty)  {    return true;   }                
                if (targetRole === 'AdmissionsOfficer' &&  canEditAdmissionsOfficer) {   return true;  }                             
                if (targetRole === 'Coordinator' &&  canEditCoordinator) { return true;  }                            
                if (targetRole === 'InstituteAdmin' &&  canEditInstituteAdmin) { return true;  }
                
                if (targetRole === 'Assessor' &&  canEditAssessor) { return true;  }
                
                if (targetRole === 'ClassStudent' &&  caneditClassStudent) { return true;  }

                return false;

            }),
            catchError(err => {
                console.error('Error calculating canEditObservable:', err);
                return of(false);
            })
        );
    }

    // Helper function to create the canDelete$ observable for a given user
    private getCanDeleteObservable(userToDelete: User): Observable<boolean> {
        if (!userToDelete || !userToDelete.roleNameInContext) {
            return of(false);
        }

        const targetRole = userToDelete.roleNameInContext;
        const thisiscreatedBy=userToDelete.createdByUserId;

        return combineLatest([
            from(this.permissionsService.hasPermission('user.delete.Student.created_by_self')).pipe(catchError(() => of(false))),
            from(this.permissionsService.hasPermission('user.delete.Student')).pipe(catchError(() => of(false))),
            from(this.permissionsService.hasPermission('user.delete.Faculty')).pipe(catchError(() => of(false))),
            from(this.permissionsService.hasPermission('user.delete.Coordinator')).pipe(catchError(() => of(false))),
            from(this.permissionsService.hasPermission('user.delete.AdmissionsOfficer')).pipe(catchError(() => of(false))),
            from(this.permissionsService.hasPermission('user.delete.InstituteAdmin')).pipe(catchError(() => of(false))),
            
            from(this.permissionsService.hasPermission('user.delete.Assessor.created_by_self')).pipe(catchError(() => of(false))),
            from(this.permissionsService.hasPermission('user.delete.ClassStudent')).pipe(catchError(() => of(false))),
        ]).pipe(
            map(([canDeleteStudentcreated_by_self,canDeleteStudent, canDeleteFaculty, canDeleteCoordinator, canDeleteAdmissionsOfficer, canDeleteInstituteAdmin
                  ,canDeleteAssessorcreated_by_self, canDeletedeleteClassStudent]) => {
                if  (this.authService.getUserId()===userToDelete.id) //his own record
                { return false;  } //whatever may be usertodelete  loggedin user's record must be not be deleted by himself
                if (canDeleteAssessorcreated_by_self && (this.authService.getUserId()===thisiscreatedBy)) //createdby currentuser
                {
                    return true;
                }//pending: 1. let run this delete logic in more conditional way and 2. need to find a way a assessor is dealing with other studentsolo 

                if (canDeleteStudentcreated_by_self && (this.authService.getUserId()===thisiscreatedBy)) //createdby currentuser
                {
                    return true;
                }  if (targetRole === 'Student' && canDeleteStudent) {
                    return true;
                }
                if (targetRole === 'Faculty' && canDeleteFaculty) {
                    return true;
                }
                if (targetRole === 'Coordinator' && canDeleteCoordinator) {
                    return true;
                }
                if (targetRole === 'AdmissionsOfficer' && canDeleteAdmissionsOfficer) {
                    return true;
                }
                if (targetRole === 'InstituteAdmin' && canDeleteInstituteAdmin) {
                    return true;
                }
                
                if (targetRole === 'StudentSolo' && canDeleteAssessorcreated_by_self) {
                    return true;
                }
                
                if (targetRole === 'ClassStudent' && canDeletedeleteClassStudent) {
                    return true;
                }
                
                return false;
            }),
            catchError(err => {
                console.error('Error calculating canDeleteObservable:', err);
                return of(false);
            })
        );
    }
   
    
    loadUserRoles(): void {
        // Assuming userService.getUserRoles returns Observable<UserRoleLookup[]>
        // where UserRoleLookup is { rolename: string, ... }
        this.userService.getUserRoles().subscribe({
            //next: (roles: { rolename: string }[]) => { // Assuming backend returns array of objects with rolename
            next: (roles: string[]) => { // Assuming backend returns array of objects with rolename
                const mappedRoles = roles.map(role => ({
                    label: role,
                    value: role
                }));
              
                
                this._userRolesSubject.next(mappedRoles);
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load user roles' });
                console.error('Error loading user roles:', err);
                this._userRolesSubject.next([]);
            }
        });
    }
    // --- END CORRECTED ---
    /**
     * Handles global filtering for the PrimeNG table.
     * @param table The PrimeNG Table instance.
     * @param event The input event.
     */
    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

   

    //modified
    openNew(): void {   //earlier was : { rolename: '' }
        this.user = { roleNameInContext:  '',tenantId:this.tenantIdFromusercontext as any, passwordChange: true };
        this.submitted = false;
        this.selectedPerson = null; // Clear any previously selected person
        this.initialPersonSearchCriteria = {}; // Clear initial search criteria

        // Open the Person selection dialog first
        this.personSelectionDialogVisible = true;
    }

    // --- NEW: Method to handle person selection from PersonlistComponent ---
    onPersonSelected(person: Person): void {
        this.selectedPerson = person;
        this.personSelectionDialogVisible = false; // Close the person selection dialog

        // Pre-fill user form with selected person's data
        this.user.personId = person.id;
        this.user.person = person; // Store the full person object
        this.user.userName = person.contactEmail; // Use person's email as user's userName
        this.user.displayName = `${person.firstName} ${person.lastName || ''}`.trim();

        // Now open the main user dialog
        this.userDialog = true;
    }
    // --- END NEW ---

  
    editUser(user: User): void {
        console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaa editing user:',user);
        
        this.user = { ...user,roleNameInContext:user.roleNameInContext, passwordChange: false };
        this.selectedPerson = user.person || null; // If user has an associated person, pre-select it
        this.submitted = false;
        this.userDialog = true;
    }

    hideDialog(): void {
        this.userDialog = false;
        this.submitted = false;
        this.personSelectionDialogVisible = false; // Ensure person selection dialog is also hidden
    }
    /**
     * Deletes selected users after confirmation.
     */
    deleteSelectedUsers(): void {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete the selected users? This action cannot be undone.',
            header: 'Confirm Deletion',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                if (this.selectedUsers && this.selectedUsers.length > 0) {
                    const idsToDelete = this.selectedUsers.map(u => u.id);
                    try {
                        // Make parallel delete calls or a single bulk delete if your API supports it
                        await firstValueFrom(
                            // This is a simple example for multiple delete calls
                            // For large numbers, consider a dedicated bulk delete endpoint on backend
                            // or use forkJoin if you want to wait for all
                            new Observable(subscriber => {
                                let completed = 0;
                                const total = idsToDelete.length;
                                idsToDelete.forEach(id => {
                                    this.userService.deleteUser(id).subscribe({
                                        next: () => {
                                            completed++;
                                            if (completed === total) {
                                                subscriber.next();
                                                subscriber.complete();
                                            }
                                        },
                                        error: (err:any) => {
                                            console.error(`Error deleting user ${id}:`, err);
                                            // You might want to collect errors and show them
                                            subscriber.error(err);
                                        }
                                    });
                                });
                                if (total === 0) { // Handle case of no selected users
                                    subscriber.next();
                                    subscriber.complete();
                                }
                            })
                        );

                        // If successful, reload data from backend or update signal locally
                       this.loadUsers();// this.loadUsers(this.currentUser?.tenantId!); // Reload is safer after bulk operations
                        this.selectedUsers = null;
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Selected Users Deleted',
                            life: 3000
                        });
                    } catch (error) {
                        console.error('Error during bulk user deletion:', error);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Failed to delete some users.',
                            life: 3000
                        });
                    }
                }
            }
        });
    }


    /**
     * Deletes a single user after confirmation.
     * @param user The user object to delete.
     */
    deleteUser(user: User): void {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete user ${user.userName}? This action cannot be undone.`,
            header: 'Confirm Deletion',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.userService.deleteUser(user.id).subscribe({
                    next: () => {
                      this.loadUsers();//  this.loadUsers(this.currentUser?.tenantId!); // Reload users after successful deletion
                        this.user = {}; // Clear the form
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'User Deleted',
                            life: 3000
                        });
                    },
                    error: (err:any) => {
                        console.error('Error deleting user:', err);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Failed to delete user.',
                            life: 3000
                        });
                    }
                });
            }
        });
    }



saveUser(): void {
   
    this.submitted = true;

    // Basic validation for user fields
    if (!this.user.userName || !this.user.userName.trim() || !this.user.roleNameInContext) {
        this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'Please fill in required User fields (Email, Role).', life: 3000 });
        return;
    }

    // For new users, ensure a person is selected/created
    if (!this.isExistingUser && !this.selectedPerson) {
        this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'Please select an existing person or create a new one.', life: 3000 });
        return;
    }

    // Ensure password is provided for new users
    if (!this.isExistingUser && (!this.user.password || !this.user.password.trim())) {
        this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'Password is required for new users.', life: 3000 });
        return;
    }
    alert(this.user.roleNameInContext);
    if (this.isExistingUser) { // Existing user - Perform Update
        const userId = this.user.id!;
        const updateDto: UpdateUserDto = {
            displayName: this.user.displayName,
            roleNameInContext: this.user.roleNameInContext, 
            isActive: this.user.isActive,
            password: this.user.passwordChange ? this.user.password : undefined,
            profilePictureUrl: this.user.profilePictureUrl,
            activeTenantId:this.currentUser?.tenantId
            ,faculty_department:this.user.faculty_department
            ,faculty_designation:this.user.faculty_designation
            // Do not update personId directly on user update, it should be set on creation
        };

        this.userService.updateUser(userId, updateDto).subscribe({
            next: (updatedUser) => {
                this.loadUsers();
                this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'User Updated', life: 3000 });
                this.userDialog = false;
                this.user = { roleNameInContext: { rolename: '' } as any };
                this.selectedPerson = null;
            },
            error: (err) => {
                console.error('Error updating user:', err);
                this.messageService.add({ severity: 'error', summary: 'Error', detail: `Failed to update user. ${err.error?.message || ''}`, life: 3000 });
            }
        });
    } else { // New user - Perform Create
        const createdByUserId = this.authService.getUserId();
        if (!createdByUserId) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to find Logged in user ID to create user.', life: 3000 });
            return;
        }

        alert('creating object for CreateUserDto username:'+this.user.userName+' , displayname:'+this.user.displayName)
        const createDto: CreateUserDto = {
            userName: this.user.userName!,
            displayName: this.user.displayName,
            password: this.user.password!,
            initialRoleName: this.user.roleNameInContext!,
           // tenantId: this.currentUser?.tenantId!,//this.authService.getTenantId()!, // Assuming current user's tenant
            isActive: true, // Default to active
            isEmailVerified: false, // Default to not verified
            createdByUserId: createdByUserId,
            personId: this.selectedPerson!.id! // Use the ID of the selected/created person
            ,initialTenantId:   this.tenantIdFromusercontext
            
        };

      // console.log('...................................this.user.role.rolename:',this.user.role.rolename);
       // console.log('...................................this.user.role.roleName:',this.user.role.roleName);
        
        
        this.userService.createUser(createDto).subscribe({
            next: (createdUser) => {
                this.loadUsers();
                this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'User Created', life: 3000 });
                this.userDialog = false;
                this.user = { roleNameInContext: { rolename: '' } as any };
                this.selectedPerson = null;
            },
            error: (err) => {
                console.error('Error creating user:', err);
                this.messageService.add({ severity: 'error', summary: 'Error', detail: `Failed to create user. ${err.error?.message || ''}`, life: 3000 });
            }
        });
    }
}
    // --- Permission Check Methods for UI ---

    canAddStudent(): Observable<boolean> { 
       
        return from(this.permissionsService.hasPermission('user.create.Student')).pipe(
            catchError(err => {
                console.error('Error checking permission for user.create.Student:', err);
                return of(false);
            })
        );
    }
    
    // Determine if the 'Edit' button should be enabled for a specific user row
    // Logic: Current user must have permission to edit AND the user being edited must be of a role they can edit.
    canEditUserRow(userToEdit: User): Observable<boolean> {
        if (!userToEdit || !userToEdit.roleNameInContext) {
            return of(false); // Cannot determine role of user to edit
        }

        const targetRole = userToEdit.roleNameInContext;

        // Combine checks for different editable roles
        return combineLatest([
            this.permissionsService.hasPermission('user.edit.Student'), // Can edit Students
            this.permissionsService.hasPermission('user.edit.Faculty'), // Can edit Faculty
            // Add other specific edit permissions as needed, e.g., 'user.edit.Coordinator'
            // For 'user.edit.created_by_self', you'd need to fetch the 'createdBy' field for userToEdit
            // and compare it with the current user's ID (from authService.getUserId())
        ]).pipe(
            map(([canEditStudent, canEditFaculty]) => {
                if (targetRole === 'Student' && canEditStudent) {
                    return true;
                }
                if (targetRole === 'Faculty' && canEditFaculty) {
                    return true;
                }
                // Add more conditions for other roles
                return false;
            })
        );
    }

    // Determine if the 'Delete' button should be enabled for a specific user row
    canDeleteUserRow(userToDelete: User): Observable<boolean> {
        if (!userToDelete || !userToDelete.roleNameInContext ) { //ealier was || !userToDelete.role.rolename
            return of(false);
        }

        const targetRole = userToDelete.roleNameInContext;

        return combineLatest([
            this.permissionsService.hasPermission('user.delete.Student'),
            this.permissionsService.hasPermission('user.delete.Faculty'),
            // Add other specific delete permissions
        ]).pipe(
            map(([canDeleteStudent, canDeleteFaculty]) => {
                if (targetRole === 'Student' && canDeleteStudent) {
                    return true;
                }
                if (targetRole === 'Faculty' && canDeleteFaculty) {
                    return true;
                }
                return false;
            })
        );
    }

   
 
    /**
     * Helper to get severity for tags (e.g., for user status like 'Active'/'Inactive').
     * Adapting from original Product status logic.
     */
    getSeverity(isActive: boolean): string {
        return isActive ? 'success' : 'danger';
    }

    /**
     * Exports the table data to CSV.
     */
    exportCSV(): void {
        this.dt.exportCSV();
    }

   
    

}