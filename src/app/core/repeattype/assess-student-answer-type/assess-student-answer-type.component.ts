import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FieldType } from '@ngx-formly/core';

@Component({
  selector: 'app-assess-student-answer-type',standalone:true,
  imports:[CommonModule],
  templateUrl: './assess-student-answer-type.component.html',
  styleUrl: './assess-student-answer-type.component.scss'
})
export class AssessStudentAnswerTypeComponent  extends FieldType{

}
