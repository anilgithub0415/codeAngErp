import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-client-billing-account',
  imports: [CommonModule,CardModule,CurrencyPipe,TableModule],
  templateUrl: './client-billing-account.component.html',
  styleUrl: './client-billing-account.component.scss'
})
export class ClientBillingAccountComponent {
accountSummary = {
  availableCredit: 45000.00,
  totalOutstanding: 12500.50,
  overdueAmount: 2100.00
};

recentInvoices = [
  { invoiceNumber: 'INV-2026-089', dueDate: new Date(2026, 7, 15), itemSummary: 'Heavy Duty Cotton Mops (SKU-MOP01) x 50', amount: 4250.00, status: 'Unpaid', isOverdue: false },
  { invoiceNumber: 'INV-2026-074', dueDate: new Date(2026, 6, 20), itemSummary: 'Industrial Floor Cleaner 5L (SKU-CLN05) x 20', amount: 2100.00, status: 'Overdue', isOverdue: true }
];

}
