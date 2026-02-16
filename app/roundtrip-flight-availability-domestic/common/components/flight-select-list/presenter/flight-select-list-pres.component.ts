import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { isSameDay } from '../../../helpers';
import { AppConstants } from '@conf/app.constants';

/**
 * セグメント情報PresComponent
 */
@Component({
  selector: 'asw-flight-select-list-pres',
  templateUrl: './flight-select-list-pres.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlightSelectListPresComponent {
  public appConstants = AppConstants;
  /**
   * `id`属性
   */
  @Input()
  public id?: string;

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
   * 当該セグメントが早発便
   */
  @Input()
  public isEarlyDepartureFlight?: boolean;

  /**
   * 当該セグメント到着時刻が遅延
   */
  @Input()
  public isDelayedArrivalFlight?: boolean;

  /**
   * 当該セグメント到着時刻が早発
   */
  @Input()
  public isEarlyDepartureArrivalFlight?: boolean;

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
   * 出発搭乗口
   */
  @Input()
  public departureGate?: string;

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
   * キャビンクラス
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
   * Wi-Fiマーク
   */
  @Input()
  public wifiAvailableType?: string;

  /**
   * ACV特性案内文言キー
   */
  @Input()
  public acvMessageKey?: string;

  /**
   * 食事の種類
   */
  @Input()
  public mealCode?: string;

  /**
   * 機能画面ID
   */
  @Input()
  public funcPageId?: string;

  public wifiSomeAvailableAlt = 'alt.wifiSomeAvailable';

  constructor(private translateSvc: TranslateService) {}

  /**
   * 時刻フォーマット
   * @param dateTime 時刻
   * @param estimatedDateTime 最新時刻
   * @returns
   */
  public newTimeDisplay(dateTime?: string, estimatedDateTime?: string): boolean {
    if (dateTime && estimatedDateTime && isSameDay(dateTime, estimatedDateTime)) {
      return true;
    }
    return false;
  }
}
