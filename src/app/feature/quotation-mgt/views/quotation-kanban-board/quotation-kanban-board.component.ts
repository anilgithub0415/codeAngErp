import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

// PrimeNG Infrastructure Components
import { DragDropModule } from 'primeng/dragdrop';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TooltipModule } from 'primeng/tooltip';
import { MeterGroupModule } from 'primeng/metergroup';

// Local Feature Component & Business Layer Services

import { QuotationService } from '../../../../core/services/quotation.service';
import { AuthService } from '../../../../core/services/auth.service';
import { QuotationStatus } from '../../Kanban/quotation-kanban-card/quotation-kanban-card.component';
import { QuotationKanbanCardComponent } from '../../Kanban/quotation-kanban-card/quotation-kanban-card.component';

interface KanbanColumn {
  id: QuotationStatus;
  title: string;
  styleClass: string;
}

@Component({
  selector: 'app-quotation-kanban-board',
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
    MeterGroupModule,
    QuotationKanbanCardComponent
  ],
  providers: [MessageService],
  templateUrl: './quotation-kanban-board.component.html',
  styleUrl: './quotation-kanban-board.component.scss'
})
export class QuotationKanbanBoardComponent implements OnInit {
  tenantId!: number;
  allQuotations: any[] = [];
  filteredQuotations: any[] = [];
  draggedQuotation: any | null = null;

  // Columns mapping explicitly to TypeORM QuotationStatus restrictions
  columns: KanbanColumn[] = [
    { id: QuotationStatus.DRAFT, title: 'Drafting Phase', styleClass: 'border-left-2 border-slate-400 bg-slate-50/10' },
    { id: QuotationStatus.SENT, title: 'Dispatched to Client', styleClass: 'border-left-2 border-purple-400 bg-purple-50/10' },
    { id: QuotationStatus.COUNTER_OFFERED, title: 'Client Counter Offer', styleClass: 'border-left-2 border-amber-400 bg-amber-50/10' },
    { id: QuotationStatus.REVISED, title: 'Internal Revisions', styleClass: 'border-left-2 border-blue-400 bg-blue-50/10' },
    { id: QuotationStatus.APPROVED, title: 'Accepted/Approved', styleClass: 'border-left-2 border-emerald-400 bg-emerald-50/10' },
    { id: QuotationStatus.REJECTED, title: 'Declined/Rejected', styleClass: 'border-left-2 border-red-400 bg-red-50/10' },
    { id: QuotationStatus.EXPIRED, title: 'Validity Expired', styleClass: 'border-left-2 border-orange-400 bg-orange-50/10' }
  ];

  // Filtering Models
  selectedClient: number | null = null;
  maxTotalAmountFilter: number | null = null;
  pipelineFilter: string = 'all';

  // Lookup options arrays
  clientOptions: Array<{ label: string; value: number }> = [];
  clientLookupMap: { [key: number]: string } = {};
  
  pipelineOptions = [
    { label: 'All Quotations', value: 'all' },
    { label: 'High Value (>₹50k)', value: 'highValue' },
    { label: 'Multi-Item Packages', value: 'multiItem' }
  ];

  // Dependecy Injection Lanes
  private quoteService = inject(QuotationService);
  private authServ = inject(AuthService);
  private messageService = inject(MessageService);
  private cd = inject(ChangeDetectorRef);

  async ngOnInit(): Promise<void> {
    this.tenantId = this.authServ.getTenantId() || 1;
    await this.loadNegotiationData();
  }

  async loadNegotiationData(): Promise<void> {
    try {
      const records = await firstValueFrom(this.quoteService.getQuotations(this.tenantId));
      this.allQuotations = records || [];
      
      this.extractClientLookups();
      this.applyGlobalFilters();
    } catch (error: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Negotiation Sync Failure',
        detail: error.message || 'Failed to populate pipeline board records.'
      });
    }
  }

  /**
   * Generates client lookup dictionaries out of relational payload structures
   */
  private extractClientLookups(): void {
    const rawOptions: Array<{ label: string; value: number }> = [];
    
    this.allQuotations.forEach(quote => {
      if (quote.clientId) {
        const clientName = quote.clientName || (quote.client && quote.client.customerName) || 'Unknown Client';
        this.clientLookupMap[quote.clientId] = clientName;
        if (!rawOptions.some(opt => opt.value === quote.clientId)) {
          rawOptions.push({ label: clientName, value: quote.clientId });
        }
      }
    });
    this.clientOptions = rawOptions;
  }

  /**
   * Evaluates relative visual weight inside p-meterGroup based on Total Valuation Volume
   */
  getMeterGroupMetrics() {
    let totalPipelineValue = 0;
    const valueMap: { [key in QuotationStatus]?: number } = {};

    this.columns.forEach(col => valueMap[col.id] = 0);

    this.filteredQuotations.forEach(quote => {
      const amount = Number(quote.totalAmount || 0);
      totalPipelineValue += amount;
      if (valueMap[quote.status as QuotationStatus] !== undefined) {
        valueMap[quote.status as QuotationStatus]! += amount;
      }
    });

    if (totalPipelineValue === 0) {
      return [{ label: 'Empty Financial Registry', value: 0, color: '#94a3b8' }];
    }

    const colors: { [key in QuotationStatus]: string } = {
      [QuotationStatus.DRAFT]: '#64748b',
      [QuotationStatus.SENT]: '#a855f7',
      [QuotationStatus.COUNTER_OFFERED]: '#f59e0b',
      [QuotationStatus.REVISED]: '#3b82f6',
      [QuotationStatus.APPROVED]: '#10b981',
      [QuotationStatus.REJECTED]: '#ef4444',
      [QuotationStatus.EXPIRED]: '#f97316'
    };

    return this.columns
      .map(col => ({
        label: col.title,
        value: Math.round((valueMap[col.id]! / totalPipelineValue) * 100),
        color: colors[col.id],
        icon: 'pi pi-wallet'
      }))
      .filter(metric => metric.value > 0);
  }
  applyGlobalFilters(): void {
    this.filteredQuotations = this.allQuotations.filter(quote => {
      if (!quote.status) return false;

      // 1. Pipeline Segment Filters
      if (this.pipelineFilter === 'highValue' && Number(quote.totalAmount) <= 50000) return false;
      if (this.pipelineFilter === 'multiItem' && (!quote.items || quote.items.length <= 1)) return false;

      // 2. Client Matrix Filter
      if (this.selectedClient && quote.clientId !== this.selectedClient) return false;

      // 3. Financial Cost Ceiling Filter Check
      if (this.maxTotalAmountFilter && Number(quote.totalAmount) > this.maxTotalAmountFilter) return false;

      return true;
    });

    this.cd.markForCheck();
    this.cd.detectChanges();
  }

  getQuotationsByStatus(statusId: QuotationStatus): any[] {
    return this.filteredQuotations.filter(quote => quote.status === statusId);
  }

  getColumnFinancialSum(statusId: QuotationStatus): number {
    return this.getQuotationsByStatus(statusId).reduce((acc, curr) => acc + Number(curr.totalAmount || 0), 0);
  }

  onDragStart(quote: any): void {
    this.draggedQuotation = quote;
  }

  onDragEnd(): void {
    this.draggedQuotation = null;
  }

  /**
   * Orchestrates the drag-and-drop negotiation state updates with execution rollback.
   */
  async onDrop(targetStatus: QuotationStatus): Promise<void> {
    if (!this.draggedQuotation || this.draggedQuotation.status === targetStatus) {
      return;
    }

    const previousStatus = this.draggedQuotation.status;

    // Local Interface Mutation for UI responsiveness
    this.draggedQuotation.status = targetStatus;
    const targetId = this.draggedQuotation.id;
    this.applyGlobalFilters();

    try {
      const mutationPayload = {
        ...this.draggedQuotation,
        status: targetStatus,
        tenantId: this.tenantId
      };

      // Push changes upstream to the backend database via service layer
      await firstValueFrom(this.quoteService.updateQuotation(targetId, mutationPayload));
      
      this.messageService.add({
        severity: 'success',
        summary: 'Negotiation Stage Advanced',
        detail: `Quote QT-${targetId} successfully shifted to status ${targetStatus}.`
      });
    } catch (error: any) {
      // Rollback status data instantly if database layer rejects mutations
      const targetRecord = this.allQuotations.find(q => q.id === this.draggedQuotation.id);
      if (targetRecord) {
        targetRecord.status = previousStatus;
      }
      this.applyGlobalFilters();

      this.messageService.add({
        severity: 'error',
        summary: 'Workflow Stage Rejected',
        detail: error.message || 'Validation rules restricted negotiation state advancement.'
      });
    }
  }
}
