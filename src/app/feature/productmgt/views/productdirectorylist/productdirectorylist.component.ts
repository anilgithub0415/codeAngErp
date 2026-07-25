
import { Component, OnInit, inject, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom, forkJoin } from 'rxjs';

// PrimeNG Component Modules
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';

// Internal Services and Models
import { ProductService } from '../../../../core/services/product.service';
import { ProductCategoryService } from '../../../../core/services/product-category.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Product } from '../../../../core/models/product.model';

@Component({
  selector: 'app-product-directory-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    ToastModule,
    DialogModule
  ],
  providers: [MessageService],
  templateUrl: './productdirectorylist.component.html',
  styleUrl: './productdirectorylist.component.scss'
})
export class ProductDirectoryListComponent implements OnInit {
  @ViewChild('dt') dt: Table | undefined;

  // Structural State Registries
  tenantId!: number;
  products: any[] = [];
  selectedProducts: any[] = [];
  loading: boolean = true;
  globalSearchText: string = '';

  // Dictionaries for Data Translations
  categoryLookupMap: { [key: number]: string } = {};
  categoryOptions: Array<{ label: string; value: number }> = [];

  // Dialog Controls
  bulkCategoryDialog: boolean = false;
  targetCategoryId: number | null = null;

  // DI Tokens Runtime Hooks
  private productService = inject(ProductService);
  private categoryService = inject(ProductCategoryService);
  private authServ = inject(AuthService);
  private messageService = inject(MessageService);
  private cd = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.tenantId = this.authServ.getTenantId()!;
    this.loadDirectoryRecords();
  }

  /**
   * Orchestrates async lookups and core products data retrieval in parallel.
   */
    /**
   * Orchestrates async lookups and core products data retrieval in parallel.
   * Uses safe any-casting to map raw database fields onto your lean Product interface.
   */
  async loadDirectoryRecords(): Promise<void> {
    this.loading = true;
    try {
      forkJoin({
        productList: this.productService.getProducts(this.tenantId),
        categoryLookups: this.categoryService.getCategories(this.tenantId)
      }).subscribe({
        next: ({ productList, categoryLookups }) => {
          
          // 1. Process category keys securely
          if (Array.isArray(categoryLookups)) {
            categoryLookups.forEach(item => {
              if (item.id !== undefined && item.categoryName) {
                this.categoryLookupMap[Number(item.id)] = item.categoryName;
              }
            });
            this.categoryOptions = categoryLookups.map((c: any) => ({
              label: c.categoryName,
              value: c.id
            }));
          }

          // 2. Map structural translation parameters onto dataset rows safely bypassing type checks
          this.products = (productList || []).map((p: any) => {
            const catId = p.categoryId !== undefined && p.categoryId !== null ? Number(p.categoryId) : null;
            return {
              ...p,
              // Attach transient properties directly for grid-filter matches using the casted object
              categoryName: catId ? (this.categoryLookupMap[catId] || `Cat ID: ${catId}`) : 'Unassigned',
              hsnCode: p.hsnTaxRule?.hsnCode || 'N/A',
              isOEMProductLabel: p.isOEMProduct ? 'OEM Line' : 'Standard',
              isBulkPackingLabel: p.isBulkPacking ? 'Bulk' : 'Retail',
              // Add safe fallbacks for your table columns in case they are missing from the raw payload
              currentstock: p.currentstock !== undefined ? p.currentstock : 0,
              reorderLevel: p.reorderLevel !== undefined ? p.reorderLevel : 0,
              isVariablePrice: p.isVariablePrice || false
            };
          });

          this.loading = false;
          this.cd.markForCheck();
          this.cd.detectChanges();
        },
        error: (err) => {
          this.loading = false;
          console.error('Product Directory fetching failed:', err);
        }
      });
    } catch (error: any) {
      this.loading = false;
      this.messageService.add({ severity: 'error', summary: 'Sync Error', detail: 'Could not load grid context.' });
    }
  }


  /**
   * Safe utility wrapper pushing manual value inputs into p-table global filters.
   */
  onGlobalSearch(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    if (this.dt) {
      this.dt.filterGlobal(val, 'contains');
    }
  }

  /**
   * BULK ACTION A: Iterates product collection to update category records on backend using single param endpoint.
   */
  async executeBulkCategoryReassignment(): Promise<void> {
    if (!this.targetCategoryId || !this.selectedProducts.length) return;

    const totalToUpdate = this.selectedProducts.length;
    let successfulUpdates = 0;

    try {
      for (const targetProduct of this.selectedProducts) {
        const payload = {
          ...targetProduct,
          categoryId: this.targetCategoryId,
          tenantId: this.tenantId
        };
        
        // Matches your single-parameter API signature pattern
        await firstValueFrom(this.productService.updateProduct(payload));
        successfulUpdates++;
      }

      this.messageService.add({
        severity: 'success',
        summary: 'Bulk Reassignment Complete',
        detail: `Successfully recategorized ${successfulUpdates} of ${totalToUpdate} product lines.`
      });

      this.bulkCategoryDialog = false;
      this.selectedProducts = [];
      this.loadDirectoryRecords();
    } catch (error: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Bulk Operation Aborted',
        detail: error.message || 'Error occurred during stream execution mutations.'
      });
    }
  }

  /**
   * BULK ACTION B: Simulated pricing/inventory alert WhatsApp broadcast to team members regarding changes.
   */
  executeWhatsAppBroadcast(): void {
    if (!this.selectedProducts.length) return;

    const itemsSummary = this.selectedProducts.map(p => `${p.prodName} (SKU: ${p.sku || 'N/A'})`).join(', ');
    const defaultText = encodeURIComponent(`Inventory Notice for selected items: ${itemsSummary}. Please check updated ERP price sheets.`);
    const targetUrl = `https://wa.me{defaultText}`;
    window.open(targetUrl, '_blank');
  }

  /**
   * BULK ACTION C: Prints detailed barcode/warehouse bin storage identification sheets.
   */
  executePrintLabels(): void {
    if (!this.selectedProducts.length) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    let content = '<html><head><title>Inventory Barcode Labels</title><style>';
    content += 'body { font-family: monospace; padding: 20px; }';
    content += '.label { border: 1px dashed #000; padding: 15px; margin-bottom: 10px; border-radius: 4px; page-break-inside: avoid; }';
    content += '</style></head><body>';

    this.selectedProducts.forEach(p => {
      content += `<div class="label">`;
      content += `<strong>Product: ${p.prodName}</strong><br/>`;
      content += `SKU: ${p.sku || 'N/A'}<br/>`;
      content += `Base UOM: ${p.baseUom} | Base Price: ₹${p.basePrice}<br/>`;
      content += `Category: ${p.categoryName} | HSN: ${p.hsnCode}<br/>`;
      content += `</div>`;
    });

    content += '</body></html>';
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  }

  /**
   * EXPORT UTILITY: Composes CSV text structure safely tracking catalog properties.
   */
  exportToCSV(): void {
    if (!this.products.length) return;

    const headers = ['ID', 'Product Name', 'SKU', 'Category', 'Base Price', 'Current Stock', 'Reorder Level', 'UOM', 'HSN Code', 'Classification'];
    const rows = this.products.map(p => [
      p.id,
      `"${p.prodName.replace(/"/g, '""')}"`,
      `"${(p.sku || '').replace(/"/g, '""')}"`,
      `"${(p.categoryName || '').replace(/"/g, '""')}"`,
      p.basePrice || 0,
      p.currentstock || 0,
      p.reorderLevel || 0,
      `"${p.baseUom}"`,
      `"${p.hsnCode}"`,
      p.isOEMProduct ? '"OEM"' : '"Standard"'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `product_catalog_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
