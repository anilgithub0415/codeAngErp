
import { CommonModule } from '@angular/common';
import {  Component, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, OnInit } from '@angular/core';
import { FieldArrayType, FormlyFieldConfig } from '@ngx-formly/core';
import { ButtonModule } from 'primeng/button';
@Component({
  selector: 'app-repeatsectiontype',standalone:true,// 
  imports:[CommonModule,ButtonModule],
  schemas:[CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './repeatsectiontype.component.html',
  styleUrl: './repeatsectiontype.component.scss'
})
export class RepeatsectiontypeComponent extends FieldArrayType  implements OnInit{
  isSourceAssignmentSolver:boolean=false;
  // No need for custom add() and remove() methods; they are provided by FieldArrayType.
  constructor() {
    super();
  }

  ngOnInit(): void {
    this.isSourceAssignmentSolver = localStorage.getItem('isSourceAssignmentSolver')! === 'true';
  }
  isNotANumber(value: any): boolean {
    return isNaN(value); // Or return Number.isNaN(value);
  }

 

}