//pending- save progress or Next Question buttons to incrementally save answer to DB 
//set starttime , endtime 
// redirect to reviewresult page
//start Attempt - a POST endpoint
//save answer - PUT/POST endpoint
//Submit Attempt - PUT endpoint

//Note: for single question model variable used is 'model_SingleQuestion'
//      for all question model variable used is 'model'
//      so while single question answer merging 'model_SingleQuestion' is used to merge into main variable assignment
//      nextQuestion method uses model_SingleQuestion to merge into 'assessment      
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';

import { Component, OnInit,AfterViewInit, signal, ViewChild, HostListener } from '@angular/core';
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

interface AssignmentFormValue {
  assignmentQuestions: {
    question?: { id: number };
    studentAnswer?: string | string[];
  }[];
}

export interface AssignmentAttemptDisplayModel extends AssignmentAttempt {
  canEdit$: Observable<boolean>;
  canDelete$: Observable<boolean>;
}
@Component({
  selector: 'app-assignmenttake',
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
providers:[MessageService,ConfirmationService,DatePipe],
  templateUrl: './assignmenttake.component.html',
  styleUrl: './assignmenttake.component.scss'
})
export class AssignmenttakeComponent {
  assignmentId!:number; assignmentSolvingDialog:boolean=true;submitted!:boolean;
  assignmentPurpose!:string; questionTimeLimitSeconds!:any; quizTimeLimitSeconds!:any;

  assignmentAttemptId!:number;
  activeTenantId!:string|null;
  studentProfileId!:number;

  form = new FormGroup({});
  model: any ={}

  currentUser: User | null = null; 
  tenantIdFromusercontext!:string;

  
  formFields!: Observable<FormlyFieldConfig[]|null>;
  assignmentAttempt!: Partial<AssignmentAttemptDisplayModel>;
  isExistingAssignAttempt:boolean=false;
  assignmentAttemptDialog:boolean=false;

  //for single question to display -----------------------------
  
  form_SingleQuestion = new FormGroup({});
  formFields_SingleQuestion!: Observable<FormlyFieldConfig[]|null>;
  model_SingleQuestion: any ={}
  // The full assignment object with all questions
  assignment: any;
  // The current question's index
  currentQuestionIndex: number = 0;
  SingleQuestionMode:boolean=false;
  remainingTime: number = 0;
  timerInterval: any=3;
  //-----------------------------------------------------------



 constructor(private sanitizer: DomSanitizer,private activatedRoute: ActivatedRoute,  public authService:AuthService,  
  private assignmentService:AssignmentService, private assignmentAttemptService:AssignmentAttemptService,
  private usercontextService:UserContextService,
  private formschemaService:FormschemaService,      private lookupService:LookupService,
  private messageService: MessageService,
  private router:Router
  ){

    
  this.usercontextService.currentUserProfile$.pipe(
    distinctUntilChanged(),
    filter((cuser:any) => cuser!=null),
  ).subscribe(cuser=>{
          this.currentUser=cuser; 
          
          this.tenantIdFromusercontext=this.currentUser?.tenantId!

          //pending- static assign
          this.studentProfileId=this.currentUser!.person.studentProfile.id;

               
 })


}
   // This method tells Angular to bypass its security and trust the incoming HTML.
  // It's used with the [innerHtml] binding in the template.
  public sanitizeHtml(html: string): SafeHtml {
    console.log('.... its been called to sanitize...........');
    
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

 ngOnInit(){
  
  this.activeTenantId=  this.authService.getTenantId();
  
            localStorage.setItem('isSourceAssignmentSolver',String(true));

            
    this.activatedRoute.queryParamMap.subscribe(params=>
      {     
        this.assignmentId=parseInt(params.get('id')!);
        this.assignmentPurpose=params.get('assignmentPurpose')!; 
        this.questionTimeLimitSeconds= params.get('questionTimeLimitSeconds')!; 
        this.quizTimeLimitSeconds=params.get('quizTimeLimitSeconds')! 
        

      })

            // this.activatedRoute.paramMap.subscribe(params=>
            //   {     
            //     this.assignmentId=parseInt(params.get('id')!);

            //   })
          

          

          this.activeTenantId=  this.authService.getTenantId();
          this.model.tenantId= this.activeTenantId;
          //Load json forform from backend -------------------------------------
          var whichForm='assignmentSolving';
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
                  console.log('formschema received:',res);
                  
                  
                  return res;}
              
            )

         
            //dont load all questions if QUiz and questionTimeLimitSeconds not null
            if(this.assignmentPurpose==='Quiz' && parseInt(this.questionTimeLimitSeconds)>0){
             
              //load single question
              this.SingleQuestionMode=true;
              this.initializeQuiz(this.assignmentId,this.tenantIdFromusercontext!,true);// send this last param true for singleQuestion

             // this.loadQuestion();
            }
            else if(this.assignmentPurpose==='Quiz' && this.quizTimeLimitSeconds!=null && parseInt(this.quizTimeLimitSeconds)>0){
           
              this.initializeQuiz(this.assignmentId,this.tenantIdFromusercontext!,false);

            }
            else{
            
                this.loadAssignmentquestions(this.assignmentId,this.tenantIdFromusercontext!)
            }

  }

  
    // --- New: OnDestroy hook to clean up event listener ---
    ngOnDestroy(): void {
      this.removeBeforeUnloadListener();
  }

  // --- New: HostListener for beforeunload event ---
  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any): void {
      // Only show the warning if the timer is running and the quiz is not submitted
      if (this.timerInterval) { //this.SingleQuestionMode && 
          $event.returnValue = true;
      }
  }

  // --- New: Methods to manage the listener ---
  setupBeforeUnloadListener(): void {
      window.addEventListener('beforeunload', this.unloadNotification.bind(this));
  }

  removeBeforeUnloadListener(): void {
      window.removeEventListener('beforeunload', this.unloadNotification.bind(this));
  }

// Refactored method
async loadAssignmentquestions(assignmentId: number, ptenantId: string): Promise<any> {
  try {
      const res = await firstValueFrom(
          this.assignmentService.getAssignmentsById(assignmentId!, ptenantId)
      );
      this.model=res;
      return res; // Return the fetched data
  } catch (error) {
      console.error('Error loading assignment questions:', error);
      throw error; // Propagate the error
  }
}


async initializeQuiz(assignmentId: number, ptenantId: string,isSingleQuestion:boolean=false): Promise<void> {
  try {
      // First method call: Wait for the assignment data to be fetched
      const assignmentData = await this.loadAssignmentquestions(assignmentId, ptenantId);


      // Now that the data is available, process it and load the first question
      this.assignment = assignmentData;
      this.model = assignmentData;
      
      console.log('Assignment data loaded. Now loading the first question...');

      // Second method call: Load the first question
      if(isSingleQuestion){      this.loadQuestion(); }
      else {this.startTimer_For_Quiz()}

  } catch (error) {
      console.error('Failed to initialize quiz:', error);
  }
}

  //loadSingleQuestion

loadQuestion(): void { 
  if (this.currentQuestionIndex < this.assignment.assignmentQuestions.length) {
    const currentQuestionData = this.assignment.assignmentQuestions[this.currentQuestionIndex];
                                              //assignmentQuestions 
    // Reset the form group for each new question
    //this.form_SingleQuestion.reset();

    // The Formly model for this question is the question object itself
    this.model_SingleQuestion = { 
      question: currentQuestionData.question,
      studentAnswer: currentQuestionData.studentAnswer 
    };   

            var whichForm='assignmentSolving_SingleQuestion';
            this.formFields_SingleQuestion=
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
                    console.log('formschema received:',res);
                    
                    
                    return res;}
                
              )
    // You would start your 60-second timer here
     this.startTimer();
    
  } else {
    // All questions have been answered, navigate to a results page or show a summary
    console.log("Quiz finished! Final Answers:", this.assignment.assignmentQuestions);

  //  this.router.navigate(['../reviewresult'], { relativeTo: this.activatedRoute });
  }
}
                            
                          // Inside AssignmenttakeComponent class

                          startTimer(): void {
                            // Use the time limit from your assignment object
                            if(this.questionTimeLimitSeconds!=null && parseInt(this.questionTimeLimitSeconds)>0){
                            this.remainingTime = this.assignment.questionTimeLimitSeconds || 60; // Use a default if null
                            }
                            
                            // Stop any existing timer to prevent duplicates
                            this.stopTimer();

                            this.timerInterval = setInterval(() => {
                              if (this.remainingTime > 0) {
                                this.remainingTime--;
                              } else {
                                // Time is up, move to the next question
                                this.stopTimer();
                                this.nextQuestion();
                              }
                            }, 1000); // Update every 1 second
                          }

                          stopTimer(): void {
                            if (this.timerInterval) {
                              clearInterval(this.timerInterval);
                              this.timerInterval = null;
                            }
                          }
                          nextQuestion(): void {
                            // Always stop the timer before moving to the next question
                            this.stopTimer();
                            
                            // Your logic to save the answer and advance
                            //merging answer into main variable assignment
                         // if(this.currentQuestionIndex==0){alert(this.model_SingleQuestion.studentAnswer)}
                          //  console.log('copying question to current index:',this.model_SingleQuestion);
                            
                            this.assignment.assignmentQuestions[this.currentQuestionIndex] = this.model_SingleQuestion;
                          //  console.log('copied question to current index:',this.assignment.assignmentQuestions[this.currentQuestionIndex]);
                           this.assignment.assignmentQuestions[this.currentQuestionIndex].studentAnswer = this.model_SingleQuestion.studentAnswer;
                          
                            //also merge to main model
                           // this.model.assignmentQuestions[this.currentQuestionIndex].studentAnswer=this.model_SingleQuestion.studentAnswer;
 
 

                            this.currentQuestionIndex++;
                            this.loadQuestion();
                            console.log('moel:', this.model)
                          }


                          //quiz as a whole
                          startTimer_For_Quiz(){
                            if(this.quizTimeLimitSeconds!=null && parseInt(this.quizTimeLimitSeconds)>0){
                            
                              this.remainingTime = this.quizTimeLimitSeconds || 10*this.assignment.assignmentQuestions.length; 
                            }
                           
                            // Stop any existing timer to prevent duplicates
                            this.stopTimer();

                            this.timerInterval = setInterval(() => {
                              if (this.remainingTime > 0) {
                                this.remainingTime--;
                              } else {
                                // Time is up, move to the next question
                                this.stopTimer();
                                //submit whole assignment
                                this.onSubmit()
                              }
                            }, 1000); // Update every 1 second
                           
                          }

onSubmit() {
  if (this.form.valid) { // Cast the form's value to our defined interface.
    var formValue;
    //for all questions
    if(!this.SingleQuestionMode){
       formValue = this.form.value as AssignmentFormValue;
    }
      //for single question
    else if(this.SingleQuestionMode){
    formValue=this.assignment;
    }

    const formQuestions = formValue.assignmentQuestions;

    if (!formQuestions || formQuestions.length === 0) {
      console.error('No assignment questions found in the form data.');
      return;
    }

    // Map over the formQuestions array to build the submission model.
    const studentQuestionAnswers = formQuestions.map((question:any) => {
      // The questionId is available in the nested 'question' object.
      // We use the optional chaining operator (?) to safely access the properties.
      console.log('mapping question:',question);
      
      const questionId = question.question?.id;
      // The studentAnswer is a property on the nested question object.
      const studentAnswer = question.studentAnswer;

      return {
        questionId: questionId,
        studentAnswerContent: studentAnswer
      };
    });

    const submissionModel = {
      //id:0,
      tenantId:this.activeTenantId!,
      assignmentId: this.assignmentId,
      studentProfileId: this.studentProfileId, //pending- static
      submissionDate: new Date(),
      status:AssignmentAttemptEnum.Submitted, 
      studentQuestionAnswers: studentQuestionAnswers
    };

    console.log('Final Submission Model:', submissionModel);
//    alert('Form submitted successfully! Check the console for the data.');

          var sub1;var msg_AssignmentAttemptCreatedOrUpdated:string='';
          if(this.isExistingAssignAttempt){
            //there is no question of edit AssignmentAttempt of student
            // msg_AssignmentAttemptCreatedOrUpdated= 'AssignmentAttempt Updated';
           //static assign
          //this.assignmentAttemptId=3
//         sub1=   this.assignmentAttemptService.updateAssignmentAttempt(this.assignmentAttemptId!,submissionModel); //dont use this.model here 
        }
          else{
            msg_AssignmentAttemptCreatedOrUpdated= 'AssignmentAttempt Added'
          sub1=this.assignmentAttemptService.createAssignmentAttempt(submissionModel)
          }
          sub1!.subscribe({
              next: (responseAssignmentAttempt) => {
               // this.loadAssignmentquestions(this.assignmentId,this.tenantIdFromusercontext!);//  this.loadAssignmentAttempts(this.currentAssignmentAttempt?.tenantId!); // Reload users after successful deletion
               let navigationExtras: NavigationExtras = {
                queryParams: { 'id': responseAssignmentAttempt.id }
              };
               this.router.navigate(['/app/assignmenthub/reviewresult'], navigationExtras); //no redirect for see reviewresult
             //  alert('navigate to ..reviwresult with id:'+responseAssignmentAttempt.id)
              // this.router.navigate(['/app/assignmenthub/reviewresult',responseAssignmentAttempt.id]);//, { relativeTo: this.activatedRoute }
                this.assignmentAttemptDialog=false;
                  this.assignmentAttempt = {}; // Clear the form
                  this.messageService.add({
                      severity: 'success',
                      summary: 'Successful',
                      detail:msg_AssignmentAttemptCreatedOrUpdated,
                      life: 3000
                  });
              },
              error: (err:any) => {
                  console.error('Error updating assignmentAttempt:', err);
                  this.messageService.add({
                      severity: 'error',
                      summary: 'Error',
                      detail: 'Failed to update assignmentAttempt.',
                      life: 3000
                  });
              }
          });


  } else {
    alert('Please fill out all required fields.');
  }
}

get dialogHeader(): string {
  //return (this.assignment && this.assignment.id) ? 'Edit Assignment' : 'New Assignment'; // Direct access to user.id
  return 'xyz header'
}


hideDialog(): void {
  this.assignmentSolvingDialog = false;
  this.submitted = false;
  
}

}
