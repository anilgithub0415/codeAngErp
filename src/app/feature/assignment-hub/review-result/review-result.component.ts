

import { ActivatedRoute, Router } from '@angular/router';

import { Component, OnInit,AfterViewInit, signal, ViewChild } from '@angular/core';
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
import { AssignmentService } from '../../../core/services/assignment.service';
import { User } from '../../../core/models/user.model';


import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AssignmentAttemptSubmit } from '../../../core/models/assignment-attempt.model';
import { AssignmentAttemptService } from '../../../core/services/assignment-attempt.service';
import { AssignmentAttempt } from '../../../core/models/assignment-attempt';
import { AssignmentAttemptEnum } from '../../../shared/enums/AssignAttempt-enum';
import { CardModule } from 'primeng/card';
import { RadioButtonModule } from 'primeng/radiobutton';

@Component({
  selector: 'app-review-result',
  standalone: true,
  imports: [ReactiveFormsModule,FormsModule,FormlyModule,//FormlyPrimeNGModule, FormlySelectModule,
      CommonModule,
      FormsModule,
      // PrimeNG Modules
      CardModule,RadioButtonModule,
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
providers:[MessageService,ConfirmationService,DatePipe],
  templateUrl: './review-result.component.html',
  styleUrl: './review-result.component.scss'
})
export class ReviewResultComponent implements OnInit {
   assignmentAttemptId!:number;

   currentUser: User | null = null; 
  tenantIdFromusercontext!:string;

  reviewResult:any=null; stud_quesanswers!:any;
  showAnswers:boolean=false; selectedGender: string = ''; ingredient:any; 
 constructor(private activatedRoute: ActivatedRoute,  
   private assignmentAttemptService:AssignmentAttemptService,
   private usercontextService:UserContextService,
  private messageService: MessageService,
  private router:Router
  ){


    
    this.usercontextService.currentUserProfile$.pipe(
      distinctUntilChanged(),
      filter((cuser:any) => cuser!=null),
    ).subscribe(cuser=>{
            this.currentUser=cuser; 
            
            this.tenantIdFromusercontext=this.currentUser?.tenantId!
  
           
                 
   })
  
  }
   ngOnInit(): void {

    this.activatedRoute.queryParamMap.subscribe(params=>
      {     
        this.assignmentAttemptId=parseInt(params.get('id')!);

      })

      
// this.router.getCurrentNavigation()?.extras.state?.id;

     this.loadReviewResultOfAssignmentAttempt(this.assignmentAttemptId,this.tenantIdFromusercontext)
   }

   loadReviewResultOfAssignmentAttempt(assignmentAttemptId:number,ptenantId:string):void{
    this.assignmentAttemptService.getReviewResultOfAssignmentAttempt(assignmentAttemptId!,ptenantId).pipe(
    ).subscribe(res=>{
     this.reviewResult=res.result;     this.stud_quesanswers=res.stud_quesanswers 
    })
  }

}
