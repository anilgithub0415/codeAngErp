import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataViewModule } from 'primeng/dataview';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { TagModule } from 'primeng/tag';
import { CustomerMgtRoutingModule } from './customer-mgt-routing.module';
import { FormlyModule, provideFormlyConfig } from '@ngx-formly/core';
import { FormlyPrimeNGModule } from '@ngx-formly/primeng';

import { TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { CustomerComponent } from './customer/customer.component';

import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TestComponent } from './test/test.component';
import { FormlyFieldPrimengDropdownComponent } from '../../shared/components/formlyfields/formly-field-primeng-dropdown/formly-field-primeng-dropdown.component';
import { SelectModule } from 'primeng/select';
import { RepeatFormlySectionComponent } from '../../shared/components/formlyfields/repeat-formly-section/repeat-formly-section.component';
import { FormlyInputModule } from '@ngx-formly/primeng/input';
import { RippleModule } from 'primeng/ripple';
import { FormlyCustomRowBridgeComponent } from '../../shared/components/formlyfields/formly-custom-row-bridge/formly-custom-row-bridge.component';
//import { createFormDto } from '../../../core/models/form.model';


@NgModule({
  // providers:[
                    // provideFormlyConfig({
                    //     types:[{name: 'p-select', component:FormlyFieldPrimengDropdownComponent},
                    //         { name: 'repeatFormlySection', component:RepeatFormlySectionComponent}
                    //     ]
                    // })
                // ],
  declarations: [CustomerComponent,TestComponent],
  imports: [
    ReactiveFormsModule, FormsModule,CommonModule,SelectModule,
        DataViewModule,TagModule,FormlyPrimeNGModule,
         TableModule, ButtonModule, RippleModule,PanelModule, InputNumberModule, FormlyInputModule,InputTextModule, ToastModule,
    CustomerMgtRoutingModule, FormlyModule,FormlyPrimeNGModule,FormlyCustomRowBridgeComponent

  ]
})
export class CustomerMgtModule { }
