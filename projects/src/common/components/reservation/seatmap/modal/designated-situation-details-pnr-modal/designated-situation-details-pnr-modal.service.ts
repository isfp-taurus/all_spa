import { Injectable } from '@angular/core';
import { convertCouchSeatNumberToSeatNumberList } from '@common/helper/common';
import { SeatInfoPassengers } from '@common/interfaces';
import { CurrentCartStoreService, CurrentSeatmapService, GetOrderStoreService } from '@common/services';
import { SupportClass } from '@lib/components/support-class';
import { ErrorType, PageType, RetryableError } from '@lib/interfaces';
import { CommonLibService } from '@lib/services';
import {
  CreateMycarValetResponseWarningsInner,
  Type1,
  UpdateServicesRequest,
  UpdateServicesRequestSeatsChildSeatsInner,
  UpdateServicesRequestSeatsSeatReservationInner,
  UpdateServicesRequestServicesInner,
  UpdateServicesRequestServicesInnerSegmentsInner,
} from 'src/sdk-servicing';
import { updateServiceResponseWarningsSourceInner } from 'src/sdk-servicing/model/updateServiceResponseWarningsSourceInner';
import { updateServiceResponseErrorsSourceInner } from 'src/common/interfaces/servicing-seatmap/updateServiceResponseErrorsSourceInner';
import { UpdateServicesRequestServicesInnerSegmentsInnerTravelersInner } from '../../../../../../sdk-servicing/model/updateServicesRequestServicesInnerSegmentsInnerTravelersInner';
import { StaticMsgPipe } from '@lib/pipes';
import { ErrorCodeConstants } from '@conf/app.constants';

/** 指定状況詳細(PNR)モーダルサービスクラス */
@Injectable()
export class DesignedSituationDetailsPnrModalService extends SupportClass {
  constructor(
    private _common: CommonLibService,
    private _currentSeatmapService: CurrentSeatmapService,
    private _currentCartStoreService: CurrentCartStoreService,
    private _getOrderStoreService: GetOrderStoreService,
    private _staticMsgPipe: StaticMsgPipe
  ) {
    super();
  }

  destroy(): void {}

  /**
   * サービス情報登録リクエストパラメータ作成関数
   * @return サービス情報登録リクエストパラメータ
   */
  public createUpdateServicesRequestParameter(): UpdateServicesRequest {
    return {
      credential: {
        firstName: this._getOrderStoreService.getOrderData.data?.travelers?.[0].names?.[0].firstName,
        lastName: this._getOrderStoreService.getOrderData.data?.travelers?.[0].names?.[0].lastName,
      },
      cartId: this._currentCartStoreService.CurrentCartData.data?.cartId,
      services: this.createUpdateServicesRequestParameterService(),
      seats: {
        seatReservation: this.createUpdateServicesRequestParameterseatReservation(),
        childSeats: this._currentSeatmapService.CurrentSeatmapData.childSeatAppliedList
          ? this._currentSeatmapService.CurrentSeatmapData.childSeatAppliedList.map((childSeat) => {
              return <UpdateServicesRequestSeatsChildSeatsInner>{
                operation: childSeat.updateCategory as UpdateServicesRequestSeatsChildSeatsInner.OperationEnum,
                travelerId: childSeat.passengerId,
                type: childSeat.childSeatType,
              };
            })
          : undefined,
      },
    };
  }

  /**
   * サービス情報登録リクエストパラメータのうちseatReservationフィールドの部分を生成する関数
   * @returns サービス情報登録リクエストパラメータ.seats.seatReservation
   */
  private createUpdateServicesRequestParameterseatReservation():
    | Array<UpdateServicesRequestSeatsSeatReservationInner>
    | undefined {
    return (
      Object.values(this._currentSeatmapService.CurrentSeatmapData.selectedSeatInfoList ?? {})
        .map((seatInfo) => {
          let couchSeatNumberToSeatNumberMap = this.createCouchSelectionStatusMap(seatInfo.segmentId);
          return <UpdateServicesRequestSeatsSeatReservationInner>{
            flightId: seatInfo.segmentId,
            seatSelection: seatInfo.passengerList
              // 指定状況に変更がある、かつ申込済みで取り消しした場合
              .filter((passenger) => passenger.seatNumber !== passenger.ssrInformation?.ssrSeatNumber)
              .filter((passenger) => !passenger.seatNumber && passenger.ssrInformation?.ssrSeatNumber)
              .map((passenger) => {
                return { seatNumber: '', travelerId: passenger.id };
              })
              .concat(
                seatInfo.passengerList
                  // 指定状況に変更がある、かつ席を選択している場合
                  .filter((passenger) => passenger.seatNumber !== passenger.ssrInformation?.ssrSeatNumber)
                  .filter((passenger) => passenger.seatNumber)
                  .map((passenger) => {
                    const seatNumberList = convertCouchSeatNumberToSeatNumberList(passenger.seatNumber);
                    if (this._currentSeatmapService.findSeatInfoFromSeatNumber(seatNumberList?.[0])?.[0].isCouchSeat) {
                      // 選択中の座席がカウチ席の場合
                      return {
                        seatNumber: this._getAdjusttedSeatNumber(
                          passenger.seatNumber ?? '',
                          couchSeatNumberToSeatNumberMap
                        ),
                        travelerId: passenger.id,
                      };
                    } else {
                      // 選択中の座席がカウチ席ではない場合
                      return { seatNumber: passenger.seatNumber ?? '', travelerId: passenger.id };
                    }
                  })
              ),
            attributeRequest: { type: seatInfo.passengerList[0].seatAttribute?.ssrCode },
          };
        })
        // 指定情報に変更があるセグメントのみ抽出
        .filter((segmentSeatInfo) => segmentSeatInfo.seatSelection?.length || segmentSeatInfo.attributeRequest?.type)
        // attributeRequestが空のものはundefinedにする
        // seatSelectionが空のものはundefinedにする
        .map((segmentSeatInfo) => {
          return {
            flightId: segmentSeatInfo.flightId,
            seatSelection:
              segmentSeatInfo.seatSelection?.length && segmentSeatInfo.seatSelection?.length !== 0
                ? segmentSeatInfo.seatSelection
                : undefined,
            attributeRequest:
              segmentSeatInfo.attributeRequest && segmentSeatInfo.attributeRequest?.type
                ? segmentSeatInfo.attributeRequest
                : undefined,
          };
        })
    );
  }

  /**
   * カウチ座席の着席順を補正した座席番号を返却する
   * @param couchSeatNumber 対象のカウチ座席番号
   * @param couchSeatNumberToSeatNumberMap カウチ座席番号Map
   * @returns 補正できた場合：補正した座席番号、補正できない場合：空文字
   */
  private _getAdjusttedSeatNumber(
    couchSeatNumber: string,
    couchSeatNumberToSeatNumberMap: { [key: string]: string[] } | undefined
  ): string {
    // シートマップ情報から該当のカウチ座席を取得して判定
    // 通路側（複数あれば左を優先）から順に確認して、空いている座席を設定
    // 例）「70ABC、通路、70DEFG、通路、70HJK」の場合、「70C ⇒ 70B ⇒ 70A」「70D ⇒ 70E ⇒ 70F ⇒ 70G」「70H ⇒ 70J ⇒ 70K」
    // 補正した座席番号。補正できなかった（座席が決められない）場合は空文字
    let seatNoArr = couchSeatNumberToSeatNumberMap?.[couchSeatNumber ?? ''];
    const hasA = seatNoArr?.some((item) => item.includes('A'));
    if (hasA) {
      seatNoArr?.sort((a, b) => a.slice(-1).localeCompare(b.slice(-1)));
    }

    return seatNoArr?.pop() ?? '';
  }

  /**
   * カウチ座席番号から座席番号との対応関係を表すオブジェクトを返却する関数
   * 例：{"1ABC":["1A","1B","1C"]}
   * @param segmentId セグメントID
   * @returns カウチ座席番号から座席番号との対応関係を表すオブジェクト
   */
  private createCouchSelectionStatusMap(segmentId?: string): { [key: string]: string[] } | undefined {
    if (!segmentId) {
      return undefined;
    }
    let result: { [key: string]: string[] } = {};
    this._currentSeatmapService.CurrentSeatmapData.selectedSeatInfoList
      ?.find((seatInfo) => seatInfo.segmentId === segmentId)
      ?.passengerList.forEach((seatInfoPassenger) => {
        const seatNumberList = convertCouchSeatNumberToSeatNumberList(seatInfoPassenger.seatNumber);
        const seatInfo = this._currentSeatmapService.findSeatInfoFromSeatNumber(seatNumberList?.[0])?.[0];
        // 搭乗者がカウチ席を選択している場合、そのカウチ席の選択情報を追加
        if (seatInfo?.isCouchSeat) {
          if (seatInfoPassenger.seatNumber) {
            result[seatInfoPassenger.seatNumber] = seatNumberList?.reverse() ?? [];
          }
        }
      });
    return result;
  }

  /**
   * サービス情報登録リクエストパラメータのうちservicesフィールドの部分を生成する関数
   * @returns サービス情報登録リクエストパラメータ.services
   */
  private createUpdateServicesRequestParameterService(): Array<UpdateServicesRequestServicesInner> | undefined {
    let result = this._getOrderStoreService.getOrderData.data?.air?.bounds
      ?.map((bounds) => {
        return {
          airBoundId: bounds.airBoundId ?? '',
          // PNR情報.<bound>.<segment>の内、segmentIdが選択中座席情報リストに含まれる
          segments:
            bounds.flights?.map(
              (flight) =>
                <UpdateServicesRequestServicesInnerSegmentsInner>{
                  segmentId: flight.id,
                  // セグメントIdに紐づく搭乗者要素数分繰り返し
                  // カウチ申込無しかつカウチ席を指定している
                  travelers: this.createUpdateServicesRequestParameterServiceTraveler(flight),
                }
            ) ?? [],
        };
      })
      .filter((bound) => {
        // 申込情報がないバウンドを除外
        return bound.segments.some((segment) => segment.travelers);
      })
      .map((bound) => {
        // 申込情報がないセグメントを除外
        return {
          airBoundId: bound.airBoundId,
          segments: bound.segments.filter((segment) => segment.travelers),
        };
      });
    return result?.length !== 0 && result ? result : undefined;
  }

  /**
   * サービス情報登録リクエストパラメータのうちservicesフィールドの中のtravelers部分を生成する関数
   * @param flight セグメント情報
   * @returns travelers
   */
  private createUpdateServicesRequestParameterServiceTraveler(
    flight: Type1
  ): Array<UpdateServicesRequestServicesInnerSegmentsInnerTravelersInner> | undefined {
    const result = this.couchDiffSeatInfoPassengers(
      this._currentSeatmapService.CurrentSeatmapData.selectedSeatInfoList?.find(
        (seatInfo) => seatInfo.segmentId === flight.id
      )?.passengerList,
      'selected'
    )
      ?.filter(
        (passenger) =>
          this._currentSeatmapService.findSeatInfoFromSeatNumber(passenger.seatNumber)?.[0].isCouchSeat &&
          !this._currentSeatmapService.findSeatInfoFromSeatNumber(passenger.ssrInformation?.ssrSeatNumber)?.[0]
            .isCouchSeat
      )
      .map((passenger) => {
        return <UpdateServicesRequestServicesInnerSegmentsInnerTravelersInner>{
          travelerId: passenger.id,
          specialServiceRequests: [
            {
              code: this.createCouchSsrCode(
                this._currentSeatmapService.findSegmentPassengerSeatInfoFromSeatNumber(
                  flight.id ?? '',
                  passenger.seatNumber ?? ''
                )?.length,
                passenger.seatNumber ?? ''
              ),
              operation: 'request',
            },
          ],
        };
      })
      // カウチ申込ありかつ座席未指定
      ?.concat(
        this.couchDiffSeatInfoPassengers(
          this._currentSeatmapService.CurrentSeatmapData.selectedSeatInfoList?.find(
            (seatInfo) => seatInfo.segmentId === flight.id
          )?.passengerList,
          'requested'
        )
          ?.filter(
            (passenger) =>
              this._currentSeatmapService.findSeatInfoFromSeatNumber(passenger.seatNumber)?.[0].isCouchSeat ===
                undefined &&
              this._currentSeatmapService.findSeatInfoFromSeatNumber(passenger.ssrInformation?.ssrSeatNumber)?.[0]
                .isCouchSeat === true
          )
          .map((passenger) => {
            return <UpdateServicesRequestServicesInnerSegmentsInnerTravelersInner>{
              travelerId: passenger.id,
              specialServiceRequests: [
                {
                  code: this.createCouchSsrCode(
                    this._currentSeatmapService.CurrentSeatmapData.selectedSeatInfoList
                      ?.find((seatInfo) => seatInfo.segmentId === flight.id)
                      ?.passengerList.filter(
                        (tempPassenger) =>
                          tempPassenger.ssrInformation?.ssrSeatNumber === passenger.ssrInformation?.ssrSeatNumber
                      ).length,
                    passenger.ssrInformation?.ssrSeatNumber ?? ''
                  ),
                  operation: 'cancel',
                },
              ],
            };
          }) ?? []
      );
    return result?.length !== 0 && result ? result : undefined;
  }

  /**
   * サービス情報登録APIエラー処理
   * @param errorCode APIエラーコード
   */
  public handleUpdateServiceApiError(errorCode?: string) {
    if (!errorCode) return;

    // チャイルドシート装着不可席混在の場合
    if (errorCode === ErrorCodeConstants.ERROR_CODES.EBAZ000252) {
      // ブレースホルダー文言生成処理
      let tempStatement = '';
      // 便名を加える
      this._getOrderStoreService.getOrderData.data?.air?.bounds?.forEach((bound) => {
        const segment = bound.flights?.find(
          (segment) =>
            segment.id ===
            // (this._common.apiError?.errors?.[0].source as updateServiceResponseWarningsSourceInner).item.flightId
            (this._common.apiError?.errors?.[0].source as updateServiceResponseErrorsSourceInner).segmentId
        );
        if (segment) {
          tempStatement = tempStatement
            .concat(segment.marketingAirlineCode ?? '')
            .concat(segment.marketingFlightNumber ?? '');
        }
      });
      tempStatement = tempStatement.concat(' ');
      // 搭乗者名を加える
      tempStatement = tempStatement.concat(
        this._currentSeatmapService.CurrentSeatmapData.passengers?.get(
          // (this._common.apiError?.errors?.[0].source as updateServiceResponseWarningsSourceInner).item.travelerId ?? ''
          (this._common.apiError?.errors?.[0].source as updateServiceResponseErrorsSourceInner).travelerId ?? ''
        )?.name ?? ''
      );
      const errorInfo: RetryableError = {
        errorMsgId: 'E0710',
        apiErrorCode: this._common.apiError?.errors?.[0].code,
        params: {
          key: 0,
          value: tempStatement,
          dontTranslate: true,
        },
      };
      this._common.errorsHandlerService.setRetryableError(PageType.PAGE, errorInfo);
      return;
    } else {
      // その他エラー時
      this._common.errorsHandlerService.setNotRetryableError({
        errorType: ErrorType.SYSTEM,
      });
    }
  }

  /**
   * 支払い画面で表示されるサービス情報登録API由来のワーニングを作成
   * @param warnings ワーニングリスト
   * @returns 支払い画面に表示される継続可能エラー
   */
  public createPaymentDisplayWarningInfoFromUpdateService(
    warnings?: Array<CreateMycarValetResponseWarningsInner>
  ): RetryableError | null {
    const seatNotDeleteWarning = warnings?.filter(
      (warning) => warning.code === ErrorCodeConstants.ERROR_CODES.WBAZ000213
    );
    const seatNotChangeableWarning = warnings?.filter(
      (warning) => warning.code === ErrorCodeConstants.ERROR_CODES.WBAZ000214
    );
    const seatNotSelectableWarning = warnings?.filter(
      (warning) => warning.code === ErrorCodeConstants.ERROR_CODES.WBAZ000253
    );
    const seatReservationTimeExceedWarning = warnings?.filter(
      (warning) => warning.code === ErrorCodeConstants.ERROR_CODES.WBAZ000254
    );
    const seatAttributeNotDeleteWarning = warnings?.filter(
      (warning) => warning.code === ErrorCodeConstants.ERROR_CODES.WBAZ000257
    );
    const seatReservationFailedWarning = warnings?.filter(
      (warning) => warning.code === ErrorCodeConstants.ERROR_CODES.WBAZ000355
    );

    if (
      seatNotDeleteWarning ||
      seatNotChangeableWarning ||
      seatNotSelectableWarning ||
      seatReservationTimeExceedWarning ||
      seatAttributeNotDeleteWarning ||
      seatReservationFailedWarning
    ) {
      if (seatNotDeleteWarning && seatNotDeleteWarning.length > 0) {
        return {
          errorMsgId: 'W0444',
          apiErrorCode: ErrorCodeConstants.ERROR_CODES.WBAZ000213,
          params: {
            key: 0,
            value: this.getStatementFromSeatReservationFailedWarning(
              seatNotDeleteWarning.map((warning) => warning.source) as updateServiceResponseWarningsSourceInner[]
            ),
            dontTranslate: true,
          },
        };
      }
      if (seatNotChangeableWarning && seatNotChangeableWarning.length > 0) {
        return {
          errorMsgId: 'W0444',
          apiErrorCode: ErrorCodeConstants.ERROR_CODES.WBAZ000214,
          params: {
            key: 0,
            value: this.getStatementFromSeatReservationFailedWarning(
              seatNotChangeableWarning.map((warning) => warning.source) as updateServiceResponseWarningsSourceInner[]
            ),
            dontTranslate: true,
          },
        };
      }
      if (seatNotSelectableWarning && seatNotSelectableWarning.length > 0) {
        return {
          errorMsgId: 'W0444',
          apiErrorCode: ErrorCodeConstants.ERROR_CODES.WBAZ000253,
          params: {
            key: 0,
            value: this.getStatementFromSeatReservationFailedWarning(
              seatNotSelectableWarning.map((warning) => warning.source) as updateServiceResponseWarningsSourceInner[]
            ),
            dontTranslate: true,
          },
        };
      }
      if (seatReservationTimeExceedWarning && seatReservationTimeExceedWarning.length > 0) {
        return {
          errorMsgId: 'W0444',
          apiErrorCode: ErrorCodeConstants.ERROR_CODES.WBAZ000254,
          params: {
            key: 0,
            value: this.getStatementFromSeatReservationFailedWarning(
              seatReservationTimeExceedWarning.map(
                (warning) => warning.source
              ) as updateServiceResponseWarningsSourceInner[]
            ),
            dontTranslate: true,
          },
        };
      }
      if (seatReservationFailedWarning && seatReservationFailedWarning.length > 0) {
        return {
          errorMsgId: 'W0444',
          apiErrorCode: ErrorCodeConstants.ERROR_CODES.WBAZ000355,
          params: {
            key: 0,
            value: this.getStatementFromSeatReservationFailedWarning(
              seatReservationFailedWarning.map(
                (warning) => warning.source
              ) as updateServiceResponseWarningsSourceInner[]
            ),
            dontTranslate: true,
          },
        };
      }
      if (seatAttributeNotDeleteWarning && seatAttributeNotDeleteWarning.length > 0) {
        return {
          errorMsgId: 'W0444',
          apiErrorCode: ErrorCodeConstants.ERROR_CODES.WBAZ000257,
          params: {
            key: 0,
            value: this.getStatementFromSeatReservationFailedWarning(
              seatAttributeNotDeleteWarning.map(
                (warning) => warning.source
              ) as updateServiceResponseWarningsSourceInner[]
            ),
            dontTranslate: true,
          },
        };
      }
    } else if ((warnings?.length ?? 0) > 0) {
      // その他エラー時
      this._common.errorsHandlerService.setNotRetryableError({
        errorType: ErrorType.SYSTEM,
      });
    }
    return null;
  }

  private getStatementFromSeatReservationFailedWarning(
    warningSource: updateServiceResponseWarningsSourceInner[]
  ): string {
    const tempStatementList: string[] = [];
    warningSource[0].items.forEach((item) => {
      let tempStatement = '';
      // 便名を加える
      this._getOrderStoreService.getOrderData.data?.air?.bounds?.forEach((bound) => {
        const segment = bound.flights?.find((segment) => segment.id === item.flightId);
        if (segment) {
          tempStatement = tempStatement
            .concat(segment.marketingAirlineCode ?? '')
            .concat(segment.marketingFlightNumber ?? '');
        }
      });
      tempStatement = tempStatement.concat(' ');
      // 搭乗者名を加える
      const allTravelerIds = item.travelerIds;
      const uniqueTravelerIds = Array.from(new Set(allTravelerIds));
      const passengerNames = uniqueTravelerIds
        .map((id) => this._currentSeatmapService.CurrentSeatmapData.passengers?.get(id)?.name ?? '')
        .filter((name) => name !== '');
      // 区切り文字の取得
      const travelersDivider = this._staticMsgPipe.transform('label.separaterComma');
      tempStatement = tempStatement.concat(passengerNames.join(travelersDivider));
      if (tempStatement.trim()) {
        tempStatementList.push(tempStatement);
      }
    });
    // 生成した文言を結合して返却
    return tempStatementList.join('<br>');
  }

  /**
   * カウチ席の代表者以外を取り除いた選択中座席情報リストを返却する関数
   * @param seatInfoPassengers 特定のセグメントで各搭乗者の申込情報
   * @param type 集約情報の基準：選択済み座席または申込済み座席
   * @return カウチ席の代表者以外を取り除いた選択中座席情報リスト
   */
  private couchDiffSeatInfoPassengers(
    seatInfoPassengers: SeatInfoPassengers[] | undefined,
    type: 'selected' | 'requested'
  ): SeatInfoPassengers[] | undefined {
    let seatNumberList: string[] = [];
    return seatInfoPassengers?.filter((passenger) => {
      const targetSeatNumber: string | undefined =
        type === 'selected' ? passenger.seatNumber : passenger.ssrInformation?.ssrSeatNumber;
      if (!seatNumberList.includes(targetSeatNumber ?? '')) {
        if (targetSeatNumber) {
          seatNumberList.push(targetSeatNumber);
        }
        return true;
      } else {
        return false;
      }
    });
  }

  /**
   * 申込情報からカウチ席SSRコードを生成する関数
   * @param targetPaxCount 対象となる搭乗者数
   * @param seatNumber 座席番号
   * @returns カウチ席SSRコード
   */
  private createCouchSsrCode(targetPaxCount?: number, seatNumber?: string): string | undefined {
    if (!targetPaxCount || !seatNumber) {
      return undefined;
    }

    let ssrCode = 'CO';

    switch (convertCouchSeatNumberToSeatNumberList(seatNumber)?.length) {
      case 3:
        ssrCode = ssrCode.concat('A');
        break;
      case 4:
        ssrCode = ssrCode.concat('B');
        break;
      default:
        return undefined;
    }

    switch (targetPaxCount) {
      case 1:
        ssrCode = ssrCode.concat('A');
        break;
      case 2:
        ssrCode = ssrCode.concat('B');
        break;
      case 3:
        ssrCode = ssrCode.concat('C');
        break;
      case 4:
        ssrCode = ssrCode.concat('D');
        break;
      default:
        return undefined;
    }

    return ssrCode;
  }
}
