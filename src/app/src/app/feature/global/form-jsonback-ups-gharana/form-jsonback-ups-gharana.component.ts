import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ButtonTabsComponent, TabDirective } from '../../../../../shared/components/button-tabs/button-tabs.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-jsonback-ups-gharana',
  imports: [CommonModule,ButtonTabsComponent,TabDirective],
  templateUrl: './form-jsonback-ups-gharana.component.html',
  styleUrl: './form-jsonback-ups-gharana.component.scss'
})
export class FormJSONBackUpsGharanaComponent implements OnInit {

  myTabConfig:any;
product_form:any;
customer_form:any;
purchase_form:any;
sales_form:any;
quotation_form:any;
clientpo_form:any;
clientrfq_form:any;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(){  
     this.myTabConfig = [
     { label: 'Customer', id: 'Customer' },   { label: 'Purchase', id: 'Purchase' },    { label: 'Sales', id: 'Sales' },   
     { label: 'Product', id: 'Product' },   { label: 'Quotation', id: 'Quotation' },    { label: 'ClientPO', id: 'ClientPO' },   
     { label: 'ClientRFQ', id: 'ClientRFQ' },   
     ];

     this.product_form=[
  { "key": "id", "type": "input", "hide": true },
  { "key": "createdByUserId", "type": "input", "hide": true },
  { "key": "tenantId", "type": "input", "hide": true },
  {
    "wrappers": ["panel"],
    "className": "col-span-12 w-full block mb-0",
    "fieldGroupClassName": "grid grid-cols-12 gap-4 w-full p-fluid items-end mb-4",
    "fieldGroup": [
      {
        "type": "primeng-dropdown",
        "key": "categoryId",
        "className": "col-span-6 md:col-span-4",
        "props": { 
          "label": "Product Category", 
          "placeholder": "Select Category", "lookupKey":"productCetegoryTypes",
          "options": [], 
          "required": true, 
          "filter": true 
        },
        "expressions": {
          "model.hsnId": "const activeCatId = field.model?.categoryId; if (activeCatId && field.formControl?.dirty) { const match = field.props.options.find(o => o.value === activeCatId); if (match && match.defaultHsnId) return match.defaultHsnId; } return field.model?.hsnId;"
        }
      },
      {
        "type": "primeng-dropdown",
        "key": "hsnId",
        "className": "col-span-6 md:col-span-4",
        "props": { 
          "label": "HSN Code", 
          "valueProp": "value", 
          "labelProp": "label", 
          "optionLabel": "label", 
          "optionValue": "value", 
          "placeholder": "Select HSN", 
          "lookupKey": "hsnTypes", 
          "required": true, 
          "filter": true, 
          "options": [] 
        }
      },
      { 
        "key": "prodName", 
        "type": "input", 
        "className": "col-span-12 md:col-span-4", 
        "wrappers": ["typeahead-wrapper"], 
        "props": { 
          "label": "Product Name", 
          "placeholder": "Enter product name", 
          "required": true 
        } 
      },
      { 
        "type": "input", 
        "key": "description", 
        "className": "col-span-12 md:col-span-4", 
        "props": { 
          "label": "Description", 
          "placeholder": "Enter description" 
        } 
      },
      { 
        "type": "input", 
        "key": "sku", 
        "className": "col-span-12 md:col-span-2", 
        "props": { 
          "label": "SKU", 
          "placeholder": "Enter sku", 
          "pattern": "^(.{6,}|.*-base)$" 
        } 
      },
      { 
        "type": "input", 
        "key": "basePrice", 
        "className": "col-span-6 md:col-span-2", 
        "props": { 
          "label": "Base Price", 
          "placeholder": "Enter baseprice", 
          "type": "number" 
        } 
      },
      { 
        "type": "input", 
        "key": "customAttributes.tier_prices.B2C_price", 
        "className": "col-span-6 md:col-span-2", 
        "props": { 
          "label": "B2C Price", 
          "placeholder": "0.00", 
          "type": "number" 
        } 
      },
      { 
        "type": "input", 
        "key": "customAttributes.tier_prices.B2B_price", 
        "className": "col-span-6 md:col-span-2", 
        "props": { 
          "label": "B2B Price", 
          "placeholder": "0.00", 
          "type": "number" 
        } 
      },
      { 
        "type": "input", 
        "key": "customAttributes.tier_prices.B2BC_price", 
        "className": "col-span-6 md:col-span-2", 
        "props": { 
          "label": "B2BC Price", 
          "placeholder": "0.00", 
          "type": "number" 
        } 
      },
      { 
        "type": "input", 
        "key": "customAttributes.tier_prices.Dealer_price", 
        "className": "col-span-6 md:col-span-2", 
        "props": { 
          "label": "Dealer Price", 
          "placeholder": "0.00", 
          "type": "number" 
        } 
      },
      { 
        "type": "input", 
        "key": "customAttributes.tier_prices.Wholesaler_price", 
        "className": "col-span-6 md:col-span-2", 
        "props": { 
          "label": "Wholesaler Price", 
          "placeholder": "0.00", 
          "type": "number" 
        } 
      },
      { 
        "type": "input", 
        "key": "currentstock", 
        "className": "col-span-6 md:col-span-2", 
        "props": { 
          "label": "Stock", 
          "placeholder": "Enter currentstock", 
          "type": "number" 
        } 
      },
      { 
        "type": "input", 
        "key": "reorderLevel", 
        "className": "col-span-6 md:col-span-2", 
        "props": { 
          "label": "Reorder Level", 
          "placeholder": "Enter reorderLevel", 
          "type": "number" 
        } 
      },
      { 
        "type": "checkbox", 
        "key": "isOEMProduct", 
        "defaultValue": false, 
        "className": "col-span-3 md:col-span-1", 
        "props": { "label": "Is OEM" } 
      },
      { 
        "type": "checkbox", 
        "key": "isVariablePrice", 
        "defaultValue": false, 
        "className": "col-span-3 md:col-span-2", 
        "props": { "label": "Variable Price" } 
      },
      { 
        "type": "checkbox", 
        "key": "isBulkPacking", 
        "defaultValue": false, 
        "className": "col-span-3 md:col-span-2", 
        "props": { "label": "Is BulkPack" } 
      },
      { 
        "type": "checkbox", 
        "key": "isActive", 
        "defaultValue": true, 
        "className": "col-span-3 md:col-span-1", 
        "props": { "label": "isActive" } 
          },
      { 
        "type": "primeng-dropdown", 
        "key": "defaultPurchaseUom", 
        "className": "col-span-12 md:col-span-4", 
        "props": { 
          "label": "Purchase Unit:", 
          "optionLabel": "label", 
          "optionValue": "value", 
          "placeholder": "Select UOM", 
          "filter": true, 
          "options": [] 
        }, 
        "expressions": { "hide": "field.options.opMode !== 'Update'" } 
      },
      { 
        "type": "primeng-dropdown", 
        "key": "defaultSalesUom", 
        "className": "col-span-12 md:col-span-4", 
        "props": { 
          "label": "Sales Unit:", 
          "optionLabel": "label", 
          "optionValue": "value", 
          "placeholder": "Select UOM", 
          "filter": true, 
          "options": [] 
        }, 
        "expressions": { "hide": "field.options.opMode !== 'Update'" } 
      },
      { 
        "type": "primeng-dropdown", 
        "key": "baseUom", 
        "className": "col-span-12 md:col-span-4", 
        "props": { 
          "label": "Base Unit:", 
          "optionLabel": "label", 
          "optionValue": "value", 
          "placeholder": "Select UOM", 
          "filter": true, 
          "options": [] 
        }, 
        "expressions": { "hide": "field.options.opMode !== 'Update'" } 
      }
    ]
  }
];
      this.customer_form=[
      { "key": "id", "type": "input", "hide": true },
      { "key": "createdByUserId", "type": "input", "hide": true },
      { "key": "tenantId", "type": "input", "hide": true },
      {
        "type": "input",
        "hide": true,
        "key": "clientStatus",
        "props": { "label": "clientStatus", "placeholder": "Enter clientStatus", "required": true }
      },
      {
        "wrappers": ["panel"],
        "className": "col-span-24 w-full block mb-0",
        "props": {},
        "fieldGroupClassName": "grid grid-cols-24 gap-4 w-full p-fluid items-end mb-4",
        "fieldGroup": [
          {
            "key": "customerName",
            "type": "input",
            "className": "col-span-7 md:col-span-6",
            "props": { "label": "Client Name", "placeholder": "Enter client name", "required": true }
          },
          {
            "type": "primeng-dropdown",
            "key": "customerCategoryId",
            "className": "col-span-6 md:col-span-4",
            "props": {
              "label": "Client Type", "valueProp": "value", "labelProp": "label",
              "optionLabel": "label", "optionValue": "value", "placeholder": "Select Category",
              "lookupKey": "customerCategoryTypes", "required": true, "filter": true
            }
          },
          {
            "type": "input",
            "key": "commercialContactPerson",
            "resetOnHide": true,
            "className": "col-span-6 md:col-span-4",
            "props": { "label": "commercialContactPerson", "description": "aaaa", "placeholder": "Enter commercialContactPerson", "searchable": true },
            "validation": { "messages": { "required": "This field cannot be left blank." } },
            "modelOptions": { "updateOn": "blur" }
          },
          
          

          {
            "type": "input",
            "key": "commercialContactPhone",
            "resetOnHide": true,
            "className": "col-span-6 md:col-span-4",
            "props": { "label": "commercialContactPhone", "description": "aaaa", "placeholder": "e.g. +1-555-123-4567", "searchable": true },
            "validation": { "messages": { "required": "This field cannot be left blank." } },
            "modelOptions": { "updateOn": "blur" }
          },
          {
            "type": "primeng-dropdown",
            "key": "leadSource",
            "className": "col-span-5 md:col-span-6",
            "props": { "label": "Source", "optionLabel": "label", "optionValue": "value", "placeholder": "Select LeadSource", "lookupKey": "leadSourceTypes", "filter": true }
          },
          {
            "type": "input",
            "key": "EmailId",
            "className": "col-span-6 md:col-span-4",
            "props": { "label": "Email", "placeholder": "example@domain.com", "type": "email", "pattern": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$", "searchable": true }
          },
          {
            "type": "primeng-dropdown",
            "key": "city",
            "className": "col-span-6 md:col-span-4",
            "props": { "label": "City", "valueProp": "value", "labelProp": "label", "optionLabel": "label", "optionValue": "value", "placeholder": "Select City", "lookupKey": "cityTypes", "filter": true }
          },
          { "key": "creditDays", "type": "input", "className": "col-span-6 md:col-span-2", "props": { "label": "CreditDays" } },
          { "key": "creditLimit", "type": "input", "className": "col-span-6 md:col-span-2", "props": { "label": "CreditLimit" } }
        ]
      },
      {
        "key": "sites",
        "type": "p-repeatsectionformly",
        "wrappers": ["panel"],
        "defaultValue": [],
        "props": { "label": "", "addText": "Add site" },
        "fieldArray": {
          "fieldGroupClassName": "grid grid-cols-24 gap-4 w-full p-fluid items-end",
          "fieldGroup": [
            { "key": "id", "type": "input", "hide": true },
            { "key": "tenantId", "type": "input", "hide": true },
            { "key": "clientId", "type": "input", "hide": true },
            { "type": "input", "key": "siteName", "className": "col-span-12 md:col-span-10", "props": { "placeholder": "Enter name" }, "expressions": { "props.label": "field.parent.index === 0 ? 'Site name' : ''" } },
            { "type": "input", "key": "siteContactPerson", "className": "col-span-12 md:col-span-10", "props": { "placeholder": "Enter Contact Person" }, "expressions": { "props.label": "field.parent.index === 0 ? 'Site Contact Person' : ''" } }
          ]
        }
      },
      { "type": "button", "className": "col-span-12 md:col-span-3 mt-4", "props": { "text": "Save Customer", "type": "submit", "styleClass": "p-button-success" } }
    ];

       this.purchase_form=[
    { "key": "id", "type": "input", "hide": true },
    { "key": "createdByUserId", "type": "input", "hide": true },
    { "key": "tenantId", "type": "input", "hide": true },
    {
      "wrappers": ["panel"],
      "className": "col-span-24 w-full block mb-0",
      "props": {},
      "fieldGroupClassName": "grid grid-cols-24 gap-4 w-full p-fluid items-end mb-4",
      "fieldGroup": [
        {
          "type": "input",
          "key": "poNumber",
          "className": "col-span-6 md:col-span-4",
          "props": { "label": "db_Purchase Order#", "readonly": true, "placeholder": "PO#" }
        },
        {
          "type": "primeng-dropdown",
          "key": "vendorId",
          "className": "col-span-12 md:col-span-9",
          "props": {
            "label": "Vendor:", "optionLabel": "label", "optionValue": "value",
            "placeholder": "Select Vendor", "lookupKey": "vendorTypes", "filter": true, "required": true
          }
        },
        {
          "type": "datepicker",
          "key": "orderDate",
          "className": "col-span-12 md:col-span-6",
          "props": { "label": "Order Date", "dateFormat": "dd-mm-yy", "numberOfMonths": 1, "selectionMode": "single" }
        }
      ]
    },
    {
      "key": "items",
      "type": "p-repeatsectionformly",
      "wrappers": ["panel"],
      "defaultValue": [],
      "props": { "label": "", "addText": "Add Item Line", "rowDefaults": { "quantity": "1" } },
      "fieldArray": {
        "fieldGroupClassName": "grid grid-cols-24 gap-4 w-full p-fluid items-end",
        "fieldGroup": [
          { "key": "id", "type": "input", "hide": true },
          {
            "type": "primeng-dropdown",
            "key": "productId",
            "className": "col-span-6 md:col-span-7",
            "props": {
              "label": "Item", "optionLabel": "label", "optionValue": "value",
              "placeholder": "Select Item", "lookupKey": "productTypes", "required": true, "filter": true
            },
            "expressions": { "props.label": "field.parent.index === 0 ? 'Item' : ''" }
          },
          {
            "type": "input",
            "key": "quantity",
            "className": "col-span-3 md:col-span-2",
            "props": { "placeholder": "Qty", "required": true },
            "expressions": { "props.label": "field.parent.index === 0 ? 'Quantity' : ''" }
          },
          {
            "type": "primeng-dropdown",
            "key": "purchaseUom",
            "className": "col-span-12 md:col-span-6",
            "props": { "optionLabel": "label", "optionValue": "value", "placeholder": "Select UOM", "filter": true, "required": true, "options": [] },
            "expressions": { "props.label": "field.parent.index === 0 ? 'Purchase UOM:' : ''" }
          },
          {
            "type": "input",
            "key": "finalPrice",
            "className": "col-span-3 md:col-span-3",
            "props": { "placeholder": "Price", "required": true },
            "expressions": { "props.label": "field.parent.index === 0 ? 'Price' : ''" }
          }
        ]
      }
    }
  ];
        this.sales_form=[
      { "key": "id", "type": "input", "hide": true },
      { "key": "createdByUserId", "type": "input", "hide": true },
      { "key": "tenantId", "type": "input", "hide": true },
      {
        "wrappers": ["panel"],
        "fieldGroupClassName": "grid grid-cols-24 gap-4 w-full p-fluid items-end mb-4",
        "fieldGroup": [
          { "type": "input", "key": "soNumber", "className": "col-span-12 md:col-span-4", "props": { "label": "database_Sales Order#", "readonly": true, "placeholder": "SO#" } },
          { "type": "primeng-dropdown", "key": "clientId", "className": "col-span-12 md:col-span-10", "props": { "label": "Lead / Customer", "valueProp": "value", "styleClass": "w-full", "labelProp": "label", "optionLabel": "label", "optionValue": "value", "placeholder": "Select Customer", "lookupKey": "customerTypes", "required": true, "filter": true } },
          { "type": "input", "key": "status", "className": "col-span-12 md:col-span-4", "props": { "label": "Status", "placeholder": "Status", "required": true } }
        ]
      },
      {
        "key": "items",
        "type": "p-repeatsectionformly",
        "wrappers": ["panel"],
        "defaultValue": [],
        "props": { "label": "", "addText": "Add Line Item", "rowDefaults": { "quantity": "1" } },
        "fieldArray": {
          "fieldGroupClassName": "grid grid-cols-24 gap-4 w-full p-fluid items-end",
          "fieldGroup": [
            { "key": "id", "type": "input", "hide": true },
            { "type": "primeng-dropdown", "key": "productId", "className": "col-span-24 md:col-span-6", "props": { "optionLabel": "label", "optionValue": "value", "placeholder": "Select Item", "lookupKey": "productTypes", "required": true, "filter": true }, "expressions": { "props.label": "field.parent.index === 0 ? 'Item' : ''" }, "hooks": { "onInit": "onProductDropdownChange" } },
            { "type": "input", "key": "quantity", "className": "col-span-24 md:col-span-3", "props": { "type": "number", "placeholder": "Qty", "required": true }, "expressions": { "props.label": "field.parent.index === 0 ? 'Quantity' : ''" } },
            { "type": "primeng-dropdown", "key": "salesUom", "className": "col-span-24 md:col-span-6", "props": { "optionLabel": "label", "optionValue": "value", "placeholder": "Select UOM", "filter": true, "required": true, "options": [] }, "expressions": { "props.label": "field.parent.index === 0 ? 'Sales Unit' : ''" } },
            { "type": "input", "key": "finalPrice", "className": "col-span-24 md:col-span-3", "props": { "type": "number", "placeholder": "Price", "required": true }, "expressions": { "props.label": "field.parent.index === 0 ? 'Final Price' : ''" } }
          ]
        }
      },
      { "type": "button", "className": "col-span-24 md:col-span-4 mt-4", "props": { "text": "Save Sales Order", "type": "submit", "styleClass": "p-button-success" } }
    ];

        this.quotation_form=[
  {
    "key": "id",
    "type": "input",
    "hide": true
  },
  {
    "key": "tenantId",
    "type": "input",
    "hide": true
  },
  {
    "key": "createdByUserId",
    "type": "input",
    "hide": true
  },
  {
    "key": "quoteNumber",
    "type": "input",
    "hide": true
  },
  {
    "key": "version",
    "type": "input",
    "hide": true
  },
  {
    "wrappers": [
      "panel"
    ],
    "className": "col-span-24 w-full block mb-2",
    "fieldGroupClassName": "grid grid-cols-24 gap-4 w-full p-fluid items-end mb-4",
    "fieldGroup": [
      {
        "type": "primeng-dropdown",
        "key": "clientId",
        "className": "col-span-24 md:col-span-6",
        "props": {
          "label": "db_Wholesale Client / Customer from static json",
          "valueProp": "value",
          "styleClass": "w-full",
          "labelProp": "label",
          "optionLabel": "label",
          "optionValue": "value",
          "placeholder": "Select Customer",
          "lookupKey": "customerTypes",
          "required": true,
          "filter": true
        }
      },
      {
        "type": "input",
        "key": "clientName",
        "className": "col-span-24 md:col-span-6",
        "props": {
          "label": "Client / Trade Name",
          "placeholder": "e.g., Ceramic Enterprises",
          "required": true
        }
      },
      {
        "type": "input",
        "key": "clientCategory",
        "className": "col-span-12 md:col-span-6",
        "props": {
          "label": "Client Category",
          "placeholder": "e.g., Distributor, Retailer"
        }
      },
      {
        "type": "input",
        "key": "status",
        "className": "col-span-12 md:col-span-6",
        "props": {
          "label": "Quotation Status",
          "disabled": true
        }
      },
      {
        "type": "input",
        "key": "contactPerson",
        "className": "col-span-12 md:col-span-6",
        "props": {
          "label": "Contact Person Name",
          "placeholder": "e.g., John Doe"
        }
      },
      {
        "type": "input",
        "key": "deliveryLocation",
        "className": "col-span-24 md:col-span-12",
        "props": {
          "label": "Site Delivery / Logistics Location",
          "placeholder": "Enter complete logistics delivery path destination..."
        }
      },
      {
        "type": "input",
        "key": "remarksNotes",
        "className": "col-span-24 md:col-span-12",
        "props": {
          "label": "Internal Notes",
          "placeholder": "Add quote structural tracking notes..."
        }
      }
    ]
  },
  {
    "key": "items",
    "type": "p-repeatsectionformly",
    "wrappers": [
      "panel"
    ],
    "defaultValue": [],
    "props": {
      "label": "Itemized Material Estimate Lines",
      "addText": "Add Material Estimate Line",
      "rowDefaults": {
        "quantity": 1,
        "unit": "PCS",
        "price": 0,
        "targetPrice": 0,
        "discount": 0,
        "gstPercentage": 18,
        "totalItemAmount": 0
      }
    },
    "fieldArray": {
      "fieldGroupClassName": "grid grid-cols-24 gap-4 w-full p-fluid items-end",
      "fieldGroup": [
        {
          "key": "id",
          "type": "input",
          "hide": true
        },
        {
          "key": "productVariantId",
          "type": "input",
          "hide": true
        },
        {
          "key": "prodName",
          "type": "input",
          "hide": true
        },
        {
          "key": "sku",
          "type": "input",
          "hide": true
        },
        {
          "key": "appliedLineDiscountId",
          "type": "input",
          "hide": true
        },
        {
          "type": "primeng-dropdown",
          "key": "productId",
          "className": "col-span-24 md:col-span-5",
          "props": {
            "optionLabel": "label",
            "optionValue": "value",
            "placeholder": "Select Product Item",
            "lookupKey": "productTypes",
            "required": true,
            "filter": true
          },
          "expressions": {
            "props.label": "field.parent.index === 0 ? \"Product Detail Spec / SKU\" : \"\""
          },
          "hooks": {
            "onInit": "onProductDropdownChange"
          }
        },
        {
          "type": "input",
          "key": "description",
          "className": "col-span-24 md:col-span-4",
          "props": {
            "placeholder": "Item Description / Notes"
          },
          "expressions": {
            "props.label": "field.parent.index === 0 ? \"Description\" : \"\""
          }
        },
        {
          "type": "input",
          "key": "unit",
          "className": "col-span-12 md:col-span-2",
          "props": {
            "placeholder": "UOM",
            "required": true
          },
          "expressions": {
            "props.label": "field.parent.index === 0 ? \"UOM\" : \"\""
          }
        },
        {
          "type": "input",
          "key": "quantity",
          "className": "col-span-12 md:col-span-2",
          "props": {
            "type": "number",
            "placeholder": "Qty",
            "required": true,
            "min": 0
          },
          "expressions": {
            "props.label": "field.parent.index === 0 ? \"Quantity\" : \"\""
          }
        },
        {
          "type": "input",
          "key": "finalPrice",
          "className": "col-span-12 md:col-span-2",
          "props": {
            "type": "number",
            "placeholder": "Rate",
            "required": true,
            "min": 0
          },
          "expressions": {
            "props.label": "field.parent.index === 0 ? \"Base Price\" : \"\""
          }
        },
        {
          "type": "input",
          "key": "targetPrice",
          "className": "col-span-12 md:col-span-2",
          "props": {
            "type": "number",
            "placeholder": "Target",
            "min": 0
          },
          "expressions": {
            "props.label": "field.parent.index === 0 ? \"Target Price (?)\" : \"\""
          }
        },
        {
          "type": "input",
          "key": "discount",
          "className": "col-span-12 md:col-span-2",
          "props": {
            "type": "number",
            "placeholder": "Dsc",
            "required": true,
            "min": 0,
            "readonly": true
          },
          "expressions": {
            "props.label": "field.parent.index === 0 ? \"Discount (?)\" : \"\""
          }
        },
        {
          "type": "input",
          "key": "gstPercentage",
          "className": "col-span-12 md:col-span-2",
          "props": {
            "type": "number",
            "placeholder": "GST",
            "required": true,
            "min": 0
          },
          "expressions": {
            "props.label": "field.parent.index === 0 ? \"GST %\" : \"\""
          }
        },
        {
          "type": "input",
          "key": "totalItemAmount",
          "className": "col-span-12 md:col-span-3",
          "props": {
            "type": "number",
            "placeholder": "Total",
            "readonly": true
          },
          "expressions": {
            "props.label": "field.parent.index === 0 ? \"Line Net\" : \"\""
          }
        }
      ]
    }
  }
];
        
        // [
        //           {
        //             "key": "id",
        //             "type": "input",
        //             "hide": true
        //           },
        //           {
        //             "key": "tenantId",
        //             "type": "input",
        //             "hide": true
        //           },
        //           {
        //             "key": "createdByUserId",
        //             "type": "input",
        //             "hide": true
        //           },
        //           {
        //             "key": "quoteNumber",
        //             "type": "input",
        //             "hide": true
        //           },
        //           {
        //             "key": "version",
        //             "type": "input",
        //             "hide": true
        //           },
        //           {
        //             "wrappers": [
        //               "panel"
        //             ],
        //             "className": "col-span-24 w-full block mb-2",
        //             "fieldGroupClassName": "grid grid-cols-24 gap-4 w-full p-fluid items-end mb-4",
        //             "fieldGroup": [
        //               {
        //                 "type": "primeng-dropdown",
        //                 "key": "clientId",
        //                 "className": "col-span-24 md:col-span-6",
        //                 "props": {
        //                   "label": "db_Wholesale Client / Customer from static json",
        //                   "valueProp": "value",
        //                   "styleClass": "w-full",
        //                   "labelProp": "label",
        //                   "optionLabel": "label",
        //                   "optionValue": "value",
        //                   "placeholder": "Select Customer",
        //                   "lookupKey": "customerTypes",
        //                   "required": true,
        //                   "filter": true
        //                 }
        //               },
        //               {
        //                 "type": "input",
        //                 "key": "clientName",
        //                 "className": "col-span-24 md:col-span-6",
        //                 "props": {
        //                   "label": "Client / Trade Name",
        //                   "placeholder": "e.g., Ceramic Enterprises",
        //                   "required": true
        //                 }
        //               },
        //               {
        //                 "type": "input",
        //                 "key": "clientCategory",
        //                 "className": "col-span-12 md:col-span-6",
        //                 "props": {
        //                   "label": "Client Category",
        //                   "placeholder": "e.g., Distributor, Retailer"
        //                 }
        //               },
        //               {
        //                 "type": "input",
        //                 "key": "status",
        //                 "className": "col-span-12 md:col-span-6",
        //                 "props": {
        //                   "label": "Quotation Status",
        //                   "disabled": true
        //                 }
        //               },
        //               {
        //                 "type": "input",
        //                 "key": "contactPerson",
        //                 "className": "col-span-12 md:col-span-6",
        //                 "props": {
        //                   "label": "Contact Person Name",
        //                   "placeholder": "e.g., John Doe"
        //                 }
        //               },
        //               {
        //                 "type": "input",
        //                 "key": "deliveryLocation",
        //                 "className": "col-span-24 md:col-span-12",
        //                 "props": {
        //                   "label": "Site Delivery / Logistics Location",
        //                   "placeholder": "Enter complete logistics delivery path destination..."
        //                 }
        //               },
        //               {
        //                 "type": "input",
        //                 "key": "remarksNotes",
        //                 "className": "col-span-24 md:col-span-12",
        //                 "props": {
        //                   "label": "Internal Notes",
        //                   "placeholder": "Add quote structural tracking notes..."
        //                 }
        //               }
        //             ]
        //           },
        //           {
        //             "key": "items",
        //             "type": "p-repeatsectionformly",
        //             "wrappers": [
        //               "panel"
        //             ],
        //             "defaultValue": [],
        //             "props": {
        //               "label": "Itemized Material Estimate Lines",
        //               "addText": "Add Material Estimate Line",
        //               "rowDefaults": {
        //                 "quantity": 1,
        //                 "unit": "PCS",
        //                 "price": 0,
        //                 "targetPrice": 0,
        //                 "discount": 0,
        //                 "gstPercentage": 18,
        //                 "totalItemAmount": 0
        //               }
        //             },
        //             "fieldArray": {
        //               "fieldGroupClassName": "grid grid-cols-24 gap-4 w-full p-fluid items-end",
        //               "fieldGroup": [
        //                 {
        //                   "key": "id",
        //                   "type": "input",
        //                   "hide": true
        //                 },
        //                 {
        //                   "key": "productVariantId",
        //                   "type": "input",
        //                   "hide": true
        //                 },
        //                 {
        //                   "key": "prodName",
        //                   "type": "input",
        //                   "hide": true
        //                 },
        //                 {
        //                   "key": "sku",
        //                   "type": "input",
        //                   "hide": true
        //                 },
        //                 {
        //                   "key": "appliedLineDiscountId",
        //                   "type": "input",
        //                   "hide": true
        //                 },
        //                 {
        //                   "type": "primeng-dropdown",
        //                   "key": "productId",
        //                   "className": "col-span-24 md:col-span-5",
        //                   "props": {
        //                     "optionLabel": "label",
        //                     "optionValue": "value",
        //                     "placeholder": "Select Product Item",
        //                     "lookupKey": "productTypes",
        //                     "required": true,
        //                     "filter": true
        //                   },
        //                   "expressions": {
        //                     "props.label": "field.parent.index === 0 ? 'Product Detail Spec / SKU' : ''"
        //                   },
        //                   "hooks": {
        //                     "onInit": "onProductDropdownChange"
        //                   }
        //                 },
        //                 {
        //                   "type": "input",
        //                   "key": "description",
        //                   "className": "col-span-24 md:col-span-4",
        //                   "props": {
        //                     "placeholder": "Item Description / Notes"
        //                   },
        //                   "expressions": {
        //                     "props.label": "field.parent.index === 0 ? 'Description' : ''"
        //                   }
        //                 },
        //                 {
        //                   "type": "input",
        //                   "key": "unit",
        //                   "className": "col-span-12 md:col-span-2",
        //                   "props": {
        //                     "placeholder": "UOM",
        //                     "required": true
        //                   },
        //                   "expressions": {
        //                     "props.label": "field.parent.index === 0 ? 'UOM' : ''"
        //                   }
        //                 },
        //                 {
        //                   "type": "input",
        //                   "key": "quantity",
        //                   "className": "col-span-12 md:col-span-2",
        //                   "props": {
        //                     "type": "number",
        //                     "placeholder": "Qty",
        //                     "required": true,
        //                     "min": 0
        //                   },
        //                   "expressions": {
        //                     "props.label": "field.parent.index === 0 ? 'Quantity' : ''"
        //                   }
        //                 },
        //                 {
        //                   "type": "input",
        //                   "key": "finalPrice",
        //                   "className": "col-span-12 md:col-span-2",
        //                   "props": {
        //                     "type": "number",
        //                     "placeholder": "Rate",
        //                     "required": true,
        //                     "min": 0
        //                   },
        //                   "expressions": {
        //                     "props.label": "field.parent.index === 0 ? 'Base Price' : ''"
        //                   }
        //                 },
        //                 {
        //                   "type": "input",
        //                   "key": "targetPrice",
        //                   "className": "col-span-12 md:col-span-2",
        //                   "props": {
        //                     "type": "number",
        //                     "placeholder": "Target",
        //                     "min": 0
        //                   },
        //                   "expressions": {
        //                     "props.label": "field.parent.index === 0 ? 'Target Price (₹)' : ''"
        //                   }
        //                 },
        //                 {
        //                   "type": "input",
        //                   "key": "discount",
        //                   "className": "col-span-12 md:col-span-2",
        //                   "props": {
        //                     "type": "number",
        //                     "placeholder": "Dsc",
        //                     "required": true,
        //                     "min": 0,
        //                     "readonly": true
        //                   },
        //                   "expressions": {
        //                     "props.label": "field.parent.index === 0 ? 'Discount (₹)' : ''"
        //                   }
        //                 },
        //                 {
        //                   "type": "input",
        //                   "key": "gstPercentage",
        //                   "className": "col-span-12 md:col-span-2",
        //                   "props": {
        //                     "type": "number",
        //                     "placeholder": "GST",
        //                     "required": true,
        //                     "min": 0
        //                   },
        //                   "expressions": {
        //                     "props.label": "field.parent.index === 0 ? 'GST %' : ''"
        //                   }
        //                 },
        //                 {
        //                   "type": "input",
        //                   "key": "totalItemAmount",
        //                   "className": "col-span-12 md:col-span-3",
        //                   "props": {
        //                     "type": "number",
        //                     "placeholder": "Total",
        //                     "readonly": true
        //                   },
        //                   "expressions": {
        //                     "props.label": "field.parent.index === 0 ? 'Line Net' : ''"
        //                   }
        //                 }
        //               ]
        //             }
        //           }
        //         ];

this.clientpo_form=[
  { "key": "id", "type": "input", "hide": true },
  { "key": "createdByUserId", "type": "input", "hide": true },
  { "key": "tenantId", "type": "input", "hide": true },
  { "key": "siteId", "type": "input", "hide": true },
  {
    "className": "col-span-24 w-full block mb-0",
    "fieldGroupClassName": "grid grid-cols-24 gap-4 w-full p-fluid items-end mb-4",
    "fieldGroup": [
      {
        "type": "input",
        "key": "clientPoNumber",
        "className": "col-span-6 md:col-span-4",
        "props": {
          "label": "Purchase Order#",
          "readonly": true,
          "placeholder": "PO#"
        }
      },
      {
        "key": "poDate",
        "type": "datepicker",
        "className": "col-span-12 md:col-span-6",
        "templateOptions": {
          "label": "PO Date",
          "required": true,
          "placeholder": "YYYY-MM-DD"
        }
      }
    ]
  },
  {
    "key": "items",
    "type": "p-repeatsectionformly",
    "wrappers": ["panel"],
    "defaultValue": [],
    "props": {
      "label": "",
      "addText": "Add Item",
      "rowDefaults": { "quantity": "1" }
    },
    "fieldArray": {
      "fieldGroupClassName": "grid grid-cols-24 gap-4 w-full p-fluid items-end",
      "fieldGroup": [
        { "key": "id", "type": "input", "hide": true },
        {
          "type": "primeng-dropdown",
          "key": "productId",
          "className": "col-span-6 md:col-span-10",
          "props": {
            "label": "Item",
            "optionLabel": "label",
            "optionValue": "value",
            "placeholder": "Select Item",
            "lookupKey": "productTypes",
            "required": true,
            "filter": true
          }
        },
        {
          "type": "input",
          "key": "quantity",
          "className": "col-span-3 md:col-span-4",
          "props": {
            "label": "Quantity",
            "placeholder": "Enter quantity",
            "required": true,
            "type": "number"
          }
        },
        {
          "type": "primeng-dropdown",
          "key": "purchaseUom",
          "className": "col-span-12 md:col-span-6",
          "props": {
            "label": "Purchase UOM:",
            "optionLabel": "label",
            "optionValue": "value",
            "placeholder": "Select UOM",
            "filter": true,
            "required": true,
            "options": []
          }
        }
      ]
    }
  }
];
this.clientrfq_form=[

  { "key": "id", "type": "input", "hide": true },
  { "key": "createdByUserId", "type": "input", "hide": true },
  { "key": "tenantId", "type": "input", "hide": true },
  { "key": "siteId", "type": "input", "hide": true },
  {
    "className": "col-span-24 w-full block mb-0",
    "fieldGroupClassName": "grid grid-cols-24 gap-4 w-full p-fluid items-end mb-4",
    "fieldGroup": [
      {
        "type": "input",
        "key": "clientRFQNumber",
        "className": "col-span-6 md:col-span-4",
        "props": {
          "label": "RFQ Order#",
          "readonly": true,
          "placeholder": "RFQ#"
        }
      },
      {
        "key": "rfqDate",
        "type": "datepicker",
        "className": "col-span-12 md:col-span-6",
        "templateOptions": {
          "label": "RFQ Date",
          "required": true,
          "placeholder": "YYYY-MM-DD"
        }
      }
    ]
  },
  {
    "key": "items",
    "type": "p-repeatsectionformly",
    "wrappers": ["panel"],
    "defaultValue": [],
    "props": {
      "label": "",
      "addText": "Add Item",
      "rowDefaults": { "quantity": "1" }
    },
    "fieldArray": {
      "fieldGroupClassName": "grid grid-cols-24 gap-4 w-full p-fluid items-end",
      "fieldGroup": [
        { "key": "id", "type": "input", "hide": true },
        {
          "type": "primeng-dropdown",
          "key": "productId",
          "className": "col-span-6 md:col-span-10",
          "props": {
            "label": "Item",
            "optionLabel": "label",
            "optionValue": "value",
            "placeholder": "Select Item",
            "lookupKey": "productTypes",
            "required": true,
            "filter": true
          }
        },
        {
          "type": "input",
          "key": "quantity",
          "className": "col-span-3 md:col-span-4",
          "props": {
          "label": "Quantity",
            "placeholder": "Enter quantity",
            "required": true,
            "type": "number"
          }
        },
        {
          "type": "primeng-dropdown",
          "key": "purchaseUom",
          "className": "col-span-12 md:col-span-6",
          "props": {
            "label": "Purchase UOM:",
            "optionLabel": "label",
            "optionValue": "value",
            "placeholder": "Select UOM",
            "filter": true,
            "required": true,
            "options": []
          }
        }
      ]
    }
  }
]

}//end of ngOnInit

}
