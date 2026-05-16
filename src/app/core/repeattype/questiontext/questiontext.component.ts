
import { Component } from '@angular/core';
import { FieldType, FieldTypeConfig } from '@ngx-formly/core';

@Component({
  selector: 'app-questiontext',standalone:false,

  template: `
  
  <div [ngClass]="field.className">
  <!-- <label class="form-label font-semibold">{{ field.props?.label }}</label> --> <!-- label QuestionText hided purposely -->
    <p>{{ model?.question.questionText }}</p>
  <!--  <p>{{ model|json }}</p>   -->
  </div>
`,
  styleUrl: './questiontext.component.scss'
})
export class QuestiontextComponent  extends FieldType<FieldTypeConfig> {}