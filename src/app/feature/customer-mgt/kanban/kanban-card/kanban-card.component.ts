
import { Component, HostBinding, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';

// Local temporary interface mirroring your TypeORM Customer entity fields
interface CustomerMock {
  id: number;
  tenantId: number;
  customerName: string;
  commercialContactPerson?: string;city:string;cityName:string;
  commercialContactPhone?: string;
  customerCategoryId?: string;
  clientStatus?: string;
  creditLimit?: number;
  creditDays?: number;
  leadSource?: string;
}

@Component({
  selector: 'app-kanban-card',
  standalone: true,
  imports: [CommonModule,RouterLink, TooltipModule],
  templateUrl: './kanban-card.component.html'
})
export class KanbanCardComponent implements OnInit {
   @HostBinding('class') class = 'block w-full';

  // Real-world configuration uses @Input() to receive data from the Kanban Board loops
  @Input() customer!: CustomerMock;

ngOnInit() {
  if (!this.customer) {
    this.customer = {
      id: 101,
      tenantId: 1,
      customerName: 'Maruti Sanitary & Ceramics',city:'Pashan',cityName:'Pashan',
      commercialContactPerson: 'Rajesh Sharma',
      commercialContactPhone: '+91 98765 43210',
      customerCategoryId: 'A-Tier Wholesaler',
      leadSource: 'Exhibition'
    };
    // Dynamically assign field variable based on what your entity exports
    (this.customer as any).leadStatus = 'New Lead';
  }
}

}
