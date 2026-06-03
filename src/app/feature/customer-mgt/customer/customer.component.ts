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
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
@Component({
  selector: 'app-customer',
  imports: [ReactiveFormsModule, FormsModule,FormlyModule,CommonModule,
    DataViewModule,TagModule,
     TableModule, ButtonModule, InputNumberModule, InputTextModule, ToastModule
  ],
  providers:[MessageService],
  templateUrl: './customer.component.html',
  styleUrl: './customer.component.scss'
})
export class CustomerComponent {

leftCol = '30%'; rowHeight="50"
  form = new FormGroup({});
    model:Partial<createCustomer> = {};
    fields: FormlyFieldConfig[]=[];
 fs:FormlyFieldConfig[]=[];
    aForm!:any;

  customers:any;
    private formService=inject(FormService);
    private customerService=inject(CustomerService)
    
  
    constructor( private messageService: MessageService){
  
    }
  
    
    ngOnInit(): void {
  
      
      this.getForm_Customer();
      this.getCustomerList();

  
    }//ngOnInit


  
  getForm_Customer(){
//customer_form
console.log('get customer_forrm formly');

    this.formService.getForm('1','customer_form').subscribe(aform=>{
      console.log('yes got formly');
      
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
        customerName: this.model.customerName!,
        customerCategory: this.model.customerCategory!
        };
  
  
    
     this.customerService.createCustomer(createDto).subscribe(res=>console.log('Customer saved successfully!',res)   )
     }
      
    }






    
  removeCustomer(index: number) {
    this.customers.splice(index, 1);
      }
      saveCustomer() {
        if ( !this.form.valid) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Customer Name and Category is required' });
          return;
        }
        // TODO: Implement API call to save order
    
                      
      const createDto: createCustomer = {
        tenantId:'1',
        customerName: this.model.customerName!,
        customerCategory: this.model.customerCategory!,
        };
  
  
    
     this.customerService.createCustomer(createDto).subscribe(res=>console.log('Customer saved successfully!',res)   )
    
                    
        console.log('Saving Customer:', this.model);
        this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Customer saved successfully' });
      }
    
      clearCustomer() {
        this.model = { customerName: '', customerCategory: '' };
        this.form.reset();
      }

}
