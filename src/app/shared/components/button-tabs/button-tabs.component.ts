import { CommonModule } from '@angular/common';
import { Component, ContentChildren, Input, OnInit , QueryList, TemplateRef, Directive} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectButtonModule } from 'primeng/selectbutton';

@Directive({
  selector: '[appTab]',
  standalone: true
})

export class TabDirective {
  @Input('appTab') tabId: string = '';
  constructor(public templateRef: TemplateRef<any>) {}
}

@Component({
  selector: 'app-button-tabs',
  standalone: true,
  imports: [CommonModule,SelectButtonModule, FormsModule],
  templateUrl: './button-tabs.component.html',
  styleUrl: './button-tabs.component.scss'
})
export class ButtonTabsComponent implements OnInit {
  @Input() options: any[] = [];
  activeTab: string = '';
 selectButtonPassThrough = {
    button: ({ context }: any) => ({
      class: context.active
        ? 'bg-blue-600 text-white border-blue-600' // Classes when button is selected
        : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200' // Your requested #f0f0f0 style equivalents
    })
  };
  // 2. Grab all templates declared by the parent with the appTab directive
  @ContentChildren(TabDirective) tabTemplates!: QueryList<TabDirective>;

  ngOnInit() {
   if (this.options && this.options.length > 0) {
    this.activeTab = this.options[0].id; // 
  }
  }

  // 3. Helper method to find and render the correct active template
  getActiveTemplate(): TemplateRef<any> | null {
    const matchingTab = this.tabTemplates?.find(t => t.tabId === this.activeTab);
    return matchingTab ? matchingTab.templateRef : null;
  }
}