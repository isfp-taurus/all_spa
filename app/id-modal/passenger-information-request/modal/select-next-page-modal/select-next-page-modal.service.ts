import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import {
  apiEventAll,
  defaultApiErrorEvent,
  getAgeOfSegmentDate,
  isStringEmpty,
  stringEmptyDefault,
  stringYMDHmsToDate,
  stringYMDToDate,
} from '@common/helper';
import { PassengerType, AirportAllData } from '@common/interfaces';
import {
  CurrentCartStoreService,
  CurrentPlanStoreService,
  GetCartStoreService,
  LocalDateService,
  LocalPlanService,
} from '@common/services';
import { CreateOrderState, CurrentCartState } from '@common/store';
import { SupportClass } from '@lib/components/support-class';
import {
  AlertMessageItem,
  AlertType,
  DialogClickType,
  DialogInfo,
  DialogType,
  ErrorType,
  NotRetryableErrorModel,
  PageType,
} from '@lib/interfaces';
import { StaticMsgPipe } from '@lib/pipes';
import { AswMasterService, CommonLibService, DialogDisplayService, PageLoadingService } from '@lib/services';
import {
  BoundFlightsInner,
  PlansGetPlansResponse,
  PlansGetPlansResponsePlansInner,
  PostGetCartRequest,
  Traveler,
} from 'src/sdk-reservation';
import { SelectNextPageModalApiErrorMap } from './select-next-page-modal.state';
import { Router } from '@angular/router';
import { RoutesCommon } from '@conf/routes.config';
import { ErrorCodeConstants } from '@conf/app.constants';

@Injectable({
  providedIn: 'root',
})
export class SelectNextPageModalService extends SupportClass {
  constructor(
    private _common: CommonLibService,
    private _getCartStoreService: GetCartStoreService,
    private _currentCartStoreService: CurrentCartStoreService,
    private _dialogSvc: DialogDisplayService,
    private _staticMsg: StaticMsgPipe,
    private _localPlanService: LocalPlanService,
    private _master: AswMasterService,
    private _datePipe: DatePipe,
    private _localDateService: LocalDateService,
    private _currentPlanStoreService: CurrentPlanStoreService,
    private _pageLoadingService: PageLoadingService,
    private _router: Router
  ) {
    super();
  }

  destroy(): void {}

  /**
   * キャッシュの取得処理
   * @param next 次のイベント
   */
  getCacheMaster(next: (airportMaster: Array<AirportAllData>) => void) {
    const lang = this._common.aswContextStoreService.aswContextData.lang;
    this.subscribeService(
      'PassengerInformationRequestMastarData',
      this._master.load([{ key: 'Airport_All', fileName: 'Airport_All' }], true),
      ([airportMaster]) => {
        next(airportMaster ?? []);
      }
    );
  }

  /**
   *  カート取得API実行処理
   * @param cartId カートID
   * @param isMask マスク可否
   * @param next 次の処理
   */
  public getCartApiCall(cartId: string, isMask: boolean, next: () => void) {
    //カート取得APIを呼び出すためのデータ作成
    const getCartRequestParam: PostGetCartRequest = {
      cartId: cartId,
      refresh: false,
      mask: isMask,
    };
    //カート取得APIを実行
    apiEventAll(
      () => {
        this._getCartStoreService.setGetCartFromApi(getCartRequestParam);
      },
      this._getCartStoreService.getGetCart$(),
      (res) => {
        // 取得したカート情報を、操作中カート情報に置き換える。
        this._currentCartStoreService.setCurrentCart(res);
        this.deleteSubscription('SelectNextPageModalComponent getCart');
        next();
      },
      (error) => {
        this._pageLoadingService.endLoading();
        const errorInfo: NotRetryableErrorModel = {
          errorType: ErrorType.BUSINESS_LOGIC,
          errorMsgId: 'E0333',
          apiErrorCode: this._common.apiError?.errors?.[0].code,
          isPopupPage: false,
        };
        this._common.errorsHandlerService.setNotRetryableError(errorInfo);
      }
    );
  }

  /**
   * 「事前予約指定に進む」「支払に進む」ボタン押下時イベント
   * @param next 次の処理
   * @param closeEven 閉じる処理
   */
  public nextPageExe(next: (res: CurrentCartState) => void, closeEvent: () => void) {
    // カート作成オフィスのオフィスコードを取得
    const cartOfficeCode = this._currentPlanStoreService.CurrentPlanData.creationPointOfSaleId;

    // 操作オフィスのオフィスコードを取得
    const currentOfficeCode = this._common.aswContextStoreService.aswContextData.pointOfSaleId;
    // 操作オフィスとカート作成オフィスが異なる場合にエラーへ遷移させる
    if (cartOfficeCode && currentOfficeCode && cartOfficeCode.substring(0, 7) !== currentOfficeCode.substring(0, 7)) {
      //ブラウザバックエラー
      this._router.navigate([RoutesCommon.BROWSER_BACK_ERROR]);
      return;
    }

    // 各搭乗日時点で21歳未満の搭乗者の場合の判定
    let response = this._currentCartStoreService.CurrentCartData;
    const originDepartureDateTimeStr = response.data?.plan?.airOffer?.bounds?.[0]?.originDepartureDateTime;
    const originDepartureDateTime = originDepartureDateTimeStr
      ? new Date(originDepartureDateTimeStr.split('T')[0])
      : new Date();
    if (
      !response.data?.plan?.travelersSummary?.hasAccompaniedInAnotherReservation &&
      this.checkFlightInf(originDepartureDateTime, response.data?.plan?.travelers ?? [])
    ) {
      //12歳以上の同伴者のいない4歳以下の予約は行えない
      this._common.errorsHandlerService.setRetryableError('page', {
        errorMsgId: 'E0850',
      });
      closeEvent();
      return;
    }

    // NHグループ外運航セグメントの抽出
    let notNhGroupSegmentList = response.data?.plan?.airOffer?.bounds?.map((bound) =>
      bound.flights?.find(
        (flight: BoundFlightsInner) => flight.isNhGroupOperated === false && flight.isJapanDomesticFlight === false
      )
    );
    let flightIndex = notNhGroupSegmentList?.findIndex((data) => data !== undefined) ?? -1;

    // NHグループ外運航セグメントが取得できた場合
    if (notNhGroupSegmentList && flightIndex >= 0) {
      let segmentDate = stringYMDHmsToDate(notNhGroupSegmentList[flightIndex]?.departure?.dateTime ?? '') ?? new Date();
      //21歳以上の搭乗者の存在識別子
      const over21Traveler = this.checkOver21Traveler(segmentDate, response.data?.plan?.travelers ?? []);

      //ダイアログ情報："MSG1045"(運航会社へ確認する必要がある旨)
      const MSG1045: DialogInfo = {
        type: DialogType.CHOICE, //ダイアログタイプ
        message: 'm_dynamic_message-MSG1045', //ダイアログのメッセージID
      };

      // 21歳以上の搭乗者が存在しない場合、確認ダイアログを表示する
      if (!over21Traveler) {
        this.subscribeService(
          'SelectNextPageModalComponent goToPayment',
          this._dialogSvc.openDialog(MSG1045).buttonClick$,
          (result) => {
            this.deleteSubscription('SelectNextPageModalComponent goToPayment');
            if (result.clickType === DialogClickType.CONFIRM) {
              // OK時の処理
              next(response);
            }
          }
        );
      } else {
        // NHグループ外運航セグメントは存在したが、搭乗者全員が21歳以上の場合
        next(response);
      }
    } else {
      // NHグループ外運航セグメントが存在しなかった場合
      next(response);
    }
  }

  /**
   * 出発時点で12歳以上の搭乗者が総菜せず4歳以下の搭乗者が存在するか
   * @param date 出発日
   * @param travelers 搭乗者リスト
   * @return 判定値
   */
  checkFlightInf(date: Date, travelers: Array<Traveler>): boolean {
    // 搭乗者数分繰り返し
    const is12HighAge = travelers.some((traveler) => {
      const dateOfBirth = new Date(traveler.dateOfBirth ?? '');
      return 12 <= getAgeOfSegmentDate(dateOfBirth, date);
    });
    const is4LowAge = travelers.some((traveler) => {
      const dateOfBirth = new Date(traveler.dateOfBirth ?? '');
      return getAgeOfSegmentDate(dateOfBirth, date) <= 4;
    });
    return !is12HighAge && is4LowAge;
  }

  /**
   * ジュニアパイロット申込判定
   * @param response 操作中カート情報
   * @param next 次の処理
   * @param closeEvent 閉じる処理
   */
  public isJuniorPilot(response: CurrentCartState, next: () => void, closeEvent: () => void) {
    if (
      response.data?.plan?.travelers?.every((traveler) => traveler.passengerTypeCode === PassengerType.CHD) &&
      !response.data.plan.travelersSummary?.hasAccompaniedInAnotherReservation
    ) {
      //ダイアログ情報：ジュニアパイロット申込が必要な旨
      const MSG1487: DialogInfo = {
        type: DialogType.CHOICE, //ダイアログタイプ
        message: 'm_dynamic_message-MSG1487', //ダイアログのメッセージID
      };
      this.subscribeService(
        'SelectNextPageModalComponent-dynamicMSG1487',
        this._dialogSvc.openDialog(MSG1487).buttonClick$,
        (result) => {
          this.deleteSubscription('SelectNextPageModalComponent-dynamicMSG1487');
          if (result.clickType === DialogClickType.CONFIRM) {
            next();
          } else {
            closeEvent();
          }
        }
      );
    } else {
      next();
    }
  }

  /**
   * 障がい介護者判定
   * @param response 操作中カート情報
   * @param next 次の処理
   * @param closeEvent 閉じる処理
   */
  public checkDisability(response: CurrentCartState, next: () => void, closeEvent: () => void) {
    if (
      response.data?.plan?.travelers?.some((traveler) => {
        return (
          2 <=
          (response.data?.plan?.travelers?.filter(
            (trav) => trav.disabilityDiscountInfomation?.careReceiverTravelerId === (traveler.id ?? '')
          )?.length ?? 0)
        );
      })
    ) {
      //障害割旅客種別について、同一の被介護者が2名以上の搭乗者に対して選択されている
      this._common.errorsHandlerService.setRetryableError('page', {
        errorMsgId: 'E0851',
      });
      closeEvent();
      return;
    }
    next();
  }

  /**
   * メキシコ発着判定
   * @param response 操作中カート情報
   * @param airportMaster 空港マスタデータ
   * @param next 次の処理
   */
  public isMexicoFlightContain(response: CurrentCartState, airportMaster: Array<AirportAllData>, next: () => void) {
    const mexicoCode = 'MX';
    //マスタを参照し、メキシコ発着セグメントがあるか調べ、最初に当たったものを取り出す
    const mexicoFlight = response.data?.plan?.airOffer?.bounds
      ?.find((bound) => bound.flights?.some((flight) => this.checkMexicoSegment(flight, airportMaster)))
      ?.flights?.find((flight) => this.checkMexicoSegment(flight, airportMaster));
    if (mexicoFlight) {
      // メキシコ発着セグメントが取得できた場合
      const isDeparture =
        airportMaster.find((airport) => airport.airport_code === mexicoFlight.departure?.locationCode)
          ?.country_2letter_code === mexicoCode;
      this.mexicoFlightEvent(mexicoFlight, isDeparture, response.data?.plan?.travelers ?? [], next);
    } else {
      // メキシコ発着セグメントが存在しなかった場合
      next();
    }
  }

  /**
   * メキシコセグメントの判定
   * @param flight セグメント情報
   * @param airportMaster 空港マスタ
   * @returns 判定結果
   */
  private checkMexicoSegment(flight: BoundFlightsInner, airportMaster: Array<AirportAllData>): boolean {
    const mexicoCode = 'MX';
    const departure = airportMaster.find((airport) => airport.airport_code === flight.departure?.locationCode);
    const arrival = airportMaster.find((airport) => airport.airport_code === flight.arrival?.locationCode);
    return departure?.country_2letter_code === mexicoCode || arrival?.country_2letter_code === mexicoCode;
  }

  /**
   * メキシコセグメント時処理 同意書への記入が必要であるか否かの判定(メキシコ発着かつ当該便の発着日時点で年齢が18歳未満の搭乗者が存在する)
   * @param mexicoFlight メキシコを含むフライト情報
   * @param isDeparture 出発日メキシコフラグ
   * @param travelers 搭乗者情報
   * @param next 次の処理
   */
  mexicoFlightEvent(
    mexicoFlight: BoundFlightsInner,
    isDeparture: boolean,
    travelers: Array<Traveler>,
    next: () => void
  ) {
    //ダイアログ情報："MSG1044"(同意書への記入が必要である旨)
    const MSG1044: DialogInfo = {
      type: DialogType.CHOICE, //ダイアログタイプ
      message: 'm_dynamic_message-MSG1044', //ダイアログのメッセージID
    };
    // 当該便の発着日時を保持する　メキシコが出発地なら出発地、到着地なら到着日時
    let date: Date | undefined = isDeparture
      ? stringYMDHmsToDate(mexicoFlight.departure?.dateTime ?? '')
      : stringYMDHmsToDate(mexicoFlight.arrival?.dateTime ?? '');

    // 同意書記入要否フラグ
    const consentFormRequired = this.checkConsentFormRequired(date ?? new Date(), travelers);

    // メキシコ発着セグメントが存在する、かつ18歳未満の搭乗者が存在する場合、確認ダイアログを出す
    if (consentFormRequired) {
      this.subscribeService(
        'SelectNextPageModalComponent goToPayment',
        this._dialogSvc.openDialog(MSG1044).buttonClick$,
        (result) => {
          this.deleteSubscription('SelectNextPageModalComponent goToPayment');
          if (result.clickType === DialogClickType.CONFIRM) {
            // OK時の処理
            next();
          }
        }
      );
    } else {
      // メキシコ発着セグメントは存在したが、18歳未満の搭乗者が存在しなかった場合
      next();
    }
  }

  /**
   * 出発時点で21歳以上かの判定
   * @param date 出発日
   * @param travelers 搭乗者リスト
   * @return 出発時点で21歳以上か
   */
  checkOver21Traveler(date: Date, travelers: Array<Traveler>): boolean {
    // 搭乗者数分繰り返し
    return travelers.some((traveler) => {
      const dateOfBirth = stringYMDToDate(traveler.dateOfBirth ?? '');
      if (dateOfBirth) {
        return 21 <= getAgeOfSegmentDate(dateOfBirth, date);
      }
      return false;
    });
  }

  /**
   * 同意書記入要否フラグの判定
   * @param date 出発日
   * @param travelers　搭乗者リスト
   * @return 同意書記入要否
   */
  checkConsentFormRequired(date: Date, travelers: Array<Traveler>): boolean {
    // 搭乗者数分繰り返し
    return travelers.some((traveler) => {
      const dateOfBirth = stringYMDToDate(traveler.dateOfBirth ?? '');
      if (dateOfBirth) {
        return getAgeOfSegmentDate(dateOfBirth, date) < 18;
      }
      return false;
    });
  }

  /**
   * ダイアログを出力する
   * @param nameList 姓名リスト
   * @param next 次処理
   */
  dialogCheck(nameList: Array<string>, next: () => void) {
    // 姓名確認
    let messege = '';
    if (nameList) {
      nameList.forEach((nameData: string) => {
        messege = `${messege}${nameData}<br>`;
      });
    }

    //ダイアログ情報："MSG0423"(姓名の入力内容に間違いがないか確認する旨)
    let MSG0423: DialogInfo = {
      type: DialogType.CHOICE, //ダイアログタイプ
      message: 'm_dynamic_message-MSG0423', //ダイアログのメッセージID
      messageParams: {
        //ダイアログメッセージ内の埋め込み用情報（複数指定可能）
        key: '0',
        value: messege,
        dontTranslate: true,
      },
    };
    // 確認ダイアログを出す
    this.subscribeService(
      'SelectNextPageModalComponent_goToPayment',
      this._dialogSvc.openDialog(MSG0423).buttonClick$,
      (result) => {
        this.deleteSubscription('SelectNextPageModalComponent_goToPayment');
        if (result.clickType === DialogClickType.CONFIRM) {
          next();
        }
      }
    );
  }

  /**
   * prebookAPI　失敗時の処理
   * @param label 表示用ラベル　シートマップか支払か
   * @param retryableEvent 継続可能エラー時の処理
   * @param notRetryableEvent 継続不可能エラー時の処理
   */
  createOrderApiError(label: string, retryableEvent: () => void, notRetryableEvent: () => void) {
    defaultApiErrorEvent(
      this._common.apiError?.errors?.[0].code ?? '',
      SelectNextPageModalApiErrorMap,
      (retryable) => {
        this._common.errorsHandlerService.setRetryableError(PageType.PAGE, retryable);

        //置換用遷移先画面文言を翻訳変換しておく
        const destinationPageName = this._staticMsg.transform(label);

        //カート情報の破棄
        this._getCartStoreService.resetGetCart();

        // ワーニング情報：“W0764” (prebookに失敗しシートマップ画面、または支払情報入力画面には遷移出来なかった旨)
        const warningInfo: AlertMessageItem = {
          contentHtml: 'W0764',
          isCloseEnable: true,
          alertType: AlertType.WARNING,
          interpolateParams: { ['0']: destinationPageName },
          errorMessageId: 'W0764',
        };
        //ワーニングセット
        const preWarning = this._common.alertMessageStoreService
          .getAlertWarningMessage()
          .find((warn) => warn.errorMessageId === 'W0764');
        if (preWarning) {
          //同じエラーがある場合前のエラーを削除
          this._common.alertMessageStoreService.removeAlertWarningMessage(preWarning.contentId ?? '');
        }
        this._common.alertMessageStoreService.setAlertWarningMessage(warningInfo);
        retryableEvent();
      },
      (notRetryable) => {
        if (isStringEmpty(notRetryable.errorMsgId)) {
          notRetryable.errorMsgId = 'E0759';
          notRetryable.errorType = ErrorType.BUSINESS_LOGIC;
        }
        // EBAZ000842の場合ブラウザバックエラー
        if (this._common.apiError?.errors?.[0].code === ErrorCodeConstants.ERROR_CODES.EBAZ000842) {
          //ブラウザバックエラー
          this._router.navigate([RoutesCommon.BROWSER_BACK_ERROR]);
          notRetryableEvent();
          return;
        }
        this._common.errorsHandlerService.setNotRetryableError(notRetryable);
        notRetryableEvent();
      }
    );
  }

  /**
   * ユーザ共通情報.ログインステータス=未ログインの場合の処理
   * @param res カート作成APIのレスポンス
   */
  prebookNotLoginEvent(cart: CurrentCartState, res: CreateOrderState) {
    const localPlanList = this._localPlanService.getLocalPlans();
    const updateTargetPlan = localPlanList?.plans?.find(
      (p) => p.cartId === this._currentCartStoreService.CurrentCartData.data?.cartId
    );
    // 操作中プランがローカルプランリストに存在する場合
    if (localPlanList && updateTargetPlan) {
      // prebookAPIレスポンス.data.prebookExpiryDateを更新対象プランに登録
      updateTargetPlan.prebookExpiryDate = res.data?.prebookExpiryDate;
      // 更新対象プラン.isPrebookedにtrueを設定
      updateTargetPlan.isPrebooked = true;
      // ローカルプランリスト内の情報を更新対象プランで上書き
      this._localPlanService.setLocalPlans(localPlanList);
    } else {
      //ローカルプランに存在しない場合新規で追加（保存上限は無視）
      const creationDate = stringYMDHmsToDate(cart.data?.creationDate ?? '') ?? new Date();
      const currentDate = this._localDateService.getCurrentDate();
      const prebookExpiryDate = stringYMDHmsToDate(res.data?.prebookExpiryDate ?? '') ?? new Date();

      const prebookPlan: PlansGetPlansResponsePlansInner = {
        cartId: cart.data?.cartId ?? '',
        planName: '',
        creationDate: this._datePipe.transform(creationDate, 'yyyy-MM-dd') ?? '',
        planExpiryDate: this._datePipe.transform(prebookExpiryDate, 'yyyy-MM-dd') ?? '',
        planLastModificationDate: this._datePipe.transform(currentDate, 'yyyy-MM-ddTHH:mm:ss') ?? '',
        prebookExpiryDate: res.data?.prebookExpiryDate,
        isUnsaved: true,
        isPrebooked: true,
        creationPointOfSaleId: this._common.aswContextStoreService.aswContextData.pointOfSaleId,
      };
      //プランリストに追加
      const newLocalPlanList: PlansGetPlansResponse = localPlanList ? localPlanList : { warnings: [], plans: [] };
      newLocalPlanList.plans?.push(prebookPlan);
      this._localPlanService.setLocalPlans(newLocalPlanList);
      //現在のプランに設定
      this._currentPlanStoreService.setCurrentPlan(prebookPlan);
    }
  }

  /**
   * 遷移先モーダルで表示するための名前情報を配列で作成
   * @param travelers
   * @param order
   * @returns 名前情報
   */
  getNameList(travelers: Array<Traveler>, order: string): Array<string> {
    return travelers.map((pass) => {
      pass.names?.[0]?.firstName;
      const middleName = isStringEmpty(pass.names?.[0]?.middleName) ? '' : `${pass.names?.[0]?.middleName} `;
      const middleNameLast = isStringEmpty(pass.names?.[0]?.middleName) ? '' : ` ${pass.names?.[0]?.middleName}`;
      switch (order) {
        case '0':
          return `${pass.names?.[0]?.firstName} ${stringEmptyDefault(middleName, '')}${pass.names?.[0]?.lastName}`;
        case '1':
          return `${pass.names?.[0]?.lastName} ${pass.names?.[0]?.firstName}${stringEmptyDefault(middleNameLast, '')}`;
        case '2':
          return `${pass.names?.[0]?.lastName} ${stringEmptyDefault(middleName, '')}${pass.names?.[0]?.firstName}`;
        default:
          return `${pass.names?.[0]?.firstName} ${stringEmptyDefault(middleName, '')}${pass.names?.[0]?.lastName}`;
      }
    });
  }

  /**
   * PNR取得用情報作成
   * @param cart カート情報
   * @param orderId オーダーID
   */
  createPnrParam(cart: CurrentCartState, orderId: string, isFromPlanView: boolean) {
    // PNR取得用情報作成
    const firstTraveler = cart.data?.plan?.travelers?.find(
      (traveler) => traveler.passengerTypeCode !== PassengerType.INF && traveler.passengerTypeCode !== PassengerType.INS
    );
    const middleame = firstTraveler?.names?.[0]?.middleName ? ` ${firstTraveler.names[0].middleName}` : '';
    return {
      orderId: orderId,
      credential: {
        firstName: `${firstTraveler?.names?.[0]?.firstName ?? ''}${middleame}`,
        lastName: firstTraveler?.names?.[0]?.lastName ?? '',
      },
      skipCheckTasks: isFromPlanView, //滞在先情報取得の処理をスキップ
      skipWifiInfo: true, //WIFI取得の処理をスキップ
      skipOperationInfo: true, //発着APIの処理をスキップ
      skipCprInfo: true, //CPR情報取得の処理をスキップ
    };
  }
}
