import { Directive, OnInit, ElementRef, Renderer2, HostListener } from '@angular/core';

/**
 * セミフィックスドエリアDirective
 */
@Directive({
  selector: '[aswSemiFixedArea]',
})
export class SemiFixedAreaDirective implements OnInit {
  constructor(private _el: ElementRef, private _renderer: Renderer2) {}

  ngOnInit(): void {
    // Set initial position to semi-fixed area
    this._renderer.setStyle(this._el.nativeElement, 'position', 'sticky');
    this._renderer.setStyle(this._el.nativeElement, 'z-index', '999');
    this._renderer.setStyle(this._el.nativeElement, 'width', '100%');
    this._renderer.setStyle(this._el.nativeElement, 'top', '0%');
    this._renderer.setStyle(this._el.nativeElement, 'left', '0%');
    this._renderer.setStyle(this._el.nativeElement, 'transition', 'transform 0.3s, opacity 0.2s');
  }

  /** スクロール位置記録用 */
  private _lastScroll = window.scrollY;

  /** ページ最上部判定用 */
  private _isTop = true;

  /**
   * スクロール操作時処理
   */
  @HostListener('window:scroll', ['$event'])
  onScroll() {
    const y = window.scrollY;
    const threshold = 10;

    this._isTop = y <= 0;
    if (this._isTop) {
      // ページ最上部では表示
      this._renderer.setStyle(this._el.nativeElement, 'transform', 'translateY(0)');
      this._renderer.setStyle(this._el.nativeElement, 'opacity', '1 0.2s');
      this._renderer.setStyle(this._el.nativeElement, 'pointer-events', 'auto');
    } else {
      if (this._lastScroll > y + threshold) {
        // scroll up
        this._renderer.removeStyle(this._el.nativeElement, 'transform');
        this._renderer.setStyle(this._el.nativeElement, 'opacity', '1 0.2s');
        this._renderer.removeStyle(this._el.nativeElement, 'pointer-events');
      } // scroll down
      else if (this._lastScroll < y - threshold) {
        this._renderer.setStyle(this._el.nativeElement, 'transform', 'translateY(-100%)');
        this._renderer.setStyle(this._el.nativeElement, 'opacity', '0 0.2s');
        this._renderer.setStyle(this._el.nativeElement, 'pointer-events', 'none');
      }
    }
    this._lastScroll = y;
  }
}
