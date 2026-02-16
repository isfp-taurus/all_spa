import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Optional,
  Output,
  Renderer2,
  Self,
  SkipSelf,
  ViewChild,
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { BaseInputComponent, Parent } from '@lib/components';
import {
  convertSpaceNormalize,
  convertReservationInfo,
  convertPaxName,
  convertPhoneNumber,
  convertToHyphen,
  convertEmailAddress,
} from '@lib/helpers';
import { ValidationErrorInfo } from '@lib/interfaces';

/**
 * ペット情報入力コンポーネント
 *
 * @extends {BaseInputComponent}
 */
@Component({
  selector: 'asw-pet-info-input',
  templateUrl: './pet-info-input.component.html',
  styleUrls: ['./pet-info-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PetInfoInputComponent extends BaseInputComponent {
  /**
   * 入力ボックスの種類
   * - text: 通常のテキスト
   * - password: パスワード
   */
  @Input()
  public type: 'text' | 'password' = 'text';

  /**
   * 入力ボックスの表示タイプ
   * - tooltip: tooltip付き
   * - phone: 電話番号（国コード付き）
   */
  @Input()
  public displayType: 'tooltip' | 'phone' | 'normal' = 'normal';

  /**
   * 入力ボックスのデータ
   */
  @Input()
  public get value() {
    return this.data;
  }
  public set value(value: string) {
    this.data = value;
    this.markForCheck();
  }

  /**
   * 入力ボックスのplaceholder
   */
  @Input()
  public placeholder?: string;

  /**
   * 入力値変換の種類
   * - reserveInfo: 予約情報変換
   * - paxName: 搭乗者名変換
   * - phoneNumber: 電話番号変換
   * - hyphen: ハイフン変換
   * - email: メールアドレス変換
   * - common: 不要空白除去
   */
  @Input()
  public conversionType: 'reserveInfo' | 'paxName' | 'phoneNumber' | 'hyphen' | 'email' | 'common' = 'common';

  /**
   * ツールチップの表示内容（`displayType`が`tooltip`の場合）
   */
  @Input()
  public tooltipContent?: string;

  /**
   * 電話番号の国コード（`displayType`が`phone`の場合）
   */
  @Input()
  public phoneCode?: string;

  private _showClear = true;
  /**
   * 入力内容クリア表示制御フラグ（デフォルト: 表示）
   */
  @Input()
  public get showClear(): boolean {
    return this._showClear;
  }
  public set showClear(value: BooleanInput) {
    this._showClear = coerceBooleanProperty(value);
    this.markForCheck();
  }

  /**
   * 最大桁数の制御
   */
  @Input()
  public maxlength?: string;

  private _disablePaste = false;
  /**
   * ペースト操作禁止制御フラグ（デフォルト：ペースト可能）
   */
  @Input()
  public get disablePaste(): boolean {
    return this._disablePaste;
  }
  public set disablePaste(value: BooleanInput) {
    this._disablePaste = coerceBooleanProperty(value);
    this.markForCheck();
  }
  /**
   * 入力変換前の値保存用
   */
  private _dataBak = '';

  /**
   * フォーカス状態の判定
   */
  public isFocus = false;

  /**
   * invalid状態の判定
   */
  public isInvalid = false;

  /**
   * 入力ボックスのElement
   */
  @ViewChild('inputElement')
  public input: ElementRef | undefined;

  @Input()
  public borderRadius: string = '';

  // 単位
  @Input()
  public petInfoInputUnit: string = '';

  @Input()
  public inputBoxWidth: string = '';

  @Input()
  public petInfoInputSize: string = '';

  @Input()
  public canDisplayErrorMessage: boolean = false;

  @Output()
  public petInfoInputBlurEvent: EventEmitter<ValidationErrorInfo | string> = new EventEmitter<
    ValidationErrorInfo | string
  >();

  constructor(
    @Optional() @SkipSelf() parent: Parent,
    @Self() @Optional() public override control: NgControl,
    public override changeDetectorRef: ChangeDetectorRef,
    public _renderer: Renderer2
  ) {
    super(parent, control, changeDetectorRef);
  }

  /**
   * エラー表示判定
   */
  public override get showError(): boolean {
    if (!this.control || !this.control.errors) {
      this.isInvalid = false;
    } else {
      const { dirty, touched } = this.control;
      const error = !!(dirty || touched);
      // 入力エラー時、this._dataBak（入力変換前）の値がある場合、this._dataBakでinputElement再設定
      if (error && this._dataBak) {
        const inputElement = this.input?.nativeElement;
        if (!(inputElement.value === this._dataBak)) {
          inputElement.value = this._dataBak;
          this._dataBak = '';
        }
      }
      this.isInvalid = error;
    }
    return this.isInvalid;
  }

  /**
   * `blur`イベント
   *
   * @param event
   */
  public onBlurHandle(event: Event) {
    //「.is-focus」がある状態の制御
    this.isFocus = false;
    this.onBlur(event);
    this.displayError();
  }

  public displayError() {
    this.petInfoInputBlurEvent.emit(this.errors?.[0] ?? '');
  }

  /**
   * フォーカス時の処理
   */
  public onFocusHandle() {
    //「.is-focus」がある状態の制御
    this.isFocus = true;
  }

  /**
   * 入力内容クリア
   */
  public clearValue() {
    // コンテンツクリック
    this.data = '';
    this.onChange();
    this.displayError();
  }

  /**
   * 入力値変換処理
   *
   * @param event
   */
  public changeHandle(event?: Event) {
    // 共通変換：不要空白除去
    // ※他の変換をする前に必ず実施する
    const commonConvertData = convertSpaceNormalize(this.data);
    let convertData: string;
    switch (this.conversionType) {
      case 'common':
        convertData = commonConvertData;
        break;
      // 予約情報変換
      case 'reserveInfo':
        convertData = convertReservationInfo(commonConvertData);
        break;
      // 搭乗者名変換
      case 'paxName':
        convertData = convertPaxName(commonConvertData);
        break;
      // 電話番号変換
      case 'phoneNumber':
        convertData = convertPhoneNumber(commonConvertData);
        break;
      // ハイフン変換
      case 'hyphen':
        convertData = convertToHyphen(commonConvertData);
        break;
      // メールアドレス変換
      case 'email':
        convertData = convertEmailAddress(commonConvertData);
        break;
      default:
        convertData = commonConvertData;
    }
    this.data === convertData ? (this._dataBak = '') : ((this._dataBak = this.data), (this.data = convertData));
    this.onChange(event);
    this.displayError();
  }

  /**
   * ペーストイベント監視
   */
  @HostListener('paste', ['$event'])
  public onPaste(event: ClipboardEvent) {
    if (this.disablePaste) {
      event.preventDefault();
    }
  }
}
