// src/app/feature/customer-mgt/formly-registry.ts
import { FormlyFieldConfig } from '@ngx-formly/core';
import { organisationRow } from './organisation-row.helper';

export const FORMLY_ROW_REGISTRY: Record<string, (index: number) => FormlyFieldConfig> = {
  organisationRow,
  // add more row builders here when you need new repeat sections
};