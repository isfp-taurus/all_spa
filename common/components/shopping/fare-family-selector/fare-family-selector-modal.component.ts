import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, ViewChild } from '@angular/core';
import { SupportModalBlockComponent } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';
import { Subject } from 'rxjs/internal/Subject';
import { FareFamilySelectorOutput } from './fare-family-selector-modal.state';
import { Flights } from '@common/interfaces/shopping/roundtrip-owd/response/data/airOffers/flights';
import { FlightSummary } from 'src/app/roundtrip-flight-availability-international//presenter/roundtrip-flight-availability-international-pres.state';
import { Type9 } from 'src/sdk-search';
import { CommonSliderComponent } from '../common-slider/common-slider.component';
import { fareFamiliesInfo } from '@common/components/shopping/fare-family-selector/fare-family-selector-modal-item/fare-family-selector-modal-item.state';
import { Bounds } from '@common/interfaces/shopping/roundtrip-owd';
import { UpgradeDetailInforParam } from '../fare-family-selector-modal-rule/fare-family-selector-modal-rule.state';
import { FlightUpgradeInfo } from '@common/interfaces';

@Component({
  selector: 'asw-fare-family-selector-modal',
  templateUrl: './fare-family-selector-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CommonSliderComponent],
})
export class FareFamilySelectorModalComponent extends SupportModalBlockComponent implements AfterViewInit {
  /** FF選択一覧スクロールの要素を取得する変数 */
  @ViewChild('scrollPanel') scrollPanel?: ElementRef;

  constructor(private _common: CommonLibService, private _commonSliderComponent: CommonSliderComponent) {
    super(_common);
  }

  // FF選択一覧スクロールの有無
  public isFFModalSlider: boolean = true;
  // 右スクロールボタン押下時
  public isRightClicked: boolean = false;
  // 右スクロールボタンの表示形式
  public hideRightBtn: boolean = false;
  // 左スクロールボタンの表示形式
  public hideLeftBtn: boolean = false;

  public _subject!: Subject<FareFamilySelectorOutput>;

  /** プロモーション適用有無 */
  public isPromotionApplied: boolean = true;

  // フライトサマリ部分 オブジェクト
  public settingFlightSummary: FlightSummary = {
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

  /** FF情報 オブジェクトリスト */
  public fareFamiliesInfoList: fareFamiliesInfo[] = [];
  // セグメント情報リスト(TravelSolution配下のflights)
  public travelSolutionsFlightsList: Type9[] = [];
  // FF毎のセグメント関連情報リスト(AirOffer配下のflights)
  public airOffersFlightsList: Flights[][] = [];
  /** FF毎の当該bound.flights ※AirOffer配下のBounds */
  public airOfferBounds: Bounds[] = [];
  // ANAカウチ利用可否フライトIndexリスト
  public anaCouchIsEnabledFlightIndexList: number[] = [];

  public upgradeDetailInforParam: UpgradeDetailInforParam = {};

  /** 当該バウンドアップグレード情報マップ */
  public upgradeInfo: FlightUpgradeInfo[] = [];

  public travelSolutionIndex: number = 0;

  /** ヘッダー色判定用リスト */
  public tripTypeList: string[] = [];

  reload(): void {}

  init(): void {
    this.isPromotionApplied = this.payload.isPromotionApplied;
    this.settingFlightSummary = this.payload.flightSummary;
    this.fareFamiliesInfoList = this.payload.fareFamiliesInfoList;
    this.travelSolutionsFlightsList = this.payload.travelSolutionsFlightsList;
    this.airOffersFlightsList = this.payload.airOffersFlightsList;
    this.upgradeInfo = this.payload.upgradeInfo;
    this.airOfferBounds = this.payload.airOfferBounds;
    this.anaCouchIsEnabledFlightIndexList = this.payload.anaCouchIsEnabledFlightIndexList;
    this._subject = this.payload.subject;
    this.travelSolutionIndex = this.payload.travelSolutionIndex;
    this.tripTypeList = this.payload.tripTypeList;
  }

  destroy(): void {}

  override ngAfterViewInit(): void {
    if (this._commonSliderComponent) {
      this._commonSliderComponent.scrollPanel = this.scrollPanel;
      this._commonSliderComponent.isFFModalSlider = this.isFFModalSlider;
      this._commonSliderComponent.modalFFWidth = this.modalContents ? this.modalContents.nativeElement.clientWidth : 0;

      this.rightSliderNumber();

      // モーダルが表示された際のスクロールボタンの表示非表示
      this.initDisplayScrollBtn();
    }
    // モーダル内部品の高さを再設定して、スクロールに対応させる
    this.resize();
  }

  private initDisplayScrollBtn() {
    // モーダルが表示された際のスクロールボタンの表示非表示
    this._commonSliderComponent.ffDataNum = this.fareFamiliesInfoList!.length;
    const scrollItemList: ElementRef[] = this._commonSliderComponent.scrollItemList
      ? this._commonSliderComponent.scrollItemList.toArray()
      : [];
    var clientWidth = scrollItemList[0].nativeElement.clientWidth + 1;
    let btnFlg =
      0 >
      this._commonSliderComponent.modalFFWidth -
        (clientWidth * this.fareFamiliesInfoList!.length + 16 * this.fareFamiliesInfoList!.length);

    if (1 < this.fareFamiliesInfoList.findIndex((ff) => ff.isSelected)) {
      this._commonSliderComponent.isLeftEnd = btnFlg;
      this.availableLeftBtn(this._commonSliderComponent.isLeftEnd);
    }
    if (1 > this.fareFamiliesInfoList.findIndex((ff) => ff.isSelected)) {
      this._commonSliderComponent.isRightEnd = btnFlg;
      this.availableRightBtn(this._commonSliderComponent.isRightEnd);
    }
  }

  /**
   * モーダル内の部品イベントでモーダルを閉じる
   */
  public closeModal() {
    this.close();
  }

  public clickFareFamilySelectButton(boundIndex: number, travelSolutionId: string, fareFamilyCode: string) {
    // 選択した番号を返す
    this._subject.next({
      boundIndex: boundIndex,
      travelSolutionId: travelSolutionId,
      fareFamilyCode: fareFamilyCode,
    });

    this.closeModal();
  }

  /**
   * スクロール左方向クリック
   */
  public leftSlider() {
    if (this.scrollPanel) {
      // 共通のスクロール処理へ
      this._commonSliderComponent.scrollLeft();

      this.availableLeftBtn(!this._commonSliderComponent.isLeftEnd);
      this.availableRightBtn(!this._commonSliderComponent.isRightEnd);
    }
  }

  /**
   * スクロール右方向クリック
   */
  public rightSlider() {
    if (this.scrollPanel) {
      // FF情報リスト数を取得
      this._commonSliderComponent.ffDataNum = this.fareFamiliesInfoList!.length;

      // 共通のスクロール処理へ
      this._commonSliderComponent.scrollRight();

      this.availableLeftBtn(!this._commonSliderComponent.isLeftEnd);
      this.availableRightBtn(!this._commonSliderComponent.isRightEnd);
    }
  }

  private rightSliderNumber() {
    var fareFmilieIndex = this.fareFamiliesInfoList.findIndex((ff) => ff.isSelected);

    if (fareFmilieIndex > 0) {
      // FF数
      this._commonSliderComponent.ffDataNum = this.fareFamiliesInfoList!.length;
      const scrollItemList: ElementRef[] = this._commonSliderComponent.scrollItemList
        ? this._commonSliderComponent.scrollItemList.toArray()
        : [];
      // 1FF幅
      var clientWidth = scrollItemList[0].nativeElement.clientWidth;
      // 表示可能FF数
      var ffDisplayNum = Math.floor(this._commonSliderComponent.modalFFWidth / (clientWidth + 20));
      // スクロール箇所
      var scrollFFIndex = fareFmilieIndex;
      if (fareFmilieIndex > this._commonSliderComponent.ffDataNum - ffDisplayNum) {
        scrollFFIndex = this._commonSliderComponent.ffDataNum - ffDisplayNum;
      }
      this._commonSliderComponent.scroll(-((clientWidth + 16) * scrollFFIndex + 16 * scrollFFIndex));

      this.availableLeftBtn(true);
      this.availableRightBtn(!this._commonSliderComponent.isRightEnd);
    }
  }

  private availableLeftBtn(available: boolean) {
    const elementLeft = document.getElementById('fare-family-scroll-left-btn');
    if (available) {
      elementLeft?.classList.add('is-available');
    } else {
      elementLeft?.classList.remove('is-available');
    }
  }

  private availableRightBtn(available: boolean) {
    const elementRight = document.getElementById('fare-family-scroll-right-btn');
    if (available) {
      elementRight?.classList.add('is-available');
    } else {
      elementRight?.classList.remove('is-available');
    }
  }

  /**
   * アップグレード詳細情報リンク押下時処理の値を親に渡す
   * @param event リンクの活性非活性と画面情報
   */
  public changeLinkDisabled(event: UpgradeDetailInforParam) {
    this.upgradeDetailInforParam = event;
  }

  /**
   * TS別FF情報(FFリスト)-FF選択モーダル用のTealium連携Id(ffSelectXxBoundTs0Fare0)を生成
   * @param boundIndex バウンドのインデックス(0: 往路、1: 復路)
   * @param ffHeaderIndex FFヘッダのインデックス
   * @param travelSolutionIndex TS(=フライトサマリ)のインデックス
   */
  public getTealiumTSFFModalListId(boundIndex: number, travelSolutionIndex: number, ffHeaderIndex: number): string {
    const bound = boundIndex === 0 ? 'OutBound' : 'InBound';
    return `ffSelect${bound}Ts${travelSolutionIndex}Fare${ffHeaderIndex}`;
  }
}
