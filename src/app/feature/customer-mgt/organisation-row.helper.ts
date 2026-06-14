// ---------------------------------------------------------------
// src/app/feature/customer-mgt/organisation-row.helper.ts
// ---------------------------------------------------------------

import { FormlyFieldConfig } from '@ngx-formly/core';

/**
 * Builds the Formly configuration for a single **organisation** row
 * inside the repeat‑section `organisations`.
 *
 * The `index` argument is supplied by Formly when it renders each row
 * (0‑based).  It is used only to build a unique key for the row
 * (`organisations[${index}]`), so the model can store an array of objects.
 *
 * All fields inside the row are standard Formly fields – the only
 * “custom” one is the `primeng-dropdown` that you already registered
 * as a Formly type (`name: 'primeng-dropdown'`).
 */
export function organisationRow(index: number): FormlyFieldConfig {
  return {
    // The key points to the *array element* that Formly creates for us.
    key: `organisations[${index}]`,
    fieldGroupClassName: 'p-grid p-fluid',
    fieldGroup: [
      // -----------------------------------------------------------
      // Organisation name (plain input)
      // -----------------------------------------------------------
      {
        type: 'input',
        key: 'organisationName',
        className: 'p-col-12 p-md-5',
        props: {
          label: 'Organisation',
          placeholder: 'Enter name',
          required: true,
        },
      },

      // -----------------------------------------------------------
      // Customer Category – custom PrimeNG dropdown wrapper
      // -----------------------------------------------------------
      {
        type: 'primeng-dropdown',          // <-- matches the type you registered
        key: 'customerCategory',
        className: 'p-col-12 p-md-3',
        props: {
          label: 'Customer Category',
          // The dropdown component will read this value and use it as the
          // property name that holds the display text in each option.
          // Keep it as 'label' if the lookup service returns objects
          // like { label: 'Retail', value: 1 }.
          optionLabel: 'label',
          optionValue: 'value',
          placeholder: 'Select Category',
          lookupKey: 'customerCategoryTypes', // the key that the service will use
          required: true,
          filter: true,
        },
      },

      // -----------------------------------------------------------
      // Contact person name (plain input)
      // -----------------------------------------------------------
      {
        type: 'input',
        key: 'contactPersonName',
        className: 'p-col-12 p-md-2',
        props: {
          label: 'Contact Person',
          placeholder: 'Enter name',
        },
      },

      // -----------------------------------------------------------
      // Mobile number (plain input)
      // -----------------------------------------------------------
      {
        type: 'input',
        key: 'mobileNumber',
        className: 'p-col-12 p-md-2',
        props: {
          label: 'Mobile Number',
          placeholder: 'e.g. +1‑555‑123‑4567',
        },
      },

      // -----------------------------------------------------------
      // Email address (plain input)
      // -----------------------------------------------------------
      {
        type: 'input',
        key: 'EmailId',
        className: 'p-col-12 p-md-2',
        props: {
          label: 'Email',
          placeholder: 'example@domain.com',
          type: 'email',
        },
      },

      // -----------------------------------------------------------
      // City (plain input)
      // -----------------------------------------------------------
      {
        type: 'input',
        key: 'city',
        className: 'p-col-12 p-md-2',
        props: {
          label: 'City',
          placeholder: 'Enter city',
        },
      },

      // -----------------------------------------------------------
      // Remarks (plain input – could be textarea if you prefer)
      // -----------------------------------------------------------
      {
        type: 'input',
        key: 'Remarks',
        className: 'p-col-12 p-md-12',
        props: {
          label: 'Remarks',
          placeholder: 'Additional notes',
        },
      },

      // -----------------------------------------------------------
      // Remove button – this is the same code you already had in the
      // original `organisationRow` helper.
      // -----------------------------------------------------------
      {
        type: 'button',
        className: 'p-col-12 p-md-2 p-mt-4',
        props: {
          label: 'Remove',
          icon: 'pi pi-trash',
          styleClass: 'p-button-danger',
          // The `index` variable is captured from the outer scope.
          onClick: ($event: any, field: any) => {
            // `field.parent` points to the repeat container.
            const arr = field.parent.model.organisations as any[];
            arr.splice(index, 1);
          },
        },
      },
    ],
  };
}