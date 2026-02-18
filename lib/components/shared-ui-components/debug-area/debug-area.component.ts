import { Component } from '@angular/core';
import { SessionStorageName } from '../../../interfaces';
import { CommonLibService, SystemDateService } from '../../../services';
import { SupportComponent } from '../../../components/support-class';
import { environment } from '@env/environment';

/**
 * デバッグエリア
 */
@Component({
  selector: 'asw-debug-area',
  templateUrl: './debug-area.component.html',
  providers: [],
  styleUrls: ['./debug-area.scss'],
})
export class DebugAreaComponent extends SupportComponent {
  constructor(private _common: CommonLibService, private _systemDateSvc: SystemDateService) {
    super(_common);
  }

  public isDevelop = false;
  public systemdate: Date = new Date();
  public identificationId = '';
  public pointOfSaleId = '';
  public lang = '';
  public deviceType = '';
  public loginStatus = '';
  public num = '';
  public letrName = '';
  public afaMile = '';

  init() {
    if (environment.envName === 'prd') {
      return;
    }
    this.isDevelop = true;
    this.subscribeService(
      'DebugAreaComponent_getAswContextObservable',
      this._common.aswContextStoreService.getAswContext$(),
      (state) => {
        this.systemdate = this._systemDateSvc.getSystemDate();
        this.identificationId = this._common.loadSessionStorage(SessionStorageName.IDENTIFICATION_ID);
        this.pointOfSaleId = state.pointOfSaleId;
        this.lang = state.lang;
        this.deviceType = state.deviceType;
        this.loginStatus = state.loginStatus;
      }
    );

    this.subscribeService(
      'DebugAreaComponent_getAMCMemberObservable',
      this._common.amcMemberStoreService.getAMCMember$(),
      (state) => {
        if (this._common.isNotLogin()) {
          this.num = '';
          this.letrName = '';
          this.afaMile = '';
        } else {
          this.num = state.amcNumber;
          if (this.num.length > 4) {
            this.num = '*'.repeat(this.num.length - 4) + this.num.slice(-4);
          }
          this.letrName = state.letterName;
          this.afaMile = (state?.mileBalanceAfa ?? 0).toString();
        }
      }
    );
  }
  destroy() {}
  reload() {}
}
