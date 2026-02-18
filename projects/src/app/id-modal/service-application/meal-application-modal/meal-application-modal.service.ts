/**
 * 機内食申込画面 (R01-M053)のサービスクラス
 */
import { ChangeDetectorRef, Injectable } from '@angular/core';
import { getTravelerFromTravelerId } from '@common/helper';
import {
  DEFAULT_CURRENCY_CODE_ASW,
  MListData,
  RamlServicesMeal,
  RamlServicesMealPassenger,
  RamlServicesMealPassengerAppliedMeal,
} from '@common/interfaces';
import { MealType } from '@common/interfaces/meal-type';
import { PassengerType } from '@common/interfaces/passenger-type';
import { CurrentCartStoreService } from '@common/services';
import { GetMealState } from '@common/store';
import { StaticMsgPipe } from '@lib/pipes';
import { CommonLibService } from '@lib/services';
import { Subject } from 'rxjs';
import { BoundFlightsInner, Traveler } from 'src/sdk-reservation';
import { GetMealResponseDataDD } from 'src/sdk-servicing';
import { ServiceApplicationModalService } from '../../service-application-modal.service';
import {
  MealApplicationMastarData,
  MealApplicationPassengerMapInfo,
  MealApplicationPassengerMapInfoSegment,
  MealApplicationPassengerMapInfoSegmentMeal,
  ServiceApplicationModalSegmentInformation,
  ServiceApplicationModalSegmentInformationPassengerInformation,
  ServiceApplicationModalSegmentInformationPassengerInformationSsrMeal,
  ServiceApplicationModalSegmentInformationReturn,
  ServiceApplicationModalSegmentInformationSegment,
  SERVICE_APPLICATION_BABY_MEAL_CODE,
  SERVICE_APPLICATION_CHILD_MEAL_CODE,
  SERVICE_APPLICATION_NORMAL_MEAL_ID,
  SERVICE_APPLICATION_NOT_PREORDER_MEAL_ID,
  SERVICE_APPLICATION_STATUS_REQUEST,
  SERVICE_APPLICATION_STATUS_REQUESTED,
  SERVICE_APPLICATION_UNAVALIABLE_ID,
  SERVICE_APPLICATION_UNKOWN_MEAL_ID,
  SERVICE_LIGHTMEAL_ID,
  SERVICE_MEAL_ID,
  SERVICE_REFRESHMENTS_ID,
} from '../../service-application-modal.state';
import { MealApplicationSelectModalSelectInfo } from './meal-application-select-modal/meal-application-select-modal-payload.state';
@Injectable()
export class MealApplicationModalService extends ServiceApplicationModalService {
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
   * 更新フラグ（リクエスト時の送信フラグ）の更新
   * @param segments
   */
  updateSegmentInfoFlag(segments: ServiceApplicationModalSegmentInformation) {
    segments.segment.forEach((seg) => {
      seg.updateSegmentFlag = seg.passengerInformation.some((pass) =>
        pass.ssr.meal.some((meal) => meal.updateType === 'request' || meal.updateType === 'cancel')
      );
    });
  }

  /**
   * 更新サービス情報の初期化処理
   * @param response 機内食情報取得APIのレスポンス
   * @returns 更新サービス情報　カートに機内食情報がない場合null
   */
  public initilizeSegmentInfo(response: GetMealState): ServiceApplicationModalSegmentInformationReturn | null {
    if (this._currentcartStoreService.CurrentCartData.data?.plan?.services?.meal) {
      const meal: RamlServicesMeal = this._currentcartStoreService.CurrentCartData.data.plan.services.meal;
      let travelers = this._currentcartStoreService.CurrentCartData.data?.plan?.travelers ?? [];
      const segmentInfo: ServiceApplicationModalSegmentInformation = { segment: [] };
      let isJapanFlightSeg: boolean = false;
      let isAvailable: boolean = false;

      for (const segId of Object.keys(meal)) {
        const passengers: Array<ServiceApplicationModalSegmentInformationPassengerInformation> = [];

        // 国内線判定
        // memo:ここで繰り返しから除外すると、搭乗者名や種別にも影響、発着地の表示には介入不可、この先の処理にて表示制御
        this._currentcartStoreService.CurrentCartData.data.plan.airOffer?.bounds?.forEach((bound) => {
          bound?.flights?.forEach((flight) => {
            if (flight?.id === segId) {
              isJapanFlightSeg = flight.isJapanDomesticFlight === true;
            }
          });
        });
        isAvailable = meal[segId].isAvailable;

        for (const key of Object.keys(meal[segId]).filter((key) => key !== 'isAvailable' && key !== 'isExpired')) {
          const info = meal[segId][key];
          if (typeof info !== 'boolean') {
            //やらないと怒られるので !== 'boolean'
            const responseSeg = response.data[key]?.[segId];
            passengers.push(this.makePassenger(key, segId, info, travelers, responseSeg));
          }
        }
        segmentInfo.segment.push(this.makeSegmentInfo(segId, passengers, isJapanFlightSeg, isAvailable));
      }
      const returnData: ServiceApplicationModalSegmentInformationReturn = {
        segmentInfo: segmentInfo,
      };
      return returnData;
    }
    return null;
  }

  /**
   * 更新サービス情報 機内食リストの作成
   * @param segId セグメントID
   * @param appliedMealList カート情報の注文機内食リスト
   * @param traveler 搭乗者
   * @param responseSeg 機内食情報取得APIのレスポンスの対象セグメント
   * @returns 機内食リスト
   */
  getMealList(
    segId: string,
    appliedMealList: Array<RamlServicesMealPassengerAppliedMeal>,
    traveler?: Traveler,
    responseSeg?: GetMealResponseDataDD
  ) {
    return appliedMealList.map((list) => {
      let code = '';
      let prevCode = '';
      let type = list.type ?? '';
      if (list.serviceStatus === SERVICE_APPLICATION_STATUS_REQUESTED) {
        code = list.code ?? '';
        prevCode = list.code ?? '';
      } else if (traveler?.isChildMealRecommendedAge && traveler?.passengerTypeCode === PassengerType.CHD) {
        code = SERVICE_APPLICATION_CHILD_MEAL_CODE;
        type = MealType.SPECIAL;
        prevCode = list.code ?? '';
      } else if (traveler?.passengerTypeCode === PassengerType.INF) {
        code = SERVICE_APPLICATION_BABY_MEAL_CODE;
        type = '';
        prevCode = responseSeg?.isWithinApplicationDeadline ? list.code ?? '' : SERVICE_APPLICATION_BABY_MEAL_CODE;
      }

      return {
        isWithinApplicationDeadline: responseSeg?.isWithinApplicationDeadline === true,
        type: type,
        code: code,
        prevCode: prevCode,
        prevMessageId: list.preOrderMealMessageId || '',
        total: list.price?.total || 0,
        currencyCode: list.price?.currencyCode ?? DEFAULT_CURRENCY_CODE_ASW,
        isBabySelected: code === SERVICE_APPLICATION_BABY_MEAL_CODE, //変更前状態にかかわらずBBMLの場合は初期表示選択状態とする、つまり初期表示時にsubmitは有効
        updateType: code !== prevCode ? SERVICE_APPLICATION_STATUS_REQUEST : '',
      };
    });
  }

  /**
   * 更新サービス情報　搭乗者情報作成
   * @param id 搭乗者ID
   * @param segId セグメントID
   * @param info カート、サービス、機内食の搭乗者ごとの情報
   * @param travelers 搭乗者リスト
   * @param responseSeg 機内食情報取得APIのレスポンスの対象セグメント
   * @returns 搭乗者情報
   */
  makePassenger(
    id: string,
    segId: string,
    info?: RamlServicesMealPassenger,
    travelers?: Array<Traveler>,
    responseSeg?: GetMealResponseDataDD
  ): ServiceApplicationModalSegmentInformationPassengerInformation {
    const code = '';
    const pTravelers = this.getTravelerNames(travelers ?? [], id, travelers ?? []);
    const traveler = getTravelerFromTravelerId(travelers ?? [], id);

    const mealList: Array<ServiceApplicationModalSegmentInformationPassengerInformationSsrMeal> = this.getMealList(
      segId,
      0 < (info?.appliedMealList ?? []).length ? info?.appliedMealList ?? [] : [{}],
      traveler,
      responseSeg
    );

    return {
      id: id,
      isWaived: false,
      travelers: [pTravelers[0]],
      PassengerType: traveler?.passengerTypeCode ?? '',
      ssr: {
        meal: mealList,
        code: code,
        prevCode: code,
        selectedList: [],
      },
      updateType: '',
    };
  }

  /**
   * 更新サービス情報　セグメント情報作成
   * @param segId セグメントID
   * @param passengers 搭乗者情報リスト　別で作成しここでは代入するだけ
   * @returns セグメント情報
   */
  makeSegmentInfo(
    segId: string,
    passengers: Array<ServiceApplicationModalSegmentInformationPassengerInformation>,
    isJapanFlightSeg: boolean,
    isAvailable: boolean
  ): ServiceApplicationModalSegmentInformationSegment {
    const air = this.getAirportNames(segId, this._currentcartStoreService.CurrentCartData.data?.plan?.airOffer?.bounds);
    return {
      segmentId: segId,
      updateSegmentFlag: false,
      passengerInformation: passengers,
      airportCode: air.airportCode,
      locationName: air.locationName,
      airportCodeTo: air.airportCodeTo,
      locationNameTo: air.locationNameTo,
      isJapanFlightSeg: isJapanFlightSeg,
      isAvailable: isAvailable,
    };
  }

  /**
   * 表示用データ作成
   * @param response 機内食情報取得APIのレスポンス
   * @param segments サービス更新情報
   * @param mastarData cacheデータ
   * @returns 機内食申込画面 (R01-M053)の表示用の保持データ
   */
  public initializeMealMap(
    response: GetMealState,
    segments: ServiceApplicationModalSegmentInformation,
    mastarData: MealApplicationMastarData
  ) {
    const ret: Array<MealApplicationPassengerMapInfo> = [];
    for (let [travelerId, travelerInfo] of Object.entries(response.data)) {
      //　機内食情報取得APIレスポンスの搭乗者ごとの表示でカートと紐づける部分　カートで１つ目に当たった搭乗者
      const traveler = segments.segment
        .find((seg) => seg.passengerInformation.some((passenger) => passenger.id === travelerId))
        ?.passengerInformation.find((passenger) => passenger.id === travelerId);
      const isINF = traveler?.PassengerType === PassengerType.INF;

      const segmentList: Array<MealApplicationPassengerMapInfoSegment> = [];
      for (let [segmentId, segmentInfo] of Object.entries(travelerInfo)) {
        const segTrav = segments.segment
          .find((seg) => seg.segmentId === segmentId)
          ?.passengerInformation.find((pass) => pass.id === travelerId);
        const segment = segments.segment.find((seg) => seg.segmentId === segmentId);
        const mealFlg = segTrav?.ssr.meal.some((meal) => meal.code !== '') ?? false;
        const isJapanFlightSeg = segment?.isJapanFlightSeg ?? false;
        const isAvailable = segment?.isAvailable ?? false;

        if (!(isJapanFlightSeg && !segmentInfo.mealCodeForDomestic) && !(!isJapanFlightSeg && !isAvailable)) {
          // 国内線かつミールコードがnullと国内線ではないかつisAvailableがfalseのものを除外
          const segData: MealApplicationPassengerMapInfoSegment = {
            segmentId: segmentId,
            airportCode: segment?.airportCode ?? '',
            locationName: segment?.locationName ?? '',
            airportCodeTo: segment?.airportCodeTo ?? '',
            locationNameTo: segment?.locationNameTo ?? '',
            meals:
              segTrav?.ssr.meal.map((temp) =>
                this.getMapMeals(temp, segmentInfo, mastarData, isJapanFlightSeg, isINF)
              ) || [], //複数ミールは 一応対応
            buttonDisabled: isJapanFlightSeg,
          };
          segmentList.push(segData);
        }
      }

      const travelerData = traveler?.travelers?.[0].find((item) => item.id === travelerId);

      ret.push({
        travelerId: travelerId,
        passengerTypeCode: travelerData?.type ?? '',
        travelers: {
          id: travelerId,
          name: travelerData?.name ?? '',
          type: travelerData?.type ?? '',
          isInf: isINF,
        },
        segment: segmentList,
      });
    }
    return ret;
  }

  /**
   * 表示用 機内食情報作成
   * @param meal サービス更新情報の機内食情報
   * @param segmentInfo 機内食情報取得APIのレスポンスの対象セグメント
   * @param mastarData cacheデータ
   * @param isJapanFlightSeg 国内線判定
   * @returns 表示用 機内食情報
   */
  getMapMeals(
    meal: ServiceApplicationModalSegmentInformationPassengerInformationSsrMeal,
    segmentInfo: GetMealResponseDataDD,
    mastarData: MealApplicationMastarData,
    isJapanFlightSeg: boolean,
    isInf: boolean
  ): MealApplicationPassengerMapInfoSegmentMeal {
    let dispName = '';
    let bbmlChkShow: boolean = false;
    const unknown = this._staticMsg.transform(SERVICE_APPLICATION_UNKOWN_MEAL_ID);
    let isTypeDisp = true;
    if (isInf) {
      // 幼児の場合、ベビーミール選択
      isTypeDisp = false;
      if (isJapanFlightSeg) {
        dispName = this._staticMsg.transform(SERVICE_APPLICATION_UNAVALIABLE_ID);
      } else if (!meal.isWithinApplicationDeadline) {
        dispName = this.timeOverMealMessage;
      } else {
        bbmlChkShow = true;
        dispName = mastarData.specialMeal.find((map) => map.ssr_code === meal.code)?.special_meal_name ?? unknown;
      }
    } else {
      // 幼児以外の場合、機内食選択
      if (isJapanFlightSeg) {
        // 国内線の場合、軽食・食事・茶菓の出し分け
        switch (segmentInfo.mealCodeForDomestic) {
          case 'R':
            dispName = this._staticMsg.transform(SERVICE_LIGHTMEAL_ID);
            break;
          case 'M':
            dispName = this._staticMsg.transform(SERVICE_MEAL_ID);
            break;
          case 'S':
            dispName = this._staticMsg.transform(SERVICE_REFRESHMENTS_ID);
            break;
          default:
            dispName = unknown;
            break;
        }
      } else if (!meal.isWithinApplicationDeadline) {
        dispName = this.timeOverMealMessage;
        isTypeDisp = false;
      } else if (meal.code === SERVICE_APPLICATION_CHILD_MEAL_CODE && meal.prevCode === '') {
        dispName = mastarData.specialMeal.find((map) => map.ssr_code === meal.code)?.special_meal_name ?? unknown;
      } else if (meal.code !== '') {
        if (meal.type === MealType.SPECIAL) {
          dispName = mastarData.specialMeal.find((map) => map.ssr_code === meal.code)?.special_meal_name ?? unknown;
        } else if (meal.type === MealType.ANCILLARY) {
          dispName = mastarData.listDataSsr.find((map) => map.value === meal.code)?.display_content ?? unknown;
        } else if (meal.type === MealType.PREORDER) {
          if (meal.prevMessageId !== '') {
            dispName = this._staticMsg.transform(meal.prevMessageId);
          } else {
            dispName = unknown;
          }
        }
      } else if (meal.prevCode === '' && segmentInfo.preorderMealList && segmentInfo.preorderMealList.length !== 0) {
        dispName = this._staticMsg.transform(SERVICE_APPLICATION_NOT_PREORDER_MEAL_ID);
        isTypeDisp = false;
      } else if (meal.prevCode === '') {
        dispName = this._staticMsg.transform(SERVICE_APPLICATION_NORMAL_MEAL_ID);
        isTypeDisp = false;
      }
    }

    return {
      mealType: meal.type,
      mealTypeLabel: this.getMealTypeLabel(meal.type),
      isTypeDisp: isTypeDisp,
      isDelete: meal.code !== '',
      isSelected: meal.code !== '',
      mealCode: meal.code,
      prevMealCode: meal.code,
      total: meal.code !== '' ? meal.total : 0,
      currencyCode: meal.currencyCode ?? DEFAULT_CURRENCY_CODE_ASW,
      dispName: dispName,
      isWithinApplicationDeadline: meal.isWithinApplicationDeadline,
      bbmlChkShow: bbmlChkShow,
    };
  }

  /**
   * 選択した機内食情報をセットする
   * @param passengerMap  表示用情報
   * @param segments セグメント情報
   * @param segmentId セグメントID
   * @param travelerId 搭乗者ID
   * @param index 機内食のインデックス
   * @param value　選択した機内食情報
   */
  setMeal(
    passengerMap: Array<MealApplicationPassengerMapInfo>,
    segments: ServiceApplicationModalSegmentInformation,
    segmentId: string,
    travelerId: string,
    index: number,
    value: MealApplicationSelectModalSelectInfo
  ) {
    const target = segments.segment
      .find((seg) => seg.segmentId === segmentId)
      ?.passengerInformation.find((pass) => pass.id === travelerId);
    const disp = passengerMap
      .find((pass) => pass.travelerId === travelerId)
      ?.segment.find((seg) => seg.segmentId === segmentId);
    if (target && disp && value) {
      target.ssr.meal[index].type = value.type;
      target.ssr.meal[index].code = value.code;
      target.ssr.meal[index].prevMessageId = value.key;
      target.ssr.meal[index].total = value.total;
      target.ssr.meal[index].updateType =
        target.ssr.meal[index].prevCode === value.code ? '' : SERVICE_APPLICATION_STATUS_REQUEST;
      disp.meals[index].mealCode = value.code;
      disp.meals[index].mealType = value.type;
      disp.meals[index].dispName = value.disp;
      disp.meals[index].total = value.total;
      disp.meals[index].isSelected = true;
      disp.meals[index].isTypeDisp = true;
      disp.meals[index].mealTypeLabel = this.getMealTypeLabel(value.type);
    }
  }

  /**
   * 必要な汎用マスタを保持
   */
  public timeOverMealMessage = '';
  saveMessageData(listData: Array<MListData>) {
    const lang = this._common.aswContextStoreService.aswContextData.lang;
    //受付終了の旨
    this.timeOverMealMessage =
      listData.find((list) => list.data_code === 'PD_030' && list.value === '5' && list.lang === lang)
        ?.display_content ?? '';
  }

  /**
   * ミールタイプのラベルを取得
   * @param type ミールタイプ
   * @returns ミールタイプのラベル
   */
  getMealTypeLabel(type: string) {
    if (type === MealType.SPECIAL) {
      return 'label.specialMeal';
    } else if (type === MealType.ANCILLARY) {
      return 'label.chargeableMeal';
    } else if (type === MealType.PREORDER) {
      return 'label.preOrderMeal';
    }
    return '';
  }
}
