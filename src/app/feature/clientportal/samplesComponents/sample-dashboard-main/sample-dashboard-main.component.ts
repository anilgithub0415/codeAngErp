import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { FormsModule } from '@angular/forms';

export interface CatalogItem {
    sku: string;
    name: string;
    displayName: string;
    contractPrice: number;
}

@Component({
    selector: 'app-sample-dashboard-main',schemas:[CUSTOM_ELEMENTS_SCHEMA],
    standalone: true,
    imports: [CommonModule, CardModule, ButtonModule, AutoCompleteModule, FormsModule, ],
    templateUrl: './sample-dashboard-main.component.html'
})
export class SampleDashboardMainComponent implements OnInit {
    
    // Module 1: Products Mock Database & State
    masterCatalog: CatalogItem[] = [
        { sku: 'MOP-HD-COT', name: 'Heavy-Duty Cotton Mop Head 24oz', displayName: 'MOP-HD-COT - Heavy-Duty Cotton Mop Head 24oz', contractPrice: 14.50 },
        { sku: 'CLN-FLR-5L', name: 'Industrial Floor Cleaner Conc. (5L)', displayName: 'CLN-FLR-5L - Industrial Floor Cleaner Conc. (5L)', contractPrice: 32.00 },
        { sku: 'BRS-GMC-12', name: 'Grout & Mortar Counter Brush', displayName: 'BRS-GMC-12 - Grout & Mortar Counter Brush', contractPrice: 8.75 }
    ];
    selectedProduct: CatalogItem | null = null;
    filteredProducts: CatalogItem[] = [];

    // Module 2: Promotions Metric Mock Data
    promoMetrics = {
        currentTier: 'Tier-1 Premium',
        nextTier: 'Tier-2 Elite',
        progressPercent: 78,
        spendToNextTier: 2450.00,
        activeRebate: 320.00
    };

    // Module 3 & 4: Purchase & Sales Shared Tracking
    purchaseCount = 4; // Backordered replenishment batches
    activeSalesOrders = 12; // Picking/Packing queue count

    // Module 5: Quotations Data
    pendingQuote = {
        id: 'RFQ-2026-89',
        status: 'Awaiting Client Review',
        value: 4850.00,
        step: 3 // Step 3 out of 3
    };

    // Module 6: Clients / Financial Account Balance
    clientAccount = {
        status: 'Good Standing',
        availableCredit: 14500.00,
        overdueBalance: 0.00,
        utilizedPercent: 45
    };

    // Module 7: Delivery Challan & Tracking
    activeChallan = {
        id: 'DC-9921-A',
        items: 'Mops & Floor Cleaner Consignment',
        status: 'In Transit',
        estimatedArrival: 'Today, 4:00 PM'
    };

    ngOnInit(): void {}

    searchProducts(event: any) {
        const query = event.query.toLowerCase();
        this.filteredProducts = this.masterCatalog.filter(product => 
            product.name.toLowerCase().includes(query) || 
            product.sku.toLowerCase().includes(query)
        );
    }
}
