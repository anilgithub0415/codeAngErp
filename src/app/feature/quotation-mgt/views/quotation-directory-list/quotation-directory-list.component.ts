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

// Internal Services and TypeORM State Enums
import { QuotationStatus } from '../../../../core/models/quotation.model';
import { QuotationService } from '../../../../core/services/quotation.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-quotation-directory-list',
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
  templateUrl: './quotation-directory-list.component.html',
  styleUrl: './quotation-directory-list.component.scss'
})
export class QuotationDirectoryListComponent implements OnInit {
  @ViewChild('dt') dt: Table | undefined;

  // Structural State Registries
  tenantId!: number;
  quotations: any[] = [];
  selectedQuotations: any[] = [];
  loading: boolean = true;
  globalSearchText: string = '';

  // Dropdown options for negotiation workflow tracking
  statusOptions: Array<{ label: string; value: QuotationStatus }> = [
    { label: 'Drafting Phase', value: QuotationStatus.DRAFT },
    { label: 'Sent to Client', value: QuotationStatus.SENT },
    { label: 'Counter-Offered by Client', value: QuotationStatus.COUNTER_OFFERED },
    { label: 'Revised by Wholesaler', value: QuotationStatus.REVISED },
    { label: 'Approved / Ready', value: QuotationStatus.APPROVED },
    { label: 'Rejected / Cancelled', value: QuotationStatus.REJECTED },
    { label: 'Validity Expired', value: QuotationStatus.EXPIRED }
  ];

  // Dialog Controls
  bulkStatusDialog: boolean = false;
  targetStatus: QuotationStatus | null = null;

  // DI Tokens Runtime Hooks
  private quotationService = inject(QuotationService);
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
      this.quotationService.getQuotations(this.tenantId).subscribe({
        next: (records: any[]) => {
          this.quotations = (records || []).map((quote: any) => {
            return {
              ...quote,
              // Normalize data structure for relational mappings & clean currency formatting
              totalAmount: quote.totalAmount !== undefined ? Number(quote.totalAmount) : 0,
              status: quote.status || QuotationStatus.DRAFT
            };
          });

          this.loading = false;
          this.cd.markForCheck();
          this.cd.detectChanges();
        },
        error: (err) => {
          this.loading = false;
          console.error('Quotation Directory fetching failed:', err);
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
   * BULK ACTION A: Iterates selection updating negotiation workflow values.
   */
  async executeBulkStatusReassignment(): Promise<void> {
    if (!this.targetStatus || !this.selectedQuotations.length) return;

    const totalToUpdate = this.selectedQuotations.length;
    let successfulUpdates = 0;

    try {
      for (const targetQuote of this.selectedQuotations) {
        const targetId = targetQuote.id;
        const payload = {
          ...targetQuote,
          status: this.targetStatus,
          tenantId: this.tenantId
        };
        
        // Matches the dual-parameter runtime updates design signature
        await firstValueFrom(this.quotationService.updateQuotation(targetId, payload));
        successfulUpdates++;
      }

      this.messageService.add({
        severity: 'success',
        summary: 'Negotiation Workflow Updated',
        detail: `Successfully modified status for ${successfulUpdates} of ${totalToUpdate} negotiation files.`
      });

      this.bulkStatusDialog = false;
      this.selectedQuotations = [];
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
   * BULK ACTION B: Alerts customer pipelines regarding negotiation pricing updates via WhatsApp link.
   */
  executeWhatsAppClientSync(): void {
    if (!this.selectedQuotations.length) return;

    const quoteSummary = this.selectedQuotations.map(q => `${q.quoteNumber || 'Draft'} (Value: ₹${q.totalAmount})`).join(', ');
    const defaultText = encodeURIComponent(`Negotiation Pipeline Update: Your quotations have been processed: ${quoteSummary}. Please review modifications on your dashboard terminal.`);
    const targetUrl = `https://wa.me{defaultText}`;
    window.open(targetUrl, '_blank');
  }

  /**
   * BULK ACTION C: Prints template summary layout layout segments for active files.
   */
  executePrintManifests(): void {
    if (!this.selectedQuotations.length) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    let content = '<html><head><title>Quotation Summary Manifest</title><style>';
    content += 'body { font-family: sans-serif; padding: 20px; color: #333; }';
    content += '.manifest { border: 2px solid #ccc; padding: 20px; margin-bottom: 20px; border-radius: 8px; page-break-inside: avoid; }';
    content += '.title { font-size: 18px; font-weight: bold; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 10px; }';
    content += '</style></head><body>';

    this.selectedQuotations.forEach(quote => {
      content += `<div class="manifest">`;
      content += `<div class="title">Quotation Reference: ${quote.quoteNumber || 'System Draft File'}</div>`;
      content += `<strong>Client Account Name:</strong> ${quote.clientName}<br/>`;
      content += `<strong>Designated Contact:</strong> ${quote.contactPerson || 'N/A'}<br/>`;
      content += `<strong>Pipeline Negotiation Value:</strong> ₹${quote.totalAmount.toLocaleString('en-IN')}<br/>`;
      content += `<strong>Iteration Round:</strong> Version ${quote.version} (${quote.isActive ? 'Latest Variant' : 'Archived History'})<br/>`;
      content += `<strong>Workflow Log Status:</strong> ${quote.status.toUpperCase()}<br/>`;
      if (quote.deliveryLocation) content += `<strong>Target Logistics Area:</strong> ${quote.deliveryLocation}<br/>`;
      content += `</div>`;
    });

    content += '</body></html>';
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  }

  /**
   * EXPORT UTILITY: Composes explicit CSV data sheets targeting active workspace properties.
   */
  exportToCSV(): void {
    if (!this.quotations.length) return;

    const headers = ['System ID', 'Quotation Number', 'Iteration Version', 'Is Active Round', 'Client Name', 'Client Category', 'Contact Person', 'Gross Valuation Amount (INR)', 'Creation Date', 'Current Negotiation Status'];
    const rows = this.quotations.map(q => [
      q.id,
      `"${(q.quoteNumber || 'DRAFT').replace(/"/g, '""')}"`,
      q.version || 1,
      q.isActive ? 'TRUE' : 'FALSE',
      `"${q.clientName.replace(/"/g, '""')}"`,
      `"${(q.clientCategory || 'General').replace(/"/g, '""')}"`,
      `"${(q.contactPerson || 'N/A').replace(/"/g, '""')}"`,
      q.totalAmount || 0,
      `"${new Date(q.createdAt).toLocaleDateString()}"`,
      `"${q.status.toUpperCase()}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `quotation_pipeline_ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Contextual coloring styles for grid badges matching state mappings.
   */
    /**
   * Contextual coloring styles for grid badges matching quotation state mappings.
   */
  getStatusBgColor(status: string): string {
    switch (status) {
      case QuotationStatus.DRAFT: 
        return '#e2e8f0'; // Light slate gray
      case QuotationStatus.SENT: 
        return '#dbeafe'; // Light blue
      case QuotationStatus.COUNTER_OFFERED: 
        return '#fef3c7'; // Light amber
      case QuotationStatus.REVISED: 
        return '#f3e8ff'; // Light purple
      case QuotationStatus.APPROVED: 
        return '#d1fae5'; // Light green
      case QuotationStatus.REJECTED: 
        return '#fee2e2'; // Light red
      case QuotationStatus.EXPIRED: 
        return '#ffedd5'; // Light orange
      default: 
        return '#e2e8f0';
    }
  }

  /**
   * Contextual contrast text colors matching quotation state mappings.
   */
  getStatusTextColor(status: string): string {
    switch (status) {
      case QuotationStatus.DRAFT: 
        return '#475569';
      case QuotationStatus.SENT: 
        return '#1d4ed8';
      case QuotationStatus.COUNTER_OFFERED: 
        return '#b45309';
      case QuotationStatus.REVISED: 
        return '#6b21a8';
      case QuotationStatus.APPROVED: 
        return '#047857';
      case QuotationStatus.REJECTED: 
        return '#b91c1c';
      case QuotationStatus.EXPIRED: 
        return '#c2410c';
      default: 
        return '#475569';
    }
  }
}

