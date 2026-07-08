import { Injectable, inject } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';

export interface GlobalConfig{
  //config_usersCreatedby:string; //signup/superadmin
  config_useraddthru:string;
}
@Injectable({
  providedIn: 'root'
})
//this service use called thru appinitializer for reading config data
export class ConfigService {
  private apiUrl:string='/config';
  private configData:GlobalConfig | null = null;
  
  private http =inject(HttpClient);

  loadAppConfig(): Promise<GlobalConfig> { // 👈 Changed return type
  return firstValueFrom(
    this.http.get<GlobalConfig>(this.apiUrl)
  ).then(data => {
    this.configData = data;
    return data; // 👈 Explicitly return data
  })
  .catch(error => {
    console.error('Could not load application configuration');
    const fallback = { config_useraddthru: 'signup' };
    this.configData = fallback;
    return fallback; // 👈 Explicitly return fallback
  });
}


  get config():GlobalConfig|null{
    return this.configData;
  }
}
