import { AlertMessageItem, AlertType } from '@lib/interfaces';
import { Injectable } from '@angular/core';
import { GetOrderResponseData, OrderSeatItemSeatSelection } from 'src/sdk-servicing';
import { SeatInfo } from '../../interfaces/reservation/current-seatmap/seat-info';
import { SeatForServicingSeatmapScreen } from '../../interfaces/reservation/current-seatmap/seatmap-for-seatmap-screen';
import { GetSeatmapsState } from '../../interfaces/reservation/current-seatmap/get-seatmaps-state';
import { PREVIOUS_PAGE_IDENTIFIER } from '../../interfaces/servicing-common';
import { GetSeatmapsResponseDataSeatmapsDecksInnerSeatsInnerRowsInnerColumnsInner } from '../../../sdk-servicing/model/getSeatmapsResponseDataSeatmapsDecksInnerSeatsInnerRowsInnerColumnsInner';
import { SupportClass } from '@lib/components/support-class';
import { CurrentSeatmapService } from '../store/current-seatmap/current-seatmap-store.service';
import { convertCouchSeatNumberToSeatNumberList } from '@common/helper/common/seatmap.helper';

@Injectable({
  providedIn: 'root',
})
export class ServicingSeatmapCommonErrorService extends SupportClass {
  constructor(private _currentSeatmapService: CurrentSeatmapService) {
    super();
  }

  destroy(): void {}
  // [以下、初期ワーニング表示処理]
  public InitialWarningDisplay(
    seatInformationMap: Map<string, SeatForServicingSeatmapScreen>,
    pnrInfo: GetOrderResponseData | undefined,
    displayTargetBoundArrayId: number,
    displayTargetSegmentArrayId: number,
    getSeatmaps?: GetSeatmapsState,
    previousPageIdentifier?: PREVIOUS_PAGE_IDENTIFIER,
    isReDisplaySeatmap?: boolean,
    displayTargetSegmentId?: string,
    selectedSeatInfoList?: SeatInfo[] | undefined,
    displayTargetDeckArrayId?: number,
    documentNumberEtktPrefixNh?: Array<string>,
    nhGroupOperatingList?: Array<string>
  ): {
    messages: AlertMessageItem[];
    canceledSeatNumberList?: string[];
  } {
    // PNR情報.data.air.bounds[表示対象バウンド配列ID].flights[表示対象セグメント配列ID].運航キャリアコード≠”NH”または"NQ"または"EH"の場合、以下の処理を実施する。
    if (
      !this._isNhGroupOperating(pnrInfo, nhGroupOperatingList, displayTargetBoundArrayId, displayTargetSegmentArrayId)
    ) {
      // PNR情報.data.air.isContainedSeatRequestableSegmentInLHSite=trueの場合、
      // ”W0585”(予約詳細画面(S01-P030)からLHサイトへ遷移し座席指定可能な旨)のワーニングメッセージを表示し、初期ワーニング表示処理を終了する。
      if (pnrInfo?.air?.isContainedSeatRequestableSegmentInLHSite === true) {
        return {
          messages: [
            {
              contentHtml: 'W0585',
              isCloseEnable: false,
              alertType: AlertType.WARNING,
            },
          ],
        };

        // 上記以外、かつシートマップ情報.data.seatmapFlightProperty.isFullyBlockedByAllChargeableOAFlight=trueの場合、
        // ”W0579”(有料席ありのため選択不可と表示している可能性がある旨)のワーニングメッセージを表示し、[初期ワーニング表示処理]を終了する。
      } else if (getSeatmaps?.model?.data?.seatmapFlightProperty.isFullyBlockedByAllChargeableOAFlight === true) {
        return {
          messages: [
            {
              contentHtml: 'W0579',
              isCloseEnable: false,
              alertType: AlertType.WARNING,
            },
          ],
        };
        // 上記以外の場合、エラーメッセージIDに”W0580”(他社運航である旨) を指定し、[初期ワーニング表示処理]を終了する。
      } else {
        return {
          messages: [
            {
              contentHtml: 'W0580',
              isCloseEnable: false,
              alertType: AlertType.WARNING,
            },
          ],
        };
      }
    }

    // シートマップ情報.data.travelersSummary.hasCouchDiscrepancy=false、かつシートマップ情報.data.seatmaps.numberOfAvailableSeats=0
    // の場合、エラーメッセージIDに”W0571”(座席登録ができない旨) のワーニングメッセージを表示し、[初期ワーニング表示処理]を終了する。
    if (
      !!getSeatmaps?.model?.data?.travelersSummary &&
      getSeatmaps?.model?.data.travelersSummary.hasCouchDiscrepancy === false &&
      getSeatmaps.model.data.seatmaps.numberOfAvailableSeats === 0
    ) {
      return {
        messages: [
          {
            contentHtml: 'W0571',
            isCloseEnable: false,
            alertType: AlertType.WARNING,
          },
        ],
      };
    }

    // シートマップ情報.data.seatmaps.numberOfAvailableSeats>0、かつ
    // シートマップ情報.data.seatmaps.numberOfAvailableSeats<PNR情報.data.travelersSummary.travelerNumbersの
    // INFを除く合計-PNR情報.seats.＜当該表示対象セグメントID＞.orderseatItemsの要素数である場合、
    // ”W0572”(一部搭乗者について座席登録ができない旨) のワーニングメッセージを表示し、[初期ワーニング表示処理]を終了する。
    let travelersTotal =
      (pnrInfo?.travelersSummary?.travelerNumbers?.total || 0) - (pnrInfo?.travelersSummary?.travelerNumbers?.INF || 0);
    let seatTotal = 0;
    if (!!displayTargetSegmentId) {
      pnrInfo?.travelers?.forEach((traveler) => {
        let seatSelection: OrderSeatItemSeatSelection =
          pnrInfo?.seats?.[displayTargetSegmentId]?.[traveler.id!]?.seatSelection;
        if (!!seatSelection && !!seatSelection.seatNumbers) {
          seatTotal += seatSelection.seatNumbers.length;
        }
      });
    }

    if (
      !!getSeatmaps?.model?.data?.seatmaps.numberOfAvailableSeats &&
      getSeatmaps?.model?.data.seatmaps.numberOfAvailableSeats < travelersTotal - seatTotal
    ) {
      return {
        messages: [
          {
            contentHtml: 'W0572',
            isCloseEnable: false,
            alertType: AlertType.WARNING,
          },
        ],
      };
    }

    // 座席の再選択を促す旨
    let canceledSeatNumberList: string[] = [];
    selectedSeatInfoList
      ?.find((seatInfo) => seatInfo.segmentId === displayTargetSegmentId)
      ?.passengerList?.forEach((seatInfoPassenger) => {
        const availabilityStatus = seatInformationMap.get(
          convertCouchSeatNumberToSeatNumberList(seatInfoPassenger.seatNumber)?.[0] ?? ''
        )?.seatAvailabilityStatus;
        if (
          availabilityStatus ===
            GetSeatmapsResponseDataSeatmapsDecksInnerSeatsInnerRowsInnerColumnsInner.SeatAvailabilityStatusEnum
              .Available &&
          seatInfoPassenger.seatNumber
        ) {
          seatInfoPassenger.seatNumber && canceledSeatNumberList.push(seatInfoPassenger.seatNumber);
        }
      });
    if (canceledSeatNumberList.length > 0) {
      return {
        messages: [
          {
            contentHtml: 'W0575',
            isCloseEnable: false,
            alertType: AlertType.WARNING,
          },
        ],
        canceledSeatNumberList: canceledSeatNumberList,
      };
    }

    // 登録座席行情報存在判定処理として、以下の処理を行う。
    // 登録座席行情報存在フラグにtrueを設定する。
    let registeredSeatRowInfoPresenceFlag: boolean = true;
    let passengers =
      !!selectedSeatInfoList && selectedSeatInfoList.find((s) => s.segmentId === displayTargetSegmentId)?.passengerList;

    if (
      !!passengers &&
      displayTargetDeckArrayId !== undefined &&
      !!displayTargetSegmentId &&
      getSeatmaps?.model?.data?.seatmaps.decks[displayTargetDeckArrayId].seats.rows
    ) {
      // 登録済み座席数
      let selectedSeatsCount = 0;
      // 登録済み座席が存在する件数
      let seatExistenceCount = 0;

      // ＜以下、PNR情報.seats.表示対象セグメントIDの要素数分、繰り返し＞
      for (let passenger of passengers) {
        // 登録済み座席数と登録済み座席が存在する件数が異なる場合、登録座席行情報存在フラグに繰り返し処理を終了する。
        if (selectedSeatsCount !== seatExistenceCount) {
          break;
        }

        let seatSelection: OrderSeatItemSeatSelection =
          pnrInfo?.seats?.[displayTargetSegmentId]?.[passenger.id]?.seatSelection;

        if (!!seatSelection && !!seatSelection.seatNumbers && seatSelection.seatNumbers.length > 0) {
          // 登録済み座席数を+1する
          selectedSeatsCount++;

          const seatNumber = seatSelection.seatNumbers[0];
          const regexNumber = /^[0-9]+/g;
          const rowNumbers = seatNumber?.match(regexNumber);
          // ＜以下、シートマップ情報.data.seatmap.decks.seats.rows（以下、行情報リストとする）の要素数分、繰り返し＞
          for (let row of getSeatmaps?.model?.data.seatmaps.decks[displayTargetDeckArrayId].seats.rows) {
            // 指定済みの座席がシートマップ情報に存在する場合、登録済み座席が存在する件数を+1する
            if (
              !!rowNumbers &&
              Number(rowNumbers) === Number(row.rowNumber) &&
              row.rowType === 'seat' &&
              row.columns?.find((c) => c?.columnType === 'seat' && c?.seatNumber === seatNumber)
            ) {
              seatExistenceCount++;
              break;
            }
          }
          // ＜ここまで、行情報リストの要素数分、繰り返し＞
        }
      } // ＜ここまで、PNR情報.seats.表示対象セグメントIDの要素数分、繰り返し＞

      // 登録済み座席数と登録済み座席が存在する件数が異なる場合、登録座席行情報存在フラグにfalseを設定する。
      if (selectedSeatsCount !== seatExistenceCount) {
        registeredSeatRowInfoPresenceFlag = false;
      }
    }

    // ワーニングメッセージが複数表示できるように配列として保持・返却する
    let messages: AlertMessageItem[] = [];

    // 登録座席行情報存在判定処理=falseの場合、”W0584”(登録済みの座席行が表示されていない旨)のワーニングメッセージを表示する。
    if (registeredSeatRowInfoPresenceFlag === false) {
      messages.push({
        contentHtml: 'W0584',
        isCloseEnable: false,
        alertType: AlertType.WARNING,
      });
    }

    return { messages: messages };
  }

  /**
   * NH発券(航空券番号の先頭3文字がNH発券の値)以外が存在するかどうか
   *
   * @param pnrInfo PNR情報
   * @param documentNumberEtktPrefixNh NH発券航空券番号プレフィックスリスト
   * @returns 判定結果
   */
  private _isOtherDocumentNumberNh(
    pnrInfo: GetOrderResponseData | undefined,
    documentNumberEtktPrefixNh: Array<string> | undefined
  ) {
    if (!!pnrInfo?.travelDocuments && !!documentNumberEtktPrefixNh && documentNumberEtktPrefixNh.length >= 1) {
      return pnrInfo?.travelDocuments.some(
        (td) =>
          td.documentType === 'eticket' &&
          documentNumberEtktPrefixNh.some((prefixNh) => prefixNh !== td.id?.substring(0, 3))
      );
    }
    return false;
  }

  /**
   * NHグループ運航かどうか
   *
   * @param pnrInfo PNR情報
   * @param nhGroupOperatingList NHグループ運航キャリアリスト
   * @param displayTargetBoundArrayId 表示対象バウンド配列ID
   * @param displayTargetSegmentArrayId 表示対象セグメント配列ID
   * @returns true: NHグループの場合、false: それ以外
   */
  private _isNhGroupOperating(
    pnrInfo: GetOrderResponseData | undefined,
    nhGroupOperatingList: Array<string> | undefined,
    displayTargetBoundArrayId: number,
    displayTargetSegmentArrayId: number
  ) {
    let operatingAirlineCode: string =
      pnrInfo?.air?.bounds![displayTargetBoundArrayId].flights![displayTargetSegmentArrayId].operatingAirlineCode || '';
    if (nhGroupOperatingList?.includes(operatingAirlineCode)) {
      return true;
    } else {
      return false;
    }
  }
}
