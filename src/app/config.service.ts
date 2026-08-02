import { Injectable, inject } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';

export interface GlobalConfig {
  config_useraddthru?: string;
  config_client_onbehalf_roles?: string[]; // 👈 Add the new dynamic roles array
}

@Injectable({
  providedIn: 'root'
})
//this service use called thru appinitializer for reading config data
export class ConfigService {
  private apiUrl:string='/config';
  private configData:GlobalConfig | null = null;
  
  private http =inject(HttpClient);

  loadAppConfig(): Promise<GlobalConfig> {
  return firstValueFrom(
    this.http.get<GlobalConfig>(this.apiUrl)
  ).then(data => {
    this.configData = data;
    return data;
  })
  .catch(error => {
    console.error('Could not load application configuration', error);
    // Provide safe defaults for the system
    const fallback: GlobalConfig = { 
      config_useraddthru: 'signup',
      config_client_onbehalf_roles: ['Site_Supervisor', 'Client'] // 👈 Safe defaults
    };
    this.configData = fallback;
    return fallback;
  });
}



  get config():GlobalConfig|null{
    return this.configData;
  }
}
