import { Injectable } from '@angular/core';
import { SupportClass } from '@lib/components/support-class';
import { PlansGetPlansResponse, PlansGetPlansResponsePlansInner } from 'src/sdk-reservation';
import { localPlanPropertySet } from './local-plan.state';

@Injectable({
  providedIn: 'root',
})
export class LocalPlanService extends SupportClass {
  constructor() {
    super();
  }

  destroy(): void {}

  /**
   * ローカルプランリスト取得処理
   */
  getLocalPlans(): PlansGetPlansResponse | undefined {
    const localData = localStorage.getItem('aswPlanList');
    return localData ? JSON.parse(localData) : undefined;
  }

  /**
   * ローカルプランリスト登録処理
   * @param planListData
   */
  setLocalPlans(planListData: PlansGetPlansResponse): void {
    // localPlanPropertySetに規定されたキーだけを持つplanからなるplanListを生成
    const sanitizedPlanList = planListData.plans?.map((plan) => {
      return Object.fromEntries(
        Object.entries(plan).filter(([key, value]) => {
          return localPlanPropertySet.has(key as keyof PlansGetPlansResponsePlansInner);
        })
      );
    });
    const sanitizedData = { plans: sanitizedPlanList };
    localStorage.setItem('aswPlanList', JSON.stringify(sanitizedData));
  }
}
