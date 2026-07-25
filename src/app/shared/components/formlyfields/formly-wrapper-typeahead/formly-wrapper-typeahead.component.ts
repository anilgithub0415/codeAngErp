import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FieldWrapper } from '@ngx-formly/core';

@Component({
  selector: 'app-formly-wrapper-typeahead',
  imports:[CommonModule],
  templateUrl: './formly-wrapper-typeahead.component.html',
  styleUrl: './formly-wrapper-typeahead.component.scss'
})
export class FormlyWrapperTypeaheadComponent extends FieldWrapper {

  /**
   * Safe Utility Converter
   * Extracts a valid string index lookup from any Formly field key signature type
   */
  getStringKey(key: string | number | (string | number)[] | undefined): string { console.log('getStrig......................');
  
    if (!key) return '';
    if (Array.isArray(key)) {
      // If it's an array key path (e.g. ['address', 'zip']), grab the last leaf item node
      return String(key[key.length - 1]);
    }
    return String(key);
  }

  // selectOption(match: any) {
  //   const activeKey = this.getStringKey(this.field.key);
  //   this.formControl.setValue(match[activeKey]);
  //   this.props['suggestions'] = [];
    
  //   if (this.formControl.hasError('mobileExists')) {
  //     this.formControl.setErrors(null);
  //   }
  // }
    selectOption(match: any) {
    const activeKey = this.getStringKey(this.field.key);
    
    // 1. Fire the custom callback hook passing the full object structure 
    if (this.props['onSuggestionSelected']) {
      this.props['onSuggestionSelected'](match);
    }

    // 2. Patch the text value into the input field
    this.formControl.setValue(match[activeKey]);
    
    // 3. Clear suggestions list to hide the dropdown panel box
    this.props['suggestions'] = [];
    
    if (this.formControl.hasError('mobileExists')) {
      this.formControl.setErrors(null);
    }
  }

}
