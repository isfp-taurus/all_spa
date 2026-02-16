import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  Renderer2,
  ViewEncapsulation,
} from '@angular/core';
import { DeviceType } from '../../interfaces/device-type';
import { v4 } from 'uuid';

/** POSITION_PREFIX */
const POSITION_PREFIX = 'carousel-position-';

/**
 * カルーセルComponent
 */
@Component({
  selector: 'asw-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarouselComponent implements OnInit, AfterViewInit {
  /**
   * `id`属性
   * - デフォルト：自動生成uuid
   */
  @Input()
  public id = `${v4()}`;

  /**
   * ステップ番号
   */
  @Input()
  public allStepNumber: 2 | 3 = 3;

  /**
   * 現在位置
   */
  @Input()
  public currentPosition?: 'left' | 'center' | 'right';

  /**
   * カルーセルClass
   */
  @Input()
  public carouselClass?: string;

  /**
   * 左へスクロールボタンのalt文言
   */
  @Input()
  public altPrevious = 'alt.switchToLeftScreen1';

  /**
   * 右へスクロールボタンのalt文言
   */
  @Input()
  public altNext = 'alt.switchToRightScreen1';

  /**
   * カルーセル表示有無
   */
  @Input()
  public carouselShow = true;

  /**
   * カルーセル表示あり種別
   */
  @Input()
  public hasCarouselType: DeviceType = 'sp';

  /**
   * ウィンドウのサイズ変更イベントをリッスンする
   */
  @HostListener('window:resize')
  public onResize() {
    this._triggerChangePosition();
  }

  /**
   * カルーセル表示なし種別
   */
  public notHasCarouselType: DeviceType = 'notSp';

  /**
   * カルーセル位置Class
   */
  public get positionClass(): string {
    return `${POSITION_PREFIX}${this.currentPosition}`;
  }

  constructor(private _renderer: Renderer2, private _el: ElementRef) {}

  /**
   * 初期化処理
   */
  public ngOnInit() {
    if (this.allStepNumber === 2) {
      this.currentPosition = 'left';
    } else if (this.allStepNumber === 3) {
      this.currentPosition = this.currentPosition || 'center';
    }
    if (this.hasCarouselType === 'notPc') {
      this.notHasCarouselType = 'pc';
    }
  }

  public ngAfterViewInit() {
    this._triggerChangePosition();
  }

  /**
   * 左へスクロールボタン押下処理
   */
  public previous() {
    const currentPosition = this.currentPosition;
    if (this.allStepNumber === 2 && this.currentPosition === 'right') {
      this.currentPosition = 'left';
    } else if (this.allStepNumber === 3) {
      if (this.currentPosition === 'right') {
        this.currentPosition = 'center';
      } else if (this.currentPosition === 'center') {
        this.currentPosition = 'left';
      }
    }
    if (currentPosition !== this.currentPosition) {
      this._triggerChangePosition();
    }
  }

  /**
   * 右へスクロールボタン押下処理
   */
  public next() {
    const currentPosition = this.currentPosition;
    if (this.allStepNumber === 2 && this.currentPosition === 'left') {
      this.currentPosition = 'right';
    } else if (this.allStepNumber === 3) {
      if (this.currentPosition === 'left') {
        this.currentPosition = 'center';
      } else if (this.currentPosition === 'center') {
        this.currentPosition = 'right';
      }
    }
    if (currentPosition !== this.currentPosition) {
      this._triggerChangePosition();
    }
  }

  /**
   * 位置変更
   */
  private _triggerChangePosition() {
    const contentElement = this._el.nativeElement.querySelector('.carousel-content');
    if (contentElement) {
      this._renderer.removeClass(contentElement, 'carousel-position-left');
      this._renderer.removeClass(contentElement, 'carousel-position-right');
      this._renderer.removeClass(contentElement, 'carousel-position-center');
      this._renderer.addClass(contentElement, this.positionClass);
    }
  }
}
