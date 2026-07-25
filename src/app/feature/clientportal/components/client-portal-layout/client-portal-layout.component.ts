import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-client-portal-layout',
  imports: [
      RouterOutlet
    
    ],
        providers:[MessageService],
  templateUrl: './client-portal-layout.component.html',
  styleUrl: './client-portal-layout.component.scss'
})
export class ClientPortalLayoutComponent {}