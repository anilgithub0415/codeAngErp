import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
 // This can also be loaded dynamically out of your standard environment.ts files
  private readonly apiUrl: string = 'http://localhost:3000/api/v1';

  constructor() {}

  /**
   * Returns the clean active base backend API URL destination path.
   * Ensures uniformity across all service layers throughout your app.
   */
  getApiUrl(): string {
    return this.apiUrl.trim();
  }

  /**
   * Helper example: returns current app execution scope environment status 
   */
  isProduction(): boolean {
    return false; // Toggle or configure depending on your build targets
  }
}
