import {
  AfterViewChecked,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { SupportComponent } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';
import { Observable } from 'rxjs/internal/Observable';
import { fromEvent } from 'rxjs/internal/observable/fromEvent';
import { isSP, isTB } from '@lib/helpers/common/common.helper';
import { CabinClassSelectorModalService } from '../cabin-class-selector/cabin-class-selector-modal.service';
import { CabinClassSelectorOutput, CabinTypeOption } from '../cabin-class-selector/cabin-class-selector.state';
import { FareTypeSelectorModalService } from '../search-flight/fare-type-selector/fare-type-selector-modal.service';
import { SortConditionModalService } from '../sort-condition/sort-condition-modal.service';
import { FareTypeModalOutput, FareTypeOption } from '../search-flight/fare-type-selector/fare-type-selector.state';
import { SortCondition, SortConditionOutput, sortConditionValueMap } from '../sort-condition/sort-condition.state';
import { RoundtripFlightAvailabilityInternationalService } from '@common/services/roundtripFlightAvailabilityInternational/roundtripFlightAvailabilityInternational.service';
import { fareCabinClass } from '@common/interfaces/shopping/fareOption';
import lottie, { AnimationItem } from 'lottie-web';
import { iconJson } from './icon_json_data';
import { RoundtripFlightAvailabilityInternationalState } from '@common/store/roundtripFlightAvailabilityInternational';
import { CommonSliderComponent } from '../common-slider/common-slider.component';
import { ShoppingLibService } from '@common/services/shopping/shopping-lib/shopping-lib.service';
import { CabinClassOption } from '@common/components';

type DeviceType = 'PC' | 'SP' | 'TAB';
/**
 *
## コンポーネント名
検索結果操作部

## このコンポーネントを呼び出す機能
* 往復空席照会結果(国際)画面
* 複雑空席照会画面
* Find more Flights
※複雑カレンダーにも似たレイアウトでAdd to Favoriteの表示があるが、これはhtmlの構成が異なるので別パーツ

## 機能
### 1. ボタン表示
以下のボタンを表示する
表示/非表示は呼び出し元で設定する
* フィルタ条件表示ボタン
* ソート条件表示ボタン
* マトリクス形式7日間カレンダー表示ボタン
* キャビンクラス切替ボタン
* 運賃オプション切替ボタン
* お気に入り追加ボタン(右寄せ)

### 2. ボタン表示領域のスクロール
SP・TAB版表示の場合、ボタンを全て表示しない
左右にスクロールできるボタンを表示し、押下時に表示の切り替えを行う
画面幅のサイズはlib/helperで参照する
 *
 */
@Component({
  selector: 'asw-search-result-function',
  templateUrl: './search-result-function.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CommonSliderComponent],
})
export class SearchResultFunctionComponent extends SupportComponent implements AfterViewInit, AfterViewChecked {
  @ViewChild('scrollPanel') scrollPanel?: ElementRef;
  constructor(
    private _common: CommonLibService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _cabinClassSelectorModalService: CabinClassSelectorModalService,
    private _fareTypeSelectorModalService: FareTypeSelectorModalService,
    private _sortConditionModalService: SortConditionModalService,
    private _roundtripFlightAvailabilityInternationalService: RoundtripFlightAvailabilityInternationalService,
    private _commonSliderComponent: CommonSliderComponent,
    private _shoppingLibService: ShoppingLibService
  ) {
    super(_common);
    // 初回のカルーセル表示判定
    this.updateIsCarousel();
    // ソート条件の初期ラベルを設定
    this.labelSort = sortConditionValueMap.get(SortCondition.CPD_RANK)?.label ?? 'label.recommendedOrder';
  }

  reload(): void {}
  init(): void {
    this.getStoreInfo();
    this.getLoginStatus();
    //キャビンクラスを選択した後、キャビンクラスの表示ボタンのラベルを入れ替える
    const cabinType$ = this._cabinClassSelectorModalService.asObservableSubject();
    this.subscribeService('SearchResultFunctionComponent-cabinClass', cabinType$, (data: CabinClassSelectorOutput) => {
      if (data.cabinClassType !== null) {
        this._selectedCabinClass = data.cabinClassType;
        const cabinFiltered = this.cabinClassList.filter((v: { value: string | null }) => {
          let cabinClass = v.value;
          return cabinClass === this._selectedCabinClass;
        });
        if (cabinFiltered.length !== 0) {
          this.labelCabinClass = cabinFiltered[0].textContent;
          this._changeDetectorRef.markForCheck();
        }
        this.scrollToLeft();
        this.cabinClassApply$.emit(this._selectedCabinClass);
      }
    });

    //ソート条件を選択した後、ソート条件モーダルの表示ボタンのラベルを入れ替える
    const sortCondition$ = this._sortConditionModalService.asObservableSubject();
    this.subscribeService(
      'SearchResultFunctionComponent-sortCondition',
      sortCondition$,
      (data: SortConditionOutput) => {
        if (data.selectedSortCondition !== null) {
          const label = sortConditionValueMap.get(data.selectedSortCondition)?.label;
          if (label) {
            this.labelSort = label;
            this._changeDetectorRef.markForCheck();
          }
        }
      }
    );

    //運賃オプションを選択した後、運賃オプションモーダルの表示ラベルを入れ替える
    const fareTypeOption$ = this._fareTypeSelectorModalService.asObservableSubject();
    this.subscribeService(
      'SearchResultFunctionComponent-fareTypeOption',
      fareTypeOption$,
      (data: FareTypeModalOutput) => {
        if (data.selectedFareType !== null) {
          this._selectedFareOptionType = data.selectedFareType;
          this.getFareFiltered();
          this.scrollToLeft();
          this._changeDetectorRef.markForCheck();
        }
      }
    );

    // お気に入り登録状態の更新を取得
    this.subscribeService(
      'get isRegisterdFavoiteinit',
      this._roundtripFlightAvailabilityInternationalService.getRoundtripFlightAvailabilityInternationalObservable(),
      (data) => {
        this.isRegisteredFavorite = !!data.isRegisteredFavorite;
        this.isNotFavoriteAnimation = !!data.isNotFavoriteAnimation;
        if (this.isRegisteredFavorite && this.isNotFavoriteAnimation) {
          this.disabled = true;
        } else if (this.isRegisteredFavorite && !this.isNotFavoriteAnimation) {
          this.moveAnimation();
        }
      }
    );
  }

  destroy(): void {
    this.deleteSubscription('SearchResultFunctionComponent-cabinClass');
    this.deleteSubscription('SearchResultFunctionComponent-sortCondition');
    this.deleteSubscription('SearchResultFunctionComponent-fareTypeOption');
    this.deleteSubscription('get storeInfo');
    this.deleteSubscription('get isRegisterdFavoiteinit');
  }

  ngAfterViewInit(): void {
    this.controlScrollButtonDisplay();
    this.initFavoritIcon();
    if (
      this._roundtripFlightAvailabilityInternationalService.roundtripFlightAvailabilityInternationalData
        .isRegisteredFavorite &&
      !this._roundtripFlightAvailabilityInternationalService.roundtripFlightAvailabilityInternationalData
        .isNotFavoriteAnimation
    ) {
      this.moveAnimation();
    }
    if (this._commonSliderComponent) {
      this._commonSliderComponent.scrollPanel = this.scrollPanel;
      if (this.scrollPanel) {
        const scrollPanelRect = this.scrollPanel.nativeElement.getBoundingClientRect();
        this._commonSliderComponent.elementLeft = scrollPanelRect.left;
      }
    }

    //画面サイズ変更を監視し、変更の度に処理を実行する
    this.resize$ = fromEvent(window, 'resize');
    this.subscribeService('SearchResultFunctionComponent-resize', this.resize$, () => {
      this.updateIsCarousel();
      this.scrollToLeft();
      this.controlScrollButtonDisplay();
      this._changeDetectorRef.detectChanges();
    });
  }

  // cffリストに変更があった場合のみ、処理を実施
  public compereCffLength: number = 0;
  ngAfterViewChecked(): void {
    if (this.compereCffLength !== this._cffListLength) {
      this.compereCffLength = this._cffListLength;
      this.controlScrollButtonDisplay();
    }
  }
  private getDeviceTypeFromSize(): DeviceType {
    if (isSP()) {
      return 'SP';
    }
    if (isTB()) {
      return 'TAB';
    }
    return 'PC';
  }

  /**
   * 画面サイズを基にカルーセル部分の表示を変更する
   */
  private updateIsCarousel() {
    const device = this.getDeviceTypeFromSize();
    if (this.deviceTypeFromSize !== device) {
      this.deviceTypeFromSize = device;
      if (this.isCarousel === false && this.deviceTypeFromSize !== 'PC') {
        //表示にして再描画
        this.isCarousel = true;
        this._changeDetectorRef.markForCheck();
      } else if (this.isCarousel === true && this.deviceTypeFromSize === 'PC') {
        //非表示にして再描画
        this.isCarousel = false;
        this._changeDetectorRef.markForCheck();
      }
    }
  }

  /**
   * ログインステータスを判断する
   * ログインしていなければtrue
   */
  private getLoginStatus() {
    this.notLogin = this._common.isNotLogin();
  }

  /** 運賃オプションリスト */
  private _fareTypeOptionList: FareTypeOption[] = [];

  // 外部入出力
  /** フィルタ条件表示・非表示 */
  @Input()
  public isShowFilter: boolean = false;

  /** ソート条件表示・非表示 */
  @Input()
  public isShowSort: boolean = false;

  /** マトリクス形式7日間カレンダー表示・非表示 */
  @Input()
  public isShowCalendar: boolean = false;

  /** キャビンクラスモーダル　検索結果部の初期値設定 */
  @Input()
  public cabinClassOptionlist: CabinTypeOption[] = [];

  /** 選択済のキャビンクラス */
  public _selectedCabinClass: string = '';

  /** お気に入り追加アニメーションが不要か */
  public isNotFavoriteAnimation: boolean = false;

  @Input()
  get selectedCabinClass(): string {
    return this._selectedCabinClass;
  }
  set selectedCabinClass(value: string) {
    if (this._selectedCabinClass !== value) {
      this._selectedCabinClass = value;
    }
  }

  /** 選択済の運賃オプション */
  private _selectedFareOptionType: string = '';

  @Input()
  get selectedFareOptionType(): string {
    return this._selectedFareOptionType;
  }

  set selectedFareOptionType(value: string) {
    if (this._selectedFareOptionType !== value) {
      this._selectedFareOptionType = value;
      this.getFareFiltered();
    }
  }

  /** 運賃オプションリストの長さ */
  private _cffListLength: number = 0;

  @Input()
  get cffListLength(): number {
    return this._cffListLength;
  }

  set cffListLength(value: number) {
    if (this._cffListLength !== value) {
      this._cffListLength = value;
    }
  }

  /** 国内旅程か国際旅程か(国内旅程であればtrue) */
  private _isDomesticTrip: boolean = false;

  @Input()
  get isDomesticTrip(): boolean {
    return this._isDomesticTrip;
  }

  set isDomesticTrip(value: boolean) {
    if (this._isDomesticTrip !== value) {
      this._isDomesticTrip = value;
    }
  }

  /** 選択済の運賃オプションを画面に反映する */
  public getFareFiltered() {
    this._fareTypeOptionList = this._fareTypeSelectorModalService.createFareTypeOptionList(
      this._selectedCabinClass,
      this._isDomesticTrip
    );
    const fareFiltered = this._fareTypeOptionList.filter((v: { value: string | null }) => {
      return v.value === this._selectedFareOptionType;
    });
    if (fareFiltered.length !== 0) {
      this.labelFareType = fareFiltered[0].fareType;
    } else {
      this.labelFareType = this._fareTypeOptionList[0].fareType;
    }
  }

  // 検索結果操作部スクロールボタン(左)の表示判定に使用する（true: 表示  false: 非表示）
  public isDisplayLeftScrollButton: boolean = false;

  // 検索結果操作部スクロールボタン(右)の表示判定に使用する（true: 表示  false: 非表示）
  public isDisplayRightScrollButton: boolean = false;

  /** 現在のスクロール位置を取得して、スクロールボタンの表示・非表示を制御する */
  public controlScrollButtonDisplay() {
    const element = this.scrollPanel?.nativeElement;

    // 左からのスクロール位置
    const scrollPosition = element?.scrollLeft;

    // 検索結果操作部の可視部分の横幅
    const clientWidth = element?.clientWidth;

    // 検索結果操作部全体の横幅
    const scrollWidth = element?.scrollWidth;

    this.updateIsDisplayScroolButton(scrollPosition, clientWidth, scrollWidth);
    this._changeDetectorRef.detectChanges();
  }

  private updateIsDisplayScroolButton(scrollPosition?: number, clientWidth?: number, scrollWidth?: number) {
    // 引数である3つの要素が全てundefined出ないときに処理を実施
    if (typeof scrollPosition === 'number' && typeof clientWidth === 'number' && typeof scrollWidth === 'number') {
      // 検索結果操作部スクロールボタン(左)の表示判定
      if (scrollPosition > 0) {
        this.isDisplayLeftScrollButton = true;
      } else {
        this.isDisplayLeftScrollButton = false;
      }

      // 検索結果操作部スクロールボタン(右)の表示判定
      if (scrollPosition < scrollWidth - clientWidth) {
        this.isDisplayRightScrollButton = true;
      } else {
        this.isDisplayRightScrollButton = false;
      }
    }
  }

  scrollToLeft() {
    if (this.scrollPanel) {
      const scrollPanel = this.scrollPanel.nativeElement;
      // スクロール実行
      scrollPanel.style.transform = `translateX(0px)`;
      this.isDisplayLeftScrollButton = false;
      this.isDisplayRightScrollButton = true;
    }
  }

  scrollToRight() {
    const element = this.scrollPanel?.nativeElement;

    if (typeof element?.clientWidth === 'number' && typeof element?.scrollWidth === 'number' && this.scrollPanel) {
      const scroll = element.scrollWidth - element.clientWidth;
      // スクロール処理
      element.style.transform = `translateX(${-scroll}px)`;
      this.isDisplayLeftScrollButton = true;
      this.isDisplayRightScrollButton = false;
    }
  }

  // 往復かどうか
  public isRoundtrip: boolean = false;
  // お気に入り登録済み
  public isRegisteredFavorite: boolean = false;
  // 選択中CFFリスト
  public cffList: fareCabinClass = {};
  // 検索結果種別
  public searchResultItineraryType: string = '';
  // 運賃オプション
  public fareOption: string = '';
  // キャビンクラス
  public cabinClass: string = '';
  // ソート条件
  public sortCondition: string = '';
  /** 指定日検索結果有無 */
  public isSearchResultOfSpecifiedDate: boolean = false;
  // 検索種別
  public presentSearchResultItineraryType: string = '';
  // ソート条件
  public presentSortCondition: string = '';
  // 画面初期表示時のキャビンクラスのラベル設定が終わっているか否か(true: 完了。false：未完了)
  public isSettingCabinClass: boolean = false;
  // 画面初期表示時の運賃オプションのラベル設定が終わっているか否か(true: 完了。false：未完了)
  public isSettingFareOption: boolean = false;

  // お気に入り追加ボタンの連打防止用変数
  public isPushRegisteredFavoriteButton: boolean = true;

  /**
   * 検索結果操作部で必要なStore情報を取得
   */
  public getStoreInfo() {
    const storeInfo =
      this._roundtripFlightAvailabilityInternationalService.getRoundtripFlightAvailabilityInternationalObservable();
    this.subscribeService('get storeInfo', storeInfo, (data) => {
      this.isRoundtrip = !!data.isRoundtrip;
      this.isRegisteredFavorite = !!data.isRegisteredFavorite;
      this.cffList = data.cffList ?? {};
      this.searchResultItineraryType = data.searchResultItineraryType ?? '';
      this.fareOption = data.fareOption ?? '';
      this.cabinClass = data.cabinClass ?? '';
      this.sortCondition = data.sortTerms ?? '';
      this.isSearchResultOfSpecifiedDate = data.isSearchResultOfSpecifiedDate ?? false;
      if (this.searchResultItineraryType !== this.presentSearchResultItineraryType) {
        //キャビンクラスリストを再取得する
        const isJapanOnly = this.searchResultItineraryType === 'domestic';
        this.cabinClassList = this._shoppingLibService.getCabinList(isJapanOnly);
        this.presentSearchResultItineraryType = this.searchResultItineraryType;
      }
      if (this.sortCondition !== this.presentSortCondition) {
        this.updateSortCondition(this.sortCondition);
        // ソート条件ラベルを更新する
        this.presentSortCondition = this.sortCondition;
      }
      //画面初期表示時、キャビンクラスのラベル設定、subscribe関数内のため、繰り返し実施しないようにフラグを設定
      if (this.cabinClass !== '' && !this.isSettingCabinClass) {
        this._selectedCabinClass = this.cabinClass;
        const cabinFiltered = this.cabinClassList.filter((v: { value: string | null }) => {
          let cabinClass = v.value;
          return cabinClass === this._selectedCabinClass;
        });
        if (cabinFiltered.length !== 0) {
          this.labelCabinClass = cabinFiltered[0].textContent;
          this.isSettingCabinClass = true;
        }
      }

      //画面初期表示時、運賃オプションのラベル設定
      if (this.fareOption !== '' && !this.isSettingFareOption) {
        this._selectedFareOptionType = this.fareOption;
        this.getFareFiltered();
        this.isSettingFareOption = true;
      }
      this._changeDetectorRef.markForCheck();
    });
  }

  public isMixedCabin: boolean = false;
  /**
   * お気に入り登録済みか否かの情報を取得
   * お気に入り登録済みであればtrue
   */
  public getIsMixedCabin() {
    const requestInfo =
      this._roundtripFlightAvailabilityInternationalService.roundtripFlightAvailabilityInternationalData
        .roundtripOwdRequest;
    this.isMixedCabin = !!requestInfo?.fare.isMixedCabin;
    return this.isMixedCabin;
  }

  private updateSortCondition(sortCondition: string) {
    if (sortCondition === 'recommendedOrder') {
      this.updateLabelSort(SortCondition.CPD_RANK);
    }

    if (sortCondition === 'departureTimeOrder') {
      this.updateLabelSort(SortCondition.DEPARTURE_TIME);
    }

    if (sortCondition === 'arrivalTimeOrder') {
      this.updateLabelSort(SortCondition.ARRIVAL_TIME);
    }

    if (sortCondition === 'flightdurationOrder') {
      this.updateLabelSort(SortCondition.DURATION);
    }
  }

  private updateLabelSort(sortCondition: number) {
    let label = sortConditionValueMap.get(sortCondition)?.label;
    if (label) {
      this.labelSort = label;
    }
    this._changeDetectorRef.markForCheck();
  }

  private _animationAddToFavorite?: AnimationItem;

  /** 連打防止用 */
  public disabled: boolean = false;

  @ViewChild('animationPoint') animationPoint?: ElementRef;
  /**
   * アニメーション用初期処理
   */
  public initFavoritIcon() {
    const iconAddToFavoriteStage = this.animationPoint;
    if (iconAddToFavoriteStage?.nativeElement) {
      this._animationAddToFavorite = lottie.loadAnimation({
        container: iconAddToFavoriteStage.nativeElement,
        renderer: 'svg',
        loop: false,
        autoplay: false,
        animationData: iconJson,
      });
    }
  }

  /**
   * お気に入り追加ボタン押下
   */
  public clickFavorite(event: Event): void {
    if (this.isPushRegisteredFavoriteButton) {
      this.isPushRegisteredFavoriteButton = false;
      event.preventDefault();
      // 往復空席照会結果(国際)画面(R01-P030)のお気に入り追加ボタン押下時処理を行う。
      if (!this.isRegisteredFavorite) {
        this.addToFavirote(event);
      } else {
        this.moveAnimation();
      }
    }
  }

  public moveAnimation(): void {
    // animation
    const openClass = 'is-added';
    const btn = this.animationPoint;
    if (btn && !btn.nativeElement.classList.contains(openClass)) {
      btn.nativeElement.classList.add(openClass);
      this._animationAddToFavorite && this._animationAddToFavorite.playSegments([0, 200], true);
    }

    this._animationAddToFavorite?.addEventListener('complete', () => {
      this.disabled = true;
      this._changeDetectorRef.detectChanges();
    });
  }

  /** お気に入り追加ボタン 値指定なしの場合非表示 値ありかつPC版の場合表示 */
  @Input()
  public isShowFavorite: boolean = false;

  /** フィルタボタン押下 */
  @Output()
  public clickFilterEvent = new EventEmitter<Event>();

  /** ソートボタン押下 */
  @Output()
  public clickSortEvent = new EventEmitter<Event>();

  /** マトリクス形式7日間カレンダーボタン押下 */
  @Output()
  public clickCalendarEvent = new EventEmitter<Event>();

  /** キャビンクラス切り替えボタン押下 */
  @Output()
  public clickCabinClassEvent = new EventEmitter<Event>();

  /** 運賃オプション切り替えボタン押下 */
  @Output()
  public clickFareOptionTypeEvent = new EventEmitter<Event>();

  /** お気に入り追加ボタン押下 */
  @Output()
  public clickFavoriteEvent = new EventEmitter<Event>();

  /** キャビンクラスの適用ボタン押下 */
  @Output()
  cabinClassApply$ = new EventEmitter<string>();

  /** ウィンドウサイズの変更を監視するObservable */
  private resize$?: Observable<Event>;

  /** 端末種別 画面サイズで判定 */
  public deviceTypeFromSize: DeviceType = 'PC';

  /** カルーセル表示フラグ SP・TABの時true */
  public isCarousel: boolean = false;

  /** ログインステータス 未ログインの時true */
  public notLogin: boolean = true;

  // ボタンに表示するラベル
  /** フィルターボタン */
  public labelFilter?: string;

  /** ソートボタン */
  public labelSort: string;

  /** カレンダーボタン */
  public labelCalendar?: string;

  /** キャビンクラスボタン */
  public labelCabinClass?: string;

  /** 運賃オプションボタン */
  public labelFareType?: string;

  // 読み上げ文言
  /** カルーセルタイトル */
  public labelAltCarouselTitle?: string;

  /** 汎用データリスト キャビンクラス */
  public cabinClassList: Array<CabinClassOption> = [];

  public clickItemFilter(event: Event) {
    this.clickFilterEvent.emit(event);
  }

  public clickItemSort(event: Event) {
    this.clickSortEvent.emit(event);
  }

  public clickItemCalendar(event: Event) {
    this.clickCalendarEvent.emit(event);
  }

  public clickItemCabinClass(event: Event) {
    this.clickCabinClassEvent.emit(event);
  }

  public clickItemFareOptionType(event: Event) {
    this.clickFareOptionTypeEvent.emit(event);

    const setData: RoundtripFlightAvailabilityInternationalState = {};
    // 最安運賃を選択する必要があるかどうかに、false
    setData.isSelectLowestFare = true;
    // 検索条件に、テンポラリの検索条件
    this._roundtripFlightAvailabilityInternationalService.updateRoundtripFlightAvailabilityInternational(setData);
  }

  public addToFavirote(event: Event) {
    this.clickFavoriteEvent.emit(event);
  }
}
