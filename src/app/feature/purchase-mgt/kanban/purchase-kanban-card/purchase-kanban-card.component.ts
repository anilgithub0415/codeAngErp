
import { Component, OnInit, Input, HostBinding, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { OverlayPanelModule } from 'primeng/overlaypanel';

// Explicit application state enum mapped from your TypeORM entity definitions
export enum POStatus {
    DRAFT = "DRAFT",
    PENDING_APPROVAL = "PENDING_APPROVAL",
    APPROVED = "APPROVED",
    SENT = "SENT",
    PARTIALLY_RECEIVED = "PARTIALLY_RECEIVED",
    CLOSED = "CLOSED",
    CANCELLED = "CANCELLED"
}

export interface VendorMock {
  id: number;
  vendorName: string;
}

export interface PurchaseOrderItemMock {
  id: number;
  purchaseOrderId: number;
  productId: number | null;
  productVariantId: number | null;
  prodName: string;
  sku: string | null;
  quantity: number;
  finalPrice: number;
  purchaseUom: string | null;
}

export interface PurchaseOrderMock {
  id: number;
  poNumber: string;
  tenantId: number;
  status: POStatus;
  vendorId: number;
  vendor: VendorMock;
  orderDate: Date;
  deliveryDate: Date;
  totalAmount: number;
  notes: string;
  items: PurchaseOrderItemMock[];
}

@Component({
  selector: 'app-purchase-kanban-card',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  standalone: true,
  imports: [CommonModule, RouterLink, TableModule, TagModule, OverlayPanelModule],
  templateUrl: './purchase-kanban-card.component.html',
  styleUrl: './purchase-kanban-card.component.scss'
})
export class PurchaseKanbanCardComponent implements OnInit {
  @HostBinding('class') class = 'block w-full';
  @Input() purchaseOrder!: PurchaseOrderMock;

  ngOnInit() {
    if (!this.purchaseOrder) {
      // Robust structural fallback values mirroring structural constraints
      this.purchaseOrder = {
        id: 1001,
        poNumber: 'PO-2026-0001',
        tenantId: 1,
        status: POStatus.DRAFT,
        vendorId: 45,
        vendor: {
          id: 45,
          vendorName: 'Acme Procurement Corp'
        },
        orderDate: new Date(),
        deliveryDate: new Date(new Date().setDate(new Date().getDate() + 7)),
        totalAmount: 25450.00,
        notes: 'Urgent stock fulfillment requirement for local distribution hub.',
        items: [
          {
            id: 1,
            purchaseOrderId: 1001,
            productId: 12,
            productVariantId: null,
            prodName: 'Standard Steel Fitting',
            sku: 'ST-FIT-01',
            quantity: 50,
            finalPrice: 400.00,
            purchaseUom: 'PCS'
          },
          {
            id: 2,
            purchaseOrderId: 1001,
            productId: null,
            productVariantId: 88,
            prodName: 'Premium Brass Valve (Variant Custom)',
            sku: 'BR-VAL-V2',
            quantity: 10,
            finalPrice: 545.00,
            purchaseUom: 'BOX'
          }
        ]
      };
    }
  }

  /**
   * Evaluates the contextual color assignment for card accents
   * based on the custom TypeORM State definitions.
   */
  getStatusColor(): string {
    if (!this.purchaseOrder) return 'var(--primary-color, #3b82f6)';
    
    switch (this.purchaseOrder.status) {
      case POStatus.DRAFT:
        return '#64748b'; // Muted slate gray for layouts in draft
      case POStatus.PENDING_APPROVAL:
        return '#3b82f6'; // Bright blue warning state for reviews
      case POStatus.APPROVED:
        return '#06b6d4'; // Cyan for authorized actions
      case POStatus.SENT:
        return '#a855f7'; // Purple indicating transmission to supplier
      case POStatus.PARTIALLY_RECEIVED:
        return '#f59e0b'; // Amber flag warning tracking loose balances
      case POStatus.CLOSED:
        return '#10b981'; // Stable vibrant green for fully processed logs
      case POStatus.CANCELLED:
        return '#ef4444'; // Red failure alert pathing
      default:
        return 'var(--primary-color, #3b82f6)';
    }
  }

  /**
   * Maps explicit TypeORM statuses cleanly to PrimeNG template severity flags.
   */
  getStatusSeverity(): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | undefined {
    if (!this.purchaseOrder) return 'info';

    switch (this.purchaseOrder.status) {
      case POStatus.DRAFT:
        return 'secondary';
      case POStatus.PENDING_APPROVAL:
        return 'info';
      case POStatus.APPROVED:
        return 'info';
      case POStatus.SENT:
        return 'warn';
      case POStatus.PARTIALLY_RECEIVED:
        return 'warn';
      case POStatus.CLOSED:
        return 'success';
      case POStatus.CANCELLED:
        return 'danger';
      default:
        return 'info';
    }
  }

  /**
   * Manages layout behaviors dynamically when processing focus styles.
   */
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
