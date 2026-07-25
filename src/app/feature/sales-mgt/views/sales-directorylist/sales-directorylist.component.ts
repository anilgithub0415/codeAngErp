
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

import { SalesService } from '../../../../core/services/sales.service'; // Adjust paths to match your directory structures
import { AuthService } from '../../../../core/services/auth.service';

export enum SOStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  SENT = 'sent',
  PARTIALLY_DELIVERED = 'partially_delivered',
  CLOSED = 'closed',
  CANCELLED = 'cancelled'
}

@Component({
  selector: 'app-sales-directory-list',
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
  templateUrl: './sales-directorylist.component.html',
  styleUrl: './sales-directorylist.component.scss'
})
export class SalesDirectorylistComponent implements OnInit {
  @ViewChild('dt') dt: Table | undefined;

  // Structural State Registries
  tenantId!: number;
  salesOrders: any[] = [];
  selectedOrders: any[] = [];
  loading: boolean = true;
  globalSearchText: string = '';

  // Dropdown options for bulk tracking
  statusOptions: Array<{ label: string; value: SOStatus }> = [
    { label: 'Drafting Phase', value: SOStatus.DRAFT },
    { label: 'Awaiting Sign-off', value: SOStatus.PENDING_APPROVAL },
    { label: 'Authorized Orders', value: SOStatus.APPROVED },
    { label: 'Sent to Customer', value: SOStatus.SENT },
    { label: 'Partial Delivery', value: SOStatus.PARTIALLY_DELIVERED },
    { label: 'Fulfillment Completed', value: SOStatus.CLOSED },
    { label: 'Revoked/Cancelled', value: SOStatus.CANCELLED }
  ];

  // Dialog Controls
  bulkStatusDialog: boolean = false;
  targetStatus: SOStatus | null = null;

  // DI Tokens Runtime Hooks
  private salesService = inject(SalesService);
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
      this.salesService.getSOs(this.tenantId).subscribe({
        next: (records: any[]) => {
          this.salesOrders = (records || []).map((so: any) => {
            return {
              ...so,
              // Flatten relational property metrics mapping to Entity structure (clientId -> client -> clientName)
              clientName: so.client?.clientName || so.client?.name || so.clientId || 'Unassigned Customer',
              totalAmount: so.totalAmount !== undefined ? Number(so.totalAmount) : 0,
              status: so.status || SOStatus.DRAFT
            };
          });

          this.loading = false;
          this.cd.markForCheck();
          this.cd.detectChanges();
        },
        error: (err) => {
          this.loading = false;
          console.error('Sales Directory fetching failed:', err);
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
   * BULK ACTION A: Iterates collection using target parameters signature updateSalesOrder(id, data)
   */
  async executeBulkStatusReassignment(): Promise<void> {
    if (!this.targetStatus || !this.selectedOrders.length) return;

    const totalToUpdate = this.selectedOrders.length;
    let successfulUpdates = 0;

    try {
      for (const targetSO of this.selectedOrders) {
        const targetId = targetSO.id;
        const payload = {
          ...targetSO,
          status: this.targetStatus,
          tenantId: this.tenantId
        };
        
        await firstValueFrom(this.salesService.updateSalesOrder(targetId, payload));
        successfulUpdates++;
      }

      this.messageService.add({
        severity: 'success',
        summary: 'Workflow Adjustment Applied',
        detail: `Successfully advanced status for ${successfulUpdates} of ${totalToUpdate} sales files.`
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
   * BULK ACTION B: Alerts client partners regarding pipeline sales updates via automated message.
   */
  executeWhatsAppClientSync(): void {
    if (!this.selectedOrders.length) return;

    const soSummary = this.selectedOrders.map(so => `${so.soNumber} (Value: ₹${so.totalAmount})`).join(', ');
    const defaultText = encodeURIComponent(`Sales Tracking Notice: The following Sales Orders have been updated in our system: ${soSummary}. Please check portal updates.`);
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

    let content = '<html><head><title>Sales Manifest Sheets</title><style>';
    content += 'body { font-family: sans-serif; padding: 20px; color: #333; }';
    content += '.manifest { border: 2px solid #ccc; padding: 20px; margin-bottom: 20px; border-radius: 8px; page-break-inside: avoid; }';
    content += '.title { font-size: 18px; font-weight: bold; border-bottom: 1px solid #ddd; pb: 5px; mb: 10px; }';
    content += '</style></head><body>';

    this.selectedOrders.forEach(so => {
      content += `<div class="manifest">`;
      content += `<div class="title">Sales Order: ${so.soNumber}</div>`;
      content += `<strong>Client Partner:</strong> ${so.clientName}<br/>`;
      content += `<strong>Financial Commitments Value:</strong> ₹${so.totalAmount.toLocaleString('en-IN')}<br/>`;
      content += `<strong>Placement Date:</strong> ${new Date(so.createdAt).toLocaleDateString()}<br/>`;
      content += `<strong>Current Log Status:</strong> ${so.status.toUpperCase()}<br/>`;
      if (so.customerPoNumber) content += `<strong>Client Tracking Ref:</strong> ${so.customerPoNumber}<br/>`;
      content += `</div>`;
    });

    content += '</body></html>';
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  }

  /**
   * EXPORT UTILITY: Composes CSV text structure tracking sales tracking parameters.
   */
  exportToCSV(): void {
    if (!this.salesOrders.length) return;

    const headers = ['System ID', 'Sales Order Number', 'Client Tracking PO Ref', 'Client Customer Name', 'Total Gross Amount (INR)', 'Order Creation Date', 'Client PO Date', 'Workflow Status State'];
    const rows = this.salesOrders.map(so => [
      so.id,
      `"${so.soNumber.replace(/"/g, '""')}"`,
      `"${(so.customerPoNumber || '').replace(/"/g, '""')}"`,
      `"${(so.clientName || '').replace(/"/g, '""')}"`,
      so.totalAmount || 0,
      `"${new Date(so.createdAt).toLocaleDateString()}"`,
      so.customerPoDate ? `"${new Date(so.customerPoDate).toLocaleDateString()}"` : '"N/A"',
      `"${so.status.toUpperCase()}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sales_ledger_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Contextual coloring styles for grid badges matching state mappings.
   */
  getStatusBgColor(status: string): string {
    switch (status) {
      case SOStatus.DRAFT: return '#e2e8f0';
      case SOStatus.PENDING_APPROVAL: return '#dbeafe';
      case SOStatus.APPROVED: return '#cffafe';
      case SOStatus.SENT: return '#f3e8ff';
      case SOStatus.PARTIALLY_DELIVERED: return '#fef3c7';
      case SOStatus.CLOSED: return '#d1fae5';
      case SOStatus.CANCELLED: return '#fee2e2';
      default: return '#e2e8f0';
    }
  }

  getStatusTextColor(status: string): string {
    switch (status) {
      case SOStatus.DRAFT: return '#475569';
      case SOStatus.PENDING_APPROVAL: return '#1d4ed8';
      case SOStatus.APPROVED: return '#0e7490';
      case SOStatus.SENT: return '#6b21a8';
      case SOStatus.PARTIALLY_DELIVERED: return '#b45309';
      case SOStatus.CLOSED: return '#047857';
      case SOStatus.CANCELLED: return '#b91c1c';
      default: return '#475569';
    }
  }
}
