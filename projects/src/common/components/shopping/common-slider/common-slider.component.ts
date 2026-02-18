import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ContentChildren,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  QueryList,
} from '@angular/core';
import { CommonLibService } from '@lib/services';
import { SupportComponent } from '@lib/components/support-class';
import { isPC, isSP, isTB } from '@lib/helpers';
import { fromEvent, throttleTime } from 'rxjs';
/**
 * slider用部品
 * 埋め込まれた#scrollPanelを検知してスクロール処理を行う
 *
 * @param isAutoSliderValue 画面ごとのスライダー量の調整を自動で行うか否か　デフォルトtrue
 * @param isAirCalendarSlider 7日間カレンダースクロール有無
 * @param isCCMSlider マトリクスカレンダースクロール有無
 * @param isFFSlider FF選択一覧スクロール有無
 * @param isFFModalSlider FF選択モーダルスクロール有無
 * @param sliderValue スクロール量外部から指定する
 * @param isRightEnd 最右端
 * @param isLeftEnd 最左端

 */
@Component({
  selector: 'asw-common-slider',
  templateUrl: './common-slider.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommonSliderComponent extends SupportComponent implements AfterViewInit {
  constructor(private _common: CommonLibService, public change: ChangeDetectorRef) {
    super(_common);
  }
  reload(): void {}
  init(): void {}
  destroy(): void {}

  //親コンポーネントが埋め込むHTMLに以下を指定
  @ContentChild('scrollPanel') scrollPanel?: ElementRef;
  @ContentChildren('scrollPanel') scrollPanelList?: QueryList<ElementRef>;
  @ContentChildren('scrollItemList') scrollItemList?: QueryList<ElementRef>;

  // 最右端
  public isRightEnd = false;
  // 最左端
  public isLeftEnd = false;
  // 左スクロールボタンの押下
  public ClickedLeftBtn = false;
  // 右スクロールボタンの押下
  public ClickedRightBtn = false;
  // 指定要素のLeft値
  public elementLeft = 0;
  // FFモーダルのサイズ
  public modalFFWidth = 0;
  // FF情報数
  public ffDataNum = 0;

  public isResizeEventStart = false;

  @Input()
  id = this.constructor.name;

  @Input()
  isAutoSliderValue = true;

  @Input()
  isAirCalendarSlider = false;

  @Input()
  isCCMSlider = false;

  @Input()
  isFFSlider = false;

  @Input()
  isFFModalSlider = false;

  @Input()
  set sliderValue(value: number) {
    if (this._sliderValue != value) {
      this._sliderValue = value;
      this.resetScroll();
    }
  }
  get sliderValue(): number {
    return this._sliderValue;
  }
  public _sliderValue: number = 0;

  private _maxScroll = 100;
  set maxScroll(value: number) {
    this._maxScroll = value;
    this.maxScrollChange.emit(value);
  }
  get maxScroll() {
    return this._maxScroll;
  }
  @Output()
  maxScrollChange = new EventEmitter<number>();

  // 画面サイズによって初回設定のスライド量を調整
  public resizeEvent = () => {
    if (isPC()) {
      this.sliderValue = 130;
    }
    if (isTB()) {
      this.sliderValue = 105;
    }
    if (isSP()) {
      this.sliderValue = 90;
    }
  };

  /**
   * 画面描画後処理
   */
  ngAfterViewInit(): void {
    if (this.isAutoSliderValue) {
      this.subscribeService(
        'TableSliderComponentResize',
        fromEvent(window, 'resize').pipe(throttleTime(100)),
        this.resizeEvent
      );
      this.resizeEvent(); //初回設定
    }
    this.resizeEventStart();
  }

  /**
   * 対象のサイズが変化した際の更新処理を起動 ngAfterViewInitでうまくいかないときは外部呼出し用としても使用
   */
  public resizeEventStart(): void {
    if (this.scrollPanel && !this.isResizeEventStart) {
      this.resizeObserver.observe(this.scrollPanel.nativeElement);
      this.isResizeEventStart = true;
    }
  }

  /**
   * 対象のサイズが変化した際の更新処理
   */
  public resizeObserver = new ResizeObserver(() => {
    if (this.scrollPanel) {
      this.maxScroll =
        (this.scrollPanel.nativeElement.scrollWidth ?? 0) - (this.scrollPanel.nativeElement.clientWidth ?? 0);
    }
  });

  /**
   * スクロール幅の設定
   */
  private scrollWidth() {
    if (this.scrollPanel) {
      const scrollItemList: ElementRef[] = this.scrollItemList ? this.scrollItemList.toArray() : [];
      const clientWidth = scrollItemList[0].nativeElement.clientWidth;

      // 7日間カレンダースクロールの幅の取得
      this.getAirCalendarSliderWidth(scrollItemList, clientWidth);

      // マトリクス形式7日間カレンダースクロールの幅の取得
      this.getCCMSliderWidth(scrollItemList, clientWidth);

      // FF選択一覧スクロールの幅の取得
      this.getFFSliderWidth(scrollItemList);
    }
  }

  /**
   * 画面に表示されている日付の個数を取得
   * @param scrollItemList
   * @returns
   */
  private getDaysCount(scrollItemList: ElementRef[]) {
    // 表示個数
    let daysCount = 0;
    // 表示幅
    let displayWidth = 0;

    for (let index = 0; index < scrollItemList.length; index++) {
      displayWidth += scrollItemList[0].nativeElement.clientWidth;

      if (displayWidth <= window.innerWidth - this.elementLeft) {
        daysCount += 1;
      } else {
        break;
      }
    }

    return daysCount;
  }

  /**
   * 7日間カレンダースクロールの幅の取得
   * @param scrollItemList
   * @param clientWidth
   */
  private getAirCalendarSliderWidth(scrollItemList: ElementRef[], clientWidth: number) {
    const elementLeft = Math.floor(this.elementLeft);
    if (this.isAirCalendarSlider) {
      // 画面に表示されている日付の個数を取得
      const daysCount = this.getDaysCount(scrollItemList);

      if (isTB()) {
        this._sliderValue = clientWidth - elementLeft;
      }
      if (isSP()) {
        this._sliderValue = clientWidth * (daysCount - 1) + elementLeft;
      }
    }
  }

  /**
   * マトリクス形式7日間カレンダースクロールの幅の取得
   * @param scrollItemList
   * @param clientWidth
   */
  private getCCMSliderWidth(scrollItemList: ElementRef[], clientWidth: number) {
    if (this.isCCMSlider) {
      // 画面に表示されている日付の個数を取得
      const daysCount = this.getDaysCount(scrollItemList);

      if (isTB()) {
        this._sliderValue = clientWidth;
      }
      if (isSP()) {
        this._sliderValue = clientWidth * daysCount;
      }
    }
  }

  /**
   * FF選択一覧スクロールの幅の取得
   * @param scrollItemList
   */
  private getFFSliderWidth(scrollItemList: ElementRef[]) {
    if (this.isFFSlider || this.isFFModalSlider) {
      const windowsWidth = window.document.body.clientWidth;
      scrollItemList.forEach((item) => {
        const clientWidth = item.nativeElement.clientWidth;
        const gapWidth = 16 * Math.floor(this.modalFFWidth / clientWidth);

        // 表示されている幅の数分スクロールする
        if (this.isFFModalSlider && windowsWidth >= 768) {
          this._sliderValue = clientWidth * Math.floor(this.modalFFWidth / clientWidth) + gapWidth + 8;
        } else {
          this._sliderValue = clientWidth * Math.floor(this.modalFFWidth / clientWidth) + gapWidth;
        }
      });
    }
  }

  /**
   * スクロール左方向クリック
   */
  public scrollLeft(boundIndex?: number) {
    this.scrollWidth();
    this.scroll(this.sliderValue, boundIndex);
  }

  /*
   * スクロール右方向クリック
   */
  public scrollRight(boundIndex?: number) {
    this.scrollWidth();
    this.scroll(-this.sliderValue, boundIndex);
  }

  /**
   * 指定量スクロールする
   * @param sliderValue スクロール量 px
   */
  public scroll(sliderValue: number, boundIndex?: number) {
    if (this.scrollPanel) {
      const scrollPanel = this.scrollPanel.nativeElement;
      const currentTransForm = this.getCurrentTransForm(scrollPanel);
      const newTransForm = currentTransForm + sliderValue;

      // スクロール可能な最大値
      const maxTransForm = 0;

      // 最大値と最小値の範囲に制限
      let transform = 0;
      transform = Math.min(sliderValue, Math.min(maxTransForm, newTransForm));

      // マトリクス形式7日間カレンダー(SP)のスクロール量調整
      if (this.isCCMSlider) {
        if (isSP() && -scrollPanel.clientWidth > transform + sliderValue) {
          transform = transform - sliderValue - this.maxScroll;
        }
      }

      // FF選択の場合
      if (this.isFFSlider || this.isFFModalSlider) {
        const scrollItemList: ElementRef[] = this.scrollItemList ? this.scrollItemList.toArray() : [];
        const clientWidth = scrollItemList[0].nativeElement.clientWidth;
        const windowsWidth = window.document.body.clientWidth;
        var ffDisplayNum = Math.floor(this.modalFFWidth / (clientWidth + 16));
        if (
          this.ffDataNum > ffDisplayNum &&
          Math.abs(transform) > this.ffDataNum * 300 + this.ffDataNum * 16 - (ffDisplayNum * 300 + ffDisplayNum * 16)
        ) {
          this.isFFModalSlider && windowsWidth >= 768
            ? (transform = -(this.ffDataNum * 300 + this.ffDataNum * 16 - (ffDisplayNum * 300 + ffDisplayNum * 16) + 8))
            : (transform = -(this.ffDataNum * 300 + this.ffDataNum * 16 - (ffDisplayNum * 300 + ffDisplayNum * 16)));
        }
      }

      // スクロール実行
      scrollPanel.style.transform = `translateX(${transform}px)`;

      // 7日間カレンダーのスクロール実行
      if (this.isAirCalendarSlider) {
        if (this.scrollPanelList) {
          this.resetScroll();
          // クリックによるスクロール量調整
          // パターン1
          if ((this.ClickedRightBtn && !this.isRightEnd) || (this.ClickedLeftBtn && !this.isLeftEnd)) {
            transform = sliderValue;
          }
          // パターン2
          if ((this.ClickedRightBtn && this.isRightEnd) || (this.ClickedLeftBtn && this.isLeftEnd)) {
            transform = sliderValue;
          }
          // パターン3
          if ((this.ClickedLeftBtn && this.isRightEnd) || (this.ClickedRightBtn && this.isLeftEnd)) {
            transform = 0;
          }

          // スクロール実行
          if (boundIndex === 0 || boundIndex === 1) {
            this.scrollPanelList.toArray()[boundIndex].nativeElement.style.transform = `translateX(${transform}px)`;
          }
        }
      }

      // 最右端の判定
      this.isMostRight(transform, sliderValue);

      // 最左端の判定
      if (this.isAirCalendarSlider) {
        this.isLeftEnd = transform > 0;
      } else {
        this.isLeftEnd = transform === 0;
      }
    }
  }

  /**
   * 最右端の判定
   * @param transform
   * @param sliderValue
   */
  private isMostRight(transform: number, sliderValue: number) {
    if (this.scrollPanel) {
      const clientWidth = this.scrollPanel.nativeElement.clientWidth;
      const scrollWidth = transform + sliderValue;

      // 7日間カレンダー
      if (this.isAirCalendarSlider) {
        if (isSP() || isTB()) {
          this.isRightEnd = transform < 0;
        }
      }

      // マトリクス形式7日間カレンダー
      if (this.isCCMSlider) {
        if (isSP()) {
          this.isRightEnd = scrollWidth + -this.maxScroll <= -clientWidth;
        } else {
          this.isRightEnd = transform >= -clientWidth;
        }
      }

      // FF選択一覧
      if (this.isFFSlider || this.isFFModalSlider) {
        const scrollItemList: ElementRef[] = this.scrollItemList ? this.scrollItemList.toArray() : [];
        scrollItemList.forEach((item) => {
          const clientWidth = item.nativeElement.clientWidth;

          this.isRightEnd =
            Math.abs(transform) + this.modalFFWidth >= this.ffDataNum * clientWidth + this.ffDataNum * 16;
        });
      }
    }
  }

  /**
   * 現在の平行移動値(translateX)の取得
   * @param element
   * @returns
   */
  private getCurrentTransForm(element: HTMLElement) {
    const transFormValue = window.getComputedStyle(element).transform;
    if (transFormValue && transFormValue !== 'none') {
      const matrix = new DOMMatrix(transFormValue);
      return matrix.m41;
    }
    return 0;
  }

  /**
   * スクロール位置をリセットする
   */
  public resetScroll() {
    if (this.scrollPanel) {
      this.scrollPanel.nativeElement.style.transform = 'translateX(0px)';
    }
  }
}
