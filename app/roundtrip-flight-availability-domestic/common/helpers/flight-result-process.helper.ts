import {
  BoundFilterCondition,
  FilterCondition,
  FilterConditionDomestic,
  FilterWithCheckBox,
  OperatingAirline,
  SortOrder,
} from '../interfaces';
import {
  RoundtripFppItemAirBoundDataType,
  RoundtripFppItemAirBoundDataTypeAirBoundGroupsInner,
  RoundtripFppItemAirBoundsDataType,
} from '../sdk';
import { AppConstants } from '@conf/app.constants';

type ProcessBound = RoundtripFppItemAirBoundDataTypeAirBoundGroupsInner;
/**
 * バウンド種別
 */
type BoundType = 'out' | 'return';
const BoundType = {
  OUT: 'out' as BoundType,
  RETURN: 'return' as BoundType,
};

/**
 * HH部分×60＋mm部分
 * 23*60 + 59 = 1439
 */
const MM_2359 = 1439;

/**
 * フライトフィルターの結果を取得する
 *
 * @param airBound フライトの検索結果
 * @param filterCondition フライトフィルターの条件
 * @param boundType バウンド種別
 * @param searchCondition フライト検索条件入力情報
 * @param outAfterChangeBoundId 変更後往路Air Bound ID
 * @returns フィルター後の検索結果
 */
export function getFilterResult(
  airBound: RoundtripFppItemAirBoundDataType | undefined,
  filterCondition?: FilterConditionDomestic,
  boundType?: BoundType
): Array<RoundtripFppItemAirBoundDataTypeAirBoundGroupsInner> {
  if (airBound && filterCondition) {
    let boundCondition: BoundFilterCondition;
    let type: 'out' | 'return';
    if (boundType === BoundType.OUT) {
      boundCondition = filterCondition.outBound as BoundFilterCondition;
      type = 'out';
    } else {
      boundCondition = filterCondition.returnBound as BoundFilterCondition;
      type = 'return';
    }
    return airBound.airBoundGroups.filter((searchResult) => {
      const fareFamilyArr = airBound.fareFamilies;
      if (filterCondition.fareOptions?.fareOptionType === '0') {
        // 以下の処理にて、すべてのAir Offer情報がフィルタ後選択不可能のTravel SolutionとAir Offer情報を削除する。
        const isSomeCanChoose = fareFamilyArr.some((fareFamily) =>
          airBoundFilter(
            searchResult[fareFamily.fareFamilyCode],
            filterCondition,
            type,
            fareFamily.fareFamilyWithService.priorityCode
          )
        );
        return getBoundFilter(searchResult, boundCondition) && isSomeCanChoose;
      } else {
        // 以下の処理にて、すべてのAir Offer情報がフィルタ後選択不可能のTravel SolutionとAir Offer情報を削除する。
        const isSomeCanChoose = fareFamilyArr.some((fareFamily) =>
          airBoundFilter(
            searchResult[fareFamily.fareFamilyCode],
            filterCondition,
            type,
            fareFamily.fareFamilyWithService.priorityCode
          )
        );
        return getBoundFilter(searchResult, boundCondition) && isSomeCanChoose;
      }
    });
  } else {
    return airBound ? airBound.airBoundGroups : [];
  }
}

/**
 * Air Bound情報フィルターの結果を取得する
 * @param airBoundInfo Air Bound情報
 * @param filterCondition フライトフィルターの条件
 * @param type バウンド種別
 * @param searchCondition フライト検索条件入力情報
 * @param outAfterChangeBoundId 変更後往路Air Bound ID
 * @param hasFareOption true:運賃フィルタ種別＝“0”,false:運賃フィルタ種別＝“1”
 * @returns フィルター後の検索結果
 */
export function airBoundFilter(
  airBoundInfo: RoundtripFppItemAirBoundsDataType,
  filterCondition?: FilterConditionDomestic,
  type?: 'out' | 'return',
  fareFamily?: string
): boolean {
  if (!filterCondition || (!airBoundInfo && !filterCondition.seatAvailability)) {
    return true;
  } else if (!airBoundInfo) {
    return false;
  }
  let hasFareOption = true;
  let filterFareOptionCondition = filterCondition.fareOptions?.fareOptionMap;
  let filterFareNameCondition = filterCondition?.fareOptions?.fareNameMap;
  if (filterCondition.fareOptions?.fareOptionType === '1') {
    hasFareOption = false;
  }
  const price = airBoundInfo.airBound?.prices.totalPrice.price.total;
  const priceFilter =
    (!!price || price === 0) && price >= filterCondition.priceFrom && price <= filterCondition.priceTo;
  // アプリケーション情報.フィルタ条件.運賃フィルタ種別＝“0”(運賃オプション)、かつアプリケーション情報.フィルタ条件.運賃オプションの件数が1件以上の場合、
  // 以下の処理にて、フィルタ後往復指定日空席照会情報を運賃オプションでフィルタする。
  let fareFilter = true;
  let fareNameFilter = true;
  if (hasFareOption) {
    const isFareOptionEmpty = filterFareOptionCondition?.every((fareOption) => !fareOption.value);
    fareFilter =
      isFareOptionEmpty ||
      filterFareOptionCondition!.some((fareOption) => {
        const changefree =
          fareOption.fareOptionCode === '0' &&
          fareOption.value &&
          airBoundInfo.changeConditionsType === RoundtripFppItemAirBoundsDataType.ChangeConditionsTypeEnum.Free;
        const changeWithPenalty =
          fareOption.fareOptionCode === '1' &&
          fareOption.value &&
          airBoundInfo.changeConditionsType === RoundtripFppItemAirBoundsDataType.ChangeConditionsTypeEnum.WithPenalty;
        const refundFree =
          fareOption.fareOptionCode === '2' &&
          fareOption.value &&
          airBoundInfo.refundConditionsType === RoundtripFppItemAirBoundsDataType.RefundConditionsTypeEnum.Free;
        const refundChargeable =
          fareOption.fareOptionCode === '3' &&
          fareOption.value &&
          airBoundInfo.refundConditionsType === RoundtripFppItemAirBoundsDataType.RefundConditionsTypeEnum.Chargeable;
        return changefree || changeWithPenalty || refundFree || refundChargeable;
      });
  } else {
    const isFareNameEmpty = filterFareNameCondition?.some((fareName) => !!fareName.value);
    fareNameFilter =
      (isFareNameEmpty as boolean) &&
      filterFareNameCondition!.some((fareName) => fareName.value && fareName.fareCode == fareFamily);
  }

  /**
   * アプリケーション情報.フィルタ条件.プロモーション適用Air Offerのみ=true(プロモーション適用Air Offerのみでフィルタする)、かつ下表のいずれかを満たす場合、
   * 以下の処理にて、フィルタ後変更旅程空席照会情報をプロモーション適用Air Offerのみでフィルタする。
   *
   * Travel SolutionとAir Bound情報にTravel SolutionとAir Bound情報.<Fare Family Code>.airOffer.prices.totalPrice.discount≠””*(空欄)が含まれる場合、
   * Travel SolutionとAir Bound情報.<Fare Family Code>.フィルタ後選択可否=true(フィルタ後選択可能)とする。
   */
  let boundCondition: BoundFilterCondition;
  if (type === 'out') {
    boundCondition = filterCondition.outBound as BoundFilterCondition;
  } else {
    boundCondition = filterCondition.returnBound as BoundFilterCondition;
  }
  // フィルタ条件モーダル.バウンドに対して指定する項目の件数が1件
  const caseA = filterCondition.outBound && !filterCondition.returnBound;
  const caseB = !filterCondition.outBound && filterCondition.returnBound;
  // フィルタ条件モーダル.バウンドに対して指定する項目の件数が2件、かつ当該バウンドが復路
  const caseC =
    filterCondition.outBound && filterCondition.returnBound && boundCondition === filterCondition.returnBound;
  const promotionFilter =
    !filterCondition.promotion ||
    !(caseA || caseB || caseC) ||
    !!airBoundInfo.airBound?.prices?.totalPrice?.discount?.aamDiscountCode ||
    !!airBoundInfo.airBound?.prices?.totalPrice?.discount?.cat25DiscountName;

  return hasFareOption
    ? priceFilter && fareFilter && promotionFilter
    : priceFilter && promotionFilter && fareNameFilter;
}

/**
 * バウンドフィルター (国際・国内共通フィルター)
 *
 * @param searchResultList フライトの検索結果
 * @param boundCondition バウンドフィルタ条件
 */
export function getBoundFilter(
  searchResult: ProcessBound,
  boundCondition: BoundFilterCondition | FilterCondition
): boolean {
  let boundInfo = (searchResult as RoundtripFppItemAirBoundDataTypeAirBoundGroupsInner).boundDetails;
  let segments = boundInfo.segments;
  if (boundInfo && boundCondition) {
    // 出発時刻
    const departureDateTime = new Date(boundInfo.originDepartureDateTime);
    const departureTimeValue = departureDateTime.getHours() * 60 + departureDateTime.getMinutes();
    // 到着時刻
    const arrivalDateTime = new Date(boundInfo.destinationArrivalDateTime);
    const arrivalTimeValue = arrivalDateTime.getHours() * 60 + arrivalDateTime.getMinutes();

    const isNumberOfConnectionEmpty = boundCondition.numberOfConnection.every(
      (connnectionNum) => !connnectionNum.value
    );
    const isOriginLocationEmpty = boundCondition.originLocation.every((originLocation) => !originLocation.value);
    const isArrivalLocationEmpty = boundCondition.arrivalLocation.every((arrivalLocatio) => !arrivalLocatio.value);
    const isOperatingAirlineEmpty = boundCondition.operatingAirlines.every(
      (operatingAirline) => !operatingAirline.value
    );
    const isAircraftEmpty = boundCondition.aircraftCodes.every((aircraftCode) => !aircraftCode.value);
    // フィルタ条件.乗継回数の件数が1件以上の場合、フィルタ後指定日空席照会情報をフィルタ条件.乗継回数.＜乗継回数＞でフィルタする
    const numberOfConnectionFilter =
      isNumberOfConnectionEmpty ||
      boundCondition.numberOfConnection.filter(
        (connectionNum) =>
          connectionNum.connectionNumber.toString() === boundInfo.numberOfConnection.toString() && connectionNum.value
      ).length > 0;
    //  フィルタ後指定日空席照会情報をフィルタ条件.所要時間Fromからィルタ条件.所要時間Toの範囲でフィルタする
    const durationTimeFilter =
      boundInfo.duration >= boundCondition.durationFrom * 60 && boundInfo.duration <= boundCondition.durationTo * 60;
    // フィルタ条件.出発空港の件数が1件以上の場合、フィルタ後指定日空席照会情報をフィルタ条件.出発空港.＜出発空港＞でフィルタする
    const originLocationFilter =
      isOriginLocationEmpty ||
      boundCondition.originLocation.filter(
        (originLocation) => originLocation.code === boundInfo.originLocationCode && originLocation.value
      ).length > 0;
    // フィルタ後指定日空席照会情報をフィルタ条件.出発時刻Fromからフィルタ条件.出発時刻Toの範囲でフィルタする
    const originDepartureFilter =
      (departureTimeValue >= boundCondition.originTimeFrom && departureTimeValue <= boundCondition.originTimeTo) ||
      (departureTimeValue === 0 && boundCondition.originTimeTo === MM_2359);
    // フィルタ条件.到着空港の件数が1件以上の場合、フィルタ後指定日空席照会情報をフィルタ条件.到着空港.＜到着空港＞でフィルタする
    const arrivalLocationFilter =
      isArrivalLocationEmpty ||
      boundCondition.arrivalLocation.filter(
        (arrivalLocation) => arrivalLocation.code === boundInfo.destinationLocationCode && arrivalLocation.value
      ).length > 0;
    // フィルタ後指定日空席照会情報をィルタ条件.到着時刻Fromからフィルタ条件.到着時刻Toの範囲でフィルタする
    const arrivalTimeFilter =
      (arrivalTimeValue >= boundCondition.arrivalTimeFrom && arrivalTimeValue <= boundCondition.arrivalTimeTo) ||
      (arrivalTimeValue === 0 && boundCondition.originTimeTo === MM_2359);
    /*
      フィルタ条件.運航キャリアの件数が1件以上の場合、以下の処理にて、フィルタ後指定日空席照会情報を運航キャリアでフィルタする。
      運航キャリア存在有無を false(運航キャリアがいずれかのセグメントに含まれない)とする
      セグメント情報.operatingAirlineCode=運航キャリアコードの場合、運航キャリア存在有無を true(運航キャリアがいずれかのセグメントに含まれる)とする。
      (セグメント情報.operatingAirlineCode=”NQ”(エアージャパン)の場合、運航キャリアコード=”NH”(ANA)のとき、運航キャリア存在有無を true(運航キャリアがいずれかのセグメントに含まれる)を設定する)。
      運航キャリア存在有無=false(運航キャリアがいずれかのセグメントに含まれない)の場合、フィルタ後指定日空席照会情報.alternativeOffers から、Travel Solution と Air Bound 情報を削除する。
    */
    const operatingAirlineFilter =
      isOperatingAirlineEmpty ||
      boundCondition.operatingAirlines.filter((operatingAirline) => {
        // 運航キャリア存在有無
        let isAirCarrierExist = false;
        segments.forEach((segment) => {
          const condition =
            operatingAirline.value &&
            ((segment.operatingAirlineCode && operatingAirline.airlineCode === segment.operatingAirlineCode) ||
              (segments?.[0].isNhGroupOperated &&
                !segment.operatingAirlineCode &&
                segment.operatingAirlineName === operatingAirline.airlineName));
          if (condition) {
            isAirCarrierExist = true;
          }
        });
        return isAirCarrierExist;
      }).length > 0;
    /*
     フィルタ条件.機種の件数が 1 件以上の場合、以下の処理にて、フィルタ後指定日空席照会情報を機種でフィルタする。
     機種存在有無を false(機種がいずれかのセグメントに含まれない)とする
     セグメント情報.aircraftCode=機種コードの場合、機種存在有無を true(機種がいずれかのセグメントに含まれる)とする。
     機種存在有無=false(機種がいずれかのセグメントに含まれない)の場合、フィルタ後指定日空席照会情報.alternativeOffers から、Travel Solution 情報を削除する。
    */
    const aircraftFilter =
      isAircraftEmpty ||
      boundCondition.aircraftCodes.filter((aircraftCode) => {
        let isAirCraftExist = false;
        segments.forEach((segment) => {
          if (aircraftCode.code === segment.aircraftCode && aircraftCode.value) {
            isAirCraftExist = true;
            return;
          }
        });
        return isAirCraftExist;
      }).length > 0;

    /**
     * フィルタ条件モーダル.バウンドに対して指定する項目.Wi-Fiサービスがチェックありの場合、
     * フィルタ後指定日空席照会情報.alternativeOffersからフィルタ後指定日空席照会情報.alternativeOffers.air.bound.wifiAvailableType=”available“(利用可能)以外のalternativeOffersを削除する。
     */
    const wifiServiceFilter =
      !boundCondition.wifiService ||
      (boundCondition.wifiService && (boundInfo.wiFiType === '1' || boundInfo.wiFiType === '2'));
    return (
      numberOfConnectionFilter &&
      durationTimeFilter &&
      originLocationFilter &&
      originDepartureFilter &&
      arrivalLocationFilter &&
      arrivalTimeFilter &&
      operatingAirlineFilter &&
      aircraftFilter &&
      wifiServiceFilter
    );
  } else {
    return !boundCondition;
  }
}

/**
 * フライトの並べ替え結果を取得する
 *
 * @param airResultListView　フライトの検索結果
 * @param sortOrder sort種類
 * @param useFor INVOLUNTARY: 振替内容　INTERNATIONAL: 国際
 * @returns ソート後の結果
 */
export function getSortResult(
  airResultListView: Array<ProcessBound>,
  sortOrder: SortOrder = SortOrder.RECCOMENDED
): Array<ProcessBound> {
  if (airResultListView && airResultListView.length > 0) {
    return airResultListView.slice().sort(compareFunc(sortOrder));
  } else {
    return airResultListView;
  }
}
/**
 * ソート方法を取得する
 *
 * @param sortOrder sort種類
 * @param useFor INVOLUNTARY: 振替内容　INTERNATIONAL: 国際
 * @returns ソート方法
 */
export function compareFunc(sortOrder: SortOrder) {
  return (before: ProcessBound, after: ProcessBound) => {
    let compareResult: number = 0;

    let beforeBound = (before as RoundtripFppItemAirBoundDataTypeAirBoundGroupsInner).boundDetails;
    let afterBound = (after as RoundtripFppItemAirBoundDataTypeAirBoundGroupsInner).boundDetails;
    switch (sortOrder) {
      case SortOrder.RECCOMENDED:
        compareResult = beforeBound.ranking - afterBound.ranking;
        break;
      case SortOrder.ARRIVAL_TIME:
        compareResult =
          new Date(beforeBound.destinationArrivalDateTime).getTime() -
          new Date(afterBound.destinationArrivalDateTime).getTime();
        break;
      case SortOrder.DEPARTURE_TIME:
        compareResult =
          new Date(beforeBound.originDepartureDateTime).getTime() -
          new Date(afterBound.originDepartureDateTime).getTime();
        break;
      case SortOrder.FIGHT_DURATION:
        compareResult = beforeBound.duration - afterBound.duration;
        break;
    }
    return compareResult;
  };
}

/**
 * checkBox formControlの値をFilterConditionのvalue属性に割り当てる
 *
 * @param conditionArr フィルタチェックボックス
 * @param boolArr boolean
 * @returns Array<FilterWithCheckBox>
 */
export function mergeArray(
  conditionArr: Array<FilterWithCheckBox>,
  boolArr: Array<boolean>
): Array<FilterWithCheckBox> {
  let convertArr = JSON.parse(JSON.stringify(conditionArr));
  if (boolArr && boolArr.length > 0) {
    boolArr.forEach((value, index) => {
      convertArr[index].value = value;
    });
    return convertArr;
  } else {
    return convertArr;
  }
}
