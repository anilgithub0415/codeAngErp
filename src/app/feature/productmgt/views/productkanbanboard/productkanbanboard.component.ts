import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

// PrimeNG Modules
import { DragDropModule } from 'primeng/dragdrop';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TooltipModule } from 'primeng/tooltip';

// Project Internal Infrastructure Dependencies
import { ProductService } from '../../../../core/services/product.service';
import { ProductCategoryService } from '../../../../core/services/product-category.service';
import { AuthService } from '../../../../core/services/auth.service';

import { MeterGroupModule } from 'primeng/metergroup';
import { ProductKanbanCardComponent } from '../../kanban/product-kanban-card/product-kanban-card.component';

// Interface matching strict structure of target kanban columns
interface KanbanColumn {
  id: string;
  title: string;
  styleClass: string;
}

@Component({
  selector: 'app-product-kanbanboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    ToastModule,
    DropdownModule,
    InputNumberModule,
    SelectButtonModule,
    TooltipModule,
    ProductKanbanCardComponent, MeterGroupModule
  ],
  providers: [MessageService],
  templateUrl: './productkanbanboard.component.html',
  styleUrl: './productkanbanboard.component.scss'
})
export class ProductKanbanboardComponent implements OnInit {
  // Application context state tracking variables
  tenantId!: number;
  allProducts: any[] = [];
  filteredProducts: any[] = [];
  draggedProduct: any | null = null;

  // Inventory Board Configuration mapping directly to live dynamic states
  columns: KanbanColumn[] = [
    { id: 'IN_STOCK', title: 'Healthy Stock', styleClass: 'border-green-500 bg-green-50/10' },
    { id: 'LOW_STOCK', title: 'Low Stock Warning', styleClass: 'border-amber-500 bg-amber-50/10' },
    { id: 'OUT_STOCK', title: 'Out of Stock', styleClass: 'border-red-500 bg-red-50/10' }
  ];





  // Filtering System State models
  selectedCategory: number | null = null;
  maxBasePriceFilter: number | null = null;
  pipelineFilter: string = 'all';

  // Master lookup collections 
  categoryOptions: Array<{ label: string; value: number }> = [];
  categoryLookupMap: { [key: number]: string } = {};
  
  pipelineOptions = [
    { label: 'Show All Records', value: 'all' },
    { label: 'OEM Lines Only', value: 'oem' },
    { label: 'Variable Lines Only', value: 'variable' },    
    { label: 'Bulk Packing Only', value: 'bulk' }
  ];

  // DI Token runtime initializers mirroring manager layout
  private productService = inject(ProductService);
  private categoryService = inject(ProductCategoryService);
  private authServ = inject(AuthService);
  private messageService = inject(MessageService);
  private cd = inject(ChangeDetectorRef);

  async ngOnInit(): Promise<void> {
    this.tenantId = this.authServ.getTenantId()!;
    await this.loadKanbanData();
  }

  /**
   * Orchestrates server data sync pipelines to populate lookups and build view models.
   */
  async loadKanbanData(): Promise<void> {
    try {
      // 1. Fetch Master Category lookup lists using service configuration
      this.categoryService.getCategories(this.tenantId).subscribe({
        next: (cats: any[]) => {
          if (Array.isArray(cats)) {
            cats.forEach(c => {
              if (c.id !== undefined && c.categoryName) {
                this.categoryLookupMap[Number(c.id)] = c.categoryName;
              }
            });
            this.categoryOptions = cats.map((c: any) => ({
              label: c.categoryName,
              value: c.id
            }));
            this.syncAndCategorizeProductLines();
          }
        },
        error: (err) => console.error('Failed to load category dictionaries:', err)
      });

      // 2. Query master catalog inventory lines matching tenant scope boundary
      const records = await firstValueFrom(this.productService.getProducts(this.tenantId));
      this.allProducts = records || [];
      
      this.syncAndCategorizeProductLines();
    } catch (error: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Data Sync Breakdown',
        detail: error.message || 'Failed to populate pipeline board records.'
      });
    }
  }

  // Ensure MeterGroupModule is imported in your component imports array!

getMeterGroupMetrics() {
    const healthyCount = this.getProductsByStatus('IN_STOCK').length;
    const lowCount = this.getProductsByStatus('LOW_STOCK').length;
    const outCount = this.getProductsByStatus('OUT_STOCK').length;
    const total = healthyCount + lowCount + outCount;

    // Prevent rendering NaN percentages if all columns happen to be empty
    if (total === 0) {
        return [
            { label: 'Empty Pipeline', value: 0, color: '#94a3b8' }
        ];
    }

    return [
        { 
            label: 'Healthy Stock', 
            value: Math.round((healthyCount / total) * 100), 
            color: '#22c55e', // matches green-500
            icon: 'pi pi-check-circle' 
        },
        { 
            label: 'Low Stock Warning', 
            value: Math.round((lowCount / total) * 100), 
            color: '#f59e0b', // matches amber-500
            icon: 'pi pi-exclamation-triangle' 
        },
        { 
            label: 'Out of Stock', 
            value: Math.round((outCount / total) * 100), 
            color: '#ef4444', // matches red-500
            icon: 'pi pi-times-circle' 
        }
    ];
}

  /**
   * Appends UI View Model attributes and maps category name mappings cleanly
   */
  private syncAndCategorizeProductLines(): void {
    if (!this.allProducts.length) return;

    this.allProducts.forEach(product => {
      // Inject category mappings safely if missing or separate in DB payload
      if (product.categoryId && !product.productCategory) {
        product.productCategory = {
          id: product.categoryId,
          categoryName: this.categoryLookupMap[Number(product.categoryId)] || `Cat ID: ${product.categoryId}`
        };
      }

      // Compute current Kanban state dynamically tracking thresholds 
      const currentStock = Number(product.currentstock || 0);
      const reorderLvl = Number(product.reorderLevel || 0);

      if (currentStock <= 0) {
        product.kanbanStatus = 'OUT_STOCK';
      } else if (currentStock <= reorderLvl) {
        product.kanbanStatus = 'LOW_STOCK';
      } else {
        product.kanbanStatus = 'IN_STOCK';
      }
    });

    this.applyGlobalFilters();
  }

  /**
   * Local comparison parsing engine
   */
  private normalizeStatus(status: string | undefined | null): string {
    return status ? status.toString().trim().toUpperCase() : '';
  }

  /**
   * Sweeps over catalog collection dataset arrays to establish visibility matrices
   */
  applyGlobalFilters(): void {
    this.filteredProducts = this.allProducts.filter(product => {
      if (!product.kanbanStatus) return false;

      // 1. Pipeline Property Flags Filter Rule
      if (this.pipelineFilter === 'oem' && !product.isOEMProduct) return false;
      if (this.pipelineFilter === 'variable' && !product.isVariablePrice) return false;
      if (this.pipelineFilter === 'bulk' && !product.isBulkPacking) return false;

      // 2. Target Category Context Filter Rule
      if (this.selectedCategory && product.categoryId !== this.selectedCategory) return false;

      // 3. Price Ceiling Limits Range Verification Metric Rule
      if (this.maxBasePriceFilter && product.basePrice > this.maxBasePriceFilter) return false;

      return true;
    });

    this.cd.markForCheck();
    this.cd.detectChanges();
  }

  /**
   * Isolates records bound to targeted layout lanes
   */
  getProductsByStatus(statusId: string): any[] {
    const targetNormalized = this.normalizeStatus(statusId);
    return this.filteredProducts.filter(p => this.normalizeStatus(p.kanbanStatus) === targetNormalized);
  }

  onDragStart(product: any): void {
    this.draggedProduct = product;
  }

  onDragEnd(): void {
    this.draggedProduct = null;
  }

  /**
   * Processes the drop mutation update and fires transactional rollbacks on service rejection.
   */
    /**
   * Processes the drop mutation update matching a single-parameter service signature.
   */
  async onDrop(targetStatus: string): Promise<void> {
    if (!this.draggedProduct || this.draggedProduct.kanbanStatus === targetStatus) {
      return;
    }

    const previousStatus = this.draggedProduct.kanbanStatus;
    const previousStockValue = this.draggedProduct.currentstock;

    // A. Contextual Stock Estimation Logic tracking thresholds
    let computedStock = previousStockValue;
    const safetyLimit = Number(this.draggedProduct.reorderLevel || 5);

    if (targetStatus === 'OUT_STOCK') {
      computedStock = 0;
    } else if (targetStatus === 'LOW_STOCK' && previousStockValue > safetyLimit) {
      computedStock = safetyLimit;
    } else if (targetStatus === 'IN_STOCK' && previousStockValue <= safetyLimit) {
      computedStock = safetyLimit + 10;
    }

    // B. Local Mutations for instant UI responsiveness 
    this.draggedProduct.kanbanStatus = targetStatus;
    this.draggedProduct.currentstock = computedStock;
    this.applyGlobalFilters();

    try {
      // Create mutation payload wrapping all attributes into a single object body
      const mutationPayload = {
        ...this.draggedProduct,
        currentstock: computedStock,
        tenantId: this.tenantId
      };

      // Push record changes upstream using your single-parameter signature
      await firstValueFrom(this.productService.updateProduct(mutationPayload));
      
      this.messageService.add({
        severity: 'success',
        summary: 'Inventory Updated',
        detail: `${this.draggedProduct.prodName} relocated to ${targetStatus.replace('_', ' ')}.`
      });
    } catch (error: any) {
      // C. Safe state rollback if the server rejects modifications
      const targetRecord = this.allProducts.find(p => p.id === this.draggedProduct.id);
      if (targetRecord) {
        targetRecord.kanbanStatus = previousStatus;
        targetRecord.currentstock = previousStockValue;
      }
      this.applyGlobalFilters();

      this.messageService.add({
        severity: 'error',
        summary: 'Database Write Error',
        detail: error.message || 'Stock mutation validation failed on database tier.'
      });
    }
  }

}
