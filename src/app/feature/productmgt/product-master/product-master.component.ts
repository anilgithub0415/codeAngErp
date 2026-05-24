import { CUSTOM_ELEMENTS_SCHEMA, Component, Inject, OnInit, inject } from '@angular/core';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms'
import {FormlyFieldConfig, FormlyModule} from '@ngx-formly/core'
import { ProductService } from '../../../core/services/product.service';
import { ConfigService } from '../../../config.service';
import { FormlyPrimeNGModule } from '@ngx-formly/primeng';
import { AuthService } from '../../../core/services/auth.service';
import { CreateProductDto } from '../../../core/models/product.model';
@Component({
  selector: 'app-product-master',
  imports: [ReactiveFormsModule, FormsModule,FormlyModule],
  templateUrl: './product-master.component.html',
  styleUrl: './product-master.component.scss'
})
export class ProductMasterComponent {
   

  form = new FormGroup({});
  model:Partial<CreateProductDto> = {};
  fields: FormlyFieldConfig[]=[];

  private productService=inject(ProductService);
  
 private configService=inject(ConfigService);

  constructor(private authService:AuthService){

  }

  
  ngOnInit(): void {

    

    //getFieldsfrom db
    this.productService.getProducttableFieldsConfig().subscribe((dbFields:any[])=>{

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
            // options:[{"label":"DataEntry","value":"DataEntry"},{"label":"purchaserole","value":"purchaserole"}]
             options:JSON.parse(dbField.SelectOptions)
              
            },


          }
        }
        else return {}
        
        })
        console.log(this.fields);
        
    })

  }//ngOnInit

  onSubmit(){
   if(this.form.valid){
    const createDto: CreateProductDto = {
      prod_name: this.model.prod_name!,
      description: this.model.description,
      sku: this.model.sku!,
      base_price:this.model.base_price      
      
  };


  console.log('creating product :',createDto);
  
   this.productService.createProduct(createDto).subscribe(res=>console.log('Product saved successfully!',res)   )
   }
    
  }

}
