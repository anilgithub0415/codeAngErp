import { FormlyFieldConfig } from '@ngx-formly/core';

/**
 * Raw JSON that describes a single organisation row.
 * This file is imported by the helper above and **must** contain the
 * `${index}` placeholder in the `key` property of the row template.
 */
export const organisationRowTemplate: FormlyFieldConfig[] = 
[
  {
  "key": "organisations",
  "type": "p-repeatsectionformly",
  "wrappers": ["panel"],
  "defaultValue": [],
  "props": {
    "label": "Organisations",
    "addText": "Add Organisation"
  },
  "fieldArray": {
    "fieldGroup": [
      {
        "type": "custom",
        "props": {
          "rowTemplate": {
            "key": "organisations[${index}]",
            "fieldGroupClassName": "grid grid-cols-12 gap-4 w-full p-fluid",
            "fieldGroup": [
              /* <-- your row fields (checkbox + inputs) go here --> */

              {                           "type": "input",                           "key": "organisationName",                           "className": "col-span-4 md:col-span-4",                           "props": {                             "label": "Organisation",                             "placeholder": "Enter name",                             "required": true                           }                         },                         {                           "type": "primeng-dropdown",                           "key": "customerCategory",                           "className": "col-span-2 md:col-span-2",                           "props": {                             "label": "Customer Category",                             "optionLabel": "label",                             "optionValue": "value",                             "placeholder": "Select Category",                             "lookupKey": "customerCategoryTypes",                             "required": true,                             "filter": true                           }                         },                         {                           "type": "input",                           "key": "contactPersonName",                           "className": "col-span-4 md:col-span-4",                           "props": { "label": "Contact Person", "placeholder": "Enter name" }                         }, {   "type": "checkbox", "key": "customerDetailsRequired",    "defaultValue":true,                    "className": "col-span-12 md:col-span-12",                           "props": { "label": "customerDetailsRequired", "placeholder": "customerDetailsRequired"}     }, 
          {             "type": "input",               
            "key": "mobileNumber",  "resetOnHide":true, "className": "col-span-2 md:col-span-2",  
               "props": { "label": "Mobile Number", "placeholder": "e.g. +1-555-123-4567"}
               , "expressionProperties": {"hide":"!field.parent.parent.model.customerDetailsRequired"}         }
              /* */

            ]
          }
        }
      }
    ]
  }
}
];
// [
//   // --------------------------------------------------------------
//   // 1️⃣  Checkbox that controls visibility of the other fields
//   // --------------------------------------------------------------
//   {
//     key: 'organisations[${index}].customerDetailsRequired',
//     type: 'checkbox',
//     className: 'col-span-12 md:col-span-12',
//    // defaultValue: true,               // start hidden
//     props: {
//       label: 'Show customer details',
//     },
//   },

//   // --------------------------------------------------------------
//   // 2️⃣  The rest of the row – they will read the flag above
//   // --------------------------------------------------------------
//   {
//     key: 'organisations[${index}].organisationName',
//     type: 'input',
//     className: 'col-span-4 md:col-span-4',
//     props: {
//       label: 'Organisation',
//       placeholder: 'Enter name',
//       required: true,
//     },
//   },
//   {
//     key: 'organisations[${index}].customerCategory',
//     type: 'primeng-dropdown',
//     className: 'col-span-2 md:col-span-2',
//     props: {
//       label: 'Customer Category',
//       optionLabel: 'label',
//       optionValue: 'value',
//       placeholder: 'Select Category',
//       lookupKey: 'customerCategoryTypes',
//       required: true,
//       filter: true,
//     },
//   },
//   {
//     key: 'organisations[${index}].contactPersonName',
//     type: 'input',
//     className: 'col-span-4 md:col-span-4',
//     props: { label: 'Contact Person', placeholder: 'Enter name' },
//   },

//   // --------------------------------------------------------------
//   // 3️⃣  Fields that hide/show based on the checkbox
//   // --------------------------------------------------------------
//   {
//     key: 'organisations[${index}].mobileNumber',
//     type: 'input',
//     className: 'col-span-2 md:col-span-2',
//     props: { label: 'Mobile Number', placeholder: 'e.g. +1-555-123-4567' },
//     expressionProperties: {
//       hide: '!field.parent?.model?.customerDetailsRequired',
//     },
//   },
//   {
//     key: 'organisations[${index}].EmailId',
//     type: 'input',
//     className: 'col-span-3 md:col-span-3',
//     props: { label: 'Email', placeholder: 'example@domain.com', type: 'email' },
//     expressionProperties: {
//       hide: '!field.parent?.model?.customerDetailsRequired',
//     },
//   },
//   {
//     key: 'organisations[${index}].city',
//     type: 'input',
//     className: 'col-span-3 md:col-span-3',
//     props: { label: 'City', placeholder: 'Enter city' },
//     expressionProperties: {
//       hide: '!field.parent?.model?.customerDetailsRequired',
//     },
//   },
//   {
//     key: 'organisations[${index}].Remarks',
//     type: 'input',
//     className: 'col-span-3 md:col-span-3',
//     props: { label: 'Remarks', placeholder: 'Additional notes' },
//     expressionProperties: {
//       hide: '!field.parent?.model?.customerDetailsRequired',
//     },
//   },
//   {
//     key: 'organisations[${index}].creditDays',
//     type: 'input',
//     className: 'col-span-2 md:col-span-2',
//     props: { label: 'Credit Days', placeholder: 'Enter credit days' },
//     expressionProperties: {
//       hide: '!field.parent?.model?.customerDetailsRequired',
//     },
//   },
//   {
//     key: 'organisations[${index}].creditLimit',
//     type: 'input',
//     className: 'col-span-2 md:col-span-2',
//     props: { label: 'Credit Limit', placeholder: 'Enter credit limit' },
//     expressionProperties: {
//       hide: '!field.parent?.model?.customerDetailsRequired',
//     },
//   },

//   // --------------------------------------------------------------
//   // 4️⃣  Remove‑row button (sentinel that will be replaced at runtime)
//   // --------------------------------------------------------------
//   {
//     key: 'organisations[${index}].removeBtn',
//     type: 'button',
//     className: 'col-span-3 md:col-span-3',
//     props: {
//       label: 'Remove',
//       icon: 'pi pi-trash',
//       styleClass: 'p-button-danger',
//       onClick: 'REMOVE_ROW',
//     },
//   },
// ];