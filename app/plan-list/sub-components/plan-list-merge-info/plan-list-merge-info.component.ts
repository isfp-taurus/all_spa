import { ChangeDetectorRef, Component } from '@angular/core';
import { PlanListStoreService } from '@common/services';
import { PlanListModel } from '@common/store';
import { AmcLoginHeaderComponent } from '@lib/components/shared-ui-components/amc-login/amc-login-header.component';
import { AmcLoginComponent } from '@lib/components/shared-ui-components/amc-login/amc-login.component';
import { SupportComponent } from '@lib/components/support-class';
import { isSP } from '@lib/helpers';
import { CommonLibService, ModalService } from '@lib/services';
import { fromEvent, throttleTime } from 'rxjs';

/**
 * plan-list-plan-merge-info
 * 会員プランへのマージ案内
 */
@Component({
  selector: 'asw-plan-list-merge-info',
  templateUrl: './plan-list-merge-info.component.html',
  styleUrls: ['plan-list-merge-info.component.scss'],
  providers: [],
})
export class PlanListMergeInfoComponent extends SupportComponent {
  constructor(
    private _common: CommonLibService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _modalService: ModalService,
    private _planListStoreService: PlanListStoreService
  ) {
    super(_common);
  }

  /** 画面サイズ判定(SP) */
  public isSP = isSP();
  /** 画面サイズ比較用変数(SP) */
  public isSPPre = this.isSP;

  init(): void {
    // 画面サイズチェック開始
    this.subscribeService(
      'PlanListMergeInfoComponent Resize',
      fromEvent(window, 'resize').pipe(throttleTime(500)),
      this._resizeEvent
    );
  }
  reload(): void {}
  destroy(): void {}

  /** プランマージ案内押下処理 */
  openLoginModal(): void {
    const diarogPart = this._modalService.defaultIdPart(AmcLoginComponent, AmcLoginHeaderComponent);
    diarogPart.closeBackEnable = true;

    // ログイン後プランマージ実行判定
    const plaListInfo: PlanListModel = {
      planList: this._planListStoreService.PlanListData.planList,
      isPlanMerge: true,
    };
    this._planListStoreService.setPlanList(plaListInfo);
    this._modalService.showSubPageModal(diarogPart);
  }

  /** 画面サイズチェック用関数 */
  private _resizeEvent = () => {
    this.isSPPre = this.isSP;
    this.isSP = isSP();
    if (this.isSPPre !== this.isSP) {
      this._changeDetectorRef.markForCheck();
    }
  };
}
