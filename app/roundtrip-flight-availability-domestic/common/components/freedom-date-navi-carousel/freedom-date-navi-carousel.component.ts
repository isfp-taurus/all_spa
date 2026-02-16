import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  Renderer2,
  ViewEncapsulation,
} from '@angular/core';
import { isSP } from '@lib/helpers';
import { timer, Subscription, filter, take } from 'rxjs';
import { PageLoadingStore, selectPageLoadingState } from '@lib/store';
import { Store, select } from '@ngrx/store';
import { v4 } from 'uuid';

/** カルーセル種別 */
type CAROUSEL_TYPE = 'init' | 'previous' | 'next';
const CAROUSEL_TYPE = {
  /** 初期処理 */
  INIT: 'init' as CAROUSEL_TYPE,
  /** スクロールボタン(左)押下 */
  PREVIOUS: 'previous' as CAROUSEL_TYPE,
  /** スクロールボタン(右)押下 */
  NEXT: 'next' as CAROUSEL_TYPE,
};

/**
 * カルーセル(自動計算)Component
 *
 * @implements {AfterContentInit}
 *
 * @example 使い方
 * - html側(carousel-contentとcarousel-content-itemは指定必要です)
 * ```html
 * <asw-freedom-date-navi-carousel>
 *   <div class="carousel-content">
 *      <div class="carousel-content-item">カルーセル内容1</div>
 *      <div class="carousel-content-item">カルーセル内容2</div>
 *      <div class="carousel-content-item">カルーセル内容3</div>
 *      <div class="carousel-content-item">カルーセル内容4</div>
 * 　　　...
 *   </div>
 * </asw-freedom-date-navi-carousel>
 * ```
 */
@Component({
  selector: 'asw-freedom-date-navi-carousel',
  templateUrl: './freedom-date-navi-carousel.component.html',
  styleUrls: ['./freedom-date-navi-carousel.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FreedomDateNaviCarouselComponent implements AfterViewInit, OnDestroy {
  /**
   * スクロールボタン(左)ボタン表示
   */
  public showPrevious = false;

  /**
   * スクロールボタン(右)ボタン表示
   */
  public showNext = false;

  /**
   * gap
   */
  @Input()
  public id = `${v4()}`;

  /**
   * gap
   */
  @Input()
  public gap = 8;

  /**
   * ステップ初期値
   */
  private _stepInit = 0;
  @Input()
  public get stepInit(): number {
    return this._stepInit;
  }
  public set stepInit(value: number) {
    this._stepInit = value;
  }

  /**
   * ステップ
   *
   * デフォルト値：画面に表示された値(viewInPageNumber)
   */
  @Input()
  public step = 3;

  /**
   * 左へスクロールボタンのalt文言
   */
  @Input()
  public altPrevious = 'alt.switchToLeftScreen2';

  /**
   * 右へスクロールボタンのalt文言
   */
  @Input()
  public altNext = 'alt.switchToRightScreen2';

  @HostListener('window:resize')
  public onResize() {
    this._transformHandle(CAROUSEL_TYPE.INIT);
  }

  /**
   * stepPosition
   */
  private _stepPosition: number = 0;

  /**
   * ngOnDestroyにunsubscribeを実行
   */
  private _subscriptions: Subscription = new Subscription();

  constructor(
    private _renderer: Renderer2,
    private _el: ElementRef,
    private _changeDetectorRef: ChangeDetectorRef,
    private _store: Store<PageLoadingStore>
  ) {
    // 初期化時、ブラウザのscrollがあるの場合、widthはミスにより、計算エラーが発生する
    this._subscriptions.add(
      this._store
        .pipe(
          select(selectPageLoadingState),
          filter((data) => !!data && !data.isLoading),
          take(1)
        )
        .subscribe(() => {
          timer(0).subscribe(() => {
            this._transformHandle(CAROUSEL_TYPE.INIT);
          });
        })
    );
  }

  /**
   * ngOnDestroy
   */
  public ngOnDestroy() {
    this._subscriptions.unsubscribe();
  }

  public ngAfterViewInit() {
    this._transformHandle(CAROUSEL_TYPE.INIT);
  }

  public carouselAfterViewInit() {
    this._transformHandle(CAROUSEL_TYPE.INIT);
  }

  /**
   * スクロールボタン(左)押下
   */
  public previous() {
    this._transformHandle(CAROUSEL_TYPE.PREVIOUS);
  }

  /**
   * スクロールボタン(右)押下
   */
  public next() {
    this._transformHandle(CAROUSEL_TYPE.NEXT);
  }

  /**
   * スクロールボタン押下処理
   * @param type カーソル種別
   * @returns
   */
  private _transformHandle(type: CAROUSEL_TYPE) {
    const carouselElement = this._el.nativeElement.querySelector('.carousel-content');
    if (!isSP() || !carouselElement) {
      this._setTransformAfterCalc(carouselElement, 0);
      return;
    }
    const allStepsElement = this._el.nativeElement.querySelectorAll('.carousel-content-item');
    const allStepsNumber = allStepsElement.length;
    if (!allStepsElement || allStepsNumber === 0) {
      return;
    }
    // calc transformX
    const fullCarouselWidth = carouselElement.getBoundingClientRect().width;
    const oneStepWidth = allStepsElement[0].getBoundingClientRect().width;
    const fullStepsWidth = oneStepWidth * allStepsNumber + this.gap * (allStepsNumber - 1);
    const viewInPageStepsWidth = (oneStepWidth + this.gap) * this.step;
    const _calcTransFormX = (stepInit: number) => {
      let transformXCalc = -stepInit * (oneStepWidth + this.gap);
      if (stepInit > 0 && stepInit < 4) {
        transformXCalc = transformXCalc + this.gap + (fullCarouselWidth - viewInPageStepsWidth - this.gap) / 2;
      }
      return transformXCalc;
    };
    // typeの種類より、処理を続行する
    if (type === CAROUSEL_TYPE.INIT) {
      if (this.stepInit < 4) {
        this.showNext = true;
        this.showPrevious = this.stepInit !== 0;
        this._stepPosition = this.stepInit;
        this._setTransformAfterCalc(carouselElement, _calcTransFormX(this.stepInit));
      } else {
        this.showNext = false;
        this.showPrevious = true;
        this._stepPosition = this.stepInit;
        this._setTransformAfterCalc(carouselElement, fullCarouselWidth - fullStepsWidth);
      }
    } else if (type === CAROUSEL_TYPE.PREVIOUS) {
      this._stepPosition = this._stepPosition - this.step;
      if (this._stepPosition <= 0) {
        this._stepPosition = 0;
        this.showPrevious = false;
        this._setTransformAfterCalc(carouselElement, this._stepPosition);
      } else {
        this._setTransformAfterCalc(carouselElement, _calcTransFormX(this._stepPosition));
      }
      this.showNext = true;
    } else {
      this._stepPosition = this._stepPosition + this.step;
      if (this._stepPosition < 4) {
        this._setTransformAfterCalc(carouselElement, _calcTransFormX(this._stepPosition));
      } else {
        this._stepPosition = 4;
        this._setTransformAfterCalc(carouselElement, fullCarouselWidth - fullStepsWidth);
        this.showNext = false;
      }
      this.showPrevious = true;
    }
    this._changeDetectorRef.markForCheck();
  }

  /**
   * TransformAfterCalc
   * @param element any
   * @param translateXValue number
   */
  private _setTransformAfterCalc(element: any, translateXValue: number) {
    this._renderer.setStyle(element, 'transform', `translateX(${translateXValue}px)`);
  }
}
