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
import { POStatus, PurchaseKanbanCardComponent } from '../../kanban/purchase-kanban-card/purchase-kanban-card.component';
import { PurchaseService } from '../../../../core/services/purchase.service';
import { AuthService } from '../../../../core/services/auth.service';

// Local Custom Dependencies Mapped Safely




interface KanbanColumn {
  id: POStatus;
  title: string;
  styleClass: string;
}

@Component({
  selector: 'app-purchase-kanban-board',
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
    PurchaseKanbanCardComponent
  ],
  providers: [MessageService],
  templateUrl: './purchase-kanban-board.component.html',
  styleUrl: './purchase-kanban-board.component.scss'
})
export class PurchaseKanbanBoardComponent implements OnInit {
  tenantId!: number;
  allPurchaseOrders: any[] = [];
  filteredPurchaseOrders: any[] = [];
  draggedPurchaseOrder: any | null = null;

  // Fully rewritten columns mapping exclusively to your TypeORM status restrictions
  columns: KanbanColumn[] = [
    { id: POStatus.DRAFT, title: 'Drafting Phase', styleClass: 'border-left-2 border-slate-400 bg-slate-50/10' },
    { id: POStatus.PENDING_APPROVAL, title: 'Awaiting Sign-off', styleClass: 'border-left-2 border-blue-400 bg-blue-50/10' },
    { id: POStatus.APPROVED, title: 'Authorized Orders', styleClass: 'border-left-2 border-cyan-400 bg-cyan-50/10' },
    { id: POStatus.SENT, title: 'Sent to Vendor', styleClass: 'border-left-2 border-purple-400 bg-purple-50/10' },
    { id: POStatus.PARTIALLY_RECEIVED, title: 'Partial Intake', styleClass: 'border-left-2 border-amber-400 bg-amber-50/10' },
    { id: POStatus.CLOSED, title: 'Fulfillment Completed', styleClass: 'border-left-2 border-emerald-400 bg-emerald-50/10' },
    { id: POStatus.CANCELLED, title: 'Revoked/Cancelled', styleClass: 'border-left-2 border-red-400 bg-red-50/10' }
  ];

  // Filtering Models Mapped for Purchase Orders
  selectedVendor: number | null = null;
  maxTotalAmountFilter: number | null = null;
  pipelineFilter: string = 'all';

  // Master lookup options arrays
  vendorOptions: Array<{ label: string; value: number }> = [];
  vendorLookupMap: { [key: number]: string } = {};
  
  pipelineOptions = [
    { label: 'All Orders', value: 'all' },
    { label: 'High Value (>₹50k)', value: 'highValue' },
    { label: 'Multi-Item Bundles', value: 'multiItem' }
  ];

  // DI Runtime Injection
  private poService = inject(PurchaseService);
  private authServ = inject(AuthService);
  private messageService = inject(MessageService);
  private cd = inject(ChangeDetectorRef);

  async ngOnInit(): Promise<void> {
    this.tenantId = this.authServ.getTenantId() || 1;
    await this.loadProcurementData();
  }

  async loadProcurementData(): Promise<void> {
    try {
      const records = await firstValueFrom(this.poService.getPOs(this.tenantId));
      this.allPurchaseOrders = records || [];
      
      this.extractVendorLookups();
      this.applyGlobalFilters();
    } catch (error: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Procurement Sync Failure',
        detail: error.message || 'Failed to populate pipeline board records.'
      });
    }
  }

  /**
   * Generates localized vendor dictionaries out of relational payload structures
   */
  private extractVendorLookups(): void {
    const rawOptions: Array<{ label: string; value: number }> = [];
    
    this.allPurchaseOrders.forEach(po => {
      if (po.vendorId && po.vendor) {
        this.vendorLookupMap[po.vendorId] = po.vendor.vendorName;
        if (!rawOptions.some(opt => opt.value === po.vendorId)) {
          rawOptions.push({ label: po.vendor.vendorName, value: po.vendorId });
        }
      }
    });
    this.vendorOptions = rawOptions;
  }

  /**
   * Evaluates relative visual weight inside p-meterGroup based on Total Financial Volume
   */
  getMeterGroupMetrics() {
    let totalPipelineValue = 0;
    const valueMap: { [key in POStatus]?: number } = {};

    // Initialize map counters
    this.columns.forEach(col => valueMap[col.id] = 0);

    // Sum financial volumes based on layout filters
    this.filteredPurchaseOrders.forEach(po => {
      const amount = Number(po.totalAmount || 0);
      totalPipelineValue += amount;
      if (valueMap[po.status as POStatus] !== undefined) {
        valueMap[po.status as POStatus]! += amount;
      }
    });

    if (totalPipelineValue === 0) {
      return [{ label: 'Empty Financial Registry', value: 0, color: '#94a3b8' }];
    }

    // Color definitions matching CSS styles
    const colors: { [key in POStatus]: string } = {
      [POStatus.DRAFT]: '#64748b',
      [POStatus.PENDING_APPROVAL]: '#3b82f6',
      [POStatus.APPROVED]: '#06b6d4',
      [POStatus.SENT]: '#a855f7',
      [POStatus.PARTIALLY_RECEIVED]: '#f59e0b',
      [POStatus.CLOSED]: '#10b981',
      [POStatus.CANCELLED]: '#ef4444'
    };

    return this.columns
      .map(col => ({
        label: col.title,
        value: Math.round((valueMap[col.id]! / totalPipelineValue) * 100),
        color: colors[col.id],
        icon: 'pi pi-wallet'
      }))
      .filter(metric => metric.value > 0); // Drop empty metrics for template visibility
  }

  applyGlobalFilters(): void {
    this.filteredPurchaseOrders = this.allPurchaseOrders.filter(po => {
      if (!po.status) return false;

      // 1. Pipeline Custom Segment Filters
      if (this.pipelineFilter === 'highValue' && Number(po.totalAmount) <= 50000) return false;
      if (this.pipelineFilter === 'multiItem' && (!po.items || po.items.length <= 1)) return false;

      // 2. Vendor Selection Mapping Filter
      if (this.selectedVendor && po.vendorId !== this.selectedVendor) return false;

      // 3. Financial Cost Range Filter Check
      if (this.maxTotalAmountFilter && Number(po.totalAmount) > this.maxTotalAmountFilter) return false;

      return true;
    });

    this.cd.markForCheck();
    this.cd.detectChanges();
  }

  getPOsByStatus(statusId: POStatus): any[] {
    return this.filteredPurchaseOrders.filter(po => po.status === statusId);
  }

  getColumnFinancialSum(statusId: POStatus): number {
    return this.getPOsByStatus(statusId).reduce((acc, curr) => acc + Number(curr.totalAmount || 0), 0);
  }

  onDragStart(po: any): void {
    this.draggedPurchaseOrder = po;
  }

  onDragEnd(): void {
    this.draggedPurchaseOrder = null;
  }

  /**
   * Orchestrates the drag-and-drop state modifications safely. Includes full execution rollback
   * procedures if the remote server flags or rejects target mutation adjustments.
   */
  async onDrop(targetStatus: POStatus): Promise<void> {
    if (!this.draggedPurchaseOrder || this.draggedPurchaseOrder.status === targetStatus) {
      return;
    }

    const previousStatus = this.draggedPurchaseOrder.status;

    // A. Local Interface Mutation for UI responsiveness
    this.draggedPurchaseOrder.status = targetStatus;
      const targetId = this.draggedPurchaseOrder.id;
    this.applyGlobalFilters();

    try {
      const mutationPayload = {
        ...this.draggedPurchaseOrder,
        status: targetStatus,
        tenantId: this.tenantId
      };

      // Push changes upstream to the backend database via single-parameter payload signature
      await firstValueFrom(this.poService.updatePurchaseOrder(targetId,mutationPayload));
      
      this.messageService.add({
        severity: 'success',
        summary: 'Procurement Workflow Advanced',
        detail: `${this.draggedPurchaseOrder.poNumber} successfully updated to status ${targetStatus}.`
      });
    } catch (error: any) {
      // B. Rollback state data instantly if database tier rejects mutations
      const targetRecord = this.allPurchaseOrders.find(po => po.id === this.draggedPurchaseOrder.id);
      if (targetRecord) {
        targetRecord.status = previousStatus;
      }
      this.applyGlobalFilters();

      this.messageService.add({
        severity: 'error',
        summary: 'Workflow State Rejected',
        detail: error.message || 'Database validation rules restricted state advancement.'
      });
    }
  }
}
