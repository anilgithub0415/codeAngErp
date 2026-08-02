import { CurrencyPipe } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AutoCompleteModule } from 'primeng/autocomplete'; // Ensure imported in metadata

interface SanitaryProduct {
    sku: string;
    name: string;
    displayName: string;
    contractPrice: number;
}

@Component({
    selector: 'app-procurement-pad',schemas:[CUSTOM_ELEMENTS_SCHEMA],
    templateUrl: './procurement-pad.component.html',
    imports: [AutoCompleteModule, CurrencyPipe]
})
export class ProcurementPadComponent {
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
