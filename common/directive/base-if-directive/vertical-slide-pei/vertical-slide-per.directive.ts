import { AfterViewInit, Directive, ElementRef, Input } from '@angular/core';
import { SupportClass, SupportComponent } from '@lib/components/support-class';
import { fromEvent } from 'rxjs/internal/observable/fromEvent';

@Directive({
  selector: '[aswVerticalSlidePer]',
})
export class VerticalSlidePerDirective extends SupportClass implements AfterViewInit {
  /** 座席の表示高さ */
  private seatHeight = 0;

  /** 垂直方向にずらす割合（%） */
  @Input() aswVerticalSlidePer: number | undefined;

  /** 垂直方向にずらす処理 */
  private slide() {
    // ずらす必要がある場合のみ処理を行う
    if (!!this.aswVerticalSlidePer && this.aswVerticalSlidePer !== 0) {
      const element = this.elementRef.nativeElement as HTMLElement;
      const style = element.style;
      const seatHeight = element.offsetHeight;

      // 高さが変わった時のみ再計算を行う
      if (this.seatHeight !== seatHeight) {
        this.seatHeight = seatHeight;
        const changePx = `${(this.aswVerticalSlidePer / 100) * seatHeight}px`;
        style.top = changePx;
      }
    }
  }

  override destroy(): void {}

  constructor(private elementRef: ElementRef) {
    super();
    // 画面リサイズを検知して、表示をずらす処理を再度行う。
    this.subscribeService('VerticalSlidePerDirective resize', fromEvent(window, 'resize'), () => {
      this.slide();
    });
  }

  ngAfterViewInit(): void {
    this.slide();
  }
}
