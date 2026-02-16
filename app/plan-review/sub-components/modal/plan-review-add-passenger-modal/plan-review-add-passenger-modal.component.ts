import { AfterViewChecked, ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { apiEventAll, deepCopy, isStringEmpty } from '@common/helper';
import { AddPassengerModalTravelerNum } from '@common/interfaces';
import {
  AddTravelersStoreService,
  CancelPrebookService,
  CurrentCartStoreService,
  PlanReviewStoreService,
} from '@common/services';
import { SupportModalBlockComponent } from '@lib/components/support-class';
import { ErrorType, PageType } from '@lib/interfaces';
import { CommonLibService, ErrorsHandlerService, PageLoadingService } from '@lib/services';
import { CartsAddTravelersRequest } from 'src/sdk-reservation';
import { ErrorCodeConstants } from '@conf/app.constants';
import { AppConstants } from '@conf/app.constants';

/**
 * 搭乗者人数変更モーダル
 */
@Component({
  selector: 'asw-add-passenger-modal',
  templateUrl: './plan-review-add-passenger-modal.component.html',
  styleUrls: ['./plan-review-add-passenger-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanReviewAddPassengerModalComponent extends SupportModalBlockComponent implements AfterViewChecked {
  /** 搭乗者種別毎の現在数・入力人数の組 */
  public numPerPassengerType: AddPassengerModalTravelerNum = {
    ADT: { currentNum: 0, dispNum: 0 },
    B15: { currentNum: 0, dispNum: 0 },
    CHD: { currentNum: 0, dispNum: 0 },
    INF: { currentNum: 0, dispNum: 0 },
  };

  /** 日本国内単独旅程フラグ */
  public isDomestic = false;

  /** DCS移行開始日以降フラグ */
  public isAfterDcs = false;

  /** DCS移行開始日以前日本国内単独旅程フラグ */
  public isBeforeDcsDomestic = false;

  /** DCS移行開始日以降日本国内単独旅程フラグ */
  public isAfterDcsDomestic = false;

  /** 小児最大人数 */
  public chdMax = 8;

  /** 搭乗者追加・削減ボタン ThrottleTime (ms) */
  public PAX_BTN_THROTTLE_TIME = 100;

  public appConstants = AppConstants;

  constructor(
    private _common: CommonLibService,
    private _errorsHandlerSvc: ErrorsHandlerService,
    private _currentCartStoreService: CurrentCartStoreService,
    private _addTravelersStoreService: AddTravelersStoreService,
    private _cancelPrebookService: CancelPrebookService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _planReviewStoreService: PlanReviewStoreService,
    private _router: Router,
    private _pageLoadingService: PageLoadingService
  ) {
    super(_common);
  }

  init(): void {
    this.closeWithUrlChange(this._router);
    const numOfTraveler = this._currentCartStoreService.CurrentCartData.data?.plan?.travelersSummary?.numberOfTraveler;
    this.numPerPassengerType = {
      ADT: {
        currentNum: numOfTraveler?.ADT ?? 0,
        dispNum: numOfTraveler?.ADT ?? 0,
      },
      B15: {
        currentNum: 0,
        dispNum: 0,
      },
      CHD: {
        currentNum: numOfTraveler?.CHD ?? 0,
        dispNum: numOfTraveler?.CHD ?? 0,
      },
      INF: {
        currentNum: numOfTraveler?.INF ?? 0,
        dispNum: numOfTraveler?.INF ?? 0,
      },
    };

    // 国内旅程判定処理
    this.isDomestic = this._currentCartStoreService.CurrentCartData.data?.plan?.airOffer?.tripType === 'domestic';

    // FY25: DCS移行開始日前後判定
    this.isAfterDcs = this.payload.isAfterDcs ?? false;
    this.isBeforeDcsDomestic = this.isDomestic && !this.isAfterDcs;
    this.isAfterDcsDomestic = this.isDomestic && this.isAfterDcs;

    // FY25: 小児最大人数を設定
    this.chdMax = this.isAfterDcsDomestic ? 9 : 8;
  }

  reload(): void {}

  destroy(): void {
    this._common.errorsHandlerService.clearRetryableError('subPage');
    this._common.alertMessageStoreService.removeAllSubAlertMessage();
  }

  ngAfterViewChecked(): void {
    this.resize();
    this._changeDetectorRef.markForCheck();
  }

  /**
   * 搭乗者削減ボタン押下時処理
   * @param type
   */
  reducePassenger(type: string): void {
    if (type in this.numPerPassengerType) {
      this.numPerPassengerType[type as keyof AddPassengerModalTravelerNum].dispNum--;
    }
  }

  /**
   * 搭乗者追加ボタン押下時処理
   * @param type
   */
  addPassenger(type: string): void {
    if (type in this.numPerPassengerType) {
      this.numPerPassengerType[type as keyof AddPassengerModalTravelerNum].dispNum++;
    }
  }

  /**
   * 適用ボタン押下時処理
   */
  clickApply(): void {
    // 計算用に人数情報のコピーを作成
    const numPerPassengerType = deepCopy(this.numPerPassengerType);
    // DCS移行開始日以降の国内線の場合、B15をADT換算
    if (this.isAfterDcsDomestic) {
      numPerPassengerType.ADT.currentNum += this.numPerPassengerType.B15.currentNum;
      numPerPassengerType.ADT.dispNum += this.numPerPassengerType.B15.dispNum;
      numPerPassengerType.B15.currentNum = 0;
      numPerPassengerType.B15.dispNum = 0;
    }
    // 扱いやすいよう短い名前に
    const [adtNum, b15Num, chdNum, infNum] = [
      numPerPassengerType.ADT.dispNum,
      numPerPassengerType.B15.dispNum,
      numPerPassengerType.CHD.dispNum,
      numPerPassengerType.INF.dispNum,
    ];

    const isChdOrInf = chdNum + infNum >= 1;

    // 人数エラーチェック
    let errMsg = '';
    if (adtNum + b15Num + chdNum >= 10) {
      // 幼児を除く搭乗者人数の合計が10名以上の場合
      errMsg = 'E0229';
    } else if (!this.isAfterDcsDomestic && !adtNum && isChdOrInf) {
      // FY25: DCS移行開始日以降の国際旅程にて、大人0名かつ小児・幼児が1名以上の場合
      errMsg = 'E0236';
    } else if (infNum > adtNum) {
      // 幼児の搭乗者人数が大人の搭乗者人数より大きい場合
      // FY25: DCS移行開始日以降、日本国内単独旅程のB15はADTとみなす
      errMsg = 'E0235';
    } else if (adtNum + chdNum >= 3) {
      // 搭乗者人数（ADT+CHD。INFは含めない）が3名以上かつ
      // 運賃オプションに「障がい者割引」が選択された状態で「検索する」ボタンが押下された場合、エラーとする
      const fareOptionType =
        this._currentCartStoreService.CurrentCartData.data?.searchCriteria?.searchAirOffer?.fare?.fareOptionType;
      const isDisabilityDiscount = this.appConstants.FARE_OPTION_DISABILITY_DISCOUNT.some(
        (val) => val === Number(fareOptionType)
      );
      if (isDisabilityDiscount) {
        errMsg = 'EA060';
      }
    }

    if (!isStringEmpty(errMsg)) {
      this._errorsHandlerSvc.setRetryableError(PageType.PAGE, {
        errorMsgId: errMsg,
      });
      this.close();
      return;
    }

    // prebook解除処理を行ったうえで、搭乗者追加API呼び出し
    const travelersSummaryInner = Object.fromEntries(
      Object.entries(numPerPassengerType).map(([key, value]) => [key, value.dispNum - value.currentNum])
    );
    const apiRequest = {
      cartId: this._currentCartStoreService.CurrentCartData.data?.cartId ?? '',
      travelers: {
        travelersSummary: [travelersSummaryInner],
      },
    };
    this._cancelPrebookService.cancelPrebookNext(() => this._addTravelers(apiRequest));
  }

  /**
   * 搭乗者追加処理
   * @param apiRequest 搭乗者追加APIリクエスト
   */
  private _addTravelers(apiRequest: CartsAddTravelersRequest): void {
    // 搭乗者追加API呼び出し
    this._pageLoadingService.startLoading();
    apiEventAll(
      () => this._addTravelersStoreService.setAddTravelersFromApi(apiRequest),
      this._addTravelersStoreService.getAddTravelers$(),
      (response) => {
        this._pageLoadingService.endLoading();
        this.closeAndRefresh();
      },
      (error) => {
        this._pageLoadingService.endLoading();
        const apiErr = this._common.apiError?.errors?.[0]?.code ?? '';
        switch (apiErr) {
          case ErrorCodeConstants.ERROR_CODES.EBAZ000219:
            this._errorsHandlerSvc.setNotRetryableError({
              errorType: ErrorType.BUSINESS_LOGIC,
              errorMsgId: 'E0333',
              apiErrorCode: apiErr,
            });
            this.close();
            break;
          case ErrorCodeConstants.ERROR_CODES.EBAZ000221:
            this._errorsHandlerSvc.setRetryableError(PageType.PAGE, {
              errorMsgId: 'E0385',
              apiErrorCode: apiErr,
            });
            this.close();
            break;
          // 搭乗者情報追加APIより「EBAZ000277：DxAPIのレスポンスにerrorが存在」が返却された場合のエラー
          case ErrorCodeConstants.ERROR_CODES.EBAZ000277:
            this._errorsHandlerSvc.setRetryableError(PageType.PAGE, {
              errorMsgId: 'E1845',
              apiErrorCode: apiErr,
            });
            this.close();
            break;
          default:
            break;
        }
      }
    );
  }

  /**
   * カート情報・プラン情報の更新を予約してモーダルを閉じる処理
   */
  closeAndRefresh(): void {
    // 画面情報更新判定をtrueにする
    this._planReviewStoreService.updatePlanReview({ isNeedRefresh: true });
    this.close();
  }

  /** 閉じるボタン押下時処理 */
  clickClose() {
    this.close();
  }
}
