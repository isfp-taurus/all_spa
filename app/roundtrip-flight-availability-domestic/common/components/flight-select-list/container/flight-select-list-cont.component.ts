import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { getFormatHourTime } from '../../../helpers';
import { MasterDataService } from '../../../services';
import { AswContextStoreService } from '@lib/services';
import { Subscription, take } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { AswContextType, DeviceType } from '@lib/interfaces';
import { v4 } from 'uuid';
import { MasterJsonKeyPrefix } from '@conf/index';
import {
  RoundtripFppItemAirBoundsDataType,
  RoundtripFppItemBoundDetailsDataType,
  Items11,
} from '../../../../common/sdk';
import { AirBounDisplayType } from '@app/roundtrip-flight-availability-domestic/common/interfaces';

/** 静的文言鍵 */
const TRANSLATE_KEY = {
  MEAL: 'alt.foodAndDirnk',
  ENTERTAINMENT: 'alt.entertainment',
  SHOPPING: 'alt.shopping',
  AMENITY: 'alt.amenities',
  SEAT: 'alt.seat',
  LOUNGE: 'alt.lounge1',
  COMMA_SEPARETER: 'label.commaSeparater',
  DISPLAY_SEATMAP: 'reader.displaySeatmapNoFare',
};

/** 言語コード */
const LANG_CODE = {
  JA: 'ja',
  CN: 'cn',
  HK: 'hk',
  TW: 'tw',
  KO: 'ko',
};

/** サイトID */
const SITE_ID = 'ANA_TOUR';

/**
 * セグメント情報ContComponent
 */
@Component({
  selector: 'asw-flight-select-list-cont',
  templateUrl: './flight-select-list-cont.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlightSelectListContComponent implements OnInit, OnDestroy {
  /**
   * バウンド情報
   */
  @Input()
  public bound?: RoundtripFppItemBoundDetailsDataType;

  /**
   * セグメント情報
   */
  @Input()
  public segment?: Items11;

  /**
   * タイトル
   */
  @Input()
  public title?: string;

  /**
   * AirBound表示タイプ
   */
  @Input()
  public airBoundInfo?: Array<AirBounDisplayType>;

  /**
   * 他アプリケーションからの遷移
   */
  @Input()
  public transitionSource?: boolean;

  /**
   * Air Bound情報
   */
  @Input()
  public airBound?: RoundtripFppItemAirBoundsDataType;

  /**
   * 変更後旅程の国際線要否
   */
  @Input()
  public newItinerarInternationalFlightNecessity?: boolean;

  /**
   * ACV特性案内文言キーを取得するために使用される
   */
  @Input()
  public acvCabinClass?: string;

  /**
   * `id`属性
   * - デフォルト：自動生成uuid
   */
  @Input()
  public id = `${v4()}`;

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
   * 到着日付差
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
   * 当該セグメントが早発便
   */
  public isEarlyDepartureFlight?: boolean;

  /**
   * 当該セグメント到着時刻が遅延
   */
  public isDelayedArrivalFlight?: boolean;

  /**
   * 当該セグメント到着時刻が早発
   */
  public isEarlyDepartureArrivalFlight?: boolean;

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
   * 出発搭乗口
   */
  public departureGate?: string;

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
   * キャビンクラス
   */
  public cabin?: string;

  /**
   * ブッキングクラス
   */
  public bookingClass?: string;

  /**
   * シートマップの読み上げ用文言
   */
  public seatMapAriaLabel?: string;

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
   * Wi-Fiマーク
   */
  public wifiAvailableType?: string;

  /**
   * ACV特性案内文言キー
   */
  public acvMessageKey?: string;

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
    private _masterDataService: MasterDataService,
    private _translateSvc: TranslateService
  ) {
    this._translateSvc.onLangChange.subscribe(() => {
      this._getDynamicTranslateData();
      const lang = this._aswContextSvc.aswContextData.lang;
      this.duration = this._getFormatTime(this.segment?.duration);

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
    });
  }

  /**
   * 初期化処理
   */
  public ngOnInit() {
    // すべて共通データの処理
    this._setCommonData();
    // 部分共通データの処理
    this._setNonCommonData();
    // 多言語より表示の処理
    this._translateData();
    const acv = this.segment?.aircraftConfigurationVersion as string;
    // ACVに設定されたキャビンクラ
    this.cabin = this._masterDataService.getAcvCabin(acv, 'domestic');
  }

  /**
   * ngOnDestroy
   */
  public ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

  /**
   * 共通データの設定
   */
  private _setCommonData() {
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

    // 到着日付差
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

    // 当該セグメント到着時刻が早発
    if (this.arrivalEstimatedDateTime) {
      this.isEarlyDepartureArrivalFlight =
        new Date(this.arrivalDateTime as string) > new Date(this.arrivalEstimatedDateTime);
    } else {
      this.isEarlyDepartureArrivalFlight = false;
    }

    // 当該セグメント到着時刻が遅延
    if (this.arrivalEstimatedDateTime) {
      this.isDelayedArrivalFlight = new Date(this.arrivalDateTime as string) < new Date(this.arrivalEstimatedDateTime);
    } else {
      this.isDelayedArrivalFlight = false;
    }

    // 便名
    this.flightNumber = `${this.segment?.marketingAirlineCode}${this.segment?.marketingFlightNumber}`;

    // 機種コード
    this.aircraftCode = this.segment?.aircraftCode;
    this.aircraftLink = this._masterDataService.getModelLink(this.segment?.aircraftConfigurationVersion);
    if (this._aswContextSvc.aswContextData.deviceType === DeviceType.SMART_PHONE) {
      this.aircraftName = this.segment?.aircraftName;
    }
    if (this.segment?.isNhGroupOperated) {
      this.wifiAvailableType = this.segment?.wiFiType;
    }
    this._getDynamicTranslateData();
  }

  /**
   * 言語を切り替えるときに変更する必要があるデータを取得する
   */
  private _getDynamicTranslateData() {
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

    // 地点名称
    const stops: Array<string | number> = [];
    this.segment?.stops?.forEach((stop) => {
      const stopLocation = this._masterDataService.getAirportName(stop.locationCode, stop.locationName);
      stops?.push(stopLocation);
    });
    const commaSepareter = this._translateSvc.instant(MasterJsonKeyPrefix.STATIC + TRANSLATE_KEY.COMMA_SEPARETER);
    this.stops = stops.length >= 1 ? stops.join(commaSepareter) : '';
  }

  /**
   * 非共通データの設定
   */
  private _setNonCommonData() {
    // 出発日
    if (
      this.segment?.id !== this.firstSegmentId &&
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
  }

  /**
   * 多言語化(Q43)
   */
  private _translateData() {
    this._subscriptions.add(
      this._aswContextSvc
        .getAswContextByKey$(AswContextType.LANG)
        .pipe(take(1))
        .subscribe((lang) => {
          //  セグメント毎の飛行時間/フライト時間
          this.duration = this._getFormatTime(this.segment?.duration);
          // 深夜出発日時
          // ユーザ共通.言語情報=“ja”(日本語)
          if (lang === LANG_CODE.JA && this.segment?.isLateNightDeparture) {
            this.lateNightDepartureDateTime =
              this.departureEstimatedDateTime && this.segment.isNhGroupOperated
                ? this.departureEstimatedDateTime
                : this.departureDateTime;
          }
          this._changeDetectorRef.markForCheck();
        })
    );
  }

  /**
   * 日時フォーマット
   * @param duration 期間
   * @param lang 言語
   * @returns
   */
  private _getFormatTime(duration?: number): string {
    if (duration) {
      return getFormatHourTime(duration);
    }
    return '';
  }

  /**
   * 最初のセグメントID
   * @returns
   */
  private get firstSegmentId() {
    const segments = (this.bound as RoundtripFppItemBoundDetailsDataType).segments;
    return segments[0].id;
  }
}
