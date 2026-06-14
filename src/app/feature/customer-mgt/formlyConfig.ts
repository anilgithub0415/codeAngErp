import { FormlyFieldConfig } from '@ngx-formly/core';

// -------------------------------------------------------------------
// Helper to build a *detail* (organisation) row
// -------------------------------------------------------------------
function organisationRow(index: number): FormlyFieldConfig {
  return {
    key: `organisations[${index}]`,
    fieldGroupClassName: 'p-grid p-fluid',
    fieldGroup: [
      // Organisation name (input)
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

      // Role inside the organisation (select – uses the generic PrimeNG wrapper)
       {
         type: 'primeng-dropdown', //FormlyFieldPrimengDropdownComponent
         key: 'customerCategory',
         className: 'p-col-12 p-md-3',
         props: {
           label: 'Customer Category',
           optionLabel: 'label',   // <-- tell the component to use the “name” property
    optionValue: 'value',
           placeholder: 'Select Category',
           lookupKey: 'customerCategoryTypes', // will be turned into an Observable<Option[]> by a wrapper
           required: true,filter:true,
         },
       },
       {
        type:'input',
        key:'contactPersonName',
        props: { label: 'PersonName'  }
       },
        {
        type:'input',
        key:'mobileNumber',
        props: { label: 'mobileNumber'  }
       },
        {
        type:'input',
        key:'EmailId',
        props: { label: 'EmailId'  }
       },
        {
        type:'input',
        key:'city',
        props: { label: 'city'  }
       },{
        type:'input',
        key:'Remarks',
        props: { label: 'Remarks'  }
       },



     // Remove button
      {
        type: 'button',
        className: 'p-col-12 p-md-2 p-mt-4',
        props: {
          label: 'aaaaaaaaaaaaaaaaa remove',
          icon: 'pi pi-trash',
          styleClass: 'p-button-danger',
          onClick: ($event: any, field: any) => {
            // `field.parent` is the repeatable container, we splice the array
            const arr = field.parent.model.organisations as any[];
            arr.splice(index, 1);
          },
        },
      },
    ],
  };
}

// -------------------------------------------------------------------
// Master‑detail Formly config
// -------------------------------------------------------------------
export const CUSTOMER_FORMLY_CONFIG: FormlyFieldConfig[] = [
  // ── Customer (master) fields ───────────────────────────────────────
  {
    key: 'customerName',
    type: 'input',
    props: {
      label: 'Customer Name',
      placeholder: 'Enter customer name',
      required: true,
    },
  },
  

  // ── Organisations (detail) – repeatable array -----------------------
  {
    key: 'organisations',
    type: 'p-repeatsectionformly',//repeatFormlySection
    wrappers: ['panel'],
    defaultValue: [],
    props: {
      label: 'Organisations',
      addText: 'Add Organisation',
    },
    fieldArray: {
      // The `fieldArray` is rendered once per array element.
      // We delegate the actual row layout to the helper above.
      fieldGroup: [
        {
          // This placeholder will be replaced at runtime by the
          // `repeat` wrapper – see the `repeat` custom type definition
          // (you can find a typical implementation in the Formly docs).
          // The wrapper will call `organisationRow(index)` for each row.
          type: 'custom',
          props: { //templateOptions
            // The wrapper receives the row index via `$index`.
            // We expose a tiny helper that returns the row config.
            getRowConfig: (index: number) => organisationRow(index),
          },
        },
      ],
    },
  },

  // ── Submit button ---------------------------------------------------
  {
    type: 'button',
    props: {
      text: 'Save Customer',
      type: 'submit',
      styleClass: 'p-button-success',
    },
  },
];