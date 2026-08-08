//-------------------------------

//----------------------------------------------------
import { CommonModule } from '@angular/common';
import { Component, ContentChildren, Input, Output, EventEmitter, OnInit, QueryList, TemplateRef, Directive } from '@angular/core';
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
  imports: [CommonModule, SelectButtonModule, FormsModule],
  templateUrl: './button-tabs.component.html',
  styleUrl: './button-tabs.component.scss'
})

export class ButtonTabsComponent implements OnInit {
  @Input() options: any[] = [];
  
  // 🚀 1. Add the matching Output event name for two-way binding syntax
  @Output() activeTabIdChange = new EventEmitter<string>();

  // 🚀 2. Rename internal tracking variable to avoid collisions
  internalActiveTab: string = '';

  // 🚀 3. Intercept programmatic overrides from the parent component
  @Input() 
  set activeTabId(value: string) {
    if (value) {
      this.internalActiveTab = value;
    }
  }

  // 🚀 4. Trigger this when a user clicks a tab header in the UI
  onUiTabChange(selectedTabId: string): void {
    this.internalActiveTab = selectedTabId;
    // Keep the parent dashboard component's variable in sync
    this.activeTabIdChange.emit(selectedTabId); 
  }

  @ContentChildren(TabDirective) tabTemplates!: QueryList<TabDirective>;

  ngOnInit() {
    if (!this.internalActiveTab && this.options && this.options.length > 0) {
      this.internalActiveTab = this.options[0].id;
    }
  }
}

