import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({ providedIn: 'root' })
export class ContextUiService {
  private _dialogState = new BehaviorSubject<{ visible: boolean, contexts: any[] | null }>({ visible: false, contexts: null });
  dialogState$ = this._dialogState.asObservable();

  openSelectionDialog(contexts: any[]) {
    this._dialogState.next({ visible: true, contexts });
  }

  closeSelectionDialog() {
    this._dialogState.next({ visible: false, contexts: null });
  }
}
