import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { isSameDay } from '../../../helpers';
import { AirBounDisplayType, OperatingAirlineNameType, OperatingAirlineType } from '../../../interfaces';
import { MasterDataService } from '../../../services';
import {
  Items11,
  RoundtripFppItemAirBoundsDataType,
  RoundtripFppItemBoundDetailsDataType,
  RoundtripFppRequestItinerariesInner,
} from '../../../../common/sdk';
import { TranslatePrefix } from '@conf/asw-master.config';
import { AppConstants } from '@conf/app.constants';

/**
 * 選択中TS・FF情報PresComponent
 */
@Component({
  selector: 'asw-flight-bound-selected-pres',
  templateUrl: './flight-bound-selected-pres.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlightBoundSelectedPresComponent {
  public appConstants = AppConstants;
  /**
   * Air Bound情報
   */
  @Input()
  public airBoundInfo?: RoundtripFppItemAirBoundsDataType | null;

  /**
   * 選択中TS・FF情報のAir Bound情報
   */
  @Input()
  public selectedAirBound?: RoundtripFppItemAirBoundsDataType | null;

  /**
   * Travel Solution情報
   */
  @Input()
  public boundDetails?: RoundtripFppItemBoundDetailsDataType | null;

  /**
   * 選択済みかどうか
   */
  @Input()
  public isSelected?: boolean;

  /**
   * 遅延情報
   */
  @Input()
  public isContainedDelayedFlight = false;

  /**
   * 早発情報
   */
  @Input()
  public isContainedEarlyDepartureFlight = false;

  /**
   * 出発地
   */
  @Input()
  public departureLocation?: string;

  /**
   * 出発地太字表示フラグ
   */
  @Input()
  public departureLocationEm?: boolean;

  /**
   * 到着地
   */
  @Input()
  public destinationLocation?: string;

  /**
   * 到着地太字表示フラグ
   */
  @Input()
  public destinationLocationEm?: boolean;

  /**
   * 出発時刻
   */
  @Input()
  public departureTime?: string;

  /**
   * 出発時刻(am/pm)
   */
  @Input()
  public departureTimeMeridian?: string;

  /**
   * 最新出発時刻
   */
  @Input()
  public departureTimeNew?: string;

  /**
   * 最新出発時刻(am/pm)
   */
  @Input()
  public departureTimeNewMeridian?: string;

  /**
   * 到着時刻
   */
  @Input()
  public destinationTime?: string;

  /**
   * 到着時刻(am/pm)
   */
  @Input()
  public destinationTimeMeridian?: string;

  /**
   * 最新到着時刻
   */
  @Input()
  public destinationTimeNew?: string;

  /**
   * 最新到着時刻(am/pm)
   */
  @Input()
  public destinationTimeNewMeridian?: string;

  /**
   * 深夜出発日時
   */
  @Input()
  public lateNightDepartureDate?: string;

  /**
   * 乗継回数
   */
  @Input()
  public numberOfConnection?: number;

  /**
   * 所要時間
   */
  @Input()
  public duration?: string;

  /**
   * 到着日付差
   */
  @Input()
  public arrivalDaysDifference?: number;

  /**
   * 赤字表示要否判定
   */
  @Input()
  public hasRedChar?: boolean;

  /**
   * 全ての日本国内線および日本発着国際線がNHグループ運航便
   */
  @Input()
  public isAllNhGroupOperated?: boolean;

  /**
   * 全ての日本国内線および日本発着国際線がスターアライアンス加盟キャリア運航
   */
  @Input()
  public isAllStarAllianceOperated?: boolean;

  /**
   * 運航キャリア名称
   */
  @Input()
  public operatingAirlinesArray?: Array<OperatingAirlineType>;

  /**
   * 運政府認可申請中情報
   */
  @Input()
  public isContainedPendingGovernmentApproval?: boolean;

  /**
   * Wi-Fiサービスアイコン
   */
  @Input()
  public wiFiType?: string;

  /**
   * ACVに応じたラベルもしくは画像
   */
  @Input()
  public acvMessageKeyList?: Array<string>;

  /**
   * 区間毎の情報
   */
  @Input()
  public boundInfo?: RoundtripFppRequestItinerariesInner[];

  /**
   * boundDetails選択済み
   */
  @Input()
  public isSelectedBoundDetails?: boolean;

  /**
   * 往復種別
   */
  @Input()
  public type?: 'out' | 'return';

  /**
   * AirBound表示タイプ
   */
  @Input()
  public airBoundInfos?: Array<AirBounDisplayType>;

  @Output()
  public selectFareFamily$: EventEmitter<void> = new EventEmitter<void>();

  @Output()
  public showOtherFlights$: EventEmitter<void> = new EventEmitter<void>();

  @Output()
  public openflightDetails$: EventEmitter<void> = new EventEmitter<void>();

  public wifiSomeAvailableAlt = 'alt.wifiSomeAvailable';

  constructor(private _masterDataService: MasterDataService) {}

  /**
   * FF選択表示ボタン押下
   */
  public selectFareFamily() {
    this.selectFareFamily$.emit();
  }

  /**
   * フライト再選択ボタン押下
   */
  public showOtherFlights() {
    this.showOtherFlights$.emit();
  }

  /**
   * フライト詳細ボタン押下
   */
  public openFlightDetails() {
    this.openflightDetails$.emit();
  }

  /**
   * 選択済みAirBoundかの判定
   * @returns
   */
  public get isSelectedAirBound(): boolean {
    return (
      !!this.airBoundInfo?.airBoundId &&
      !!this.selectedAirBound?.airBoundId &&
      this.airBoundInfo?.airBoundId === this.selectedAirBound?.airBoundId
    );
  }

  /**
   * フライト番号リスト
   * @returns
   */
  public get flightNoList(): string {
    const flightNoList: Array<string> = [];
    this.boundDetails?.segments.forEach((segment: Items11) => {
      flightNoList.push(`${segment.marketingAirlineCode}${segment.marketingFlightNumber}`);
    });
    return flightNoList.join(' ');
  }

  public getCabinKey(cabin: string): string {
    return `${TranslatePrefix.LIST_DATA}PD_930_R-domestic-${cabin}`;
  }

  /**
   * 金額
   * @returns
   */
  public get price() {
    return `${this.airBoundInfo?.airBound?.prices?.totalPrice?.price?.currencyCode}${this.airBoundInfo?.airBound?.prices?.totalPrice?.price?.total}`;
  }

  /**
   * 総金額
   * @returns
   */
  public get totalPrice() {
    return this.airBoundInfo?.airBound?.prices?.totalPrice;
  }

  public newTimeDisplay(dateTime?: string, estimatedDateTime?: string): boolean {
    if (dateTime && estimatedDateTime && isSameDay(dateTime, estimatedDateTime)) {
      //時分フォーマットで表示
      return true;
    }
    // 月日＋時分フォーマットで表示
    return false;
  }

  /**
   * 運航航空会社名を取得する
   * @param name 運航キャリアコードと名称
   * @returns 運航航空会社名
   */
  public getOperatingAirlineName(name: OperatingAirlineNameType) {
    return this._masterDataService.getInTimeCarrierName(name.operatingCode, name.operatingName);
  }

  /**
   * カンマで連結された運航キャリア名称
   */
  public get contactOperatingAirlinesName() {
    return this._masterDataService.contactOperatingAirlinesName(this.operatingAirlinesArray);
  }

  /** FF情報全て非活性表示の判定 */
  public get isAllFFDisabled(): boolean {
    return (
      this.airBoundInfos?.every((item) => {
        return item.isUnavailable;
      }) || false
    );
  }
}
