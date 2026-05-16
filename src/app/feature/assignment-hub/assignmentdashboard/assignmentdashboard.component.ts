
import { Component, OnInit,AfterViewInit, signal, ViewChild, inject, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
//import { Observable, firstValueFrom } from 'rxjs'; // For handling Observable to Promise conversion
import { formatDate } from '@angular/common';
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
import { Assignment } from '../../../core/models/assignment';

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
import { AssignmentService } from '../../../core/services/assignment.service';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
      // Interfaces for PrimeNG Table columns
      interface Column {
        field: string;
        header: string;
        customExportHeader?: string;
      }       
      export interface AssignmentDisplayModel extends Assignment {
        canEdit$: Observable<boolean>;
        canDelete$: Observable<boolean>;
      }


@Component({
  selector: 'app-assignmentdashboard',
  standalone: true,
  imports: [ReactiveFormsModule,FormsModule,FormlyModule,//FormlyPrimeNGModule, FormlySelectModule,
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
      NgxPermissionsModule,ToastModule,
     
      
  ],
  schemas:[CUSTOM_ELEMENTS_SCHEMA],
providers:[MessageService,ConfirmationService,DatePipe],
  templateUrl: './assignmentdashboard.component.html',
  styleUrl: './assignmentdashboard.component.scss'
})
export class AssignmentdashboardComponent {
  private router = inject(Router);

  cols!: Column[];
  activeTenantId!:string|null;

  form = new FormGroup({});
  
  model: any ={}
  
  formFields!: Observable<FormlyFieldConfig[]|null>;
  assignment!:Partial<AssignmentDisplayModel>;

  assignment$!: Partial<AssignmentDisplayModel>;
  assignments$!: Observable<AssignmentDisplayModel[]>;

  currentUser: User | null = null; 
  tenantIdFromusercontext!:string;

  submitted: boolean = false;
  initialQuestionSearchCriteria: { questionText?: string;  topic?: string; questionTypeName?: string; questionCategoryName?: string; questionPurposeName?: string; } = {};
  assignmentDialog: boolean = false;
  
  
  
  constructor(private activatedRoute: ActivatedRoute,private usercontextService:UserContextService,
    private assignmentService:AssignmentService,
    public authService:AuthService,
    private formschemaService:FormschemaService,      
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private permissionsService: NgxPermissionsService, 
    private lookupService:LookupService){
  
    
  this.usercontextService.currentUserProfile$.pipe(
    distinctUntilChanged(),
    filter((cuser:any) => cuser!=null),
  ).subscribe(cuser=>{
          this.currentUser=cuser; 
          
          this.tenantIdFromusercontext=this.currentUser?.tenantId!
        
          this.loadAssignment(this.tenantIdFromusercontext!);
          
 })
  }

  async   ngOnInit() {

          this.activeTenantId=  this.authService.getTenantId();
          this.model.tenantId= this.activeTenantId;
          //Load json forform from backend -------------------------------------
          var whichForm='assignment';
          this.formFields=
            this.formschemaService.getFormschema(whichForm).pipe(
              tap((fields:FormlyFieldConfig[]) => {


                const courseofferingField = fields.find(field => field.key === 'courseOfferingId');
                if (courseofferingField) {
                  courseofferingField.props = courseofferingField.props || {};
                    // Populate the program options once, when the form loads
                    courseofferingField.props.options = this.lookupService.getCourseofferings(this.activeTenantId!);
                }

                //purposeId
                
                const assignmentPurposeField = fields.find(field => field.key === 'assignmentPurpose');
                if (assignmentPurposeField) {
                  assignmentPurposeField.props = assignmentPurposeField.props || {};
                    // Populate the program options once, when the form loads
                    assignmentPurposeField.props.options = this.lookupService.getQuestionPurposes(this.activeTenantId!);
                }


              }),
              (res:any)=> {
                  
                  return res;}
              
            )
  }

  @ViewChild('dt') dt!: Table;
  assignmentId!:number;
  isExistingAssignment: boolean=false;

  
  
  openNew(): void {   //earlier was : { rolename: '' }

    this.model={};
    this.isExistingAssignment=false;  
    this.model.tenantId=this.activeTenantId;

    this.submitted = false;

    this.assignmentDialog = true;
}

get dialogHeader(): string {
  return (this.assignment && this.assignment.id) ? 'Edit Assignment' : 'New Assignment'; // Direct access to user.id
}
loadAssignment(ptenantId:string):void{
  
  var studProfileId=this.currentUser!.person.studentProfile.id
      this.assignments$=this.assignmentService.getAssignmentsForStudent(ptenantId,studProfileId).pipe(
        
            map((data: Assignment[]) => { // Map backend data to UserDisplayModel
              return data.map(courseBackend => {
              const courseDisplay: AssignmentDisplayModel = {
                  ...courseBackend,
                  canEdit$:this.getCanEditObservable(courseBackend), 
                  canDelete$: this.getCanDeleteObservable(courseBackend)
              };
              return courseDisplay;
          });
        })
      )
}


private getCanEditObservable(assignmentToEdit: Assignment): Observable<boolean> {
      
  if (!assignmentToEdit ) {
      return of(false);
  }

  const thisiscreatedBy=assignmentToEdit.createdByUserId;

  return combineLatest([
      from(this.permissionsService.hasPermission('assignment.edit.created_by_self')).pipe(catchError(() => of(false))),
      from(this.permissionsService.hasPermission('assignment.edit')).pipe(catchError(() => of(false))),

      // Add other specific edit permissions as needed
      // For 'assignment.edit.created_by_self':
      // from(this.permissionsService.hasPermission('assignment.edit.created_by_self')).pipe(
      //     map(hasPerm => hasPerm && this.authService.getUserId() === assignmentToEdit.createdByUserId), // You need createdByUserId in CourseBackendModel
      //     catchError(() => of(false))
      // )
  ]).pipe(
      map(([canEditCoursecreated_by_self,canEditCourseOffering, ]) => {
       
          if  (this.authService.getUserId()===assignmentToEdit.id) //his own record
          { return true;  } //whatever may be assignmenttoedit  loggedin assignment's record must be editable by himself
          if (canEditCoursecreated_by_self && (this.authService.getUserId()===thisiscreatedBy)) //createdby currentassignment
          {
              return true;
          }
          if ( canEditCourseOffering)  {    return true;   }
         

          return false;

      }),
      catchError(err => {
          console.error('Error calculating canEditObservable:', err);
          return of(false);
      })
  );
}

// Helper function to create the canDelete$ observable for a given assignment
private getCanDeleteObservable(assignmentToDelete: Assignment): Observable<boolean> {
  if (!assignmentToDelete ) {
      return of(false);
  }

  const thisiscreatedBy=assignmentToDelete.createdByUserId;

  return combineLatest([
      from(this.permissionsService.hasPermission('assignment.delete.created_by_self')).pipe(catchError(() => of(false))),
      from(this.permissionsService.hasPermission('assignment.delete')).pipe(catchError(() => of(false))),
  ]).pipe(
      map(([canDeleteStudentcreated_by_self,canDeleteCourseOffering]) => {
          if  (this.authService.getUserId()===assignmentToDelete.id) //his own record
          { return false;  } //whatever may be assignmenttodelete  loggedin assignment's record must be not be deleted by himself
      //pending: 1. let run this delete logic in more conditional way and 2. need to find a way a assessor is dealing with other studentsolo 

          if (canDeleteStudentcreated_by_self && (this.authService.getUserId()===thisiscreatedBy)) //createdby currentassignment
          {
              return true;
          }  
          if ( canDeleteCourseOffering) {
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

takeAssignment(assignment: Assignment): void {
  let navigationExtras: NavigationExtras = {
     relativeTo: this.activatedRoute.parent ,
    queryParams: { 
      'id': assignment.id ,
       assignmentPurpose:assignment.assignmentPurpose, 
      questionTimeLimitSeconds:assignment.questionTimeLimitSeconds, 
      quizTimeLimitSeconds:assignment.quizTimeLimitSeconds}

  };

 // this.router.navigate(['./takeAssignment',assignment.id], { relativeTo: this.activatedRoute });
 this.router.navigate(['./takeAssignment'],navigationExtras);//, { relativeTo: this.activatedRoute });
}

onSubmit(){
if (this.form.valid) {
  console.log(this.model);
  var sub1;var msg_AssignmentCreatedOrUpdated:string='';
  if(this.isExistingAssignment){
  msg_AssignmentCreatedOrUpdated= 'Assignment Updated'; 
  sub1=   this.assignmentService.updateAssignment(this.assignmentId! ,this.model); 
  }
  else{
    msg_AssignmentCreatedOrUpdated= 'Assignment Added'
  sub1=this.assignmentService.createAssignment(this.model)
  }
 sub1!.subscribe({
      next: () => {
        this.loadAssignment(this.tenantIdFromusercontext!);//  this.loadAssignments(this.currentAssignment?.tenantId!); // Reload users after successful deletion
        this.assignmentDialog=false;
          this.assignment = {}; // Clear the form
          this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail:msg_AssignmentCreatedOrUpdated,
              life: 3000
          });
      },
      error: (err:any) => {
          console.error('Error updating Assignment:', err);
          this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to update Assignment.',
              life: 3000
          });
      }
  });
 
  this.hideDialog();
} else {
  this.messageService.add({
    severity: 'error',
    summary: 'Error',
    detail: 'Please fill out the form correctly.',
  });
}
}
    



hideDialog(): void {
  this.assignmentDialog = false;
  this.submitted = false;
  
}
 /**
   * Handles global filtering for the PrimeNG table.
   * @param table The PrimeNG Table instance.
   * @param event The input event.
   */
 onGlobalFilter(table: Table, event: Event) {
  table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
}


exportCSV(): void {
  this.dt.exportCSV();
}


//pending- 
  formatLocalShortDate(date: string | Date): string {
  if (!date) {
    return '';
  }

  // Create a Date object from the input.
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // Use Intl.DateTimeFormat to format the date according to the user's locale.
  // This automatically handles the timezone conversion.
  const formatter = new Intl.DateTimeFormat(navigator.language, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    // We explicitly set the time zone to the user's local zone.
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  return formatter.format(dateObj);
}

/**
* A utility function to format a UTC date string into a user's local,
* human-readable format, including the time.
* @param date A date string (e.g., '2025-08-22T17:00:00.000Z') or a Date object.
* @returns A formatted date and time string (e.g., 'Aug 23, 2025, 10:30 PM').
*/
  formatLocalShortDateTime(date: string | Date): string {
  if (!date) {
    return '';
  }

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const formatter = new Intl.DateTimeFormat(navigator.language, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    timeZoneName: 'short',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  return formatter.format(dateObj);
}
}

