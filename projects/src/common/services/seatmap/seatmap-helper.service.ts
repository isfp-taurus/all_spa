import { Injectable } from '@angular/core';
import { BoundFlightListId } from '@common/components/reservation/seatmap/seatmap-footer-area/seatmap-footer-area.state';
import { SupportClass } from '@lib/components/support-class';
import { GetOrderStoreService } from '../api-store/sdk-servicing/get-order-store/get-order-store.service';
import { CurrentSeatmapService } from '../store/current-seatmap/current-seatmap-store.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Type1 } from 'src/sdk-servicing';
import { StaticMsgPipe } from '@lib/pipes';
import { GetSeatmapsStoreService } from '../api-store/sdk-servicing/get-seatmaps-store/get-seatmaps-store.service';

@Injectable({ providedIn: 'root' })
export class SeatmapHelperService extends SupportClass {
  constructor(
    private _getOrderStoreService: GetOrderStoreService,
    private _getSeatmapStoreService: GetSeatmapsStoreService,
    private _currentSeatmapService: CurrentSeatmapService
  ) {
    super();
  }

  /**
   * 各座席ブロックに含まれる列番号リストを返却する関数
   * 返却値の例：['ABC','DEF']
   *
   * @returns 列番号リスト
   */
  public createSeatBlockColoumNumberList(): string[] {
    let seatBlockColoumNumberList: string[] = [''];
    this._getSeatmapStoreService.getSeatmapsData.data?.seatmaps.decks?.[0].columns.forEach((coloum) => {
      if (coloum.isAisle) {
        seatBlockColoumNumberList.push('');
      } else {
        seatBlockColoumNumberList.push(seatBlockColoumNumberList.pop()?.concat(coloum.columnNumber) ?? '');
      }
    });
    return seatBlockColoumNumberList;
  }

  /**
   * 次のセグメントのバウンドIDとセグメントIDを返す関数、入力値は有効の値であることが前提
   * 呼び出し条件：PNR情報取得APIリクエストが終了している
   *
   * @param boundListId バウンドリストID
   * @param segmentListId セグメントリストID
   * @returns 次のセグメントのバウンドIDとセグメントID
   */
  public getNextBoundFlightListId(boundListId: number, segmentListId: number): BoundFlightListId {
    const pnrFlightsLength =
      this._getOrderStoreService.getOrderData.data?.air?.bounds?.[boundListId].flights?.length ?? 0;
    if (pnrFlightsLength > segmentListId + 1) {
      return { boundListId: boundListId, flightListId: segmentListId + 1 };
    } else {
      for (
        let index = boundListId + 1;
        index < (this._getOrderStoreService.getOrderData.data?.air?.bounds?.length ?? 0);
        index++
      ) {
        if (this._getOrderStoreService.getOrderData.data?.air?.bounds?.[index].flights) {
          return { boundListId: index, flightListId: 0 };
        }
      }
      return { boundListId: boundListId, flightListId: segmentListId };
    }
  }

  /**
   * 前のセグメントのバウンドIDとセグメントIDを返す関数
   * 呼び出し条件：PNR情報取得APIリクエストが終了している、かつ入力したリストIDに対応するセグメント情報が空ではない
   *
   * @param boundListId バウンドリストID
   * @param segmentListId セグメントリストID
   * @returns 前のセグメントのバウンドIDとセグメントID
   */
  public getPrevBoundFlightListId(boundListId: number, segmentListId: number): BoundFlightListId {
    if (segmentListId - 1 < 0) {
      for (
        let index = boundListId;
        index >= (this._getOrderStoreService.getOrderData.data?.air?.bounds?.length ?? 0) - 1;
        index--
      ) {
        if (this._getOrderStoreService.getOrderData.data?.air?.bounds?.[index].flights) {
          // if文でチェック済み、かならずnullにならない
          return {
            boundListId: index > 0 ? index - 1 : 0,
            flightListId:
              this._getOrderStoreService.getOrderData.data!.air!.bounds![index].flights!.length > 0
                ? this._getOrderStoreService.getOrderData.data!.air!.bounds![index].flights!.length - 1
                : 0,
          };
        }
      }
      return { boundListId: boundListId, flightListId: segmentListId };
    } else {
      return { boundListId: boundListId, flightListId: segmentListId - 1 };
    }
  }

  /**
   * 選択しているセグメントは最後のセグメントであるかどうかを判定する関数
   * @returns 選択しているセグメントは最後のセグメントであるかどうか
   */
  public isSelectedLastSegment(): boolean {
    const displayTargetBoundArrayId = this._currentSeatmapService.CurrentSeatmapData.displayTargetBoundArrayId ?? 0;
    const displayTargetSegmentArrayId = this._currentSeatmapService.CurrentSeatmapData.displayTargetSegmentArrayId ?? 0;
    if (
      displayTargetBoundArrayId ===
        this.getNextBoundFlightListId(displayTargetBoundArrayId, displayTargetSegmentArrayId).boundListId &&
      displayTargetSegmentArrayId ===
        this.getNextBoundFlightListId(displayTargetBoundArrayId, displayTargetSegmentArrayId).flightListId
    )
      return true;
    return false;
  }

  /**
   * バウンドごとにあるセグメント情報を一階層のリストに集約する関数
   *
   * @returns セグメント情報のリスト
   */
  public createAllSegmentList$(): Observable<Type1[] | undefined> {
    return this._getOrderStoreService
      .getGetOrderObservable()
      .pipe(map((v) => v.data?.air?.bounds?.flatMap((value) => value.flights ?? [])));
  }

  /**
   * バウンドごとにあるセグメント情報を一階層のリストに集約する関数
   *
   * @returns セグメント情報のリスト
   */
  public createAllSegmentList(): Type1[] | undefined {
    return this._getOrderStoreService.getOrderData.data?.air?.bounds?.flatMap((value) => value.flights ?? []);
  }

  /**
   * 選択中セグメント情報
   * @returns セグメント情報
   */
  public getCurrentSelectedSegment$(): Observable<Type1 | undefined> {
    return this._getOrderStoreService
      .getGetOrderObservable()
      .pipe(
        map(
          (v) =>
            v.data?.air?.bounds?.[this._currentSeatmapService.CurrentSeatmapData.displayTargetBoundArrayId ?? 0]
              .flights?.[this._currentSeatmapService.CurrentSeatmapData.displayTargetSegmentArrayId ?? 0]
        )
      );
  }

  /**
   * 選択中セグメント情報
   * @returns セグメント情報
   */
  public getCurrentSelectedSegment(): Type1 | undefined {
    return this._getOrderStoreService.getOrderData.data?.air?.bounds?.[
      this._currentSeatmapService.CurrentSeatmapData.displayTargetBoundArrayId ?? 0
    ].flights?.[this._currentSeatmapService.CurrentSeatmapData.displayTargetSegmentArrayId ?? 0];
  }

  /**
   * セグメントIDからリストIDを逆引きする関数
   * @param segmentId セグメントID
   * @return バウンドリストID, セグメントリストID
   */
  public convertSegmentToBoundFlightListId(segmentId: string): BoundFlightListId | undefined {
    for (
      let boundListId = 0;
      boundListId < (this._getOrderStoreService.getOrderData.data?.air?.bounds?.length ?? 0);
      boundListId++
    ) {
      for (
        let segmentListId = 0;
        segmentListId <
        (this._getOrderStoreService.getOrderData.data?.air?.bounds?.at(boundListId)?.flights?.length ?? 0);
        segmentListId++
      ) {
        if (
          this._getOrderStoreService.getOrderData.data?.air?.bounds?.at(boundListId)?.flights?.at(segmentListId)?.id ===
          segmentId
        ) {
          return { boundListId: boundListId, flightListId: segmentListId };
        }
      }
    }
    return undefined;
  }

  /**
   * セグメントIDからセグメント情報を取得する関数
   * @param segmentId セグメントID
   * @return セグメント情報
   */
  public convertSegmentIdToSegmentInfo(segmentId: string): Type1 | undefined {
    const boundFlightListId = this.convertSegmentToBoundFlightListId(segmentId);
    return this._getOrderStoreService.getOrderData.data?.air?.bounds?.[boundFlightListId?.boundListId ?? 0].flights?.[
      boundFlightListId?.flightListId ?? 0
    ];
  }

  destroy(): void {}
}
