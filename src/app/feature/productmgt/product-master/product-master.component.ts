import { CUSTOM_ELEMENTS_SCHEMA, Component, Inject, OnInit, inject } from '@angular/core';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms'
import {FormlyFieldConfig, FormlyModule} from '@ngx-formly/core'
import { ProductService } from '../../../core/services/product.service';
import { ConfigService } from '../../../config.service';
import { FormlyPrimeNGModule } from '@ngx-formly/primeng';
import { AuthService } from '../../../core/services/auth.service';
import { CreateProductDto } from '../../../core/models/product.model';
import { CommonModule } from '@angular/common';
import { DataViewModule } from 'primeng/dataview';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { PrimeNG } from 'primeng/config';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
@Component({
  selector: 'app-product-master', 
  schemas:[CUSTOM_ELEMENTS_SCHEMA],
  imports: [ReactiveFormsModule, FormsModule,FormlyModule,DataViewModule,TagModule,
    CommonModule, TableModule, ButtonModule, InputNumberModule, InputTextModule, ToastModule
  ],
   providers: [MessageService],
  templateUrl: './product-master.component.html',
  styleUrl: './product-master.component.scss'

})
export class ProductMasterComponent {
   
leftCol = '30%'; rowHeight="50"
  form = new FormGroup({});
  model:Partial<CreateProductDto> = {};
  fields: FormlyFieldConfig[]=[];


  products!:any[];

  private productService=inject(ProductService);
  
 private configService=inject(ConfigService);

  constructor(private authService:AuthService, private messageService: MessageService){

  }

  
  ngOnInit(): void {

    
    this.getProductFormFields();
    this.getProductList();

  }//ngOnInit

  getProductFormFields(){
//getFieldsfrom db
    this.productService.getProducttableFieldsConfig('1').subscribe((dbFields:any[])=>{

        this.fields = dbFields.map(dbField=>{
          if (dbField.FieldType=='input'){
          return {
            key: dbField.FieldName,
            type: dbField.FieldType,
            props: {
              label:dbField.FieldLabel,
              required: dbField.IsRequired,
              type:dbField.FieldName==='password'?'password':'text'
              
            },


          }
        } 
       else if (dbField.FieldType=='select'){
          return {
            key: dbField.FieldName,
            type: dbField.FieldType,
            props: {
              label:dbField.FieldLabel,
              required: dbField.IsRequired,
             // options:JSON.parse({"label":"DataEntry","value":"DataEntry"})
            options:[{"label":"DataEntry","value":"DataEntry"},{"label":"purchaserole","value":"purchaserole"}]
            //  options:JSON.parse(dbField.SelectOptions),
            //   valueProp:'value',
            //   labelProp:'label'
            },


          }
        }
        else return {}
        
        })
        console.log(this.fields);
        
    })
  }
  getProductList(){
    this.productService.getProducts(1).subscribe(prods=>{
      this.products=prods; console.log('prods:',prods);
      
    })
  }
  
onEditClick(selectedRecord:any){
    this.model={...selectedRecord}
}
  
  onSubmit(){
    if(!this.form.valid){console.log('invalid form');
    }
   if(this.form.valid){
    const createDto: CreateProductDto = {
      tenantId:'1',
      prodName: this.model.prodName!,
      description: this.model.description,
      sku: this.model.sku!,
      basePrice:this.model.basePrice,
      
      customAttributes:{
            tier_prices:{
              "B2C_price":this.model['B2C_price'],
              "B2B_price":this.model['B2B_price'],
              "B2BC_price":this.model['B2BC_price']
            }
      }    
      
  };
  
   this.productService.createProduct(createDto).subscribe(res=>console.log('Product saved successfully!',res)   )

   }//valid form
    
  }



  removeProduct(index: number) {
    this.products.splice(index, 1);
      }
  saveProduct() {
    if (!this.model.prodName || !this.model.basePrice || !this.form.valid) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Product Name and Price is required' });
      return;
    }
    // TODO: Implement API call to save order

                  const createDto: CreateProductDto = {
                    tenantId:'1',
                    prodName: this.model.prodName!,
                    description: this.model.description,
                    sku: this.model.sku!,
                    basePrice:this.model.basePrice,
                    
                    customAttributes:{
                          tier_prices:{
                            "B2C_price":this.model['B2C_price'],
                            "B2B_price":this.model['B2B_price'],
                            "B2BC_price":this.model['B2BC_price']
                          }
                    }    
                    
                };
                
                this.productService.createProduct(createDto).subscribe(res=>console.log('Product saved successfully!',res)   )

                
    console.log('Saving Product:', this.model);
    this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Product saved successfully' });
  }

  clearProduct() {
    this.model = { prodName: '', description: '', sku:'', basePrice:0 };
    this.form.reset();
  }

}
