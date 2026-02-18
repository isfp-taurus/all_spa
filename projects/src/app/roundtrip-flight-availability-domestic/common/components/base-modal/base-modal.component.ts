import { animate, style, transition, trigger, AnimationEvent, state } from '@angular/animations';
import { Overlay, OverlayRef, PositionStrategy } from '@angular/cdk/overlay';
import {
  AfterContentInit,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { Subscription, filter, take, timer } from 'rxjs';
import { isCurrentDeviceType } from '../../helpers';
import { DeviceType } from '../../interfaces';
import { NavigationStart, Router } from '@angular/router';
import { uniqueId } from '@lib/helpers';
import { PageType } from '@lib/interfaces';
import { AlertMessageStoreService, ErrorsHandlerService } from '@lib/services';

/** モーダル種別*/
export type ModalType = '01' | '02' | '03' | '04' | '05';
export const ModalType = {
  TYPE_01: '01' as ModalType,
  TYPE_02: '02' as ModalType,
  TYPE_03: '03' as ModalType,
  TYPE_04: '04' as ModalType,
  TYPE_05: '05' as ModalType,
};

/** アニメーション状態*/
type ANIMATION_STATE = 'bottom' | 'center' | 'right' | 'left' | 'leave';
const ANIMATION_STATE = {
  BOTTOM: 'bottom' as ANIMATION_STATE,
  CENTER: 'center' as ANIMATION_STATE,
  RIGHT: 'right' as ANIMATION_STATE,
  LEFT: 'left' as ANIMATION_STATE,
  LEAVE: 'leave' as ANIMATION_STATE,
};

/** アニメーション時間*/
const ANIMATION_TIMINGS = 400;

/** デフォルト: モディファークラスを付与し個別にcssで制御します（.u-modal-size-{{pc/tb}}-xx）*/
const INDIVIDUAL_CONTROL = {
  '01': ['tb', '384'],
  '02': ['pc', ''],
  '03': ['tb', '384'],
  '04': ['pc', '768'],
  '05': ['tb', '768'],
};

/** ヘッダークラ​​スのタイプ */
const HEADER_CLASS_TYPE = {
  '01': '01',
  '02': '02',
  '03': '01',
  '04': '02',
  '05': '01',
};

/** フォーカス可能要素 */
const TAB_ELEMENT_TYPE =
  'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * ベースモーダルComponent
 */
@Component({
  selector: 'asw-base-modal',
  templateUrl: './base-modal.component.html',
  styleUrls: ['./base-modal.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('slideContent', [
      state('center', style({ opacity: 1 })),
      state('bottom', style({ opacity: 1 })),
      state('left', style({ opacity: 1 })),
      state('right', style({ opacity: 1 })),
      state('leave', style({ opacity: 0 })),
      transition('void <=> center', [animate(ANIMATION_TIMINGS)]),
      transition('void => bottom', [style({ opacity: 1, transform: 'translateY(100%)' }), animate(ANIMATION_TIMINGS)]),
      transition('bottom => leave', [animate(ANIMATION_TIMINGS, style({ opacity: 1, transform: 'translateY(100%)' }))]),
      transition('void => left', [style({ opacity: 1, transform: 'translateX(-100%)' }), animate(ANIMATION_TIMINGS)]),
      transition('left => leave', [animate(ANIMATION_TIMINGS, style({ opacity: 1, transform: 'translateX(-100%)' }))]),
      transition('void => right', [style({ opacity: 1, transform: 'translateX(100%)' }), animate(ANIMATION_TIMINGS)]),
      transition('right => leave', [animate(ANIMATION_TIMINGS, style({ opacity: 1, transform: 'translateX(100%)' }))]),
    ]),
  ],
})
export class BaseModalComponent implements OnInit, AfterViewInit, OnDestroy, AfterContentInit {
  /**
   * overlayRef
   */
  @Input()
  public overlayRef?: OverlayRef;

  /**
   * タイトル
   */
  @Input()
  public title = 'Modal Title';

  /**
   * モーダル種別
   */
  @Input()
  public modalType: ModalType = ModalType.TYPE_01;

  /**
   * モディファークラスを付与し個別にcssで制御します（.u-modal-size-{{pc/tb}}-xx）
   *
   * widthType: 指定された「xx」
   */
  @Input()
  public widthType?: string;

  /**
   * フッタ有無
   */
  @Input()
  public hasFooter = true;

  /**
   * 長テキスト有無
   */
  @Input()
  public isLongText = false;

  /**
   * ダイアログを開いていた場合は、そのトリガーボタン等にフォーカスを戻してください。
   */
  @Input()
  public focusElement?: any;

  @Input()
  public tiltleId: string = 'modalTitle-' + uniqueId();

  @Output()
  public modalAfterViewInit$: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output()
  public buttonClick: EventEmitter<this> = new EventEmitter<this>();

  @Output()
  public close$: EventEmitter<void> = new EventEmitter<void>();

  public animationStateChanged = new EventEmitter<AnimationEvent>();

  @ViewChild('emergencyArea', { read: ElementRef })
  public emergencyArea!: ElementRef; // 高さを取得するために使用

  @ViewChild('modalContents')
  public contents!: ElementRef;

  @ViewChild('modalHead')
  public head!: ElementRef;

  @ViewChild('modalBody')
  public body!: ElementRef;

  @ViewChild('modalFooter')
  public footer!: ElementRef;

  /**
   * ボタン(cancel)
   */
  @ViewChild('closeBtn')
  public closeBtn!: ElementRef;

  public headClassType!: string;

  public animationState: ANIMATION_STATE = ANIMATION_STATE.CENTER;

  public initialBodyH = 0;

  public show = false;

  /**
   * ngOnDestroyにunsubscribeを実行
   */
  private _subscriptions: Subscription = new Subscription();

  constructor(
    private _renderer2: Renderer2,
    private _overlay: Overlay,
    private _el: ElementRef,
    private _changeDetectorRef: ChangeDetectorRef,
    private _router: Router,
    private _errorHandlerSvc: ErrorsHandlerService,
    private _alertMsgSvc: AlertMessageStoreService
  ) {}

  /**
   * 初期化処理
   */
  public ngOnInit() {
    this.headClassType = HEADER_CLASS_TYPE[this.modalType];
    this._setOverlayPosition();
    this._subscriptions.add(
      this._router.events.pipe(filter((event) => event instanceof NavigationStart)).subscribe(() => {
        this.close();
      })
    );
  }

  /**
   * ngOnDestroy
   */
  public ngOnDestroy() {
    this._subscriptions.unsubscribe();
  }

  public ngAfterContentInit() {
    this.show = true;
  }

  public ngAfterViewInit() {
    this._renderer2.setStyle(this.body.nativeElement, 'height', 'auto');
    this.overlayRef?.updatePosition();
    this.closeBtn.nativeElement.focus();
    this._renderer2.setStyle(this._el.nativeElement.parentElement, 'width', '100%');
    this.triggerSizeChange();
    this.tabKeyEvent();
  }

  @HostListener('window:resize')
  public onResize() {
    this._resizeEvent();
    this._setOverlayPosition();
  }

  @HostListener('document:keydown.escape')
  public escapeKeyEvent() {
    if (this.modalType === ModalType.TYPE_01) {
      this.close();
    }
  }

  /**
   * 開いているダイアログ（「.l-dialog」）内のフォーカス可能要素でtabフォーカスを循環する。
   *
   * @param event イベント
   */
  public tabKeyEvent() {
    this._renderer2.listen(this._el.nativeElement, 'keydown', (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        const tabElements = Array.from(this._el.nativeElement.querySelectorAll(TAB_ELEMENT_TYPE)).filter(
          (element: any) => {
            return element.offsetHeight > 0;
          }
        );
        if (tabElements && event.target === tabElements[tabElements.length - 1]) {
          event.preventDefault();
          event.stopPropagation();
          this.closeBtn.nativeElement.focus();
        }
      }
    });
  }

  public onHandleClick() {
    this.buttonClick.emit(this);
    this.close();
  }

  public onAnimationDone(event: AnimationEvent) {
    this.animationStateChanged.emit(event);
  }

  public onAnimationStart(event: AnimationEvent) {
    this.animationStateChanged.emit(event);
  }

  /**
   * モーダルコンテンツエリア（l-modal{{this.modalType}}__contents）にモディファークラスを付与し個別にcssで制御します（.u-modal-size-pc/tb-xx）
   * @returns
   */
  public get modalClass(): string {
    let baseClass = `l-modal${this.modalType}__contents`;
    if (this.widthType) {
      baseClass = `${baseClass} u-modal-size-${INDIVIDUAL_CONTROL[this.modalType][0]}-${this.widthType}`;
    } else if (INDIVIDUAL_CONTROL[this.modalType][1]) {
      baseClass = `${baseClass} u-modal-size-${INDIVIDUAL_CONTROL[this.modalType][0]}-${
        INDIVIDUAL_CONTROL[this.modalType][1]
      }`;
    }
    return baseClass;
  }

  /**
   * 画面のサイズ変更時、トリガーされたイベント
   * イベント1.is-shadow有無の制御(bodyはoverflowの場合、footerの部品に「is-shadow」を追加する)
   * イベント2.body部品のheightを設定する
   */
  private _resizeEvent() {
    const windowH = window.innerHeight;
    const bodyElement = this.body.nativeElement;

    const footerElement = this.footer?.nativeElement;
    const footerH = footerElement ? this._getOuterHeight(footerElement) : 0;

    const modalH = this._getOuterHeight(this.contents.nativeElement);
    const headerH = this._getOuterHeight(this.head.nativeElement);
    let marginVal = 0;
    let margin = 0;
    if (this.isLongText) {
      marginVal =
        Math.abs(Math.round(windowH) - Math.round(modalH)) <= 1 && isCurrentDeviceType(DeviceType.PC) ? 0 : 48;
      margin = isCurrentDeviceType(DeviceType.NOT_PC) ? marginVal : 128;
    } else {
      marginVal =
        Math.abs(Math.round(windowH) - Math.round(modalH)) <= 1 && isCurrentDeviceType(DeviceType.NOT_SP) ? 0 : 64;
      margin = isCurrentDeviceType(DeviceType.SP) ? marginVal : marginVal * 2;
    }

    const emergencyH = this.emergencyArea.nativeElement.offsetHeight;
    const setVal = windowH - margin - headerH - footerH - emergencyH;

    this._renderer2.setStyle(this.body.nativeElement, 'height', 'auto');
    this.initialBodyH = this._getOuterHeight(this.body.nativeElement);
    if (setVal > this.initialBodyH) {
      if (footerH !== 0 && footerElement.classList.contains('is-shadow')) {
        // イベント1.is-shadow有無の制御:「is-shadow無」の場合
        this._renderer2.removeClass(footerElement, 'is-shadow');
      }
    } else {
      // イベント2.body部品のheightを設定する
      this._renderer2.setStyle(bodyElement, 'height', `${setVal}px`);
      if (footerH !== 0) {
        // イベント1.is-shadow有無の制御:「is-shadow有」の場合
        this._renderer2.addClass(footerElement, 'is-shadow');
      }
    }
  }

  /**
   * 画面サイズより、positionとcssを変更する
   *
   * 基本モーダル01（SP：画面下部から表示 PC/TAB：画面天地中央に表示）
   * 基本モーダル02（SP/TAB：画面下部から表示 PC：画面天地中央に表示）
   * 基本モーダル03（SP：画面下部から表示 PC/TAB：画面右端から高さ100%で表示）
   * 基本モーダル04（SP/TAB：画面下部から表示 PC：画面右端から高さ100%で表示）
   * 基本モーダル05（SP：画面下部から表示 PC/TAB：画面左端から高さ100%で表示）
   */
  private _setOverlayPosition() {
    if (this.modalType && this.overlayRef) {
      let bottomState: DeviceType = DeviceType.SP;
      if (this.modalType === ModalType.TYPE_02 || this.modalType === ModalType.TYPE_04) {
        bottomState = DeviceType.NOT_PC;
      }

      if (isCurrentDeviceType(bottomState)) {
        this.animationState = ANIMATION_STATE.BOTTOM;
        this.overlayRef.addPanelClass('l-modal__panel');
      } else {
        if (this.modalType === ModalType.TYPE_01 || this.modalType === ModalType.TYPE_02) {
          this.animationState = ANIMATION_STATE.CENTER;
        } else if (this.modalType === ModalType.TYPE_03 || this.modalType === ModalType.TYPE_04) {
          this.animationState = ANIMATION_STATE.RIGHT;
        } else if (this.modalType === ModalType.TYPE_05) {
          this.animationState = ANIMATION_STATE.LEFT;
        }
        this.overlayRef.removePanelClass('l-modal__panel');
      }
      this.overlayRef.updatePositionStrategy(this._getPositionStrategy(this.animationState as ANIMATION_STATE));
    }
  }

  /**
   * PositionStrategy取得
   * @param type アニメーション状態
   * @returns
   */
  private _getPositionStrategy(type?: ANIMATION_STATE): PositionStrategy {
    switch (type) {
      case ANIMATION_STATE.BOTTOM:
        return this._overlay.position().global().bottom('0%');
      case ANIMATION_STATE.CENTER:
        return this._overlay.position().global().centerHorizontally().centerVertically();
      case ANIMATION_STATE.RIGHT:
        return this._overlay.position().global().right('0%');
      case ANIMATION_STATE.LEFT:
        return this._overlay.position().global().left('0%');
      default:
        return this._overlay.position().global();
    }
  }

  /**
   * OuterHeight取得
   * @param dom HTMLElement
   * @returns
   */
  private _getOuterHeight(dom: HTMLElement): number {
    let outerHeight = dom.offsetHeight;
    const marginTop = dom.style.marginTop;
    const marginBottom = dom.style.marginBottom;
    if (marginTop) {
      outerHeight = outerHeight + parseInt(marginTop.substring(0, marginTop.length - 2));
    }
    if (marginBottom) {
      outerHeight = outerHeight + parseInt(marginBottom.substring(0, marginBottom.length - 2));
    }
    return outerHeight;
  }

  /**
   * トリガーサイズ変更
   */
  public triggerSizeChange() {
    timer(0).subscribe(() => {
      this._resizeEvent();
      this.modalAfterViewInit$.next(true);
    });
  }

  /**
   * キャンセルボタン押下処理
   */
  public close(): void {
    this.animationStateChanged
      .pipe(
        filter((event) => event.phaseName === 'start'),
        take(1)
      )
      .subscribe(() => {
        this.overlayRef?.detachBackdrop();
      });
    this.animationStateChanged
      .pipe(
        filter((event) => event.phaseName === 'done' && event.toState === 'leave'),
        take(1)
      )
      .subscribe(() => {
        this.overlayRef?.dispose();
      });
    this.animationState = ANIMATION_STATE.LEAVE;
    if (this.focusElement) {
      this.focusElement.focus();
    }
    this.close$.emit();
    timer(ANIMATION_TIMINGS).subscribe(() => {
      this._errorHandlerSvc.clearRetryableError(PageType.SUBPAGE);
      this._alertMsgSvc.removeAllSubAlertMessage();
    });
    this._changeDetectorRef.markForCheck();
  }
}
