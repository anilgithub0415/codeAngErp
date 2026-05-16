import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UpdateGlobalsettingsDto } from '../models/global-settings';
@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  
  constructor(private http: HttpClient) {}

  getSettings(){  
    return this.http.get('/admin-settings');
    }

  refreshSettings(updateData:UpdateGlobalsettingsDto){  
    console.log(updateData);
    
    return this.http.put('/admin-settings',updateData);
    }


  

}
