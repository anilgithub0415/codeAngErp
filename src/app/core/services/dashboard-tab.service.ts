import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DashboardTabService {

    private activeTabSubject = new Subject<string>();

    activeTab$ = this.activeTabSubject.asObservable();

    activate(tabId: string) {
        this.activeTabSubject.next(tabId);
    }

}