
import { Component, OnInit, Input, HostBinding, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { OverlayPanelModule } from 'primeng/overlaypanel';



export enum QuotationStatus {
    DRAFT = "DRAFT",                                     // Wholesaler creating the quote
    SENT = "SENT",                                       // Sent to client, visible in ClientPortal
    COUNTER_OFFERED = "COUNTER_OFFERED",                 // Client changed prices and sent back
    REVISED = "REVISED",                                 // Wholesaler adjusted prices based on counter-offer
    APPROVED = "APPROVED",                               // Client accepted (Ready to convert to Order/PO)
    REJECTED = "REJECTED",                               // Client or Wholesaler cancelled negotiation
    EXPIRED = "EXPIRED"  
}


export interface QuotationItemMock {
  id: number;
  quotationId: number;
  productId: number | null;
  productVariantId: number | null;
  prodName: string;
  sku: string | null;
  quantity: number;
  price: number;
  unit: string;
}

export interface QuotationMock {
  id: number;
  quoteNumber: string;
  tenantId: number;
  clientId: number;
  clientName: string;
  status: QuotationStatus;
  version: number;
  clientCategory: string | null;
  contactPerson: string | null;
  deliveryLocation: string | null;
  totalAmount: number;
  remarksNotes: string | null;
  createdAt: Date;
  items: QuotationItemMock[];
}

@Component({
  selector: 'app-quotation-kanban-card',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  standalone: true,
  imports: [CommonModule, RouterLink, TableModule, TagModule, OverlayPanelModule],
  templateUrl: './quotation-kanban-card.component.html',
  styleUrl: './quotation-kanban-card.component.scss'
})
export class QuotationKanbanCardComponent implements OnInit {
  @HostBinding('class') class = 'block w-full';
  @Input() quotation!: QuotationMock;

  ngOnInit() {
    if (!this.quotation) {
      // Robust structural fallback values matching TypeORM Quotation schema
      this.quotation = {
        id: 2001,
        quoteNumber: 'QT-2026-0001',
        tenantId: 1,
        clientId: 84,
        clientName: 'Global Infra Trading Ltd',
        status: QuotationStatus.DRAFT,
        version: 1,
        clientCategory: 'Wholesaler Premium',
        contactPerson: 'Rahul Sharma',
        deliveryLocation: 'Warehouse Hub Alpha, Sector 4',
        totalAmount: 48500.00,
        remarksNotes: 'Initial estimate pricing based on volume purchase request.',
        createdAt: new Date(),
        items: [
          {
            id: 1,
            quotationId: 2001,
            productId: 101,
            productVariantId: null,
            prodName: 'Premium Sanitary Ceramic Tile',
            sku: 'SAN-CER-01',
            quantity: 100,
            price: 350.00,
            unit: 'SQFT'
          },
          {
            id: 2,
            quotationId: 2001,
            productId: null,
            productVariantId: 204,
            prodName: 'Chrome Finished Mixer Tap (Variant Custom)',
            sku: 'TAP-MIX-V5',
            quantity: 10,
            price: 1350.00,
            unit: 'PCS'
          }
        ]
      };
    }
  }

  /**
   * Evaluates the contextual color assignment for card accents
   * based on the custom TypeORM State definitions for Quotations.
   */
  getStatusColor(): string {
    if (!this.quotation) return 'var(--primary-color, #3b82f6)';
    
    switch (this.quotation.status) {
      case QuotationStatus.DRAFT:
        return '#64748b'; // Muted slate gray for layouts in draft
      case QuotationStatus.SENT:
        return '#a855f7'; // Purple indicating transmission to customer
      case QuotationStatus.COUNTER_OFFERED:
        return '#f59e0b'; // Amber flag warning tracking customer overrides
      case QuotationStatus.REVISED:
        return '#3b82f6'; // Bright blue warning state for revisions
      case QuotationStatus.APPROVED:
        return '#10b981'; // Stable vibrant green for accepted configs
      case QuotationStatus.REJECTED:
        return '#ef4444'; // Red failure alert pathing
      case QuotationStatus.EXPIRED:
        return '#f97316'; // Orange indicator for timeline exhaustion
      default:
        return 'var(--primary-color, #3b82f6)';
    }
  }

  /**
   * Maps explicit TypeORM statuses cleanly to PrimeNG template severity flags.
   */
  getStatusSeverity(): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | undefined {
    if (!this.quotation) return 'info';

    switch (this.quotation.status) {
      case QuotationStatus.DRAFT:
        return 'secondary';
      case QuotationStatus.SENT:
        return 'warn';
      case QuotationStatus.COUNTER_OFFERED:
        return 'warn';
      case QuotationStatus.REVISED:
        return 'info';
      case QuotationStatus.APPROVED:
        return 'success';
      case QuotationStatus.REJECTED:
        return 'danger';
      case QuotationStatus.EXPIRED:
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
