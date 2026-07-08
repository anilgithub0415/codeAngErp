import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FieldWrapper } from '@ngx-formly/core';

@Component({
  selector: 'app-formly-wrapper-typeahead',
  imports: [CommonModule],
  templateUrl: './formly-wrapper-typeahead.component.html',
  styleUrl: './formly-wrapper-typeahead.component.scss'
})
export class FormlyWrapperTypeaheadComponent extends FieldWrapper{
selectOption(match: any) {
  console.log('searchOption is running..........');
  
    const activeKey = this.field.key as string;
    // Set the value directly to the form field control instance
    this.formControl.setValue(match[activeKey]);
    // Clear matches array to instantly hide overlay window panel
    this.props['suggestions'] = [];
  }
}
