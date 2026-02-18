import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { SupportComponent } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';
import { DateFormatPipe, StaticMsgPipe } from '@lib/pipes';
import { isTB, isSP } from '@lib/helpers';
import { FlightSummary } from '@app/roundtrip-flight-availability-international/presenter/roundtrip-flight-availability-international-pres.state';

type DeviceType = 'PC' | 'SP' | 'TAB';

interface OpenFlightDetailParam {
  boundIndex: number;
  tsListIndex: number;
}

@Component({
  selector: 'asw-flight-plan',
  templateUrl: './flight-plan.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DateFormatPipe],
})
export class FlightPlanComponent extends SupportComponent {
  constructor(
    private _common: CommonLibService,
    private _dateFormatPipe: DateFormatPipe,
    private _staticMsgPipe: StaticMsgPipe
  ) {
    super(_common);
    this.originDepartureDateTimeIsSameDayFlag = false;
    this.destinationArrivalDateTimeIsSameDayFlag = false;
  }

  reload(): void {}
  init(): void {
    // 出発日付と到着日付が同一日かどうか判定処理
    const startDateEx = new Date(this.flightSummary.originDepartureDateTime);
    const startDate = this.flightSummary.originDepartureEstimatedDateTime
      ? new Date(this.flightSummary.originDepartureEstimatedDateTime)
      : undefined;
    if (
      startDateEx.getFullYear() === startDate?.getFullYear() &&
      startDateEx.getMonth() === startDate?.getMonth() &&
      startDateEx.getDate() === startDate.getDate()
    ) {
      this.originDepartureDateTimeIsSameDayFlag = true;
    } else {
      this.originDepartureDateTimeIsSameDayFlag = false;
    }
    const endDateEx = new Date(this.flightSummary.destinationArrivalDateTime);
    const endDate = this.flightSummary.destinationArrivalEstimatedDateTime
      ? new Date(this.flightSummary.destinationArrivalEstimatedDateTime)
      : undefined;
    if (
      endDateEx.getFullYear() === endDate?.getFullYear() &&
      endDateEx.getMonth() === endDate?.getMonth() &&
      endDateEx.getDate() === endDate.getDate()
    ) {
      this.destinationArrivalDateTimeIsSameDayFlag = true;
    } else {
      this.destinationArrivalDateTimeIsSameDayFlag = false;
    }
    // 区切り文字の取得
    const travelersDivider = this._staticMsgPipe.transform('label.separaterComma');
    // 運航キャリア名称のリスト数分処理
    this.flightSummary?.operatingAirlineNameList?.forEach((operatingAirlineNameInfo, index) => {
      let delimiter = travelersDivider;
      // 最後は区切り文字入れない
      if (index >= this.flightSummary?.operatingAirlineNameList?.length - 1) {
        delimiter = '';
      }
      // 「URL|名称」なので|で分割
      let airLineInfo = operatingAirlineNameInfo.split('|');
      // 表示する運航キャリア名称のHTML作成
      this.operatingAirlineName += this.createOperatingAirlineName(airLineInfo, delimiter);
    });
  }
  destroy(): void {}

  /**
   * 表示する運航キャリア名称のHTML作成
   * @param airLineInfo 表示データ
   * @param delimiter 区切り文字
   * @returns
   */
  private createOperatingAirlineName(airLineInfo: string[], delimiter: string): string {
    // URLが存在する場合
    if (airLineInfo[0]) {
      return `<a class="custom-text01__airlineText--link" href="${airLineInfo[0]}" target="_blank" id="flight-plan-operatingAirlineUrl_${this.flightSummary.boundIndex}">${airLineInfo[1]}</a>${delimiter}`;
    } else {
      // URLが存在しない場合
      return `<span class="custom-text01__airlineText">${airLineInfo[1]}${delimiter}</span>`;
    }
  }

  /** 現在の画面サイズから端末種別を取得する */
  private getDeviceTypeFromSize(): DeviceType {
    if (isSP()) {
      return 'SP';
    } else if (isTB()) {
      return 'TAB';
    } else {
      return 'PC';
    }
  }

  /** 端末種別 */
  public deviceType: DeviceType = this.getDeviceTypeFromSize();

  // 出発時刻と最新出発時刻は同一日であるかどうかフラグ
  public originDepartureDateTimeIsSameDayFlag: boolean;

  // 到着時刻と最新到着時刻は同一日であるかどうかフラグ
  public destinationArrivalDateTimeIsSameDayFlag: boolean;

  // 運航キャリアURL
  public operatingAirlineUrl: string = '';

  // 運航キャリア名称
  public operatingAirlineName: string = '';

  /** 選択済み */
  @Input()
  isSelected!: boolean;

  /** 当該フライトサマリ情報 */
  @Input()
  public flightSummary: FlightSummary = {
    boundIndex: 0,
    travelSolutionId: '',
    isSelected: false,
    departureAirport: '',
    arrivalAirport: '',
    isContainedDelayedFlight: false,
    isContainedEarlyDepartureFlight: false,
    originDepartureDateTime: '',
    originDepartureEstimatedDateTime: '',
    isLateNightDeparture: false,
    numberOfConnections: 0,
    durationTime: '',
    destinationArrivalDateTime: '',
    destinationArrivalEstimatedDateTime: '',
    destinationArrivalDaysDifference: '',
    isAllNhGroupOperated: false,
    isAllStarAllianceOperated: false,
    operatingAirlineNameList: [],
    isContainedSubjectToGovernmentApproval: false,
    labelFromAcvList: [],
    wifiType: undefined,
    lowestPrice: 0,
    departureMultiAirportFlg: false,
    arrivalMultiAirportFlg: false,
    notShowServiceTitle: false,
  };

  /** バウンドインデックス */
  @Input()
  boundIndex: number = 0;

  /** フライトサマリインデックス */
  @Input()
  tsListIndex: number = 0;

  /** フライト詳細開閉フラグ */
  @Input()
  isOpenFlightDetail: boolean = false;

  /** フライト詳細開閉リンク表示かどうかフラグ */
  @Input()
  isDisplayDetailLink?: boolean = true;

  /**
   * 政府認可申請中情報を表示するか
   * デフォルト値: true(表示する)
   */
  @Input()
  isShowGovernmentApproval: boolean = true;

  /**
   * ACVに応じたラベル又は画像を表示するか
   * デフォルト値: true(表示する)
   */
  @Input()
  isShowLabelFromAcv: boolean = true;

  /**
   * Wi-Fiサービスを表示するか
   * デフォルト値: true(表示する)
   */
  @Input()
  isShowWiFiService: boolean = true;

  /** フライト詳細アコーディオンを開閉するイベント */
  @Output()
  public changeOpenFlightDetailEvent: EventEmitter<OpenFlightDetailParam> = new EventEmitter<OpenFlightDetailParam>();

  /** フライト詳細モーダルを開くイベント */
  @Output()
  public openFlightDetailModalEvent: EventEmitter<OpenFlightDetailParam> = new EventEmitter<OpenFlightDetailParam>();

  /** フライト詳細リンクを押下時に親コンポーネントに返すイベント */
  @Output()
  public clickFlightDetailEvent: EventEmitter<Event> = new EventEmitter<Event>();

  // 深夜出発日時フォーマット
  public lateNightDepartureFormat(time: string) {
    return this._dateFormatPipe.transform(time, 'default_departuredate.midnightTime', true);
  }

  /** フライト詳細アコーディオンの開閉状態を反転する */
  public changeOpenFlightDetail(boundIndex: number, tsListIndex: number) {
    const param: OpenFlightDetailParam = {
      boundIndex: boundIndex,
      tsListIndex: tsListIndex,
    };
    this.changeOpenFlightDetailEvent.emit(param);
  }

  /**  フライト詳細リンク押下時イベント */
  public clickFlightDetailLink(boundIndex: number, tsListIndex: number) {
    const param: OpenFlightDetailParam = {
      boundIndex: boundIndex,
      tsListIndex: tsListIndex,
    };
    this.openFlightDetailModalEvent.emit(param);
  }

  /** 出発/到着時刻、最新出発/到着時刻の比較 */
  public compareStringDate(DateTime: String, EstimatedDateTime: String) {
    // 日付(yyyy-MM-dd)が一致しない場合、true
    if (EstimatedDateTime && DateTime.substring(0, 10) !== EstimatedDateTime.substring(0, 10)) {
      return true;
    }

    return false;
  }

  /**
   * 時間、時刻の日付文字列
   *
   * @param data 時間/時刻
   * @returns
   */
  public dateString(data: string | undefined): string {
    const date = Number(data);
    const hours = String(Math.trunc(date / 3600)).padStart(2, '0');
    const min = String(Math.trunc((date % 3600) / 60)).padStart(2, '0');
    return hours + ':' + min;
  }
}
