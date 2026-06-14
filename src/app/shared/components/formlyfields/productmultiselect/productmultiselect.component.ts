import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import {FieldType} from '@ngx-formly/core'
import{HttpClient } from '@angular/common/http'
import { ProductService } from '../../../../core/services/product.service';
import { CommonModule } from '@angular/common';
import { MultiSelectModule } from 'primeng/multiselect';
@Component({
  selector: 'app-productmultiselect',
  schemas:[CUSTOM_ELEMENTS_SCHEMA],
  standalone:true,
  imports: [CommonModule,MultiSelectModule],
  templateUrl: './productmultiselect.component.html',
  styleUrl: './productmultiselect.component.scss'
})
export class FormlyFieldProductmultiselect extends FieldType implements OnInit, AfterViewInit{
 public productOptions:any[]=[]; 

  private productService=inject(ProductService);
  public binded_products:boolean=false;
  constructor(private http:HttpClient, private cdr:ChangeDetectorRef){
    super()
  }
  ngOnInit(){
    this.productService.getProducts(1).subscribe({
      next:(data:any)=>{
      // normalize incoming product objects to have `label` and `value`
      const raw: any[] = Array.isArray(data) ? data : [];
      this.productOptions = raw.map(p => ({
        ...p,
        label: p?.prodName ?? p?.name ?? p?.description ?? p?.sku ?? p?.code ?? '',
        value: p?.id ?? p?.sku ?? p?.code ?? p?.prodName ?? p?.name
      }));
     
      this.binded_products = true;
      this.cdr.detectChanges();
      },
      error:(error)=>{
        this.binded_products=false; console.log('error occured');
          this.cdr.detectChanges();
      }
      
    })

  }

  ngAfterViewInit(){
    console.log('its ngAfterViewInit done...');
    
  }
}
