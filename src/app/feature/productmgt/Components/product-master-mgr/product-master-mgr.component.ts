import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { firstValueFrom, tap } from 'rxjs';

import { FormOpMode } from '../../../../shared/enums/FormOpMode.enum';
import { ProductService } from '../../../../core/services/product.service';
import { ProductCategoryService } from '../../../../core/services/product-category.service';
import { HSNTaxRuleService } from '../../../../core/services/hsntaxrule.service';
import { AuthService } from '../../../../core/services/auth.service';

import { FilterControlComponent } from '../../../../shared/components/filter-control/filter-control.component';
import { ProductMasterFormComponent } from '../product-master-form/product-master-form.component';
import { ProductMasterGridComponent } from '../product-master-grid/product-master-grid.component';

@Component({
  selector: 'app-product-master-mgr',
  standalone: true,
  imports: [
    CommonModule,
    ToastModule,
    ConfirmDialogModule,
    ButtonModule,
    FilterControlComponent,
    ProductMasterFormComponent,
    ProductMasterGridComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './product-master-mgr.component.html',
  styleUrl: './product-master-mgr.component.scss'
})
export class ProductMasterMgrComponent implements OnInit {
  tenantId!: number;
  isFormHidden: boolean = true;
  currOpMode: FormOpMode = FormOpMode.View; 

  products!: any[];
  visibleDataArray!: any[];
  modifiedDataArray!: any[];

  // categoryOptions: any[] = []; 
  hsnOptions: any[] = [];      
  selectedProduct: any = null;

  private productService = inject(ProductService);
  private categoryService = inject(ProductCategoryService); 
  private hsnService = inject(HSNTaxRuleService);
  private authServ = inject(AuthService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private cd = inject(ChangeDetectorRef);

  async ngOnInit(): Promise<void> {
    this.tenantId = this.authServ.getTenantId()!;
    await this.loadDropdownMasters();
    await this.refreshProductGrid();
  }

  private async loadDropdownMasters() {
    try {
      const [cats, hsns] = await Promise.all([
        firstValueFrom(this.categoryService.getCategories(this.tenantId)),
        firstValueFrom(this.hsnService.getHSNTaxRules())
      ]);

      // this.categoryOptions = cats.map((c: any) => ({
      //   label: c.categoryName,
      //   value: c.id,
      //   defaultHsnId: c.defaultHsnId
      // }));

      this.hsnOptions = hsns.map((h: any) => ({
        label: `${h.hsnCode} - ${h.description}`,
        value: h.id
      }));
      this.cd.detectChanges();
    } catch (err) {
      console.error('Failed to pre-cache master dataset lookup maps:', err);
    }
  }

  async refreshProductGrid() {
    try {
      const prods = await this.getProductList();
      this.products = prods;   
      this.visibleDataArray = [...this.products!]; 
      
      this.modifiedDataArray = this.visibleDataArray.map(item => ({
        ...item,
        hsnCode: item.hsnTaxRule?.hsnCode,
        categoryName: item.productCategory?.categoryName
      }));
      this.cd.detectChanges();
    } catch (err) {
      console.error('Grid Refresh operations encountered a fault:', err);
    }
  }

  getProductList(): Promise<any[]> {
    const observable$ = this.productService.getProducts(this.tenantId).pipe(
      tap((prods: any) => { this.products = prods; })
    );
    return firstValueFrom(observable$);
  }

  onDataFiltered(filteredResults: any[]) { 
    this.visibleDataArray = filteredResults;
    this.cd.detectChanges();
  }
  
  onAddModeRequested() {
    this.selectedProduct = null;
    this.isFormHidden = false;
    this.currOpMode = FormOpMode.Add; 
    localStorage.setItem('currOpMode', this.currOpMode);
    this.cd.detectChanges();
  }

  onEditRequestedPreserve(product: any) { 
  
    this.selectedProduct = product;
    this.isFormHidden = false;
    this.currOpMode = FormOpMode.Update;
    this.cd.detectChanges();
  }

    async onEditRequested(productSnapshot: any) {console.log('requested  product to edit:',productSnapshot);
    // 1. Identify the unique record ID from the clicked table/grid row item
    const productId = productSnapshot.productId || productSnapshot.id;
    
    if (!productId) {
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Cannot fetch record details: Product ID is missing.' 
      });
      return;
    }

    try {
      console.log('fetching from DB........................pid:',productId);
      // 2. Fetch fresh, un-cached data attributes directly from the backend API endpoint
      const freshProductData = await firstValueFrom(
             this.productService.getProduct( this.tenantId,productId)
      );

      if (freshProductData) {
        // 3. Bind the fresh backend model state to the editing container 
        this.selectedProduct = freshProductData;
        
       // 4. Update view visibility states and run change detection
        this.isFormHidden = false;
        this.currOpMode = FormOpMode.Update;
        
        
        
        this.cd.detectChanges();
      } else {
        this.messageService.add({ 
          severity: 'warn', 
          summary: 'Not Found', 
          detail: 'The requested product data could not be retrieved from the server.' 
        });
      }
    } catch (error: any) {
      console.error('Backend product fetch failed on edit request:', error);
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Server Error', 
        detail: 'Failed to synchronize product state with server: ' + error.message 
      });
    }
  }


  onCancelRequested() {
    this.currOpMode = FormOpMode.View; 
    this.isFormHidden = true;    
    this.selectedProduct = null;
    this.cd.detectChanges();
  }

  async onFormOperationSaved() {
    this.currOpMode = FormOpMode.View;
    this.isFormHidden = true;
    this.selectedProduct = null;
    await this.refreshProductGrid();
  }

  onFormStateFallback(mode: FormOpMode) {
    this.isFormHidden = false;
    this.currOpMode = mode;
    this.cd.detectChanges();
  }

  onPromptReactivationRequested(event: { productId: number, productName: string }) {
    this.promptReactivation(event.productId, event.productName);
  }

  promptReactivation(productId: number, productName: string) {
    this.confirmationService.confirm({
      header: 'Archived Record Found',
      message: `A product named '${productName}' already exists in your archives. Would you like to restore and reactivate it?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes, Reactivate',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-success', 
      rejectButtonStyleClass: 'p-button-secondary', 
      accept: () => {
        this.productService.reactivateProduct(this.tenantId, productId).subscribe({
          next: async () => {
            this.messageService.add({ 
              severity: 'success', 
              summary: 'Restored', 
              detail: `'${productName}' reactivated successfully.` 
            });
            this.onCancelRequested();
            await this.refreshProductGrid();
          },
          error: (err) => {
            console.error('Reactivation error:', err);
            this.messageService.add({ severity: 'error', summary: 'Fault', detail: 'Failed to restore archived item.' });
          }
        });
      },
      reject: () => {
        this.isFormHidden = false;
        this.currOpMode = FormOpMode.Add;
        this.cd.detectChanges();
      }
    });
  }

  onDeleteRequested(product: any) {
    this.confirmationService.confirm({
      message: `Are you sure you want to permanently delete "${product.prodName}"?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.productService.deleteProduct(this.tenantId, product.id).subscribe({
          next: () => {
            this.products = this.products.filter(p => p.id !== product.id);
            this.visibleDataArray = this.visibleDataArray.filter(p => p.id !== product.id);
            this.modifiedDataArray = this.modifiedDataArray.filter(p => p.id !== product.id);
            this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Product successfully removed.' });
            this.cd.detectChanges();
          },
          error: (err) => {
            if (err.status === 409 || err.message?.includes('DB_DEPENDENCY_RESTRICTION_ERROR')) {
              const warningMessage = err.error?.message || 'Cannot delete. Related records exist.';
              this.messageService.add({ severity: 'warn', summary: 'Deletion Blocked', detail: warningMessage, life: 6000 });
            } else {
              this.messageService.add({ severity: 'error', summary: 'System Error', detail: 'Database engine transmission error.' });
            }
          }
        });
      }
    });
  }
}
