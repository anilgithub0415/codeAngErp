import { Component, OnInit, inject, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

// PrimeNG Component Modules
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { POStatus } from '../../kanban/purchase-kanban-card/purchase-kanban-card.component';
import { PurchaseService } from '../../../../core/services/purchase.service';
import { AuthService } from '../../../../core/services/auth.service';

// Internal Services and TypeORM State Enums


@Component({
  selector: 'app-purchase-directory-list',
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
  templateUrl: './purchase-directorylist.component.html',
  styleUrl: './purchase-directorylist.component.scss'
})
export class PurchaseDirectoryListComponent implements OnInit {
  @ViewChild('dt') dt: Table | undefined;

  // Structural State Registries
  tenantId!: number;
  purchaseOrders: any[] = [];
  selectedOrders: any[] = [];
  loading: boolean = true;
  globalSearchText: string = '';

  // Dropdown options for bulk tracking
  statusOptions: Array<{ label: string; value: POStatus }> = [
    { label: 'Drafting Phase', value: POStatus.DRAFT },
    { label: 'Awaiting Sign-off', value: POStatus.PENDING_APPROVAL },
    { label: 'Authorized Orders', value: POStatus.APPROVED },
    { label: 'Sent to Vendor', value: POStatus.SENT },
    { label: 'Partial Intake', value: POStatus.PARTIALLY_RECEIVED },
    { label: 'Fulfillment Completed', value: POStatus.CLOSED },
    { label: 'Revoked/Cancelled', value: POStatus.CANCELLED }
  ];

  // Dialog Controls
  bulkStatusDialog: boolean = false;
  targetStatus: POStatus | null = null;

  // DI Tokens Runtime Hooks
  private poService = inject(PurchaseService);
  private authServ = inject(AuthService);
  private messageService = inject(MessageService);
  private cd = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.tenantId = this.authServ.getTenantId() || 1;
    this.loadDirectoryRecords();
  }

  /**
   * Orchestrates data retrieval and flattens properties for grid filtering.
   */
  async loadDirectoryRecords(): Promise<void> {
    this.loading = true;
    try {
      this.poService.getPOs(this.tenantId).subscribe({
        next: (records: any[]) => {
          this.purchaseOrders = (records || []).map((po: any) => {
            return {
              ...po,
              // Flatten relational property metrics for easy column matches
              vendorName: po.vendor?.vendorName || po.vendorId || 'Unassigned Vendor',
              totalAmount: po.totalAmount !== undefined ? Number(po.totalAmount) : 0,
              status: po.status || POStatus.DRAFT
            };
          });

          this.loading = false;
          this.cd.markForCheck();
          this.cd.detectChanges();
        },
        error: (err) => {
          this.loading = false;
          console.error('Purchase Directory fetching failed:', err);
          this.messageService.add({ severity: 'error', summary: 'Sync Error', detail: 'Could not fetch records.' });
        }
      });
    } catch (error: any) {
      this.loading = false;
      this.messageService.add({ severity: 'error', summary: 'Runtime Exception', detail: 'Grid tracking pipeline down.' });
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
   * BULK ACTION A: Iterates collection using target parameters signature updatePurchaseOrder(id, data)
   */
  async executeBulkStatusReassignment(): Promise<void> {
    if (!this.targetStatus || !this.selectedOrders.length) return;

    const totalToUpdate = this.selectedOrders.length;
    let successfulUpdates = 0;

    try {
      for (const targetPO of this.selectedOrders) {
        const targetId = targetPO.id;
        const payload = {
          ...targetPO,
          status: this.targetStatus,
          tenantId: this.tenantId
        };
        
        // Matches your dual-parameter service signature: id followed by object body
        await firstValueFrom(this.poService.updatePurchaseOrder(targetId, payload));
        successfulUpdates++;
      }

      this.messageService.add({
        severity: 'success',
        summary: 'Workflow Adjustment Applied',
        detail: `Successfully advanced status for ${successfulUpdates} of ${totalToUpdate} procurement files.`
      });

      this.bulkStatusDialog = false;
      this.selectedOrders = [];
      this.loadDirectoryRecords();
    } catch (error: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Batch Operation Aborted',
        detail: error.message || 'Error executing transactional update loops.'
      });
    }
  }

  /**
   * BULK ACTION B: Alerts vendor partners regarding pipeline purchase updates via automated message.
   */
  executeWhatsAppVendorSync(): void {
    if (!this.selectedOrders.length) return;

    const poSummary = this.selectedOrders.map(po => `${po.poNumber} (Value: ₹${po.totalAmount})`).join(', ');
    const defaultText = encodeURIComponent(`Procurement Tracking Notice: The following Purchase Orders have been updated in our system: ${poSummary}. Please check portal updates.`);
    const targetUrl = `https://wa.me{defaultText}`;
    window.open(targetUrl, '_blank');
  }

  /**
   * BULK ACTION C: Prints structured layout inventory sheets for logistics receiving bays.
   */
  executePrintManifests(): void {
    if (!this.selectedOrders.length) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    let content = '<html><head><title>Procurement Manifest Sheets</title><style>';
    content += 'body { font-family: sans-serif; padding: 20px; color: #333; }';
    content += '.manifest { border: 2px solid #ccc; padding: 20px; margin-bottom: 20px; border-radius: 8px; page-break-inside: avoid; }';
    content += '.title { font-size: 18px; font-weight: bold; border-bottom: 1px solid #ddd; pb: 5px; mb: 10px; }';
    content += '</style></head><body>';

    this.selectedOrders.forEach(po => {
      content += `<div class="manifest">`;
      content += `<div class="title">Purchase Order: ${po.poNumber}</div>`;
      content += `<strong>Vendor Partner:</strong> ${po.vendorName}<br/>`;
      content += `<strong>Financial Commitments Value:</strong> ₹${po.totalAmount.toLocaleString('en-IN')}<br/>`;
      content += `<strong>Placement Date:</strong> ${new Date(po.orderDate).toLocaleDateString()}<br/>`;
      content += `<strong>Current Log Status:</strong> ${po.status.toUpperCase()}<br/>`;
      if (po.customerPoNumber) content += `<strong>Client Tracking Ref:</strong> ${po.customerPoNumber}<br/>`;
      content += `</div>`;
    });

    content += '</body></html>';
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  }

  /**
   * EXPORT UTILITY: Composes CSV text structure tracking procurement tracking parameters.
   */
  exportToCSV(): void {
    if (!this.purchaseOrders.length) return;

    const headers = ['System ID', 'Purchase Order Number', 'Client Tracking PO Ref', 'Supplier Vendor Name', 'Total Gross Amount (INR)', 'Order Initialization Date', 'Estimated Delivery Target', 'Workflow Status State'];
    const rows = this.purchaseOrders.map(po => [
      po.id,
      `"${po.poNumber.replace(/"/g, '""')}"`,
      `"${(po.customerPoNumber || '').replace(/"/g, '""')}"`,
      `"${(po.vendorName || '').replace(/"/g, '""')}"`,
      po.totalAmount || 0,
      `"${new Date(po.orderDate).toLocaleDateString()}"`,
      po.deliveryDate ? `"${new Date(po.deliveryDate).toLocaleDateString()}"` : '"N/A"',
      `"${po.status.toUpperCase()}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `purchase_ledger_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Contextual coloring styles for grid badges matching state mappings.
   */
  getStatusBgColor(status: string): string {
    switch (status) {
      case POStatus.DRAFT: return '#e2e8f0';
      case POStatus.PENDING_APPROVAL: return '#dbeafe';
      case POStatus.APPROVED: return '#cffafe';
      case POStatus.SENT: return '#f3e8ff';
      case POStatus.PARTIALLY_RECEIVED: return '#fef3c7';
      case POStatus.CLOSED: return '#d1fae5';
      case POStatus.CANCELLED: return '#fee2e2';
      default: return '#e2e8f0';
    }
  }

  getStatusTextColor(status: string): string {
    switch (status) {
      case POStatus.DRAFT: return '#475569';
      case POStatus.PENDING_APPROVAL: return '#1d4ed8';
      case POStatus.APPROVED: return '#0e7490';
      case POStatus.SENT: return '#6b21a8';
      case POStatus.PARTIALLY_RECEIVED: return '#b45309';
      case POStatus.CLOSED: return '#047857';
      case POStatus.CANCELLED: return '#b91c1c';
      default: return '#475569';
    }
  }
}
