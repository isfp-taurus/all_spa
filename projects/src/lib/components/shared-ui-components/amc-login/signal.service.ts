import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SignalService {
  constructor() {}

  public isMergeConfirm: boolean = false;

  private loginSignalSource = new Subject<void>();
  loginSignal$ = this.loginSignalSource.asObservable();

  private mergeConfirmSignalSource = new Subject<void>();
  mergeConfirmSignal$ = this.mergeConfirmSignalSource.asObservable();

  sendLoginSignal() {
    this.loginSignalSource.next();
  }

  sendMergeConfirmSignal() {
    this.mergeConfirmSignalSource.next();
  }
}
