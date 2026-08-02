import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { SelectModule } from 'primeng/select';
import { FormlyFieldPrimengDropdownComponent } from '../../../shared/components/formlyfields/formly-field-primeng-dropdown/formly-field-primeng-dropdown.component';
import { FormlyConfig } from '@ngx-formly/core';
import { DropdownModule } from 'primeng/dropdown';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app_topbarcontextswitcher',schemas:[CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule,SelectModule, DropdownModule],
  templateUrl: './TopbarContextSwither.component.html',
  styleUrl: './TopbarContextSwither.component.scss'
})
export class TopbarContextSwitcher implements OnInit {
  contexts: any[] = [];
  currentTenantId: number = 0;
  isSuperAdminProfile: boolean = false;


  private formlyConfig = inject(FormlyConfig);
  constructor(private authService: AuthService,  private cdr: ChangeDetectorRef) {}

  // ngOnInit(): void {
  //   // 1. Determine if this user is a SuperAdmin
  //   this.isSuperAdminProfile = this.authService.isSuperAdminProfile();

  //   if (this.isSuperAdminProfile) {
  //     // 2. Load the dropdown options
  //     this.contexts = this.authService.getAvailableContexts()!;
      
  //     // 3. Track the active selected value seamlessly
  //     this.authService.activeTenantIdObs.subscribe(id => {
  //       this.currentTenantId = id;
  //     });
  //   }

  // }

// Inside your topbar.component.ts -> ngOnInit()
ngOnInit(): void {
console.log(this.contexts);

      this.formlyConfig.setType({ name: 'primeng-dropdown', component: FormlyFieldPrimengDropdownComponent });
  this.isSuperAdminProfile = this.authService.isSuperAdminProfile();

  if (this.isSuperAdminProfile) {
    const loadedContexts = this.authService.getAvailableContexts() || [];
    
    // Check if the global root context option (tenantId: 0) is already in the list
    const hasGlobalRoot = loadedContexts.some(c => Number(c.tenantId) === 0);
    
    if (!hasGlobalRoot) {
      // Manually unshift the root choice so the dropdown always has at least 2 options
      this.contexts = [
        { tenantId: 0, tenantName: 'Global System (All Tenants)', roleName: 'SuperAdmin' },
        ...loadedContexts
      ];
    } else {
      this.contexts = loadedContexts;
    }
    
    this.authService.activeTenantIdObs.subscribe(id => {
      this.currentTenantId = id;
      this.cdr.detectChanges();
    });

    this.cdr.detectChanges();
  }
}
// Add this method inside your TopbarContextSwitcher class:
onDropdownChange(event: any): void {
  const targetTenantId = Number(event.value);
  console.log('Switching pretend context to tenant ID:', targetTenantId);

  this.authService.switchContext1(targetTenantId).subscribe({
    next: () => {
      window.location.reload();
    },
    error: (err) => {
      console.error('Failed to change pretend context:', err);
    }
  });
}


  onSelectPretendTenant(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const targetTenantId = Number(selectElement.value);

    this.authService.switchContext1(targetTenantId).subscribe({
      next: () => {
        // Reloading the page clears memory states and apply the new token permissions safely
        window.location.reload();
      },
      error: (err) => {
        console.error('Failed to change pretend context:', err);
      }
    });
  }
}

