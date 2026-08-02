import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CardModule } from 'primeng/card';
import { CustomerService } from '../../../../core/services/customer.service';
import { Customer } from '../../../../core/models/customer.model';
import { AuthService } from '../../../../core/services/auth.service';
import { tap } from 'rxjs';
import { UserService } from '../../../../core/services/user.service';
import { ConfigService } from '../../../../config.service';

@Component({
  selector: 'app-client-dashboard-header',
  imports: [CommonModule, CardModule],
  templateUrl: './client-dashboard-header.component.html',
  styleUrl: './client-dashboard-header.component.scss'
})

//Note:  Config table contains column config_client_onbehalf_roles where we are storing all roles those are logging on behalf () from clientSide )
// so for Gharana we specified only role that is Site_Supervisor
//for Khurana there may comma seperated other roles like Site_Manager,Site_Supervisor etc
export class ClientDashboardHeaderComponent implements OnInit {
  tenantId!: number;
  clientId!: number;

  customer!: any; // Set to any to handle the site array easily
  private customerService = inject(CustomerService);
  private userService = inject(UserService);
  public authServ = inject(AuthService);
  private configService=inject(ConfigService)
  headerData = {
    clientName: '',
    companyName: '',
    siteLocation: '', // Added to track specific site name
    isSupervisor: false, // Added to toggle supervisor UI badges
    contractTier: 'Gold Master Wholesale',
    contractExpiry: new Date(2027, 2, 31),
    lastLoginTimestamp: '',
    lastLoginIp: '192.168.1.104',
    erpStatus: 'Connected'
  };

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.tenantId = this.authServ.getTenantId()!;
    this.clientId = this.authServ.getClientId()!; 
    this.getCustomer().subscribe();
  }
  getCustomer() {
    return this.customerService.getCustomer(this.tenantId, this.clientId).pipe(
      tap((custs: any) => {
        // Parse database payload
        this.customer = JSON.parse(JSON.stringify(custs));
        
        // 1. Establish the basic corporate identity
        this.headerData.companyName = this.customer.customerName;

        // 2. Extract operational roles from Auth State
        const currentUserRole = this.authServ.getUserRole(); // e.g., 'Site_Supervisor' or 'Client_Admin'
        const loggedInUsername = this.authServ.getUserName(); // The login username string

        // Variable to trap the database user record
        let matchedUserEntity: any = null;

        // 2. Fetch the dynamic roles array from the loaded configuration
        const globalConfigData = this.configService.config;
        const allowedRoles = globalConfigData?.config_client_onbehalf_roles || []; // Fallback to empty array if null

       // if (currentUserRole === 'Site_Supervisor' && loggedInUsername) {
       if (loggedInUsername && allowedRoles.includes(currentUserRole!)) {
          // Look for matching site supervisor based on site contact name string mapping
          const matchedSite = this.customer.sites?.find(
            (s: any) => s.siteContactPerson.toLowerCase() === loggedInUsername!.toLowerCase()
          );

          if (matchedSite) {
            this.headerData.clientName = matchedSite.siteContactPerson;
            this.headerData.siteLocation = matchedSite.siteName;
            this.headerData.isSupervisor = true;
          } else {
            this.headerData.clientName = loggedInUsername!;
            this.headerData.isSupervisor = true;
          }

          // Fetch the supervisor's genuine DB login timestamp from the customer.users relation array
          if (this.customer.users && Array.isArray(this.customer.users)) {
            matchedUserEntity = this.customer.users.find(
              (u: any) => u.userName?.toLowerCase() === loggedInUsername!.toLowerCase()
            );
          }

        } else {
          // Standard Client Owner fallback (Atul)
          this.headerData.clientName = this.customer.commercialContactPerson;
          this.headerData.siteLocation = ''; 
          this.headerData.isSupervisor = false;

          // Fetch Client Admin's DB login timestamp from the customer.users relation array
          if (this.customer.users && Array.isArray(this.customer.users)) {
            // Find user where siteId is null/undefined (signifying corporate parent level user)
            // or match directly by username if available
            matchedUserEntity = this.customer.users.find(
              (u: any) => (u.userName?.toLowerCase() === loggedInUsername?.toLowerCase()) || (!u.siteId)
            );
          }
        }

        // 3. Directly assign timestamp from matched database entity or fallback to current execution time
        if (matchedUserEntity && matchedUserEntity.lastLoginAt) {
          this.headerData.lastLoginTimestamp = this.formatLoginDate(matchedUserEntity.lastLoginAt);
        } else {
          // Fallback if relation array is empty/not joined by API or first-time session
          this.headerData.lastLoginTimestamp = this.formatLoginDate(new Date().toISOString());
        }

        this.cdr.detectChanges();
      })
    );
  }


  formatLoginDate = (isoString: string | null): string => {
    if (!isoString) return 'Never';
    if (isoString.includes('First time')) return isoString;

    const cleanedString = isoString.replace(/["']/g, '').trim();
    const date = new Date(cleanedString);
    if (isNaN(date.getTime())) return 'Never';

    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };
}
