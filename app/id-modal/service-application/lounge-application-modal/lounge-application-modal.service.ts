/**
 * ラウンジ申込画面 (R01-M051)のサービスクラス
 */
import { Injectable } from '@angular/core';
import { getTravelerFromTravelerId } from '@common/helper';
import {
  DEFAULT_CURRENCY_CODE_ASW,
  RamlServicesLounge,
  RamlServicesLoungeIdInfo,
  RamlServicesLoungeIdInfoMain,
  RamlServicesLoungeIdInfoMainCatalogue,
} from '@common/interfaces';
import { CurrentCartStoreService } from '@common/services/store/common/current-cart-store/current-cart-store.service';
import { StaticMsgPipe } from '@lib/pipes';
import { CommonLibService } from '@lib/services';
import { Subject } from 'rxjs';
import { Traveler } from 'src/sdk-reservation';
import { ServiceApplicationModalService } from '../service-application-modal.service';
import {
  ServiceApplicationModalSegmentInformation,
  ServiceApplicationModalSegmentInformationPassengerInformation,
  ServiceApplicationModalSegmentInformationPassengerInformationSsrSelectedList,
  ServiceApplicationModalSegmentInformationPassengerInformationTravelers,
  SERVICE_APPLICATION_LOUG_CODE,
  SERVICE_APPLICATION_LOUG_ID,
  SERVICE_APPLICATION_MYLG_CODE,
  SERVICE_APPLICATION_MYLG_ID,
  SERVICE_APPLICATION_STATUS_REQUESTED,
} from '../service-application-modal.state';
@Injectable()
export class LoungeApplicationModalService extends ServiceApplicationModalService {
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
  private updateInfo$: Subject<ServiceApplicationModalSegmentInformation> =
    new Subject<ServiceApplicationModalSegmentInformation>();
  public updateInfoSource$ = this.updateInfo$.asObservable();
  public get updateInfo(): ServiceApplicationModalSegmentInformation {
    return this._updateInfo;
  }
  private _updateInfo: ServiceApplicationModalSegmentInformation = {
    segment: [],
  };

  /**
   * 更新サービス情報(内部で保持するデータ)の更新
   * @param update 更新データ
   */
  setUpdateInfo(update: ServiceApplicationModalSegmentInformation) {
    this.updateInfo$.next(update);
  }

  /**
   * サービス更新情報作成
   * @returns サービス更新情報
   */
  public initilizeSegmentInfo() {
    if (this._currentcartStoreService.CurrentCartData.data?.plan?.services?.lounge) {
      const lounge: RamlServicesLounge = this._currentcartStoreService.CurrentCartData.data.plan.services.lounge;
      let travelers = this._currentcartStoreService.CurrentCartData.data?.plan?.travelers ?? [];
      const segmentInfo: ServiceApplicationModalSegmentInformation = { segment: [] };
      for (const segId of Object.keys(lounge)) {
        if (lounge[segId].isAvailable) {
          segmentInfo.segment.push(this.makeSegmentInfo(segId, lounge[segId], travelers));
        }
      }
      return segmentInfo;
    }
    return null;
  }

  /**
   * サービス更新情報 セグメント情報作成
   * @param segId セグメントID
   * @param loungeSeg カート　ラウンジの対象セグメント
   * @param travelers カート搭乗者リスト
   * @returns セグメント情報
   */
  makeSegmentInfo(segId: string, loungeSeg: RamlServicesLoungeIdInfo, travelers: Array<Traveler>) {
    let copyTravelers = travelers.map((data) => data);
    const passengers: Array<ServiceApplicationModalSegmentInformationPassengerInformation> = [];
    Object.keys(loungeSeg)
      .filter((key) => key !== 'isAvailable')
      .forEach((key) => {
        const info = loungeSeg[key];
        if (typeof info !== 'boolean') {
          //やらないと怒られるので !== 'boolean'
          const pTravelers = this.getTravelerNames(copyTravelers, key, travelers);
          const traveler = getTravelerFromTravelerId(copyTravelers, key);
          if (pTravelers.length !== 0) {
            passengers.push(this.makePassengerInfomation(key, info, pTravelers, traveler));
            copyTravelers = copyTravelers.filter(
              (trv) => !pTravelers.some((ptrv) => ptrv.some((pptrv) => pptrv.id === trv.id))
            );
          }
        }
      });
    const air = this.getAirportNames(segId, this._currentcartStoreService.CurrentCartData.data?.plan?.airOffer?.bounds);
    return {
      segmentId: segId,
      updateSegmentFlag: false,
      passengerInformation: passengers,
      airportCode: air.airportCode,
      locationName: air.locationName,
    };
  }

  /**
   * サービス更新情報 搭乗者情報作成
   * @param id 搭乗者ID
   * @param info　カート　ラウンジ情報　セグメント搭乗者ごとのデータ
   * @param pTravelers 搭乗者名リスト
   * @param traveler カート　搭乗者リスト　該当搭乗者
   * @returns 搭乗者情報作成
   */
  makePassengerInfomation(
    id: string,
    info: RamlServicesLoungeIdInfoMain,
    pTravelers: Array<Array<ServiceApplicationModalSegmentInformationPassengerInformationTravelers>>,
    traveler?: Traveler
  ) {
    const code = info.serviceStatus === SERVICE_APPLICATION_STATUS_REQUESTED ? info.code ?? '' : '';
    return {
      id: id,
      isWaived: info.isWaived,
      travelers: pTravelers,
      PassengerType: traveler?.passengerTypeCode ?? '',
      ssr: {
        code: code,
        prevCode: code,
        meal: [],
        selectedList: info.catalogue?.map((item) => this.makePassengerInfomationSsr(code, item, info)),
      },
      updateType: '',
    } as ServiceApplicationModalSegmentInformationPassengerInformation;
  }

  /**
   * サービス更新情報 搭乗者情報 SSR部作成
   * @param code SSRコード
   * @param item カート情報　ラウンジ　カタログ
   * @param info カート情報　セグメント
   * @returns
   */
  makePassengerInfomationSsr(
    code: string,
    item: RamlServicesLoungeIdInfoMainCatalogue,
    info: RamlServicesLoungeIdInfoMain
  ): ServiceApplicationModalSegmentInformationPassengerInformationSsrSelectedList {
    let disp = item.code;
    if (item.code === SERVICE_APPLICATION_LOUG_CODE) {
      disp = this._staticMsg.transform(SERVICE_APPLICATION_LOUG_ID);
    } else if (item.code === SERVICE_APPLICATION_MYLG_CODE) {
      disp = this._staticMsg.transform(SERVICE_APPLICATION_MYLG_ID);
    } else {
      disp = this._staticMsg.transform(item.code);
    }
    const isSame = code === item.code;
    return {
      quota: item.quota,
      catalogCode: item.code,
      dispName: disp,
      isSelected: code === item.code,
      isTotalDisp: false,
      total: isSame ? info.prices?.total ?? 0 : item.prices.total,
      currencyCode: isSame ? info.prices?.currencyCode ?? DEFAULT_CURRENCY_CODE_ASW : item.prices.currencyCode,
    };
  }
}
