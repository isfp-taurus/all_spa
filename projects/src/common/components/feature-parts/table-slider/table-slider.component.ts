import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ElementRef,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { CommonLibService } from '@lib/services';
import { SupportComponent } from '@lib/components/support-class';
import { isPC, isSP, isTB } from '@lib/helpers';
import { fromEvent, throttleTime } from 'rxjs';
/**
 * テーブルslider用部品
 * p-plan-tableなどで使用可能
 * 埋め込まれた#detailPanel と #scrollPanelを検知してスクロール処理を行う
 *
 * @param isAutoSliderValue 画面ごとのスライダー量の調整を自動で行うか否か　デフォルトtrue
 * @param sliderValue スクロール量外部から指定する場合　isAutoSliderValueをfalseにすること
 * @param isButtonEnable ボタンを個別に用意したいときfalseを指定
 * @param maxScroll 読み取り専用　最大スクロール量
 * @param scrollValue 読み取り専用　スクロール量
 * @param isScroll 読み取り専用　スクロール可能フラグ
 * @param isScrollRight 読み取り専用　右方向スクロール可能フラグ
 * @param isScrollLeft 読み取り専用　左方向スクロール可能フラグ
 */
@Component({
  selector: 'asw-table-slider',
  templateUrl: './table-slider.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableSliderComponent extends SupportComponent implements AfterViewInit {
  constructor(private _common: CommonLibService, public change: ChangeDetectorRef) {
    super(_common);
  }
  reload(): void {}
  init(): void {}
  destroy(): void {}

  //親コンポーネントが埋め込むHTMKに以下を指定
  @ContentChild('detailPanel') detailPanel?: ElementRef; //スクロール部分(overflowするぶぶん js-plan-table01-scroll)
  @ContentChild('scrollPanel') scrollPanel?: ElementRef; //実際にスクロールさせる部分 js-plan-table01

  public isResizeEventStart = false;

  @Input()
  id = this.constructor.name;

  @Input()
  isAutoSliderValue = true;

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
  public _sliderValue: number = 300;

  /**
   * ボタンを親で用意する場合falseに設定する
   * その場合、このコンポーネントのscrollLeft、scrollRightを親イベント内で呼ぶこと
   * */
  @Input()
  set isButtonEnable(value: boolean) {
    this._isButtonEnable = value;
    this.refresh();
  }
  get isButtonEnable(): boolean {
    return this._isButtonEnable;
  }
  public _isButtonEnable: boolean = true;

  //内部で使用する値 参照用に全部outputにしておく
  private _maxScroll = 0;
  set maxScroll(value: number) {
    this._maxScroll = value;
    this.maxScrollChange.emit(value);
  }
  get maxScroll() {
    return this._maxScroll;
  }
  @Output()
  maxScrollChange = new EventEmitter<number>();

  private _scrollValue = 0;
  set scrollValue(value: number) {
    this._scrollValue = value;
    this.scrollValueChange.emit(value);
  }
  get scrollValue() {
    return this._scrollValue;
  }
  @Output()
  scrollValueChange = new EventEmitter<number>();

  private _isScroll = false;
  set isScroll(value: boolean) {
    this._isScroll = value;
    this.isScrollChange.emit(value);
  }
  get isScroll() {
    return this._isScroll;
  }
  @Output()
  isScrollChange = new EventEmitter<boolean>();

  private _isScrollRight = false;
  set isScrollRight(value: boolean) {
    this._isScrollRight = value;
    this.isScrollRightChange.emit(value);
  }
  get isScrollRight() {
    return this._isScrollRight;
  }
  @Output()
  isScrollRightChange = new EventEmitter<boolean>();

  private _isScrollLeft = false;
  set isScrollLeft(value: boolean) {
    this._isScrollLeft = value;
    this.isScrollLeftChange.emit(value);
  }
  get isScrollLeft() {
    return this._isScrollLeft;
  }
  @Output()
  isScrollLeftChange = new EventEmitter<boolean>();

  public refresh() {
    this.isScroll = 0 < this.maxScroll;
    this.isScrollRight = this.isScroll && this.isButtonEnable && -this.scrollValue < this.maxScroll;
    this.isScrollLeft = this.isScroll && this.isButtonEnable && this.scrollValue !== 0;
    this.change.markForCheck();
  }

  // 画面サイズによってテーブルの絡む幅が変わるのでスライド量を調整
  public resizeEvent = () => {
    if (isPC()) {
      this.sliderValue = 200;
    }
    if (isTB()) {
      this.sliderValue = 234;
    }
    if (isSP()) {
      this.sliderValue = 180;
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
    if (this.detailPanel && !this.isResizeEventStart) {
      this.resizeObserver.observe(this.detailPanel.nativeElement);
      this.isResizeEventStart = true;
    }
  }
  /**
   * 対象のサイズが変化した際の更新処理
   */
  public resizeObserver = new ResizeObserver(() => {
    if (this.detailPanel) {
      this.maxScroll =
        (this.detailPanel.nativeElement.scrollWidth ?? 0) - (this.detailPanel.nativeElement.clientWidth ?? 0);
      this.refresh();
    }
  });
  /**
   * スクロール左方向クリック
   */
  scrollLeft() {
    this.scroll(-this._sliderValue);
  }

  /**
   * スクロール右方向クリック
   */
  scrollRight() {
    this.scroll(this._sliderValue);
  }

  /**
   * 指定量スクロールする
   * @param value スクロール量 px
   */
  scroll(value: number) {
    if (this.detailPanel && this.scrollPanel) {
      const table = (this.scrollPanel.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(
        'th:not(:first-child), td:not(:first-child)'
      );

      if (table && table.length !== 0) {
        const val = table[0].style.transform ?? '';
        let scrollValue = 0;
        if (val.includes('translateX(')) {
          const numStr = val.split('(')[1].split(')')[0].replace('px', '');
          scrollValue = Number(numStr);
        }
        scrollValue -= value;
        if (this.maxScroll < -scrollValue) {
          scrollValue = -this.maxScroll;
        } else if (0 < scrollValue) {
          scrollValue = 0;
        }
        this.scrollValue = scrollValue;
        table.forEach((item) => {
          item.style.transform = 'translateX(' + scrollValue + 'px)';
        });
      }
      this.refresh();
    }
  }

  /**
   * スクロール位置をリセットする
   */
  resetScroll() {
    if (this.detailPanel && this.scrollPanel) {
      const table = (this.scrollPanel.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(
        'th:not(:first-child), td:not(:first-child)'
      );
      if (table && table.length !== 0) {
        table.forEach((item) => {
          item.style.transform = 'translateX(' + 0 + 'px)';
        });
        this.scrollValue = 0;
      }
      this.refresh();
    }
  }
}
