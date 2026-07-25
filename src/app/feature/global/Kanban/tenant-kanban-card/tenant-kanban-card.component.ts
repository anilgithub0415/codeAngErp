
import { Component, HostBinding, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';

// Mirror interface representing your TypeORM Tenant entity fields
interface TenantMock {
  tenantId: number;
  tenantName: string;
  tenantTypeName: string;
  subscriptionPlanName: string;
  subscriptionEndDate?: Date | string | null;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  autocodeConfig?: {
    faculty?: string;
    student?: string;
  };
}

@Component({
  selector: 'app-tenant-kanban-card',
  standalone: true,
  imports: [CommonModule, RouterLink, TooltipModule],
  templateUrl: './tenant-kanban-card.component.html'
})
export class TenantKanbanCardComponent implements OnInit {
  @HostBinding('class') class = 'block w-full';

  // Receives tenant context configuration data dynamically from board grid layout
  @Input() tenant!: TenantMock;

  ngOnInit() {
    if (!this.tenant) {
      // Default fallback mock values matching your TypeORM entity properties
      this.tenant = {
        tenantId: 404,
        tenantName: 'Apex Innovations Academy',
        tenantTypeName: 'Educational Institution',
        subscriptionPlanName: 'Enterprise Premium',
        subscriptionEndDate: '2027-12-31',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        autocodeConfig: {
          faculty: 'FAC-{YYYY}-{NNNN}',
          student: 'STU-{YYYY}-{NNNN}'
        }
      };
    }
  }
}
