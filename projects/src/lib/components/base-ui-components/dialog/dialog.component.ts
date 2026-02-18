import { trigger, transition, style, animate, AnimationEvent } from '@angular/animations';
import { OverlayRef } from '@angular/cdk/overlay';
import {
  Component,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  OnInit,
  AfterViewInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  HostBinding,
  HostListener,
  SkipSelf,
  Optional,
  Renderer2,
} from '@angular/core';
import { DialogInfo, DialogType, DialogSize, DialogClickType } from '../../../interfaces';
import { filter, take } from 'rxjs/operators';
import { BaseUIComponent, Parent } from '../base-ui.component';

/** アニメーション時間 */
const ANIMATION_TIMINGS = 400;

/**
 * [BaseUI] 確認ダイアログ
 *
 * @extends {BaseUIComponent}
 * @implements {OnInit}
 * @implements {AfterViewInit}
 */
@Component({
  selector: 'asw-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // ダイアログ本体のアニメーション
  animations: [
    trigger('slideContent', [
      transition('void => *', [style({ opacity: 0 }), animate(ANIMATION_TIMINGS, style({ opacity: 1 }))]),
      transition('* => leave', [style({ opacity: 1 }), animate(ANIMATION_TIMINGS, style({ opacity: 0 }))]),
    ]),
  ],
})
export class DialogComponent extends BaseUIComponent implements OnInit, AfterViewInit {
  /** ダイアログのパターン */
  @Input()
  public type: DialogInfo['type'] = DialogType.CHOICE;

  /**
   * ダイアログのサイズ
   */
  @Input()
  public size: DialogInfo['size'] = DialogSize.S;

  /** ダイアログのメッセージID（必須） */
  @Input()
  public message: DialogInfo['message'] = '';

  /** ダイアログメッセージ内の埋め込み用情報（複数指定可能） */
  @Input()
  public messageParams?: DialogInfo['messageParams'];

  /** 確定ボタンの表示ラベル */
  @Input()
  public confirmBtnLabel = 'label.confirm2';

  /** キャンセルボタンの表示ラベル */
  @Input()
  public closeBtnLabel = 'label.close2';

  /**
   * OverlayRef
   * @see {@link https://material.angular.io/cdk/overlay/overview}
   */
  @Input()
  public overlayRef?: OverlayRef;

  /** `@Output`イベント */
  @Output()
  public buttonClick$: EventEmitter<this> = new EventEmitter<this>();

  @ViewChild('dialogInfo')
  public dialogInfo!: ElementRef;

  /** ボタン(cancel) */
  @ViewChild('cancelBtn')
  public cancelBtn!: ElementRef;

  /** ボタン(confirm) */
  @ViewChild('confirmBtn')
  public confirmBtn!: ElementRef;

  /** largeサイズ用class取得 */
  @HostBinding('class.l-dialog--w500')
  public get dialogSize() {
    return this.size === DialogSize.L;
  }

  @ViewChild('dialogInfoDiv')
  public dialogInfoDiv!: ElementRef;

  /** dialogContainer */
  private _dialogContainer = true;

  /** dialogContainer用class取得 */
  @HostBinding('class.asw-l-dialog__container')
  public get containerClass(): boolean {
    return this._dialogContainer;
  }

  /** dialogContainer用class設定 */
  public set containerClass(value: boolean) {
    this._dialogContainer = value;
  }

  /**
   * クリックタイプ
   * - close: キャンセルボタン
   * - confirm: 確定ボタン
   */
  public clickType!: DialogClickType;

  /** ボタンのタイプ */
  public classType: 'primary' | 'warn' = 'primary';

  /** アニメーション状態の変更イベント */
  public animationStateChanged = new EventEmitter<AnimationEvent>();

  /** アニメーション状態 */
  public animationState = 'center';

  /** フォーカス要素の制御 */
  public focusElement!: any;

  /** コンテンツ外の高さ */
  public withOutContentHeight?: number;

  @HostListener('window:resize')
  public onResize() {
    this._resizeEvent();
  }

  constructor(@Optional() @SkipSelf() parent: Parent, private _renderer: Renderer2) {
    super(parent);
  }

  /**
   * OnInit
   * - ボタンの`class`属性を設定
   */
  public ngOnInit() {
    if (this.type === DialogType.WARN) {
      this.classType = 'warn';
    }
  }

  /**
   * AfterViewInit
   * - 一番最初のフォーカス可能な要素にフォーカスを移動する
   */
  public ngAfterViewInit() {
    this.dialogInfo.nativeElement.focus();
    this._resizeEvent();
  }

  /**
   * ボタンのキーボード操作
   * - 開いているダイアログ内のフォーカス可能要素でtabフォーカスを循環する
   *
   * @param event
   * @param index
   */
  public onHandleKeydown(event: KeyboardEvent, index: number) {
    if (event.key === 'Tab') {
      if (index === 0) {
        this.cancelBtn.nativeElement.focus();
      } else if (index === 1) {
        this.confirmBtn.nativeElement.focus();
      } else {
        this.dialogInfo.nativeElement.focus();
      }
      event.preventDefault();
      event.stopPropagation();
    }
  }

  /**
   * 確定ボタン押下時の処理
   */
  public handleConfirmClick() {
    this.clickType = DialogClickType.CONFIRM;
    this.buttonClick$.emit(this);
    this.close();
  }

  /**
   * キャンセルボタン押下時の処理
   */
  public handleCancelClick() {
    this.clickType = DialogClickType.CLOSE;
    this.buttonClick$.emit(this);
    this.close();
  }

  /**
   * ダイアログ閉じる場合の処理
   */
  public close() {
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
    this.animationState = 'leave';
    if (this.focusElement) {
      this.focusElement.focus();
    }
  }

  public onAnimationStart(event: AnimationEvent) {
    this.animationStateChanged.emit(event);
  }

  public onAnimationDone(event: AnimationEvent) {
    this.animationStateChanged.emit(event);
  }

  private _resizeEvent() {
    const initialBodyH = this.dialogInfo.nativeElement.scrollHeight;
    const windowH = window.innerHeight;
    if (!this.withOutContentHeight) {
      this.withOutContentHeight = this.dialogInfoDiv.nativeElement.clientHeight - initialBodyH;
    }
    const marginVal = window.matchMedia('(max-width: 767px)').matches ? 32 : 56;
    const margin = marginVal * 2;
    const setVal = windowH - margin - this.withOutContentHeight;
    if (setVal < initialBodyH) {
      this._renderer.setStyle(this.dialogInfo.nativeElement, 'overflow-y', 'auto');
      this._renderer.setStyle(this.dialogInfo.nativeElement, 'height', `${setVal}px`);
    } else {
      this._renderer.removeStyle(this.dialogInfo.nativeElement, 'overflow-y');
      this._renderer.removeStyle(this.dialogInfo.nativeElement, 'height');
    }
  }
}
