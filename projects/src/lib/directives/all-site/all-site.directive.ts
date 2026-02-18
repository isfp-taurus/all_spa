import { Directive, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonLibService } from '../../services';
import { Subject, throttleTime } from 'rxjs';

/**
 * 提携社サイトリンクDirective
 * ※本DirectiveはThrottleClickDirectiveの処理を一部内包しているため
 * 　ThrottleClickDirective(aswThrottleClick)更新時は同期を取ること
 */
@Directive({
  selector: 'button[aswAllSiteLink]',
})
export class AllSiteDirective implements OnInit, OnDestroy {
  /** 待機期間（ミリ秒単位で指定）※デフォルト値：500ms */
  @Input()
  public throttleTime = 500;

  /** クリックイベントのサブジェクト */
  protected emitEvent = new Subject<Event>();

  constructor(private _common: CommonLibService) {}

  ngOnInit(): void {
    this.emitEvent.pipe(throttleTime(this.throttleTime)).subscribe((value) => this.emitValue(value));
  }

  ngOnDestroy() {}

  /**
   * クリックイベント監視
   *
   * @param event
   */
  @HostListener('click', ['$event'])
  onClick(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.emitEvent.next(event);
  }

  /**
   * イベントEmit
   *
   * @param event
   */
  emitValue(event: Event) {
    // 提携社サイトに遷移する。
    this._common.navigateAllSite();
  }
}
