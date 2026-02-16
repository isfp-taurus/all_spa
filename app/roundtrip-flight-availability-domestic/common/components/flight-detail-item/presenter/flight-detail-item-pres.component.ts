import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { isSameDay } from '@app/roundtrip-flight-availability-domestic/common/helpers';
import { AppConstants } from '@conf/app.constants';

/**
 * フライト詳細PresComponent
 */
@Component({
  selector: 'asw-flight-detail-item-pres',
  templateUrl: './flight-detail-item-pres.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlightDetailItemPresComponent {
  public appConstants = AppConstants;
  /**
   * 出発日
   */
  @Input()
  public departureDay?: string;

  /**
   * 出発時刻
   */
  @Input()
  public departureDateTime?: string;

  /**
   * 出発時刻 AM/PM
   */
  @Input()
  public departureDateTimeApm?: string;

  /**
   * 最新出発日時
   */
  @Input()
  public departureEstimatedDateTime?: string;

  /**
   * 最新出発日時 AM/PM
   */
  @Input()
  public departureEstimatedDateTimeApm?: string;

  /**
   * 到着時刻
   */
  @Input()
  public arrivalDateTime?: string;

  /**
   * 到着時刻 AM/PM
   */
  @Input()
  public arrivalDateTimeApm?: string;

  /**
   * 最新到着日時
   */
  @Input()
  public arrivalEstimatedDateTime?: string;

  /**
   * 最新到着日時 AM/PM
   */
  @Input()
  public arrivalEstimatedDateTimeApm?: string;

  /**
   * 当該セグメントの出発日と到着日の年月日単位の日数差
   */
  @Input()
  public arrivalDaysDifferenceByFlight?: number;

  /**
   * 最新到着日付差
   */
  @Input()
  public estimatedArrivalDaysDifferenceByFlight?: number;

  /**
   * NHグループ運航便かどうか
   */
  @Input()
  public lateNightDepartureDateTime?: string;

  /**
   * NHグループ運航便かどうか
   */
  @Input()
  public isNhGroupOperated?: boolean;

  /**
   * 当該セグメントが遅延便
   */
  @Input()
  public isDelayedFlight?: boolean;

  /**
   * 当該セグメントが遅延便
   */
  @Input()
  public isEarlyDepartureFlight?: boolean;

  /**
   * 出発地空港名称
   */
  @Input()
  public departureLocationName?: string;

  /**
   * 到着地空港名称
   */
  @Input()
  public arrivalLocationName?: string;

  /**
   * 出発ターミナル
   */
  @Input()
  public departureTerminal?: string;

  /**
   * 出発ロケーションコード
   */
  @Input()
  public departureLocationCode?: string;

  /**
   *  到着ターミナル
   */
  @Input()
  public arrivalTerminal?: string;

  /**
   * 到着ロケーションコード
   */
  @Input()
  public arrivalLocationCode?: string;

  /**
   * 便名
   */
  @Input()
  public flightNumber?: string;

  /**
   * 運航キャリア名称
   */
  @Input()
  public operatingAirlineName?: string;

  /**
   * 運航キャリアコード
   */
  @Input()
  public operatingAirlineCode?: string;

  /**
   * 運航キャリアURL
   */
  @Input()
  public operatingAirlineLink?: string;

  /**
   * 機種コード
   */
  @Input()
  public aircraftCode?: string;

  /**
   * 機種名
   */
  @Input()
  public aircraftName?: string;

  /**
   * 機種コードURL
   */
  @Input()
  public aircraftLink?: string;

  /**
   * キャビンクラスのキャビン
   */
  @Input()
  public cabin?: string;

  /**
   * 政府認可申請状況区分
   */
  @Input()
  public isSubjectToGovernmentApproval?: boolean;

  /**
   * 途中寄港地点情報
   */
  @Input()
  public stops?: string;

  /**
   * セグメント毎の飛行時間/フライト時間
   */
  @Input()
  public duration?: string;

  /**
   * ACV特性案内文言キー
   */
  @Input()
  public acvMessageKey?: string;

  /**
   * Wi-Fiサービスアイコン
   */
  @Input()
  public wifiAvailableType?: string;

  /**
   * 食事の種類
   */
  @Input()
  public mealCode?: string;

  public wifiAvailableAlt = 'alt.wifiAvailable';

  public wifiSomeAvailableAlt = 'alt.wifiSomeAvailable';

  public wifiNotAvailableAlt = 'alt.wifiNotAvailable';

  public newTimeDisplay(dateTime?: string, estimatedDateTime?: string): boolean {
    if (dateTime && estimatedDateTime && isSameDay(dateTime, estimatedDateTime)) {
      // 時分フォーマットで表示
      return true;
    }
    // 月日＋時分フォーマットで表示
    return false;
  }
}
