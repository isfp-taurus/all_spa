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
 * @param isScroll 読み取り専用　スクロール可能フラグ
 * @param isScrollRight 読み取り専用　右方向スクロール可能フラグ
 * @param isScrollLeft 読み取り専用　左方向スクロール可能フラグ
 */
@Component({
  selector: 'asw-block-slider',
  templateUrl: './block-slider.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlockSliderComponent extends SupportComponent implements AfterViewInit {
  constructor(private _common: CommonLibService, private _change: ChangeDetectorRef) {
    super(_common);
  }
  reload(): void {}
  init(): void {}
  destroy(): void {}

  //親コンポーネントが埋め込むHTMLに以下を指定
  @ContentChild('scrollPanel') scrollPanel?: ElementRef; //実際にスクロールさせる部分

  public isResizeEventStart = false;

  @Input()
  id = this.constructor.name;

  @Input()
  isAutoSliderValue = true;

  @Input()
  set sliderValue(value: number) {
    if (this._sliderValue !== value) {
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
    this.isScrollRight =
      this.isScroll && this.isButtonEnable && (this.scrollPanel?.nativeElement.scrollLeft ?? 0) < this.maxScroll - 1;
    this.isScrollLeft = this.isScroll && this.isButtonEnable && (this.scrollPanel?.nativeElement.scrollLeft ?? 0) !== 0;
    this._change.detectChanges();
  }

  public resizeEvent = () => {};

  /**
   * 画面描画後処理
   */
  ngAfterViewInit(): void {
    if (this.isAutoSliderValue) {
      this.subscribeService(
        'BlockSliderComponentResize',
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
      this.refresh();
    }
  });

  /**
   * スクロール左方向クリック
   */
  scrollLeft() {
    if (this.scrollPanel) {
      if (this.scrollPanel.nativeElement.scrollLeft < this.sliderValue) {
        this.scrollPanel.nativeElement.scrollLeft = 0;
      } else {
        this.scrollPanel.nativeElement.scrollLeft -= this.sliderValue;
      }
      this.refresh();
    }
  }

  /**
   * スクロール右方向クリック
   */
  scrollRight() {
    if (this.scrollPanel) {
      if (this.maxScroll < this.scrollPanel.nativeElement.scrollLeft + this.sliderValue) {
        this.scrollPanel.nativeElement.scrollLeft = this.maxScroll;
      } else {
        this.scrollPanel.nativeElement.scrollLeft += this.sliderValue;
      }
      this.refresh();
    }
  }

  /**
   * スクロール位置をリセットする
   */
  resetScroll() {
    if (this.scrollPanel) {
      this.scrollPanel.nativeElement.scrollLeft = 0;
      this.refresh();
    }
  }
}
