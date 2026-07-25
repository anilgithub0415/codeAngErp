import { Component, OnInit, Input, HostBinding, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { OverlayPanelModule } from 'primeng/overlaypanel';

export interface CustomerMock {
  id: number;
  customerName: string;
}

export interface SiteMock {
  id: number;
  siteName: string;
}

export interface SalesOrderItemMock {
  id: number;
  salesOrderId: number;
  productId: number | null;
  productVariantId: number | null;
  prodName: string;
  sku: string | null;
  quantity: number;
  finalPrice: number;
  salesUom: string | null;
}

export interface SalesOrderMock {
  id: number;
  tenantId: number;
  soNumber: string;
  customerPoNumber: string | null;
  customerPoDate: Date | null;
  clientId: number;
  client: CustomerMock;
  siteId: number | null;
  site: SiteMock | null;
  status: string; // Dynamic mapping string fields
  subTotal: number;
  taxAmount: number;
  shippingAmount: number;
  totalAmount: number;
  items: SalesOrderItemMock[];
}

@Component({
  selector: 'app-sales-kanban-card',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  standalone: true,
  imports: [CommonModule, RouterLink, TableModule, TagModule, OverlayPanelModule],
  templateUrl: './sales-kanban-card.component.html'
})
export class SalesKanbanCardComponent implements OnInit {
  @HostBinding('class') class = 'block w-full';
  @Input() salesOrder!: SalesOrderMock;

  ngOnInit() {
    if (!this.salesOrder) {
      // Robust structural fallback values matching database models
      this.salesOrder = {
        id: 5001,
        tenantId: 1,
        soNumber: 'SO-2026-8942',
        customerPoNumber: 'PO-CLIENT-XYZ',
        customerPoDate: new Date(),
        clientId: 204,
        client: {
          id: 204,
          customerName: 'Global Distribution Infrastructure Ltd'
        },
        siteId: 12,
        site: {
          id: 12,
          siteName: 'Warehouse Dock Alpha'
        },
        status: 'draft',
        subTotal: 10000.00,
        taxAmount: 1800.00,
        shippingAmount: 250.00,
        totalAmount: 12050.00,
        items: [
          {
            id: 10,
            salesOrderId: 5001,
            productId: 55,
            productVariantId: null,
            prodName: 'Optimus Basin Mixer Assembly',
            sku: 'OP-BAS-MIX',
            quantity: 5,
            finalPrice: 2000.00,
            salesUom: 'PCS'
          }
        ]
      };
    }
  }

  /**
   * Translates local text statuses cleanly to color hex variations.
   */
  getStatusColor(): string {
    if (!this.salesOrder) return 'var(--primary-color, #3b82f6)';
    
    switch (this.salesOrder.status?.toLowerCase().trim()) {
      case 'draft':
        return '#64748b'; // Slate gray
      case 'pending_review':
        return '#3b82f6'; // Royal Blue
      case 'approved':
        return '#06b6d4'; // Cyan
      case 'processing':
        return '#a855f7'; // Purple
      case 'shipped':
        return '#f59e0b'; // Warning amber transit
      case 'delivered':
        return '#10b981'; // Emerald complete success
      case 'cancelled':
        return '#ef4444'; // Failure red tracking
      default:
        return 'var(--primary-color, #3b82f6)';
    }
  }

  /**
   * Matches string status layers cleanly onto template flags.
   */
  getStatusSeverity(): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | undefined {
    if (!this.salesOrder) return 'info';

    switch (this.salesOrder.status?.toLowerCase().trim()) {
      case 'draft':
        return 'secondary';
      case 'pending_review':
        return 'info';
      case 'approved':
        return 'info';
      case 'processing':
        return 'warn';
      case 'shipped':
        return 'warn';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'danger';
      default:
        return 'info';
    }
  }

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
