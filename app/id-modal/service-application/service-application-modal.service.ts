/**
 * LoungeApplicationModalのサービスクラス
 */
import { Injectable } from '@angular/core';
import { defaultDispPassengerName, getBoundFlightFromSegmentId, isStringEmpty } from '@common/helper';
import { getPassengerLabel } from '@common/helper/passenger-label';
import { MListData } from '@common/interfaces';
import { SupportClass } from '@lib/components/support-class';
import { StaticMsgPipe } from '@lib/pipes';
import { Bound, Traveler, TravelerNamesInner } from 'src/sdk-reservation';
import {
  ServiceApplicationAirportInfo,
  ServiceApplicationModalSegmentInformation,
  ServiceApplicationModalSegmentInformationPassengerInformationTravelers,
  SERVICE_APPLICATION_FREE_APPLICATION_ID,
  SERVICE_APPLICATION_NON_STOCK_ID,
} from './service-application-modal.state';

@Injectable()
export abstract class ServiceApplicationModalService extends SupportClass {
  constructor(private __staticMsg: StaticMsgPipe) {
    super();
  }
  destroy() {}

  /**
   * サービス更新情報　搭乗者.updateTypeを更新する
   * @param segmentInfo サービス更新情報
   */
  public updateSsrParam(segmentInfo: ServiceApplicationModalSegmentInformation, isStatus = true) {
    segmentInfo.segment.forEach((seg) => {
      seg.passengerInformation?.forEach((pass) => {
        pass.ssr?.selectedList?.forEach((list) => {
          const num = seg.passengerInformation.filter((passNum) => passNum.ssr.code === list.catalogCode).length;
          list.isSelected = pass.ssr.code === list.catalogCode;
          list.isTotalDisp = 0 <= Number(list.quota) - num || list.isSelected;
          //以下の設定は最初だけ
          if (isStatus && (!pass.ssr.code || pass.ssr.code === '')) {
            if (pass.isWaived) {
              // サービスの在庫がない 在庫0
              list.status = this.__staticMsg.transform(SERVICE_APPLICATION_FREE_APPLICATION_ID);
            } else if (Number(list.quota) === 0 || 0 >= Number(list.quota) - num) {
              list.status = this.__staticMsg.transform(SERVICE_APPLICATION_NON_STOCK_ID);
            } else {
              list.status = '';
            }
          }
        });
        if (pass.ssr.code !== pass.ssr.prevCode) {
          pass.updateType = pass.ssr.code === '' ? 'cancel' : 'request';
        } else {
          //if (pass.updateType !== '') {
          pass.updateType = '';
        }
      });
      seg.updateSegmentFlag = seg.passengerInformation.some((pass) => pass.updateType !== '');
    });
  }

  /**
   * サービス更新情報　搭乗者表示名を取得する
   * @param data 搭乗者リスト
   * @param id 搭乗者ID
   * @param allTraveler 全搭乗者リスト
   * @returns 搭乗者名リスト
   */
  public getTravelerNames(
    data: Array<Traveler>,
    id: string,
    allTraveler: Array<Traveler>
  ): Array<Array<ServiceApplicationModalSegmentInformationPassengerInformationTravelers>> {
    const skipId: Array<string> = [];
    const ret: Array<Array<ServiceApplicationModalSegmentInformationPassengerInformationTravelers>> = [];
    data
      .filter((traveler) => traveler.id === id)
      .forEach((traveler) => {
        if (traveler.id && skipId.includes(traveler.id)) {
        } else {
          const add: Array<ServiceApplicationModalSegmentInformationPassengerInformationTravelers> = [];
          const travNum = allTraveler.findIndex((trav) => trav.id === traveler.id) + 1;
          //同伴者処理
          if (traveler.accompanyingTravelerId) {
            skipId.push(traveler.accompanyingTravelerId);
            const inf = allTraveler.find((trav) => trav.id === traveler.accompanyingTravelerId);
            const infNum = allTraveler.findIndex((trav) => trav.id === traveler.accompanyingTravelerId) + 1;
            if (inf) {
              if (inf.names && inf.names.length !== 0) {
                inf.names.forEach((name) => {
                  add.push(this.makeNames(inf.id ?? '', inf.passengerTypeCode ?? '', name, infNum));
                });
              } else {
                add.push(this.makeNames(inf.id ?? '', inf.passengerTypeCode ?? '', undefined, infNum));
              }
            }
          }
          if (traveler.names && traveler.names.length !== 0) {
            traveler.names.forEach((name) => {
              add.push(this.makeNames(traveler.id ?? '', traveler.passengerTypeCode ?? '', name, travNum));
            });
          } else {
            add.push(this.makeNames(traveler.id ?? '', traveler.passengerTypeCode ?? '', undefined, travNum));
          }
          ret.push(add);
        }
      });
    return ret;
  }

  makeNames(
    id: string,
    passengerTypeCode: string,
    name?: TravelerNamesInner,
    travNum = 0
  ): ServiceApplicationModalSegmentInformationPassengerInformationTravelers {
    return {
      id: id,
      type: getPassengerLabel(passengerTypeCode ?? ''),
      //name: name ? defaultDispPassengerName(name) : this.__staticMsg.transform('label.passenger.n', { '0': id }),
      name:
        name && !isStringEmpty(name?.firstName ?? '')
          ? defaultDispPassengerName(name)
          : this.__staticMsg.transform('label.passenger.n', { '0': travNum }),
    };
  }

  /**
   * バウンド情報から対象空港名称を取得
   * @param segId セグメントID
   * @param bounds バウンド情報
   * @returns
   */
  public getAirportNames(segId: string, bounds?: Array<Bound>): ServiceApplicationAirportInfo {
    if (bounds) {
      const flight = getBoundFlightFromSegmentId(bounds, segId);
      if (flight) {
        return {
          airportCode: flight.departure?.locationCode ?? '',
          locationName: flight.departure?.locationName ?? '',
          airportCodeTo: flight.arrival?.locationCode ?? '',
          locationNameTo: flight.arrival?.locationName ?? '',
        };
      }
    }
    return {
      airportCode: '',
      locationName: '',
      airportCodeTo: '',
      locationNameTo: '',
    };
  }

  public getAirportNamesBybound(segId: string, bounds?: Array<Bound>): ServiceApplicationAirportInfo {
    if (bounds) {
      const flight = bounds.find((bound) => bound.airBoundId === segId);
      if (flight) {
        return {
          airportCode: flight.originLocationCode ?? '',
          locationName: flight.originLocationName ?? '',
          airportCodeTo: flight.destinationLocationCode ?? '',
          locationNameTo: flight.destinationLocationName ?? '',
        };
      }
    }
    return {
      airportCode: '',
      locationName: '',
      airportCodeTo: '',
      locationNameTo: '',
    };
  }
}
