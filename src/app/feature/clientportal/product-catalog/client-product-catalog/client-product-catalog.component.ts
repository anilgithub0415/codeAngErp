import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit } from '@angular/core';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { CardModule } from 'primeng/card';
import { SelectModule } from 'primeng/select';
import { Product } from '../../../../core/models/product.model';
import { ProductService } from '../../../../core/services/product.service';
import { AuthService } from '../../../../core/services/auth.service';
import { tap } from 'rxjs';


export interface CatalogItem {
    sku: string;
    name: string;
    displayName: string;
    contractPrice: number;
}

@Component({
  selector: 'app-client-product-catalog',schemas:[CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule,CardModule, AutoCompleteModule, SelectModule],
  templateUrl: './client-product-catalog.component.html',
  styleUrl: './client-product-catalog.component.scss'
})
export class ClientProductCatalogComponent implements OnInit{
  tenantId!:number;
  
  private productService=inject(ProductService);
  private authServ=inject(AuthService);

  masterCatalog!:Product[];

      // Module 1: Products Mock Database & State
    //   masterCatalog: CatalogItem[] = [
    //       { sku: 'MOP-HD-COT', name: 'Heavy-Duty Cotton Mop Head 24oz', displayName: 'MOP-HD-COT - Heavy-Duty Cotton Mop Head 24oz', contractPrice: 14.50 },
    //       { sku: 'CLN-FLR-5L', name: 'Industrial Floor Cleaner Conc. (5L)', displayName: 'CLN-FLR-5L - Industrial Floor Cleaner Conc. (5L)', contractPrice: 32.00 },
    //       { sku: 'BRS-GMC-12', name: 'Grout & Mortar Counter Brush', displayName: 'BRS-GMC-12 - Grout & Mortar Counter Brush', contractPrice: 8.75 }
    //   ];
      selectedProduct: CatalogItem | null = null;
      filteredProducts: any[] = [];

        searchProducts(event: any) {
        const query = event.query.toLowerCase();
        this.filteredProducts = this.masterCatalog.filter(product => 
            product.prodName.toLowerCase().includes(query) || 
            product.sku!.toLowerCase().includes(query)
        );
    }



    ngOnInit(){
      this.tenantId=this.authServ.getTenantId()!;
      
    
      this.getProducts().subscribe();
    }
    
      getProducts() {
      return this.productService.getProducts(this.tenantId).pipe(
          tap((prods: any) => {
            
            this.masterCatalog = JSON.parse(JSON.stringify(prods)); 
    
                    
    
            console.log(this.masterCatalog);
            
            
          })
        );
        
      }
}
