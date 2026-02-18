import { Directive, EventEmitter, HostListener, Output, Input, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { throttleTime } from 'rxjs/operators';

/**
 * 多重リクエスト防止Directive
 */
@Directive({
  selector: '[aswThrottleClick]',
})
export class ThrottleClickDirective implements OnInit {
  /** 待機期間（ミリ秒単位で指定）※デフォルト値：500ms */
  @Input()
  public throttleTime = 500;

  /** `@Output`イベント */
  @Output()
  public throttleClick$ = new EventEmitter<Event>();

  /** クリックイベントのサブジェクト */
  protected emitEvent = new Subject<Event>();

  /**
   * 初期化処理
   * - 設定した待機期間（throttleTime）内で複数回ボタンクリックしても初回のみ有効
   */
  public ngOnInit() {
    this.emitEvent.pipe(throttleTime(this.throttleTime)).subscribe((value) => this.emitValue(value));
  }

  /**
   * クリックイベント監視
   *
   * @param event
   */
  @HostListener('click', ['$event'])
  public onClick(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.emitEvent.next(event);
  }

  /**
   * イベントEmit
   *
   * @param event
   */
  public emitValue(event: Event) {
    this.throttleClick$.emit(event);
  }
}
