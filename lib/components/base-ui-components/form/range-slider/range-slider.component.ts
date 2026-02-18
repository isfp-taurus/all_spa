import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  forwardRef,
  HostListener,
  Inject,
  Input,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DOCUMENT } from '@angular/common';
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import { AmountFormatPipe, DateFormatPipe } from '@lib/pipes';

/**
 * [BaseUI] レンジスライダー
 *
 * @implements OnInit
 * @implements AfterViewInit
 * @implements ControlValueAccessor
 */
@Component({
  selector: 'asw-range-slider',
  templateUrl: './range-slider.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RangeSliderComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RangeSliderComponent implements OnInit, AfterViewInit, ControlValueAccessor {
  /**
   * スライダーのタイプ（必須）
   * - amount: 金額
   * - interval: 時間（例：乗り継ぎ時間など）
   * - time: 時刻
   */
  @Input()
  public type?: 'amount' | 'interval' | 'time';

  /** スライダー範囲の最小値の初期値 */
  private _valueMin = 0;

  /**
   * スライダー範囲の最小値取得
   */
  public get valueMin(): number {
    return this._valueMin;
  }

  /**
   * スライダー範囲の最小値設定
   * - 金額タイプの場合は必須指定とする。
   * - 時間タイプの場合は分単位で必須指定とする。
   *  - 例：10時間の場合は600(10×60分)、10時間30分の場合は630(10×60分+30分)、10時間10分の場合は610(10×60分+10分)。
   * - 時刻タイプの場合は分単位で必須指定とする。
   *  - 例：10時の場合は600(10×60分)、10時30分の場合は630(10×60分+30分)、10時10分の場合は610(10×60分+10分)。
   *
   * @param value
   */
  @Input()
  public set valueMin(value: string | number) {
    this._valueMin = Number(value);
    this._changeDetectorRef.markForCheck();
  }

  /** スライダー範囲の最大値の初期値 */
  private _valueMax = 1439;

  /**
   * スライダー範囲の最大値取得
   */
  public get valueMax(): number {
    return this._valueMax;
  }

  /**
   * スライダー範囲の最大値設定
   * - 金額タイプの場合は必須指定とする。
   * - 時間タイプの場合は分単位で必須指定とする。
   *   - 例：10時間の場合は600(10×60分)、10時間30分の場合は630(10×60分+30分)、10時間10分の場合は610(10×60分+10分)。
   * - 時刻タイプの場合は分単位で必須指定とする。
   *   - 例：10時の場合は600(10×60分)、10時30分の場合は630(10×60分+30分)、10時10分の場合は610(10×60分+10分)。
   *
   * @param value
   */
  @Input()
  public set valueMax(value: string | number) {
    this._valueMax = Number(value);
    this._changeDetectorRef.markForCheck();
  }

  /** 操作ポイントの位置に応じた現在の選択値 */
  public valueNow = 0;

  /** 操作ポイントの位置に応じた現在選択した最小値 */
  public valueNowMin = 0;

  /** 操作ポイントの位置に応じた現在選択した最大値 */
  public valueNowMax = 0;

  /** スライドの移動幅の初期値 */
  private _stepGrid = 1;

  /**
   * スライドの移動幅（間隔）取得
   */
  public get stepGrid(): number {
    return this._stepGrid;
  }

  /**
   * スライドの移動幅（間隔）設定
   * - 金額タイプの場合は指定しない。
   * - 時間タイプの場合は分単位で必須指定とする。
   *   - 例：1時間の場合は60。
   * - 時刻タイプの場合は分単位で必須指定とする。
   *   - 例：1時間の場合は60。
   *
   * @param value
   */
  @Input()
  public set stepGrid(value: string | number) {
    this._stepGrid = Number(value);
    this._changeDetectorRef.markForCheck();
  }

  /**
   * スライダーの操作ポイント数
   * - one: 1つポイント
   * - two: 2つポイント
   */
  @Input()
  public handlePoint: 'one' | 'two' = 'two';

  /**
   * 操作ポイントの読み上げ文言の静的文言キー
   */
  @Input()
  public ariaLabel: string = '';

  private _disabled = false;
  /**
   * スライダーの非活性表示判定
   */
  @Input()
  public get disabled(): boolean {
    return this._disabled;
  }
  public set disabled(value: BooleanInput) {
    this._disabled = coerceBooleanProperty(value);
    this._changeDetectorRef.markForCheck();
  }

  /**
   * レンジスライダー全体の要素
   */
  @ViewChild('rangeSlider')
  public rangeSlider!: ElementRef;

  /**
   * 選択領域の要素
   */
  @ViewChild('rangeSliderRange')
  public rangeSliderRange!: ElementRef;

  /**
   * 1つ目ポイントの要素
   */
  @ViewChild('rangeSliderHandle')
  public rangeSliderHandle!: ElementRef;

  /**
   * 2つ目ポイントの要素
   */
  @ViewChild('rangeSliderHandleTwo')
  public rangeSliderHandleTwo!: ElementRef;

  /**
   * スライダートラックの要素
   */
  @ViewChild('rangeRail')
  public rangeRail!: ElementRef;

  public onModelChange = (_: any) => {
    // do nothing
  };

  public onModelTouched = () => {
    // do nothing
  };

  /**
   * ハンドル部分の横幅（css側で指定されているもの）
   */
  private _handleWidth = 30;

  /**
   * スライダーの移動中フラグ
   */
  private _isMoving = false;

  /**
   * 選択したスライダーの左側からトラックの左側までの水平距離
   */
  private _positionLeft!: number;

  /**
   * スライダーがクリックされた位置(x)
   */
  private _clickX!: number;

  /**
   * 初回ロード用フラグ
   */
  private _isFirstFlag = true;

  constructor(
    @Inject(DOCUMENT) private _document: Document,
    private _renderer: Renderer2,
    private _el: ElementRef,
    private _datePipe: DateFormatPipe,
    private _amountPipe: AmountFormatPipe,
    private _changeDetectorRef: ChangeDetectorRef
  ) {}

  /**
   * OnInit
   * - レンジスライダータイプごとの初期処理を行う
   */
  public ngOnInit() {
    this._typeConvertInit();
  }

  /**
   * 現在選択値に従ってスライダーの位置を初期化する
   */
  public ngAfterViewInit() {
    if (this.isOneHandlePoint) {
      this._move(this.valueNow);
    } else {
      this._moveTwoHandle(this.valueNowMin, this.valueNowMax);
    }
    this._renderer.addClass(this.rangeSlider.nativeElement, 'is-initial');
    this._isFirstFlag = false;
  }

  /**
   * formcontrolの初期値を設定する
   *
   * @param value
   */
  public writeValue(value: string | number | string[] | number[]) {
    const hasValue = !!value;
    if (!this.isOneHandlePoint) {
      this.valueNowMin = hasValue && value instanceof Array ? Number(value[0]) : this.valueMin;
      this.valueNowMax = hasValue && value instanceof Array ? Number(value[1]) : this.valueMax;
      if (!this._isFirstFlag) {
        this._moveTwoHandle(this.valueNowMin, this.valueNowMax);
        this._changeDetectorRef.markForCheck();
      }
    } else {
      this.valueNow = hasValue ? Number(value) : this.valueMin;
      if (!this._isFirstFlag) {
        this._move(this.valueNow);
        this._changeDetectorRef.markForCheck();
      }
    }
  }

  public registerOnChange(fn: any) {
    this.onModelChange = fn;
  }

  public registerOnTouched(fn: any) {
    this.onModelTouched = fn;
  }

  /**
   * controlのdisabled制御
   *
   * @see {@link ControlValueAccessor.setDisabledState}
   * @param isDisabled
   */
  public setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
  }

  /**
   * 操作ポイントのマウスダウンイベント
   *
   * @param event
   * @param isOneHandle 移動したポイントが1つ目か2つ目かを示すフラグ（true: 1つ目、false: 2つ目）
   */
  public onMouseDown(event: MouseEvent, isOneHandle: boolean) {
    this._eventStartCommon(event, isOneHandle);
  }

  /**
   * 操作ポイントのタッチスタートイベント
   *
   * @param event
   * @param isOneHandle 移動したポイントが1つ目か2つ目かを示すフラグ（true: 1つ目、false: 2つ目）
   */
  public onTouchStart(event: TouchEvent, isOneHandle: boolean) {
    this._eventStartCommon(event, isOneHandle);
  }

  /**
   * マウスアップイベント
   *
   * @param event
   */
  @HostListener('window:mouseup', ['$event'])
  public mouseup(event: MouseEvent) {
    this._eventEndCommon(event);
  }

  /**
   * タッチ終了イベント
   *
   * @param event
   */
  public onTouchEnd(event: TouchEvent) {
    this._eventEndCommon(event);
  }

  /**
   * マウス移動イベント
   *
   * @param event
   */
  @HostListener('window:mousemove', ['$event'])
  public mousemove(event: MouseEvent) {
    this._eventMoveCommon(event);
  }

  /**
   * タッチ移動イベント
   *
   * @param event
   */
  public onTouchMove(event: TouchEvent) {
    this._eventMoveCommon(event);
  }

  /**
   * 操作ポイント数が1つかどうかを判定する
   *
   * @returns
   */
  public get isOneHandlePoint(): boolean {
    return this.handlePoint === 'one';
  }

  /**
   * 操作ポイントが1つの場合、スライド移動を制御する
   *
   * @param valueNow 移動後の現在値
   * @param slidePos 移動後の位置パーセンテージ
   */
  private _move(valueNow: number, slidePos?: number) {
    // valueとcontrolの関連
    this.valueNow = valueNow;
    if (!this._isFirstFlag) {
      this.onModelChange(valueNow);
    }

    const _valueNow = valueNow;
    const _valueMin = this.valueMin;
    const _valueMax = this.valueMax;
    const _diffValue = _valueMax - _valueMin;
    const _valuePosition = _valueNow - _valueMin;

    let handleLeft;
    let rangeWidth;
    if (_valueNow <= _valueMin) {
      handleLeft = `calc(0% - ${this._handleWidth / 2}px)`;
      rangeWidth = '0px';
    } else if (_valueNow >= _valueMax) {
      handleLeft = `calc(100% - ${this._handleWidth / 2}px)`;
      rangeWidth = '100%';
    } else {
      if (slidePos) {
        handleLeft = `calc(${slidePos}% - ${this._handleWidth / 2}px)`;
        rangeWidth = `${slidePos}%`;
      } else {
        handleLeft = `calc(${(_valuePosition / _diffValue) * 100}% - ${this._handleWidth / 2}px)`;
        rangeWidth = `${(_valuePosition / _diffValue) * 100}%`;
      }
    }
    this._renderer.setStyle(this.rangeSliderHandle.nativeElement, 'left', handleLeft);
    this._renderer.setStyle(this.rangeSliderRange.nativeElement, 'width', rangeWidth);
    if (this.rangeSlider.nativeElement.classList.contains('is-initial')) {
      this._renderer.removeClass(this.rangeSlider.nativeElement, 'is-initial');
    }
  }

  /**
   * 操作ポイントが2つの場合、スライド移動を制御する
   *
   * @param valueMinHandle 移動後の1つ目ポイントの現在値
   * @param valueMaxHandle 移動後の2つ目ポイントの現在値
   * @param slidePos スライド移動した後の位置パーセンテージ
   * @param isOneHandle 移動したポイントが1つ目か2つ目かを示すフラグ（true: 1つ目、false: 2つ目）
   */
  private _moveTwoHandle(valueMinHandle: number, valueMaxHandle: number, slidePos?: number, isOneHandle?: boolean) {
    this.valueNowMin = valueMinHandle;
    this.valueNowMax = valueMaxHandle;
    // valueとcontrolの関連
    if (!this._isFirstFlag) {
      this.onModelChange([valueMinHandle, valueMaxHandle]);
    }

    const _valueMinMin = this.valueMin;
    const _valueMaxMax = this.valueMax;
    const _diffValue = _valueMaxMax - _valueMinMin;
    const _valuePositionMin = valueMinHandle - _valueMinMin;
    const _valuePositionMax = valueMaxHandle - _valueMinMin;

    let handleMinLeft;
    let handleMaxLeft;

    if (valueMinHandle === _valueMinMin && valueMaxHandle < _valueMaxMax) {
      handleMaxLeft = `calc(${(_valuePositionMax / _diffValue) * 100}% - ${this._handleWidth / 2}px)`;
      handleMinLeft = `calc(0% - ${this._handleWidth / 2}px)`;
    } else if (valueMaxHandle === _valueMaxMax && valueMinHandle > _valueMinMin) {
      handleMinLeft = `calc(${(_valuePositionMin / _diffValue) * 100}% - ${this._handleWidth / 2}px)`;
      handleMaxLeft = `calc(100% - ${this._handleWidth / 2}px)`;
    } else if (valueMaxHandle === _valueMaxMax && valueMinHandle === _valueMinMin) {
      handleMinLeft = `calc(0% - ${this._handleWidth / 2}px)`;
      handleMaxLeft = `calc(100% - ${this._handleWidth / 2}px)`;
    } else {
      if (slidePos) {
        if (isOneHandle) {
          handleMinLeft = `calc(${slidePos}% - ${this._handleWidth / 2}px)`;
        } else {
          handleMaxLeft = `calc(${slidePos}% - ${this._handleWidth / 2}px)`;
        }
      } else {
        handleMinLeft = `calc(${(_valuePositionMin / _diffValue) * 100}% - ${this._handleWidth / 2}px)`;
        handleMaxLeft = `calc(${(_valuePositionMax / _diffValue) * 100}% - ${this._handleWidth / 2}px)`;
      }
    }
    handleMinLeft ? this._renderer.setStyle(this.rangeSliderHandle.nativeElement, 'left', handleMinLeft) : null;
    handleMaxLeft ? this._renderer.setStyle(this.rangeSliderHandleTwo.nativeElement, 'left', handleMaxLeft) : null;

    const _valuePosition = valueMaxHandle - valueMinHandle;
    const _rangeWidth = (_valuePosition / _diffValue) * 100;
    this._renderer.setStyle(this.rangeSliderRange.nativeElement, 'width', `${_rangeWidth > 0 ? _rangeWidth : 0}%`);
    this._renderer.setStyle(
      this.rangeSliderRange.nativeElement,
      'left',
      `calc(${(_valuePositionMin / _diffValue) * 100}%`
    );
    if (this.rangeSlider.nativeElement.classList.contains('is-initial')) {
      this._renderer.removeClass(this.rangeSlider.nativeElement, 'is-initial');
    }
  }

  /**
   * 操作ポイントが1つの場合、移動時のポイントの現在値と位置パーセンテージを計算する
   *
   * @param event
   */
  private _slide(event: MouseEvent | TouchEvent) {
    const _railWidth = this.rangeRail.nativeElement.clientWidth;
    // 移動したマウスからトラックの左側までの距離
    let _leftPos;
    if (event instanceof MouseEvent) {
      _leftPos = this._positionLeft + event.screenX - this._clickX;
    } else {
      _leftPos = this._positionLeft + event.changedTouches[0].screenX - this._clickX;
    }
    //トラック上で移動したスライダーの中心の位置パーセンテージ
    const _handlePos = ((_leftPos + this._handleWidth / 2) / _railWidth) * 100;
    const _valueMin = this.valueMin;
    const _valueMax = this.valueMax;
    const _stepGrid = this.stepGrid;
    const _stepMax = (_valueMax - _valueMin) / _stepGrid;

    const _stepPos = Math.round((_handlePos / 100) * _stepMax);
    const _value = _stepPos * _stepGrid + _valueMin;
    const _currentValue = this.valueNow;

    if (!(_currentValue === _value) && _value >= _valueMin && _value <= _valueMax) {
      const _slidePos = (_stepPos / _stepMax) * 100;
      this._move(_value, _slidePos);
    } else if (!(_currentValue === _value) && _value > _valueMax) {
      const _slidePos = 100;
      this._move(_valueMax, _slidePos);
    }
  }

  /**
   * 操作ポイントが2つの場合、移動時のポイントの現在値と位置パーセンテージを計算する
   *
   * @param event
   */
  private _slideTwoHandle(event: MouseEvent | TouchEvent) {
    const _railWidth = this.rangeRail.nativeElement.clientWidth;
    // 移動したマウスからトラックの左側までの距離
    let _leftPos;
    if (event instanceof MouseEvent) {
      _leftPos = this._positionLeft + event.screenX - this._clickX;
    } else {
      _leftPos = this._positionLeft + event.changedTouches[0].screenX - this._clickX;
    }
    //トラック上で移動したスライダーの中心の位置パーセンテージ
    const _handlePos = ((_leftPos + this._handleWidth / 2) / _railWidth) * 100;
    const _valueMinMin = this.valueMin;
    const _valueMinNow = this.valueNowMin;
    const _valueMinMax = this.valueNowMax;
    const _valueMaxMin = this.valueNowMin + this.stepGrid;
    const _valueMaxNow = this.valueNowMax;
    const _valueMaxMax = this.valueMax;
    const _stepGrid = this.stepGrid;
    const _stepMax = (_valueMaxMax - _valueMinMin) / _stepGrid;

    let _activeValueMin;
    let _activeValueNow;
    let _activeValueMax;
    let _currentValue;
    let _isMinHandle;
    const elementClass = this._el.nativeElement.querySelector('.is-active');
    if (elementClass && elementClass.classList.contains('ts-handle-min')) {
      _activeValueMin = _valueMinMin;
      _activeValueNow = _valueMinNow;
      _activeValueMax = _valueMinMax;
      _currentValue = _valueMinNow;
      _isMinHandle = true;
    } else {
      _activeValueMin = _valueMaxMin;
      _activeValueNow = _valueMaxNow;
      _activeValueMax = _valueMaxMax;
      _currentValue = _valueMaxNow;
      _isMinHandle = false;
    }
    const _stepPos = Math.round((_handlePos / 100) * _stepMax);
    const _value = _stepPos * _stepGrid + _valueMinMin;
    if (
      !(_currentValue === _value) &&
      _activeValueNow <= _activeValueMax &&
      _activeValueNow >= _activeValueMin &&
      _value >= _activeValueMin
    ) {
      if (_value >= _valueMinMin && _value <= _valueMaxMax && _value <= _activeValueMax) {
        const _slidePos = (_stepPos / _stepMax) * 100;
        if (_isMinHandle && !(_value === _valueMaxNow)) {
          this._moveTwoHandle(_value, _valueMaxNow, _slidePos, true);
        } else {
          this._moveTwoHandle(_valueMinNow, _value, _slidePos, false);
        }
      } else if (_value >= _valueMaxMax && _value > _activeValueMax) {
        const _slidePos = 100;
        if (!_isMinHandle) {
          this._moveTwoHandle(_valueMinNow, _valueMaxMax, _slidePos, false);
        }
      }
    }
  }

  /**
   * マウスダウンとタッチスタートの共通イベント
   *
   * @param event
   * @param isOneHandle 移動したポイントが1つ目か2つ目かを示すフラグ（true: 1つ目、false: 2つ目）
   */
  private _eventStartCommon(event: MouseEvent | TouchEvent, isOneHandle: boolean) {
    if (this._isMoving) {
      return;
    }
    this._isMoving = true;
    // マウスダウンかタッチスタートかを判定する
    if (event instanceof MouseEvent) {
      this._clickX = event.screenX;
    } else if (event instanceof TouchEvent) {
      this._clickX = event.changedTouches[0].screenX;
    }
    const handleElements = this.rangeSlider.nativeElement.querySelectorAll('.c-form-element-range__handle');
    Array.from(handleElements).forEach((element) => {
      this._renderer.removeClass(element, 'is-lastTouch');
    });
    let addClassElement;
    if (isOneHandle) {
      addClassElement = this.rangeSliderHandle.nativeElement;
    } else {
      addClassElement = this.rangeSliderHandleTwo.nativeElement;
    }
    this._renderer.addClass(addClassElement, 'is-active');
    this._renderer.addClass(addClassElement, 'is-lastTouch');
    addClassElement.focus();
    this._positionLeft = addClassElement.offsetLeft;
    event.preventDefault();
  }

  /**
   * マウス操作とタッチ操作のイベント終了の共通処理
   *
   * @param event
   */
  private _eventEndCommon(event: MouseEvent | TouchEvent) {
    if (!this._isMoving) {
      return;
    }
    this._isMoving = false;
    this._renderer.removeClass(this.rangeSliderHandle.nativeElement, 'is-active');
    this.rangeSliderHandleTwo ? this._renderer.removeClass(this.rangeSliderHandleTwo.nativeElement, 'is-active') : null;
    this.onModelTouched();
    event.preventDefault();
  }

  /**
   * 移動イベントの共通処理
   *
   * @param event
   */
  private _eventMoveCommon(event: MouseEvent | TouchEvent) {
    if (!this._isMoving) {
      return;
    }
    if (this.isOneHandlePoint) {
      this._slide(event);
    } else {
      this._slideTwoHandle(event);
    }
    event.preventDefault();
  }

  /**
   * キーボードイベント
   *
   * @param event
   * @param isOneHandle 移動したポイントが1つ目か2つ目かを示すフラグ（true: 1つ目、false: 2つ目）
   */
  public onHandleKeydown(event: KeyboardEvent, isOneHandle: boolean) {
    if (this.isOneHandlePoint) {
      this._oneHandleKeydown(event);
    } else {
      this._twoHandleKeydown(event, isOneHandle);
    }
  }

  /**
   * 操作ポイントが1つの場合のキーボード操作イベント
   *
   * @param event
   */
  private _oneHandleKeydown(event: KeyboardEvent) {
    const _stepGrid = this.stepGrid;
    const _valueMin = this.valueMin;
    const _valueMax = this.valueMax;
    let _flag = false;
    let _value = this.valueNow;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        _flag = true;
        if (_value + _stepGrid <= _valueMax) {
          _value = _value + _stepGrid;
          this._move(_value);
        } else if (_value !== _valueMax) {
          this._move(_valueMax);
        }
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        _flag = true;
        if (_value === _valueMax && (_valueMax - _valueMin) % _stepGrid !== 0) {
          const stepsNub = Math.trunc((_valueMax - _valueMin) / _stepGrid);
          const lastStep = _valueMax - (_valueMin + _stepGrid * stepsNub);
          this._move(_valueMax - lastStep);
        } else if (_value - _stepGrid >= _valueMin) {
          _value = _value - _stepGrid;
          this._move(_value);
        }
        break;
      case 'Home':
        _flag = true;
        if (_value > _valueMin) {
          _value = _valueMin;
          this._move(_value);
        }
        break;
      case 'End':
        _flag = true;
        if (_value < _valueMax) {
          _value = _valueMax;
          this._move(_value);
        }
        break;
      default:
        break;
    }
    if (_flag) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  /**
   * 操作ポイントが2つの場合のキーボード操作イベント
   *
   * @param event
   * @param isOneHandle 移動したポイントが1つ目か2つ目かを示すフラグ（true: 1つ目、false: 2つ目）
   */
  private _twoHandleKeydown(event: KeyboardEvent, isOneHandle: boolean) {
    const _valueMinMin = this.valueMin;
    const _valueMinMax = this.valueNowMax - this.stepGrid;
    const _valueMaxMin = this.valueNowMin + this.stepGrid;
    const _valueMaxMax = this.valueMax;
    const _stepGrid = this.stepGrid;
    let _flag = false;
    let _valueMinHandle = this.valueNowMin;
    let _valueMaxHandle = this.valueNowMax;
    if (isOneHandle) {
      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowUp':
          _flag = true;
          if (_valueMinHandle + _stepGrid <= _valueMinMax) {
            _valueMinHandle = _valueMinHandle + _stepGrid;
          }
          break;
        case 'ArrowLeft':
        case 'ArrowDown':
          _flag = true;
          if (_valueMinHandle - _stepGrid >= _valueMinMin) {
            _valueMinHandle = _valueMinHandle - _stepGrid;
          }
          break;
        case 'Home':
          _flag = true;
          if (_valueMinHandle > _valueMinMin) {
            _valueMinHandle = _valueMinMin;
          }
          break;
        case 'End':
          _flag = true;
          if (_valueMinHandle < _valueMinMax) {
            _valueMinHandle = _valueMinMax;
          }
          break;
        default:
          break;
      }
    } else {
      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowUp':
          _flag = true;
          if (_valueMaxHandle + _stepGrid <= _valueMaxMax) {
            _valueMaxHandle = _valueMaxHandle + _stepGrid;
          } else if (_valueMaxHandle !== _valueMaxMax) {
            _valueMaxHandle = _valueMaxMax;
          }
          break;
        case 'ArrowLeft':
        case 'ArrowDown':
          _flag = true;
          if (
            _valueMaxHandle - _stepGrid >= _valueMaxMin &&
            _valueMaxHandle === _valueMaxMax &&
            (_valueMaxMax - _valueMinHandle) % _stepGrid !== 0
          ) {
            const stepsNub = Math.trunc((_valueMaxMax - _valueMinHandle) / _stepGrid);
            const lastStep = _valueMaxMax - (_valueMinHandle + _stepGrid * stepsNub);
            _valueMaxHandle = _valueMaxMax - lastStep;
          } else if (_valueMaxHandle - _stepGrid >= _valueMaxMin) {
            _valueMaxHandle = _valueMaxHandle - _stepGrid;
          }
          break;
        case 'Home':
          _flag = true;
          if (_valueMaxHandle > _valueMaxMin) {
            _valueMaxHandle = _valueMaxMin;
          }
          break;
        case 'End':
          _flag = true;
          if (_valueMaxHandle < _valueMaxMax) {
            _valueMaxHandle = _valueMaxMax;
          }
          break;
        default:
          break;
      }
    }
    if (_flag) {
      this._moveTwoHandle(_valueMinHandle, _valueMaxHandle);
      event.preventDefault();
      event.stopPropagation();
    }
  }

  /**
   * レンジスライダータイプごとの初期処理を行う
   */
  private _typeConvertInit() {
    if (this.type === 'amount') {
      // 金額タイプの初期化処理を行う。
      this._amountConvertInit();
    }
  }

  /**
   * 金額タイプの初期化処理
   */
  private _amountConvertInit() {
    const divisibleCalcFloor = (data: number, divisionNumber: number): number => {
      if (data % divisionNumber === 0) {
        return data;
      } else {
        return Math.floor(Math.trunc(data) / divisionNumber) * divisionNumber;
      }
    };
    const divisibleCalcCeil = (data: number, divisionNumber: number): number => {
      if (data % divisionNumber === 0) {
        return data;
      } else {
        return Math.ceil(Math.trunc(Math.ceil(data)) / divisionNumber) * divisionNumber;
      }
    };
    const calcResult = (this.valueMax - this.valueMin) / 100;
    const stepGrid = Math.trunc(calcResult);
    const stepGridLength = String(stepGrid).length;
    let stepGridVal = '1';
    if (stepGrid !== 0) {
      for (let i = 0; i < stepGridLength; i++) {
        stepGridVal = stepGridVal + '0';
      }
    }
    this.stepGrid = stepGridVal;
    this.valueMin = divisibleCalcFloor(this.valueMin, this.stepGrid);
    this.valueMax = divisibleCalcCeil(this.valueMax, this.stepGrid);
    if (!this.isOneHandlePoint) {
      this.valueNowMin = divisibleCalcCeil(this.valueNowMin, this.stepGrid);
      this.valueNowMax = divisibleCalcCeil(this.valueNowMax, this.stepGrid);
    }
  }

  /**
   * 時間、時刻の日付文字列
   *
   * @param data 時間/時刻
   * @returns
   */
  public dateString(data: number): string {
    const hours = String(Math.trunc(data / 60)).padStart(2, '0');
    const min = String(data % 60);
    let minutes = '';
    if (data === 0 || min === '0') {
      minutes = '00';
    } else if (data < 60) {
      minutes = data.toString();
    } else {
      minutes = min;
    }
    return hours + ':' + minutes;
  }

  /**
   * aria-valuetext属性取得処理
   * @param value
   * @returns aria-valuetext属性
   */
  public getValueText(value: number) {
    switch (this.type) {
      case 'amount':
        return this._amountPipe.transform(value);
      case 'interval':
        return this._datePipe.transform(this.dateString(value), 'default_flightTotalTime');
      case 'time':
        return this._datePipe.transform(this.dateString(value), 'default_departuredate.time');
      default:
        return value;
    }
  }
}
