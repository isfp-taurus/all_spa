import { Directive, ElementRef, HostListener, Input, OnInit, Renderer2 } from '@angular/core';
import { breakpointSp } from '@lib/interfaces';
import { v4 } from 'uuid';

/**
 * [BaseUI] tootip directive
 */
@Directive({
  selector: '[aswTooltip]',
})
export class TooltipDirective implements OnInit {
  /** ツールチップの表示内容 */
  @Input()
  public aswTooltip?: string;

  /** 追加の上向きオフセット距離 */
  @Input()
  public tooltipTop = 0;

  /** ツールチップ表示方式 */
  @Input()
  public tooltipDisplayType: 'tap' | 'hover' = 'tap';

  /** ツールチップのid */
  @Input()
  public id = `tooltip_${v4()}`;

  /** コンテンツ表示領域の基準となるクラス */
  @Input()
  public displayAreaClass = 'l-core-contents__inner';

  /** ツールチップを表示するかどうかのフラグ */
  public isOpen = false;

  /** ツールチップ本体のdom */
  private _tooltipWrap!: HTMLElement;

  /** ツールチップ内のdom */
  private _tooltipContent!: HTMLElement;

  /** ツールチップ内のdom */
  private _tooltipText!: HTMLElement;

  /** ホスト要素のdom */
  public button!: HTMLElement;

  /** 親要素のdom */
  public parent!: HTMLElement;

  constructor(private _elementRef: ElementRef, private _renderer: Renderer2) {}

  /**
   * dom 構造を作成し、ホスト要素の後にスプライスする
   */
  public ngOnInit() {
    // ツールチップの dom オブジェクトを作成する
    this._tooltipWrap = this._renderer.createElement('span');
    this._tooltipContent = this._renderer.createElement('span');
    this._tooltipText = this._renderer.createElement('span');
    this.button = this._elementRef.nativeElement;

    this._renderer.addClass(this._tooltipWrap, 'c-tooltip');
    this._renderer.addClass(this._tooltipWrap, 'js-tooltip-wrap');
    this._renderer.addClass(this._tooltipContent, 'c-tooltip__content');
    this._renderer.addClass(this._tooltipContent, 'js-tooltip-contents');
    this._renderer.addClass(this._tooltipText, 'c-tooltip__text');

    this._renderer.appendChild(this._tooltipContent, this._tooltipText);
    this._renderer.appendChild(this._tooltipWrap, this._tooltipContent);

    // 当directiveを設定しているbuttonの親要素にjs-tooltipのクラスが存在するか判定し、親要素のstyle設定を行う
    if (this.button.closest('js-tooltip') !== null) {
      this.parent = this.button.closest('js-tooltip')!;
    } else {
      this.parent = this._elementRef.nativeElement.parentElement;
      this._renderer.addClass(this.parent, 'js-tooltip');
    }
    this._renderer.setStyle(this.parent, 'position', 'relative');
    this._renderer.setStyle(this.parent, 'display', 'inline-block');

    // ホスト要素が同じレベルの最後の要素であるかどうかを判断し、ホスト要素の後に作成された要素を接合する
    if (this._elementRef.nativeElement.nextSibling) {
      this._renderer.insertBefore(this.button.parentElement, this._tooltipWrap, this.button.nextSibling);
    } else {
      this._renderer.appendChild(this.button.parentElement, this._tooltipWrap);
    }

    this._renderer.setAttribute(this.button, 'aria-controls', this.id);
    this._tooltipWrap.id = this.id;
    this._tooltipText.innerHTML = this.aswTooltip || '';
  }

  /**
   * ドキュメントクリックイベントをリッスンする
   *
   * @param target クリック対象
   */
  @HostListener('document:click', ['$event.target'])
  public documentClick(target: any) {
    if (this.tooltipDisplayType === 'tap') {
      if (!this.isOpen && this.button.contains(target)) {
        return this.switchToolTip();
      } else {
        if (!this._tooltipWrap.contains(target)) {
          return this.closeToolTip();
        }
      }
    }
  }

  /**
   * mouseenterイベントをリッスンする
   */
  @HostListener('mouseenter')
  public mouseEnter() {
    if (this.tooltipDisplayType === 'hover') {
      return this.switchToolTip();
    }
  }

  /**
   * mouseleaveイベントをリッスンする
   */
  @HostListener('mouseleave')
  public mouseLeave() {
    if (this.tooltipDisplayType === 'hover' && this.isOpen) {
      this.closeToolTip();
    }
  }

  /**
   * ウィンドウのサイズ変更イベントをリッスンする
   */
  @HostListener('window:resize')
  public onResize() {
    this.windowEvent();
  }

  /**
   * ウィンドウの読み込みイベントをリッスンする
   */
  @HostListener('window:load')
  public onLoad() {
    this.windowEvent();
  }

  /**
   * ブラウザ ウィンドウに合わせてツールチップの幅を設定し配置
   */
  public windowEvent() {
    const windowWidth = window.outerWidth;
    const deviceWidthSp = breakpointSp;
    // ウィンドウサイズがSPの場合
    if (windowWidth <= deviceWidthSp) {
      if (this.isOpen) {
        const contentsWidth = this._tooltipWrap.offsetWidth;
        const contentsHeight = this._tooltipWrap.offsetHeight;
        if (contentsWidth > 320) {
          this._renderer.setStyle(this._tooltipWrap, 'width', '320px');
        }
        let topDistance = 0;
        if (this.tooltipTop) {
          topDistance = contentsHeight + this.tooltipTop;
        } else {
          topDistance = contentsHeight + 8;
        }
        this.position(topDistance);
      }
    } else {
      // ウィンドウサイズがPC/TABの場合
      if (this.isOpen) {
        this._renderer.setStyle(this._tooltipWrap, 'width', '440px');
        const contentsWidth = this._tooltipContent.offsetWidth;
        const contentsHeight = this._tooltipContent.offsetHeight;
        if (contentsWidth < 440) {
          this._renderer.setStyle(this._tooltipWrap, 'width', `${contentsWidth + 1}px`);
        }
        let topDistance = 0;
        if (this.tooltipTop) {
          topDistance = contentsHeight + this.tooltipTop;
        } else {
          topDistance = contentsHeight + 8;
        }
        this.position(topDistance);
      }
    }

    // コンテンツ表示領域の横幅が「.js-tooltip-contents」の横幅よりも小さい場合に、コンテンツ表示領域の横幅を「.js-tooltip-wrap」の横幅に設定
    let coreContents = this.getContentsInnerElement();
    if (coreContents.clientWidth < this._tooltipContent.offsetWidth) {
      this._renderer.setStyle(this._tooltipWrap, 'width', `${coreContents.clientWidth}px`);
    }
  }

  /**
   * ツールチップ表示箇所から親階層にあるコンテンツ表示領域の基準となるクラスの要素を取得する
   * 存在しない場合には最上位の要素を返す
   */
  public getContentsInnerElement() {
    let coreContents = this._elementRef.nativeElement.parentElement;
    while (!coreContents.classList.contains(this.displayAreaClass)) {
      if (!coreContents.parentElement) {
        break;
      }
      coreContents = coreContents.parentElement;
    }
    return coreContents;
  }

  /**
   * ツールチップの表示状態を切り替えてロケートする
   */
  public switchToolTip() {
    if (this.isOpen) {
      this.closeToolTip();
    } else {
      this.openTooltip();
      this.windowEvent();
    }
  }

  /**
   * ツールチップを配置する (ツールチップの幅と、ホスト要素からコンテンツ表示領域までの左右の距離に従って)
   *
   * @param distance アップオフセット距離
   */
  public position(distance: number) {
    // ツールチップアイコンの各種距離を設定する
    const buttonWidth = this.button.offsetWidth;
    const buttonOffsetWidth = this.button.getBoundingClientRect().left + window.scrollX;
    const buttonPosCenter = buttonOffsetWidth + buttonWidth / 2;
    // コンテンツ表示領域の基準となるクラスを持つ要素が存在するか判定し、コンテンツ表示領域の各種距離を設定する
    let coreContents = this.getContentsInnerElement();
    const coreContentsOffset = coreContents.getBoundingClientRect().left + window.scrollX;
    const coreContentsWidth = coreContents.clientWidth;
    const coreContentsPosleft = coreContentsOffset;
    const coreContentsPosright = coreContentsOffset + coreContentsWidth;
    const wrapperWidth = this._tooltipWrap.offsetWidth;

    // ツールチップアイコンの配置場所に応じてstyleを設定する
    if (
      coreContentsPosright - buttonPosCenter >= wrapperWidth / 2 &&
      buttonPosCenter - coreContentsPosleft >= wrapperWidth / 2
    ) {
      this._renderer.setStyle(this._tooltipWrap, 'left', `50%`);
      this._renderer.setStyle(this._tooltipWrap, 'right', 'auto');
      this._renderer.setStyle(this._tooltipWrap, 'transform', 'translate(-50%,0)');
      this._renderer.setStyle(this._tooltipWrap, 'top', `${-distance}px`);
    } else if (buttonPosCenter - coreContentsPosleft >= wrapperWidth / 2) {
      const rightPos = coreContentsPosright - buttonPosCenter - buttonWidth / 2;
      this._renderer.setStyle(this._tooltipWrap, 'left', 'auto');
      this._renderer.setStyle(this._tooltipWrap, 'right', `${-rightPos}px`);
      this._renderer.setStyle(this._tooltipWrap, 'transform', 'translate(0)');
      this._renderer.setStyle(this._tooltipWrap, 'top', `${-distance}px`);
    } else {
      const leftPos = buttonPosCenter - coreContentsPosleft - buttonWidth / 2;
      this._renderer.setStyle(this._tooltipWrap, 'left', `${-leftPos}px`);
      this._renderer.setStyle(this._tooltipWrap, 'right', 'auto');
      this._renderer.setStyle(this._tooltipWrap, 'transform', 'translate(0)');
      this._renderer.setStyle(this._tooltipWrap, 'top', `${-distance}px`);
    }
  }

  /**
   * ツールチップを表示
   */
  public openTooltip() {
    this.isOpen = true;
    this._renderer.addClass(this.parent, 'is-open');
    this._renderer.addClass(this._tooltipWrap, 'is-open');
    this._renderer.addClass(this._tooltipContent, 'is-open');
    this._renderer.setAttribute(this.button, 'aria-expanded', 'true');
    // 内部のコンテンツ幅に、端数を考慮し1ピクセルを余裕持たせ、ツールチップの幅を修正
    const contentsWidth = this._tooltipContent.offsetWidth + 1;
    this._renderer.setStyle(this._tooltipWrap, 'width', contentsWidth + 'px');
  }

  /**
   * ツールチップを閉じる
   */
  public closeToolTip() {
    this.isOpen = false;
    this._renderer.removeClass(this.parent, 'is-open');
    this._renderer.removeClass(this._tooltipWrap, 'is-open');
    this._renderer.removeClass(this._tooltipContent, 'is-open');
    this._renderer.setAttribute(this.button, 'aria-expanded', 'false');
  }
}
