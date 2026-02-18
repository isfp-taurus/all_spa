import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { CurrentCartStoreService, GetCartStoreService, PlanReviewStoreService } from '@common/services';
import { SupportClass } from '@lib/components/support-class';
import { DynamicParams, ErrorType, TealiumDataKey, TealiumMode } from '@lib/interfaces';
import { StaticMsgPipe } from '@lib/pipes';
import { AswMasterService, CommonLibService, ModalService, PageInitService, TealiumService } from '@lib/services';
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { planReviewAmcloginModalPayloadParts } from './plan-review-cont.component.state';
import {
  DisplayInfoJSON as AswPageOutputSearchCriteria,
  OnewayOrMulticityBound,
  RoundTripInfo,
} from '@app/roundtrip-flight-availability-international/presenter/roundtrip-flight-availability-international-pres.state';
import { AmcLoginPayload } from '@lib/components/shared-ui-components/amc-login/amc-login.state';
import { agreementPayloadParts } from '@app/id-modal/agreement/agreement-payload.state';
import { ANA_BIZ_OFFICE_CODE } from '@common/interfaces';
import { CreateCartResponseDataSearchCriteria, PostGetCartResponseData } from 'src/sdk-reservation';
import { getDisplayCart } from '@common/helper';
import { convertStringToDate } from '@lib/helpers';
import { ErrorCodeConstants } from '@conf/app.constants';

/**
 * プラン確認画面 Contコンポーネント用サービス
 */
@Injectable({
  providedIn: 'root',
})
export class PlanReviewContService extends SupportClass {
  constructor(
    private _common: CommonLibService,
    private _title: Title,
    private _planReviewStoreService: PlanReviewStoreService,
    private _pageInitService: PageInitService,
    private _staticMsgPipe: StaticMsgPipe,
    private _modalService: ModalService,
    private _tealiumService: TealiumService,
    private _masterService: AswMasterService,
    private _cartStoreService: CurrentCartStoreService,
    private _getCartService: GetCartStoreService
  ) {
    super();
  }

  /**
   * タブバーに表示する画面タイトルを設定する処理
   */
  setTitle(): void {
    this.forkJoinService(
      'PlanReviewContComponent Title',
      [this._staticMsgPipe.get('label.planBooking.title'), this._staticMsgPipe.get('label.aswPageTitle')],
      ([str1, str2]) => {
        this.deleteSubscription('PlanReviewContComponent Title');
        this._title.setTitle(str1 + str2);
      }
    );
  }

  /**
   * Deeplink表示過程にてログインモーダルを表示する処理
   * @param submitEvent ログイン成功時処理
   */
  askForLogin(submitEvent: () => void) {
    const skipEvent = () => {
      this._common.errorsHandlerService.setNotRetryableError({
        errorType: ErrorType.BUSINESS_LOGIC,
        errorMsgId: 'E0369',
      });
    };
    const payload: AmcLoginPayload = {
      submitEvent: submitEvent,
      skipEvent: skipEvent,
      closeEvent: skipEvent,
    };
    const parts = {
      ...planReviewAmcloginModalPayloadParts(),
      payload: payload,
    };
    this._modalService.showSubPageModal(parts);
  }

  /**
   * 仮ログインの時ログインモーダルを表示する処理
   * @param submitEvent ログイン成功時処理
   */
  askForLoginTemp(submitEvent: () => void) {
    const skipEvent = () => {
      this._common.errorsHandlerService.setNotRetryableError({
        errorType: ErrorType.BUSINESS_LOGIC,
        errorMsgId: 'E1833',
      });
    };
    const payload: AmcLoginPayload = {
      submitEvent: submitEvent,
      skipEvent: skipEvent,
      closeEvent: skipEvent,
    };
    const parts = {
      ...planReviewAmcloginModalPayloadParts(),
      payload: payload,
    };
    this._modalService.showSubPageModal(parts);
  }

  /**
   * Bizオフィスにまつわるカートと操作オフィスの整合性チェック
   * @param currentOfficeCode 操作オフィスのpointOfSaleId
   * @param currentCart 操作中カート情報
   * @param errorEvent エラー時処理
   */
  checkBizCoherence(
    currentOfficeCode: string,
    currentCart: PostGetCartResponseData,
    errorEvent: (errorId: string) => void
  ): void {
    const displayCart = getDisplayCart(currentCart);
    // カートに含まれるfareBasisのリスト
    const cartFareBasisList = displayCart?.airOffer?.bounds
      ?.flatMap((bound) => bound.flights ?? [])
      .map((seg) => seg.fareInfos?.fareClass ?? '');

    if (currentOfficeCode === ANA_BIZ_OFFICE_CODE) {
      // 操作オフィスがBizオフィスの場合

      // Biz不可運賃fareBasis7桁目リスト
      const bizProhibitedFare7thList = this._masterService
        .getMPropertyByKey('fareMile', 'fareBasis.anaBiz.unapplied')
        .split('|');
      // Biz不可運賃か否か
      const isBizProhibitedFare = cartFareBasisList?.some((fareBasis) =>
        bizProhibitedFare7thList.includes(fareBasis.at(6) ?? '')
      );
      // 国際旅程か否か
      const isInternational = displayCart?.airOffer?.tripType === 'international';

      if (isBizProhibitedFare || isInternational) {
        // Biz不可運賃または国際旅程の場合、エラー
        errorEvent('E0940'); // 当該カートはBizオフィスでは表示できない旨
      }
    } else {
      // 操作オフィスがBizオフィス以外の場合

      // Biz専用運賃fareBasis7桁目リスト
      const bizExclusiveFareFrom7th = this._masterService
        .getMPropertyByKey('fareMile', 'fareBasis.anaBiz.applied')
        .split('|');

      // Biz専用運賃が取得できた場合
      if (bizExclusiveFareFrom7th && bizExclusiveFareFrom7th.filter((value) => value.length > 0).length > 0) {
        // Biz専用運賃か否か
        const isBizExclusiveFare = cartFareBasisList?.some((fareBasis) =>
          bizExclusiveFareFrom7th.includes(fareBasis.at(6) ?? '')
        );
        if (isBizExclusiveFare) {
          // Biz専用運賃の場合、エラー
          errorEvent('E0941'); // 当該カートはBizオフィスでしか表示できない旨
        }
      }
    }
  }

  /**
   * 規約モーダル表示処理
   * @param previousPage キャンセル時戻り先ページ
   * @param isDisplayAPF APF説明表示要否
   * @param thirdLanguageCode 第3言語コード
   * @param closeEvent モーダル閉じ後処理
   */
  showAgreementModal(
    previousPage: string,
    isDisplayAPF: boolean,
    thirdLanguageCode?: string,
    closeEvent?: (isOfficeChanged?: boolean) => void
  ) {
    const parts = agreementPayloadParts({
      isDisplayTerms: true,
      isDisplayAPF: isDisplayAPF,
      thirdLanguageCode: thirdLanguageCode,
      previousFunctionId: previousPage.slice(0, 3),
      previousPageId: previousPage.slice(3, 7),
    });
    parts.closeEvent = closeEvent;
    this._modalService.showSubPageModal(parts);
  }

  /**
   * アップセル適用状況に、初期表示時airOfferIdを設定する処理
   * @param primaryAirOfferId
   */
  setPrimaryAirOfferId(primaryAirOfferId: string): void {
    const upsellStatus = this._planReviewStoreService.PlanReviewData.upsellStatus;
    this._planReviewStoreService.updatePlanReview({
      upsellStatus: { ...upsellStatus, primaryAirOfferId: primaryAirOfferId },
    });
  }

  /**
   * カート取得APIエラーハンドリング処理
   * @param apiErr
   */
  handleGetCartError(apiErr: string) {
    if (apiErr === ErrorCodeConstants.ERROR_CODES.EBAZ000278) {
      this._common.errorsHandlerService.setNotRetryableError({
        errorType: ErrorType.BUSINESS_LOGIC,
        errorMsgId: 'E0333',
        apiErrorCode: apiErr,
      });
    } else {
      this._common.errorsHandlerService.setNotRetryableError({
        errorType: ErrorType.SYSTEM,
        apiErrorCode: apiErr,
      });
    }
  }

  /**
   * 初期表示完了を待ってendInitする処理
   * @param dynamicParams$ 動的文言判定用情報
   */
  endInitWhenAllReadyToShow(dynamicParams$?: Observable<DynamicParams>): void {
    this.subscribeService(
      'PlanReviewContComponent isAllReadyToShow',
      this._planReviewStoreService.getPlanReview$().pipe(first((data) => data.isAllReadyToShow)),
      () => {
        this.deleteSubscription('PlanReviewContComponent isAllReadyToShow');
        this._pageInitService.endInit(dynamicParams$);
      }
    );
  }

  /**
   * Tealium連携用画面情報JSON設定(上書きしない版)
   * @param data 画面情報JSON
   */
  public addTealiumPageOutput(data: Record<string, any>): void {
    this._tealiumService.setTealiumGlobalVariable(
      {
        key: TealiumDataKey.PAGE_OUTPUT,
        value: data,
      },
      TealiumMode.ADD
    );
  }

  /**
   * 前画面に基づきAsw.Pageoutput.searchCriteriaを作成
   * @returns
   */
  public getAswSearchCriteria(): AswPageOutputSearchCriteria | undefined {
    let currentCartData: PostGetCartResponseData | undefined;
    if (this._cartStoreService.CurrentCartData.data?.cartId) {
      currentCartData = this._cartStoreService.CurrentCartData.data;
    } else {
      currentCartData = this._getCartService.GetCartData.data;
    }
    const searchCriteria = currentCartData?.searchCriteria;
    const tripType = this._getTripType(searchCriteria);
    const fare = searchCriteria?.searchAirOffer?.fare;
    if (tripType || fare || searchCriteria) {
      if (tripType === 'roundtrip') {
        const roundtrip = this._getRoundtripType(currentCartData!.searchCriteria!);
        return {
          tripType: tripType,
          roundtrip: roundtrip,
          fare: fare,
        };
      } else {
        return {
          tripType: tripType,
          bounds: this._getBounds(tripType, searchCriteria),
          fare: fare,
        };
      }
    } else {
      return undefined;
    }
  }

  private _getTripType(searchCriteria?: CreateCartResponseDataSearchCriteria) {
    const itineraries = searchCriteria?.searchAirOffer?.itineraries;
    if (itineraries) {
      const isRoundtrip =
        itineraries.length === 2 &&
        itineraries[0].originLocationCode === itineraries[1].destinationLocationCode &&
        itineraries[1].originLocationCode === itineraries[0].destinationLocationCode;
      if (isRoundtrip) {
        return 'roundtrip';
      } else if (!isRoundtrip && itineraries.length === 1) {
        return 'oneway';
      } else if (!isRoundtrip && itineraries.length === 2) {
        return 'openJaw';
      } else if (!isRoundtrip && itineraries.length > 2) {
        return 'multicity';
      } else {
        return '';
      }
    } else {
      return '';
    }
  }

  private _getRoundtripType(searchCriteria: CreateCartResponseDataSearchCriteria): RoundTripInfo {
    const itineraries = searchCriteria.searchAirOffer!.itineraries!;
    return {
      /** 往路出発日 */
      departureDate: this._formatDate(itineraries[0].departureDate),
      /** 復路出発日 */
      returnDate: this._formatDate(itineraries[1].departureDate),
      /** 出発空港コード */
      originLocationCode: itineraries[0].destinationLocationCode ?? '',
      /** 到着空港コード */
      destinationLocationCode: itineraries[1].destinationLocationCode ?? '',
      /** 往路出発時間帯開始 */
      departureTimeWindowFrom: itineraries[0].departureTimeWindowFrom
        ? Number(itineraries[0].departureTimeWindowFrom)
        : 0,
      /** 往路出発時間帯終了 */
      departureTimeWindowTo: itineraries[0].departureTimeWindowTo ? Number(itineraries[0].departureTimeWindowTo) : 1439,
      /** 復路出発時間帯開始 */
      returnTimeWindowFrom: itineraries[0].departureTimeWindowFrom ? Number(itineraries[0].departureTimeWindowFrom) : 0,
      /** 復路出発時間帯終了 */
      returnTimeWindowTo: itineraries[0].departureTimeWindowTo ? Number(itineraries[0].departureTimeWindowTo) : 1439,
    };
  }

  private _getBounds(tripType: string, searchCriteria?: CreateCartResponseDataSearchCriteria) {
    const itineraries = searchCriteria?.searchAirOffer?.itineraries;
    let result: Array<OnewayOrMulticityBound> = [];

    if (tripType && itineraries) {
      itineraries.forEach((onewayOrMulticity) => {
        const onewayOrMulticityBound: OnewayOrMulticityBound = {
          /** 出発日 */
          departureDate: this._formatDate(onewayOrMulticity.departureDate),
          /** 出発空港コード */
          originLocationCode: onewayOrMulticity.originLocationCode ?? '',
          /** 到着空港コード */
          destinationLocationCode: onewayOrMulticity.destinationLocationCode ?? '',
          /** 出発時間帯開始 */
          departureTimeWindowFrom: onewayOrMulticity.departureTimeWindowFrom
            ? Number(onewayOrMulticity.departureTimeWindowFrom)
            : 0,
          /** 出発時間帯終了 */
          departureTimeWindowTo: onewayOrMulticity.departureTimeWindowTo
            ? Number(onewayOrMulticity.departureTimeWindowTo)
            : 1439,
        };
        result.push(onewayOrMulticityBound);
      });
      return result;
    }

    return undefined;
  }

  /** yyyy-MM-dd 形式に変換 */
  private _formatDate(date: Date | string | null | undefined): string {
    if (!date) {
      return '';
    }
    if (typeof date === 'string') {
      date = convertStringToDate(date);
    }
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year.toString()}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  }

  destroy(): void {}
}
