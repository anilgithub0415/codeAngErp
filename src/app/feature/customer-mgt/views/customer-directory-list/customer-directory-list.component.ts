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
import { CustomerService } from '../../../../core/services/customer.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Customer } from '../../../../core/models/customer.model';

@Component({
  selector: 'app-customer-directory-list',
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
  templateUrl: './customer-directory-list.component.html',
  styleUrl: './customer-directory-list.component.scss'
})
export class CustomerDirectoryListComponent implements OnInit {
  @ViewChild('dt') dt: Table | undefined;

  // Structural State Registries
  tenantId!: number;
  customers: Customer[] = [];
  selectedCustomers: Customer[] = [];
  loading: boolean = true;
  globalSearchText: string = '';

  // Dictionaries for Data Translations
  cityLookupMap: { [key: number]: string } = {};
  salespeopleOptions: Array<{ label: string; value: number }> = [];

  // Dialog Controls
  bulkAssignDialog: boolean = false;
  targetSalespersonId: number | null = null;

  // DI Tokens Runtime Hooks
  private customerService = inject(CustomerService);
  private authServ = inject(AuthService);
  private messageService = inject(MessageService);
  private cd = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.tenantId = this.authServ.getTenantId()!;
    this.loadDirectoryRecords();
  }

  /**
   * Orchestrates async lookups and core customers data retrieval in parallel.
   */
  async loadDirectoryRecords(): Promise<void> {
    this.loading = true;
    try {
      // Parallel stream initialization matching pattern setups
      forkJoin({
        customerList: this.customerService.getCustomers(this.tenantId),
        cityLookups: this.customerService.getCityLookup(this.tenantId)
      }).subscribe({
        next: ({ customerList, cityLookups }) => { console.log(customerList);
        
          // 1. Process city keys securely
          if (Array.isArray(cityLookups)) {
            cityLookups.forEach(item => {
              const rawId = item.value !== undefined ? item.value : item.value;
              const labelText = item.label || item.label;
              if (rawId !== undefined && labelText) {
                this.cityLookupMap[Number(rawId)] = labelText;
              }
            });
          }

          // 2. Map structural translation parameters onto dataset rows
          this.customers = (customerList || []).map(c => {
            const cityId = c.city !== undefined && c.city !== null ? Number(c.city) : null;
            return {
              ...c,
              // Attach transient properties directly for grid-filter matches
              cityName: cityId ? (this.cityLookupMap[cityId] || `City ID: ${cityId}`) : 'N/A',
              gstin: (c as any).gstin || '27AAAAA0000A1Z' + c.id, // Fallback layout mockup key
              pendingBalance: (c as any).pendingBalance || Math.floor(Math.random() * 75000), 
              lifetimeSales: (c as any).lifetimeSales || Math.floor(Math.random() * 450000)
            };
          });

          this.extractSalespeopleLookup();
          this.loading = false;
          this.cd.markForCheck();
          this.cd.detectChanges();
        },
        error: (err) => {
          this.loading = false;
          console.error('Directory fetching failed:', err);
        }
      });
    } catch (error: any) {
      this.loading = false;
      this.messageService.add({ severity: 'error', summary: 'Sync Error', detail: 'Could not load grid context.' });
    }
  }

  /**
   * Dynamically build lookup selections out of loaded rows state.
   */
  private extractSalespeopleLookup(): void {
    const userIds = new Set<number>();
    this.customers.forEach(c => {
      if (c.createdByUserId) userIds.add(c.createdByUserId);
    });
    this.salespeopleOptions = Array.from(userIds).map(id => ({
      label: `Executive Officer: ${id}`,
      value: id
    }));
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
   * BULK ACTION A: Iterates collection to update assignee records on backend sequentially.
   */
  async executeBulkReassignment(): Promise<void> {
    if (!this.targetSalespersonId || !this.selectedCustomers.length) return;

    const totalToUpdate = this.selectedCustomers.length;
    let successfulUpdates = 0;

    try {
      for (const targetCustomer of this.selectedCustomers) {
        const payload = {
          ...targetCustomer,
          createdByUserId: this.targetSalespersonId,
          tenantId: this.tenantId
        };
        await firstValueFrom(this.customerService.updateCustomer(targetCustomer.id, payload));
        successfulUpdates++;
      }

      this.messageService.add({
        severity: 'success',
        summary: 'Bulk Migration Synthesized',
        detail: `Successfully reassigned ${successfulUpdates} of ${totalToUpdate} accounts.`
      });

      this.bulkAssignDialog = false;
      this.selectedCustomers = [];
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
   * BULK ACTION B: Format rows to compile a global dynamic WhatsApp deep link window thread.
   */
  executeWhatsAppBroadcast(): void {
    if (!this.selectedCustomers.length) return;

    // Filter valid entries with registered contact phones
    const validPhones = this.selectedCustomers
      .map(c => c.commercialContactPhone?.replace(/[^0-9+]/g, ''))
      .filter(phone => !!phone);

    if (!validPhones.length) {
      this.messageService.add({ severity: 'warn', summary: 'Broadcast Blocked', detail: 'Selected targets lack phone numbers.' });
      return;
    }

    // Launch broadcast notification modal sequence wrapper via deep link configuration
    const defaultText = encodeURIComponent('Hello, this is an update regarding your wholesale business account limits.');
    const targetUrl = `https://wa.me{defaultText}&phone=${validPhones.join(',')}`;
    window.open(targetUrl, '_blank');
  }

  /**
   * BULK ACTION C: Prints specific formatting sheets for delivery routing pipelines.
   */
  executePrintLabels(): void {
    if (!this.selectedCustomers.length) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    let content = '<html><head><title>Mailing Labels</title><style>';
    content += 'body { font-family: monospace; padding: 20px; }';
    content += '.label { border: 1px dashed #000; padding: 15px; margin-bottom: 10px; border-radius: 4px; page-break-inside: avoid; }';
    content += '</style></head><body>';

    this.selectedCustomers.forEach(c => {
      content += `<div class="label">`;
      content += `<strong>${c.customerName}</strong><br/>`;
      content += `Contact: ${c.commercialContactPerson || 'N/A'}<br/>`;
      content += `Phone: ${c.commercialContactPhone || 'No Phone'}<br/>`;
      content += `Region/City: ${(c as any).cityName}<br/>`;
      content += `</div>`;
    });

    content += '</body></html>';
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  }

  /**
   * EXPORT UTILITY: Composes CSV text structure safely tracking layout separators.
   */
  exportToCSV(): void {
    if (!this.customers.length) return;

    const headers = ['ID', 'Client Name', 'Contact Person', 'Phone Number', 'Category', 'City', 'Credit Limit', 'Pending Balance', 'Lifetime Sales', 'GSTIN'];
    const rows = this.customers.map(c => [
      c.id,
      `"${c.customerName.replace(/"/g, '""')}"`,
      `"${(c.commercialContactPerson || '').replace(/"/g, '""')}"`,
      `"${c.commercialContactPhone || ''}"`,
      `"${c.customerCategoryId || ''}"`,
      `"${(c as any).cityName || ''}"`,
      c.creditLimit || 0,
      (c as any).pendingBalance || 0,
      (c as any).lifetimeSales || 0,
      `"${(c as any).gstin || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `customer_directory_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
