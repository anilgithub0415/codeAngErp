
// import { Component, OnInit } from '@angular/core';
// import { AuthService } from '../../../core/services/auth.service';

// @Component({
//   selector: 'app-topbar',
//   templateUrl: './topbar.component.html',
//   styleUrls: ['./topbar.component.scss']
// })
// export class TopbarComponent implements OnInit {
//   contexts: any[] = [];
//   currentTenantId: number = 0;
//   isSuperAdminProfile: boolean = false;

//   constructor(private authService: AuthService) {}

//   ngOnInit(): void {
//     // 1. Determine if this user is a SuperAdmin
//     this.isSuperAdminProfile = this.authService.isSuperAdminProfile();

//     if (this.isSuperAdminProfile) {
//       // 2. Load the dropdown options
//       this.contexts = this.authService.getAvailableContexts()!;
      
//       // 3. Track the active selected value seamlessly
//       this.authService.activeTenantIdObs.subscribe(id => {
//         this.currentTenantId = id;
//       });
//     }
//   }

//   onSelectPretendTenant(event: Event): void {
//     const selectElement = event.target as HTMLSelectElement;
//     const targetTenantId = Number(selectElement.value);

//     this.authService.switchContext1(targetTenantId).subscribe({
//       next: () => {
//         // Reloading the page clears memory states and apply the new token permissions safely
//         window.location.reload();
//       },
//       error: (err) => {
//         console.error('Failed to change pretend context:', err);
//       }
//     });
//   }
// }
