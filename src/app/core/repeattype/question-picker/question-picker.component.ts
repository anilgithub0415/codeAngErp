import { Component, OnInit } from '@angular/core';

import { FieldType, FormlyFieldConfig } from '@ngx-formly/core';
import { QuestionService } from '../../services/question.service';
import { Question } from '../../models/question.model';
import { AuthService } from '../../services/auth.service';

import { distinctUntilChanged, filter, map, shareReplay, startWith, tap } from 'rxjs/operators';
import { Observable, Subscription, combineLatest } from 'rxjs';
import { LookupService } from '../../services/lookup.service';
import { AssignmentQuestion } from '../../models/assignment-question';


interface FilterOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-question-picker',standalone:false,
  //imports: [],
  templateUrl: './question-picker.component.html',
  styleUrl: './question-picker.component.scss'
})
export class QuestionPickerComponent extends FieldType implements OnInit{
  activeTenantId!:string|null;

  displayDialog: boolean = false;
  allQuestions!: Question[];
  filteredQuestions!:Question[];
  selectedQuestions: Question[] = [];

 
    // Add a subscription to manage the form control changes
    private valueChangesSub!: Subscription;
  
  topicOptions: any[] = [];
  questionTypeOptions: any[] = [];
  categoryOptions: any[] = [];
  purposeOptions: any[] = [];

  
  selectedTopic: number=0 ;
  selectedQuestionType: string = '';
  selectedCategory: string = '';
  selectedPurpose: string = '';

  constructor(private authService:AuthService,private questionService:QuestionService,private lookupService:LookupService,) {
    super();
  }

  ngOnInit(): void {
    
          this.activeTenantId = this.authService.getTenantId();
           
    // Load all questions from the backend. We'll combine this with the form value later.
    const allQuestions$ = this.questionService.getQuestions(this.activeTenantId!).pipe(
      shareReplay({ bufferSize: 1, refCount: true })
    );

    // Get the initial value from the form control (if any).
    // This handles the case where the form is pre-populated for editing.
    const formValue$ = this.formControl.valueChanges.pipe(
      startWith(this.formControl.value),
      distinctUntilChanged(),
      map(value => value || []), // Ensure it's always an array
      tap((questions:any) => console.log('Form Control Value Changed:', questions))
    );

    // Wait for both the full list of questions AND the form value to be available.
    this.valueChangesSub = combineLatest([allQuestions$, formValue$]).subscribe(
      ([allQuestions, currentFormValue]: [Question[], AssignmentQuestion[]]) => {
  this.displayDialog=true;
        this.allQuestions = allQuestions;
        this.filteredQuestions = [...allQuestions]; // Keep a copy for filtering

        // Reset selected status for all questions
        this.allQuestions.forEach(q => (q as any).selected = false);

        // Build the selectedQuestions array based on the current form value
        this.selectedQuestions = currentFormValue
          .map(aq => {
            // Find the corresponding full question object
            const fullQuestion = this.allQuestions.find(q => q.id === aq.questionId);
            if (fullQuestion) {
              // Mark it as selected and add points
              (fullQuestion as any).selected = true;
              (fullQuestion as any).points = aq.points;
            }
            return fullQuestion;
          })
          .filter(q => q !== undefined) as Question[]; // Filter out any questions not found

        // The UI will now be updated automatically
        console.log('Questions populated successfully:', this.selectedQuestions);
      }
    )
          this.lookupService.getTopics(this.activeTenantId!).subscribe(res=>this.topicOptions=res);
          this.lookupService.getQuestionTypes(this.activeTenantId!).subscribe(res=>this.questionTypeOptions=res);
          this.lookupService.getQuestionCategories(this.activeTenantId!).subscribe(res=>this.categoryOptions=res);
          this.lookupService.getQuestionPurposes(this.activeTenantId!).subscribe(res=>this.purposeOptions=res);

  
          this.resetFilteredQuestions();
  }

  
    ngOnDestroy(): void {
        // Unsubscribe to prevent memory leaks
        if (this.valueChangesSub) {
          this.valueChangesSub.unsubscribe();
        }
  }

  showDialog(): void {
    this.displayDialog = true;
    this.resetFilteredQuestions();
  }

  hideDialog(): void {
    this.displayDialog = false;
  }

  
  filterQuestions(): void { console.log('............model is',this.model);
  
    this.filteredQuestions = this.allQuestions.filter(q =>
      (this.selectedTopic === 0 || q.topic.id === this.selectedTopic!) &&
      (this.selectedQuestionType === '' || q.questionTypeName === this.selectedQuestionType) &&
      (this.selectedCategory === '' || q.questionCategoryName === this.selectedCategory) &&
      (this.selectedPurpose === '' || q.questionPurposeName=== this.selectedPurpose)
    );
  }
  onQuestionSelection(): void { // Synchronize selections
   
    this.allQuestions.forEach(q => {
      const filteredQ = this.filteredQuestions.find(fq => fq.id === q.id);
      if (filteredQ) {
        q.selected = filteredQ.selected;
      }
    });
      this.selectedQuestions=this.allQuestions.filter(q=>q.selected); 
      
    }
  
    
  onPointsChange(): void {
    this.updateModel();
  }

  addSelectedQuestions(): void {
    this.selectedQuestions = this.allQuestions.filter(q => q.selected);
    this.updateModel();
    this.hideDialog();
  }

  removeQuestion(index: number): void {
    const removedQuestion = this.selectedQuestions[index];
    // Also deselect it in the master list
    const masterQuestion = this.allQuestions.find(q => q.id === removedQuestion.id);
    if (masterQuestion) {
      masterQuestion.selected = false;
    }
    this.selectedQuestions.splice(index, 1);
    this.updateModel();
  }

  private updateModel(): void {
    const questionsForModel = this.selectedQuestions.map(q => ({
      
      questionId: q.id,
      points: q.points,
      orderInAssignment: 0 // You can implement a drag-and-drop feature to manage order later
    }));
    this.formControl.setValue(questionsForModel);
  }
  private resetFilteredQuestions(): void {
    this.selectedTopic = 0;
    this.selectedQuestionType = '';
    this.selectedCategory = '';
    this.selectedPurpose = '';
    this.filterQuestions();
  }
}