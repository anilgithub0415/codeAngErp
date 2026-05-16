
import { Component, OnInit,AfterViewInit, signal, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AbstractControl, FormControl, FormGroup,FormArray, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { QuestionService } from '../../../core/services/question.service'; // Angular-side QuestionService
import { Question, CreateQuestionDto, UpdateQuestionDto  } from '../../../core/models/question.model'; // Question interfaces/DTOs


import { AuthService } from '../../../core/services/auth.service';
import { NgxPermissionsModule, NgxPermissionsService } from 'ngx-permissions';
import { Observable, firstValueFrom,combineLatest, of, from, BehaviorSubject, Subscription } from 'rxjs';
import { map, switchMap, catchError, shareReplay, distinctUntilChanged, filter, tap, startWith, take  } from 'rxjs/operators';
import { DataScopeService } from '../../../core/services/datascope.service';
import { Person } from '../../../core/models/person.model';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
//import { FormlyPrimeNGModule } from '@ngx-formly/primeng';
import { FormschemaService } from '../../../core/services/formschema.service';
//import { FormlyFieldProps } from '@ngx-formly/primeng/form-field';
//import { ProgramService } from '../../../core/services/program.service';
import { LookupService } from '../../../core/services/lookup.service';
//import { FormlySelectModule } from '@ngx-formly/core/select';
import { StudentprofileService } from '../../../core/services/studentprofile.service';
import { StudentProfile, CreateStudentprofileDto } from '../../../core/models/student-profile';
import { Program } from '../../../core/models/program';
import { EnrollService } from '../../../core/services/enroll.service';
import { UserContextService } from '../../../core/services/user-context.service';
import { User } from '../../../core/models/user.model';
import { ActivatedRoute } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';


      // Interfaces for PrimeNG Table columns
interface Column {
  field: string;
  header: string;
  customExportHeader?: string;
}       
export interface QuestionDisplayModel extends Question {
  tenantId:string;
  canEdit$: Observable<boolean>;
  canDelete$: Observable<boolean>;
  canMerge:boolean;
  isBankQuestion:boolean;
}

@Component({
  selector: 'app-question',
  standalone: true,
  // ... (imports and providers) ...imported yes
imports: [ReactiveFormsModule,FormsModule,FormlyModule,//FormlyPrimeNGModule, FormlySelectModule,
      CommonModule,
     // FormsModule,
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
      NgxPermissionsModule,ToastModule,TooltipModule
      
  ],
providers:[MessageService,ConfirmationService,DatePipe],
  templateUrl: './question.component.html',
  styleUrl: './question.component.scss'
})
export class QuestionComponent {


  activeTenantId!:string|null;

  form = new FormGroup({});
  private subscriptions = new Subscription();

  model: any = {
      // It's good practice to initialize all model properties to avoid this kind of issue
     // options:[{}]
    };
  //formFields!: Observable<FormlyFieldConfig[]|null>; 
  //formFields!: FormlyFieldConfig[]|null; 
  //formFields!:any;
  formFields!: Observable<FormlyFieldConfig[]|null>;
  question!: Partial<QuestionDisplayModel>;
  currentUser: User | null = null; 
  tenantIdFromusercontext!:string;
    questions$!: Observable<QuestionDisplayModel[]>;// Step 1: Create a subject to track merged question source IDs

    private mergedQuestionSourceIds = new BehaviorSubject<Set<number>>(new Set());

    
    submitted: boolean = false;
    initialPersonSearchCriteria: { email?: string; phone?: string; firstName?: string; lastName?: string; zipCode?: string; } = {};
    questionDialog: boolean = false;
    
  @ViewChild('dt') dt!: Table;
    cols!: Column[];selectedUsers: User[] | null = null;
    isExistingUser: boolean=false;
    questionId: number | null = null; 

    constructor(
      private activatedRoute: ActivatedRoute,
      private usercontextService:UserContextService,
      private questionService:QuestionService,
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
          
            this.loadQuestions(this.tenantIdFromusercontext!);
   })
    }

// Inside your component class...// Inside your component class...
ngOnInit(): void {
  this.activeTenantId = this.authService.getTenantId();
  this.model.tenantId = this.activeTenantId;
  this.model.options = [
    { optionText: '', isCorrect: false },
    { optionText: '', isCorrect: false },
];
  // Set initial model defaults immediately (if new question)
  if (!this.model.questionTypeName || this.model.questionTypeName === 'MCQ-SingleCorrect') {
      // 🎯 FIX: Initialize the model.options with two default objects directly.
      this.model.options = [
          { optionText: '', isCorrect: false },
          { optionText: '', isCorrect: false },
      ];
  } else {
      // For other types, initialize as empty array
      this.model.options = [];
  }
  
  // Get the question ID from the route...
  const questionIdFromRoute = this.activatedRoute.snapshot.paramMap.get('id');
  const questionId = questionIdFromRoute ? +questionIdFromRoute : 0;
  
  // Load the form schema and lookup options
  this.formFields = this.formschemaService.getFormschema('question')
    .pipe( 
      tap((fields: FormlyFieldConfig[]) => {
        this.loadLookupOptions(fields, this.activeTenantId!);
        console.log('p............preparing to call setupDynamicFormGeneration');
        
        // 🎯 FIX: Call the subscription logic without assigning the result to the model.
        this.setupDynamicFormGeneration();
      })
    );
}

private setupDynamicFormGeneration(): void { 
  console.log('......m setingDynamicfields for question');

  // This subscription is correct for reacting to changes, 
  // but it must NOT be used to set this.model.options by return value.
  this.form.get('questionTypeName')?.valueChanges.pipe(
    startWith(this.form.get('questionTypeName')?.value),
    switchMap(qType => {
      const isMCQ = qType === 'MCQ-MultiCorrect' || qType === 'MCQ-SingleCorrect';
      console.log('...isMCQ:', isMCQ); //console.log('...seeher :',this.model.options);
      
      
      // If you need to CLEAR options when switching away from MCQ:
      // Note: Directly modifying the model inside a valueChanges subscription can sometimes cause issues.
      // Use the hideExpression approach instead (see point 3).
      
      return of(isMCQ); // Simply return a flag
    })
  ).subscribe();
}

// Your setupDynamicFormGeneration can be simplified to handle the questionType change
private setupDynamicFormGeneration1(): any { console.log('......m setingDynamicfields for question');

  this.form.get('questionTypeName')?.valueChanges.pipe(
    startWith(this.form.get('questionTypeName')?.value),
    switchMap(qType => {
      const isMCQ = qType === 'MCQ-MultiCorrect' || qType === 'MCQ-SingleCorrect';
      console.log('...isMCQ:',isMCQ);
      
      
      
      return isMCQ ? of([
        { optionText: '', isCorrect: false },
        { optionText: '', isCorrect: false },
    ]) : of([]); // This part is now just for toggling visibility
    })
  ).subscribe(); // You can leave this part as is
}

// A helper method to load lookup options
private loadLookupOptions(fields: FormlyFieldConfig[], tenantId: string): void {
  const questionTypeField = fields.find(f => f.key === 'questionTypeName');
  if (questionTypeField) {
    questionTypeField.props!.options = this.lookupService.getQuestionTypes(tenantId);
  }

  const questionCategoryField = fields.find(f => f.key === 'questionCategoryName');
  if (questionCategoryField) {
    questionCategoryField.props!.options = this.lookupService.getQuestionCategories(tenantId);
  }

  const questionPurposeField = fields.find(f => f.key === 'questionPurposeName');
  if (questionPurposeField) {
    questionPurposeField.props!.options = this.lookupService.getQuestionPurposes(tenantId);
  }

  const topicField = fields.find(f => f.key === 'topicId');
  if (topicField) {
    topicField.props!.options = this.lookupService.getTopics(tenantId);
  }
}
    private setupDynamicFormGeneration_preserve2(initialFields: FormlyFieldConfig[]): void {
      console.log('....m setting DynamicFormGeneration preserve2');
      
      const questiontypeControl = this.form.get('questionTypeName');
      const questionIdControl = this.form.get('id');
      
      if (!questionIdControl ){ console.log('... eturning as no qid ');       return;}
      if (!questiontypeControl){ console.log('... eturning as no  qtype');       return;}

      if (!questionIdControl || !questiontypeControl){ console.log('... eturning as no qid or no qtype');       return;}
  
      this.subscriptions.add(
          combineLatest([
              questionIdControl.valueChanges.pipe(distinctUntilChanged()),
              questiontypeControl.valueChanges.pipe(distinctUntilChanged()),
          ]).pipe(
              filter(([qId, qType]) => !!qType),
              switchMap(([qId, qType]) => {
                  // Check if it's an MCQ type
                  const isMCQ = qType === 'MCQ-MultiCorrect' || qType === 'MCQ-SingleCorrect';
  console.log('..checking qType is eqs MC');
  
                  // Case 1: Existing MCQ question (qId > 0)
                  if (isMCQ && qId > 0) {
                      console.log(`Fetching options for existing question with ID: ${qId}`);
                      return this.questionService.getOptionsByQuestion(qId, this.activeTenantId!);
                  } 
                  // Case 2: New MCQ question (qId === 0)
                  else if (isMCQ && qId === 0) {
                      console.log('Initializing empty options for a new MCQ question.');
                      // Provide an initial empty array or a default number of empty options
                      return of([
                          { optionText: '', isCorrect: false },
                          { optionText: '', isCorrect: false },
                      ]);
                  } 
                  // Case 3: Other question types or new question with no options
                  else {
                      console.log('Clearing options for non-MCQ question.');
                      return of([]); // Return an empty array to clear the options form group
                  }
              })
          ).subscribe(optionsOfquestion => {
              console.log('.... getOptionByQuestion data:', optionsOfquestion);
              // This is the key: assign the options to the form model
              this.model.options = optionsOfquestion;
              this.form.patchValue({ options: optionsOfquestion }); // Patch the form value
          })
      );
  }

    private setupDynamicFormGeneration_preserve(initialFields: FormlyFieldConfig[]): void {
            console.log('....m setting DynamicFormGeneration');
            //questionTypeName

              
            const questiontypeControl= this.form.get('questionTypeName');
            const questionIdControl= this.form.get('id');   
            if (questionIdControl) {
              
              
            }

            //use  distinctUntilChanged() only when u r dealing wih question id here
            this.subscriptions.add(
                  combineLatest([
                    questionIdControl!.valueChanges,
                    questiontypeControl!.valueChanges
                  ]).pipe(
                
                    filter((qtype) => !!qtype),
                    switchMap((q:any)=>{   
                      if( questionIdControl?.value!==0 || (questiontypeControl?.value==='MCQ-MultiCorrect' || questiontypeControl!.value==='MCQ-SingleCorrect')){      
                        alert(questionIdControl?.value)
                    return this.questionService.getOptionsByQuestion(questionIdControl?.value!,this.activeTenantId!) 
                      }
                      else return [];
                    }

                    )
                  ).subscribe(optionsOfquestion => console.log('.... getOptionByQuestion data:',optionsOfquestion)
                  )
              )
      }



          // --- New Getters to simplify HTML conditions ---
  get dialogHeader(): string {
    return (this.question && this.question.id) ? 'Edit Question' : 'New Question'; // Direct access to user.id
}
  
  loadQuestions(ptenantId: string): void {
    const initialQuestions$ = this.questionService.getQuestions(ptenantId).pipe(
        // Use shareReplay to avoid re-fetching data on multiple subscriptions
        shareReplay({ bufferSize: 1, refCount: true })
    );

    // Step 3: Use combineLatest to react to both the questions and the merged IDs
    this.questions$ = combineLatest([
        initialQuestions$,
        this.mergedQuestionSourceIds.asObservable()
    ]).pipe(
        map(([data, mergedIdsSet]) => {
            // Step 4: Split and process the questions inside the map operator
            const tenantOwnedQuestions = data.filter(q => q.tenantId === ptenantId);
            const bankQuestions = data.filter(q => q.tenantId === 'IgniteFuture');

            // Rebuild the merged IDs set with the latest data from the tenant-owned questions
            // and the IDs from our real-time subject. This is for robustness.
            const allMergedIds = new Set([
                ...mergedIdsSet,
                ...tenantOwnedQuestions.map(q => q.sourceQuestionId).filter(id => id != null)
            ]);

            const displayTenantQuestions = tenantOwnedQuestions.map(questionBackend => ({
                ...questionBackend,
                canEdit$: this.getCanEditObservable(questionBackend),
                canDelete$: this.getCanDeleteObservable(questionBackend),
                canMerge: false,
                isBankQuestion: false
            }));

            const displayBankQuestions = bankQuestions.map(questionBackend => ({
                ...questionBackend,
                canEdit$: this.getCanEditObservable(questionBackend),
                canDelete$: this.getCanDeleteObservable(questionBackend),
                // Check against the combined set of IDs
                canMerge: !allMergedIds.has(questionBackend.id),
                isBankQuestion: true
            }));
            
            return [...displayTenantQuestions, ...displayBankQuestions];
        })
    );
}
 // Helper function to create the canEdit$ observable for a given question
    //logic  User type is extended by adding one more property 'roleNameInContext'
    //logic contra tag:roleNameInContext extra field
    private getCanEditObservable(questionToEdit: Question): Observable<boolean> {
      
      if (!questionToEdit ) {
          return of(false);
      }      
      //for question bank we have disabled edit and delete
      if(this.currentUser!.userTenantContexts![0].roleName!=='SuperAdmin' && questionToEdit.tenantId==='IgniteFuture'){return of(false);}

      const thisiscreatedBy=questionToEdit.createdByUserId;

      return combineLatest([
          from(this.permissionsService.hasPermission('question.edit.created_by_self')).pipe(catchError(() => of(false))),
          from(this.permissionsService.hasPermission('question.edit')).pipe(catchError(() => of(false))),

          // Add other specific edit permissions as needed
          // For 'question.edit.created_by_self':
          // from(this.permissionsService.hasPermission('question.edit.created_by_self')).pipe(
          //     map(hasPerm => hasPerm && this.authService.getUserId() === questionToEdit.createdByUserId), // You need createdByUserId in QuestionBackendModel
          //     catchError(() => of(false))
          // )
      ]).pipe(
          map(([canEditQuestioncreated_by_self,canEditQuestion, ]) => {
           
              if  (this.authService.getUserId()===questionToEdit.id) //his own record
              { return true;  } //whatever may be questiontoedit  loggedin question's record must be editable by himself
              if (canEditQuestioncreated_by_self && (this.authService.getUserId()===thisiscreatedBy)) //createdby currentquestion
              {
                  return true;
              }
              if ( canEditQuestion)  {    return true;   }
             

              return false;

          }),
          catchError(err => {
              console.error('Error calculating canEditObservable:', err);
              return of(false);
          })
      );
  }
    
    // Helper function to create the canDelete$ observable for a given question
    private getCanDeleteObservable(questionToDelete: Question): Observable<boolean> {
      if (!questionToDelete ) {
          return of(false);
      }
      //for question bank we have disabled edit and delete
      if(questionToDelete.tenantId==='IgniteFuture'){return of(false);}

      const thisiscreatedBy=questionToDelete.createdByUserId;

      return combineLatest([
          from(this.permissionsService.hasPermission('question.delete.created_by_self')).pipe(catchError(() => of(false))),
          from(this.permissionsService.hasPermission('question.delete')).pipe(catchError(() => of(false))),
      ]).pipe(
          map(([canDeleteStudentcreated_by_self,canDeleteQuestion]) => {
              if  (this.authService.getUserId()===questionToDelete.id) //his own record
              { return false;  } //whatever may be questiontodelete  loggedin question's record must be not be deleted by himself
          //pending: 1. let run this delete logic in more conditional way and 2. need to find a way a assessor is dealing with other studentsolo 

              if (canDeleteStudentcreated_by_self && (this.authService.getUserId()===thisiscreatedBy)) //createdby currentquestion
              {
                  return true;
              }  
              if ( canDeleteQuestion) {
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
 
  onSubmit(){console.log('submitting.................');console.log(this.model);console.log('isExistingUser:',this.isExistingUser);
  
  //precaution- We hardcode status as Active but rethink here
  this.model.status="Active";
    if (this.form.valid) {
        //console.log(this.model);
        var sub1;var msg_QuestionCreatedOrUpdated:string='';
        if(this.isExistingUser){
        msg_QuestionCreatedOrUpdated= 'Question Updated';
        sub1=   this.questionService.updateQuestion(this.questionId!,this.model); }
        else{
          msg_QuestionCreatedOrUpdated= 'Question Added'
          //    questionDataFromRequest.options=[{optionText:'abc',isCorrect:false},{optionText:'efg',isCorrect:false},{optionText:'hij',isCorrect:true},{optionText:'lmn',isCorrect:false}]
          
        sub1=this.questionService.createQuestion(this.model)
        }
       sub1!.subscribe({
            next: () => {
              this.loadQuestions(this.tenantIdFromusercontext!);//  this.loadQuestions(this.currentQuestion?.tenantId!); // Reload users after successful deletion
              this.questionDialog=false;
                this.question = {}; // Clear the form
                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail:msg_QuestionCreatedOrUpdated,
                    life: 3000
                });
            },
            error: (err:any) => {
                console.error('Error updating question:', err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to update question.',
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
    deleteQuestion(question: Question): void {
    
      this.confirmationService.confirm({
          message: `Are you sure you want to delete question ${question.questionText}? This action cannot be undone.`,
          header: 'Confirm Deletion',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
              this.questionService.deleteQuestion(question.id).subscribe({
                  next: () => {
                    this.loadQuestions(this.tenantIdFromusercontext!);//  this.loadQuestions(this.currentQuestion?.tenantId!); // Reload users after successful deletion
                      this.question = {}; // Clear the form
                      this.messageService.add({
                          severity: 'success',
                          summary: 'Successful',
                          detail: 'Question Deleted',
                          life: 3000
                      });
                  },
                  error: (err:any) => {
                      console.error('Error deleting question:', err);
                      this.messageService.add({
                          severity: 'error',
                          summary: 'Error',
                          detail: 'Failed to delete question.',
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
      this.questionDialog = true;
  }


 /**
   * Handles global filtering for the PrimeNG table.
   * @param table The PrimeNG Table instance.
   * @param event The input event.
   */
 onGlobalFilter(table: Table, event: Event) {
  table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
}

mergeFromQbank(question: Question): void {

this.questionService.mergeQuestionToTenant(question.id,this.activeTenantId!)
.pipe(
  tap(() => {
      // Step 2: On successful merge, add the source ID to our set and push to the subject
      const currentSet = this.mergedQuestionSourceIds.getValue();
      currentSet.add(question.id);
      this.mergedQuestionSourceIds.next(currentSet);
  })
).subscribe();

}

editQuestion(question: Question): void {
  this.questionId=question.id;
  this.isExistingUser=true;
  // Reset the form by patching with a blank object to avoid desync
  this.model={};
  this.form.patchValue({});

  // Patch the form with the top-level question data
  this.model=question; 
  
  this.form.patchValue(question);

  // Now, fetch the options separately and patch them
  this.questionService.getOptionsByQuestion(question.id!, this.activeTenantId!).pipe(
    take(1),
    //tap(options => console.log('Received options from service:', options))
  ).subscribe(options => {
    this.form.patchValue({options:null});
  
    // Wrap the patch and the logs in a setTimeout
    setTimeout(() => {
      this.model={...question,options:options};
      const optionsPatch = { options: options }; 
      this.form.patchValue(optionsPatch);    
     
    //this.form.patchValue({nm:'Anil'})
      // These logs will now show the final state of the form
      console.log('Final model with options:', this.model);
      console.log('Final form value:', this.form.value);
    }, 0);
  });
  
  this.submitted = false;
  this.questionDialog = true;
}
hideDialog(): void {
  this.questionDialog = false;
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
