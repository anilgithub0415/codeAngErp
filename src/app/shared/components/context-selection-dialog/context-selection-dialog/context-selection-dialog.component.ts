import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

// Interface for AvailableContext (copy from AuthService or define globally if shared)
interface AvailableContext {
    tenantId: number;displayName:string;
    tenantName: string;tenantType: string;
    roleName: string;
    permissions: string[];
}

@Component({
  selector: 'app-context-selection-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule],
  template: `
      <p-dialog [(visible)]="visible" [modal]="true" header="Select Your Context" [style]="{ width: '50vw' }" [closable]="false" [resizable]="false">
          <div class="p-fluid">
              <p class="mb-4">You have multiple roles or tenant associations. Please select how you'd like to proceed:</p>
              <div *ngIf="contexts && contexts.length > 0; else noContexts">
                  <div *ngFor="let context of contexts" class="mb-3 p-3 border rounded-md flex items-center justify-between">
                      <div>
                          <div class="font-bold text-lg">{{ context.tenantName }}</div>
                          <div class="text-sm text-gray-600">Role: {{ context.roleName }}</div>
                      </div>
                      <p-button label="Select" (click)="onSelectContext(context)" />
                  </div>
              </div>
              <ng-template #noContexts>
                  <div class="p-3 text-center text-red-500">No active contexts found for your account. Please contact support.</div>
              </ng-template>
          </div>
          <ng-template #footer>
              <p-button label="Logout" icon="pi pi-power-off" severity="secondary" (click)="onLogout()" />
          </ng-template>
      </p-dialog>
  `,
  styles: []
})
export class ContextSelectionDialogComponent implements OnInit {
  @Input() visible: boolean = false;
  @Input() contexts: AvailableContext[] | null = null;
  @Output() contextSelected = new EventEmitter<AvailableContext>();
  @Output() logoutInitiated = new EventEmitter<void>();

  ngOnInit(): void {
      // Optional: Add logic to pre-select if only one context
      if (this.contexts && this.contexts.length === 1) {
          this.onSelectContext(this.contexts[0]);
      }
  }

  onSelectContext(context: AvailableContext): void {
      this.contextSelected.emit(context);
      this.visible = false; // Close dialog
  }

  onLogout(): void {
    alert('logoutinitiated............111')
      this.logoutInitiated.emit();
      this.visible = false; // Close dialog
  }
}
