



// src/app/feature/settings/security-settings/security-settings.component.ts (Part 1)
import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";
import { FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { FormlyConfig, FormlyFieldConfig, FormlyModule } from "@ngx-formly/core";
import { FormlyInputModule } from "@ngx-formly/primeng/input";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { PanelModule } from "primeng/panel";
import { RippleModule } from "primeng/ripple";
import { TableModule } from "primeng/table";
import { ToastModule } from "primeng/toast";
import { MessageService } from "primeng/api";
import { FormOpMode } from "../../../../shared/enums/FormOpMode.enum";
import { FormService } from "../../../../core/services/form.service";
import { SecuritySettingsService } from "../../../../core/services/security-settings.service";
import { AuthService } from "../../../../core/services/auth.service";
import { FormlyCardWrapperComponent } from "../../../../shared/components/formlyfields/formly-card-wrapper/formly-card-wrapper.component";
import { hydrateFormlyConfig } from "../../../../shared/utils/hydrationOfFormlyJson";
import { firstValueFrom, tap } from "rxjs";

@Component({
  selector: 'app-security-settings',
  imports: [
    CommonModule, ToastModule, ReactiveFormsModule, FormsModule,
    FormlyModule, InputTextModule, FormlyInputModule, PanelModule, 
    TableModule, RippleModule, ButtonModule
  ],
  providers: [MessageService],
  templateUrl: './security-settings.component.html',
  styleUrl: './security-settings.component.scss'
})
export class SecuritySettingsComponent implements OnInit {
  tenantId!: number;
  isFormHidden: boolean = false;
  readonly FormOpMode = FormOpMode; 
  currOpMode: FormOpMode = FormOpMode.View; 

  raw: any;
  form = new FormGroup({});
  model = { settingKey: 'global_security_settings', accessTokenLifetime: 3600, refreshTokenLifetime: 604800 };
  fields: FormlyFieldConfig[] = [];
  aForm!: any;

  private formService = inject(FormService);
  private securitySettingsService = inject(SecuritySettingsService);
  private formlyConfig = inject(FormlyConfig);
  private authServ = inject(AuthService);
  private messageService = inject(MessageService);
  private cd = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.tenantId = this.authServ.getTenantId()!;
    this.formlyConfig.setWrapper({ name: 'panel', component: FormlyCardWrapperComponent });

    this.getForm_SecuritySettings();
    this.loadSecuritySettings().catch(err => console.error('Initial load failure:', err));
  }
// src/app/feature/settings/security-settings/security-settings.component.ts (Part 2)
  async loadSecuritySettings(): Promise<any> {
    const observable$ = this.securitySettingsService.getSecuritySettings().pipe(
      tap((settings: any) => {
        if (settings) {
          this.model = { ...settings };
          this.form.patchValue(this.model);
          console.log('Security settings pulled successfully:', settings);
        }
      })
    );
    return firstValueFrom(observable$);
  }

  async saveSecuritySettings() {
    if (!this.form.valid) {
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Access Token and Refresh Token lifetimes are required.' 
      });
      return;
    }

    const submissionPayload = {
      ...this.model,
      ...this.form.value
    } as any;

    try {
      console.log('Routing PUT modification context transaction sequence for settings');
      await firstValueFrom(
        this.securitySettingsService.refreshSettings(submissionPayload)
      );
      this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Security configurations updated successfully' });

      this.currOpMode = FormOpMode.View; 
      await this.loadSecuritySettings();
      this.cd.detectChanges();

    } catch (error: any) {
      console.error('Security settings persistence mutation pipeline failed:', error);
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Error', 
        detail: error.message || 'Failed to update variable lifetime mappings.' 
      });
    }
  }

  onEditClick() {
    this.currOpMode = FormOpMode.Update;
    this.form.patchValue(this.model);
    this.cd.detectChanges();
  }

  CancelFormOp() {
    this.currOpMode = FormOpMode.View;
    this.loadSecuritySettings();
  }

  clearSettings() {
    this.form.reset();
  }

  getForm_SecuritySettings() {
    this.formService.getForm(this.tenantId!, 'security_settings_form').subscribe(aform => {
      this.aForm = aform; 
      this.raw = JSON.parse(this.aForm.FormlyConfig);
    });
       
    this.raw = [
      { "key": "settingKey", "type": "input", "hide": true },
      {
        "wrappers": ["panel"],
        "className": "col-span-12 w-full block mb-0",
        "props": {},
        "fieldGroupClassName": "grid grid-cols-12 gap-4 w-full p-fluid items-end mb-4",
        "fieldGroup": [
          {
            "type": "input",
            "key": "accessTokenLifetime",
            "className": "col-span-12 md:col-span-4",
            "props": {
              "label": "Access Token Lifetime (Seconds)",
              "placeholder": "Enter seconds (e.g. 3600)",
              "required": true,
              "type": "number"
            }
          },
          {
            "type": "input",
            "key": "refreshTokenLifetime",
            "className": "col-span-12 md:col-span-4",
            "props": {
              "label": "Refresh Token Lifetime (Seconds)",
              "placeholder": "Enter seconds (e.g. 604800)",
              "required": true,
              "type": "number"
            }
          }
        ]
      }
    ];

    const hydrated = hydrateFormlyConfig(this.raw);
    this.fields = hydrated; 
    console.log('Security settings formly fields loaded.');
  }
}
