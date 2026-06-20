// src/app/feature/customer-mgt/formly-registry.ts
import { FormlyFieldConfig } from '@ngx-formly/core';
import { organisationRow } from './organisation-row.helper';

export const FORMLY_ROW_REGISTRY: Record<string, (index: number) => FormlyFieldConfig> = {
  organisationRow,
  // add more row builders here when you need new repeat sections
};

export interface RegistryFieldConfig extends FormlyFieldConfig<any> {
  /** Called by the repeat‑section to create a row config for a given index */
  getRowConfig?: (rowIndex: number) => RegistryFieldConfig;
}

/* -------------------------------------------------------------
 * 3️⃣  (Optional) keep the plain shape for places that only need it.
 * ------------------------------------------------------------- */
export type PlainFormlyFieldConfig = FormlyFieldConfig<any>;