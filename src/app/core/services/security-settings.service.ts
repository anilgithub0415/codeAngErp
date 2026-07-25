



// src/app/core/services/security-settings.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UpdateGlobalsettingsDto } from '../models/global-settings';

@Injectable({
  providedIn: 'root'
})
export class SecuritySettingsService {
  private http = inject(HttpClient);

  getSecuritySettings(): Observable<any> {  
    return this.http.get('/security-settings');
  }

  refreshSettings(updateData: UpdateGlobalsettingsDto): Observable<any> {  
    console.log('[SecuritySettingsService] Updating lifecycles:', updateData);
    return this.http.put('/security-settings', updateData);
  }
}
