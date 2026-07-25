import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-filter-control',
  standalone:true,
  imports: [CommonModule, FormsModule, InputTextModule],
  templateUrl: './filter-control.component.html',
  styleUrl: './filter-control.component.scss'
})
export class FilterControlComponent {

  // Inputs for data and configuration
  @Input() dataSource: any[] = [];
  @Input() filterFields: string[] = [];
  @Input() placeholder: string = 'Search...';

  // Output to emit filtered results back to parent
  @Output() filteredData = new EventEmitter<any[]>();

  searchQuery: string = '';

  ngOnInit() {
    // Emit initial data on load
    this.filteredData.emit(this.dataSource);
  }

  onFilterChange(value: string) { console.log('filtering........................................');
  
    this.searchQuery = value.trim().toLowerCase();

    if (!this.searchQuery) {
      this.filteredData.emit(this.dataSource);
      return;
    }

    const filtered = this.dataSource.filter(item => {
      return this.filterFields.some(field => {
        const fieldValue = this.resolveFieldData(item, field);
        return fieldValue ? String(fieldValue).toLowerCase().includes(this.searchQuery) : false;
      });
    });

    this.filteredData.emit(filtered);
  }

  // Helper to handle nested object properties (e.g., 'user.name')
  private resolveFieldData(data: any, field: string): any {
    if (data && field) {
      return field.split('.').reduce((obj, key) => (obj && obj[key] !== undefined ? obj[key] : null), data);
    }
    return null;
  }
}
