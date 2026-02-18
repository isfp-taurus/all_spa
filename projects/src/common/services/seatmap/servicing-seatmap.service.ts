import { Injectable } from '@angular/core';
import {
  SeatForServicingSeatmapScreenBySegment,
  SeatInfo,
  SeatInfoPassengers,
  SeatmapStoreModel,
} from '@common/interfaces';
import { SupportClass } from '@lib/components/support-class';
import { AswContextState } from '@lib/store';
// import { SeatInfo, SeatInfoPassengers } from '@common/interfaces/servicing-seatmap/seat-info';
// import { SeatForServicingSeatmapScreenBySegment } from '@common/interfaces/servicing-seatmap/seatmap-for-seatmap-screen';
// import { SeatmapStoreModel } from '@common/interfaces/servicing-seatmap/seatmap-store-model';
import { GetOrderResponseData, Type1 } from 'src/sdk-servicing';

@Injectable({
  providedIn: 'root',
})
export class ServicingSeatmapService extends SupportClass {
  constructor() {
    super();
  }

  /**
   * 変更があるセグメントがあるか判定
   * @param servicingSeatmap サービシングシートマップStore
   * @param allSegmentInfo 全セグメント情報
   * @param selectedSeatInfoList 選択中座席情報リスト
   * @param pnrInfo PNR情報
   * @returns true:変更があるセグメントあり、false:それ以外
   */
  isSegmentChange(
    servicingSeatmap: SeatmapStoreModel,
    allSegmentInfo: Array<Type1> | undefined,
    selectedSeatInfoList: SeatInfo[] | undefined,
    pnrInfo: GetOrderResponseData | undefined
  ) {
    // 変更があるセグメント取得
    const segments = this.getSegmentChangeList(servicingSeatmap, allSegmentInfo, selectedSeatInfoList, pnrInfo);

    return !!segments && segments.length > 0;
  }

  /**
   * 変更があるセグメントを取得する
   * @param servicingSeatmap サービシングシートマップStore
   * @param allSegmentInfo 全セグメント情報
   * @param selectedSeatInfoList 選択中座席情報リスト
   * @param pnrInfo PNR情報
   * @returns 変更があるセグメント
   */
  getSegmentChangeList(
    servicingSeatmap: SeatmapStoreModel,
    allSegmentInfo: Array<Type1> | undefined,
    selectedSeatInfoList: SeatInfo[] | undefined,
    pnrInfo: GetOrderResponseData | undefined
  ): Type1[] {
    let segments: Type1[] = [];
    if (allSegmentInfo) {
      for (let segment of allSegmentInfo) {
        let seatInfo = selectedSeatInfoList?.find((s) => s.segmentId === segment.id);
        if (seatInfo) {
          for (let passenger of seatInfo.passengerList) {
            // 該当搭乗者の座席に変更がある場合、表示セグメントに追加する
            if (this.isPassengerChange(servicingSeatmap, seatInfo, passenger, pnrInfo)) {
              segments.push(segment);
              break;
            }
          }
        }
      }
    }

    return segments;
  }

  /**
   * 当該搭乗者の座席が変更されたか判定
   * @param servicingSeatmap サービシングシートマップStore
   * @param seatInfo シートマップ情報
   * @param passenger 搭乗者情報
   * @param pnrInfo PNR情報
   * @returns true: 変更あり, false: 変更なし
   */
  isPassengerChange(
    servicingSeatmap: SeatmapStoreModel,
    seatInfo: SeatInfo,
    passenger: SeatInfoPassengers,
    pnrInfo: GetOrderResponseData | undefined
  ): boolean {
    let pnrSeat = !!pnrInfo?.seats?.[seatInfo.segmentId]?.[passenger.id]
      ? pnrInfo?.seats?.[seatInfo.segmentId]?.[passenger.id].seatSelection.seatNumbers
      : undefined;
    let pnrCouchSeat = !!pnrInfo?.seats?.[seatInfo.segmentId]?.[passenger.id]
      ? pnrInfo?.seats?.[seatInfo.segmentId]?.[passenger.id].seatSelection.couchSeatNumber
      : undefined;
    let registeredCharacteristicSSRCode = !!pnrInfo?.seats?.[seatInfo.segmentId]?.[passenger.id]
      ? pnrInfo?.seats?.[seatInfo.segmentId]?.[passenger.id].seatSelection.characteristicRequestSsrCode
      : undefined;

    // 座席属性の変更有無フラグ
    const isChangecharacteristicRequestSsrCode =
      !!seatInfo.characteristicRequestSsrCode &&
      (!registeredCharacteristicSSRCode ||
        (!!registeredCharacteristicSSRCode &&
          seatInfo.characteristicRequestSsrCode !== registeredCharacteristicSSRCode));

    if (pnrSeat && pnrSeat.length > 0) {
      // 座席情報の取得
      let seatInformation = this.getSeatInformation(seatInfo.segmentId, pnrSeat[0], servicingSeatmap);

      //  無料席で座席の変更があるかつ、seatNumberList.seatNumber が空欄（無料席取消）の場合、表示セグメントに追加する
      let isFreeSSRSeat = !seatInformation?.isCouchSeat && !seatInformation?.isChargeableAsrSeat;
      if (isFreeSSRSeat && passenger.seatNumberList?.length === 0) {
        return true;
      }
      // SSR席(カウチ席)を変更する場合、trueを返す
      else if (
        passenger.couchSeatNumberList &&
        passenger.couchSeatNumberList.length > 0 &&
        pnrCouchSeat !== passenger.couchSeatNumberList[0].seatNumber
      ) {
        return true;
      }
      // SSR席(有料席)を変更する場合、trueを返す
      else if (
        !pnrCouchSeat &&
        passenger.seatNumberList &&
        passenger.seatNumberList?.length > 0 &&
        pnrSeat[0] !== passenger.seatNumberList[0].seatNumber
      ) {
        return true;
      }
      // SSR登録済み（有料）座席の取消の場合、trueを返す
      else if (passenger.seatNumberList?.length === 0 && passenger.couchSeatNumberList?.length === 0) {
        return true;
      }
      // 座席属性指定の場合、trueを返す
      else if (isChangecharacteristicRequestSsrCode) {
        // SSR登録済みセグで座席属性指定画面が表示され、属性指定した場合のフロー
        return true;
      }
    }
    // 新規登録の座席の場合、trueを返す
    else if (
      (passenger.seatNumberList && passenger.seatNumberList?.length > 0) ||
      (passenger.couchSeatNumberList &&
        passenger.couchSeatNumberList?.length > 0 &&
        passenger.couchSeatNumberList[0].seatNumber)
    ) {
      return true;
    }
    // 座席属性指定の場合、trueを返す
    else if (isChangecharacteristicRequestSsrCode) {
      // 座席属性が未登録or登録済み、かつ、座席属性が変更された場合のフロー
      return true;
    }

    // 変更がない場合、falseを返す
    return false;
  }

  /**
   * 選択中の座席情報を取得
   * @param segmentId セグメントID
   * @param seatNumber 座席番号
   * @param servicingSeatmap サービシングシートマップStore
   * @returns 座席情報
   */
  getSeatInformation(segmentId: string, seatNumber: string, servicingSeatmap: SeatmapStoreModel) {
    // 選択中の座席情報取得
    if (!!segmentId && !!seatNumber) {
      let seatInformations = this.getSeatInformations(segmentId, servicingSeatmap);

      if (!!seatInformations && !!seatInformations[seatNumber]) {
        return seatInformations[seatNumber];
      }
    }

    return undefined;
  }

  /**
   * 選択中の座席情報リストを取得
   * @param segmentId セグメントID
   * @param servicingSeatmap サービシングシートマップStore
   * @returns 座席情報
   */
  getSeatInformations(segmentId: string, servicingSeatmap: SeatmapStoreModel) {
    // セグメント別座席情報リストを取得
    const defaultSeatmapInfoBySegmentList = servicingSeatmap.defaultSeatmapInfoBySegmentList || undefined;

    // 選択中の座席情報取得
    if (!!defaultSeatmapInfoBySegmentList && !!segmentId) {
      let seatmapInfoBySegmentList = new Map<string, SeatForServicingSeatmapScreenBySegment>(
        Object.entries(defaultSeatmapInfoBySegmentList)
      );
      let seatInfoBySegment = seatmapInfoBySegmentList?.get(segmentId);

      if (!!seatInfoBySegment?.seatInformations) {
        return seatInfoBySegment.seatInformations;
      }
    }

    return undefined;
  }

  /**
   * URL に CONNECTION_KIND,LANG を付与
   * @param aswContextData ユーザー共通情報
   * @param url URL
   * @returns URL
   */
  addKindLang(aswContextData: AswContextState, url?: string) {
    if (!url) {
      return url;
    }

    const connectionKind = aswContextData.metaConnectionKind.trim();
    const lang = aswContextData.metaLang;
    return `${url}?CONNECTION_KIND=${connectionKind}&LANG=${lang}`;
  }
  destroy(): void {}
}
