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
import { ProgramService } from '../../../core/services/program.service'; // Angular-side ProgramService
import { Program, CreateProgramDto, UpdateProgramDto  } from '../../../core/models/program'; // Program interfaces/DTOs


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
      // Interfaces for PrimeNG Table columns
interface Column {
  field: string;
  header: string;
  customExportHeader?: string;
}       
export interface ProgramDisplayModel extends Program {
  canEdit$: Observable<boolean>;
  canDelete$: Observable<boolean>;
}


@Component({
  selector: 'app-program',
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
  templateUrl: './program.component.html',
  styleUrl: './program.component.scss'
})
export class ProgramComponent {

  activeTenantId!:string|null;

  form = new FormGroup({});
  
  model: any = {
      // It's good practice to initialize all model properties to avoid this kind of issue
      
      programCode: null,
      programName: null,
      description:null
    };
  //formFields!: Observable<FormlyFieldConfig[]|null>; 
  //formFields!: FormlyFieldConfig[]|null; 
  //formFields!:any;
  formFields!: Observable<FormlyFieldConfig[]|null>;
  program!: Partial<ProgramDisplayModel>;
  currentUser: User | null = null; 
  tenantIdFromusercontext!:string;
    programs$!: Observable<ProgramDisplayModel[]>;
    
    submitted: boolean = false;
    initialPersonSearchCriteria: { email?: string; phone?: string; firstName?: string; lastName?: string; zipCode?: string; } = {};
    programDialog: boolean = false;
    
  @ViewChild('dt') dt!: Table;
    cols!: Column[];selectedUsers: User[] | null = null;
    isExistingUser: boolean=false;
    programId: number | null = null; 

    constructor(private usercontextService:UserContextService,
      private programService:ProgramService,
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
          
            this.loadPrograms(this.tenantIdFromusercontext!);
   })
    }

    async   ngOnInit() {

      this.activeTenantId=  this.authService.getTenantId();
      this.model.tenantId= this.activeTenantId;
      //Load json forform from backend -------------------------------------
      var whichForm='program';
      this.formFields=
         this.formschemaService.getFormschema(whichForm).pipe(
          tap((fields:FormlyFieldConfig[]) => {
  
  
            //   // Find the 'select' fields by their key or type and populate options
            // const subjectField = fields.find((field:any) => field.key === 'subjectId');
            // subjectField!.props = subjectField?.props || {};
            // var tenantId=this.activeTenantId;
            // subjectField!.props!.options =  this.lookupService.getSubjects(tenantId!);
  
  
          }),
          (res:any)=> {
              
              return res;}
          
        )
          }
          // --- New Getters to simplify HTML conditions ---
  get dialogHeader(): string {
    return (this.program && this.program.id) ? 'Edit Program' : 'New Program'; // Direct access to user.id
}

    loadPrograms(ptenantId:string):void{
      this.programs$=this.programService.getPrograms(ptenantId).pipe(
        
        map((data: Program[]) => { // Map backend data to UserDisplayModel
          return data.map(programBackend => {
          const programDisplay: ProgramDisplayModel = {
              ...programBackend,
              canEdit$:this.getCanEditObservable(programBackend),
              canDelete$: this.getCanDeleteObservable(programBackend)
          };
          return programDisplay;
      });
    })
      )
    }
 // Helper function to create the canEdit$ observable for a given program
    //logic  User type is extended by adding one more property 'roleNameInContext'
    //logic contra tag:roleNameInContext extra field
    private getCanEditObservable(programToEdit: Program): Observable<boolean> {
      
      if (!programToEdit ) {
          return of(false);
      }

      const thisiscreatedBy=programToEdit.createdByUserId;

      return combineLatest([
          from(this.permissionsService.hasPermission('program.edit.created_by_self')).pipe(catchError(() => of(false))),
          from(this.permissionsService.hasPermission('program.edit')).pipe(catchError(() => of(false))),

          // Add other specific edit permissions as needed
          // For 'program.edit.created_by_self':
          // from(this.permissionsService.hasPermission('program.edit.created_by_self')).pipe(
          //     map(hasPerm => hasPerm && this.authService.getUserId() === programToEdit.createdByUserId), // You need createdByUserId in ProgramBackendModel
          //     catchError(() => of(false))
          // )
      ]).pipe(
          map(([canEditProgramcreated_by_self,canEditProgram, ]) => {
           
              if  (this.authService.getUserId()===programToEdit.id) //his own record
              { return true;  } //whatever may be programtoedit  loggedin program's record must be editable by himself
              if (canEditProgramcreated_by_self && (this.authService.getUserId()===thisiscreatedBy)) //createdby currentprogram
              {
                  return true;
              }
              if ( canEditProgram)  {    return true;   }
             

              return false;

          }),
          catchError(err => {
              console.error('Error calculating canEditObservable:', err);
              return of(false);
          })
      );
  }
    
    // Helper function to create the canDelete$ observable for a given program
    private getCanDeleteObservable(programToDelete: Program): Observable<boolean> {
      if (!programToDelete ) {
          return of(false);
      }

      const thisiscreatedBy=programToDelete.createdByUserId;

      return combineLatest([
          from(this.permissionsService.hasPermission('program.delete.created_by_self')).pipe(catchError(() => of(false))),
          from(this.permissionsService.hasPermission('program.delete')).pipe(catchError(() => of(false))),
      ]).pipe(
          map(([canDeleteStudentcreated_by_self,canDeleteProgram]) => {
              if  (this.authService.getUserId()===programToDelete.id) //his own record
              { return false;  } //whatever may be programtodelete  loggedin program's record must be not be deleted by himself
          //pending: 1. let run this delete logic in more conditional way and 2. need to find a way a assessor is dealing with other studentsolo 

              if (canDeleteStudentcreated_by_self && (this.authService.getUserId()===thisiscreatedBy)) //createdby currentprogram
              {
                  return true;
              }  
              if ( canDeleteProgram) {
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
        var sub1;var msg_ProgramCreatedOrUpdated:string='';
        if(this.isExistingUser){
        msg_ProgramCreatedOrUpdated= 'Program Updated';
        sub1=   this.programService.updateProgram(this.programId!,this.model); }
        else{
          msg_ProgramCreatedOrUpdated= 'Program Added'
        sub1=this.programService.createProgram(this.model)
        }
       sub1!.subscribe({
            next: () => {
              this.loadPrograms(this.tenantIdFromusercontext!);//  this.loadPrograms(this.currentProgram?.tenantId!); // Reload users after successful deletion
              this.programDialog=false;
                this.program = {}; // Clear the form
                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail:msg_ProgramCreatedOrUpdated,
                    life: 3000
                });
            },
            error: (err:any) => {
                console.error('Error updating program:', err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to update program.',
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
    deleteProgram(program: Program): void {
    
      this.confirmationService.confirm({
          message: `Are you sure you want to delete program ${program.programName}? This action cannot be undone.`,
          header: 'Confirm Deletion',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
              this.programService.deleteProgram(program.id).subscribe({
                  next: () => {
                    this.loadPrograms(this.tenantIdFromusercontext!);//  this.loadPrograms(this.currentProgram?.tenantId!); // Reload users after successful deletion
                      this.program = {}; // Clear the form
                      this.messageService.add({
                          severity: 'success',
                          summary: 'Successful',
                          detail: 'Program Deleted',
                          life: 3000
                      });
                  },
                  error: (err:any) => {
                      console.error('Error deleting program:', err);
                      this.messageService.add({
                          severity: 'error',
                          summary: 'Error',
                          detail: 'Failed to delete program.',
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
      this.programDialog = true;
  }


 /**
   * Handles global filtering for the PrimeNG table.
   * @param table The PrimeNG Table instance.
   * @param event The input event.
   */
 onGlobalFilter(table: Table, event: Event) {
  table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
}
editProgram(program: Program): void {
  this.programId=program.id;
 this.isExistingUser=true;
  
  this.form.patchValue(program);
  
  this.submitted = false;
  this.programDialog = true;
}

hideDialog(): void {
  this.programDialog = false;
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
