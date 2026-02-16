import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { PlanListCurrentPlan, PlanListSelect } from '@common/interfaces';
import { PlanListStoreService } from '@common/services';
import { PlanListModel } from '@common/store';
import { SupportComponent } from '@lib/components/support-class';
import { isSP } from '@lib/helpers';
import { CommonLibService, PageLoadingService } from '@lib/services';
import { fromEvent, throttleTime } from 'rxjs';

/**
 * plan-list-plan-information
 * プラン情報
 */
@Component({
  selector: 'asw-plan-list-plan-information',
  templateUrl: './plan-list-plan-information.component.html',
  styleUrls: ['plan-list-plan-information.component.scss'],
  providers: [],
})
export class PlanListPlanInformationComponent extends SupportComponent {
  /* 表示用プランリスト */
  @Input()
  set displayPlanList(displayPlanList: Array<PlanListCurrentPlan>) {
    this.refresh(displayPlanList);
  }
  /* カート取得処理完了フラグ */
  @Input()
  set finishGetCart(finishGetCart: boolean) {
    this.finishload(finishGetCart);
  }
  // finishGetCart: boolean = false;
  /* プラン選択チェックボックス情報 */
  @Input()
  select: Array<PlanListSelect> = [];

  /* プラン選択チェックボックス処理 */
  @Output()
  public changeSelectPlan: EventEmitter<{ id: string; check: boolean }> = new EventEmitter<{
    id: string;
    check: boolean;
  }>();
  /* プラン操作メニューモーダル表示処理 */
  @Output()
  public openPlanOperationModal: EventEmitter<{ selectPlan: PlanListCurrentPlan }> = new EventEmitter<{
    selectPlan: PlanListCurrentPlan;
  }>();
  /* プラン確認画面遷移処理 */
  @Output()
  public goToPlanReview: EventEmitter<{ index: number }> = new EventEmitter<{ index: number }>();

  constructor(
    private _common: CommonLibService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _pageLoadingService: PageLoadingService
  ) {
    super(_common);
  }

  /* 表示用プランリスト */
  displayPlans: Array<PlanListCurrentPlan> = [];
  /* 選択中プラン数 */
  countPlans: number = 0;
  /* プラン全選択フラグ */
  selectAll: boolean = false;
  /* チェックボックス活性フラグ */
  checkDisabled: boolean = true;
  /** 画面サイズ判定(SP) */
  public isSP = isSP();
  /** 画面サイズ比較用変数(SP) */
  public isSPPre = this.isSP;

  init(): void {
    // 画面サイズチェック開始
    this.subscribeService(
      'PlanListPlanInformation Resize',
      fromEvent(window, 'resize').pipe(throttleTime(500)),
      this._resizeEvent
    );
  }
  reload(): void {}
  destroy(): void {}

  /* 遅延ロード切替処理 */
  refresh(displayPlanList: Array<PlanListCurrentPlan>) {
    this.displayPlans = displayPlanList;
    /* プラン選択チェックボックス/操作メニューボタンID採番 */
    this.select = displayPlanList.map((plan, index) => {
      return {
        index: index,
        name: 'select' + index,
        checked: false,
        cartId: plan.cartId ?? '',
      };
    });
    //画面の再描写
    this._changeDetectorRef.markForCheck();
    this._changeDetectorRef.detectChanges();
  }

  /* 遅延ローディング全完了後処理 */
  finishload(finishGetCart: boolean) {
    if (finishGetCart) {
      this.checkDisabled = false;
    }
  }

  /* 詳細ボタン押下イベント */
  public clickDetail(index: number) {
    this._pageLoadingService.startLoading();
    // プラン確認画面遷移処理
    this.goToPlanReview.emit({ index });
  }

  /** プラン操作メニューボタン押下処理 */
  clickMenu(index: number) {
    const selectPlan = this.displayPlans[index];

    // プラン操作メニューモーダル表示処理
    this.openPlanOperationModal.emit({ selectPlan });
  }

  /* プラン選択チェックボックスイベント */
  selectPlan(event: Event) {
    const { id: id, checked: check } = event.target as HTMLInputElement;
    this.changeSelectPlan.emit({ id: id, check: check });
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
