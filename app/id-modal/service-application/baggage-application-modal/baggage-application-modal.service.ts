/**
 * 手荷物申込画面 (R01-M052)のサービスクラス
 */
import { Injectable } from '@angular/core';
import { getBoundFromBoundId, getTravelerFromTravelerId } from '@common/helper';
import {
  DEFAULT_CURRENCY_CODE_ASW,
  RamlServicesBaggage,
  RamlServicesBaggageFirstSegment,
  RamlServicesBaggageFirstSegmentMain,
} from '@common/interfaces';
import { CurrentCartStoreService } from '@common/services';
import { StaticMsgPipe } from '@lib/pipes';
import { CommonLibService } from '@lib/services';
import { Subject } from 'rxjs';
import { Bound, Traveler } from 'src/sdk-reservation';
import { ServiceApplicationModalService } from '../service-application-modal.service';
import {
  ServiceApplicationModalBoundInformation,
  ServiceApplicationModalBoundInformationItem,
  ServiceApplicationModalSegmentInformation,
  ServiceApplicationModalSegmentInformationPassengerInformation,
  ServiceApplicationModalSegmentInformationPassengerInformationTravelers,
  SERVICE_APPLICATION_FBAG_CODE,
  SERVICE_APPLICATION_STATUS_REQUESTED,
} from '../service-application-modal.state';
@Injectable()
export class BaggageApplicationModalService extends ServiceApplicationModalService {
  constructor(
    private _common: CommonLibService,
    private _currentcartStoreService: CurrentCartStoreService,
    private _staticMsg: StaticMsgPipe
  ) {
    super(_staticMsg);
    this.subscribeService('updateInfoDataChange', this.updateInfoSource$, (data) => {
      this._updateInfo = data;
    });
  }

  //更新サービス情報(内部で保持するデータ)
  public updateInfoSource$: Subject<ServiceApplicationModalBoundInformation> = new Subject();
  public get updateInfo(): ServiceApplicationModalBoundInformation {
    return this._updateInfo;
  }
  private _updateInfo: ServiceApplicationModalBoundInformation = {
    bounds: [],
  };

  /**
   * 更新サービス情報(内部で保持するデータ)の更新
   * @param update 更新データ
   */
  setUpdateInfo(update: ServiceApplicationModalBoundInformation) {
    this.updateInfoSource$.next(update);
  }

  /**
   * サービス更新情報作成
   * @returns サービス更新情報
   */
  public initilizeBoundsInfo() {
    if (this._currentcartStoreService.CurrentCartData.data?.plan?.services?.baggage) {
      const baggage: RamlServicesBaggage = this._currentcartStoreService.CurrentCartData.data.plan.services
        .baggage as RamlServicesBaggage;
      const cart = this._currentcartStoreService.CurrentCartData.data;
      const travelers = cart?.plan?.travelers ?? [];
      const boundsInfo: ServiceApplicationModalBoundInformation = { bounds: [] };

      for (const boundId of Object.keys(baggage.firstBaggage)) {
        if (baggage.firstBaggage[boundId].isAvailable) {
          const bound: ServiceApplicationModalBoundInformationItem = {
            boundId: boundId,
            isBoundUpdate: false,
            segment: [],
          };
          const segmentInfo: ServiceApplicationModalSegmentInformation = { segment: [] };
          const boundCart = getBoundFromBoundId(cart.plan?.airOffer?.bounds ?? [], boundId);
          segmentInfo.segment.push(this.makeSegmentInfo(boundId, baggage.firstBaggage[boundId], travelers, boundCart));
          bound.segment = segmentInfo.segment;
          boundsInfo.bounds.push(bound);
        }
      }
      return boundsInfo;
    }
    return null;
  }

  /**
   * サービス更新情報 セグメント情報作成
   * @param boundId バウンドID
   * @param loungeSeg カート　ラウンジの対象セグメント
   * @param travelers カート搭乗者リスト
   * @param bound 対象バウンド
   * @returns セグメント情報
   */
  makeSegmentInfo(
    boundId: string,
    baggageSeg: RamlServicesBaggageFirstSegment,
    travelers: Array<Traveler>,
    bound?: Bound
  ) {
    let copyTravelers = travelers.map((data) => data);
    const passengers: Array<ServiceApplicationModalSegmentInformationPassengerInformation> = [];
    Object.keys(baggageSeg)
      .filter((key) => key !== 'isAvailable')
      .forEach((key) => {
        const info = baggageSeg[key];
        if (typeof info !== 'boolean') {
          //やらないと怒られるので !== 'boolean'
          const pTravelers = this.getTravelerNames(copyTravelers, key, travelers);
          const traveler = getTravelerFromTravelerId(copyTravelers, key);
          if (pTravelers.length !== 0) {
            passengers.push(
              this.makePassengerInfomation(
                key,
                info,
                pTravelers,
                traveler
              ) as ServiceApplicationModalSegmentInformationPassengerInformation
            );
            copyTravelers = copyTravelers.filter(
              (trv) => !pTravelers.some((ptrv) => ptrv.some((pptrv) => pptrv.id === trv.id))
            );
          }
        }
      });
    const air = this.getAirportNamesBybound(
      boundId,
      this._currentcartStoreService.CurrentCartData.data?.plan?.airOffer?.bounds
    );
    return {
      segmentId: bound?.flights?.[0]?.id ?? '',
      updateSegmentFlag: false,
      passengerInformation: passengers,
      airportCode: air.airportCode,
      locationName: air.locationName,
      airportCodeTo: air.airportCodeTo,
      locationNameTo: air.locationNameTo,
    };
  }

  /**
   * サービス更新情報 搭乗者情報作成
   * @param id 搭乗者ID
   * @param info　カート　手荷物情報　セグメント搭乗者ごとのデータ
   * @param pTravelers 搭乗者名リスト
   * @param traveler カート　搭乗者リスト　該当搭乗者
   * @returns 搭乗者情報作成
   */
  makePassengerInfomation(
    id: string,
    info: RamlServicesBaggageFirstSegmentMain,
    pTravelers: Array<Array<ServiceApplicationModalSegmentInformationPassengerInformationTravelers>>,
    traveler?: Traveler
  ) {
    const code = info.serviceStatus === SERVICE_APPLICATION_STATUS_REQUESTED ? SERVICE_APPLICATION_FBAG_CODE : '';
    const isFBAG = code === SERVICE_APPLICATION_FBAG_CODE;
    return {
      id: id,
      isWaived: false,
      travelers: pTravelers,
      PassengerType: traveler?.passengerTypeCode ?? '',
      ssr: {
        code: code,
        prevCode: code,
        meal: [],
        selectedList: [
          {
            quota: '0',
            catalogCode: SERVICE_APPLICATION_FBAG_CODE,
            dispName: '',
            isSelected: code === SERVICE_APPLICATION_FBAG_CODE,
            isTotalDisp: false,
            total: isFBAG ? info.prices?.total ?? 0 : info.catalogue?.prices?.total ?? 0,
            currencyCode: isFBAG
              ? info.prices?.currencyCode ?? DEFAULT_CURRENCY_CODE_ASW
              : info.catalogue?.prices?.currencyCode ?? DEFAULT_CURRENCY_CODE_ASW,
          },
        ],
      },
      updateType: '',
    };
  }
}
