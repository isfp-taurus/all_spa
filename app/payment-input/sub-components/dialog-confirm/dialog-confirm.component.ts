import { trigger, transition, style, animate, AnimationEvent } from '@angular/animations';
import { OverlayRef } from '@angular/cdk/overlay';
import { DOCUMENT } from '@angular/common';
import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  AfterViewInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  HostBinding,
  Renderer2,
  Inject,
} from '@angular/core';
import { DialogSize } from '@lib/interfaces';
import { filter, take } from 'rxjs/operators';

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
  selector: 'asw-dialog-confirm',
  templateUrl: './dialog-confirm.component.html',
  styleUrls: ['./dialog-confirm.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // ダイアログ本体のアニメーション
  animations: [
    trigger('slideContent', [
      transition('void => *', [style({ opacity: 0 }), animate(ANIMATION_TIMINGS, style({ opacity: 1 }))]),
      transition('* => leave', [style({ opacity: 1 }), animate(ANIMATION_TIMINGS, style({ opacity: 0 }))]),
    ]),
  ],
})
export class DialogConfirmComponent implements OnInit, AfterViewInit {
  /**
   * ダイアログのサイズ
   */
  @Input()
  public size = 'small';

  /** ダイアログのメッセージID（必須） */
  @Input()
  public message = 'm_dynamic_message-MSG1688';

  /** 確定ボタンの表示ラベル */
  @Input()
  public confirmBtnLabel = 'label.confirm2';

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

  /** ボタンのタイプ */
  public classType: 'primary' | 'warn' = 'primary';

  /** アニメーション状態の変更イベント */
  public animationStateChanged = new EventEmitter<AnimationEvent>();

  /** アニメーション状態 */
  public animationState = 'center';

  /** フォーカス要素の制御 */
  public focusElement!: any;

  constructor(private _renderer: Renderer2, @Inject(DOCUMENT) private _document: Document) {}

  /**
   * OnInit
   * - ボタンの`class`属性を設定
   */
  public ngOnInit() {}

  /**
   * AfterViewInit
   * - 一番最初のフォーカス可能な要素にフォーカスを移動する
   */
  public ngAfterViewInit() {
    this._renderer.setStyle(this._document.querySelector('.cdk-overlay-container'), 'z-index', '9999');
    this.dialogInfo.nativeElement.focus();
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
        this.dialogInfo.nativeElement.focus();
      } else {
        this.confirmBtn.nativeElement.focus();
      }
      event.preventDefault();
      event.stopPropagation();
    }
  }

  /**
   * 確定ボタン押下時の処理
   */
  public handleConfirmClick() {
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
    this._renderer.removeStyle(this._document.querySelector('.cdk-overlay-container'), 'z-index');
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
}
