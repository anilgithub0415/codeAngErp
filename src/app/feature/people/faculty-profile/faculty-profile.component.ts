
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
import { CourseService } from '../../../core/services/course.service'; // Angular-side CourseService
import { Course, CreateCourseDto, UpdateCourseDto  } from '../../../core/models/course.model'; // Course interfaces/DTOs
import {FacultyProfile,CreateFacultyProfileDto,UpdateFacultyProfileDto} from '../../../core/models/faculty-profile'


import { AuthService } from '../../../core/services/auth.service';
import { NgxPermissionsModule, NgxPermissionsService } from 'ngx-permissions';
import { Observable, firstValueFrom,combineLatest, of, from, BehaviorSubject, Subscription } from 'rxjs';
import { map, switchMap, catchError, shareReplay, distinctUntilChanged, filter, tap, startWith  } from 'rxjs/operators';
import { DataScopeService } from '../../../core/services/datascope.service';
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
import { UserContextService } from '../../../core/services/user-context.service';
import { User } from '../../../core/models/user.model';
import { FacultyprofileService } from '../../../core/services/facultyprofile.service';
      // Interfaces for PrimeNG Table columns
interface Column {
  field: string;
  header: string;
  customExportHeader?: string;
}       
export interface FacultyProfileDisplayModel extends FacultyProfile {
  canEdit$: Observable<boolean>;
  canDelete$: Observable<boolean>;
}


@Component({
  selector: 'app-faculty-profile',
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
      NgxPermissionsModule,ToastModule
      
  ],
providers:[MessageService,ConfirmationService,DatePipe],
  templateUrl: './faculty-profile.component.html',
  styleUrl: './faculty-profile.component.scss'
})
export class FacultyProfileComponent {

  activeTenantId!:string|null;

  form = new FormGroup({});
  
  model: any = {
      // It's good practice to initialize all model properties to avoid this kind of issue
  
      personname:null,
      employeeIdNumber:null,
      
    };
  //formFields!: Observable<FormlyFieldConfig[]|null>; 
  //formFields!: FormlyFieldConfig[]|null; 
  //formFields!:any;
  formFields!: Observable<FormlyFieldConfig[]|null>;
  facultyprofile!: Partial<FacultyProfileDisplayModel>;
  currentUser: User | null = null; 
  tenantIdFromusercontext!:string;
    facultyprofiles$!: Observable<FacultyProfileDisplayModel[]>;
    
    submitted: boolean = false;
    initialPersonSearchCriteria: { email?: string; phone?: string; firstName?: string; lastName?: string; zipCode?: string; } = {};
    facultyprofileDialog: boolean = false;
    
  @ViewChild('dt') dt!: Table;
    cols!: Column[];selectedUsers: User[] | null = null;
    isExistingUser: boolean=false;
    facultyprofileId: number | null = null; 

    constructor(private usercontextService:UserContextService,
      private facultyprofileService:FacultyprofileService,
      public authService:AuthService,
      private formschemaService:FormschemaService,
      private lookupService:LookupService,
      private confirmationService: ConfirmationService,
      private messageService: MessageService,
      private permissionsService: NgxPermissionsService, ){
    
      
    this.usercontextService.currentUserProfile$.pipe(
      distinctUntilChanged(),
      filter((cuser:any) => cuser!=null),
    ).subscribe(cuser=>{
            this.currentUser=cuser; 
            
            this.tenantIdFromusercontext=this.currentUser?.tenantId!
          
            this.loadFacultyProfiles(this.tenantIdFromusercontext!);
   })
    }

    async   ngOnInit() {

      this.activeTenantId=  this.authService.getTenantId();
      this.model.tenantId= this.activeTenantId;
      //Load json forform from backend -------------------------------------
      var whichForm='facultyprofile';
      this.formFields=
         this.formschemaService.getFormschema(whichForm).pipe(
          tap((fields:FormlyFieldConfig[]) => {
  
  
            //   // Find the 'select' fields by their key or type and populate options
            // const personField = fields.find((field:any) => field.key === 'personId');
            // personField!.props = personField?.props || {};
            // var tenantId=this.activeTenantId;
             //personField!.props!.options =  this.lookupService.getPrograms(this.activeTenantId!);
  
             //const personnameField = fields.find((field:any) => field.key === 'personname');

  
          }),
          (res:any)=> {
              
              return res;}
          
        )
          }
          // --- New Getters to simplify HTML conditions ---
  get dialogHeader(): string {
    return (this.facultyprofile && this.facultyprofile.id) ? 'Edit FacultyProfile' : 'FacultyProfile'; // We are not allowing to edit Faculty Profile thats why header is changed
}

    loadFacultyProfiles(ptenantId:string):void{
      this.facultyprofiles$=this.facultyprofileService.getFacultyProfiles(ptenantId).pipe(
        
        map((data: FacultyProfile[]) => { // Map backend data to UserDisplayModel
          return data.map(facultyprofileBackend => {
          const facultyprofileDisplay: FacultyProfileDisplayModel = {
              ...facultyprofileBackend,
              canEdit$:this.getCanEditObservable(facultyprofileBackend),
              canDelete$: this.getCanDeleteObservable(facultyprofileBackend)
          };
          return facultyprofileDisplay;
      });
    })
      )
    }
 // Helper function to create the canEdit$ observable for a given facultyprofile
    //logic  User type is extended by adding one more property 'roleNameInContext'
    //logic contra tag:roleNameInContext extra field
    private getCanEditObservable(facultyprofileToEdit: FacultyProfile): Observable<boolean> {
      
      if (!facultyprofileToEdit ) {
          return of(false);
      }

      const thisiscreatedBy=facultyprofileToEdit.createdByUserId;

      return combineLatest([
          from(this.permissionsService.hasPermission('facultyprofile.edit.created_by_self')).pipe(catchError(() => of(false))),
          from(this.permissionsService.hasPermission('facultyprofile.edit')).pipe(catchError(() => of(false))),

          // Add other specific edit permissions as needed
          // For 'facultyprofile.edit.created_by_self':
          // from(this.permissionsService.hasPermission('facultyprofile.edit.created_by_self')).pipe(
          //     map(hasPerm => hasPerm && this.authService.getUserId() === facultyprofileToEdit.createdByUserId), // You need createdByUserId in FacultyProfileBackendModel
          //     catchError(() => of(false))
          // )
      ]).pipe(
          map(([canEditFacultyProfilecreated_by_self,canEditFacultyProfile, ]) => {
           
              if  (this.authService.getUserId()===facultyprofileToEdit.id) //his own record
              { return true;  } //whatever may be facultyprofiletoedit  loggedin facultyprofile's record must be editable by himself
              if (canEditFacultyProfilecreated_by_self && (this.authService.getUserId()===thisiscreatedBy)) //createdby currentfacultyprofile
              {
                  return true;
              }
              if ( canEditFacultyProfile)  {    return true;   }
             

              return false;

          }),
          catchError(err => {
              console.error('Error calculating canEditObservable:', err);
              return of(false);
          })
      );
  }
    
    // Helper function to create the canDelete$ observable for a given facultyprofile
    private getCanDeleteObservable(facultyprofileToDelete: FacultyProfile): Observable<boolean> {
      if (!facultyprofileToDelete ) {
          return of(false);
      }

      const thisiscreatedBy=facultyprofileToDelete.createdByUserId;

      return combineLatest([
          from(this.permissionsService.hasPermission('facultyprofile.delete.created_by_self')).pipe(catchError(() => of(false))),
          from(this.permissionsService.hasPermission('facultyprofile.delete')).pipe(catchError(() => of(false))),
      ]).pipe(
          map(([canDeleteStudentcreated_by_self,canDeleteFacultyProfile]) => {
              if  (this.authService.getUserId()===facultyprofileToDelete.id) //his own record
              { return false;  } //whatever may be facultyprofiletodelete  loggedin facultyprofile's record must be not be deleted by himself
          //pending: 1. let run this delete logic in more conditional way and 2. need to find a way a assessor is dealing with other studentsolo 

              if (canDeleteStudentcreated_by_self && (this.authService.getUserId()===thisiscreatedBy)) //createdby currentfacultyprofile
              {
                  return true;
              }  
              if ( canDeleteFacultyProfile) {
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
 
  onSubmit(){console.log('submitting.................');
  //precaution- We hardcode status as Active but rethink here
  this.model.status="Active";
    if (this.form.valid) {
        console.log(this.model);
        var sub1;var msg_FacultyProfileCreatedOrUpdated:string='';
        if(this.isExistingUser){
        msg_FacultyProfileCreatedOrUpdated= 'FacultyProfile Updated';
        sub1=   this.facultyprofileService.updateFacultyProfile(this.facultyprofileId!,this.model); }
        else{
          msg_FacultyProfileCreatedOrUpdated= 'FacultyProfile Added'
        sub1=this.facultyprofileService.createFacultyProfile(this.model)
        }
       sub1!.subscribe({
            next: () => {
              this.loadFacultyProfiles(this.tenantIdFromusercontext!);//  this.loadFacultyProfiles(this.currentFacultyProfile?.tenantId!); // Reload users after successful deletion
              this.facultyprofileDialog=false;
                this.facultyprofile = {}; // Clear the form
                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail:msg_FacultyProfileCreatedOrUpdated,
                    life: 3000
                });
            },
            error: (err:any) => {
                console.error('Error updating facultyprofile:', err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to update facultyprofile.',
                    life: 3000
                });
            }
        });
       
        //this.http.post('/api/form-data/student-enrollment', this.model).subscribe();
      }
      else{console.log('invalid form');
      }
  }
    
    /**
     * Deletes a single user after confirmation.
     * @param user The user object to delete.
     */
    deleteFacultyProfile(facultyprofile: FacultyProfile): void {
    
      this.confirmationService.confirm({
        //pending- static code
        //          message: `Are you sure you want to delete facultyprofile ${facultyprofile.facultyprofileName}? This action cannot be undone.`,
        message: `Are you sure you want to delete facultyprofile: somethinghere? This action cannot be undone.`,
          header: 'Confirm Deletion',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
              this.facultyprofileService.deleteFacultyProfile(facultyprofile.id).subscribe({
                  next: () => {
                    this.loadFacultyProfiles(this.tenantIdFromusercontext!);//  this.loadFacultyProfiles(this.currentFacultyProfile?.tenantId!); // Reload users after successful deletion
                      this.facultyprofile = {}; // Clear the form
                      this.messageService.add({
                          severity: 'success',
                          summary: 'Successful',
                          detail: 'FacultyProfile Deleted',
                          life: 3000
                      });
                  },
                  error: (err:any) => {
                      console.error('Error deleting facultyprofile:', err);
                      this.messageService.add({
                          severity: 'error',
                          summary: 'Error',
                          detail: 'Failed to delete facultyprofile.',
                          life: 3000
                      });
                  }
              });
          }
      });
  }

  
  openNew(): void {   //earlier was : { rolename: '' }
this.model={};
  this.isExistingUser=false;
  this.model.tenantId=this.activeTenantId;
      //this.user = { roleNameInContext:  '',tenantId:this.tenantIdFromusercontext as any, passwordChange: true };
      this.submitted = false;
            

      // Open the Person selection dialog first
      this.facultyprofileDialog = true;
  }


 /**
   * Handles global filtering for the PrimeNG table.
   * @param table The PrimeNG Table instance.
   * @param event The input event.
   */
 onGlobalFilter(table: Table, event: Event) {
  table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
}
editFacultyProfile(facultyprofile: FacultyProfile): void {
  this.facultyprofileId=facultyprofile.id;
 this.isExistingUser=true;
  
  this.form.patchValue(facultyprofile);this.form.patchValue({personname:facultyprofile.person.firstName+' '+facultyprofile.person.lastName})
  
  this.submitted = false;
  this.facultyprofileDialog = true;
}

hideDialog(): void {
  this.facultyprofileDialog = false;
  this.submitted = false;
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
