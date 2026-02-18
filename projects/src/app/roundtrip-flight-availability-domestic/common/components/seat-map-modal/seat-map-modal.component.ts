import { OverlayRef } from '@angular/cdk/overlay';
import { ChangeDetectionStrategy, Component, EventEmitter, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { BaseModalComponent, ModalType } from '../base-modal/base-modal.component';
import { Items11, RoundtripFppItemBoundDetailsDataType, RoundtripFppItemFareFamilyDataTypeInner } from '../../sdk';
import { isSameDay } from '../../helpers';
import { MasterDataService } from '../../services';
import { AirBounDisplayType, OperatingAirlineNameType, SeatMapInfo } from '../../interfaces';
import { TranslatePrefix } from '@conf/asw-master.config';
import { AppConstants } from '@conf/app.constants';
import { StaticMsgPipe } from '@lib/pipes';

/**
 * 運賃別シートマップ表示モーダルComponent
 */
@Component({
  selector: 'asw-seat-map-modal',
  templateUrl: './seat-map-modal.component.html',
  styleUrls: ['./seat-map-modal.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeatMapModalComponent {
  public appConstants = AppConstants;
  /**
   * overlayRef
   */
  public overlayRef?: OverlayRef;

  /**
   * タイトル
   */
  public title = 'label.seatMapTitle';

  /**
   * モーダル種別
   */
  public modalType: ModalType = '04';

  /**
   * 全Air Bound情報フィルタ後選択不可
   */
  public isAllUnableFareFamilyCodes?: Array<string>;

  /**
   * seatMapInfo情報
   */
  public seatMapInfo?: SeatMapInfo;

  /**
   * focus要素
   */
  public focusElement?: any;

  /**
   * FF情報
   */
  public fareFamilies?: Array<RoundtripFppItemFareFamilyDataTypeInner>;

  /**
   * FF情報
   */
  public fareFamily?: RoundtripFppItemFareFamilyDataTypeInner;

  /**
   * Travel Solution情報
   */
  public boundDetails?: RoundtripFppItemBoundDetailsDataType;

  /**
   * airBound情報
   */
  public airBound?: Array<AirBounDisplayType> | null;

  /**
   * 全ての日本国内線および日本発着国際線がスターアライアンス加盟キャリア運航
   */
  public isAllStarAllianceOperated?: boolean;

  @ViewChild(BaseModalComponent)
  public baseModal!: BaseModalComponent;

  @Output()
  public seatMap$: EventEmitter<{ segment: Items11; ffCode: string }> = new EventEmitter<{
    segment: Items11;
    ffCode: string;
  }>();

  constructor(private _masterDataService: MasterDataService, private _staticMsgPipe: StaticMsgPipe) {}

  /**
   * 最新時刻表示
   * @param dateTime 時刻
   * @param estimatedDateTime 最新時刻
   * @returns
   */
  public newTimeDisplay(dateTime?: string, estimatedDateTime?: string): boolean {
    if (dateTime && estimatedDateTime && isSameDay(dateTime, estimatedDateTime)) {
      // 時分フォーマットで表示
      return true;
    }
    // 月日＋時分フォーマットで表示
    return false;
  }

  /**
   * シートマップを開く
   * @param fareFamily FF情報
   */
  public openSeatMap(segment: Items11, ffCode: string) {
    this.seatMap$.emit({ segment: segment, ffCode: ffCode });
  }

  /**
   * FF名称を取得する
   * @param fareFamily 当該FF情報
   * @returns FF名称
   */
  public getFareFamilyName(fareFamily: RoundtripFppItemFareFamilyDataTypeInner): string {
    const prefix = 'm_ff_priority_code_i18n';
    return `${prefix}_${fareFamily.fareFamilyWithService.priorityCode}`;
  }

  /**
   *  空港名称を取得する
   * @param name 空港コードと名称
   * @returns 空港名称
   */
  public getLocationName(departure: any, arrival: any) {
    const departureLocation = this._masterDataService.getAirportName(departure.locationCode, departure.locationName);
    const arrivalLocation = this._masterDataService.getAirportName(arrival.locationCode, arrival.locationName);
    return `${departureLocation} - ${arrivalLocation}`;
  }

  /**
   * フライト番号
   * @returns
   */
  public getFlightNo(segment: Items11) {
    return `${segment?.marketingAirlineCode}${segment?.marketingFlightNumber}`;
  }

  /**
   * キャビンクラス名称キー
   * @param cabin キャビンクラス
   * @returns
   */
  public cabinKey(fareFamilyCode: string): string {
    return `${TranslatePrefix.LIST_DATA}PD_930_R-domestic-${
      this.airBound?.find((airBound) => airBound.fareFamilyCode === fareFamilyCode)?.cabin
    }`;
  }

  /**
   * 総金額
   * @returns
   */
  public total(fareFamilyCode: string): string {
    const airBound = this.airBound?.find((airBound) => airBound.fareFamilyCode === fareFamilyCode);
    const total = airBound?.airBound?.prices?.totalPrice?.price?.total;
    const currencyCode = airBound?.airBound?.prices?.totalPrice?.price?.currencyCode;
    return `${total}${currencyCode}`;
  }

  /**
   *  出発空港名称を取得する
   * @param name 出発空港コードと名称
   * @returns 出発空港名称
   */
  public getOperatingAirlineName(name: OperatingAirlineNameType) {
    return this._masterDataService.getInTimeCarrierName(name.operatingCode, name.operatingName);
  }

  /**
   * カンマで連結された運航キャリア名称
   */
  public get contactOperatingAirlinesName() {
    return this._masterDataService.contactOperatingAirlinesName(this.seatMapInfo?.operatingAirlinesArray);
  }
}
