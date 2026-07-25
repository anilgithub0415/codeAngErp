import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class FormDropdownService {

 
  // A clean global event pipeline stream
  private dropdownUpdateSource = new Subject<{ key: string, value: any }>();
  
  // Expose as a stable read-only stream channel
  dropdownUpdate$ = this.dropdownUpdateSource.asObservable();

  // Method to broadcast changes across the app
  triggerUpdate(fieldKey: string, newValue: any) {
    this.dropdownUpdateSource.next({ key: fieldKey, value: newValue });
  }
}
