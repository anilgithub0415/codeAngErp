import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';

// Local temporary interface mirroring your TypeORM Customer entity fields
interface CustomerMock {
  id: number;
  tenantId: number;
  customerName: string;customerCategory:string;
  commercialContactPerson?: string;
  commercialContactPhone?: string;
  customerCategoryId?: string;
  clientStatus?: string;
  creditLimit?: number;
  creditDays?: number;
  leadSource?: string;
}

@Component({
  selector: 'app-decorativecard',
  imports: [CommonModule,CardModule,ButtonModule,TooltipModule],
  templateUrl: './decorativecard.component.html',
  styleUrl: './decorativecard.component.scss'
})
export class DecorativecardComponent implements OnInit {
  
    // Real-world configuration uses @Input() to receive data from the Kanban Board loops
  @Input() customer!: CustomerMock;

  

  ngOnInit() {
    // Static Fallback Data matching your exact schema layout if no input is supplied
    if (!this.customer) {
      this.customer = {
        id: 101,
        tenantId: 1,
        customerName: 'Maruti Sanitary & Ceramics',customerCategory:'B2B',
        commercialContactPerson: 'Rajesh Sharma',
        commercialContactPhone: '+91 98765 43210',
        customerCategoryId: 'A-Tier Wholesaler',
        clientStatus: 'Quotation Sent',
        creditLimit: 500000,
        creditDays: 45,
        leadSource: 'Exhibition'
      };
    }
  }
}
