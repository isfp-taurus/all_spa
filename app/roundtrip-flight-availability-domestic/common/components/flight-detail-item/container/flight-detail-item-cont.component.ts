import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { getFormatHourTime } from '../../../helpers';
import { MasterDataService } from '../../../services';
import { MasterJsonKeyPrefix } from '@conf/index';
import { AswContextType } from '@lib/interfaces';
import { AswContextStoreService } from '@lib/services';
import { TranslateService } from '@ngx-translate/core';
import { Subscription, take, filter } from 'rxjs';
import { Items11, RoundtripFppItemAirBoundsDataType } from '../../../sdk';
import { AirBounDisplayType } from '@app/roundtrip-flight-availability-domestic/common/interfaces';

/** 言語コード */
const LANG_CODE = {
  JA: 'ja',
  CN: 'cn',
  HK: 'hk',
  TW: 'tw',
  KO: 'ko',
};
/** 静的文言鍵 */
const TRANSLATE_KEY = {
  COMMA_SEPARETER: 'label.commaSeparater',
};

/**
 * フライト詳細ContComponent
 */
@Component({
  selector: 'asw-flight-detail-item-cont',
  templateUrl: './flight-detail-item-cont.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlightDetailItemContComponent implements OnInit, OnDestroy {
  /**
   * セグメント情報
   */
  @Input()
  public segment?: Items11;

  /**
   * AirBound表示タイプ
   */
  @Input()
  public airBoundInfo?: Array<AirBounDisplayType>;

  /**
   * Firstかどうか
   */
  @Input()
  public isFirst?: boolean;

  /**
   * 検索条件.キャビンクラス
   */
  @Input()
  public searchConditionCabinClass?: string;

  @Input()
  public wiFiType?: string;

  /**
   * 出発日
   */
  public departureDay?: string;

  /**
   * 出発時刻
   */
  public departureDateTime?: string;

  /**
   * 出発時刻 AM/PM
   */
  public departureDateTimeApm?: string;

  /**
   * 最新出発日時
   */
  public departureEstimatedDateTime?: string;

  /**
   * 最新出発日時 AM/PM
   */
  public departureEstimatedDateTimeApm?: string;

  /**
   * 到着時刻
   */
  public arrivalDateTime?: string;

  /**
   * 到着時刻 AM/PM
   */
  public arrivalDateTimeApm?: string;

  /**
   * 最新到着日時
   */
  public arrivalEstimatedDateTime?: string;

  /**
   * 最新到着時刻 AM/PM
   */
  public arrivalEstimatedDateTimeApm?: string;

  /**
   * 当該セグメントの出発日と到着日の年月日単位の日数差
   */
  public arrivalDaysDifferenceByFlight?: number;

  /**
   * 最新到着日付差
   */
  public estimatedArrivalDaysDifferenceByFlight?: number;

  /**
   * 深夜出発日時
   */
  public lateNightDepartureDateTime?: string;

  /**
   * NHグループ運航便かどうか
   */
  public isNhGroupOperated?: boolean;

  /**
   * 当該セグメントが遅延便
   */
  public isDelayedFlight?: boolean;

  /**
   * 当該セグメントが遅延便
   */
  public isEarlyDepartureFlight?: boolean;

  /**
   * 出発地空港名称
   */
  public departureLocationName?: string;

  /**
   * 到着地空港名称
   */
  public arrivalLocationName?: string;

  /**
   * 出発ターミナル
   */
  public departureTerminal?: string;

  /**
   * 出発ロケーションコード
   */
  public departureLocationCode?: string;

  /**
   * 到着ターミナル
   */
  public arrivalTerminal?: string;

  /**
   * 到着ロケーションコード
   */
  public arrivalLocationCode?: string;

  /**
   * 便名
   */
  public flightNumber?: string;

  /**
   * 運航キャリア名称
   */
  public operatingAirlineName?: string;

  /**
   * 運航キャリアコード
   */
  public operatingAirlineCode?: string;

  /**
   * 運航キャリアURL
   */
  public operatingAirlineLink?: string;

  /**
   * 機種コード
   */
  public aircraftCode?: string;

  /**
   * 機種名
   */
  public aircraftName?: string;

  /**
   * 機種コードURL
   */
  public aircraftLink?: string;

  /**
   * キャビンクラスのキャビン
   */
  public cabin?: string;

  /**
   * 政府認可申請状況区分
   */
  public isSubjectToGovernmentApproval?: boolean;

  /**
   * 途中寄港地点情報
   */
  public stops?: string;

  /**
   * セグメント毎の飛行時間/フライト時間
   */
  public duration?: string;

  /**
   * ACV特性案内文言キー
   */
  public acvMessageKey?: string;

  /**
   * Wi-Fiサービスアイコン
   */
  public wifiAvailableType?: string;

  /**
   * 食事の種類
   */
  public mealCode?: string;

  /**
   * ngOnDestroyにunsubscribeを実行
   */
  private _subscriptions: Subscription = new Subscription();

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _aswContextSvc: AswContextStoreService,
    private _translateSvc: TranslateService,
    private _masterDataService: MasterDataService
  ) {
    this._translateSvc.onLangChange.subscribe(() => {
      // 出発地空港名称
      this.departureLocationName = this._masterDataService.getAirportName(
        this.segment?.departure?.locationCode,
        this.segment?.departure?.locationName
      );

      // 到着地空港名称
      this.arrivalLocationName = this._masterDataService.getAirportName(
        this.segment?.arrival?.locationCode,
        this.segment?.arrival?.locationName
      );

      // 途中寄港地点情報
      const stops: Array<string | number> = [];
      this.segment?.stops?.forEach((stop) => {
        const stopLocation = this._masterDataService.getAirportName(stop.locationCode, stop.locationName);
        stops?.push(stopLocation);
      });
      const commaSepareter = this._translateSvc.instant(MasterJsonKeyPrefix.STATIC + TRANSLATE_KEY.COMMA_SEPARETER);
      this.stops = stops && stops.length >= 1 ? stops.join(commaSepareter) : '';

      // 運航キャリアコード
      this.operatingAirlineCode = this.segment?.operatingAirlineCode;

      // 運航キャリア名称
      this.operatingAirlineName = this._masterDataService.getInTimeCarrierName(
        this.segment?.operatingAirlineCode as string,
        this.segment?.operatingAirlineName as string
      );
    });
  }

  /**
   * 初期化処理
   */
  public ngOnInit() {
    // データの設定処理
    this._setData();
    // 多言語より表示処理
    this._translateData();
  }

  public ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

  /**
   * データの設定処理
   */
  private _setData() {
    // 最新出発日時
    this.departureEstimatedDateTime = this.segment?.departure?.estimatedTime;

    // 最新到着日時
    this.arrivalEstimatedDateTime = this.segment?.arrival?.estimatedTime;

    // 出発時刻
    this.departureDateTime = this.segment?.departure?.dateTime;

    // 出発ターミナル
    this.departureTerminal = this.segment?.departure?.terminal;
    this.departureLocationCode = this.segment?.departure?.locationCode;

    // 到着ターミナル
    this.arrivalTerminal = this.segment?.arrival?.terminal;
    this.arrivalLocationCode = this.segment?.arrival?.locationCode;

    // 到着時刻
    this.arrivalDateTime = this.segment?.arrival?.dateTime;

    // 当該セグメントの出発日と到着日の年月日単位の日数差
    this.arrivalDaysDifferenceByFlight = this.segment?.arrivalDaysDifferenceByFlight;

    // 最新到着日付差
    this.estimatedArrivalDaysDifferenceByFlight = this.segment?.arrivalEstimatedDaysDifferenceByFlight;

    // NHグループ運航便かどうか
    this.isNhGroupOperated = this.segment?.isNhGroupOperated;

    // 当該セグメントが遅延便
    if (this.departureEstimatedDateTime) {
      this.isDelayedFlight =
        new Date(this.departureDateTime as string) < new Date(this.departureEstimatedDateTime as string);
    } else {
      this.isDelayedFlight = false;
    }

    // 当該セグメントが早発便
    if (this.departureEstimatedDateTime) {
      this.isEarlyDepartureFlight =
        new Date(this.departureDateTime as string) > new Date(this.departureEstimatedDateTime as string);
    } else {
      this.isEarlyDepartureFlight = false;
    }

    // 出発地空港名称
    this.departureLocationName = this._masterDataService.getAirportName(
      this.segment?.departure?.locationCode,
      this.segment?.departure?.locationName
    );

    // 到着地空港名称
    this.arrivalLocationName = this._masterDataService.getAirportName(
      this.segment?.arrival?.locationCode,
      this.segment?.arrival?.locationName
    );

    // 便名
    this.flightNumber = `${this.segment?.marketingAirlineCode}${this.segment?.marketingFlightNumber}`;

    // 機種コード
    this.aircraftCode = this.segment?.aircraftCode;
    this.aircraftLink = this._masterDataService.getModelLink(this.segment?.aircraftConfigurationVersion);
    this.aircraftName = this.segment?.aircraftName;
    // 途中寄港地点情報
    const stops: Array<string | number> = [];
    this.segment?.stops?.forEach((stop) => {
      const stopLocation = this._masterDataService.getAirportName(stop.locationCode, stop.locationName);
      stops?.push(stopLocation);
    });
    const commaSepareter = this._translateSvc.instant(MasterJsonKeyPrefix.STATIC + TRANSLATE_KEY.COMMA_SEPARETER);
    this.stops = stops && stops.length >= 1 ? stops.join(commaSepareter) : '';

    // 出発日
    if (
      !this.isFirst &&
      !!this.segment?.departureDaysDifferenceByBound &&
      this.segment?.departureDaysDifferenceByBound > 0
    ) {
      this.departureDay = this.segment?.departure?.dateTime;
    }

    // 運航キャリアコード
    this.operatingAirlineCode = this.segment?.operatingAirlineCode;

    // 運航キャリア名称
    this.operatingAirlineName = this._masterDataService.getInTimeCarrierName(
      this.segment?.operatingAirlineCode as string,
      this.segment?.operatingAirlineName as string
    );
    this.operatingAirlineLink = this._masterDataService.getInTimeAirlineLink(
      this.segment?.operatingAirlineCode as string
    );

    // 政府認可申請状況区分
    this.isSubjectToGovernmentApproval = this.segment?.isSubjectToGovernmentApproval;

    if (this.segment?.isNhGroupOperated) {
      this.wifiAvailableType = this.wiFiType;
    }
  }

  /**
   * 多言語より表示処理
   */
  private _translateData() {
    this._subscriptions.add(
      this._aswContextSvc
        .getAswContextByKey$(AswContextType.LANG)
        .pipe(
          filter((lang) => !!lang),
          take(1)
        )
        .subscribe((lang) => {
          // セグメント毎の飛行時間/フライト時間
          this.duration = getFormatHourTime(this.segment?.duration as number);
          // 深夜出発日時
          // ユーザ共通.言語情報=“ja”(日本語)
          if (lang === LANG_CODE.JA && this.segment?.isLateNightDeparture) {
            this.lateNightDepartureDateTime =
              this.departureEstimatedDateTime && this.isNhGroupOperated
                ? this.departureEstimatedDateTime
                : this.departureDateTime;
          }
          this._changeDetectorRef.markForCheck();
        })
    );
  }
}
