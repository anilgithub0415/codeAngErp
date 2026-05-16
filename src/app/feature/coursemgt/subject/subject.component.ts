
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
import { SubjectService } from '../../../core/services/subject.service'; // Angular-side SubjectService
import { Subject, CreateSubjectDto, UpdateSubjectDto  } from '../../../core/models/subject.model'; // Subject interfaces/DTOs


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
      // Interfaces for PrimeNG Table columns
      interface Column {
        field: string;
        header: string;
        customExportHeader?: string;
      }       
      export interface SubjectDisplayModel extends Subject {
        canEdit$: Observable<boolean>;
        canDelete$: Observable<boolean>;
      }
      
@Component({
  selector: 'app-subject',
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
  templateUrl: './subject.component.html',
  styleUrl: './subject.component.scss'
})
export class SubjectComponent {

  activeTenantId!:string|null;

  form = new FormGroup({});
  
  model: any = {
      // It's good practice to initialize all model properties to avoid this kind of issue
      
      subjectCode: null,
      subjectName: null,
      //isActive:false,
    };
  //formFields!: Observable<FormlyFieldConfig[]|null>; 
  //formFields!: FormlyFieldConfig[]|null; 
  //formFields!:any;
  formFields!: Observable<FormlyFieldConfig[]|null>;
  subject!:Partial<SubjectDisplayModel>;
  

  currentUser: User | null = null; 
  tenantIdFromusercontext!:string;
    subjects$!: Observable<SubjectDisplayModel[]>;
    
    submitted: boolean = false;
    initialPersonSearchCriteria: { email?: string; phone?: string; firstName?: string; lastName?: string; zipCode?: string; } = {};
    subjectDialog: boolean = false;
    
  @ViewChild('dt') dt!: Table;
    cols!: Column[];selectedUsers: User[] | null = null;
    isExistingUser: boolean=false;
    subjectId: number | null = null; 

    constructor(private usercontextService:UserContextService,
      private subjectService:SubjectService,
      public authService:AuthService,
      private formschemaService:FormschemaService,      
      private confirmationService: ConfirmationService,
      private messageService: MessageService,
      private permissionsService: NgxPermissionsService, ){
    
      
    this.usercontextService.currentUserProfile$.pipe(
      distinctUntilChanged(),
      filter((cuser:any) => cuser!=null),
    ).subscribe(cuser=>{
            this.currentUser=cuser; 
            
            this.tenantIdFromusercontext=this.currentUser?.tenantId!
          
            this.loadSubjects(this.tenantIdFromusercontext!);
   })
    }

    async   ngOnInit() {

      this.activeTenantId=  this.authService.getTenantId();
      this.model.tenantId= this.activeTenantId;
      //Load json forform from backend -------------------------------------
      var whichForm='subject';
      this.formFields=
         this.formschemaService.getFormschema(whichForm).pipe(
          tap((fields:FormlyFieldConfig[]) => {
  
  
              // // Find the 'select' fields by their key or type and populate options
              // const programField = fields.find((field:any) => field.key === 'ProgramId');
              // programField!.props = programField?.props || {};
              // var tenantId=this.activeTenantId;
              // programField!.props!.options =  this.lookupService.getPrograms(tenantId!);
  
  
          }),
          (res:any)=> {
              
              return res;}
          
        )
          }
                 // --- New Getters to simplify HTML conditions ---
  get dialogHeader(): string {
    return (this.subject && this.subject.id) ? 'Edit Subject' : 'New Subject'; // Direct access to user.id
}
    loadSubjects(ptenantId:string):void{
      this.subjects$=this.subjectService.getSubjects(ptenantId).pipe(
        
        map((data: Subject[]) => { // Map backend data to UserDisplayModel
          return data.map(subjectBackend => {
          const subjectDisplay: SubjectDisplayModel = {
              ...subjectBackend,
              canEdit$:this.getCanEditObservable(subjectBackend),
              canDelete$: this.getCanDeleteObservable(subjectBackend)
          };
          return subjectDisplay;
      });
    })
      )
    }

    
 // Helper function to create the canEdit$ observable for a given subject
    //logic  User type is extended by adding one more property 'roleNameInContext'
    //logic contra tag:roleNameInContext extra field
    private getCanEditObservable(subjectToEdit: Subject): Observable<boolean> {
      
      if (!subjectToEdit ) {
          return of(false);
      }

      const thisiscreatedBy=subjectToEdit.createdByUserId;

      return combineLatest([
          from(this.permissionsService.hasPermission('subject.edit.created_by_self')).pipe(catchError(() => of(false))),
          from(this.permissionsService.hasPermission('subject.edit')).pipe(catchError(() => of(false))),

          // Add other specific edit permissions as needed
          // For 'subject.edit.created_by_self':
          // from(this.permissionsService.hasPermission('subject.edit.created_by_self')).pipe(
          //     map(hasPerm => hasPerm && this.authService.getUserId() === subjectToEdit.createdByUserId), // You need createdByUserId in CourseBackendModel
          //     catchError(() => of(false))
          // )
      ]).pipe(
          map(([canEditCoursecreated_by_self,canEditCourse, ]) => {
           
              if  (this.authService.getUserId()===subjectToEdit.id) //his own record
              { return true;  } //whatever may be subjecttoedit  loggedin subject's record must be editable by himself
              if (canEditCoursecreated_by_self && (this.authService.getUserId()===thisiscreatedBy)) //createdby currentsubject
              {
                  return true;
              }
              if ( canEditCourse)  {    return true;   }
             

              return false;

          }),
          catchError(err => {
              console.error('Error calculating canEditObservable:', err);
              return of(false);
          })
      );
  }
    
    // Helper function to create the canDelete$ observable for a given subject
    private getCanDeleteObservable(subjectToDelete: Subject): Observable<boolean> {
      if (!subjectToDelete ) {
          return of(false);
      }

      const thisiscreatedBy=subjectToDelete.createdByUserId;

      return combineLatest([
          from(this.permissionsService.hasPermission('subject.delete.created_by_self')).pipe(catchError(() => of(false))),
          from(this.permissionsService.hasPermission('subject.delete')).pipe(catchError(() => of(false))),
      ]).pipe(
          map(([canDeleteStudentcreated_by_self,canDeleteCourse]) => {
              if  (this.authService.getUserId()===subjectToDelete.id) //his own record
              { return false;  } //whatever may be subjecttodelete  loggedin subject's record must be not be deleted by himself
          //pending: 1. let run this delete logic in more conditional way and 2. need to find a way a assessor is dealing with other studentsolo 

              if (canDeleteStudentcreated_by_self && (this.authService.getUserId()===thisiscreatedBy)) //createdby currentsubject
              {
                  return true;
              }  
              if ( canDeleteCourse) {
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
      var sub1;var msg_SubjectCreatedOrUpdated:string='';
      if(this.isExistingUser){alert('updating subject id:'+this.subjectId!)
      msg_SubjectCreatedOrUpdated= 'Subject Updated';
      sub1=   this.subjectService.updateSubject(this.subjectId!,this.model); }
      else{alert('adding new subject')
        msg_SubjectCreatedOrUpdated= 'Subject Added'
      sub1=this.subjectService.createSubject(this.model)
      }
     sub1!.subscribe({
          next: () => {
            this.loadSubjects(this.tenantIdFromusercontext!);//  this.loadSubjects(this.currentSubject?.tenantId!); // Reload users after successful deletion
            this.subjectDialog=false;
              this.subject = {}; // Clear the form
              this.messageService.add({
                  severity: 'success',
                  summary: 'Successful',
                  detail:msg_SubjectCreatedOrUpdated,
                  life: 3000
              });
          },
          error: (err:any) => {
              console.error('Error updating subject:', err);
              this.messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Failed to update subject.',
                  life: 3000
              });
          }
      });
     
        //this.http.post('/api/form-data/student-enrollment', this.model).subscribe();
      }
  }

  
    /**
     * Deletes a single user after confirmation.
     * @param user The user object to delete.
     */
    deleteSubject(subject: Subject): void {
    console.log('......deleting subject:',subject.id);
    
      this.confirmationService.confirm({
          message: `Are you sure you want to delete subject ${subject.subjectName}? This action cannot be undone.`,
          header: 'Confirm Deletion',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
              this.subjectService.deleteSubject(subject.id).subscribe({
                  next: () => {
                    this.loadSubjects(this.tenantIdFromusercontext!);//  this.loadSubjects(this.currentSubject?.tenantId!); // Reload users after successful deletion
                      this.subject = {}; // Clear the form
                      this.messageService.add({
                          severity: 'success',
                          summary: 'Successful',
                          detail: 'Subject Deleted',
                          life: 3000
                      });
                  },
                  error: (err:any) => {
                      console.error('Error deleting subject:', err);
                      this.messageService.add({
                          severity: 'error',
                          summary: 'Error',
                          detail: 'Failed to delete subject.',
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
    this.subjectDialog = true;
}
    
 /**
   * Handles global filtering for the PrimeNG table.
   * @param table The PrimeNG Table instance.
   * @param event The input event.
   */
 onGlobalFilter(table: Table, event: Event) {
  table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
}

editSubject(subject: Subject): void {
  this.subjectId=subject.id;
 this.isExistingUser=true;
  
  this.form.patchValue(subject);
  
  this.submitted = false;
  this.subjectDialog = true;
}

hideDialog(): void {
  this.subjectDialog = false;
  this.submitted = false;
  
}
/**
 * Exports the table data to CSV.
 */
exportCSV(): void {
  this.dt.exportCSV();
}

}
