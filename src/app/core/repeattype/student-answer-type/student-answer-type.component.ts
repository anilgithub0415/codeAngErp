import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';
import { FieldType } from '@ngx-formly/core';

@Component({
  selector: 'app-student-answer-type',standalone:false,
  
  templateUrl: './student-answer-type.component.html',
  styleUrl: './student-answer-type.component.scss',
  
})
export class StudentAnswerTypeComponent extends FieldType{
 
  ngOnInit(){
       
  }
  // Inside your component class
  onCheckboxChange(event: any, optionText: string) {
    // Get the current value, using an empty array as the default if it's undefined.
  const formControlValue: string[] = this.formControl.value || [];

  if (event.target.checked) {
    // Add the option to the array if it's not already there.
    if (!formControlValue.includes(optionText)) {
      this.formControl.setValue([...formControlValue, optionText]);
    }
  } else {
    // Remove the option from the array if the checkbox is unchecked.
    this.formControl.setValue(formControlValue.filter(value => value !== optionText));
  }

  
}
 
onAnswerTextBoxChange(event: any, answerText: string){
  const formControlValue: string[] = this.formControl.value || [];
  this.formControl.setValue([...formControlValue, answerText]);
}

}
