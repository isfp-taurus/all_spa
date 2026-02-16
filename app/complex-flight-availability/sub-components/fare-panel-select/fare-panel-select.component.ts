import {
  Component,
  Input,
  EventEmitter,
  Output,
  AfterViewInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ViewChild,
  ElementRef,
  ViewChildren,
  QueryList,
  AfterViewChecked,
  OnChanges,
} from '@angular/core';
import { SupportComponent } from '@lib/components/support-class';
import { ComplexFmfFareFamily } from 'src/sdk-search/model/complexFmfFareFamily';
import { ComplexResponse } from 'src/sdk-search/model/complexResponse';
import { AswMasterService, CommonLibService } from '@lib/services';
import { MASTER_TABLE } from '@conf/asw-master.config';
import { CommonSliderComponent } from '@common/components/shopping/common-slider/common-slider.component';
import { PriorityCodeCacheList } from './fare-panel-select.state';

@Component({
  selector: 'asw-fare-panel-select',
  templateUrl: './fare-panel-select.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CommonSliderComponent],
})
export class FarePanelSelectComponent extends SupportComponent implements AfterViewInit, AfterViewChecked, OnChanges {
  @ViewChild('scrollPanel') scrollPanel?: ElementRef;
  @ViewChildren('scrollPanel') scrollPanelList?: QueryList<ElementRef>;
  @ViewChildren('scrollItemList') scrollItemList?: QueryList<ElementRef>;
  @ViewChild('modalContents') modalContents!: ElementRef; //一番外側のコンテンツに割り当てる

  // 帯色設定用配列
  public isEco: boolean[] = [];
  public isEcoPremium: boolean[] = [];
  public isBusiness: boolean[] = [];
  public isFirst: boolean[] = [];
  public isSelect: boolean[] = [];
  public cabinClassList?: string[];
  public fareFamilyCodeList: string[] = [];
  public familyCodeUrlList: string[] = [];
  public isFamilyCodeUrlList: boolean[] = [];
  public _complexFlightAvailability?: ComplexResponse;
  public fareFamilies?: ComplexFmfFareFamily[];

  /** 選択したインデックス */
  private _currentIndex: number = 0;

  public isScrollRight: boolean = false;
  public isScrollLeft: boolean = false;
  public isResizeEventStart = false;

  // 「TAB/SP」のflag
  @Input()
  isSp = false;

  /** 選択したインデックス */
  @Input()
  set currentIndex(index: number) {
    this._currentIndex = index;
    this.changeFarePanel(index);
  }
  get currentIndex(): number {
    return this._currentIndex;
  }

  @Input()
  set complexFlightAvailability(data: ComplexResponse | undefined) {
    this._complexFlightAvailability = data;
    this.fareFamilies = this.complexFlightAvailability?.data?.fareFamilies ?? [];
    this.isPanelHeadColor();
    this._setPriorityCode();
  }
  get complexFlightAvailability(): ComplexResponse | undefined {
    return this._complexFlightAvailability ? { ...this._complexFlightAvailability } : undefined;
  }

  @Input()
  public flightType?: string;

  // clicked callback
  @Output()
  returnToSelectStatus: EventEmitter<number> = new EventEmitter();

  constructor(
    protected _common: CommonLibService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _aswMasterSvc: AswMasterService,
    private _commonSliderComponent: CommonSliderComponent
  ) {
    super(_common);
  }

  /** 初期表示処理 */
  init() {}

  ngAfterViewInit() {
    this.resizeEventStart();
  }

  ngAfterViewChecked() {
    this.setScrollParam();
  }

  ngOnChanges() {
    this._commonSliderComponent.resetScroll();
  }

  /** 画面終了時処理 */
  destroy() {}

  /** 画面更新時処理 */
  reload() {}

  /** FF一覧の帯色設定 */
  private isPanelHeadColor() {
    this.resetPanelHeadColorList();
    this.fareFamilies &&
      this.fareFamilies.map((ff) => {
        this.isEco.push(ff.fareFamilyWithService?.cabin === 'eco');
        this.isEcoPremium.push(ff.fareFamilyWithService?.cabin === 'ecoPremium');
        this.isBusiness.push(ff.fareFamilyWithService?.cabin === 'business');
        this.isFirst.push(ff.fareFamilyWithService?.cabin === 'first');
      });
  }

  /** FF一覧の帯色設定用配列を空にする */
  private resetPanelHeadColorList() {
    this.isEco.length = 0;
    this.isEcoPremium.length = 0;
    this.isBusiness.length = 0;
    this.isFirst.length = 0;
  }

  /**
   * fareFamilyを選択
   * @param {number} fareFamilyIndex
   * @returns {void}
   */
  public changeFarePanel(fareFamilyIndex: number) {
    this.isSelect.map((_value, index, array) => {
      array[index] = false;
    });
    this.isSelect[fareFamilyIndex] = true;
    this.returnToSelectStatus.emit(fareFamilyIndex);
  }

  /** 各FF情報のpriorityCodeを設定とfareFamilyCodeのurlの設定 */
  private _setPriorityCode() {
    this.subscribeService(
      'ffPriorityCode',
      this._aswMasterSvc.load([MASTER_TABLE.FFPRIORITYCODE_I18NJOIN_BYFFPRIORITYCODE], true),
      ([priorityCodeCacheList]) => {
        this.deleteSubscription('ffPriorityCode');
        this._createPriorityList(priorityCodeCacheList as PriorityCodeCacheList);
      }
    );
  }

  /** 各種表示用リスト作成処理 */
  private _createPriorityList(priorityCodeCacheList: PriorityCodeCacheList) {
    this.fareFamilyCodeList = [];
    this.familyCodeUrlList = [];
    this.isFamilyCodeUrlList = [];

    this.fareFamilies?.forEach((fareFamily) => {
      let fareFamilyCode = '';
      let fareFamilyUrl = '';
      let isFareFamilyUrl = false;
      let priorityCode = fareFamily.fareFamilyWithService?.priorityCode?.toString() ?? '';
      priorityCodeCacheList?.[priorityCode]?.forEach((priorityCodeCache) => {
        if (this.flightType === 'domestic' && !!priorityCodeCache.domestic_ff_url) {
          isFareFamilyUrl = true;
          fareFamilyUrl = priorityCodeCache.domestic_ff_url;
        }
        fareFamilyCode = priorityCodeCache.m_ff_priority_code_i18n_key;
      });
      this.fareFamilyCodeList.push(fareFamilyCode);
      this.familyCodeUrlList.push(fareFamilyUrl);
      this.isFamilyCodeUrlList.push(isFareFamilyUrl);
    });
    this._changeDetectorRef.markForCheck();
  }

  /** 左側のスクロールボタン押下処理 */
  public scrollToLeft() {
    this._commonSliderComponent.scrollLeft();
    this.isScrollLeft = !this._commonSliderComponent.isLeftEnd;
    this.isScrollRight = !this._commonSliderComponent.isRightEnd;
  }

  /** 右側のスクロールボタン押下処理 */
  public scrollToRight() {
    this._commonSliderComponent.scrollRight();
    this.isScrollLeft = !this._commonSliderComponent.isLeftEnd;
    this.isScrollRight = !this._commonSliderComponent.isRightEnd;
  }

  /** commonSliderへの値設定 */
  private setScrollParam() {
    if (this._commonSliderComponent) {
      const contentWidth: number = this.modalContents ? this.modalContents.nativeElement.clientWidth : 0;
      const itemList = this.scrollItemList;
      this._commonSliderComponent.scrollPanel = this.scrollPanel;
      this._commonSliderComponent.scrollPanelList = this.scrollPanelList;
      this._commonSliderComponent.scrollItemList = itemList;
      this._commonSliderComponent.ffDataNum = itemList?.length ?? 0;
      this._commonSliderComponent.modalFFWidth = contentWidth;
      this._commonSliderComponent.isFFSlider = true;
    }
    this.isScroll();
  }

  /** スクロールボタンの表示・非表示処理 */
  private isScroll() {
    let panelAllWidth = 0;
    let scrollValue = 0;
    const contentWidth: number = this.modalContents ? this.modalContents.nativeElement.clientWidth : 0;
    const element: string = this.scrollPanel?.nativeElement.style.transform ?? '';

    const itemList = this.scrollItemList;
    itemList &&
      itemList.forEach((item, index, array) => {
        panelAllWidth += item.nativeElement.clientWidth;
        if (index !== array.length - 1) {
          panelAllWidth += 16;
        }
      });
    if (element && element.includes('translateX')) {
      const numStr = element.split('(')[1].split(')')[0].replace('px', '');
      scrollValue = Number(numStr);
    }
    this.isScrollRight = panelAllWidth + scrollValue > contentWidth;
    this.isScrollLeft = -scrollValue > 0;
  }

  /** 画面サイズ変更を検知 */
  public resizeEventStart(): void {
    if (this.modalContents && !this.isResizeEventStart) {
      this.resizeObserver.observe(this.modalContents.nativeElement);
      this.isResizeEventStart = true;
    }
  }

  /**
   * 対象のサイズが変化した際の更新処理
   */
  public resizeObserver = new ResizeObserver(() => {
    if (this.modalContents) {
      this.isScroll();
      this._changeDetectorRef.markForCheck();
    }
  });
}
