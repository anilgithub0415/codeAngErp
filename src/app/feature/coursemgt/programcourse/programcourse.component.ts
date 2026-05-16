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
import { ProgramcourseService } from '../../../core/services/programcourse.service'; // Angular-side ProgramService
import {  CreateProgramCourseDto, UpdateProgramCourseDto, ProgramCourse  } from '../../../core/models/program-courses'; // ProgramCourse interfaces/DTOs


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

import { LookupService } from '../../../core/services/lookup.service';
import { FormlySelectModule } from '@ngx-formly/core/select';
import { StudentprofileService } from '../../../core/services/studentprofile.service';
import { StudentProfile, CreateStudentprofileDto } from '../../../core/models/student-profile';
import { EnrollService } from '../../../core/services/enroll.service';
import { UserContextService } from '../../../core/services/user-context.service';
import { User } from '../../../core/models/user.model';
import { ProgramService } from '../../../core/services/program.service';
import { Program } from '../../../core/models/program';
import { CardModule } from 'primeng/card';
      // Interfaces for PrimeNG Table columns
interface Column {
  field: string;
  header: string;
  customExportHeader?: string;
}       
export interface ProgramCourseDisplayModel extends ProgramCourse {
  canEdit$: Observable<boolean>;
  canDelete$: Observable<boolean>;
}


@Component({
  selector: 'app-programcourse',
  standalone: true,
  
  // ... (imports and providers) ...imported yes
imports: [ReactiveFormsModule,FormsModule,FormlyModule,FormlyPrimeNGModule, FormlySelectModule,
      CommonModule,
      FormsModule,CardModule,
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
  templateUrl: './programcourse.component.html',
  styleUrl: './programcourse.component.scss'
})
export class ProgramcourseComponent {


  programs$!: Observable<Program[]>;
  selectedProgram: Program | null = null;
  // This is what the p-table expects: an array of ProgramCourse objects or null.
selectedProgramCourses$: Observable<any[] | null> = of(null);
 // A subject to hold the currently selected program and trigger a new API call
 private selectedProgramSubject = new BehaviorSubject<ProgramCourse | null>(null);

  activeTenantId!:string|null;

  form = new FormGroup({});
  
  model: any = {
      // It's good practice to initialize all model properties to avoid this kind of issue
      programId:null,    
      courseId: null,
      orderInProgram: null,
    };
  //formFields!: Observable<FormlyFieldConfig[]|null>; 
  //formFields!: FormlyFieldConfig[]|null; 
  //formFields!:any;
  formFields!: Observable<FormlyFieldConfig[]|null>;
  programcourse!: Partial<ProgramCourseDisplayModel>;
  currentUser: User | null = null; 
  tenantIdFromusercontext!:string;
    programCourses$!: Observable<ProgramCourseDisplayModel[]>;
    
    submitted: boolean = false;
    initialPersonSearchCriteria: { email?: string; phone?: string; firstName?: string; lastName?: string; zipCode?: string; } = {};
    ProgramCourseDialog: boolean = false;
    
  @ViewChild('dt') dt!: Table;
    cols!: Column[];
    courseCols!:Column[];
    selectedUsers: User[] | null = null;
    isExistingUser: boolean=false;
    ProgramCourseId: number | null = null; 

    constructor(private usercontextService:UserContextService,
      private programService: ProgramService  ,
      private ProgramCourseService:ProgramcourseService,
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
          
          //  this.loadProgramCourses(this.tenantIdFromusercontext!);
   })
    }

    async   ngOnInit() {

      this.activeTenantId=  this.authService.getTenantId();
      this.model.tenantId= this.activeTenantId;
      //Load json forform from backend -------------------------------------
      var whichForm='programcourse';
      this.formFields=
         this.formschemaService.getFormschema(whichForm).pipe(
          tap((fields:FormlyFieldConfig[]) => {
  
             const programField = fields.find((field:any) => field.key === 'programId');
             programField!.props = programField?.props || {};
             var tenantId=this.activeTenantId;
             programField!.props!.options =  this.lookupService.getPrograms(tenantId!);
             
             const courseField = fields.find((field:any) => field.key === 'courseId');
             courseField!.props = courseField?.props || {};
             var tenantId=this.activeTenantId;
             courseField!.props!.options =  this.lookupService.getCourses(tenantId!);
  
          }), 
          (res:any)=> {
              
              return res;}
          
        )
        //end loading json for form--------------------------------

        //---load programs
         // Master Table: Fetch all programs
    this.programs$ = this.programService.getPrograms(this.activeTenantId!);
        //--end loading programs
        //
          // Detail Table: Listen for selected program changes and fetch its courses
 
          this.selectedProgramCourses$ = this.selectedProgramSubject.asObservable().pipe(
            switchMap(program => {
              if (!program) {
                return of(null); // Return null if no program is selected
              }
              
              // Call the service, and then map the single returned course into a single-item array.
              return this.ProgramCourseService.getById(program.id, this.activeTenantId!).pipe(
                tap(data => console.log('Data before map:', data)),
                map(programcourse =>  programcourse ? programcourse : []) // Correctly handle null //programcourse ? [programcourse] : []
              );
            })
    );

    // Define columns for the Program table
    this.cols = [
      { field: 'programName', header: 'Program' },
      { field: 'programCode', header: 'Code' }
    ];

    // Define columns for the Courses table
    this.courseCols = [
        { field: 'course.courseName', header: 'Course' },
        { field: 'orderInProgram', header: 'Order' }
    ];
        //

        
          }

          onProgramSelect(event: any) {
            console.log('event.data:',event.data);
            
            this.selectedProgram = event.data;
            this.selectedProgramSubject.next(event.data);
          }
        
          
          // --- New Getters to simplify HTML conditions ---
  get dialogHeader(): string {
    return (this.programcourse && this.programcourse.id) ? 'Edit ProgramCourse' : 'New ProgramCourse'; // Direct access to user.id
}

    // loadProgramCourses(ptenantId:string):void{
    //   this.programCourses$=this.ProgramCourseService.getProgramCourses(ptenantId).pipe(
        
    //     map((data: ProgramCourse[]) => { // Map backend data to UserDisplayModel
    //       return data.map(ProgramCourseBackend => {
    //       const programcourseDisplay: ProgramCourseDisplayModel = {
    //           ...ProgramCourseBackend,
    //           canEdit$:this.getCanEditObservable(ProgramCourseBackend),
    //           canDelete$: this.getCanDeleteObservable(ProgramCourseBackend)
    //       };
    //       return programcourseDisplay;
    //   });
    // })
    //   )
    // }

 // Helper function to create the canEdit$ observable for a given program
    //logic  User type is extended by adding one more property 'roleNameInContext'
    //logic contra tag:roleNameInContext extra field
    private getCanEditObservable(programcourseToEdit: ProgramCourse): Observable<boolean> {
      
      if (!programcourseToEdit ) {
          return of(false);
      }

      const thisiscreatedBy=programcourseToEdit.createdByUserId;

      return combineLatest([
          from(this.permissionsService.hasPermission('programcourse.edit.created_by_self')).pipe(catchError(() => of(false))),
          from(this.permissionsService.hasPermission('programcourse.edit')).pipe(catchError(() => of(false))),

          // Add other specific edit permissions as needed
          // For 'program.edit.created_by_self':
          // from(this.permissionsService.hasPermission('program.edit.created_by_self')).pipe(
          //     map(hasPerm => hasPerm && this.authService.getUserId() === programToEdit.createdByUserId), // You need createdByUserId in ProgramBackendModel
          //     catchError(() => of(false))
          // )
      ]).pipe(
          map(([canEditProgramCoursecreated_by_self,canEditProgramCourse, ]) => {
           
              if  (this.authService.getUserId()===programcourseToEdit.id) //his own record
              { return true;  } //whatever may be programtoedit  loggedin program's record must be editable by himself
              if (canEditProgramCoursecreated_by_self && (this.authService.getUserId()===thisiscreatedBy)) //createdby currentprogram
              {
                  return true;
              }
              if ( canEditProgramCourse)  {    return true;   }
             

              return false;

          }),
          catchError(err => {
              console.error('Error calculating canEditObservable:', err);
              return of(false);
          })
      );
  }
    
    // Helper function to create the canDelete$ observable for a given ProgramCourse
    private getCanDeleteObservable(programcourseToDelete: ProgramCourse): Observable<boolean> {
      if (!programcourseToDelete ) {
          return of(false);
      }

      const thisiscreatedBy=programcourseToDelete.createdByUserId;

      return combineLatest([
          from(this.permissionsService.hasPermission('program.delete.created_by_self')).pipe(catchError(() => of(false))),
          from(this.permissionsService.hasPermission('program.delete')).pipe(catchError(() => of(false))),
      ]).pipe(
          map(([canDeleteProgramCoursecreated_by_self,canDeleteProgramCourse]) => {
              if  (this.authService.getUserId()===programcourseToDelete.id) //his own record
              { return false;  } //whatever may be programtodelete  loggedin program's record must be not be deleted by himself
          //pending: 1. let run this delete logic in more conditional way and 2. need to find a way a assessor is dealing with other studentsolo 

              if (canDeleteProgramCoursecreated_by_self && (this.authService.getUserId()===thisiscreatedBy)) //createdby currentprogram
              {
                  return true;
              }  
              if ( canDeleteProgramCourse) {
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
        var sub1;var msg_ProgramCourseCreatedOrUpdated:string='';
        if(this.isExistingUser){
          msg_ProgramCourseCreatedOrUpdated= 'Program Updated';
        sub1=   this.ProgramCourseService.updateProgramcourse(this.ProgramCourseId!,this.model); }
        else{
          console.log('model:',+this.model);
          
          msg_ProgramCourseCreatedOrUpdated= 'Program Course Added'
        sub1=this.ProgramCourseService.createProgramcourse(this.model)
        }
       sub1!.subscribe({
            next: (res) => {
            //  this.loadProgramCourses(this.tenantIdFromusercontext!);//  this.loadProgramCourses(this.currentProgram?.tenantId!); // Reload users after successful deletion
            this.selectedProgramSubject.next(res  );
              this.ProgramCourseDialog=false;
                this.programcourse = {}; // Clear the form
                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail:msg_ProgramCourseCreatedOrUpdated,
                    life: 3000
                });
            },
            error: (err:any) => {
                console.error('Error updating program Course:', err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to update program Course.',
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
    deleteProgramCourse(programcourse: ProgramCourse): void {
    
      this.confirmationService.confirm({ //pending-courseId is used but use descriptive property below
          message: `Are you sure you want to delete program Course ${programcourse.courseId}? This action cannot be undone.`,
          header: 'Confirm Deletion',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
              this.ProgramCourseService.deleteProgramCourse(programcourse.id).subscribe({
                  next: () => {
                 //   this.loadProgramCourses(this.tenantIdFromusercontext!);//  this.loadProgramCourses(this.currentProgram?.tenantId!); // Reload users after successful deletion
                      this.programcourse = {}; // Clear the form
                      this.messageService.add({
                          severity: 'success',
                          summary: 'Successful',
                          detail: 'Program Course Deleted',
                          life: 3000
                      });
                  },
                  error: (err:any) => {
                      console.error('Error deleting program Course:', err);
                      this.messageService.add({
                          severity: 'error',
                          summary: 'Error',
                          detail: 'Failed to delete program Course.',
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
      
      
      this.model.programId=this.selectedProgram?.id;
      
      // Open the Person selection dialog first
      this.ProgramCourseDialog = true;
  }


 /**
   * Handles global filtering for the PrimeNG table.
   * @param table The PrimeNG Table instance.
   * @param event The input event.
   */
 onGlobalFilter(table: Table, event: Event) {
  table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
}
editProgramCourse(programcourse: ProgramCourse): void {
  this.ProgramCourseId=programcourse.id;
 this.isExistingUser=true;
  
  this.form.patchValue(programcourse);
  
  this.submitted = false;
  this.ProgramCourseDialog = true;
}

hideDialog(): void {
  this.ProgramCourseDialog = false;
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

