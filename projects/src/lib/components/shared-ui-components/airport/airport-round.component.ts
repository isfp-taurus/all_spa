/**
 * 空港選択部品 往復用
 */
import {
  AfterViewInit,
  Component,
  ContentChildren,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  Output,
  QueryList,
} from '@angular/core';
import { SupportClass } from '../../../components/support-class';
// import { fromEvent } from 'rxjs';
// import { isSP } from '../../../helpers';
import { AirportComponent } from './airport.component';

/** フォームの状態の型 */
interface FormStatus {
  showError: boolean;
  blurred: boolean;
  isInvalid: boolean;
  isFocus: boolean;
  touched: boolean;
  isModalOpen: boolean;
  errors: string[];
}

/**
 * 空港選択部品 往復用
 *
 * @param id ボタンに付与するID
 * @param switchBtnHidden 入れ替えボタンの非表示設定
 *
 * 使い方 以下のように2つのエアポートにorigin、destinationを指定し記載する
 * <asw-airport-round>
 *  <asw-airport origin ></asw-airport>
 *  <asw-airport destination ></asw-airport>
 * </asw-airport-round>
 */
@Component({
  selector: 'asw-airport-round',
  templateUrl: './airport-round.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AirportRoundComponent extends SupportClass implements AfterViewInit {
  /** 静的文言 */
  public staticMessage = {
    swapAirportCity: 'alt.swapAirportCity',
  };

  /** 空港選択から受け取るフォームの状態 */
  public status: { origin: FormStatus; destination: FormStatus } = {
    origin: {
      showError: false,
      blurred: false,
      isInvalid: false,
      isFocus: false,
      touched: false,
      isModalOpen: false,
      errors: [],
    },
    destination: {
      showError: false,
      blurred: false,
      isInvalid: false,
      isFocus: false,
      touched: false,
      isModalOpen: false,
      errors: [],
    },
  };

  constructor(protected injector: Injector, private changeDetector: ChangeDetectorRef) {
    super();
    this.el = this.injector.get(ElementRef);
    this.el.nativeElement.$comp = this;
  }

  ngAfterViewInit(): void {
    this.setStatus();
    this.changeStatus();
  }

  destroy() {}

  public readonly el: ElementRef;

  @Input()
  public id = 'AirportRoundComponent';

  @Input()
  public switchBtnHidden = false;

  public originErrorMsg: string = '';
  public destinationErrorMsg: string = '';

  @Output()
  switchEvent = new EventEmitter<boolean>();

  @ContentChildren(AirportComponent)
  public contentChildren!: QueryList<AirportComponent>;

  public get children(): Array<AirportComponent> {
    const children = this.contentChildren.toArray();
    return children;
  }

  /**
   * 空港入れ替えボタン押下時処理
   */
  public switch(): void {
    if (this.children.length != 2) {
      return;
    }
    const airport1 = this.children[0].selectedCompAirport;
    const airport2 = this.children[1].selectedCompAirport;
    const airportVal1 = this.children[0].airportFormControl.value;
    const airportVal2 = this.children[1].airportFormControl.value;

    // 空の場合または入力があって選択可能な空港の場合はtrue
    const check1 = !airportVal1 || (airportVal1 && airportVal1 === airport1?.name);
    const check2 = !airportVal2 || (airportVal2 && airportVal2 === airport2?.name);
    // 入れ替える空港が互いに選択可能ならば入れ替える
    if (check1 && check2 && this.children[0].checkAirport(airport2) && this.children[1].checkAirport(airport1)) {
      this.children[0].setCompAirport(airport2);
      this.children[1].setCompAirport(airport1);
      this.switchEvent.emit(true);
    } else {
      this.switchEvent.emit(false);
    }
  }

  /**
   * フォームの各初期状態の設定
   */
  private setStatus(): void {
    const setComponentStatus = (comp: AirportComponent) => {
      return {
        showError: comp.showError,
        blurred: comp.blurred,
        isInvalid: comp.isInvalid,
        isFocus: comp.isFocus,
        touched: comp.touched,
        isModalOpen: comp.isModalOpen,
        errors: comp.errors,
      };
    };

    const originComp = this.children[0];
    const destinationComp = this.children[1];

    this.status = {
      origin: setComponentStatus(originComp),
      destination: setComponentStatus(destinationComp),
    };

    this._setErrorMsg();
  }

  /**
   * フォームの各状態の変更検知
   */
  private changeStatus(): void {
    const formChanges = (comp: AirportComponent, isOrigin: boolean) => {
      comp.blurredStatusChanged.subscribe((status) => {
        this.status[isOrigin ? origin : destination].blurred = status;
      });

      comp.isFocusStatusChanged.subscribe((status) => {
        this.status[isOrigin ? origin : destination].isFocus = status;
      });

      comp.touchedStatusChanged.subscribe((status) => {
        this.status[isOrigin ? origin : destination].touched = status;
      });

      comp.showErrorStatusChanged.subscribe((status) => {
        this.status[isOrigin ? origin : destination].showError = status;
        // errors(エラー文言)を空に戻す
        if (!status) this.status[isOrigin ? origin : destination].errors = [];
        this._setErrorMsg();
        this.changeDetector.detectChanges();
      });

      comp.isInvalidStatusChanged.subscribe((status) => {
        this.status[isOrigin ? origin : destination].isInvalid = status;
        if (!status) this.status[isOrigin ? origin : destination].errors = [];
        this._setErrorMsg();
        this.changeDetector.detectChanges();
      });

      comp.isModalOpenStatusChanged.subscribe((status) => {
        this.status[isOrigin ? origin : destination].isModalOpen = status;
        if (!status) this.status[isOrigin ? origin : destination].errors = [];
        this._setErrorMsg();
        this.changeDetector.detectChanges();
      });

      comp.errorsStatusChanged.subscribe((error) => {
        this.status[isOrigin ? origin : destination].errors = error;
        this._setErrorMsg();
        this.changeDetector.detectChanges();
      });

      comp.airportFormControlChanged.subscribe(() => {
        if (isOrigin) {
          destinationComp.airportFormControl.updateValueAndValidity();
        } else {
          originComp.airportFormControl.updateValueAndValidity();
        }
      });
    };

    const origin = 'origin';
    const destination = 'destination';
    const originComp = this.children[0];
    const destinationComp = this.children[1];

    originComp.changeToRound();
    destinationComp.changeToRound();
    formChanges(originComp, true);
    formChanges(destinationComp, false);
  }

  /**
   * フォームのエラー状態
   * @param {any} form oritin/destinationのフォーム状態
   * @returns {boolean} エラー状態
   */
  public isError(form: FormStatus): boolean {
    return (
      ((form.showError && form.blurred) || (form.isInvalid && !form.isFocus && form.touched)) &&
      !form.isModalOpen &&
      form.errors.length > 0
    );
  }

  /**
   * エラーメッセージ設定
   */
  private _setErrorMsg(): void {
    this.originErrorMsg = '';
    this.destinationErrorMsg = '';

    if (this.status.origin.errors.length > 0) {
      this.originErrorMsg = this.status.origin.errors[0];
    }

    // 出発地と到着地のエラーメッセージが重複する場合、到着地のエラーメッセージは表示しない
    if (
      this.status.destination.errors.length > 0 &&
      this.status.origin.errors[0] != this.status.destination.errors[0]
    ) {
      this.destinationErrorMsg = this.status.destination.errors[0];
    }
  }
}
