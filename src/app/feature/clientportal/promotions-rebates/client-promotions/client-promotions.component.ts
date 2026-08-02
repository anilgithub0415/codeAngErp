import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-client-promotions',
  imports: [CommonModule,CardModule],
  templateUrl: './client-promotions.component.html',
  styleUrl: './client-promotions.component.scss'
})
export class ClientPromotionsComponent {
promoMetrics = {
        currentTier: 'Tier-1 Premium',
        nextTier: 'Tier-2 Elite',
        progressPercent: 78,
        spendToNextTier: 2450.00,
        activeRebate: 320.00
    };
}
