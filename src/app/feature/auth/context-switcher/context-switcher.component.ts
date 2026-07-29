
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { AuthService , AvailableContext} from '../../../core/services/auth.service';
@Component({
  selector: 'app-context-switcher',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownModule],
  templateUrl: './context-switcher.component.html',
  styles: [`
    .context-dropdown-container {
      display: flex;
      align-items: center;
      margin-right: 1rem;
    }
    .icon-style {
      color: #6c757d;
      z-index: 2;
    }
    ::ng-deep .context-dropdown .p-dropdown-label {
      font-weight: 500;
      padding-left: 2.5rem !important;
    }
  `]
})
export class ContextSwitcherComponent implements OnInit {
  contexts: any[] = [];
  selectedContext: AvailableContext | null = null;
  isSuperAdmin: boolean = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // 1. Fetch available contexts from the decrypted token payload
    const rawContexts = this.authService.getAvailableContexts() || [];
    
    // Map a unique display string for the PrimeNG Dropdown labels
    this.contexts = rawContexts.map(c => ({
      ...c,
      displayName: `${c.tenantName} (${c.roleName})`
    }));

    // 2. Simple role checking to see if context switcher should show up
    this.authService.currentUserRole$.subscribe(role => {
      this.isSuperAdmin = role === 'SuperAdmin' || this.contexts.length > 1;
    });

    // 3. Keep the dropdown UI selection in sync with the real active context state
    this.authService.activeContext$.subscribe(currentContext => {
      if (currentContext) {
        this.selectedContext = this.contexts.find(
          c => c.tenantId === currentContext.tenantId && c.roleName === currentContext.roleName
        ) || null;
      }
    });
  }

  onContextChange(chosenContext: AvailableContext): void {
    if (chosenContext) {
      this.authService.switchContext(chosenContext);
    }
  }
}
