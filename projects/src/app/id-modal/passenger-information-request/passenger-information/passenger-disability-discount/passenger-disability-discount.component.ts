import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SubComponentModelComponent } from '@common/components/feature-parts/sub-conponent-model/sub-component-model.component';
import { checkFormListValidate } from '@common/helper';
import { CommonLibService } from '@lib/services';
import {
  initialPassengerDisabilityDiscountData,
  initialPassengerDisabilityDiscountParts,
  PassengerInformationRequestDisabilityDiscountData,
  PassengerInformationRequestDisabilityDiscountParts,
  PassengerInformationRequestDisabilityDiscountReplaceParamMap,
} from './passenger-disability-discount.state';
import { AswValidators } from '@lib/helpers';
import { DisabilityType } from '@common/interfaces';
/**
 * 搭乗者情報入力　障がい割旅客種別
 */
@Component({
  selector: 'asw-passenger-disability-discount',
  templateUrl: './passenger-disability-discount.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PassengerInformationRequestDisabilityDiscountComponent extends SubComponentModelComponent<
  PassengerInformationRequestDisabilityDiscountData,
  PassengerInformationRequestDisabilityDiscountParts
> {
  // コンストラクタ
  constructor(public change: ChangeDetectorRef, private _common: CommonLibService) {
    super(change, _common);
  }
  /**
   * 再描画時の処理
   */
  reload() {}
  /**
   * 初期表示処理
   */
  init() {}
  /**
   * 画面終了処理
   */
  destroy() {}
  /**
   * 画面更新処理
   */
  public refresh() {
    if (this.data.disabilityType === DisabilityType.CREGIVER) {
      this.disabilityTypeFc.setValue(`${this.data.disabilityType}${this.data.careReceiverTravelerId}`);
    } else {
      this.disabilityTypeFc.setValue(this.data.disabilityType);
    }
    this.change.markForCheck();
  }
  /**
   * 外部出力データ更新処理
   * @param isTached フォームコントロールを一度タッチするか（タッチすることで必須チェックなどが起動する）
   */
  public update(isTached: boolean = false) {
    const disabilityType = this.disabilityTypeFc.value ?? '';
    if (disabilityType.startsWith(DisabilityType.CREGIVER)) {
      //介護者の場合、搭乗者IDを設定
      this._data.disabilityType = DisabilityType.CREGIVER;
      this._data.careReceiverTravelerId = disabilityType.replace(DisabilityType.CREGIVER, '');
    } else {
      this._data.disabilityType = disabilityType;
      this._data.careReceiverTravelerId = '';
    }

    this._data.isError = checkFormListValidate([this.disabilityTypeFc], isTached);
    this.dataChange.emit(this._data);
  }
  /**
   * データ初期化処理
   */
  _data = initialPassengerDisabilityDiscountData();
  _parts = initialPassengerDisabilityDiscountParts();
  /**
   * データがセットされた際のイベント
   */
  setDataEvent(): void {
    this.refresh();
  }
  /**
   * パーツがセットされた際のイベント
   */
  setPartsEvent(): void {
    this.refresh();
  }
  /**
   * 外部呼出し用 強制refresh
   * */
  public refreshForce() {
    this.refresh();
  }
  /**
   * 外部呼出し用 強制update
   * */
  public updateForce() {
    this.update();
  }
  /**
   * フォームコントロール定義
   */
  public disabilityTypeFc = new FormControl('', [
    AswValidators.required({
      isNotInput: true,
      params: PassengerInformationRequestDisabilityDiscountReplaceParamMap.disabilityType,
    }),
  ]);
}
