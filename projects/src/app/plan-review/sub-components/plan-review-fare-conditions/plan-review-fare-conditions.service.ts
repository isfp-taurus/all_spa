import { Injectable } from '@angular/core';
import { SupportClass } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';
import {
  FareFullRuleData,
  FFPriorityCodeByFFPriorityCode,
  OutputFareConditionsPerBound,
  OutputFareConditionsPerPtc,
} from '@common/interfaces';

/**
 * プラン確認画面 運賃ルールパーツ用サービス
 */
@Injectable({
  providedIn: 'root',
})
export class PlanReviewFareConditionsService extends SupportClass {
  constructor(private _common: CommonLibService) {
    super();
  }

  /**
   * 運賃ルールパーツ用の出力情報を運賃ルール詳細モーダル用に組み替える処理
   * @param conditions
   * @returns
   */
  convertPerPtcToPerBound(conditions: Array<OutputFareConditionsPerPtc>): OutputFareConditionsPerBound[] {
    return conditions[0]?.bounds.map((bound, i) => {
      const conditionsPerPtc = conditions.map((perPtc) => ({
        ptc: perPtc.ptc,
        fareFamilyName: perPtc.bounds[i]?.fareFamilyName,
        fareBasis: perPtc.bounds[i]?.fareBasis,
        fareDetailLink: perPtc.bounds[i]?.fareDetailLink,
        isDomesticAfterDcs: perPtc.bounds[i]?.isDomesticAfterDcs,
        promo: perPtc.bounds[i]?.promo,
        changeConditions: perPtc.bounds[i]?.changeConditions,
        refundConditions: perPtc.bounds[i]?.refundConditions,
        minStays: perPtc.bounds[i]?.minStays,
        maxStays: perPtc.bounds[i]?.maxStays,
      }));
      return {
        depLoc: bound.depLoc,
        arrLoc: bound.arrLoc,
        condsPerPtc: conditionsPerPtc,
      };
    });
  }

  /**
   * 運賃詳細リンク取得処理
   * @param fareFamilyCode
   * @param priorityCode
   * @param fareFullRuleCache
   * @param ffPByFFPCache
   * @returns
   */
  getFareDetailLink(
    fareFamilyCode: string,
    priorityCode: string,
    fareFullRuleCache: Array<FareFullRuleData>,
    ffPByFFPCache: FFPriorityCodeByFFPriorityCode
  ): string | undefined {
    const cabinClass = ffPByFFPCache[priorityCode]?.[0]?.cabin ?? '';
    const cabinUrlKey = this._getFareFullRuleCabinKey(cabinClass);
    if (!cabinUrlKey) {
      return undefined;
    }
    const fareFullRule = this._getFareRule(fareFamilyCode, fareFullRuleCache);
    return fareFullRule?.[cabinUrlKey as keyof FareFullRuleData];
  }

  /**
   * 運賃フルルール取得処理
   * @param fareFamilyCode
   * @param fareFullRuleCache
   * @returns
   */
  private _getFareRule(
    fareFamilyCode: string,
    fareFullRuleCache: Array<FareFullRuleData>
  ): FareFullRuleData | undefined {
    // 一番長い前方一致データを取得
    for (let i = 1; i <= fareFamilyCode.length; i++) {
      const matchData = fareFullRuleCache.filter((rule) => {
        return rule.fare_family_code_prefix.substring(0, i) === fareFamilyCode.substring(0, i);
      });
      if (matchData.length === 0) {
        return undefined;
      }
      if (matchData.length === 1) {
        return matchData[0];
      }
    }
    return undefined;
  }

  /**
   * FareFullRule_All.json用キャビンクラス別URLキー取得処理
   * @param cabin
   * @returns
   */
  private _getFareFullRuleCabinKey(cabin: string): string | undefined {
    switch (cabin) {
      case 'eco':
        return 'url_economy';
      case 'ecoPremium':
        return 'url_premium_economy';
      case 'business':
        return 'url_business';
      case 'first':
        return 'url_first';
      default:
        return undefined;
    }
  }

  destroy(): void {}
}
