import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { CommonLibService } from '@lib/services';
import { SupportModalBlockComponent } from '@lib/components/support-class';
import {
  initialMealApplicationSelectModalPayload,
  MealApplicationSelectModalPayload,
  MealApplicationSelectModalSelectInfo,
} from './meal-application-select-modal-payload.state';
import {
  MealApplicationSelectModalDisplayData,
  MealApplicationSelectModalDisplayDataBase,
  MealApplicationSelectModalDisplayDataChargeable,
  MealApplicationSelectModalDisplayDataPreorder,
  MealApplicationSelectModalDisplayDataSpecialMeal,
  MealApplicationSelectModalDisplayDataSpecialMealCategoly,
} from './meal-application-select-modal.state';
import { StaticMsgPipe } from '@lib/pipes';
import {
  GetMealResponseDataDDChargeableMealListInner,
  GetMealResponseDataDDPreorderMealListInner,
} from 'src/sdk-servicing';
import { MealApplicationMastarData, SERVICE_APPLICATION_UNKOWN_MEAL_ID } from '../../service-application-modal.state';
import { DEFAULT_CURRENCY_CODE_ASW, MealType } from '@common/interfaces';

/**
 * 機内食申込画面 (R01-M053)　機内食メニュー選択モーダル
 */
@Component({
  selector: 'asw-meal-application-select-modal',
  templateUrl: './meal-application-select-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./meal-application-select-modal.scss'],
})
export class MealApplicationSelectModalComponent extends SupportModalBlockComponent {
  constructor(private _common: CommonLibService, private _staticMsg: StaticMsgPipe, public change: ChangeDetectorRef) {
    super(_common);
  }
  reload(): void {}
  init(): void {
    this.refresh();
  }

  destroy(): void {}

  public override payload: MealApplicationSelectModalPayload = initialMealApplicationSelectModalPayload();
  override close: (value?: MealApplicationSelectModalSelectInfo) => void = (
    value?: MealApplicationSelectModalSelectInfo
  ) => {};
  public info: MealApplicationSelectModalDisplayData = {
    specialMealList: [],
    chargeableMealList: [],
    preorderMealList: [],
  };

  /**
   * リフレッシュ処理
   * 表示選択用のリストを作成する
   */
  refresh() {
    this.info.specialMealList = this.getSpecialMealList(this.payload.specialMealList, this.payload.masterData);
    this.info.chargeableMealList = this.getChargeableMealList(this.payload.chargeableMealList);
    this.info.preorderMealList = this.getPreorderMealList(this.payload.preorderMealList);
    this.change.markForCheck();
  }

  /**
   * 特別機内食リストの作成
   * @param data 機内食情報取得APIの特別機内食リスト
   * @param masterData キャッシュ情報
   * @returns 特別機内食リスト
   */
  getSpecialMealList(
    data: { [key: string]: Array<{ code?: Array<string> }> },
    masterData: MealApplicationMastarData
  ): Array<MealApplicationSelectModalDisplayDataSpecialMeal> {
    return Object.entries(data).map(([key, value]) => {
      let items: Array<MealApplicationSelectModalDisplayDataSpecialMealCategoly> = [];
      value.forEach((item) => {
        item.code?.forEach((code) => {
          items.push({
            key: '',
            code: code ?? '',
            type: MealType.SPECIAL,
            disp:
              this.payload?.masterData.specialMeal.find((sp) => sp.ssr_code === code)?.special_meal_name ??
              this._staticMsg.transform(SERVICE_APPLICATION_UNKOWN_MEAL_ID),
            total: 0,
          });
        });
      });
      return {
        category: masterData.listDataCategory.find((list) => list.value === key)?.display_content ?? '',
        items: items,
      };
    });
  }

  /**
   * 有料機内食リストの作成
   * @param data 機内食情報取得APIの有料機内食リスト
   * @returns 有料機内食リスト
   */
  getChargeableMealList(
    data: Array<GetMealResponseDataDDChargeableMealListInner>
  ): Array<MealApplicationSelectModalDisplayDataChargeable> {
    return data.map((charge) => {
      return {
        key: '',
        type: MealType.ANCILLARY,
        code: charge.code ?? '',
        quota: Number(charge.quota ?? '0') === NaN ? 0 : Number(charge.quota ?? '0'),
        disp:
          this.payload?.masterData.listDataSsr.find((map) => map.value === charge.code)?.display_content ??
          this._staticMsg.transform(SERVICE_APPLICATION_UNKOWN_MEAL_ID),
        total: charge.prices?.total ?? 0,
        currencyCode: charge.prices?.currencyCode ?? DEFAULT_CURRENCY_CODE_ASW,
      };
    });
  }

  /**
   * 事前オーダー機内食リストの作成
   * @param data 機内食情報取得APIの事前オーダー機内食リスト
   * @returns 事前オーダー機内食リスト
   */
  getPreorderMealList(
    data: Array<GetMealResponseDataDDPreorderMealListInner>
  ): Array<MealApplicationSelectModalDisplayDataPreorder> {
    return data.map((pre) => {
      return {
        key: pre.key ?? '',
        type: MealType.PREORDER,
        code: pre.code ?? '',
        quota: Number(pre.quota ?? '0'),
        disp: this._staticMsg.transform(pre.key ?? SERVICE_APPLICATION_UNKOWN_MEAL_ID),
        total: 0,
      };
    });
  }

  /**
   * 選択時の処理
   * @param data 選択した機内食情報
   */
  applyItem(data: MealApplicationSelectModalDisplayDataBase) {
    this.close(data);
  }

  /**
   * 閉じるボタン押下処理
   */
  clickClose() {
    this.close();
  }
}
