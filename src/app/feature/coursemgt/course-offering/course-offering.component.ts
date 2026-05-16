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
import { CourseofferingService } from '../../../core/services/courseoffering.service'; // Angular-side CourseOfferingService
import { CourseOffering, CreateCourseOfferingDto, UpdateCourseOfferingDto  } from '../../../core/models/course-offering'; // CourseOffering interfaces/DTOs


import { AuthService } from '../../../core/services/auth.service';
import { NgxPermissionsModule, NgxPermissionsService } from 'ngx-permissions';
import { Observable, firstValueFrom,combineLatest, of, from, BehaviorSubject, Subscription, Subject } from 'rxjs';
import { map, switchMap, catchError, shareReplay, distinctUntilChanged, filter, tap, startWith  } from 'rxjs/operators';
import { DataScopeService } from '../../../core/services/datascope.service';

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
      export interface CourseOfferingDisplayModel extends CourseOffering {
        canEdit$: Observable<boolean>;
        canDelete$: Observable<boolean>;
      }

@Component({
  selector: 'app-course-offering',
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
  templateUrl: './course-offering.component.html',
  styleUrl: './course-offering.component.scss'
})
export class CourseOfferingComponent {


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
  courseOffering!:Partial<CourseOfferingDisplayModel>;
  

  currentUser: User | null = null; 
  tenantIdFromusercontext!:string;
    courseoffers$!: Observable<CourseOfferingDisplayModel[]>;
    
    submitted: boolean = false;
    
    courseofferDialog: boolean = false;
    
  @ViewChild('dt') dt!: Table;
    cols!: Column[];selectedUsers: User[] | null = null;
    isExistingUser: boolean=false;
    courseofferId: number | null = null; 

    constructor(private usercontextService:UserContextService,
      private courseOfferingService:CourseofferingService,
      public authService:AuthService,
      private formschemaService:FormschemaService,      
      private confirmationService: ConfirmationService,
      private messageService: MessageService,
      private lookupService:LookupService,
      private permissionsService: NgxPermissionsService,){
    
      
    this.usercontextService.currentUserProfile$.pipe(
      distinctUntilChanged(),
      filter((cuser:any) => cuser!=null),
    ).subscribe(cuser=>{
            this.currentUser=cuser; 
            
            this.tenantIdFromusercontext=this.currentUser?.tenantId!
          
            this.loadCourseofferings(this.tenantIdFromusercontext!);
   })
    }

    async   ngOnInit() {

      this.activeTenantId=  this.authService.getTenantId();
      this.model.tenantId= this.activeTenantId;
      //Load json forform from backend -------------------------------------
      var whichForm='courseoffering';
      this.formFields=
         this.formschemaService.getFormschema(whichForm).pipe(
          tap((fields:FormlyFieldConfig[]) => {
  
  
               // Find the 'select' fields by their key or type and populate options
            const courseField = fields.find((field:any) => field.key === 'courseId');
            courseField!.props = courseField?.props || {};
            var tenantId=this.activeTenantId;
            courseField!.props!.options =  this.lookupService.getCourses(tenantId!);

                  // Find the 'select' fields by their key or type and populate options
                  const facultyProfileField = fields.find((field:any) => field.key === 'facultyProfileId');
                  facultyProfileField!.props = facultyProfileField?.props || {};
                  var tenantId=this.activeTenantId;
                  facultyProfileField!.props!.options =  this.lookupService.getFacultyProfiles(tenantId!);
      
  
          }),
          (res:any)=> {
              
              return res;}
          
        )
          }
                 // --- New Getters to simplify HTML conditions ---
  get dialogHeader(): string {
    return (this.courseOffering && this.courseOffering.id) ? 'Edit CourseOffering' : 'New CourseOffering'; // Direct access to user.id
}
    loadCourseofferings(ptenantId:string):void{
      this.courseoffers$=this.courseOfferingService.getCourseOfferings(ptenantId).pipe(
        
        map((data: CourseOffering[]) => { // Map backend data to UserDisplayModel
          return data.map(courseofferingBackend => {
          const subjectDisplay: CourseOfferingDisplayModel = {
              ...courseofferingBackend,
              canEdit$:this.getCanEditObservable(courseofferingBackend),
              canDelete$: this.getCanDeleteObservable(courseofferingBackend)
          };
          return subjectDisplay;
      });
    })
      )
    }

    
    
 // Helper function to create the canEdit$ observable for a given courseoffering
    //logic  User type is extended by adding one more property 'roleNameInContext'
    //logic contra tag:roleNameInContext extra field
    private getCanEditObservable(courseofferingToEdit: CourseOffering): Observable<boolean> {
      
      if (!courseofferingToEdit ) {
          return of(false);
      }

      const thisiscreatedBy=courseofferingToEdit.createdByUserId;

      return combineLatest([
          from(this.permissionsService.hasPermission('courseoffering.edit.created_by_self')).pipe(catchError(() => of(false))),
          from(this.permissionsService.hasPermission('courseoffering.edit')).pipe(catchError(() => of(false))),

          // Add other specific edit permissions as needed
          // For 'courseoffering.edit.created_by_self':
          // from(this.permissionsService.hasPermission('courseoffering.edit.created_by_self')).pipe(
          //     map(hasPerm => hasPerm && this.authService.getUserId() === courseofferingToEdit.createdByUserId), // You need createdByUserId in CourseBackendModel
          //     catchError(() => of(false))
          // )
      ]).pipe(
          map(([canEditCoursecreated_by_self,canEditCourseOffering, ]) => {
           
              if  (this.authService.getUserId()===courseofferingToEdit.id) //his own record
              { return true;  } //whatever may be courseofferingtoedit  loggedin courseoffering's record must be editable by himself
              if (canEditCoursecreated_by_self && (this.authService.getUserId()===thisiscreatedBy)) //createdby currentcourseoffering
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
    
    // Helper function to create the canDelete$ observable for a given courseoffering
    private getCanDeleteObservable(courseofferingToDelete: CourseOffering): Observable<boolean> {
      if (!courseofferingToDelete ) {
          return of(false);
      }

      const thisiscreatedBy=courseofferingToDelete.createdByUserId;

      return combineLatest([
          from(this.permissionsService.hasPermission('courseoffering.delete.created_by_self')).pipe(catchError(() => of(false))),
          from(this.permissionsService.hasPermission('courseoffering.delete')).pipe(catchError(() => of(false))),
      ]).pipe(
          map(([canDeleteStudentcreated_by_self,canDeleteCourseOffering]) => {
              if  (this.authService.getUserId()===courseofferingToDelete.id) //his own record
              { return false;  } //whatever may be courseofferingtodelete  loggedin courseoffering's record must be not be deleted by himself
          //pending: 1. let run this delete logic in more conditional way and 2. need to find a way a assessor is dealing with other studentsolo 

              if (canDeleteStudentcreated_by_self && (this.authService.getUserId()===thisiscreatedBy)) //createdby currentcourseoffering
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
    
  onSubmit(){
  
console.log('submitting.................');
//precaution- We hardcode status as Active but rethink here
this.model.status="Active";
  if (this.form.valid) {
    console.log(this.model);
    var sub1;var msg_CourseOfferingCreatedOrUpdated:string='';
    if(this.isExistingUser){alert('updating courseOffering id:'+this.courseofferId!)
    msg_CourseOfferingCreatedOrUpdated= 'CourseOffering Updated';
    sub1=   this.courseOfferingService.updateCourseOffering(this.courseofferId!,this.model); }
    else{alert('adding new courseOffering')
      msg_CourseOfferingCreatedOrUpdated= 'CourseOffering Added'
    sub1=this.courseOfferingService.createCourseOffering(this.model)
    }
   sub1!.subscribe({
        next: () => {
          this.loadCourseofferings(this.tenantIdFromusercontext!);//  this.loadCourseOfferings(this.currentCourseOffering?.tenantId!); // Reload users after successful deletion
          this.courseofferDialog=false;
            this.courseOffering = {}; // Clear the form
            this.messageService.add({
                severity: 'success',
                summary: 'Successful',
                detail:msg_CourseOfferingCreatedOrUpdated,
                life: 3000
            });
        },
        error: (err:any) => {
            console.error('Error updating courseOffering:', err);
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to update courseOffering.',
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
    deleteCourseOffering(coffering: CourseOffering): void {
    console.log('......deleting CourseOffering:',coffering.id);
    
      this.confirmationService.confirm({
          message: `Are you sure you want to delete CourseOffering ${coffering.offeringName}? This action cannot be undone.`,
          header: 'Confirm Deletion',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
              this.courseOfferingService.deleteCourseOffering(coffering.id).subscribe({
                  next: () => {
                    this.loadCourseofferings(this.tenantIdFromusercontext!);//  
                      this.courseOffering = {}; // Clear the form
                      this.messageService.add({
                          severity: 'success',
                          summary: 'Successful',
                          detail: 'CourseOffering Deleted',
                          life: 3000
                      });
                  },
                  error: (err:any) => {
                      console.error('Error deleting CourseOffering:', err);
                      this.messageService.add({
                          severity: 'error',
                          summary: 'Error',
                          detail: 'Failed to delete CourseOffering.',
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
          

    this.courseofferDialog = true;
}
    
 /**
   * Handles global filtering for the PrimeNG table.
   * @param table The PrimeNG Table instance.
   * @param event The input event.
   */
 onGlobalFilter(table: Table, event: Event) {
  table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
}

editCourseOffering(coffering: CourseOffering): void {
  this.courseofferId=coffering.id;
 this.isExistingUser=true;
  
  this.form.patchValue(coffering);
  
  this.submitted = false;
  this.courseofferDialog = true;
}

// editCourseOffering(subject: CourseOffering): void {
//   this.courseofferId=subject.id;
//  this.isExistingUser=true;
  
//   this.form.patchValue(subject);
  
//   this.submitted = false;
//   this.courseofferDialog = true;
// }

hideDialog(): void {
  this.courseofferDialog = false;
  this.submitted = false;
  
}
/**
 * Exports the table data to CSV.
 */
exportCSV(): void {
  this.dt.exportCSV();
}

}
