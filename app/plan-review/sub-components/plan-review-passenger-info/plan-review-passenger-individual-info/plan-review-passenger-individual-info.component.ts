import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { PlanReviewOutputPassengerInfosItem } from '@common/interfaces';
import { CurrentCartStoreService } from '@common/services';
import { SupportComponent } from '@lib/components/support-class';
import { DialogClickType, PageType } from '@lib/interfaces';
import { CommonLibService, PageLoadingService } from '@lib/services';
import { PlanReviewPassengerInfoService } from '../plan-review-passenger-info-service';
import { AppConstants } from '@conf/app.constants';

/**
 * 搭乗者毎の情報
 */
@Component({
  selector: 'asw-plan-review-passenger-individual-info',
  templateUrl: './plan-review-passenger-individual-info.component.html',
  styleUrls: ['./plan-review-passenger-individual-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanReviewPassengerIndividualInfoComponent extends SupportComponent {
  public appConstants = AppConstants;

  @Input() isPlanValid = false;
  @Input() isTravelSky = false;
  @Input() paxIndex = 0;

  @Input()
  set data(value: PlanReviewOutputPassengerInfosItem) {
    this._data = value;
    this.refresh();
  }
  get data(): PlanReviewOutputPassengerInfosItem {
    return this._data;
  }
  private _data: PlanReviewOutputPassengerInfosItem = {};

  /** FY25: DCS移行開始日以降フラグ */
  @Input() isAfterDcs = false;

  /** FY25: 障がい割・アイきっぷ運賃適用フラグ */
  @Input() fareTypeFlags = {
    isDisabilityDiscount: false,
    isIslandTicket: false,
  };

  /** 搭乗者削除ボタン活性フラグ */
  public isAbleToDeleteThisPax = true;

  /** ログインフラグ */
  public isNotLogin = false;

  /** FY25: 他PNRに大人の同行者が存在するか否か */
  @Input() hasAccompaniedInAnotherReservation?: boolean;

  constructor(
    private _common: CommonLibService,
    private _passengerInfoService: PlanReviewPassengerInfoService,
    private _currentCartStoreService: CurrentCartStoreService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _loadingSvc: PageLoadingService
  ) {
    super(_common);
  }

  init(): void {
    this.isNotLogin = this._common.isNotLogin();
    this.refresh();
  }

  reload(): void {}
  destroy(): void {}

  refresh(): void {
    this.isAbleToDeleteThisPax = this.getIsAbleToDeleteThisPax();
    this._changeDetectorRef.markForCheck();
  }

  /**
   * 当該搭乗者の削除可否判定処理
   */
  getIsAbleToDeleteThisPax(): boolean {
    const cart = this._currentCartStoreService.CurrentCartData.data;

    if (this.isPlanValid) {
      // プラン有効の場合
      const numOfAllPax = cart?.plan?.travelers?.length ?? 0;
      const adtNum = cart?.plan?.travelersSummary?.numberOfTraveler?.ADT ?? 0;
      const infNum = cart?.plan?.travelersSummary?.numberOfTraveler?.INF ?? 0;
      const isAbleToDeleteAdt = adtNum > infNum;
      const isAdt = this._data.passengerTypeCode?.value === 'ADT';

      if (numOfAllPax === 1) {
        return false;
      }
      if (isAdt) {
        return isAbleToDeleteAdt;
      }
      return true;
    } else {
      // プラン無効の場合
      return false;
    }
  }

  /**
   * 搭乗者情報入力モーダル表示処理
   * @param editArea @see PassengerInformationRequestEditType
   */
  openPassengerInfoRequest(editArea: number): void {
    //PageInitService.endInitを使用しているため、endLoadingは入れない。
    this._loadingSvc.startLoading();
    this._passengerInfoService.openPassengerInfoRequest(editArea);
  }

  /**
   * 搭乗者削除ボタン押下時処理
   * @param index 削除対象搭乗者のインデックス
   */
  clickDeletePaxBtn(index: number): void {
    const cartPlan = this._currentCartStoreService.CurrentCartData.data?.plan ?? {};

    // 追加分計 #14 (No.59) プラン作成時の小児、幼児の扱いに関して Cart小児幼児考慮
    this._passengerInfoService.preventOrConfirmChdOnlyFlight(
      cartPlan,
      index,
      this.isAfterDcs,
      this.hasAccompaniedInAnotherReservation,
      (modalResponse) => {
        // 後続処理
        // 他PNRに大人の同行者が要るか否かの判定がモーダルから返却された場合、それを保持する
        this.hasAccompaniedInAnotherReservation = modalResponse;

        // ANAUIUXS2_DEV-11160対応
        const isAdultRequired = this._passengerInfoService.isAdultRequired(cartPlan, index, this.isAfterDcs);
        if (isAdultRequired) {
          // 大人の付添人が1名以上必要である旨のエラーメッセージ
          this._common.errorsHandlerService.setRetryableError(PageType.PAGE, {
            errorMsgId: 'E1271',
          });
          return;
        }

        // ダイアログ表示するメッセージのリスト
        const msgList = this._passengerInfoService.getPaxDeleteAlertMsgList(cartPlan, index);

        // 配列のメッセージを順次ダイアログ表示
        this.subscribeService(
          'PlanReviewPassengerInfoComponent showMsgListInDialogs',
          this._passengerInfoService.showMsgListInDialogs(msgList),
          (clickType) => {
            if (clickType === DialogClickType.CONFIRM) {
              // 最後のダイアログまで同意が完了した場合
              this.deleteSubscription('PlanReviewPassengerInfoComponent showMsgListInDialogs');
              this._passengerInfoService.deletePassenger(index, this.hasAccompaniedInAnotherReservation, () => {
                this._changeDetectorRef.markForCheck();
              });
            } else {
              // 途中で同意拒否された場合
              this.deleteSubscription('PlanReviewPassengerInfoComponent showMsgListInDialogs');
              return;
            }
          }
        );
      }
    );
  }
}
