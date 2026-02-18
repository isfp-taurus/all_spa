import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { deepCopy } from '@common/helper';
import { TravelerType } from '@common/interfaces';
import { MasterStoreKey } from '@conf/asw-master.config';
import { SupportComponent } from '@lib/components/support-class';
import { AswValidators } from '@lib/helpers';
import { AswMasterService, CommonLibService } from '@lib/services';

@Component({
  selector: 'asw-payment-input-shareholder-coupon',
  templateUrl: './payment-input-shareholder-coupon.component.html',
  styleUrls: ['./payment-input-shareholder-coupon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentInputShareholderCouponComponent extends SupportComponent {
  constructor(private _common: CommonLibService, private _aswMasterSvc: AswMasterService) {
    super(_common);
  }

  /** 出発地コード */
  @Input()
  public departureLocationCode?: string;
  /** 出発地名 */
  @Input()
  public departureLocationName?: string;
  /** 到着地コード */
  @Input()
  public arrivalLocationCode?: string;
  /** 到着地名 */
  @Input()
  public arrivalLocationName?: string;
  /** 株主優待番号プレフィックス */
  @Input()
  public numberPrefix?: string;
  /** 株主優待券搭乗者情報 */
  @Input()
  public travelers: TravelerType[] = [];
  @Input()
  public boundIndex: number = 0;
  @Input()
  public flightIndex: number = 0;
  /** 後日回収型株主優待運賃 */
  @Input()
  public isContainedShareholdersBenefitDiscountFareByPostCollection = true;

  @Output()
  public travelersUpdate = new EventEmitter<Partial<TravelerType>>();

  /** 画面入力フォーム */
  public formArray!: FormArray<FormGroup>;
  /** 表示用出発地 */
  public departure?: string;
  /** 表示用到着地 */
  public arrival?: string;

  reload(): void {}

  init(): void {
    // 空港名情報キャッシューデータ取得
    this.subscribeService(
      'Shareholder_Coupon_GetAirportName',
      this._aswMasterSvc.getAswMasterByKey$(MasterStoreKey.M_AIRPORT_I18N),
      (airportCache) => {
        this.deleteSubscription('Shareholder_Coupon_GetAirportName');
        // 発着地名設置
        this.departure =
          airportCache.find(
            (airport: { key: string }) => airport.key === `m_airport_i18n_${this.departureLocationCode}`
          )?.value ?? this.departureLocationName;
        // 到着地名設置
        this.arrival =
          airportCache.find((airport: { key: string }) => airport.key === `m_airport_i18n_${this.arrivalLocationCode}`)
            ?.value ?? this.arrivalLocationName;
      }
    );

    this.formArray = new FormArray(
      this.travelers.map(
        (traveler) =>
          new FormGroup({
            travelerId: new FormControl(traveler.travelerId),
            shareholderBenefitNumber: new FormControl('', [
              AswValidators.required({ params: { key: 0, value: 'label.shareholdersBenefitNumberInput' } }),
              AswValidators.numeric({ params: { key: 0, value: 'label.shareholdersBenefitNumberInput' } }),
              AswValidators.lengths({
                fixed: 8,
                params: [
                  { key: 0, value: 'label.shareholdersBenefitNumberInput' },
                  { key: 1, value: 13, dontTranslate: true },
                ],
              }),
            ]),
            passwordForRegistration: new FormControl('', [
              AswValidators.required({ params: { key: 0, value: 'label.shareholdersBenefit Password' } }),
              AswValidators.alphaNumeric({ params: { key: 0, value: 'label.shareholdersBenefit Password' } }),
              AswValidators.lengths({
                fixed: 16,
                params: [
                  { key: 0, value: 'label.shareholdersBenefit Password' },
                  { key: 1, value: 16, dontTranslate: true },
                ],
              }),
            ]),
          })
      )
    );
  }

  destroy(): void {}

  /**
   *
   * @param index
   */
  public update(index: number) {
    const control = this.formArray.controls[index];
    this.travelersUpdate.emit({
      travelerId: control.get('travelerId')?.value,
      number: (this.numberPrefix ?? '') + (control.get('shareholderBenefitNumber')?.value ?? ''),
      pin: control.get('passwordForRegistration')?.value,
    });
  }

  // 同意文言グループ同意ボタン押下処理時に、株主優待券エリアの入力チェック
  public runValidation() {
    this.formArray.markAllAsTouched();
    for (let i = 0; i < this.formArray.length; i++) {
      this.update(i);
      if (!this.formArray.controls[i].valid) {
        return false;
      }
    }
    return true;
  }
}
