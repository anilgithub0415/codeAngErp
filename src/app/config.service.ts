import { Injectable, inject } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';

export interface GlobalConfig{
  config_useraddthru:string; //signup/superadmin
}
@Injectable({
  providedIn: 'root'
})
//this service use called thru appinitializer for reading config data
export class ConfigService {
  private apiUrl:string='/config';
  private configData:GlobalConfig | null = null;
  
  private http =inject(HttpClient);

  loadAppConfig():Promise<void>{
    return firstValueFrom(
      this.http.get<GlobalConfig>(this.apiUrl)
    ).then(data=>{
      this.configData=data;
    })
    .catch(error=>{
      console.error('Could not load application configuration');
      this.configData={config_useraddthru:'signup'}
      
    })
  }

  get config():GlobalConfig|null{
    return this.configData;
  }
}
