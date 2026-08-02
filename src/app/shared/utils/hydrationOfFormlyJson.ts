import { FormlyFieldConfig } from "@ngx-formly/core";
import { FORMLY_ROW_REGISTRY } from "../../feature/customer-mgt/formly-registry";
import { typeaheadSearchExtension } from "../components/formlyfields/typeaheadSearchExtension";
import { FormGroup } from "@angular/forms";
import { combineLatest, distinctUntilChanged, firstValueFrom, Observable, startWith } from "rxjs";
import { PurchaseService } from "../../core/services/purchase.service";

   export function hydrateFormlyConfig(rawConfig: any[]): FormlyFieldConfig[] {
     
     
     // Walk the tree and replace every placeholder with the real function
     const walk = (fields: any[]) => {
       fields.forEach(f => {
  
     
  
         // 1️⃣ repeat‑section rows
         if (f.fieldArray?.fieldGroup) {
           walk(f.fieldArray.fieldGroup);
         }
   
         //this rowbuilder part was used when detail part JSON was not there like Organisations
         //for detail part is also specified in json requires rowTemplate which is in else part of this
         // 2️⃣ custom placeholder that needs a row builder
         if (f.type === 'custom' && f.props?.rowBuilder) {
           const builderName = f.props.rowBuilder as string;
           const builderFn = FORMLY_ROW_REGISTRY[builderName];
           if (!builderFn) {
             console.warn(`No row builder registered for "${builderName}"`);
             return;
           }
           f.props.getRowConfig = builderFn;   // <-- inject the real function
           delete f.props.rowBuilder;          // optional: clean up the placeholder
         }
         else 
           // -----------------------------------------------------------------
         // 2️⃣ Handle a custom placeholder that carries a full rowTemplate JSON
         // -----------------------------------------------------------------
         if (f.type === 'custom' && f.props?.rowTemplate) { 
         
           const template = f.props.rowTemplate as any; // raw JSON object
   
           /**
            * Factory that Formly will call for each row index.
            * It clones the stored template, injects the concrete index,
            * and wires the remove‑button handler.
            */
           const rowFactory = (rowIdx: number): FormlyFieldConfig => {
             // Deep‑clone so each row gets its own object (avoid shared refs)
             const clone = JSON.parse(JSON.stringify(template));
   
             // ---- replace the ${index} placeholder in the key -----------------
             if (typeof clone.key === 'string') {
   clone.key = clone.key.replace('${index}', `${rowIdx}`);
             } 
   
    // ---- copy model from the parent (so the boolean flag is available) ----
   // const parentModel = (clone as any).model ?? {};
   // clone.model = { ...parentModel };   // shallow copy is enough for a boolean flag
  //console.log('clone.model:',clone.model);
  
             // ---- replace the sentinel "REMOVE_ROW" with a real function -------
             const replaceSentinel = (field: any) => {
   if (field.props?.onClick === 'REMOVE_ROW') {
     field.props.onClick = (_event: any, fld: any) => {
       // `fld.parent` points to the repeat container (organisations)
       const arr = fld.parent.model.organisations as any[];
       arr.splice(rowIdx, 1);
     };
   }
   // recurse into possible nested groups
   if (field.fieldGroup) {
     field.fieldGroup.forEach(replaceSentinel);
   }
             };
             
   console.log('m here..............in hydrateFormly');
             replaceSentinel(clone);
   
             // The clone now conforms to FormlyFieldConfig
             return clone as FormlyFieldConfig;
           };
   
           // Attach the factory to the custom bridge component
           f.props.getRowConfig = rowFactory;
   
           // Clean up the raw template – it is no longer needed at runtime
           delete f.props.rowTemplate;
         }
   
       });
     };
  
     walk(rawConfig);
     return rawConfig as FormlyFieldConfig[];
   }

   //About: Note:Logic/protocol
   /* This function always assumes a field name 'finalPrice' exists where calculated price will be displayed */
   export function bindDatabaseHooks(productService:any,tenantId:number,fields: FormlyFieldConfig[]) {
    if (!fields) return;
    fields.forEach((field) => {
      if (field.fieldGroup && Array.isArray(field.fieldGroup)) {
        bindDatabaseHooks(productService,tenantId,field.fieldGroup);
      }
      if (field.key === 'items' && field.fieldArray) {
        const arrayConfig = field.fieldArray as FormlyFieldConfig;
        if (arrayConfig && arrayConfig.fieldGroup && Array.isArray(arrayConfig.fieldGroup)) {
          const productDropdown = arrayConfig.fieldGroup.find(f => f.key === 'productId');
          if (productDropdown && productDropdown.hooks && typeof productDropdown.hooks.onInit === 'string') {
            if (productDropdown.hooks.onInit === 'onProductDropdownChange') {
              chainOnInitHook(productDropdown, (targetField: FormlyFieldConfig) => {
                if (!targetField || !targetField.formControl) return;
                const rootForm = targetField.form?.root;
                const clientIdControl = rootForm?.get('clientId');
                if (!clientIdControl) return;

                combineLatest([
                  targetField.formControl.valueChanges.pipe(startWith(targetField.formControl.value)),
                  clientIdControl.valueChanges.pipe(startWith(clientIdControl.value))
                ]).pipe(
                  distinctUntilChanged((prev, curr) => prev[0] === curr[0] && prev[1] === curr[1])
                ).subscribe(async ([prodId, clientId]) => {
                  if (!prodId || !clientId) return;
                  try {
                    const finalPriceData = await getProductFinalPrice(productService,tenantId,prodId, clientId);
                    const finalPriceControl = targetField.parent?.formControl?.get('finalPrice');
                    if (finalPriceControl) {
                      finalPriceControl.setValue(
                        finalPriceData?.calculatedPrice !== undefined ? finalPriceData.calculatedPrice : finalPriceData, 
                        { emitEvent: true, onlySelf: true }
                      );
                    }
                  } catch (error) {
                    console.error(error);
                  }
                });
              });
            }
          }
        }
      }
    });
  }
  export  async function  getProductFinalPrice(productService:any,tenantId:number,prodId: number, clientId: number): Promise<any> {
    const p = await firstValueFrom(productService.getProduct(tenantId, prodId));
    return new Promise((resolve) => {
      productService.getProductFinalPrice(prodId, tenantId, p, clientId).subscribe((afinalPrice :any)=> {
        console.log('got price for resolve:', afinalPrice);
        resolve(afinalPrice);
      });
    });
  }
  //  export function  applyLocalSearchExtension(fields: FormlyFieldConfig[]) {
  //   console.log('...........................fields:',fields);
    
   
  //      fields.forEach(field => { console.log('iterating for search extension..........................');
  //        // If the field is flagged searchable in your JSON
  //        if (field.props && field.props['searchable']) {
  //          console.log('applying wrapper search extension..........................');
  //          // Dynamically inject the wrapper name into the field's array stack
  //          field.wrappers = [...(field.wrappers || []), 'typeahead-wrapper'];
  //          typeaheadSearchExtension(field);
  //        }
  //         if (field.fieldGroup) {
  //          applyLocalSearchExtension(field.fieldGroup);
  //        }
  //      });
  //    } 
     

  //------------------------------------------------------------------------------------------------------------
  export function applyLocalSearchExtension(fields: FormlyFieldConfig[], dataSources: { [key: string]: any[] }) {
  if (!fields || !Array.isArray(fields)) return;

  fields.forEach(field => {
    const isSearchable = field.props?.['searchable'] === true || (field as any)['searchable'] === true;
    const fieldKey = field.key as string;

    if (isSearchable && fieldKey) {
      console.log('................................got fieldkey:', fieldKey);
      
      const currentWrappers = field.wrappers || [];
      
      if (!currentWrappers.includes('form-field')) {
        currentWrappers.unshift('form-field');
      }
      
      if (!currentWrappers.includes('typeahead-wrapper')) {
        currentWrappers.push('typeahead-wrapper');
      }
      
      field.wrappers = currentWrappers;
      
      if (!field.props) field.props = {};
      
      // 🌟 FIX 1: Safely fallback to handle plural vs singular key mismatches (e.g., emailId vs emailIds)
      const dataset = dataSources[fieldKey] || dataSources[`${fieldKey}s`] || dataSources['emailIds'] || [];
      field.props['datasource'] = dataset;
      field.props['suggestions'] = [];

      if (field.hooks?.onInit) {
        const originalOnInit = field.hooks.onInit;
        field.hooks.onInit = (f) => {
          originalOnInit(f);
          setupSearchListener(f);
        };
      } else {
        field.hooks = { ...field.hooks, onInit: (f) => setupSearchListener(f) };
      }
    }

    if (field.fieldGroup) {
      applyLocalSearchExtension(field.fieldGroup, dataSources);
    }

    if (field.fieldArray) {
      if (typeof field.fieldArray !== 'function' && field.fieldArray.fieldGroup) {
        applyLocalSearchExtension(field.fieldArray.fieldGroup, dataSources);
      }
    }
  });
}

function setupSearchListener(field: FormlyFieldConfig) {
  const activeKey = field.key as string;
  console.log(`[Formly Extension] 🚀 Search listener successfully initialized for field key: "${activeKey}"`);

  field.formControl?.valueChanges.subscribe(value => {
    const datasource = field.props?.['datasource'] || [];
    
    let searchTerm = '';
    if (value) {
      if (typeof value === 'object') {
        // 🌟 FIX 2: Safely read from any common data string structures (name, emailId, commercialContactPhone, value)
        searchTerm = String(value[activeKey] || value['name'] || value['emailId'] || value['commercialContactPhone'] || '');
      } else {
        searchTerm = String(value); 
      }
    }

    console.log(`\n--- [Typeahead Check: ${activeKey}] ---`);
    console.log(`🔹 User typed value:`, value);
    console.log(`🔍 Extracted Search Term: "${searchTerm}" (Length: ${searchTerm.length})`);
    console.log(`📦 Total items loaded in datasource cache for validation:`, datasource.length);

    if (!searchTerm || searchTerm.trim().length < 3) {
      console.log(`⚠️ Input length is less than 3 characters. Skipping search filter logic.`);
      if (field.props) {
        field.props['suggestions'] = [];
        field.props.description = ''; 
      }
      return;
    }

    const cleanSearchStr = searchTerm.toLowerCase().trim();
    
    // 🌟 FIX 3: Fallback check on standard matching fields so filtering doesn't crash on undefined properties
    const matches = datasource.filter((item: any) => {
      const targetValue = String(item[activeKey] || item['name'] || item['emailId'] || item['commercialContactPhone'] || '');
      return targetValue.toLowerCase().includes(cleanSearchStr);
    });
    
    console.log(`🎯 Partial matches found for dropdown display (${matches.length}):`, matches);
    
    if (field.props) {
      field.props['suggestions'] = matches;
    }

    const exactMatchExists = datasource.some((item: any) => {
      const targetValue = String(item[activeKey] || item['name'] || item['emailId'] || item['commercialContactPhone'] || '');
      return targetValue.trim().toLowerCase() === cleanSearchStr;
    });

    if (exactMatchExists) {
      console.log(`⚠️ WARNING: Duplicate record found. Displaying custom warning text.`);
      if (field.props) {
        field.props = {
          ...field.props,
          description: `⚠️ Notice: This record already exists but is acceptable.`
        };
        field.options?.detectChanges?.(field);
      }
    } else {
      if (field.props && field.props.description !== '') {
        field.props = {
          ...field.props,
          description: ''
        };
        field.options?.detectChanges?.(field);
      }
    }
  });
}



  //------------------------------------------------------------------------------------------------------------


         
//calling Generic method for Purchase units for displaying in PurchaseOrder units

export async function injectPurchaseUomMatrixListeners(
  fields: FormlyFieldConfig[], 
  purchaseService: MatrixService, 
  tenantId: number
) {
  await injectGenericMatrixEngine({
    fields,
    service: purchaseService,
    tenantId,
    targetUomKey: 'purchaseUom',
    matrixResultArrayKey: 'availablePurchaseUnits'
  });
}


//calling Generic method for Sales units for displaying in SalesOrder units
export async function injectSalesUomMatrixListeners(
  fields: FormlyFieldConfig[], 
  salesService: MatrixService, 
  tenantId: number
) {
  await injectGenericMatrixEngine({
    fields,
    service: salesService,
    tenantId,
    targetUomKey: 'salesUom',
    matrixResultArrayKey: 'availableSalesUnits'
  });
}
         
     //Generic methods for purchase and sales unit finding options

/**
 * PRIVATE CORE ENGINE
 * Coordinates event subscriptions, state mutations, and data normalization across fields
 */
async function injectGenericMatrixEngine(config: {
  fields: FormlyFieldConfig[];
  service: MatrixService;
  tenantId: number;
  targetUomKey: string;
  matrixResultArrayKey: string;
}) {
  const targetKeys = ['productId', 'productVariantId'];
  const itemsField = config.fields.find(f => f.key === 'items');
  if (!itemsField) return;

  const fieldArrayConfig = itemsField.fieldArray as FormlyFieldConfig;
  if (!fieldArrayConfig || !fieldArrayConfig.fieldGroup) return;

  const groupFields = fieldArrayConfig.fieldGroup;
  if (!Array.isArray(groupFields)) return;

  const uomField = groupFields.find(f => f.key === config.targetUomKey);

  // 1. Hook into row item lookups (Product / Variant Selection changes)
 groupFields.forEach((fieldConfig: FormlyFieldConfig) => {
  const currentKey = String(fieldConfig.key);
  if (fieldConfig.key && targetKeys.includes(currentKey)) {
    
    // Replace the direct object assignment with the hook chainer
    chainOnInitHook(fieldConfig, (field: FormlyFieldConfig) => {
      console.log(`Matrix lookup applying to ${currentKey}................`);
      
     // Add a guard variable inside groupFields.forEach or track it globally
field.formControl?.valueChanges.subscribe(async (incomingValue) => {
  const rowGroup = field.parent?.formControl as FormGroup;
  if (!rowGroup || !field.parent) return;

  // FIX: If the control is pristine (just loaded from backend), 
  // skip automatic value manipulation that wipes out saved UOMs.
  if (rowGroup.pristine && rowGroup.get(config.targetUomKey)?.value) {
     console.log('Skipping matrix fetch during initial edit form load');
     return; 
  }

  const productId = currentKey === 'productId' ? incomingValue : null;
  const productVariantId = currentKey === 'productVariantId' ? incomingValue : null;

  await executeGenericMatrixFetch({
    rowGroup,
    prodId: productId,
    variantId: productVariantId,
    service: config.service,
    tenantId: config.tenantId,
    targetUomKey: config.targetUomKey,
    matrixResultArrayKey: config.matrixResultArrayKey
  });
});

    });

  }
});


  // 2. Hook into Unit dropdown changes to map live factors
  if (uomField) {
  uomField.hooks = {
    ...uomField.hooks,
    onInit: (field: FormlyFieldConfig) => {
      field.formControl?.valueChanges.subscribe((selectedUnit) => {
        const rowGroup = field.parent?.formControl as FormGroup;
        if (!rowGroup) return;

        const uomControl = rowGroup.get(config.targetUomKey);
        
        // FIX: Extract options directly from the runtime control state or parent group storage array
        const availableOptions = 
          (uomControl as any)?.customOptions || 
          field.props?.options || 
          (rowGroup as any).value?.[config.matrixResultArrayKey]; // Read direct from row model storage fallback

        console.log('--- Evaluation Cycle ---');
        console.log('Key:', config.targetUomKey, 'Available Options:', availableOptions);
         
        // Fallback protection guard rule
        if (!availableOptions || !Array.isArray(availableOptions) || availableOptions.length === 0) {
          console.warn('Matrix data missing: Holding current value state until array resolves.');
          return; 
        }

        const targetedMatch = availableOptions.find(o => o.value === selectedUnit);
        if (targetedMatch) {
          rowGroup.get('conversionFactor')?.setValue(targetedMatch.factor ?? 1.00, { emitEvent: false });
        }
      });
    }
  };
}


}

export function chainOnInitHook(field: FormlyFieldConfig, newOnInitFn: (field: FormlyFieldConfig) => void) {
  field.hooks = field.hooks || {};
  const existingOnInit = field.hooks.onInit;

  field.hooks.onInit = (targetField: FormlyFieldConfig) => {
    // 1. Run the previously registered hook if it's a function
    if (typeof existingOnInit === 'function') {
      existingOnInit(targetField);
    }
    // 2. Run the new hook
    newOnInitFn(targetField);
  };
}

export interface MatrixService {
  fetchTenantRulesMatrix(tenantId: number, productId: number | null, productVariantId: number | null): Observable<any>;
}
/**
 * REST API Caller & Form Control Normalizer
 */

export async function executeGenericMatrixFetch(config: {
  rowGroup: FormGroup;
  prodId: number | null;
  variantId: number | null;
  service: MatrixService;
  tenantId: number;
  targetUomKey: string;
  matrixResultArrayKey: string;
}) {
  // 1. Capture the initial database value before the async call
  const savedDatabaseValue = config.rowGroup.get(config.targetUomKey)?.value;

  // 2. FIX: Wrap the observable in firstValueFrom to resolve the actual data object
  const matrixData = await firstValueFrom(
    config.service.fetchTenantRulesMatrix(config.tenantId, config.prodId, config.variantId)
  ) as any; // Cast as any to bypass the dynamic string indexing error

  // 3. Extract the array using your dynamic key safely
  const rawOptionsList = matrixData?.[config.matrixResultArrayKey] || [];

  const formattedDropdownOptions = rawOptionsList.map((item: any) => ({
    label: item.label,
    value: item.value,
    factor: item.factor
  }));

  const targetControl = config.rowGroup.get(config.targetUomKey);
  if (targetControl) {
    (targetControl as any).customOptions = formattedDropdownOptions;
    
    // 4. Force-restore the saved database value without re-triggering Formly loops
    if (savedDatabaseValue && formattedDropdownOptions.some((o:any) => o.value === savedDatabaseValue)) {
      targetControl.setValue(savedDatabaseValue, { emitEvent: false });
    }
  }
}



     //end Generic methods for purchase and sales unit finding option