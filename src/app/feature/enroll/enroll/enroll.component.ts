//pending- valuechanges for program not working
import { Component, OnInit,AfterViewInit, signal, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { Observable, firstValueFrom,combineLatest, of, from, BehaviorSubject, Subscription } from 'rxjs';
import { map, switchMap, catchError, shareReplay, distinctUntilChanged, filter, tap, startWith  } from 'rxjs/operators';
import { DataScopeService } from '../../../core/services/datascope.service';
import { PersonlistComponent } from '../../people/personlist/personlist.component';
import { Person } from '../../../core/models/person.model';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { FormlyPrimeNGModule } from '@ngx-formly/primeng';
import { FormschemaService } from '../../../core/services/formschema.service';
import { FormlyFieldProps } from '@ngx-formly/primeng/form-field';
import { ProgramService } from '../../../core/services/program.service';
import { LookupService } from '../../../core/services/lookup.service';
import { FormlySelectModule } from '@ngx-formly/core/select';
import { StudentprofileService } from '../../../core/services/studentprofile.service';
import { StudentProfile, CreateStudentprofileDto } from '../../../core/models/student-profile';
import { Program } from '../../../core/models/program';
import { EnrollService } from '../../../core/services/enroll.service';
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
//     tenantId?: string; // Required for CreateUserDto, optional otherwise
// }

interface UserFormModel extends Partial<User> {
    passwordChange?: boolean; // Frontend-only flag for password change
    personId?: number; // To store the selected person's ID
    person?: Person; // To store the selected person object
    password?:string;
    roleNameInContext?:string;
}

interface UserWithRole extends User{
       roleNameInContext?: string; // This property is now directly on the user object
  }
  
// Define a simple interface for your lookup options
interface LookupOption {
    label: string;
    value: string | number;
  }
  

@Component({
  selector: 'app-enroll',
  standalone: true,
  // ... (imports and providers) ...imported yes
imports: [ReactiveFormsModule,FormsModule,FormlyModule,FormlyPrimeNGModule, FormlySelectModule,
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
      PersonlistComponent
  ],
providers:[MessageService,ConfirmationService,DatePipe],
  templateUrl: './enroll.component.html',
  styleUrl: './enroll.component.scss'
})
export class EnrollComponent {
    activeTenantId!:string|null;

    form = new FormGroup({});
    
    model: any = {
        // It's good practice to initialize all model properties to avoid this kind of issue
        
        completionDate: null,
        enrollmentDate: null,
        ProgramId: null,
        PersonId:null
      };
    //formFields!: Observable<FormlyFieldConfig[]|null>; 
    //formFields!: FormlyFieldConfig[]|null; 
    //formFields!:any;
    formFields!: Observable<FormlyFieldConfig[]|null>;
    //formFields!:FormlyFieldConfig<FormlyFieldProps & { [additionalProperties: string]: any; }>[]|null;

   // formFields!: FormlyFieldConfig<FormlyFieldProps & { [additionalProperties: string]: any; }[]>;//FormlyFieldConfig<FormlyFieldProps & { [additionalProperties: string]: any; }>[] = [];
     // formFields!:Observable<FormlyFieldConfig<FormlyFieldProps & {        [additionalProperties: string]: any;    }>[]>          
      //formFields: Observable<any[]>=[];// FormlyFieldConfig<FormlyFieldProps & { [additionalProperties: string]: any; }>[] = [];

     
  //pls remove below
  isButtonDisabled: boolean = true;

//  isButtonDisabled$!: Observable<boolean>;
enrolls$!: Observable<UserDisplayModel[]>;

  userDialog: boolean = false;
  users = signal<UserDisplayModel[]>([]);//users = signal<User[]>([]);
  user: UserFormModel = {}; // <--- THIS IS CRUCIAL: Type is UserFormModel now
  
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
tenantIdFromusercontext!:string;
private subscriptions = new Subscription();

  constructor(
    private formschemaService:FormschemaService,
      private usercontextService:UserContextService,
      private userService: UserService,
      private studprofileService:StudentprofileService,
      private lookupService:LookupService,
      private programService:ProgramService,
      private enrollService:EnrollService,
      private messageService: MessageService,
      private permissionsService: NgxPermissionsService, 
      private confirmationService: ConfirmationService,
      public authService:AuthService,
      private dataScopeService:DataScopeService,private datePipe: DatePipe
  
  ) {
    
    
    this.usercontextService.currentUserProfile$.pipe(
      distinctUntilChanged(),
      filter((cuser:any) => cuser!=null),
    ).subscribe(cuser=>{
            this.currentUser=cuser; 
            
            this.tenantIdFromusercontext=this.currentUser?.tenantId!
          
            this.loadEnrollments();
   })
  }

 
 
  async   ngOnInit() {

    this.activeTenantId=  this.authService.getTenantId();
    this.model.TenantId= this.activeTenantId;
    //Load json forform from backend -------------------------------------
    var whichForm='student-enrollment';
    this.formFields=
       this.formschemaService.getFormschema(whichForm).pipe(
        tap((fields:FormlyFieldConfig[]) => {


            // Find the 'select' fields by their key or type and populate options
            const programField = fields.find((field:any) => field.key === 'ProgramId');
            programField!.props = programField?.props || {};
            var tenantId=this.activeTenantId;
            programField!.props!.options =  this.lookupService.getPrograms(tenantId!);


        }),
        (res:any)=> {
            
            return res;}
        
      )
    }
  
    setupCompletionDateCalculation(): void { 
      const enrollDateControl = this.form.get('enrollmentDate');
      const programIdControl = this.form.get('ProgramId');
      const completionDateControl = this.form.get('completionDate'); 
const firstNameControl=this.form.get('firstName');

      if (!programIdControl ) {
        console.error("Missing form controls:programIdControl for completion date calculation.");
        return;
      }if (!enrollDateControl ) {
        console.error("Missing form controls:enrollDateControl for completion date calculation.");
        return;
      }  if (!completionDateControl) {
        console.error("Missing form controls:completionDateControl for completion date calculation.");
        return;
      }
     
      
      this.subscriptions.add(
        combineLatest([
           
          enrollDateControl.valueChanges.pipe(distinctUntilChanged()), 
          programIdControl.valueChanges.pipe(distinctUntilChanged())
       //   StudentProfileIdControl.valueChanges.pipe(distinctUntilChanged())
        ]).pipe(
          filter(([enrollDate,programId]) => !!enrollDate && !!programId),
          switchMap(([enrollDate,programId]) => {
            console.log(`> ProgramId changed to ${programId}. Fetching program data...`);
            return this.programService.getById(programId!, this.activeTenantId!).pipe(
              map(aProgram => {
                if (aProgram && aProgram.durationMonths) {
                  const enrollmentDate = new Date(enrollDate);
                  const calculatedCompletionDate = new Date(enrollmentDate);
                  calculatedCompletionDate.setMonth(enrollmentDate.getMonth() + aProgram.durationMonths);

                 

                  return calculatedCompletionDate;
                } 
                  

                return null;
              })
            );
          })
        ).subscribe(calculatedDate => {
          // --- THE PRACTICAL FIX IS HERE ---
          // Use a type assertion to 'any' on the form control to bypass the TypeScript error.
          if (calculatedDate) {
           //precaution-: here date is formatted in yyyy-MM-dd, but need to check what else can be done
            const formattedDate = this.datePipe.transform(calculatedDate, 'yyyy-MM-dd');
            console.log('...........Setting completionDate to:', formattedDate);
            (completionDateControl as any).patchValue(formattedDate);         

          } else {
            (completionDateControl as any).patchValue(null);
          }
        })
      );
    }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  
  
  // --- New Getters to simplify HTML conditions ---
  get dialogHeader(): string {
      return (this.user && this.user.id) ? 'Edit User' : 'New Enrollment'; // Direct access to user.id
  }

  get isExistingUser(): boolean {
      return !!this.user && typeof this.user.id !== 'undefined'; // Direct access to user.id
  }
  // --- End New Getters ---

loadEnrollments():void{
  
// --- MODIFIED: Load users using DataScopeService ---
      // Define the base URL and all possible view permissions for user list
      const userListBasePath = '/enroll'; // Your backend API endpoint for users
      // These are the *permissions* that grant view access to different *types* of users
   //   const userViewPermissions = ['Student', 'Faculty', 'Coordinator', 'InstituteAdmin', 'all', 'createdBySelf'];
   const userViewPermissions = ['Student', 'Faculty', 'Coordinator','AdmissionsOfficer', 'InstituteAdmin','StudentSolo','Assessor','ClassTeacher','ClassStudent'];

      this.enrolls$ = this.dataScopeService.getScopedListUrl(
          userListBasePath,
          'enroll.view.', // The prefix for view permissions
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
                              canEdit$:of(true),//this.getCanEditObservable(userBackend),
                              canDelete$: of(true)//this.getCanDeleteObservable(userBackend)
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
  
  
  // Helper function to create the canEdit$ observable for a given user
  //logic  User type is extended by adding one more property 'roleNameInContext'
  //logic contra tag:roleNameInContext extra field
  private getCanEditObservable(userToEdit: UserWithRole): Observable<boolean> {
           
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

    //precaution-: below method is running eevry click of New Enrollment button, is it really necessary, if not then run this only once
    this.setupCompletionDateCalculation()
    

      this.user = { roleNameInContext:  '',tenantId:this.tenantIdFromusercontext as any, passwordChange: true };
      this.submitted = false;
      this.selectedPerson = null; // Clear any previously selected person
      this.initialPersonSearchCriteria = {}; // Clear initial search criteria

      // Open the Person selection dialog first
      this.personSelectionDialogVisible = true;
  }

  // --- NEW: Method to handle person selection from PersonlistComponent ---
  onPersonSelected(person: Person): void { alert('aa')
      this.selectedPerson = person;
      this.personSelectionDialogVisible = false; // Close the person selection dialog

      // Pre-fill  form with selected person's data
   
        var studentprofile=this.studprofileService.getStudentprofile_byIdOrPersonId(person.id,'byPersonId',this.activeTenantId!);
        studentprofile.subscribe({
            
            next: (profile) => {
            // The `profile` variable is the StudentProfile object or `null`

 
            if (profile) {
              // patch id to form StudentProfileId
                this.form.patchValue({ PersonId: person.id});  this.form.patchValue({ StudentProfileId: profile.id});
            } else {
                console.log('No student profile found for this person.');  
             
          var studprofile=   this.createstudentprofile(person.id ,'Enrolled',new Date())
                
                this.form.patchValue({ StudentProfileId: studprofile.subscribe(profile=>{
                    alert('......yes profile created ');
                    this.form.patchValue({ PersonId: person.id});  this.form.patchValue({ StudentProfileId: profile.id});
                })});
            }
            },
            error: (error: any) => { console.log(' ........i got error with status:',error);
             },
            // error: (err) => {
            // console.error('Error fetching student profile:', err);
            // this.form.patchValue({ StudentProfileId: null});
            // }
            
        })


     
      //this.form.get('firstName')?.patchValue(`${person.firstName} ${person.lastName || ''}`.trim());
      this.form.patchValue({ firstName: person.firstName, lastName:person.lastName});

      // Now open the main user dialog
      this.userDialog = true;
  }
  // --- END NEW ---
  createstudentprofile(personid:number, enrollmentStatus:string , enrollmentDate:Date):Observable<StudentProfile>{
        var newStudentProfile:CreateStudentprofileDto={tenantId:this.activeTenantId!,personId:personid,
            enrollmentDate:enrollmentDate,enrollmentStatus:enrollmentStatus}
      return  this.studprofileService.createStudentprofile(newStudentProfile)
  }


  hideDialog(): void {
      this.userDialog = false;
      this.submitted = false;
      this.personSelectionDialogVisible = false; // Ensure person selection dialog is also hidden
  }
  


  onSubmit(){console.log('submitting.................');
  //precaution- We hardcode status as Active but rethink here
  this.model.status="Active";
    if (this.form.valid) {
        console.log(this.model);
        // Send submitted data to backend
       // this.model={...this.model,createdByUserId:this.authService.getUserId()}
        this.enrollService.createEnrollment(this.model).subscribe()
        //this.http.post('/api/form-data/student-enrollment', this.model).subscribe();
      }
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