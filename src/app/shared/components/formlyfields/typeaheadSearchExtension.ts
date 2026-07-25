import { FormlyFieldConfig } from "@ngx-formly/core";

export function typeaheadSearchExtension(field: FormlyFieldConfig) {
  // ──► THE GUARD CLAUSE ◄──
  // If 'searchable' is missing or false in the JSON, stop executing immediately!
  if (!field.props || !field.props['searchable']) {
    return; 
  }

  // This code below runs ONLY for fields where searchable is true
  field.props['suggestions'] = [];
  field.props['onInput'] = (event: any) => { 
    //yet to write code
    console.log('yet to write code for searchable fields');
    
   };
}
