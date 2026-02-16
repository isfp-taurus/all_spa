import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SupportModalBlockComponent } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';
import { TranslateService } from '@ngx-translate/core';
import { CheckboxComponent } from '@lib/components';
import { fromEvent } from 'rxjs/internal/observable/fromEvent';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';

/** 運賃オプション選択モーダル サービスクラスを介して呼び出し */
@Component({
  selector: 'asw-other-booking-passenger-modal',
  templateUrl: './other-booking-passenger-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OtherBookingPassengerModalComponent extends SupportModalBlockComponent {
  constructor(private _common: CommonLibService, private _translateService: TranslateService) {
    super(_common);
  }

  // 別予約同行者有りかどうか
  public otherBookingPassengerHave: boolean | null = null;
  public formControlOtherBookingPassengerList: Array<FormControl<boolean | null>> = [
    new FormControl<boolean>(false),
    new FormControl<boolean>(false),
  ];
  // 適用ボタンの活性非活性
  public isApplyEnabled: boolean = false;

  init(): void {
    this.subscribeService(
      'OtherBookingPassengerModalComponent-resize',
      fromEvent(window, 'resize').pipe(debounceTime(200)),
      () => {
        this.resize();
      }
    );
    const { isOtherBookingPassenger } = this.payload;
    if (isOtherBookingPassenger !== undefined) {
      this.otherBookingPassengerHave = isOtherBookingPassenger;
      if (typeof isOtherBookingPassenger === 'boolean') {
        if (isOtherBookingPassenger) {
          this.formControlOtherBookingPassengerList[0].setValue(false);
          this.formControlOtherBookingPassengerList[1].setValue(true);
        } else {
          this.formControlOtherBookingPassengerList[0].setValue(true);
          this.formControlOtherBookingPassengerList[1].setValue(false);
        }
      }
      this.isApplyEnabled =
        (this.formControlOtherBookingPassengerList[0].value ?? false) ||
        (this.formControlOtherBookingPassengerList[1].value ?? false);
    }
  }
  reload(): void {}
  destroy(): void {}

  override close!: (applied?: boolean | null) => {};

  /** モーダルを閉じる */
  closeModal(flag?: boolean | null) {
    this.close(flag);
  }

  /** イベント定義 */

  /** INTERNAL_DESIGN_EVENT  適用ボタン押下時処理 */
  public applyOtherBookingPassenger() {
    this.closeModal(this.otherBookingPassengerHave);
  }

  /** INTERNAL_DESIGN_EVENT 閉じる(×)ボタン押下時処理 */
  public cancelOtherBookingPassenger() {
    this.closeModal();
  }

  /** 別予約同行者無チェックボックス押下時処理 */
  public changeNotHaveOtherBookingPassenger(event: CheckboxComponent) {
    this.otherBookingPassengerHave = !event.checked;
    this.formControlOtherBookingPassengerList[0].setValue(event.checked);
    this.isApplyEnabled = (this.formControlOtherBookingPassengerList[1].value ?? false) || event.checked;
  }

  /** 別予約同行者有チェックボックス押下時処理 */
  public changeHaveOtherBookingPassenger(event: CheckboxComponent) {
    this.otherBookingPassengerHave = event.checked;
    this.formControlOtherBookingPassengerList[1].setValue(event.checked);
    this.isApplyEnabled = event.checked || (this.formControlOtherBookingPassengerList[0].value ?? false);
  }
}
