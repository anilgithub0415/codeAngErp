import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

// PrimeNG Modules
import { DragDropModule } from 'primeng/dragdrop';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { SelectButtonModule } from 'primeng/selectbutton';

// Project Internal Dependencies
import { CustomerService } from '../../../../core/services/customer.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Customer } from '../../../../core/models/customer.model';
import { KanbanCardComponent } from '../../kanban/kanban-card/kanban-card.component';
import { TooltipModule } from 'primeng/tooltip';

// Interface representing the strict structure of individual kanban column lists
interface KanbanColumn {
  id: string;
  title: string;
  styleClass: string;
}

@Component({
  selector: 'app-kanaban-board',standalone:true,
  imports: [CommonModule,
    FormsModule,
    DragDropModule,
    ToastModule,
    DropdownModule,
    CalendarModule,
    SelectButtonModule,TooltipModule,
    KanbanCardComponent],
  templateUrl: './kanaban-board.component.html',
  styleUrl: './kanaban-board.component.scss'
})
export class KanabanBoardComponent implements OnInit {
  // Application context state tracking variables
  tenantId!: number;
  allCustomers: Customer[] = [];
  filteredCustomers: Customer[] = [];
  draggedCustomer: Customer | null = null;

  // Kanban Horizontal Column Layout Definition Configuration mapping to entity clientStatus
  // Modify your configuration mapping inside customer-kanban.component.ts
columns: KanbanColumn[] = [
  { id: 'NewLead', title: 'New Lead', styleClass: 'border-blue-500 bg-blue-50/30' },
  { id: 'Contact Pending', title: 'Contact Pending', styleClass: 'border-orange-500 bg-orange-50/30' },
  { id: 'Requirement Discussion', title: 'Requirement Discussion', styleClass: 'border-purple-500 bg-purple-50/30' },
  { id: 'Quotation Sent', title: 'Quotation Sent', styleClass: 'border-teal-500 bg-teal-50/30' },
  { id: 'Follow-up Pending', title: 'Follow-up Pending', styleClass: 'border-pink-500 bg-pink-50/30' },
  { id: 'Converted to Client', title: 'Converted', styleClass: 'border-green-500 bg-green-50/30' },
  { id: 'Lost Lead', title: 'Lost Lead', styleClass: 'border-red-500 bg-red-50/30' }
];


  // Filtering System State tracking variables 
  selectedSalesperson: number | null = null;
  selectedDateRange: Date[] | null = null;
  pipelineFilter: string = 'active'; // Default view option

  // Filters Dropdown datasets layout options
  salespeopleOptions: Array<{ label: string; value: number }> = [];
  pipelineOptions = [
    { label: 'Active Pipeline', value: 'active' },
    { label: 'Archived / Closed', value: 'archived' },
    { label: 'Show All Records', value: 'all' }
  ];

  // DI Token runtime initializers
  private customerService = inject(CustomerService);
  private authServ = inject(AuthService);
  private messageService = inject(MessageService);
  private cd = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.tenantId = this.authServ.getTenantId()!;
    this.loadKanbanData();
  }

  /**
   * Orchestrates synchronization routines to assemble visual grid state.
   */
 // 1. Add an internal state dictionary to track city name conversions
cityLookupMap: { [key: number]: string } = {};

/**
 * Orchestrates data sync routines to fetch rows and resolve lookup definitions.
 */
async loadKanbanData(): Promise<void> {
  try {
    // A. Query the city dropdown master data array
    this.customerService.getCityLookup(this.tenantId).subscribe({
      next: (lookups: any[]) => {
        if (Array.isArray(lookups)) {
          // 💡 DEBUG LOG: Paste this to see exactly what properties your backend is sending
          console.log('RAW CITY LOOKUP FROM BACKEND:', lookups);

          lookups.forEach(item => {
            // Resolve the ID key dynamically (handles item.value, item.id, item.Id, or item.cityId)
            const rawId = item.value !== undefined ? item.value : (item.id !== undefined ? item.id : item.Id);
            
            // Resolve the Text Label dynamically (handles item.label, item.name, item.Name, or item.cityName)
            const labelText = item.label || item.name || item.Name || item.cityName;

            if (rawId !== undefined && labelText) {
              this.cityLookupMap[Number(rawId)] = labelText;
            }
          });

          // Re-trigger translation once data maps are safely populated
          this.translateCityIdsToLabels();
        }
      },
      error: (err) => console.error('Failed to load city lookups from server:', err)
    });

    // B. Pull the pipeline customer records matching the active tenant scope
    const data = await firstValueFrom(this.customerService.getCustomers(this.tenantId));
    this.allCustomers = data || [];
    
    this.translateCityIdsToLabels();
    this.extractSalespeopleLookup();
    this.applyGlobalFilters();
  } catch (error: any) {
    this.messageService.add({
      severity: 'error',
      summary: 'Data Sync Breakdown',
      detail: error.message || 'Failed to populate pipeline board records.'
    });
  }
}


/**
 * Iterates over customer objects to append a responsive cityName property string.
 */
private translateCityIdsToLabels(): void {
  if (!this.allCustomers.length || !Object.keys(this.cityLookupMap).length) return;

  this.allCustomers.forEach(customer => {
    if (customer.city !== undefined && customer.city !== null) {
      const cityId = Number(customer.city);
      // Create a transient view-model attribute 'cityName' read by your card subcomponent
      (customer as any).cityName = this.cityLookupMap[cityId] || `City ID: ${cityId}`;
    }
  });

  this.applyGlobalFilters();
}



  /**
   * Scans rows dynamically for unique salesperson values to configure filter options.
   */
  private extractSalespeopleLookup(): void {
    const userIds = new Set<number>();
    this.allCustomers.forEach(c => {
      if (c.createdByUserId) {
        userIds.add(c.createdByUserId);
      }
    });
    this.salespeopleOptions = Array.from(userIds).map(id => ({
      label: `Executive ID: ${id}`,
      value: id
    }));
  }

  private normalizeStatus(status: string | undefined | null): string {
  return status ? status.toString().trim().toLowerCase() : '';
}

  
/**
 * Refactored global filter scanning routine.
 */
applyGlobalFilters(): void {
  this.filteredCustomers = this.allCustomers.filter(customer => {
    // Guard against null or missing values
    if (!customer.clientStatus) {
      return false;
    }

    // 1. Executive Sales Filter Rule
    if (this.selectedSalesperson && customer.createdByUserId !== this.selectedSalesperson) {
      return false;
    }

    // 2. Archive Pipeline Rule (Normalized string validation metrics)
    const normalizedStatus = this.normalizeStatus(customer.clientStatus);
    const isArchivedStatus = normalizedStatus === 'converted to client' || normalizedStatus === 'lost lead';
    
    if (this.pipelineFilter === 'active' && isArchivedStatus) {
      return false;
    }
    if (this.pipelineFilter === 'archived' && !isArchivedStatus) {
      return false;
    }

    return true;
  });

  // Explicitly prompt UI re-rendering cycles
  this.cd.markForCheck();
  this.cd.detectChanges();
}

/**
 * Returns filtered entries assigned to specific column layout targets using safe parsing.
 */
getCustomersByStatus(statusId: string): Customer[] {
  const targetNormalized = this.normalizeStatus(statusId);
  return this.filteredCustomers.filter(c => this.normalizeStatus(c.clientStatus) === targetNormalized);
}


  /**
   * Triggered when a customer card starts being dragged.
   */
  onDragStart(customer: Customer): void {
    this.draggedCustomer = customer;
  }

  /**
   * Triggered when a drag action completes.
   */
  onDragEnd(): void {
    this.draggedCustomer = null;
  }

  /**
   * Processes the drop mutation update whenever a card lands on a column target.
   */
  async onDrop(targetStatus: string): Promise<void> {
    if (!this.draggedCustomer || this.draggedCustomer.clientStatus === targetStatus) {
      return;
    }

    const previousStatus = this.draggedCustomer.clientStatus;
    const customerId = this.draggedCustomer.id;

    // Local Mutation for Instant UI responsiveness 
    this.draggedCustomer.clientStatus = targetStatus;
    this.applyGlobalFilters();

    try {
      // Create mutation payload matching backend object shapes
      const mutationPayload = {
        ...this.draggedCustomer,
        clientStatus: targetStatus,
        tenantId: this.tenantId
      };

      await firstValueFrom(this.customerService.updateCustomer(customerId, mutationPayload));
      
      this.messageService.add({
        severity: 'success',
        summary: 'Pipeline Tracking Updated',
        detail: `${this.draggedCustomer.customerName} migrated to ${targetStatus}.`
      });
    } catch (error: any) {
      // Revert state if mutation is rejected by database engine
      const originalRecord = this.allCustomers.find(c => c.id === customerId);
      if (originalRecord) {
        originalRecord.clientStatus = previousStatus;
      }
      this.applyGlobalFilters();

      this.messageService.add({
        severity: 'error',
        summary: 'Database Write Error',
        detail: error.message || 'Pipeline shift rejected by cloud server metrics.'
      });
    }
  }
}
