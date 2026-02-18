import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { SupportPageComponent } from '@lib/components/support-class';
import { DialogClickType, ErrorType, LoginStatusType, LoadingDisplayMode } from '@lib/interfaces';
import { DateFormatPipe } from '@lib/pipes/date-format/date-format.pipe';
import {
  CommonLibService,
  DialogDisplayService,
  ErrorsHandlerService,
  ModalService,
  PageInitService,
  PageLoadingService,
  SystemDateService,
} from '@lib/services';
import {
  PlansDeletePlansRequest,
  PlansGetPlansRequest,
  PlansGetPlansResponse,
  PlansGetPlansResponsePlansInner,
  PostGetCartRequest,
  PostGetCartResponse,
} from 'src/sdk-reservation';
import { PlanListModel } from '@common/store/plan-list';
import {
  CurrentCartStoreService,
  CurrentPlanStoreService,
  DeliveryInformationStoreService,
  GetCartStoreService,
  GetPlansStoreService,
  GetUnavailablePaymentByOfficeCodeService,
  LocalPlanService,
  PlanListService,
  PlanListStoreService,
} from '@common/services';
import { apiEventAll } from '@common/helper';
import {
  PlanListQueryParam,
  DeliveryInformationModel,
  PlanListCurrentCart,
  PlanListCurrentPlan,
  PlanListSelect,
} from '@common/interfaces';
import { PlanOperationModalPayloadParts } from '../sub-components/modal/plan-operation-modal/plan-operation-modal-payload.state';
import { StaticMsgPipe } from '@lib/pipes';
import { Title } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';
import { PlanListDynamicParams, defaultPlanListDynamicParams } from './plan-list-cont.state';
import {
  MergeConfirmModalPayload,
  MergeConfirmModalPayloadParts,
} from '../sub-components/modal/merge-confirm-modal/merge-confirm-modal-payload.state';
import { SignalService } from '@lib/components/shared-ui-components/amc-login/signal.service';
import { DatePipe } from '@angular/common';
import { convertStringToDate } from '@lib/helpers';

@Component({
  selector: 'asw-plan-list-cont',
  templateUrl: './plan-list-cont.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DateFormatPipe],
})
export class PlanListContComponent extends SupportPageComponent {
  pageId: string = 'P042';
  functionId: string = 'R01';

  /* 動的文言 */
  private _dynamicSubject = new BehaviorSubject<PlanListDynamicParams>(defaultPlanListDynamicParams());
  /* 現在時刻 */
  sysDate = this._getSystemDate.getSystemDate();
  /* ログイン状態 */
  loginStatus: string = '';

  /* 差分強調有無 */
  isPlanChanged: boolean = false;
  /* プラン取得処理完了フラグ */
  finishGetPlan: boolean = false;
  /* カート取得処理完了フラグ */
  finishGetCart: boolean = false;
  /*　初期化処理自動完了をオフにする */
  override autoInitEnd = false;

  /* 表示対象プランリスト */
  showPlanList: PlansGetPlansResponse = {};
  /* 削除対象プランリスト */
  deletePlanList: Array<PlanListCurrentPlan> = [];
  /* 表示用プランリスト */
  displayPlanList: Array<PlanListCurrentPlan> = [];
  /* 表示用カートリスト */
  displayCartList: Array<PlanListCurrentCart> = [];
  /* プラン選択チェックボックス情報 */
  select: Array<PlanListSelect> = [];
  /* コンポーネントが破棄されたかどうかを示すフラグ */
  isDestroyed = false;

  constructor(
    private _common: CommonLibService,
    private _pageInitService: PageInitService,
    private _changeDetector: ChangeDetectorRef,
    private _activatedRoute: ActivatedRoute,
    private _dialogSvc: DialogDisplayService,
    private _getSystemDate: SystemDateService,
    private _titleService: Title,
    private _modalService: ModalService,
    private _dateFormatPipe: DateFormatPipe,
    private _datePipe: DatePipe,
    private _staticMsg: StaticMsgPipe,
    private _errorsHandlerSvc: ErrorsHandlerService,
    private _getPlansStoreService: GetPlansStoreService,
    private _getCartStoreService: GetCartStoreService,
    private _localPlanService: LocalPlanService,
    private _planListStoreService: PlanListStoreService,
    private _currentPlanStoreService: CurrentPlanStoreService,
    private _currentCartStoreService: CurrentCartStoreService,
    private _deliveryInfoStoreService: DeliveryInformationStoreService,
    private _planListService: PlanListService,
    private _signalService: SignalService,
    private _pageLoadingService: PageLoadingService,
    private _getUnavailablePaymentByOfficeCodeService: GetUnavailablePaymentByOfficeCodeService
  ) {
    super(_common, _pageInitService);
    // 当画面の情報を設定
    this._common.aswCommonStoreService.updateAswCommon({ isEnabledLogin: true });
    // タイトルを設定
    this.forkJoinService(
      'PlanListContComponentTitleGet',
      [this._staticMsg.get('label.planList.title'), this._staticMsg.get('label.aswPageTitle')],
      ([str1, str2]) => {
        this._titleService.setTitle(str1 + str2);
      }
    );
    // 仮組：マージ確認モーダルの設定
    const showMergeConfirmModal = () => {
      const parts = MergeConfirmModalPayloadParts();
      const mergeEvent = () => {
        this.loginStatus = this._common.aswContextStoreService.aswContextData.loginStatus;
      };
      const payload: MergeConfirmModalPayload = { mergeEvent: mergeEvent };
      parts.payload = payload;
      if (this.displayPlanList.length > 0) {
        this._modalService.showSubModal(parts);
      } else {
        this._signalService.sendLoginSignal();
      }
    };
    this._common.aswCommonStoreService.updateAswCommon({ beforeLoginEvent: showMergeConfirmModal });
  }

  /* 初期表示処理 */
  init() {
    this.loginStatus = this._common.aswContextStoreService.aswContextData.loginStatus;
    this.subscribeService(
      'PlanListContComponent afterPlanListContInit',
      this._planListStoreService.getPlanList$(),
      (data) => {
        if (data.isChangePlanList) {
          this.displayPlanList = data.planList ?? [];

          this._changeDetector.markForCheck();

          const plaListInfo: PlanListModel = {
            planList: this.displayPlanList,
            isChangePlanList: false,
          };
          this._planListStoreService.setPlanList(plaListInfo);
        }
      }
    );
    this.subscribeService('planList afterLogin', this._common.aswContextStoreService.getAswContext$(), (data) => {
      const preStatus = this.loginStatus;
      this.loginStatus = this._common.aswContextStoreService.aswContextData.loginStatus;
      if (preStatus !== this.loginStatus) {
        if (this.loginStatus === LoginStatusType.REAL_LOGIN) {
          const isPlanMerge = this._planListStoreService.PlanListData.isPlanMerge ?? false;
          if (isPlanMerge) {
            const plaListInfo: PlanListModel = {
              planList: this.displayPlanList,
              isPlanMerge: false,
              isNeedRefresh: true,
            };
            this._planListStoreService.setPlanList(plaListInfo);
            this._planListService.createPlanCall();
          } else {
            this.refresh();
          }
        }
      }
    });
    this.getCash();
  }

  /* キャッシュ取得 */
  getCash() {
    //キャッシュ取得、取得後は画面初期化処理へ
    this._planListService.getCacheMaster((master) => {
      this.deleteSubscription('PlanListComponent getAswMasterByKeyObservable m_airport_i18n');
      //  ユーザ共通.操作オフィスコード=支払不可情報.オフィスとなる、ASWDB(マスタ)の支払不可情報.ユーザーエージェント検索文字列と支払不可情報.ワーニング表示フラグがtrueの支払不可情報.支払方法を取得する。ユーザーエージェントに検索文字列が含まれる場合、”W1862”(利用中のブラウザでは対象の支払方法が使用できないため、推奨ブラウザを使ってほしい旨)のワーニングメッセージを表示する。
      this._getUnavailablePaymentByOfficeCodeService.checkUnavailablePaymentByOfficeCode();
      this.refresh();
    });
  }

  /* 初期表示処理_流入ケース分岐 */
  refresh() {
    // 空の表示対象プランリストを作成
    this.showPlanList.plans = [];

    // クエリパラメータの値を取得
    const queryParams: Params = this._activatedRoute.snapshot.queryParams;

    // 一時会員番号有無による処理分岐
    if (PlanListQueryParam.TEMP in queryParams) {
      // 一時会員番号が存在する場合
      const tempNum: string = queryParams[PlanListQueryParam.TEMP];
      if (tempNum.startsWith('MIG')) {
        // 端末引継ぎ(MIG)の場合
        if (!this._common.isNotLogin()) {
          // 未ログイン以外の場合、共通エラー画面へ
          this._errorsHandlerSvc.setNotRetryableError({
            errorType: ErrorType.BUSINESS_LOGIC,
            errorMsgId: 'E0386',
          });
          return;
        } else {
          // プランリスト取得API実行処理
          this.getPlanListApi((response, tempNum) => {
            this.afterGetPlansFromTemporaryNumber(response, tempNum);
          }, tempNum);
        }
      }
    } else {
      // 一時会員番号が存在しない場合
      this.refresh2();
    }
  }

  /* 初期化処理_ログイン状態分岐 */
  refresh2() {
    switch (this.loginStatus) {
      case LoginStatusType.TEMPORARY_LOGIN:
        // 仮ログインの場合、ログインモーダル表示
        this._pageInitService.endInit();
        this._planListService.amcLoginModal(() => {});
        break;
      case LoginStatusType.REAL_LOGIN:
        // リアルログインの場合、プランリスト取得API実行処理
        this.getPlanListApi(() => {
          this.reset();
        });
        break;
      case LoginStatusType.NOT_LOGIN:
        // 未ログインの場合、ローカルプランリスト取得処理
        this.getLocalPlanList();
        break;
      default:
        break;
    }
  }

  /* 初期化処理_表示データ作成 */
  reset() {
    // 空の表示用プランリストを用意
    this.displayPlanList = [];
    this.isPlanChanged = false;
    this.finishGetPlan = false;
    this.finishGetCart = false;

    let showPlans = this.showPlanList.plans ?? [];
    if (showPlans.length !== 0) {
      // プランリストが1件以上存在する場合

      // creationDateの降順に並び替え
      showPlans = showPlans.sort(
        (a, b) =>
          convertStringToDate(b.creationDate ?? '').getTime() - convertStringToDate(a.creationDate ?? '').getTime()
      );

      // 取得したプランリストをセット
      let setPlanList: Array<PlanListCurrentPlan> = [];
      showPlans.forEach((plan) => {
        let planName = plan.planName ?? '';
        setPlanList.push({
          cartId: plan.cartId ?? '',
          isValid: true,
          isMerged: false,
          planName: planName !== '' ? planName : this._staticMsg.transform('label.planNameUnsavedPrebooked'),
          createOn: this._dateFormatPipe.transform(plan.creationDate ?? '', 'default_apiDate', false) ?? '',
          saveUntil: this._dateFormatPipe.transform(plan.planExpiryDate ?? '', 'default_apiDate', false) ?? '',
          planData: plan,
          finishGetCart: false,
          cartList: this._planListService.setInitialCurrentCart(),
        });
      });

      this.displayPlanList = setPlanList;
      this.finishGetPlan = true;

      // 動的文言
      const dynamicPlanList: PlansGetPlansResponse = { plans: [] };
      this.displayPlanList.forEach((displayPlan) => {
        if (displayPlan.planData) {
          dynamicPlanList.plans?.push(displayPlan.planData);
        }
      });
      this._dynamicSubject.next({
        getPlansReply: dynamicPlanList,
        getCartReply: undefined,
      });
      this._pageInitService.endInit(this._dynamicSubject.asObservable());
      this._changeDetector.markForCheck();

      // カート取得
      this.createPlanListInformationCall(0, () => {
        // カート取得完了
        this.finishGetCart = true;
        // 削除対象ローカルプランを削除
        if (this._common.isNotLogin() && this.deletePlanList.length !== 0) {
          // 未ログインかつ削除対象プランが1件以上ある場合、ローカルプランリスト取得処理
          const localPlanList = this._localPlanService.getLocalPlans();
          if (localPlanList) {
            // ローカルプランリストが存在する場合、ローカルプランリストから削除対象プランを除外
            localPlanList.plans = localPlanList.plans?.filter(
              (local) => !this.deletePlanList.some((deletePlan) => deletePlan.cartId === local.cartId)
            );
            this._localPlanService.setLocalPlans(localPlanList);
          }
          this._changeDetector.markForCheck();
        }

        // 表示用プランリストを保持
        const currentPlanList: PlanListModel = {
          planList: this.displayPlanList,
          isNeedRefresh: true,
        };
        this._planListStoreService.setPlanList(currentPlanList);

        // 動的文言更新
        const dynamicNewPlanList: PlansGetPlansResponse = { ...this._dynamicSubject.getValue().getPlansReply };
        this.deletePlanList.forEach((deletePlan) => {
          const index = dynamicNewPlanList.plans?.findIndex(
            (dynamicNewPlan) => dynamicNewPlan.cartId === deletePlan.cartId
          );
          if (index !== undefined) {
            dynamicNewPlanList.plans?.splice(index, 1);
          }
        });
        const dynamicCartist: PostGetCartResponse[] = [];
        this.displayPlanList.forEach((displayPlan) => {
          if (displayPlan.cartList.cartData) {
            dynamicCartist.push(displayPlan.cartList.cartData);
          }
        });
        this._dynamicSubject.next({
          getPlansReply: dynamicNewPlanList,
          getCartReply: dynamicCartist,
        });
        this._changeDetector.markForCheck();
      });
    } else {
      // プランリスト0件につきローディング終了
      this.finishGetPlan = true;
      this.finishGetCart = true;
      const currentPlanList: PlanListModel = {
        planList: this.displayPlanList,
        isNeedRefresh: true,
      };
      this._planListStoreService.setPlanList(currentPlanList);
      this._pageInitService.endInit(this._dynamicSubject.asObservable());
    }

    //画面の再描写
    this._changeDetector.markForCheck();
  }

  /* 画面終了時処理 */
  destroy(): void {
    // コンポーネントが破棄されたことを示すフラグを設定
    this.isDestroyed = true;
    // カートのストアをリセットする
    this._getCartStoreService.resetGetCart();
  }
  /* 画面更新時処理 */
  reload(): void {}

  /* ローカルプランリスト取得処理 */
  getLocalPlanList() {
    // ローカルプランリスト取得
    let localPlanList = this._localPlanService.getLocalPlans();

    if (localPlanList) {
      // ローカルプランリストが存在する場合

      // プラン有効期限切れプランを除外
      const newLocalPlanList: Array<PlansGetPlansResponsePlansInner> =
        localPlanList.plans
          ?.filter(
            (localPlan) =>
              (localPlan?.planExpiryDate ?? '') >= (this._datePipe.transform(this.sysDate, 'yyyy-MM-dd') ?? '')
          )
          .map((localPlan) => {
            const newlocal: PlansGetPlansResponsePlansInner = {
              cartId: localPlan.cartId,
              planName: localPlan.planName,
              creationDate: localPlan.creationDate,
              planExpiryDate: localPlan.planExpiryDate,
              planLastModificationDate: localPlan?.planLastModificationDate,
              prebookExpiryDate: localPlan.prebookExpiryDate,
              isUnsaved: localPlan.isUnsaved,
              isPrebooked: localPlan.isPrebooked,
              creationPointOfSaleId: localPlan.creationPointOfSaleId,
            };
            return newlocal;
          }) ?? [];
      const newLocalPlans: PlansGetPlansResponse = {
        plans: newLocalPlanList,
      };
      this._localPlanService.setLocalPlans(newLocalPlans);
      localPlanList = this._localPlanService.getLocalPlans();
      this.showPlanList.plans = newLocalPlanList;

      // prebook有効期限切れ、かつ未保存のプランを除外
      const newLocalPlanList2 = localPlanList?.plans
        ?.filter(
          (localPlan) =>
            (localPlan?.prebookExpiryDate ?? '') >=
              (this._datePipe.transform(this.sysDate, 'yyyy-MM-ddTHH:mm:ss') ?? '') || localPlan?.isUnsaved === false
        )
        .map((localPlan) => {
          return {
            cartId: localPlan.cartId,
            planName: localPlan.planName,
            creationDate: localPlan.creationDate,
            planExpiryDate: localPlan.planExpiryDate,
            planLastModificationDate: localPlan.planLastModificationDate,
            prebookExpiryDate: localPlan.prebookExpiryDate,
            isUnsaved: localPlan.isUnsaved,
            isPrebooked: localPlan.isPrebooked,
            creationPointOfSaleId: localPlan.creationPointOfSaleId,
          };
        });

      this.showPlanList.plans = newLocalPlanList2;
    }
    this.reset();
  }

  /* プランリスト取得API実行処理 */
  getPlanListApi(next: (response?: PlansGetPlansResponse, temporaryNumber?: string) => void, tempNum?: string) {
    const temporaryNumber = tempNum ?? '';
    const param: PlansGetPlansRequest = {
      temporaryNumber: temporaryNumber,
    };
    apiEventAll(
      () => {
        this._getPlansStoreService.setGetPlansFromApi(param);
      },
      this._getPlansStoreService.getGetPlans$(),
      (response) => {
        this.deleteSubscription('PlanListService getPlans');
        if (tempNum) {
          next(response, temporaryNumber);
        } else {
          response.plans?.forEach((apiPlan: PlansGetPlansResponsePlansInner) => {
            this.showPlanList.plans?.push(apiPlan);
          });
          next();
        }
      },
      (error) => {
        if (tempNum) {
          // エラーハンドリング
          this.getPlanListApiError();
        } else {
          // APIレスポンスのエラーの有無に関わらず処理続行
          this.reset();
        }
      }
    );
  }

  /* プランリスト取得APIレスポンス処理(一時会員番号有) */
  // ローカルプランリストへAPIレスポンスをマージ
  afterGetPlansFromTemporaryNumber(apiPlanList?: PlansGetPlansResponse, tempNum?: string) {
    // ローカルプランリスト取得処理
    const localPlanList = this._localPlanService.getLocalPlans();

    // ローカルプランリスト登録処理
    if (localPlanList?.plans) {
      // ローカルプランリストが存在する場合

      apiPlanList?.plans?.forEach((apiPlan: PlansGetPlansResponsePlansInner) => {
        const updateLocalPlan = localPlanList.plans?.find((e) => e.cartId === apiPlan?.cartId);

        if (updateLocalPlan) {
          // カートIDの一致するプランが存在する場合

          const localPlanListLastModDate = new Date(updateLocalPlan?.planLastModificationDate ?? '');
          const apiPlanListLastModDate = new Date(apiPlan?.planLastModificationDate ?? '');

          if (localPlanListLastModDate < apiPlanListLastModDate) {
            // APIから返却されたプラン情報の方が新しい場合

            const newLocalPlan: PlansGetPlansResponsePlansInner = {
              cartId: updateLocalPlan.cartId,
              planName: apiPlan.planName,
              creationDate: apiPlan.creationDate,
              planExpiryDate: apiPlan.planExpiryDate,
              planLastModificationDate: apiPlan.planLastModificationDate,
              prebookExpiryDate: updateLocalPlan.prebookExpiryDate,
              isUnsaved: updateLocalPlan.isUnsaved,
              isPrebooked: updateLocalPlan.isPrebooked,
              creationPointOfSaleId: updateLocalPlan.creationPointOfSaleId,
            };
            // 更新対象のプランをnewLocalPlanに置き換える
            const index: number | undefined = localPlanList.plans?.findIndex(
              (e) => e.cartId === updateLocalPlan?.cartId
            );
            if (index !== undefined) {
              localPlanList.plans?.splice(index, 1, newLocalPlan);
            }
          }
        } else {
          localPlanList.plans?.push(apiPlan);
        }
      });
      // ローカルプランリスト更新
      this._localPlanService.setLocalPlans(localPlanList);
    } else {
      // ローカルプランリストが存在しない場合、APIプランを追加する
      if (apiPlanList) {
        this._localPlanService.setLocalPlans(apiPlanList);
      }
    }

    const param: PlansDeletePlansRequest = {
      temporaryNumberForDeletion: tempNum,
    };
    // プラン削除API実行処理
    this._planListService.deletePlans(param, () => this.refresh2());
  }

  /**
   * 逐次処理　カート取得APIをプランリスト分コールする
   * @param index コールするプランのインデックス
   * @param next 終了時処理
   */
  public createPlanListInformationCall(index: number, next: () => void) {
    const requestParameter: PostGetCartRequest = {
      cartId: this.displayPlanList[index].cartId ?? '',
      refresh: false,
    };
    this.getCart(requestParameter, this.displayPlanList[index], index, (result, response) => {
      if (response) {
        // カート取得が成功した場合、表示用カート情報をセット
        const retuenCartData = this._planListService.createCartInformation(this.displayPlanList[index], response);
        if (retuenCartData.isDiff) {
          this.isPlanChanged = true;
        }
        let newPlanList = [...this.displayPlanList];
        newPlanList[index].cartList = retuenCartData;
        newPlanList[index].finishGetCart = true;
        newPlanList[index].isValid = retuenCartData.isValid;
        this.displayPlanList = newPlanList;

        //画面の再描写
        this._changeDetector.markForCheck();
      } else if (!result) {
        // カート取得が失敗した場合、表示用プランリストから削除
        let newPlanList = [...this.displayPlanList];
        const deleteIndex = newPlanList.findIndex((plan) => plan.cartId === requestParameter.cartId);
        newPlanList.splice(deleteIndex, 1);
        this.displayPlanList = newPlanList;
        index = index - 1;

        //画面の再描写
        this._changeDetector.markForCheck();
      }
      if (index + 1 === this.displayPlanList.length) {
        next();
        this.finishGetCart = true;
      } else {
        this.createPlanListInformationCall(index + 1, next);
      }
    });
  }

  /* カート取得API処理 */
  getCart(
    requestParameter: PostGetCartRequest,
    plan: PlanListCurrentPlan,
    index: number,
    next: (result: boolean, response?: PostGetCartResponse) => void
  ) {
    // コンポーネントが破棄されている場合、処理を中止
    if (this.isDestroyed) return;
    // カートのストアをリセットする
    this._getCartStoreService.resetGetCart();
    // カート取得API実行
    apiEventAll(
      () => {
        this._getCartStoreService.setGetCartFromApi(requestParameter);
      },
      this._getCartStoreService.getGetCart$(),
      (response) => {
        this.deleteSubscription('PlanListService getCart');
        next(true, response);
      },
      (error) => {
        if (this._common.isNotLogin()) {
          // 未ログインの場合、 削除対象プランリストへ追加
          this.deletePlanList.push(plan);
        }
        next(false);
      }
    );
  }

  /* プラン削除処理 */
  deletePlan(cartIds: Array<string>) {
    this.subscribeService(
      'PlanListComponent Dialog buttonClickObservable',
      this._dialogSvc.openDialog({ message: 'm_dynamic_message-MSG1039' }).buttonClick$,
      (result) => {
        this.deleteSubscription('PlanListComponent Dialog buttonClickObservable');
        if (result.clickType === DialogClickType.CONFIRM) {
          this.loginStatus = this._common.aswContextStoreService.aswContextData.loginStatus;
          if (this.loginStatus === LoginStatusType.REAL_LOGIN) {
            // ログイン状態の場合

            const param: PlansDeletePlansRequest = {
              cartIds: cartIds,
            };
            // プラン削除API実行
            this._planListService.deletePlans(param, () => this.init());
          } else {
            //　未ログインの場合

            const localPlanList = this._localPlanService.getLocalPlans();
            if (localPlanList) {
              cartIds.forEach((cartId) => {
                const index = localPlanList.plans?.findIndex((plan) => plan.cartId === cartId);
                if (index !== undefined) {
                  localPlanList.plans?.splice(index, 1);
                }
              });
              this._localPlanService.setLocalPlans(localPlanList);
              this.init();
            }
          }
        }
      }
    );
  }

  /* プランリスト取得APIエラーレスポンス処理 */
  getPlanListApiError() {
    const apiErr: string = this._common.apiError?.errors?.at(0)?.code ?? '';
    const errMsg = this._planListService.getErrorMessage(apiErr);
    if (apiErr !== '') {
      this._errorsHandlerSvc.setNotRetryableError({
        errorType: ErrorType.BUSINESS_LOGIC,
        errorMsgId: errMsg,
        apiErrorCode: apiErr,
      });
    }
  }

  /* プラン確認画面引き渡し情報設定 */
  setInfoToPlanReview(index: number) {
    // 操作されたプラン/カート情報をストアに保持
    this._currentPlanStoreService.setCurrentPlan(this.displayPlanList[index].planData ?? {});
    this._currentCartStoreService.setCurrentCart(this.displayPlanList[index].cartList?.cartData ?? {});

    const data = this._getPlansStoreService.GetPlansData;

    // カート情報取得要否判定フラグ保持
    const deliveryInformation: DeliveryInformationModel = {
      planReviewInformation: {
        isNeedGetCart: false,
      },
    };
    this._deliveryInfoStoreService.setDeliveryInformation(deliveryInformation);
  }

  /* プラン操作メニューモーダル表示 */
  openPlanOperationModal(selectPlan: PlanListCurrentPlan) {
    const part = PlanOperationModalPayloadParts(selectPlan);
    part.closeEvent = () => this.planOperationClose();
    this._modalService.showSubModal(part);
  }

  /* プラン操作メニューモーダルクローズイベント */
  planOperationClose() {
    // 削除場合、プラン操作の個別処理
    if (this._planListStoreService.afterDeletePlanList) {
      const plaListInfo: PlanListModel = {
        planList: this._planListStoreService.afterDeletePlanList,
        isReInit: false,
      };
      this._planListStoreService.setPlanList(plaListInfo);
      // 初期表示
      this._planListStoreService.afterDeletePlanList = undefined;
      this.init();
    } else {
      const isNeedInit = this._planListStoreService.PlanListData.isReInit;
      if (isNeedInit) {
        const plaListInfo: PlanListModel = {
          planList: this._planListStoreService.PlanListData.planList,
          isReInit: false,
        };
        this._planListStoreService.setPlanList(plaListInfo);

        this.init();
      }
    }
  }
}
