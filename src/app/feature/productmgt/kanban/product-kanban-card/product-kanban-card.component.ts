import { Component, CUSTOM_ELEMENTS_SCHEMA, HostBinding, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import {OverlayPanelModule} from 'primeng/overlaypanel'
// Interfaces mirroring your TypeORM Product relationships safely
interface ProductCategoryMock {
  id: number;
  categoryName: string;
}

interface ProductMock {
  id: number;
  tenantId: number;
  prodName: string;
  description: string | null;
  sku: string | null;
  basePrice: number;
  isVariablePrice: boolean;
  currentstock: number;
  isOEMProduct: boolean;
  isBulkPacking: boolean;
  reorderLevel: number;
  baseUom: string;
  defaultPurchaseUom?: string | null;
  defaultSalesUom?: string | null;
  categoryId?: number | null;
  productCategory?: ProductCategoryMock | null;
}

@Component({
  selector: 'app-product-kanban-card',schemas:[CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, RouterLink, TableModule, TagModule, OverlayPanelModule],
  templateUrl: './product-kanban-card.component.html',
  styleUrl: './product-kanban-card.component.scss'
})
export class ProductKanbanCardComponent implements OnInit {
  @HostBinding('class') class = 'block w-full';

  // Input bound context populated by the main Product Kanban Column iteration
  @Input() product!: ProductMock;

  ngOnInit() {
    // Elegant fallback mock data showcasing the sanitary sector metrics
    if (!this.product) {
      this.product = {
        id: 201,
        tenantId: 1,
        prodName: 'Optimus Basin Mixer',
        description: 'Chrome finish single lever tap',
        sku: 'SMY-210740071',
        basePrice: 4500.00,
        isVariablePrice: false,
        currentstock: 12,
        reorderLevel: 15,
        isOEMProduct: true,
        isBulkPacking: false,
        baseUom: 'PCS',
        productCategory: { id: 10, categoryName: 'Sanitaryware Fittings' }
      };
    }
  }

  /**
   * Generates dynamic visual color anchors based on real-time stock levels 
   * against designated reorder safety levels.
   */
  getStockColor(): string {
    if (!this.product) return 'var(--primary-color, #3b82f6)';
    
    if (this.product.currentstock <= 0) {
      return '#ef4444'; // Red color for Out of Stock status
    } else if (this.product.currentstock <= this.product.reorderLevel) {
      return '#f59e0b'; // Amber warning color for Low Stock status
    }
    
    return '#10b981'; // Vibrant emerald color for Stable Stock status
  }

  // Add this method inside your ProductKanbanCardComponent class
setHoverStyle(event: MouseEvent, isHovered: boolean) {
  const target = event.currentTarget as HTMLElement;
  if (isHovered) {
    target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
    target.style.transform = 'translateY(-2px)';
  } else {
    target.style.boxShadow = 'var(--card-shadow, 0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04))';
    target.style.transform = 'translateY(0px)';
  }
}



}


