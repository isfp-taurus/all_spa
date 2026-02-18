import { AfterViewInit, Directive, ElementRef, Input } from '@angular/core';
import { SupportClass, SupportComponent } from '@lib/components/support-class';
import { fromEvent } from 'rxjs';

@Directive({
  selector: '[aswHorizontalSlidePer]',
})
export class HorizontalSlidePerDirective extends SupportClass implements AfterViewInit {
  /** 座席の表示幅 */
  private seatWidth = 0;

  /** 水平方向のずれ（%） */
  @Input() aswHorizontalSlidePer: number | undefined;

  /** 水平方向にずらす処理 */
  private slide() {
    // ずらす必要がある場合のみ処理を行う
    if (!!this.aswHorizontalSlidePer && this.aswHorizontalSlidePer !== 0) {
      const element = this.elementRef.nativeElement as HTMLElement;
      const style = element.style;
      const seatWidth = element.offsetWidth;

      // 幅が変わった時のみ再計算を行う
      if (this.seatWidth !== seatWidth) {
        this.seatWidth = seatWidth;
        style.left = `${(this.aswHorizontalSlidePer / 100) * seatWidth}px`;
        style.zIndex = '2';
      }
    }
  }

  override destroy(): void {}

  constructor(private elementRef: ElementRef) {
    super();
    // 画面リサイズを検知して、表示をずらす処理を再度行う。
    this.subscribeService('HorizontalSlidePerDirective resize', fromEvent(window, 'resize'), () => {
      this.slide();
    });
  }

  ngAfterViewInit(): void {
    this.slide();
  }
}
