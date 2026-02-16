import { AfterViewChecked, ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { SupportModalBlockComponent } from '@lib/components/support-class';
import { AswValidators } from '@lib/helpers';
import { DialogClickType, ErrorType, PageType } from '@lib/interfaces';
import {
  AswMasterService,
  CommonLibService,
  DialogDisplayService,
  ErrorsHandlerService,
  PageLoadingService,
  TealiumService,
} from '@lib/services';
import { PlansCreatePlansRequest, PlansGetPlansResponsePlansInner } from 'src/sdk-reservation';
import { PlanSaveModalParams } from '@common/interfaces';
import {
  PlanReviewStoreService,
  LocalPlanService,
  UpdatePlannameStoreService,
  CreatePlansStoreService,
  PlanListStoreService,
  LocalDateService,
} from '@common/services';
import { DatePipe } from '@angular/common';
import { apiEventAll, stringYMDHmsToDate } from '@common/helper';
import { StaticMsgPipe } from '@lib/pipes';
import { Observable } from 'rxjs';
import { ErrorCodeConstants } from '@conf/app.constants';

/**
 * プラン保存・プラン名称変更モーダル
 */
@Component({
  selector: 'asw-plan-save-modal',
  templateUrl: './plan-save-modal.component.html',
  styleUrls: ['./plan-save-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanSaveModalComponent extends SupportModalBlockComponent implements AfterViewChecked {
  /** payload */
  public override payload: PlanSaveModalParams = {
    cartId: '',
    planName: undefined,
    creationDate: '',
    isUnsaved: true,
  };

  /** 対象プランのカートID */
  public cartId = '';

  /** プラン名称 */
  public planName = '';

  /** カート作成日時 */
  public creationDate = '';

  /** プラン保存状態（＝新規保存か名称変更か） */
  public isUnsaved = true;

  /** モーダルタイトル静的文言 */
  public modalTitle = '';

  /**
   * プラン名称テキストボックスのFormGroup・FormControl
   */
  public inputFG = new FormGroup({
    planNameInput: new FormControl('', [
      AswValidators.required({
        errorMsgId: 'E0001',
        params: { key: 0, value: 'label.planTitle' },
      }),
    ]),
  });

  /**
   * コンストラクタ
   */
  constructor(
    private _common: CommonLibService,
    private _aswMasterSvc: AswMasterService,
    private _localPlanService: LocalPlanService,
    private _createPlansStoreService: CreatePlansStoreService,
    private _updatePlannameStoreService: UpdatePlannameStoreService,
    private _errorsHandlerSvc: ErrorsHandlerService,
    private _planReviewStoreService: PlanReviewStoreService,
    private _planListStoreService: PlanListStoreService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _dialogSvc: DialogDisplayService,
    private _staticMsgPipe: StaticMsgPipe,
    private _datePipe: DatePipe,
    private _localDateService: LocalDateService,
    private _pageLoadingService: PageLoadingService
  ) {
    super(_common);
  }

  /**
   * 初期表示処理
   */
  init(): void {
    // payloadの値を受け取る
    this.cartId = this.payload.cartId;
    this.planName = this.payload.planName ?? '';
    this.creationDate = this.payload.creationDate ?? '';
    this.isUnsaved = this.payload.isUnsaved;

    let initName = '';

    // プランの保存状態に応じ、静的文言を選定
    if (this.isUnsaved) {
      // 新規保存の場合
      this.modalTitle = this._staticMsgPipe.transform('label.planSaveModalTitle');
      initName = this._staticMsgPipe.transform('label.defaultPlanName');
    } else {
      // 名称変更の場合
      this.modalTitle = this._staticMsgPipe.transform('label.planNameEditModalTitle');
      initName = this.planName;
    }

    // テキストボックスに初期値を設定
    this.inputFG.setValue({ planNameInput: initName ?? '' });
  }

  reload(): void {}

  destroy(): void {
    this._common.errorsHandlerService.clearRetryableError('subPage');
    this._common.alertMessageStoreService.removeAllSubAlertMessage();
  }

  ngAfterViewChecked(): void {
    this.resize();
    this._changeDetectorRef.markForCheck();
  }

  /**
   * 保存ボタン押下時処理
   */
  savePlan(): void {
    if (!this.inputFG.valid) {
      // バリデーションエラーの場合
      this.inputFG.markAllAsTouched();
    } else {
      // テキストボックス入力値
      const planName = this.inputFG.controls.planNameInput.value ?? '';

      if (this._common.isNotLogin()) {
        // 未ログイン状態の場合

        // プラン保存上限に達している場合、保存できない旨のエラーを表示
        if (this.isUnsaved && this.isLocalPlanListFull()) {
          this._errorsHandlerSvc.setRetryableError(PageType.PAGE, {
            errorMsgId: 'E0763',
          });
          this.close();
          return;
        }

        if (!this.isUnsaved) {
          // 同意不要(保存済み)の場合、プラン名称変更処理
          this.saveLocalPlan(this.cartId, planName, this.creationDate);
        } else {
          // 搭乗者情報が保存されない旨のダイアログを表示（保存済みの場合パス）
          this.subscribeService(
            'PlanSaveModal showPassengerInfoUnsavableAlert',
            this.showPassengerInfoUnsavableAlert(),
            (result) => {
              this.deleteSubscription('PlanSaveModal showPassengerInfoUnsavableAlert');
              if (result === DialogClickType.CONFIRM) {
                // 同意成立の場合、プラン保存処理
                this.saveLocalPlan(this.cartId, planName, this.creationDate);
              }
            }
          );
        }
      } else {
        // ログイン済みの場合
        if (this.isUnsaved) {
          // 未保存の場合
          this.savePlanOnDB(this.cartId, planName);
        } else {
          // 保存済みの場合
          this.updatePlanOnDB(this.cartId, planName);
        }
      }
    }
  }

  /**
   * ローカルプラン保存・名称変更処理
   * @param cartId 対象カートのcartId
   * @param planName プラン名
   * @param creationDate 対象カートの作成日時
   */
  saveLocalPlan(cartId: string, planName: string, creationDate?: string): void {
    // 対象プランの有効期限を算出
    const targetPlanCreationDate = stringYMDHmsToDate(creationDate ?? '');
    const planExpiryMs = parseInt(this._aswMasterSvc.getMPropertyByKey('plan', 'planExpiryDate'), 10);
    let targetPlanExpiryDateStr;
    if (targetPlanCreationDate) {
      const targetPlanExpiryDate = new Date(targetPlanCreationDate.getTime() + planExpiryMs);
      targetPlanExpiryDateStr = this._datePipe.transform(targetPlanExpiryDate, 'yyyy-MM-dd') ?? undefined;
    }

    // 操作オフィスの現在日時
    const currentDate = this._localDateService.getCurrentDate();

    const localPlanList = this._localPlanService.getLocalPlans() ?? { plans: [] };

    // カートIDの一致するプランを検索
    const planIndex = localPlanList.plans?.findIndex((plan) => plan.cartId === cartId) ?? -1;
    if (planIndex === -1) {
      // カートIDの一致するプランが存在しない場合
      const targetPlan: PlansGetPlansResponsePlansInner = {
        cartId: cartId,
        creationPointOfSaleId: this._common.aswContextStoreService.aswContextData.pointOfSaleId,
        planName: planName,
        creationDate: this._datePipe.transform(creationDate, 'yyyy-MM-dd') ?? '',
        planExpiryDate: targetPlanExpiryDateStr ?? '',
        planLastModificationDate: this._datePipe.transform(currentDate, 'yyyy-MM-ddTHH:mm:ss') ?? '',
        prebookExpiryDate: undefined, // prebook済みプランであれば必ずローカルプランに登録されている
        isUnsaved: false,
        isPrebooked: false,
      };
      localPlanList.plans?.push(targetPlan);
    } else {
      // カートIDの一致するプランが存在する場合
      const targetPlan = localPlanList.plans?.[planIndex] ?? {};
      const updatedPlan: PlansGetPlansResponsePlansInner = {
        ...targetPlan,
        planName: planName,
        planExpiryDate: (targetPlanExpiryDateStr || targetPlan?.planExpiryDate) ?? '',
        planLastModificationDate: this._datePipe.transform(currentDate, 'yyyy-MM-ddTHH:mm:ss') ?? '',
        isUnsaved: false,
      };
      // 更新対象のプランをupdatedPlanに置き換える
      localPlanList.plans?.splice(planIndex, 1, updatedPlan);
    }

    // ローカルプランリストを上書きする
    this._localPlanService.setLocalPlans(localPlanList);
    this.closeAndRefresh();
  }

  /**
   * 未ログイン者用ダイアログ表示処理
   * @returns DialogClickType
   */
  showPassengerInfoUnsavableAlert(): Observable<DialogClickType> {
    return new Observable<DialogClickType>((observer) => {
      this.subscribeService(
        'PlanSaveModal Dialog ButtonClickObservable',
        this._dialogSvc.openDialog({ message: 'm_dynamic_message-MSG1006' }).buttonClick$,
        (result) => {
          this.deleteSubscription('PlanSaveModal Dialog ButtonClickObservable');
          if (result.clickType === DialogClickType.CONFIRM) {
            // 同意成立時
            observer.next(DialogClickType.CONFIRM);
          } else {
            // 同意不成立時
            observer.next(DialogClickType.CLOSE);
          }
        }
      );
    });
  }

  /**
   * ASWDB(Tx)へのプラン保存処理
   * @param cartId
   * @param planName
   */
  savePlanOnDB(cartId: string, planName: string): void {
    this._pageLoadingService.startLoading();
    const requestParams: PlansCreatePlansRequest = {
      plans: [{ cartId: cartId, planName: planName }],
      processType: 'new',
    };
    apiEventAll(
      () => this._createPlansStoreService.setCreatePlansFromApi(requestParams),
      this._createPlansStoreService.getCreatePlans$(),
      (response) => {
        this._pageLoadingService.endLoading();
        this.closeAndRefresh();
      },
      (error) => {
        this._pageLoadingService.endLoading();
        const apiErr = this._common.apiError?.errors?.[0]?.code ?? '';
        switch (apiErr) {
          case ErrorCodeConstants.ERROR_CODES.EBAZ000285:
            this._errorsHandlerSvc.setRetryableError(PageType.PAGE, {
              errorMsgId: 'E0763',
              apiErrorCode: apiErr,
            });
            this.close();
            break;
          case ErrorCodeConstants.ERROR_CODES.EBAZ000278:
            this._errorsHandlerSvc.setNotRetryableError({
              errorType: ErrorType.BUSINESS_LOGIC,
              errorMsgId: 'E0333',
              apiErrorCode: apiErr,
            });
            this.close();
            break;
          default:
            this._errorsHandlerSvc.setNotRetryableError({
              errorType: ErrorType.SYSTEM,
              apiErrorCode: apiErr,
            });
            this.close();
            break;
        }
      }
    );
  }

  /**
   * ASWDB(Tx)のプラン名称変更処理
   * @param cartId
   * @param planName
   */
  updatePlanOnDB(cartId: string, planName: string): void {
    this._pageLoadingService.startLoading();
    const requestParams = {
      cartId: cartId,
      planName: planName,
    };
    apiEventAll(
      () => this._updatePlannameStoreService.setUpdatePlannameFromApi(requestParams),
      this._updatePlannameStoreService.getUpdatePlanname$(),
      (response) => {
        this._pageLoadingService.endLoading();
        this.closeAndRefresh();
      },
      (_) => this._pageLoadingService.endLoading()
    );
  }

  /**
   * カート情報・プラン情報の更新を予約してモーダルを閉じる処理
   */
  closeAndRefresh(): void {
    this._planReviewStoreService.updatePlanReview({ isNeedRefresh: true });
    this._planListStoreService.updatePlanList({ isReInit: true });
    this.close();
  }

  /**
   * ローカルプランリスト保存上限到達判定処理
   * @returns
   */
  isLocalPlanListFull(): boolean {
    const localPlanList = this._localPlanService.getLocalPlans();
    const planMax = parseInt(this._aswMasterSvc.getMPropertyByKey('plan', 'maximumSavePlans'), 10);
    return (localPlanList?.plans?.filter((plan) => !plan.isUnsaved).length ?? 0) >= planMax;
  }

  /** 閉じるボタン押下時処理 */
  clickClose() {
    this.close();
  }
}
