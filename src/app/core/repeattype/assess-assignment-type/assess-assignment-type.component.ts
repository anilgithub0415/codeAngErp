import { CUSTOM_ELEMENTS_SCHEMA, Component, Input, OnInit } from '@angular/core';

import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import{Observable, map} from 'rxjs'
import { FormschemaService } from '../../services/formschema.service';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AssignmentAttemptService } from '../../services/assignment-attempt.service';
import { AuthService } from '../../services/auth.service';
import { AssignmentAttempt } from '../../models/assignment-attempt';

@Component({
  selector: 'app-assess-assignment-type',standalone:true, imports:[CommonModule,ReactiveFormsModule,FormlyModule],
  templateUrl: './assess-assignment-type.component.html',
  styleUrl: './assess-assignment-type.component.scss',
  schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class AssessAssignmentTypeComponent implements OnInit {
@Input() assignmentAttemptId!:number;  
activeTenantId!:string|null;

  form = new FormGroup({});
  formFields!: Observable<FormlyFieldConfig[]|null>;
  model:any={}
  displayForm:boolean=false;
  

  constructor( private formschemaService:FormschemaService,
    public authService:AuthService,
    private assignAttemptService:AssignmentAttemptService,){}
  
  ngOnInit(){
    this.activeTenantId=  this.authService.getTenantId();
    this.loadformThruBackendJSON()
    this.loadStudentAnswersOfAssignment(this.activeTenantId!)
  }

  loadformThruBackendJSON(){
    var whichForm='assessAssignment';
    this.formFields=
       this.formschemaService.getFormschema(whichForm).pipe( (res:any)=> {
              console.log('json ',res);
              this.displayForm=true;
              
        return res;})
  }
  
  loadStudentAnswersOfAssignment(ptenantId:string):void{
    this.assignAttemptService.getAssignmentAttemptDetailsByAttemptId(ptenantId,58).pipe(
    ).subscribe(data=>{this.model=data})
  }

  onSubmit(){

  }
}
