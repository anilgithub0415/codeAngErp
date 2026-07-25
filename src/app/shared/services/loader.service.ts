import { computed, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
// Use a counter to handle multiple concurrent API calls correctly
  private activeRequests = signal<number>(0);

  // Read-only signal for components to consume
  isLoading = computed(() => this.activeRequests() > 0);

  show() {
    this.activeRequests.update(count => count + 1);
  }

  hide() {
    this.activeRequests.update(count => Math.max(0, count - 1));
  }
}