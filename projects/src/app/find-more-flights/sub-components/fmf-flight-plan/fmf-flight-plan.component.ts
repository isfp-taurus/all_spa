import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SupportComponent } from '@lib/components/support-class';
import { DateFormatPipe } from '@lib/pipes';
import { CommonLibService } from '@lib/services';
import { FindMoreFlightsService } from '@app/find-more-flights/container/find-more-flights.service';

@Component({
  selector: 'asw-fmf-flight-plan',
  templateUrl: './fmf-flight-plan.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DateFormatPipe],
})
export class FmFFlightPlanComponent extends SupportComponent {
  constructor(private _common: CommonLibService, private _findMoreFlightsService: FindMoreFlightsService) {
    super(_common);
  }

  /** 表示用出発地 */
  public departure: string = '';
  /** 表示用到着地 */
  public arrival: string = '';
  /** 往路出発地がマルチエアポート判定 */
  public departureMultiAirportFlg? = false;
  /** 往路到着地がマルチエアポート判定 */
  public arrivalMultiAirportFlg? = false;
  /** 所要時間*/
  private _durationTime: number | undefined;
  /** 転換後所要時間 */
  public formattedDurationTime: string = '';
  /** 対象外判定 */
  @Input()
  isUnavailable?: boolean;
  /** 出発地コード */
  @Input()
  originLocationCode?: string = '';
  /** 出発地名 */
  @Input()
  originLocationName?: string = '';
  /** 到着地コード */
  @Input()
  destinationLocationCode?: string = '';
  /** 到着地名 */
  @Input()
  destinationLocationName?: string = '';
  /** 出発時刻 */
  @Input()
  originDepartureDateTime?: string = '';
  /** 最新出発時刻 */
  @Input()
  originDepartureEstimatedDateTime?: string = '';
  /** 深夜出発判定 */
  @Input()
  isLateNightDeparture?: boolean;
  /** 操作中言語日本語フラグ */
  public isJa = false;
  /** 乗継回数 */
  @Input()
  numberOfConnections?: number = 0;
  /** 到着時刻 */
  @Input()
  destinationArrivalDateTime?: string = '';
  /** 最新到着時刻 */
  @Input()
  destinationArrivalEstimatedDateTime?: string = '';
  /** 区間 */
  @Input()
  currentBoundIndex: number = 0;
  @Input()
  public boundDepartureAirportCode?: string;
  /** バウンド到着地コード */
  @Input()
  public boundArrivalAirportCode?: string;

  reload(): void {}
  init(): void {
    this.departureMultiAirportFlg = this._findMoreFlightsService.isMultiAirport(this.boundDepartureAirportCode ?? '');
    this.arrivalMultiAirportFlg = this._findMoreFlightsService.isMultiAirport(this.boundArrivalAirportCode ?? '');
    const { lang } = this._common.aswContextStoreService.aswContextData;
    // 日本語フラグ判定
    this.isJa = Boolean(lang === 'ja');
    // 発着地
    this.departure = this._findMoreFlightsService.getAirportName(this.originLocationCode, this.originLocationName);
    // 到着地
    this.arrival = this._findMoreFlightsService.getAirportName(
      this.destinationLocationCode,
      this.destinationLocationName
    );
  }
  destroy(): void {}

  refresh(): void {}

  /** 所要時間 ミリ秒 */
  @Input()
  get durationTime() {
    return this._durationTime;
  }
  set durationTime(data: number | undefined) {
    this._durationTime = data;
    if (data === undefined) {
      this.formattedDurationTime = '';
    } else {
      const hours = ('00' + Math.floor(data / 3600)).slice(-2);
      const minutes = ('00' + Math.floor((data % 3600) / 60)).slice(-2);
      const seconds = ('00' + Math.floor(data % 60)).slice(-2);
      this.formattedDurationTime = hours + ':' + minutes + ':' + seconds;
    }
  }

  /** 出発/到着時刻、最新出発/到着時刻の比較 */
  public compareStringDate(DateTime: String, EstimatedDateTime: String) {
    // 日付(yyyy-MM-dd)が一致しない場合、true
    if (EstimatedDateTime && DateTime.substring(0, 10) !== EstimatedDateTime.substring(0, 10)) {
      return true;
    }
    return false;
  }
}
