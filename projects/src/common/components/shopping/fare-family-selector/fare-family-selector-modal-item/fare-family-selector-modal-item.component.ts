import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  QueryList,
  Renderer2,
  ViewChildren,
} from '@angular/core';
import { SupportComponent } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';
import { Flights } from '@common/interfaces/shopping/roundtrip-owd/response/data/airOffers/flights';
import { Type9 } from 'src/sdk-search/model/type9';
import { Bounds } from '@common/interfaces/shopping/roundtrip-owd';
import { fareFamiliesInfo } from '@common/components/shopping/fare-family-selector/fare-family-selector-modal-item/fare-family-selector-modal-item.state';
import { CommonSliderComponent } from '../../common-slider/common-slider.component';
import { QuotaType } from '@common/interfaces/shopping/quota-type';
import { UpgradeDetailInforParam } from '../../fare-family-selector-modal-rule/fare-family-selector-modal-rule.state';
import { FlightUpgradeInfo } from '@common/interfaces';

/**
 * FF選択モーダル
 * FF情報の画面部品
 */
@Component({
  selector: 'asw-fare-family-selector-modal-item',
  templateUrl: './fare-family-selector-modal-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FareFamilySelectorModalItemComponent extends SupportComponent implements AfterViewInit {
  /** セグメント情報(TravelSolution配下のflight) */
  public _travelSolutionsFlightsList: Type9[] = [];
  /** セグメント関連情報リ(AirOffer配下のBounds.flight) */
  public _airOffersFlightsList: Flights[] = [];
  /** 当該bound.flights ※AirOffer配下のBounds */
  public _airOfferBounds: Bounds = {};
  /** ANAカウチ利用可否フライトIndexリスト */
  public _anaCouchIsEnabledFlightIndexList: number[] = [];
  /** 当該バウンドアップグレード情報マップ */
  public _upgradeInfo: FlightUpgradeInfo[] = [];

  /** 当部品のスライド番号 */
  @Input()
  public slideNum: number = 0;
  /** 全体のスライド番号 */
  @Input()
  public slideMax: number = 0;

  /** FF情報 オブジェクト */
  @Input()
  public fareFamiliesInfo: fareFamiliesInfo = {
    /** キャビンクラス毎にスタイル指定するためのclassサフィックス */
    headingItemSuffix: '',
    /** 選択済み */
    isSelected: false,
    /** (国際)変更前とセグメント数、販売キャリアコード、便番号、出発日、出発地、到着地、Fare basisが一致する場合true */
    isCurrent: false,
    /** キャビンクラス */
    cabinClassName: '',
    /** fareFamilyCode */
    fareFamilyCode: '',
    /** FF名称 */
    fareFamilyName: '',
    /** 通貨記号 */
    currencySymbol: '',
    /** 金額(プロモーション適用ありの場合、割引後金額) */
    price: 0,
    /** 金額(プロモーション適用ありの場合、割引前金額) */
    originalPrice: 0,
    /** 残席数 */
    quota: 0,
    /** 残席種別 */
    quotaType: QuotaType.ENOUGH,
    /** プロモーション適用済 */
    isPromotionApplied: false,
    /** 最安支払い総額である */
    isLowestPrice: false,
    /** 運賃変更案内　表示可否 */
    faresChangeInformation: false,
    /** 支払総額以降表示可否 */
    notDisplayAirOffer: false,
    /** FFルール */
    fareFamiliesRule: {
      /** 予約変更可否 */
      itineraryPermit: '',
      /** 払戻可否 */
      refundPermit: '',
      /** 無料預け入れ手荷物 返却有無 */
      isReceivedFreeBaggagePcs: false,
      /** 無料預け入れ手荷物個数 */
      freeBaggagePcs: 0,
      /** 無料機内持ち込み手荷物 返却有無 */
      isReceivedCarryOnBaggage: false,
      /** 無料機内持ち込み手荷物個数 */
      carryOnBaggage: 0,
      /** 事前追加手荷物申し込み可・不可 */
      isFirstBaggagePermitted: false,
    },
    /** アップグレード情報 */
    upgradeInfo: [{}],
  };

  /** セグメント情報(TravelSolution配下のflight) */
  @Input()
  set travelSolutionsFlightsList(tsFlightList: Type9[]) {
    this._travelSolutionsFlightsList = tsFlightList;
  }
  get travelSolutionsFlightsList() {
    return this._travelSolutionsFlightsList;
  }

  /** セグメント関連情報リ(AirOffer配下のBounds.flight) */
  @Input()
  set airOffersFlightsList(aoFlightList: Flights[]) {
    this._airOffersFlightsList = aoFlightList;
  }
  get airOffersFlightsList() {
    return this._airOffersFlightsList;
  }

  /** 当該bound.flights ※AirOffer配下のBounds */
  @Input()
  set airOfferBounds(airOfferBounds: Bounds) {
    this._airOfferBounds = airOfferBounds;
  }
  get airOfferBounds() {
    return this._airOfferBounds;
  }

  /** ANAカウチ利用可否フライトIndexリスト */
  @Input()
  set anaCouchIsEnabledFlightIndexList(anaCouchIndexList: number[]) {
    this._anaCouchIsEnabledFlightIndexList = anaCouchIndexList;
  }
  get anaCouchIsEnabledFlightIndexList() {
    return this._anaCouchIsEnabledFlightIndexList;
  }

  @Input()
  set upgradeInfo(upgradeInfo: FlightUpgradeInfo[]) {
    this._upgradeInfo = upgradeInfo;
  }
  get upgradeInfo() {
    return this._upgradeInfo;
  }

  @Input()
  public upgradeDetailInforParam: UpgradeDetailInforParam = {};

  @Input()
  public boundIndex: number = 0;

  @Input()
  public tripTypeList: string[] = [];

  @Output()
  public changeAllUpgradeLink = new EventEmitter<UpgradeDetailInforParam>();

  /** FF選択ボタン押下時発火 */
  @Output()
  public clickSelectEvent: EventEmitter<Event> = new EventEmitter<Event>();

  /**  縦サイズ 他のFF情報部品と高さを合わせるため外部入力 */
  /**  縦サイズを合わせるためのFF部品 */
  @ViewChildren('fixHeight') fixHeight!: ElementRef[];

  /** FF選択一覧スクロールの要素を取得する変数 */
  @ViewChildren('scrollItemList') scrollItemList?: QueryList<ElementRef>;

  /** FF情報部品（金額や空席等が記載されている箇所）の高さ */
  public height1Max = 0;
  /** FF情報部品（FFルールが記載されている箇所）の高さ */
  public height2Max = 0;

  constructor(
    private _common: CommonLibService,
    private _commonSliderComponent: CommonSliderComponent,
    private _renderer: Renderer2
  ) {
    super(_common);
  }

  reload(): void {}

  init(): void {}

  destroy(): void {
    this.deleteSubscription('TableSliderComponentResize');
  }

  ngAfterViewInit(): void {
    if (this._commonSliderComponent) {
      this._commonSliderComponent.scrollItemList = this.scrollItemList;
    }
    const lastfarePanelHeadElement = document.getElementById(`p-fare-panel__head-${this.slideMax - 1}`);
    if (lastfarePanelHeadElement) {
      this.alignFarePanel('p-fare-panel__head-', this.height1Max);
    }

    const lastfarePanelBodyElement = document.getElementById(`p-fare-panel__body-${this.slideMax - 1}`);
    if (lastfarePanelBodyElement) {
      this.alignFarePanel('p-fare-panel__body-', this.height2Max);
    }
  }

  /** FF選択ボタン押下時イベント */
  public clickSelectButton(event: Event) {
    this.clickSelectEvent.emit(event);
  }

  /**
   * アップグレード詳細情報リンク押下時処理の値を親に渡す
   * @param event リンクの活性非活性と画面情報
   */
  public changeLinkDisabled(event: UpgradeDetailInforParam) {
    this.changeAllUpgradeLink.emit(event);
  }

  /** FF情報部品の高さをそろえる */
  private alignFarePanel(id: string, height: number) {
    const htmlElementArray: HTMLElement[] = [];
    for (let i = 0; i < this.slideMax; i++) {
      const element = document.getElementById(`${id}${i}`);
      if (element) {
        htmlElementArray.push(element);
      }
    }

    for (let i = 0; i < htmlElementArray.length; i++) {
      const element = htmlElementArray[i];
      if (element.offsetHeight > height) {
        height = element.offsetHeight;
      }
    }

    htmlElementArray.forEach((el) => {
      this._renderer.setStyle(el, 'height', `${height}px`);
    });
  }
}
