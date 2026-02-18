import { ModalType, LModalContentsWidthType } from '@lib/components';
import { ModalBlockParts } from '@lib/services';
import {
  GetMealResponseDataDDChargeableMealListInner,
  GetMealResponseDataDDPreorderMealListInner,
} from 'src/sdk-servicing';
import { MealApplicationMastarData } from '../../service-application-modal.state';
import { MealApplicationSelectModalComponent } from './meal-application-select-modal.component';
/**
 * モーダル ペイロード
 * @param MealApplicationSelectModalx 説明文
 */
export interface MealApplicationSelectModalPayload {
  specialMealList: { [key: string]: Array<{ code?: Array<string> }> }; //特別機内食リスト
  chargeableMealList: Array<GetMealResponseDataDDChargeableMealListInner>; //有料機内食リスト
  preorderMealList: Array<GetMealResponseDataDDPreorderMealListInner>; //事前オーダーミール情報リスト
  masterData: MealApplicationMastarData;
  cabin: string;
}

export function initialMealApplicationSelectModalPayload() {
  return {
    specialMealList: {},
    chargeableMealList: [],
    preorderMealList: [],
    masterData: {
      air: {},
      propatie: [],
      preOrderMeal: [],
      specialMeal: [],
      listDataSsr: [],
      listDataCategory: [],
    },
    cabin: '',
  };
}

export interface MealApplicationSelectModalSelectInfo {
  type: string;
  code: string;
  disp: string;
  total: number;
  key: string;
}
/**
 * モーダル、呼び出しパラメータ
 * 例
 * const part = MealApplicationSelectModalPayloadParts();
 * this.modal.showSubModal(part);
 *}
 */
export function MealApplicationSelectModalPayloadParts(): ModalBlockParts {
  return {
    id: 'MealApplicationSelectModalComponent',
    block: MealApplicationSelectModalComponent,
    closeBackEnable: false,
    type: ModalType.TYPE4,
    modalWidth: LModalContentsWidthType.NONE,
    payload: {} as MealApplicationSelectModalPayload,
  };
}
