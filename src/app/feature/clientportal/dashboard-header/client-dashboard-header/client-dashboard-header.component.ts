import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CardModule } from 'primeng/card';
import { CustomerService } from '../../../../core/services/customer.service';
import { Customer } from '../../../../core/models/customer.model';
import { AuthService } from '../../../../core/services/auth.service';
import { tap } from 'rxjs';

@Component({
  selector: 'app-client-dashboard-header',
  imports: [CommonModule,CardModule],
  templateUrl: './client-dashboard-header.component.html',
  styleUrl: './client-dashboard-header.component.scss'
})
export class ClientDashboardHeaderComponent implements OnInit{
  tenantId!:number;
  clientId!:number;
  customer!:Customer;
  private customerService=inject(CustomerService);
  private authServ=inject(AuthService);

headerData = {
  clientName: 'Rahul Sharma',
  companyName: 'Apex Sanitary & Janitorial Supplies Ltd.',
  contractTier: 'Gold Master Wholesale',
  contractExpiry: new Date(2027, 2, 31), // March 31, 2027
  lastLoginTimestamp: '',//new Date(), // Populates current real-time timestamp 
  lastLoginIp: '192.168.1.104',
  erpStatus: 'Connected'
};
  constructor(private cdr: ChangeDetectorRef) {}

ngOnInit(){
  this.tenantId=this.authServ.getTenantId()!;
  this.clientId=this.authServ.getClientId()!

  this.getCustomer().subscribe();
}

  getCustomer() {
  return this.customerService.getCustomer(this.tenantId,this.clientId).pipe(
      tap((custs: any) => {
        
        this.customer = JSON.parse(JSON.stringify(custs)); 

        
                this.headerData.clientName=this.customer.commercialContactPerson;
                        this.headerData.companyName=this.customer.customerName;
                       this.headerData.lastLoginTimestamp= this.formatLoginDate(localStorage.getItem('lastLoginAt'))
this.cdr.detectChanges(); 
console.log('localStorage.getItemlastLoginAt:',localStorage.getItem('lastLoginAt'));
const rawValue = localStorage.getItem('lastLoginAt');
console.log('RAW VALUE FROM STORAGE:', rawValue);
console.log('TYPE OF VALUE:', typeof rawValue);

this.headerData.lastLoginTimestamp = this.formatLoginDate(rawValue);
console.log('FINAL FORMATTED STRING:', this.headerData.lastLoginTimestamp);

        
        
      })
    );
    
  }



  // Helper utility to make the date clean and short

  formatLoginDate = (isoString: string | null): string => {
    if (!isoString) return 'Never';
    if (isoString.includes('First time')) return isoString;

    // 🛠️ FIX: Clean up the string by removing escaped quotes, line breaks, or whitespace
    const cleanedString = isoString.replace(/["']/g, '').trim();

    const date = new Date(cleanedString);
    
    // Fallback if the string is completely unparseable
    if (isNaN(date.getTime())) return 'Never';

    return date.toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit', // Forces numeric month (e.g. 26/07/2026)
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
};


}
