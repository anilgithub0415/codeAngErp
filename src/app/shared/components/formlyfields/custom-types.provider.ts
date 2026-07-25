// src/app/formly/custom-types.provider.ts
import { Provider ,inject} from '@angular/core';
import { FORMLY_CONFIG, ConfigOption } from '@ngx-formly/core';
import { CustomdropdownComponent } from './customdropdown/customdropdown.component';
import { FormlyFieldPrimengDropdownComponent } from './formly-field-primeng-dropdown/formly-field-primeng-dropdown.component';
import { RepeatFormlySectionComponent } from './repeat-formly-section/repeat-formly-section.component';

export const FORMly_CUSTOM_TYPES: Provider = {
  provide: FORMLY_CONFIG,
  multi: true,
  useFactory: () => {
    // Grab any existing config that may already be present (skipSelf avoids a circular inject)
    const existing: ConfigOption[] = inject(FORMLY_CONFIG, { skipSelf: true }) ?? [];

    // Push our custom configuration onto the array
    existing.push({
      types: [
        {
          name: 'customdropdown',
          component: CustomdropdownComponent,
          wrappers: ['form-field'],   // optional – you can omit if you don’t need a wrapper
        },
        {
          name: 'p-select',
          component: FormlyFieldPrimengDropdownComponent,
        },
        {
          name: 'repeatFormlySection',
          component: RepeatFormlySectionComponent,
        },
      ],
    });

    return existing;
  },
};