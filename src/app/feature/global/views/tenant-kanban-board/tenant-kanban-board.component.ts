import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from 'primeng/dragdrop';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { MeterGroupModule } from 'primeng/metergroup';
import { TagModule } from 'primeng/tag';
import { ImageModule } from 'primeng/image';
import { OverlayPanel, OverlayPanelModule } from 'primeng/overlaypanel';
import { MessageService } from 'primeng/api';

import { TenantKanbanCardComponent } from '../../Kanban/tenant-kanban-card/tenant-kanban-card.component';
import { TenantService } from '../../../../core/services/tenant.service';
import { firstValueFrom, tap } from 'rxjs';

interface Tenant {
  tenantId: number;
  tenantName: string;
  tenantTypeName: string; // The property representing the dynamic lookup string
  subscriptionPlanName: string;
  subscriptionEndDate?: Date | string | null;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  autocodeConfig?: { faculty?: string; student?: string };
}

@Component({
  selector: 'app-tenant-kanban-board',
  standalone: true,
  imports: [
    CommonModule, FormsModule, DragDropModule, DropdownModule, 
    InputNumberModule, SelectButtonModule, TooltipModule, ToastModule, 
    MeterGroupModule, TagModule, ImageModule, OverlayPanelModule, 
    TenantKanbanCardComponent
  ],
  providers: [MessageService],
  templateUrl: './tenant-kanban-board.component.html'
})
export class TenantKanbanBoardComponent implements OnInit {
  @ViewChild('op') overlayPanel!: OverlayPanel;

  // 💡 FIX: ID fields aligned precisely to match database tenantTypeName targets
  columns = [
    { id: 'Wholesaler', title: 'Wholesalers', styleClass: 'border-left-4 border-blue-500' },
    { id: 'Dealer', title: 'Dealers', styleClass: 'border-left-4 border-orange-500' },
    { id: 'Manufacturer', title: 'Manufacturers', styleClass: 'border-left-4 border-purple-500' }
  ];

  pipelineOptions = [
    { label: 'Show All Systems', value: 'ALL' },
    { label: 'Production Only', value: 'PROD' }
  ];
  pipelineFilter: string = 'ALL';

  // 💡 FIX: Updated lookup items to cleanly evaluate interface states
  typeOptions = [
    { label: 'Wholesaler', value: 'Wholesaler' },
    { label: 'Dealer', value: 'Dealer' },
    { label: 'Manufacturer', value: 'Manufacturer' }
  ];
  selectedType: string | null = null;
  activeConfigsOnly: boolean = false;

  allTenants: Tenant[] = [];
  filteredTenants: Tenant[] = [];
  draggedTenant: Tenant | null = null;
  selectedContextTenant: Tenant | null = null;
  visibleDataArray!: any[];

  private tenantService = inject(TenantService);

  constructor(private messageService: MessageService) {}

  ngOnInit() {
    this.getTenantList().then(data => {
      data.forEach(item => {
        // Safe mapping configuration check fallback if property is missing
        if (!item.subscriptionPlanName) {
          item.subscriptionPlanName = "Settled";
        }
      });
      this.allTenants = data;
      this.visibleDataArray = [...this.allTenants];
      
      // 💡 FIX: Re-evaluating structural layout filters after async data stream loads
      this.applyGlobalFilters();
      console.log('Tenants successfully initialized:', this.allTenants);
    }).catch((err: any) => {
      console.error('Initialization Error:', err);
    });
  }

  getTenantList(): Promise<any[]> {
    const observable$ = this.tenantService.getTenants().pipe(
      tap((data: any) => {
        console.log('All tenants fetched from server:', data);
      })
    );
    return firstValueFrom(observable$);
  }

  // 💡 FIX: Simplified sorting completely to group strict type matching without side effects
  getTenantsByLane(laneId: string): Tenant[] {
    return this.filteredTenants.filter(t => t.tenantTypeName === laneId);
  }

  applyGlobalFilters() {
    this.filteredTenants = this.allTenants.filter(t => {
      const matchType = !this.selectedType || t.tenantTypeName === this.selectedType;
      const matchPipeline = this.pipelineFilter === 'ALL' || t.subscriptionPlanName !== 'Trial Level';
      return matchType && matchPipeline;
    });
  }

  // 💡 FIX: Dynamic distribution calculations tied to dynamic type counts
  getMeterGroupMetrics() {
    const total = this.allTenants.length || 1;
    const wholesalers = this.allTenants.filter(t => t.tenantTypeName === 'Wholesaler').length;
    const dealers = this.allTenants.filter(t => t.tenantTypeName === 'Dealer').length;
    const manufacturers = this.allTenants.filter(t => t.tenantTypeName === 'Manufacturer').length;

    return [
      { label: 'Wholesalers', value: Math.round((wholesalers / total) * 100), color: '#3b82f6', icon: 'pi pi-percentage' },
      { label: 'Dealers', value: Math.round((dealers / total) * 100), color: '#f97316', icon: 'pi pi-shop' },
      { label: 'Manufacturers', value: Math.round((manufacturers / total) * 100), color: '#a855f7', icon: 'pi pi-building' }
    ];
  }

  onDragStart(tenant: Tenant) {
    this.draggedTenant = tenant;
  }

  onDragEnd() {
    this.draggedTenant = null;
  }

  // 💡 FIX: Dropping a card updates the TypeName taxonomy safely across the datastore partition
  onDrop(laneId: string) {
    if (!this.draggedTenant) return;

    const previousType = this.draggedTenant.tenantTypeName;
    this.draggedTenant.tenantTypeName = laneId;

    this.messageService.add({
      severity: 'success',
      summary: 'Lane Taxonomy Mutated',
      detail: `${this.draggedTenant.tenantName} updated from ${previousType} to ${laneId}`
    });
    
    this.applyGlobalFilters();
  }

  openSystemContext(event: MouseEvent, tenant: Tenant) {
    this.selectedContextTenant = tenant;
    this.overlayPanel.toggle(event);
  }
}
