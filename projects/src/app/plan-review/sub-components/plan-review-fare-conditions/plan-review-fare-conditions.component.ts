import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { fareConditionDetailsModalParts } from '@common/components';
import { getAirportNameFromCache, getPassengerLabel } from '@common/helper';
import { FareFullRuleData, FFPriorityCodeByFFPriorityCode, OutputFareConditionsPerPtc } from '@common/interfaces';
import { CurrentCartStoreService, DcsDateService } from '@common/services';
import { FareConditionsState } from '@common/store';
import { SupportComponent } from '@lib/components/support-class';
import { StaticMsgPipe } from '@lib/pipes';
import { AswMasterService, CommonLibService, ModalService } from '@lib/services';
import {
  FareConditionsResponseDataAirOfferConditions,
  FareConditionsResponseDataAirOfferConditionsPtc,
} from 'src/sdk-servicing';
import { PlanReviewFareConditionsService } from './plan-review-fare-conditions.service';
import { getPlanReviewFareConditionsMasterKey } from './plan-review-fare-conditions.state';

/**
 * 運賃ルールパーツ
 */
@Component({
  selector: 'asw-plan-review-fare-conditions',
  templateUrl: './plan-review-fare-conditions.component.html',
  styleUrls: ['./plan-review-fare-conditions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanReviewFareConditionsComponent extends SupportComponent {
  /** 特典予約フラグ */
  @Input() isAwardBooking?: boolean = false;

  /** プラン有効判定 */
  @Input() isPlanValid = false;

  // ロード中判定　ロード画面を表示するフラグ
  public isLoad = true;
  // エラー判定　エラーメッセージ表示するフラグ
  public isError = false;

  /** 運賃ルール・手荷物情報取得APIレスポンス */
  @Input()
  set fareCondsRes(value: FareConditionsState | undefined) {
    this._fareCondsRes = value;
    this.refresh();
  }
  get fareCondsRes(): FareConditionsState | undefined {
    return this._fareCondsRes;
  }
  public _fareCondsRes?: FareConditionsState;

  /** キャッシュ */
  public masterData: {
    airportCache: { [key: string]: string };
    ffCache: { [key: string]: string };
    fareFullRuleCache: Array<FareFullRuleData>;
    ffPByFFPCache: FFPriorityCodeByFFPriorityCode;
  } = {
    airportCache: {},
    ffCache: {},
    fareFullRuleCache: [],
    ffPByFFPCache: {},
  };

  /** 画面出力用運賃ルール */
  public outputFareConditions: OutputFareConditionsPerPtc[] = [];

  constructor(
    private _common: CommonLibService,
    private _currentCartStoreService: CurrentCartStoreService,
    private _aswMasterSvc: AswMasterService,
    private _modalService: ModalService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _fareConditionsService: PlanReviewFareConditionsService,
    private _staticMsgPipe: StaticMsgPipe,
    private _dcsDateService: DcsDateService
  ) {
    super(_common);
  }

  refresh(): void {
    [this.isLoad, this.isError] = this.getIsLoadIsError(this.fareCondsRes);
    if (this.isLoad || this.isError) {
      this._changeDetectorRef.markForCheck();
    } else {
      this.setOutputData();
    }
  }

  /**
   * ローディング中フラグ・エラーフラグ取得処理
   * @param fareCondsRes
   * @returns [isLoad, isError]
   */
  getIsLoadIsError(fareCondsRes: FareConditionsState | undefined): boolean[] {
    const isError = fareCondsRes?.isFailure ?? false;
    const isLoad = !isError && (fareCondsRes?.isPending || !fareCondsRes);
    return [isLoad, isError];
  }

  /**
   * 画面出力用データ作成処理
   */
  setOutputData(): void {
    const bounds = this.fareCondsRes?.data?.airOfferConditions?.airOfferConditionBounds;
    const cartPlan = this.isPlanValid
      ? this._currentCartStoreService.CurrentCartData.data?.plan
      : this._currentCartStoreService.CurrentCartData.data?.previousPlan;

    const ptcFullList = ['ADT', 'B15', 'CHD', 'INF'];
    const displayPtcList = Object.entries(cartPlan?.travelersSummary?.numberOfTraveler ?? {})
      .filter(([ptc, num]) => ptcFullList.includes(ptc) && num)
      .map(([ptc, num]) => ptc);

    // キャッシュ取得
    const lang = this._common.aswContextStoreService.aswContextData.lang;
    this.subscribeService(
      'PlanReviewFareConditionsComponent GetMasterDataAll',
      this._aswMasterSvc.load(getPlanReviewFareConditionsMasterKey(lang), true),
      (data) => {
        this.deleteSubscription('PlanReviewFareConditionsComponent GetMasterDataAll');
        [
          this.masterData.airportCache,
          this.masterData.ffCache,
          this.masterData.fareFullRuleCache,
          this.masterData.ffPByFFPCache,
        ] = data;

        // 画面出力用運賃ルール情報を作成
        this.outputFareConditions = displayPtcList.map((ptc) => {
          // 画面出力する搭乗者種別名称
          const displayPtcName = this._staticMsgPipe.transform(getPassengerLabel(ptc));
          // 国内DCS移行後日付の国内単独旅程であればtrue、それ以外はfalseを設定
          const isDomesticAfterDcs =
            cartPlan?.airOffer?.tripType === 'domestic' &&
            this._dcsDateService.isAfterDcs(cartPlan?.airOffer?.bounds?.[0]?.originDepartureDateTime ?? '') &&
            this._common.aswContextStoreService.aswContextData.posCountryCode === 'JP';

          // 搭乗者種別毎・バウンド毎の情報
          const paxBounds =
            bounds?.map((bound, index) => {
              const ptcInfo = this.fareCondsRes?.data?.airOfferConditions?.[
                ptc as keyof FareConditionsResponseDataAirOfferConditions
              ] as FareConditionsResponseDataAirOfferConditionsPtc | undefined;
              return {
                /** 出発地 */
                depLoc:
                  getAirportNameFromCache(bound.originLocationCode ?? '', this.masterData.airportCache) ??
                  bound.originLocationName,
                /** 到着地 */
                arrLoc:
                  getAirportNameFromCache(bound.destinationLocationCode ?? '', this.masterData.airportCache) ??
                  bound.destinationLocationName,
                /** FF名称 */
                fareFamilyName: this.masterData.ffCache['m_ff_priority_code_i18n_' + bound.priorityCode] ?? '',
                /** Fare Basis */
                fareBasis: bound.fareBasis ?? '',
                /**
                 * 運賃詳細リンク
                 * ※運賃詳細モーダルで表示するため、国内DCS移行後日付の国内単独旅程以外の場合はマスタから取得したURLをあらかじめ設定
                 */
                fareDetailLink: !isDomesticAfterDcs
                  ? this._fareConditionsService.getFareDetailLink(
                      bound.fareFamilyCode ?? '',
                      bound.priorityCode ?? '',
                      this.masterData.fareFullRuleCache,
                      this.masterData.ffPByFFPCache
                    )
                  : '',
                /** 国内DCS移行後日付の国内単独旅程であるかどうか */
                isDomesticAfterDcs: isDomesticAfterDcs,
                /** プロモーションコード */
                promo:
                  cartPlan?.prices?.totalPrices?.discount?.cat25DiscountName ||
                  cartPlan?.prices?.totalPrices?.discount?.aamDiscountCode,
                /** 変更ルール */
                changeConditions: {
                  beforeDeparture: ptcInfo?.changeConditions?.[index]?.beforeDeparture.defaultDescription ?? '',
                  beforeDepartureNoShow:
                    ptcInfo?.changeConditions?.[index]?.beforeDepartureNoShow.defaultDescription ?? '',
                  afterDeparture: ptcInfo?.changeConditions?.[index]?.afterDeparture.defaultDescription ?? '',
                  afterDepartureNoShow:
                    ptcInfo?.changeConditions?.[index]?.afterDepartureNoShow.defaultDescription ?? '',
                },
                /** 払戻ルール */
                refundConditions: {
                  beforeDeparture: ptcInfo?.refundConditions?.[index]?.beforeDeparture.defaultDescription ?? '',
                  beforeDepartureNoShow:
                    ptcInfo?.refundConditions?.[index]?.beforeDepartureNoShow.defaultDescription ?? '',
                  afterDeparture: ptcInfo?.refundConditions?.[index]?.afterDeparture.defaultDescription ?? '',
                  afterDepartureNoShow:
                    ptcInfo?.refundConditions?.[index]?.afterDepartureNoShow.defaultDescription ?? '',
                },
                /** 最短滞在日付 */
                minStays: ptcInfo?.minimumStays?.[index] ?? '',
                /** 最長滞在日付 */
                maxStays: ptcInfo?.maximumStays?.[index] ?? '',
              };
            }) ?? [];

          return {
            ptc: ptc,
            displayPtcName: displayPtcName,
            bounds: paxBounds,
          };
        });

        this._changeDetectorRef.markForCheck();
      }
    );
  }

  init(): void {}
  reload(): void {}
  destroy(): void {}

  /**
   * 運賃ルール情報ラベル
   */
  get fareDetailsModalBtnLabel() {
    /**
     * 提携：
     * 有償の場合、運賃ルール詳細モーダルを開くボタンを表示する。
     * 特典の場合、運賃ルール詳細リンクを表示する。
     */
    if (!this.isAwardBooking) {
      return this._staticMsgPipe.transform('label.details3');
    } else {
      return this._staticMsgPipe.transform('label.awardFare.domestic'); // TODO: all: 文言調整後、修正する。
    }
  }

  /**
   * 運賃詳細モーダル表示処理
   */
  openFareConditionDetails(): void {
    /**
     * 提携：
     * 有償の場合、運賃ルール詳細モーダルを開く。
     * 特典の場合、運賃ルール詳細リンク先を別タブで開く。
     */
    if (!this.isAwardBooking) {
      const parts = fareConditionDetailsModalParts();
      parts.payload = { data: this._fareConditionsService.convertPerPtcToPerBound(this.outputFareConditions) };
      this._modalService.showSubModal(parts);
    } else {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = this._staticMsgPipe.transform('label.awardFare.domestic'); // TODO: all: 文言調整後、修正する。

      const linkElement = tempDiv.querySelector('a');
      if (linkElement?.href && linkElement?.target) {
        window.open(linkElement?.href, linkElement?.target);
      }
    }
  }
}
