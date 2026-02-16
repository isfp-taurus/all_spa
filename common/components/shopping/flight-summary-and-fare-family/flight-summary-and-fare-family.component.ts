import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { SupportComponent } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';
import {
  FlightSummary,
  SelectTSFFInfo,
  TSFFInfo,
  TSList,
} from '@app/roundtrip-flight-availability-international/presenter/roundtrip-flight-availability-international-pres.state';

interface OpenFlightDetailParam {
  boundIndex: number;
  flightSummaryIndex: number;
}

interface OpenFFSelectModalParam {
  boundIndex: number;
  tsList: TSList;
}

/**
 * 空席照会結果系画面 フライトサマリ+FF情報を表示する画面部品
 */
@Component({
  selector: 'asw-flight-summary-and-fare-family',
  templateUrl: './flight-summary-and-fare-family.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlightSummaryAndFareFamilyComponent extends SupportComponent implements AfterViewInit {
  // 復路の選択中のTS別FF情報のy軸位置取得のための変数
  @ViewChildren('selectedContainer') selectedContainer?: QueryList<ElementRef>;

  constructor(private _common: CommonLibService) {
    super(_common);
  }

  reload(): void {}
  init(): void {
    this.numPrice = Number(this.selectTSFFInfo?.price);
    this.numOriginalPrice = Number(this.selectTSFFInfo?.originalPrice);
    if (!this.isSelected) {
      // 未選択の場合、最安金額の情報を取得
      // Tealium連携用のId生成のため、インデックスを同時に取得
      this.lowestPriceTsffInfo = this.tsffInfos?.reduce((min, current, currentIndex) => {
        if (min.price && current.price) {
          if (min.price < current.price) {
            return min;
          } else {
            this._tsffIndex = currentIndex;
            return current;
          }
        } else if (min.price) {
          return min;
        } else if (current.price) {
          this._tsffIndex = currentIndex;
          return current;
        }
        return min;
      });
    } else {
      // 選択中のFFを特定してインデックスを取得
      this._tsffIndex =
        this.tsffInfos?.findIndex((info) => {
          info.fareFamilyCode === this.selectTSFFInfo?.fareFamilyCode;
        }) ?? 0;
    }

    // 仮選択されていた場合も青枠にする　※SP・TAB版
    this.tsffInfos?.forEach((tsffInfo) => {
      if (tsffInfo.isSelected) {
        this.isTmpSelected = true;
      }
    });
  }
  destroy(): void {}

  ngAfterViewInit(): void {
    if (this.selectedContainer) {
      // 復路の選択中のTS別FF情報のy軸位置を取得
      if (this.isSelected) {
        const firstElement = this.selectedContainer.first.nativeElement;
        const yPosition = firstElement.getBoundingClientRect().bottom;
        this.yPosition.emit(yPosition);
      }
    }
  }

  /** 金額 */
  public numPrice: number = 0;

  /** プロモーション適用前金額 */
  public numOriginalPrice: number = 0;

  /** フライト詳細の展開状態 */
  public isOpenFlightDetailMap: { [key: string]: boolean } = {};

  /** 仮選択　※SP・TAB版 */
  public isTmpSelected: boolean = false;

  /** 選択済み */
  @Input()
  isSelected: boolean = false;

  /** Tealium連携用Id設定フラグ */
  @Input()
  isTealiumAvailable: boolean = false;

  /** FF情報インデックス */
  private _tsffIndex: number = 0;

  /** 当該フライトサマリ情報 */
  @Input()
  public flightSummary: FlightSummary = {
    boundIndex: 0,
    travelSolutionId: '',
    isSelected: true,
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
  };

  /** 選択中TS・FF情報(選択済の場合) */
  @Input()
  public selectTSFFInfo?: SelectTSFFInfo;

  /** TSリスト情報 */
  @Input()
  public tsList?: TSList;

  /** TS・FF情報 */
  @Input()
  public tsffInfos?: Array<TSFFInfo>;

  /** TS・FF情報中最安金額の情報 */
  @Input()
  public lowestPriceTsffInfo?: TSFFInfo;

  /** バウンドインデックス */
  @Input()
  public boundIndex: number = 0;

  /** フライトサマリインデックス */
  @Input()
  public tsListIndex: number = 0;

  /** 通貨記号 */
  @Input()
  public currencySymbol: string = '';

  /** フライト詳細開閉フラグ */
  @Input()
  isOpenFlightDetail: boolean = false;

  /** フライト詳細アコーディオンを開閉するイベント */
  @Output()
  public changeOpenFlightDetailEvent: EventEmitter<OpenFlightDetailParam> = new EventEmitter<OpenFlightDetailParam>();

  /** フライト詳細モーダルを開くイベント */
  @Output()
  public openFlightDetailModalEvent: EventEmitter<OpenFlightDetailParam> = new EventEmitter<OpenFlightDetailParam>();

  /** FF選択モーダルを開くイベント */
  @Output()
  public openFareFamilySelectorModalEvent: EventEmitter<OpenFFSelectModalParam> =
    new EventEmitter<OpenFFSelectModalParam>();

  /** 復路の選択中のTS別FF情報のy軸位置 */
  @Output()
  public yPosition = new EventEmitter<number>();

  /**  フライト詳細リンク押下時イベント */
  public clickFlightDetailLink(boundIndex: number, tsListIndex: number) {
    const param: OpenFlightDetailParam = {
      boundIndex: boundIndex,
      flightSummaryIndex: tsListIndex,
    };
    this.openFlightDetailModalEvent.emit(param);
  }

  /** フライト詳細アコーディオンの開閉状態を反転する */
  public changeOpenFlightDetail(boundIndex: number, tsListIndex: number) {
    const param: OpenFlightDetailParam = {
      boundIndex: boundIndex,
      flightSummaryIndex: tsListIndex,
    };
    this.changeOpenFlightDetailEvent.emit(param);
  }

  /** 選択ボタン押下イベント */
  public clickSelectButton(boundIndex: number, tsList: TSList) {
    const param: OpenFFSelectModalParam = {
      boundIndex: boundIndex,
      tsList: tsList,
    };
    this.openFareFamilySelectorModalEvent.emit(param);
  }

  /** フライトサマリ部のTealium用Id取得 */
  public get tealiumSummaryId(): string {
    if (!this.isTealiumAvailable) {
      return '';
    }
    const bound = this.getTealiumBound();
    return `${bound}Ts${this.tsListIndex}`;
  }

  /** FFリスト部のTealium用Id取得 */
  public get tealiumFfId(): string {
    if (!this.isTealiumAvailable) {
      return '';
    }
    const bound = this.getTealiumBound();
    return `${bound}Ts${this.tsListIndex}Fare${this._tsffIndex}`;
  }

  /** Tealium連携用Idのバウンド部分取得 */
  private getTealiumBound(): string {
    return this.boundIndex === 0 ? 'outBound' : 'inBound';
  }
}
