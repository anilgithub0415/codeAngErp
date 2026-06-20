import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, OnInit } from '@angular/core';
import { FieldType, FormlyFieldConfig, FormlyFormBuilder, FormlyModule } from '@ngx-formly/core';

export interface RowConfig {
  fieldGroupClassName?: string;
  // … other config fields you may have
  fieldGroup:any;
}

@Component({
  selector: 'app-formly-custom-row-bridge',
  schemas:[CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule,FormlyModule],
  templateUrl: './formly-custom-row-bridge.component.html',
  styleUrl: './formly-custom-row-bridge.component.scss'
})
export class FormlyCustomRowBridgeComponent extends FieldType implements OnInit {
  //rowConfig!: RowConfig;//FormlyFieldConfig
  @Input() rowConfig?: RowConfig;          // <-- now bindable and optional

  childFields: FormlyFieldConfig[] = [];
 constructor(private builder: FormlyFormBuilder) {
    super();
  }


  
  // component (simplified)
ngOnInit(): void {

  //const rowIndex = Number(this.field?.parent?.key?.match(/\d+/)?.[0]) ?? 0;
 const keyAsString = String(this.field?.parent?.key ?? '');
  const rowIndex = Number(keyAsString.match(/\d+/)?.[0]) ?? 0;
  
  if (this.props['getRowConfig']) {
    const cfg = this.props['getRowConfig'](rowIndex) as RowConfig;

  //inserted
  // inside FormlyCustomRowBridgeComponent – replace the `mapped = …` block
const copyCssProps = (src: any, dst: any) => {
  // copy the standard Formly `className`
  if (src.className) { 
  
    dst.className = src.className;
  }
  // some people also use `fieldGroupClassName` on a nested group;
  // copy it as well so the inner group gets a wrapper class.
  // if (src.fieldGroupClassName) {console.log('.........................dst.fieldGroupClassName:',dst.fieldGroupClassName);
  //   dst.fieldGroupClassName = src.fieldGroupClassName;
  // }
};//end inserted

   // this.field.fieldGroupClassName = cfg.fieldGroupClassName ?? 'p-grid p-fluid flex flex-wrap';
//console.log('cfg.fieldGroup[0].fieldGroupClassName :',cfg.fieldGroupClassName );



  this.field.fieldGroupClassName = cfg.fieldGroupClassName ?? 'grid grid-cols-12 gap-4 w-full p-fluid';

                


    const mapped = (cfg.fieldGroup ?? []).map((f: any) => {
       // start with a shallow clone so we can add properties
  const newField: any = { ...f };
      if (f.type === 'button' && f.props?.icon === 'pi pi-trash') {
        return {
          ...f,
          props: {
            ...f.props,
            onClick: () => {
              const repeat = this.field.parent as any;
              if (repeat && typeof repeat.remove === 'function') {
                repeat.remove(rowIndex);
              }
            },
          },
        };
      }
      
      
  // ---- **copy CSS‑related properties** ----
  copyCssProps(f, newField);

  return newField;

    });

  
    // **Attach to the field tree**
    this.field.fieldGroup = mapped;  
  
    
    // **Re‑build once**
    this.builder.build(this.field);  
  }
}

      }
  
        