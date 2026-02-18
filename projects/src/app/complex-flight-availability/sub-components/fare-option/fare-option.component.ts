import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import {
  fareOptionCache,
  fareOptionCacheList,
} from '@app/complex-flight-availability/presenter/complex-flight-availability-pres.state';
import { MASTER_TABLE } from '@conf/asw-master.config';
import { SupportComponent } from '@lib/components/support-class';
import { AswMasterService, CommonLibService } from '@lib/services';
import { ComplexRequest } from 'src/sdk-search';
import { ShoppingLibService } from '@common/services';
import { FlightType } from '@common/components';

@Component({
  selector: 'asw-fare-option',
  templateUrl: './fare-option.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FareOptionComponent extends SupportComponent {
  /** 運賃オプション切り替えボタン押下 */
  @Output()
  public clickFareOptionTypeEvent = new EventEmitter<Event>();

  public _complexRequest?: ComplexRequest;
  @Input()
  set complexRequest(data: ComplexRequest | undefined) {
    this._complexRequest = data;
    if (this._flightType && this._complexRequest) {
      this.setFareOption(
        this._complexRequest.fare.cabinClass,
        this._flightType,
        this._complexRequest.fare.fareOptionType
      );
      this._isFareOptionList(this._flightType, this._complexRequest);
    }
  }
  get complexRequest(): ComplexRequest | undefined {
    return this._complexRequest;
  }

  public _flightType?: FlightType;
  @Input()
  set flightType(data: FlightType | undefined) {
    this._flightType = data;
    if (this._flightType && this._complexRequest) {
      this.setFareOption(
        this._complexRequest.fare.cabinClass,
        this._flightType,
        this._complexRequest.fare.fareOptionType
      );
      this._isFareOptionList(this._flightType, this._complexRequest);
    }
  }
  get flightType(): FlightType | undefined {
    return this._flightType;
  }

  public displayContent!: string;
  public isShowFareOption: boolean = false;

  /** コンストラクタ */
  constructor(
    protected _common: CommonLibService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _shoppingLibService: ShoppingLibService,
    private _aswMasterSvc: AswMasterService
  ) {
    super(_common);
  }

  /** 初期表示処理 */
  init() {}

  /** 画面終了時処理 */
  destroy() {}

  /** 画面更新時処理 */
  reload() {}

  /** 運賃オプション文言設定 */
  private async setFareOption(cabinClass: string, flightType: string, fareOptionType?: string) {
    const fareOptionCacheList: fareOptionCacheList = await this._aswMasterSvc.aswMaster[
      MASTER_TABLE.M_LIST_DATA_940.key
    ];
    const optionType = flightType === 'domestic' ? '2' : '1';
    const list = fareOptionCacheList?.[optionType]?.[cabinClass] ?? [];
    list.forEach((listData: fareOptionCache) => {
      if (listData.value === fareOptionType) {
        this.displayContent = listData.first_label;
      }
    });
    this._changeDetectorRef.markForCheck();
  }

  /** 運賃オプションボタン出し分け */
  private _isFareOptionList = (searchResultTripType: string, complexRequest: ComplexRequest) => {
    const fareOptionList =
      this._shoppingLibService.createFareOptionList(
        searchResultTripType === 'domestic' ? '2' : '1',
        complexRequest?.fare?.cabinClass ?? ''
      ) ?? [];
    this.isShowFareOption = Object.keys(fareOptionList).length >= 2;
  };

  /**
   * 運賃オプション切替ボタン押下
   */
  public fareOption(event: Event) {
    this.clickFareOptionTypeEvent.emit(event);
  }
}
