import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SplitButtonModule } from 'primeng/splitbutton';
import { TableModule } from 'primeng/table';
import{SpeedDialModule} from 'primeng/speeddial'
import { BadgeModule } from 'primeng/badge';
interface SanitaryProduct {
    sku: string;
    name: string;
    displayName: string;
    contractPrice: number;
}
@Component({
  selector: 'app-dashboard5',
  imports: [CommonModule,CardModule, TableModule,AutoCompleteModule,FormsModule, ButtonModule, SplitButtonModule, SpeedDialModule, BadgeModule],
  templateUrl: './dashboard5.component.html',
  styleUrl: './dashboard5.component.scss'
})
export class Dashboard5Component {
// Master wholesale catalog cache
    masterCatalog: SanitaryProduct[] = [
        { sku: 'MOP-HD-COT', name: 'Heavy-Duty Cotton Mop Head 24oz', displayName: 'MOP-HD-COT - Heavy-Duty Cotton Mop Head 24oz', contractPrice: 14.50 },
        { sku: 'CLN-FLR-5L', name: 'Industrial Floor Cleaner Conc. (5L)', displayName: 'CLN-FLR-5L - Industrial Floor Cleaner Conc. (5L)', contractPrice: 32.00 },
        { sku: 'BRS-GMC-12', name: 'Grout & Mortar Counter Brush', displayName: 'BRS-GMC-12 - Grout & Mortar Counter Brush', contractPrice: 8.75 }
    ];

    selectedProduct: SanitaryProduct | null = null;
    filteredProducts: SanitaryProduct[] = [];

    // Filters search criteria instantly as user types
    searchProducts(event: any) {
        const query = event.query.toLowerCase();
        this.filteredProducts = this.masterCatalog.filter(product => 
            product.name.toLowerCase().includes(query) || 
            product.sku.toLowerCase().includes(query)
        );
    }
}
