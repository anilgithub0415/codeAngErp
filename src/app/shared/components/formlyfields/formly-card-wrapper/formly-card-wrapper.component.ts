import { Component, HostBinding } from '@angular/core';
import { FieldWrapper } from '@ngx-formly/core';
import { CardModule } from 'primeng/card';
/*template backup: <p-card [header]="props.label" [subheader]="props.description" [class]="field.className || 'col-span-24'">
  <ng-container #fieldComponent></ng-container>
</p-card>/ 
<p-card 
  [header]="props.label" 
  [subheader]="props.description" 
  [class]="field.className || 'col-span-24'"
  [style]="{ 'padding': '0' }"> <!-- ⚡ This completely removes the stubborn PrimeNG inner padding -->

  <!-- This wrapper div applies mobile-friendly tight padding that YOU control -->
  <div class="p-0 md:p-2">
    <ng-container #fieldComponent></ng-container>
  </div>

</p-card>*/

/*

  <p-card [header]="props.label" [subheader]="props.description" [class]="field.className || 'col-span-24'">
  <ng-container #fieldComponent></ng-container>
</p-card>
 */
@Component({
  selector: 'app-formly-card-wrapper',
  standalone: true,
  imports: [CardModule],
  template: `
  <p-card [header]="props.label" [subheader]="props.description" [class]="field.className || 'col-span-24'">
        <ng-container #fieldComponent></ng-container>
      
    </p-card>
  `,
  styleUrls: ['./formly-card-wrapper.component.scss']
})
export class FormlyCardWrapperComponent extends FieldWrapper {
  @HostBinding('class')
  get hostClasses(): string | undefined {
    const classes = [this.field?.className, this.field?.fieldGroupClassName].filter(Boolean as any);
    return classes.length ? classes.join(' ') : undefined;
  }
  // @HostBinding('class')
  // get hostClasses(): string | undefined {
  //   return this.field?.className || 'col-span-24';
  // }
}
