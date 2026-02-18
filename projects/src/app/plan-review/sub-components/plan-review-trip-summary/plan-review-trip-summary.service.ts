import { ElementRef, Injectable, QueryList } from '@angular/core';
import { Router } from '@angular/router';
import { getCabinClassNameKey, getKeyListData } from '@common/helper';
import {
  MListData,
  MServiceContentsI18N,
  PlanReviewOutputFlightOutputCabinClass,
  ServiceDescriptionsBySegment,
} from '@common/interfaces';
import { CurrentCartStoreService, FindMoreFlightsStoreService } from '@common/services';
import { RoutesResRoutes } from '@conf/routes.config';
import { SupportClass } from '@lib/components/support-class';
import { DialogClickType } from '@lib/interfaces';
import { StaticMsgPipe } from '@lib/pipes';
import { AswMasterService, CommonLibService, DialogDisplayService } from '@lib/services';
import {
  BoundFlightsInner,
  CreateCartResponseDataSearchCriteriaSearchAirOffer,
  PostGetCartResponseData,
  PostGetCartResponseDataPlan,
} from 'src/sdk-reservation';
import { FindMoreFlightsRequest } from 'src/sdk-search';
import { serviceTooltipImgAlts, serviceTooltipImgs } from './plan-review-trip-summary.state';

/**
 * 旅程情報用サービス
 */
@Injectable({
  providedIn: 'root',
})
export class PlanReviewTripSummaryService extends SupportClass {
  constructor(
    private _common: CommonLibService,
    private _router: Router,
    private _dialogSvc: DialogDisplayService,
    private _staticMsgPipe: StaticMsgPipe,
    private _currentCartStoreService: CurrentCartStoreService,
    private _fMFStoreService: FindMoreFlightsStoreService,
    private _masterSvc: AswMasterService
  ) {
    super();
  }

  /**
   * 再検索処理 (旅程全体／バウンド変更共用)
   * @param displayCartPlan
   * @param searchAirOffer
   * @param boundIndex
   * @param isDomesticAfterDcs
   */
  searchAgain(
    displayCartPlan: PostGetCartResponseDataPlan,
    searchAirOffer: CreateCartResponseDataSearchCriteriaSearchAirOffer,
    boundIndex: number | undefined,
    isDomesticAfterDcs: boolean
  ): void {
    // 検索条件のバウンド数に応じた空席照会結果画面に遷移
    this.backToFlightAvailability(searchAirOffer?.itineraries?.length ?? 0, boundIndex, isDomesticAfterDcs);
  }

  /**
   * バウンド数に応じた遷移先に遷移する
   * @param numberOfBound
   * @param boundIndex バウンド再検索時に指定するインデックス
   * @param isDomesticAfterDcs DCS移行開始日以降かつ国内単独旅程か否か
   */
  backToFlightAvailability(numberOfBound: number, boundIndex: number | undefined, isDomesticAfterDcs: boolean): void {
    if (numberOfBound && numberOfBound <= 2) {
      // 片道・往復旅程の場合
      // FY25: DCS移行開始日以降かつ日本国内単独旅程の場合、往復(国内)へ
      const navigateTo = isDomesticAfterDcs
        ? RoutesResRoutes.ROUNDTRIP_FLIGHT_AVAILABILITY_DOMESTIC
        : RoutesResRoutes.ROUNDTRIP_FLIGHT_AVAILABILITY_INTERNATIONAL;
      this._router.navigateByUrl(navigateTo);
    } else if (boundIndex !== undefined) {
      // 複雑旅程かつバウンド指定の場合
      const cartData = this._currentCartStoreService.CurrentCartData.data;
      // FmF画面用storeに受け渡し情報を格納
      const params: FindMoreFlightsRequest = {
        airOfferId: cartData?.plan?.airOfferIds?.[0]?.offerNdcId ?? '',
        moreFlightsBoundReference: boundIndex + 1,
        isOnlyDomesticAfterDCS: isDomesticAfterDcs,
        promotion: { code: cartData?.searchCriteria?.searchAirOffer?.promotion?.code ?? '' },
      };
      this._fMFStoreService.updateFindMoreFlights({ searchCondition: params });
      this._router.navigateByUrl(RoutesResRoutes.COMPLEX_MORE_FLIGHTS);
    } else if (numberOfBound) {
      // 複雑旅程かつ旅程全体再検索の場合
      this._router.navigateByUrl(RoutesResRoutes.COMPLEX_FLIGHT_AVAILABILITY);
    }
  }

  /**
   * 画面出力用キャビンクラス情報取得処理
   * @param flight
   * @param listDataAll
   */
  getOutputCabinClass(
    flight: BoundFlightsInner,
    listDataAll: Array<MListData>
  ): PlanReviewOutputFlightOutputCabinClass {
    let outputCabinClass = { value: '', url: '' };
    const lang = this._common.aswContextStoreService.aswContextData.lang;
    const cabinNames = getKeyListData(listDataAll, 'PD_930', lang);
    const isDomestic = !!flight?.isJapanDomesticFlight;
    const cabinClassNameKey = getCabinClassNameKey(flight?.cabin ?? '', isDomestic);
    outputCabinClass.value =
      cabinNames.find((cabinName) => cabinName.value === cabinClassNameKey)?.display_content ?? '';

    if (flight?.isNhGroupOperated && isDomestic) {
      // 国内セグの場合
      let urlKey = '';
      switch (flight?.cabin) {
        case 'eco':
          urlKey = 'url.meta.class.domestic.eco';
          break;
        case 'first':
          urlKey = 'url.meta.class.domestic.premium';
          break;
        default:
          break;
      }
      outputCabinClass.url = this._masterSvc.getMPropertyByKey('reservationconfirm', urlKey);
    } else if (flight?.isNhGroupOperated) {
      // 国際セグの場合
      const urlKey = `url.meta.class.${flight?.cabin ?? ''}`;
      outputCabinClass.url = this._masterSvc.getMPropertyByKey('reservationconfirm', urlKey);
    }
    return outputCabinClass;
  }

  /**
   * 機内サービスツールチップ用imgタグのkey-value形式Obj取得処理
   * @returns
   */
  getServiceTooltipImgsAll(): { [key: string]: string } {
    // M_SERVICE_CONTENTSのSERVICE_TYPEに規定された、サービスごとの数字
    // FY25: 「食事なし」用アイコン追加
    const serviceTypeList = ['1', '2', '3', 'other', '4', '5', '6'];
    const entries = serviceTypeList.map((key) => [key, this._getServiceTooltipImg(key)]);
    // FY25: mealCodeに応じた食事アイコン
    // ※アイコン出し分けは整理中・スコープアウト
    const additionalIconList = ['M', 'R', 'S', 'N'].map((mealType) => [
      mealType,
      this._getServiceTooltipImg('3', mealType),
    ]);
    entries.push(...additionalIconList);
    return Object.fromEntries(entries);
  }

  /**
   * 機内サービスツールチップ用imgタグ(含: alt文言)取得処理
   * @param serviceType
   * @returns
   */
  private _getServiceTooltipImg(serviceType: string, mealType?: string): string {
    const altMsgKey = serviceTooltipImgAlts[mealType || serviceType] ?? '';
    const translatedAlt = this._staticMsgPipe.transform(altMsgKey);
    return serviceTooltipImgs[mealType || serviceType]?.replace('{{0}}', translatedAlt);
  }

  /**
   * 機内サービスツールチップ文言取得処理
   * @param cache サービスコンテンツ(国際化)キャッシュ
   * @param cabin キャビンクラス
   * @param isDomestic 国内線の場合、true
   * @param mealCode ミールコード
   * @returns サービス毎のツールチップ文言
   */
  getServiceDescriptions(
    cache: MServiceContentsI18N,
    cabin: string,
    isDomestic: boolean,
    mealCode?: string
  ): ServiceDescriptionsBySegment {
    const serviceTypeList = [...Array(6)].map((_, i) => String(i + 1)); // ['1', '2', '3', '4', '5', '6']
    const serviceDescriptionEntries = serviceTypeList.map((serviceType) => {
      // ※往復空席照会結果(国際)と設計差異あり。
      // ミールコード毎のツールチップ文言出し分けはプラン確認側の設計書にはない
      const key = `m_service_contents_i18n_${serviceType}_${isDomestic ? 'D' : 'I'}_${cabin}`;
      return [serviceType, cache[key] ?? ''];
    });
    return Object.fromEntries(serviceDescriptionEntries);
  }

  /**
   * セグ間ラインスタイル取得処理
   * @param cartData
   * @param isPlanValid
   * @param segmentBeginList セグ間ライン起点
   * @param segmentEndList セグ間ライン終点
   * @param interSegAreaList セグ間エリア
   * @returns
   */
  getInterSegLineStyle(
    cartData: PostGetCartResponseData | undefined,
    isPlanValid: boolean,
    segmentBeginList: QueryList<ElementRef> | undefined,
    segmentEndList: QueryList<ElementRef> | undefined,
    interSegAreaList: QueryList<ElementRef> | undefined
  ): Array<string[]> {
    const displayBounds = (isPlanValid ? cartData?.plan : cartData?.previousPlan)?.airOffer?.bounds ?? [];
    // バウンド毎のセグ数
    const segNumByBound = displayBounds.map((bound) => bound.flights?.length ?? 0);
    // 第1バウンド～各バウンドまでの総セグ数リスト
    const totalSegNumByBound = segNumByBound.map((segNum, segIndex) => {
      return segNumByBound.slice(0, segIndex + 1).reduce((sum, currentNum) => sum + currentNum, 0);
    });

    // セグ終端要素のtop座標リスト
    const segEndTopList: Array<number> =
      segmentEndList?.map((element) => element.nativeElement.getBoundingClientRect().top ?? 0) ?? [];

    // セグ間ライン起点Y座標リスト
    const beginYList: Array<number> = [];
    segEndTopList.forEach((segEndTop, segIndex) => {
      // バウンド末端のセグ終端は除外する
      if (totalSegNumByBound.includes(segIndex + 1) || segIndex === segEndTopList.length - 1) {
        return;
      }
      beginYList.push(segEndTop);
    });

    // セグ始端要素のbottom座標リスト
    const segEndBottomList: Array<number> =
      segmentBeginList?.map((element) => element.nativeElement.getBoundingClientRect().bottom ?? 0) ?? [];

    // セグ間ライン終点Y座標リスト
    const endYList: Array<number> = [];
    segEndBottomList.forEach((segEndBottom, segIndex) => {
      // バウンド最初のセグ始端は除外する
      if (totalSegNumByBound.includes(segIndex) || segIndex === 0) {
        return;
      }
      endYList.push(segEndBottom);
    });

    // セグ間ライン原点リスト
    const lineOriginYList =
      interSegAreaList?.map((element) => element.nativeElement.getBoundingClientRect().top ?? 0) ?? [];

    // セグ間ラインの長さリスト
    const interSegLengthList = beginYList.map((beginY, index) => {
      const length = (endYList[index] ?? 0) - beginY;
      return Math.ceil(length);
    });

    // セグ間ラインの原点と起点のY座標差分リスト
    const lineOriginYDiffList = lineOriginYList.map((originY, index) => {
      const diffY = (beginYList[index] ?? 0) - originY;
      return Math.ceil(diffY);
    });

    // 各バウンドが含むセグ間エリアの数リスト
    const interSegNumByBound = segNumByBound.map((segNum) => segNum - 1);

    // セグ間ラインの長さリストをバウンド毎にまとめる
    const interSegLengthListCopy = [...interSegLengthList];
    const interSegLengthByBound = interSegNumByBound.map((interSegNum) => {
      return interSegLengthListCopy.splice(0, interSegNum);
    });

    // セグ間ラインの原点と起点のY座標差分リストをバウンド毎にまとめる
    const lineOriginYDiffListCopy = [...lineOriginYDiffList];
    const lineOriginYDiffListByBound = interSegNumByBound.map((interSegNum) => {
      return lineOriginYDiffListCopy.splice(0, interSegNum);
    });

    // スタイルバインディング用のstringの配列(の配列)を作成
    const interSegLineStyleListByBound = interSegLengthByBound.map((bound, boundIndex) => {
      return bound.map((interSegLength, interSegIndex) => {
        const top = lineOriginYDiffListByBound[boundIndex]?.[interSegIndex] ?? 0;
        return `top: ${top}px; height: ${interSegLength}px`;
      });
    });
    return interSegLineStyleListByBound;
  }

  destroy(): void {}
}
