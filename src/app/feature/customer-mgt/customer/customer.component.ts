import { Component, inject } from '@angular/core';
import { FormService } from '../../../core/services/form.service';
import {CustomerService} from '../../../core/services/customer.service'
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormlyConfig, FormlyField, FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { createFormDto } from '../../../core/models/form.model';
import {createCustomer} from '../../../core/models/customer.model'
import { DataViewModule } from 'primeng/dataview';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
@Component({
  selector: 'app-customer',
  imports: [ReactiveFormsModule, FormsModule,FormlyModule,CommonModule,
    DataViewModule,ButtonModule,TagModule,
  ],
  templateUrl: './customer.component.html',
  styleUrl: './customer.component.scss'
})
export class CustomerComponent {

leftCol = '30%'; rowHeight="50"
  form = new FormGroup({});
    model:Partial<createFormDto> = {};
    fields: FormlyFieldConfig[]=[];
 fs:FormlyFieldConfig[]=[];
    aForm!:any;

  customers:any;
    private formService=inject(FormService);
    private customerService=inject(CustomerService)
    
  
    constructor(){
  
    }
  
    
    ngOnInit(): void {
  
      
      this.getForm_Customer();
      this.getCustomerList();

  
    }//ngOnInit


  
  getForm_Customer(){
//customer_form
    this.formService.getForm('1','xyz').subscribe(aform=>{
      this.aForm=aform; 
      console.log('this.aForm.formlyConfig:',this.aForm.FormlyConfig);
      
      this.fields=JSON.parse(this.aForm.FormlyConfig) ;
      console.log('JSON.parse(this.aForm.FormlyConfig):',JSON.parse(this.aForm.FormlyConfig));
      
      

    })
  }



  getCustomerList(){
    this.customerService.getCustomers('1').subscribe(custs=>{
      this.customers=custs; 
      
    })
  }
    
    onSubmit(){
      console.log('creating customer');
      
      if(!this.form.valid){console.log('invalid form');
      }
     if(this.form.valid){
      const createDto: createCustomer = {
        tenantId:'1',
        customerName: this.form.get('cusomer_name')?.value!,
        customerCategory: this.form.get('customerCategory')?.value!
        
        
    };
  
  
    
     this.customerService.createCustomer(createDto).subscribe(res=>console.log('Customer saved successfully!',res)   )
     }
      
    }

}
