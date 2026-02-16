import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SubComponentModelComponent } from '@common/components/feature-parts/sub-conponent-model/sub-component-model.component';
import { checkFormListValidate } from '@common/helper';
import { CommonLibService } from '@lib/services';
import {
  initialPassengerInformationRequestIslandCardData,
  initialPassengerInformationRequestIslandCardParts,
  PassengerInformationRequestIslandCardData,
  PassengerInformationRequestIslandCardParts,
  PassengerInformationRequestIslandCardReplaceParamMap,
} from './passenger-island-card.state';
import { PassengerInformationRequestIslandCardService } from './passenger-island-card.service';
import { AswValidators } from '@lib/helpers';
/**
 * 搭乗者情報入力　離島カード番号
 */
@Component({
  selector: 'asw-passenger-island-card',
  templateUrl: './passenger-island-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PassengerInformationRequestIslandCardComponent extends SubComponentModelComponent<
  PassengerInformationRequestIslandCardData,
  PassengerInformationRequestIslandCardParts
> {
  // コンストラクタ
  constructor(
    public change: ChangeDetectorRef,
    private _common: CommonLibService,
    private _service: PassengerInformationRequestIslandCardService
  ) {
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
    this.numberFc.setValue(this.data.number);
    this.change.markForCheck();
  }
  /**
   * 外部出力データ更新処理
   * @param isTached フォームコントロールを一度タッチするか（タッチすることで必須チェックなどが起動する）
   */
  public update(isTached: boolean = false) {
    this._data.number = this.numberFc.value ?? '';
    this._data.isError = checkFormListValidate([this.numberFc], isTached);
    this.dataChange.emit(this._data);
  }
  /**
   * データ初期化処理
   */
  _data = initialPassengerInformationRequestIslandCardData();
  _parts = initialPassengerInformationRequestIslandCardParts();
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
  public numberFc = new FormControl('', [
    AswValidators.required({ params: PassengerInformationRequestIslandCardReplaceParamMap.number }),
    AswValidators.alphaNumeric({ params: PassengerInformationRequestIslandCardReplaceParamMap.number }),
  ]);
}
