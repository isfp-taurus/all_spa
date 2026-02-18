import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  apiEventAll,
  deleteHtmlTags,
  fixedArrayCache,
  formatSeconds,
  getAirLineNameFromCache,
  getAirportNameFromCache,
  getApplyListData,
  getCabinClassNameKey,
  getPaxName,
  isStringEmpty,
} from '@common/helper';
import { AirportAllData, MListData, TaxAllLang, TaxAllLangItem } from '@common/interfaces';
import {
  CurrentCartStoreService,
  LocalPlanService,
  PlanReviewStoreService,
  DeletePlansStoreService,
  GetAirportListByCountryService,
} from '@common/services';
import { RoutesResRoutes } from '@conf/routes.config';
import { SupportClass } from '@lib/components/support-class';
import { DialogClickType, ErrorType } from '@lib/interfaces';
import { AmountFormatPipe, DateFormatPipe, StaticMsgPipe } from '@lib/pipes';
import {
  AswMasterService,
  CommonLibService,
  DialogDisplayService,
  ErrorsHandlerService,
  LoggerDatadogService,
  SystemDateService,
} from '@lib/services';
import { Observable } from 'rxjs';
import {
  BoundFlightsInner,
  PlansDeletePlansRequest,
  PlansGetEstimationRequest,
  PlansGetEstimationRequestBound,
  PlansGetEstimationRequestBoundInnerFlight,
  PlansGetEstimationRequestPrice,
  PlansGetEstimationRequestPricePassenger,
  PlansGetEstimationRequestPricePassengerPaidServiceCharges,
  PlansGetEstimationRequestPricePassengerTaxesFeesChargesAirlineCharges,
  PlansGetEstimationRequestPriceSummary,
  PlansGetEstimationRequestPriceSummaryTotalPricesServicePrices,
  PostGetCartResponseDataPlan,
  Traveler,
} from 'src/sdk-reservation';
import {
  getPlanReviewGetEstimationRequestMasterKey,
  travelerTypeStaticMsgs,
  travelerNumStaticMsgs,
} from './plan-review-plan-manipulation-menu.state';
import { ErrorCodeConstants } from '@conf/app.constants';

/**
 * プラン操作メニュー用サービス
 */
@Injectable({
  providedIn: 'root',
})
export class PlanReviewPlanManipulationMenuService extends SupportClass {
  constructor(
    private _common: CommonLibService,
    private _router: Router,
    private _errorsHandlerSvc: ErrorsHandlerService,
    private _dialogSvc: DialogDisplayService,
    private _localPlanService: LocalPlanService,
    private _currentCartStoreService: CurrentCartStoreService,
    private _deletePlansStoreService: DeletePlansStoreService,
    private _planReviewStoreService: PlanReviewStoreService,
    private _aswMasterSvc: AswMasterService,
    private _staticMsgPipe: StaticMsgPipe,
    private _dateFormatPipe: DateFormatPipe,
    private _amountFormatPipe: AmountFormatPipe,
    private _sysDateService: SystemDateService,
    private _getAirportListByCountryService: GetAirportListByCountryService,
    private _loggerSvc: LoggerDatadogService
  ) {
    super();
  }

  /**
   * プラン削除処理
   */
  deletePlan(afterEvent?: () => void) {
    this.subscribeService(
      'PlanManipulationMenuComponent Dialog buttonClickObservable',
      this._dialogSvc.openDialog({ message: 'm_dynamic_message-MSG1039' }).buttonClick$,
      (result) => {
        this.deleteSubscription('PlanManipulationMenuComponent Dialog buttonClickObservable');
        if (result.clickType === DialogClickType.CONFIRM) {
          if (this._common.isNotLogin()) {
            // 未ログイン状態の場合
            const localPlanList = this._localPlanService.getLocalPlans() ?? {};

            // 操作中カートとcartIdが一致するプランを検索
            const index = localPlanList?.plans?.findIndex(
              (plan) => plan.cartId === this._currentCartStoreService.CurrentCartData.data?.cartId
            );
            // 一致するプランが存在する場合、削除して上書き
            if (typeof index !== 'undefined' && index !== -1) {
              localPlanList?.plans?.splice(index, 1);
              this._localPlanService.setLocalPlans(localPlanList);
            }
            // 削除フラグをセッションストレージにセット、フライト検索画面への動的文言用
            window.localStorage.setItem('planDeleted', JSON.stringify(true));
            // フライト検索画面へ遷移
            this._router.navigateByUrl(RoutesResRoutes.FLIGHT_SEARCH);
            if (afterEvent) {
              afterEvent();
            }
          } else {
            // ログイン済みの場合

            // プラン削除APIを実行
            const requestParameter: PlansDeletePlansRequest = {
              cartIds: [this._currentCartStoreService.CurrentCartData.data?.cartId ?? ''],
            };
            apiEventAll(
              () => this._deletePlansStoreService.setDeletePlansFromApi(requestParameter),
              this._deletePlansStoreService.getDeletePlans$(),
              (response) => {
                // 削除フラグをセッションストレージにセット、フライト検索画面への動的文言用
                window.localStorage.setItem('planDeleted', JSON.stringify(true));
                // フライト検索画面へ遷移
                this._router.navigateByUrl(RoutesResRoutes.FLIGHT_SEARCH);
                if (afterEvent) {
                  afterEvent();
                }
              },
              (error) => {
                const apiErr = this._common.apiError?.errors?.[0]?.code ?? '';
                if (apiErr === ErrorCodeConstants.ERROR_CODES.EBAZ000278) {
                  this._errorsHandlerSvc.setNotRetryableError({
                    errorType: ErrorType.BUSINESS_LOGIC,
                    errorMsgId: 'E0333',
                  });
                } else {
                  this._errorsHandlerSvc.setNotRetryableError({
                    errorType: ErrorType.SYSTEM,
                    apiErrorCode: apiErr,
                  });
                }
                if (afterEvent) {
                  afterEvent();
                }
              }
            );
          }
        }
      }
    );
  }

  /**
   * 見積(PDF)取得APIのリクエストパラメータ作成処理
   */
  getEstimationRequest$(): Observable<PlansGetEstimationRequest> {
    return new Observable((observer) => {
      // キャッシュ取得
      const lang = this._common.aswContextStoreService.aswContextData.lang;
      this.subscribeService(
        'PlanReviewContComponent getMasterDataAll',
        this._aswMasterSvc.load(getPlanReviewGetEstimationRequestMasterKey(lang), true),
        (data) => {
          this.deleteSubscription('PlanReviewContComponent getMasterDataAll');
          const currentDate = this._sysDateService.getSystemDate();

          const airportCache: { [key: string]: string } = data[0];
          const airlineCache: { [key: string]: string } = data[1];
          const listDataAll: Array<MListData> = getApplyListData(data[2], currentDate);
          const cabinNames = listDataAll?.filter((list) => list.data_code === 'PD_930' && list.lang === lang);
          const taxAllLang: TaxAllLang = data[3];
          const taxCurrentLang = taxAllLang?.[lang] ?? [];
          const ffCache: { [key: string]: string } = data[4];
          const airportAll: Array<AirportAllData> = fixedArrayCache(data[5]);

          const plan = this._currentCartStoreService.CurrentCartData.data?.plan ?? {};

          // ▼ ▼ ▼ displayDateTime ▼ ▼ ▼
          const displayDateTime = this._dateFormatPipe.transform(
            this._planReviewStoreService.PlanReviewData.currentDate ?? '',
            'default_currentDate'
          );

          // ▼ ▼ ▼ bound ▼ ▼ ▼
          const outputBounds = this.getOutputBounds(plan, airportCache, airlineCache, cabinNames, ffCache);

          // ▼ ▼ ▼ priceSummary ▼ ▼ ▼
          const outputPriceSummary = this.getReqPriceSummary(plan);

          // ▼ ▼ ▼ price ▼ ▼ ▼
          const outputPrice = this.getReqPrice(plan, taxCurrentLang);

          // ▼ ▼ ▼ isHongKongWord ▼ ▼ ▼
          const hkAirportList = this._getAirportListByCountryService.getAirportListByCountry('HK', airportAll);
          const isHkSeg =
            plan.airOffer?.bounds?.some((bound) =>
              bound.flights?.some((segment) => {
                const departureAirport = segment.departure?.locationCode ?? '';
                const arrivalAirport = segment.arrival?.locationCode ?? '';
                return hkAirportList.includes(departureAirport) || hkAirportList.includes(arrivalAirport);
              })
            ) &&
            Object.values(plan?.prices?.unitPrices ?? {}).some((pax) => pax.ticketPrices?.insuranceSurcharge?.value);

          const requestParameter: PlansGetEstimationRequest = {
            displayDateTime: displayDateTime,
            priceSummary: outputPriceSummary,
            bound: outputBounds,
            price: outputPrice,
            isHongKongSegment: isHkSeg,
          };
          observer.next(requestParameter);
        }
      );
    });
  }

  /**
   * 見積(PDF)取得APIリクエスト用バウンド情報取得処理
   * @param plan
   * @param airportCache
   * @param airlineCache
   * @param cabinNames
   * @param ffCache
   * @returns
   */
  getOutputBounds(
    plan: PostGetCartResponseDataPlan,
    airportCache: { [key: string]: string },
    airlineCache: { [key: string]: string },
    cabinNames: Array<MListData>,
    ffCache: { [key: string]: string }
  ): PlansGetEstimationRequestBound {
    const boundEntries =
      plan.airOffer?.bounds?.map((bound, index) => {
        const flightList: Array<PlansGetEstimationRequestBoundInnerFlight> =
          bound.flights?.map((segment) => ({
            // 出発日(セグメント)
            departureDate:
              (segment.departureDaysDifferenceByBound ?? 0) >= 1
                ? this._dateFormatPipe.transform(segment.departure?.dateTime ?? '', 'default_itineraryRsDate')
                : undefined,
            // 出発時刻
            departureTime: this._dateFormatPipe.transform(
              segment.departure?.dateTime ?? '',
              'default_departuredate.time'
            ),
            // 出発地
            departureLocationName:
              getAirportNameFromCache(segment.departure?.locationCode ?? '', airportCache) ??
              segment.departure?.locationName,
            // 到着時刻
            arrivalTime: this._dateFormatPipe.transform(segment.arrival?.dateTime ?? '', 'default_departuredate.time'),
            // 到着日付差
            arrivalTimeDifference: this.getArrivalDaysDiffStr(0),
            // 到着地
            arrivalLocationName:
              getAirportNameFromCache(segment.arrival?.locationCode ?? '', airportCache) ??
              segment.arrival?.locationName,
            // 便名
            marketingFlightName: `${segment.marketingAirlineCode}${segment.marketingFlightNumber}`,
            // 運航キャリア関係諸項目
            isNhGroupOperated: !!segment.isNhGroupOperated,
            isStarAllianceOperated: !!segment.isStarAllianceOperated,
            operatingAirlineName:
              getAirLineNameFromCache(segment.operatingAirlineCode ?? '', airlineCache) || segment.operatingAirlineName,
            // キャビンクラス
            cabin: this._getCabinName(segment, cabinNames),
            // 乗継時間
            connectionTime: segment.connectionTime
              ? this._dateFormatPipe.transform(formatSeconds(segment.connectionTime) ?? '', 'default_flightTotalTime')
              : undefined,
            fareRule: {
              // FF名称
              fareName: ffCache['m_ff_priority_code_i18n_' + segment.fareInfos?.priorityCode] ?? '',
              // Fare Basis
              fareClass: segment.fareInfos?.fareClass ?? '',
              // プロモーションコード
              promotionCode:
                (plan.prices?.totalPrices?.discount?.cat25DiscountName ||
                  plan.prices?.totalPrices?.discount?.aamDiscountCode) ??
                ' ', // プロモなしの場合、半角スペースを設定する
            },
          })) ?? [];

        const boundId: string = bound.airBoundId ?? '';
        const boundInfo = {
          // 出発日(バウンド)
          originDepartureDateTime: this._dateFormatPipe.transform(
            bound.originDepartureDateTime ?? '',
            'default_itineraryRsDate'
          ),
          // 総所要時間
          duration: this._dateFormatPipe.transform(formatSeconds(bound.duration) ?? '', 'default_flightTotalTime'),
          // セグメント情報
          flight: flightList,
        };

        return [boundId, boundInfo];
      }) ?? [];

    return Object.fromEntries(boundEntries);
  }

  /**
   * 見積(PDF)取得APIリクエスト用支払サマリ情報取得処理
   * @returns
   */
  getReqPriceSummary(plan: PostGetCartResponseDataPlan): PlansGetEstimationRequestPriceSummary {
    // 搭乗者情報毎の人数を結合した文字列を作成
    const travelersDivider = this._staticMsgPipe.transform('label.separaterComma');
    const travelersSummaryStr = Object.entries(plan?.travelersSummary?.numberOfTraveler ?? {})
      .filter(([key, value]) => Object.keys(travelerNumStaticMsgs).includes(key) && value > 0)
      .map(([key, value]) => this._staticMsgPipe.transform(travelerNumStaticMsgs[key], { 0: value }))
      .join(travelersDivider);

    const totalPrices = this._currentCartStoreService.CurrentCartData.data?.plan?.prices?.totalPrices;
    const total = this.applyCurrencyFormat(totalPrices?.total?.value).replace(new RegExp('\u202f', 'g'), ' ');
    const flight = this.applyCurrencyFormat(totalPrices?.ticketPrices?.base?.value).replace(
      new RegExp('\u202f', 'g'),
      ' '
    );

    // 先に必須項目のみのObjを作成
    const priceSummary: PlansGetEstimationRequestPriceSummary = {
      totalPrices: {
        total: total,
        flight: flight,
      },
      travelersSummary: travelersSummaryStr,
    };

    // 条件次第で表示する項目を追加
    const isCA = this._common.aswContextStoreService.aswContextData.posCountryCode === 'CA';
    if (isCA) {
      // POSがカナダの場合
      // サーチャージ料総額
      const surcharge = totalPrices?.ticketPrices?.totalFlightSurcharges;
      if (surcharge) {
        priceSummary.totalPrices.surcharge = this.applyCurrencyFormat(surcharge);
      }
      // 燃油特別付加運賃等
      const airTransportationCharges = totalPrices?.ticketPrices?.airTransportationCharges?.value;
      if (airTransportationCharges) {
        priceSummary.totalPrices.airTransportationCharges = this.applyCurrencyFormat(airTransportationCharges);
      }
      // 各国諸税・空港使用料等 (金額0でも表示)
      const thirdPartyCharges = totalPrices?.ticketPrices?.thirdPartyCharges?.value;
      priceSummary.totalPrices.thirdPartyCharges = this.applyCurrencyFormat(thirdPartyCharges);
    } else {
      // カナダ以外の場合
      // 税金総額 (金額0でも表示)
      const totalTaxes = totalPrices?.ticketPrices?.totalTaxes?.value;
      priceSummary.totalPrices.taxesFeesChargesAirlineCharges = this.applyCurrencyFormat(totalTaxes).replace(
        new RegExp('\u202f', 'g'),
        ' '
      );
      // 発券手数料 (金額0固定表示)
      priceSummary.totalPrices.totalFee = this.applyCurrencyFormat(0).replace(new RegExp('\u202f', 'g'), ' ');
    }

    // サービス金額・税額
    if (totalPrices?.servicePrices?.total?.value) {
      const servicePrices: PlansGetEstimationRequestPriceSummaryTotalPricesServicePrices = {
        total: this.applyCurrencyFormat(totalPrices?.servicePrices?.total?.value).replace(
          new RegExp('\u202f', 'g'),
          ' '
        ),
        totalTaxes: this.applyCurrencyFormat(totalPrices?.servicePrices?.totalTaxes?.value).replace(
          new RegExp('\u202f', 'g'),
          ' '
        ),
      };
      priceSummary.totalPrices.servicePrices = servicePrices;
    }

    return priceSummary;
  }

  /**
   * 見積(PDF)取得APIリクエスト用支払詳細情報取得処理
   * @returns
   */
  getReqPrice(
    plan: PostGetCartResponseDataPlan,
    taxCurrentLang: Array<TaxAllLangItem>
  ): PlansGetEstimationRequestPrice {
    const priceEntries =
      plan.travelers?.map((traveler, index) => {
        const unitPrice =
          this._currentCartStoreService.CurrentCartData.data?.plan?.prices?.unitPrices?.[traveler.id ?? ''];
        // 先に必須項目のみのObjを作成
        const priceItem: PlansGetEstimationRequestPricePassenger = {
          passengerName: this.getTravelerName(traveler, index),
          passengerType: this._staticMsgPipe.transform(travelerTypeStaticMsgs[traveler.passengerTypeCode ?? ''] ?? ''),
          fare: {
            flight: this.applyCurrencyFormat(unitPrice?.ticketPrices?.base).replace(new RegExp('\u202f', 'g'), ' '),
          },
          paidServiceCharges: {},
        };

        // Ancillaryサービス
        const paidServiceCharges: PlansGetEstimationRequestPricePassengerPaidServiceCharges = {};
        const fBagValue = unitPrice?.servicePrices?.firstBaggage?.value;
        const loungeValue = unitPrice?.servicePrices?.lounge?.value;
        const mealValue = unitPrice?.servicePrices?.meal?.value;
        if (fBagValue && priceItem.paidServiceCharges) {
          paidServiceCharges.firstBaggage = this.applyCurrencyFormat(fBagValue).replace(new RegExp('\u202f', 'g'), ' ');
        }
        if (loungeValue && priceItem.paidServiceCharges) {
          paidServiceCharges.lounge = this.applyCurrencyFormat(loungeValue).replace(new RegExp('\u202f', 'g'), ' ');
        }
        if (mealValue && priceItem.paidServiceCharges) {
          paidServiceCharges.meal = this.applyCurrencyFormat(mealValue).replace(new RegExp('\u202f', 'g'), ' ');
        }
        if (Object.keys(paidServiceCharges).length) {
          priceItem.paidServiceCharges = paidServiceCharges;
        }

        // POSカナダ判定
        const isCA = this._common.aswContextStoreService.aswContextData.posCountryCode === 'CA';
        // POSマレーシア判定
        const isMY = this._common.aswContextStoreService.aswContextData.posCountryCode === 'MY';

        // 運賃・税金の総額情報
        const taxesFeesChargesAirlineCharges: PlansGetEstimationRequestPricePassengerTaxesFeesChargesAirlineCharges =
          {};
        const taxes =
          unitPrice?.ticketPrices?.taxes?.map((tax) => {
            const name = isStringEmpty(tax.code)
              ? this._staticMsgPipe.transform('label.othersTax')
              : this.getTaxNameByTaxCode(taxCurrentLang, tax.code);
            const value = this.applyCurrencyFormat(tax.value).replace(new RegExp('\u202f', 'g'), ' ');
            return {
              name: name,
              value: value,
            };
          }) ?? [];

        taxesFeesChargesAirlineCharges.taxes = taxes;
        if (!isCA) {
          // 燃油特別付加運賃
          const fuelSurcharge = unitPrice?.ticketPrices?.fuelSurcharge?.value;
          if (fuelSurcharge) {
            taxesFeesChargesAirlineCharges.fuelSurcharge = this.applyCurrencyFormat(fuelSurcharge).replace(
              new RegExp('\u202f', 'g'),
              ' '
            );
          }
          // 航空保険料 (POSマレーシアの場合非表示)
          const insuranceSurcharge = unitPrice?.ticketPrices?.insuranceSurcharge?.value;
          if (insuranceSurcharge && !isMY) {
            taxesFeesChargesAirlineCharges.insuranceSurcharge = this.applyCurrencyFormat(insuranceSurcharge).replace(
              new RegExp('\u202f', 'g'),
              ' '
            );
          }
          // 発券手数料 (金額0固定表示)
          taxesFeesChargesAirlineCharges.totalFee = this.applyCurrencyFormat(0).replace(new RegExp('\u202f', 'g'), ' ');
        }
        priceItem.taxesFeesChargesAirlineCharges = taxesFeesChargesAirlineCharges;

        // POSカナダの場合
        if (isCA) {
          // フライトサーチャージ
          const flightSurcharge = unitPrice?.ticketPrices?.flightSurcharge?.value;
          if (flightSurcharge) {
            priceItem.fare.surcharge = this.applyCurrencyFormat(flightSurcharge);
          }
          // 燃油特別付加運賃
          const fuelSurcharge = unitPrice?.ticketPrices?.fuelSurcharge?.value;
          if (fuelSurcharge) {
            priceItem.fare.fuelSurcharge = this.applyCurrencyFormat(fuelSurcharge);
          }
          // 航空保険料
          const insuranceSurcharge = unitPrice?.ticketPrices?.insuranceSurcharge?.value;
          if (insuranceSurcharge) {
            priceItem.fare.insuranceSurcharge = this.applyCurrencyFormat(insuranceSurcharge);
          }
        }

        return [traveler.id ?? '', priceItem];
      }) ?? [];

    return Object.fromEntries(priceEntries);
  }

  getTaxNameByTaxCode(taxCurrentLang: Array<TaxAllLangItem>, taxCode?: string): string {
    const taxName = taxCurrentLang.find((data) => data.tax_code === taxCode)?.tax_name ?? '';
    if (!taxName) {
      this._loggerSvc.operationConfirmLog('MST0003', { 0: 'Tax_All_Lang', 1: taxCode ?? '' });
    }
    return taxName;
  }

  /**
   * 金額フォーマット適用処理
   * @returns フォーマット後文字列(HTMLタグ除去済み)
   */
  applyCurrencyFormat(value?: number): string {
    const currencyCode =
      this._currentCartStoreService.CurrentCartData.data?.plan?.prices?.totalPrices?.total?.currencyCode ?? '';
    return deleteHtmlTags(this._amountFormatPipe.transform(value ?? 0, undefined, currencyCode));
  }

  /**
   * 搭乗者氏名取得処理
   * @param traveler
   * @param index
   * @returns
   */
  getTravelerName(traveler: Traveler, index: number): string {
    return getPaxName(traveler) ?? this._staticMsgPipe.transform('label.passenger.n', { '0': index + 1 });
  }

  /**
   * セグ発着日付差文言取得処理
   * @param days
   * @returns 「前日」「翌日」「翌々日」undefined
   */
  getArrivalDaysDiffStr(days: number): string | undefined {
    switch (days) {
      case -1:
        return this._staticMsgPipe.transform('label.dayMinusOne');
      case 1:
        return this._staticMsgPipe.transform('label.dayPlusOne');
      case 2:
        return this._staticMsgPipe.transform('label.dayPlusTwo');
      default:
        return;
    }
  }

  /**
   * キャビンクラス名称取得処理
   * @param segment セグメント情報
   * @param cabinNames 汎用マスタのキャビンクラス名称情報
   * @returns
   */
  private _getCabinName(segment: BoundFlightsInner, cabinNames: Array<MListData>): string {
    let res =
      cabinNames.find(
        (nameData) => nameData.value === getCabinClassNameKey(segment.cabin ?? '', segment.isJapanDomesticFlight)
      )?.display_content ?? '';

    // NHグループ販売便の場合、ブッキングクラスを併記
    if (segment.isNhGroupMarketing && !isStringEmpty(segment.bookingClass)) {
      const colon = this._staticMsgPipe.transform('label.colon');
      res = res + colon + segment.bookingClass;
    }
    return res;
  }

  destroy(): void {}
}
