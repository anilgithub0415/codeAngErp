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
import { SalesKanbanCardComponent } from '../../kanban/sales-kanban-card/sales-kanban-card.component';
import { SalesService } from '../../../../core/services/sales.service';
import { AuthService } from '../../../../core/services/auth.service';

// Local Custom Dependencies Injection Mapped Cleanly



interface KanbanColumn {
  id: string;
  title: string;
  styleClass: string;
}

@Component({
  selector: 'app-sales-kanban-board',
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
    SalesKanbanCardComponent
  ],
  providers: [MessageService],
  templateUrl: './sales-kanban-board.component.html',
  styleUrl: './sales-kanban-board.component.scss'
})
export class SalesKanbanBoardComponent implements OnInit {
  tenantId!: number;
  allSalesOrders: any[] = [];
  filteredSalesOrders: any[] = [];
  draggedSalesOrder: any | null = null;

  // Ordered execution columns processing status fields lower-case values cleanly
  columns: KanbanColumn[] = [
    { id: 'draft', title: 'Quotations/Drafts', styleClass: 'border-left-2 border-slate-400 bg-slate-50/10' },
    { id: 'pending_review', title: 'Internal Audit', styleClass: 'border-left-2 border-blue-400 bg-blue-50/10' },
    { id: 'approved', title: 'Confirmed Contracts', styleClass: 'border-left-2 border-cyan-400 bg-cyan-50/10' },
    { id: 'processing', title: 'Picking/Assembly', styleClass: 'border-left-2 border-purple-400 bg-purple-50/10' },
    { id: 'shipped', title: 'Out for Delivery', styleClass: 'border-left-2 border-amber-400 bg-amber-50/10' },
    { id: 'delivered', title: 'Invoiced & Closed', styleClass: 'border-left-2 border-emerald-400 bg-emerald-50/10' },
    { id: 'cancelled', title: 'Voided Orders', styleClass: 'border-left-2 border-red-400 bg-red-50/10' }
  ];

  selectedClient: number | null = null;
  maxTotalAmountFilter: number | null = null;
  pipelineFilter: string = 'all';

  clientOptions: Array<{ label: string; value: number }> = [];
  clientLookupMap: { [key: number]: string } = {};
  
  pipelineOptions = [
    { label: 'All Orders', value: 'all' },
    { label: 'High Revenue (>₹1 Lakh)', value: 'premium' },
    { label: 'Custom Config Lines', value: 'customized' }
  ];

  private salesService = inject(SalesService);
  private authServ = inject(AuthService);
  private messageService = inject(MessageService);
  private cd = inject(ChangeDetectorRef);

  async ngOnInit(): Promise<void> {
    this.tenantId = this.authServ.getTenantId() || 1;
    await this.loadSalesPipelineData();
  }

  async loadSalesPipelineData(): Promise<void> {
    try {
      const records = await firstValueFrom(this.salesService.getSOs(this.tenantId));
      this.allSalesOrders = records || [];
      
      this.extractClientLookups();
      this.applyGlobalFilters();
    } catch (error: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Commercial Pipeline Outage',
        detail: error.message || 'Failed to populate pipeline board records.'
      });
    }
  }

  private extractClientLookups(): void {
    const rawOptions: Array<{ label: string; value: number }> = [];
    this.allSalesOrders.forEach(so => {
      if (so.clientId && so.client) {
        this.clientLookupMap[so.clientId] = so.client.customerName;
        if (!rawOptions.some(opt => opt.value === so.clientId)) {
          rawOptions.push({ label: so.client.customerName, value: so.clientId });
        }
      }
    });
    this.clientOptions = rawOptions;
  }

  /**
   * Generates dynamic charts matrices within p-meterGroup based on active Revenue totals
   */
  getMeterGroupMetrics() {
    let totalPipelineValue = 0;
    const valueMap: { [key: string]: number } = {};

    this.columns.forEach(col => valueMap[col.id] = 0);

    this.filteredSalesOrders.forEach(so => {
      const statusKey = so.status?.toLowerCase().trim();
      const amount = Number(so.totalAmount || 0);
      totalPipelineValue += amount;
      if (valueMap[statusKey] !== undefined) {
        valueMap[statusKey] += amount;
      }
    });

    if (totalPipelineValue === 0) {
      return [{ label: 'No Active Pipeline Capital', value: 0, color: '#94a3b8' }];
    }

    const colors: { [key: string]: string } = {
      'draft': '#64748b',
      'pending_review': '#3b82f6',
      'approved': '#06b6d4',
      'processing': '#a855f7',
      'shipped': '#f59e0b',
      'delivered': '#10b981',
      'cancelled': '#ef4444'
    };

    return this.columns
      .map(col => ({
        label: col.title,
        value: Math.round((valueMap[col.id] / totalPipelineValue) * 100),
        color: colors[col.id] || '#3b82f6',
        icon: 'pi pi-chart-line'
      }))
      .filter(metric => metric.value > 0);
  }

  applyGlobalFilters(): void {
    this.filteredSalesOrders = this.allSalesOrders.filter(so => {
      if (!so.status) return false;

      const targetStatus = so.status.toLowerCase().trim();

      if (this.pipelineFilter === 'premium' && Number(so.totalAmount) <= 100000) return false;
      if (this.pipelineFilter === 'customized' && !so.customAttributes) return false;
      if (this.selectedClient && so.clientId !== this.selectedClient) return false;
      if (this.maxTotalAmountFilter && Number(so.totalAmount) > this.maxTotalAmountFilter) return false;

      return true;
    });

    this.cd.markForCheck();
    this.cd.detectChanges();
  }

  getSOsByStatus(statusId: string): any[] {
    const normId = statusId.toLowerCase().trim();
    return this.filteredSalesOrders.filter(so => so.status?.toLowerCase().trim() === normId);
  }

  getColumnFinancialSum(statusId: string): number {
    return this.getSOsByStatus(statusId).reduce((acc, curr) => acc + Number(curr.totalAmount || 0), 0);
  }

  onDragStart(so: any): void {
    this.draggedSalesOrder = so;
  }

  onDragEnd(): void {
    this.draggedSalesOrder = null;
  }

  /**
   * Drops mutation changes passing clear isolated id and data object properties payload
   */
  async onDrop(targetStatus: string): Promise<void> {
    if (!this.draggedSalesOrder || this.draggedSalesOrder.status?.toLowerCase().trim() === targetStatus.toLowerCase().trim()) {
      return;
    }

    const previousStatus = this.draggedSalesOrder.status;
    const targetId = this.draggedSalesOrder.id;

    // Local Instant Mutation 
    this.draggedSalesOrder.status = targetStatus;
    this.applyGlobalFilters();

    try {
      const mutationPayload = {
        ...this.draggedSalesOrder,
        status: targetStatus,
        tenantId: this.tenantId
      };

      // Execution: Clean dual signature parameters passing matching requirements
      await firstValueFrom(this.salesService.updateSalesOrder(targetId, mutationPayload));
      
      this.messageService.add({
        severity: 'success',
        summary: 'Revenue Workflow Shifted',
        detail: `${this.draggedSalesOrder.soNumber} successfully allocated to lane "${targetStatus}".`
      });
    } catch (error: any) {
      // Automatic Transaction rollback protection if backend flags execution exceptions
      const targetRecord = this.allSalesOrders.find(so => so.id === targetId);
      if (targetRecord) {
        targetRecord.status = previousStatus;
      }
      this.applyGlobalFilters();

      this.messageService.add({
        severity: 'error',
        summary: 'State Update Revoked',
        detail: error.message || 'Database validation rules restricted commercial route movement.'
      });
    }
  }
}
