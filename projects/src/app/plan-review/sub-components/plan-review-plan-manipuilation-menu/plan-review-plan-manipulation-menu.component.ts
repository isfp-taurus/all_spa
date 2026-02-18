import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, Renderer2 } from '@angular/core';
import { SupportComponent } from '@lib/components/support-class';
import { ErrorType, PageType } from '@lib/interfaces';
import { AswMasterService, CommonLibService, ErrorsHandlerService, ModalService } from '@lib/services';
import { PlansCreatePlansRequest } from 'src/sdk-reservation';
import {
  CreatePlansStoreService,
  CurrentPlanStoreService,
  CurrentCartStoreService,
  GetEstimationStoreService,
} from '@common/services';
import { planSaveModalParts, temporaryUrlModalParts } from '@common/components';
import { TEMP_URL_KEY } from '@app/plan-review/container/plan-review-cont.component.state';
import { PlanReviewPlanManipulationMenuService } from './plan-review-plan-manipulation-menu.service';
import { apiEventAll } from '@common/helper';
import { StaticMsgPipe } from '@lib/pipes';
import { Buffer } from 'buffer';
import { ErrorCodeConstants } from '@conf/app.constants';

/**
 * プラン操作メニュー
 */
@Component({
  selector: 'asw-plan-manipulation-menu',
  templateUrl: './plan-review-plan-manipulation-menu.component.html',
  styleUrls: ['./plan-review-plan-manipulation-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanReviewPlanManipulationMenuComponent extends SupportComponent {
  /** プラン保存状態 */
  @Input() isUnsaved = false;

  /** プラン有効判定 */
  @Input() isPlanValid = false;

  /** SP・TAB版モーダル表示時、モーダル閉じる用 */
  @Output() isModalClose = new EventEmitter();

  /**
   * コンストラクタ
   */
  constructor(
    private _common: CommonLibService,
    private _errorsHandlerSvc: ErrorsHandlerService,
    private _aswMasterSvc: AswMasterService,
    private _currentCartStoreService: CurrentCartStoreService,
    private _currentPlanStoreService: CurrentPlanStoreService,
    private _createPlansStoreService: CreatePlansStoreService,
    private _modalService: ModalService,
    private _planManipulationMenuService: PlanReviewPlanManipulationMenuService,
    private _getEstimationStoreService: GetEstimationStoreService,
    private _staticMsgPipe: StaticMsgPipe,
    private _renderer: Renderer2
  ) {
    super(_common);
  }

  init(): void {}
  reload(): void {}
  destroy(): void {}

  /**
   * プラン保存モーダル表示処理
   */
  openPlanSaveModal(): void {
    const parts = planSaveModalParts();
    parts.payload = {
      cartId: this._currentCartStoreService.CurrentCartData.data?.cartId ?? '',
      planName: this._currentPlanStoreService.CurrentPlanData.planName ?? '',
      creationDate: this._currentCartStoreService.CurrentCartData.data?.creationDate,
      isUnsaved: this._currentPlanStoreService.CurrentPlanData.isUnsaved ?? true,
    };
    this._modalService.showSubModal(parts);
  }

  /**
   * Deeplink/シェアボタン押下時処理
   */
  showTemporaryUrl(urlType: string): void {
    // プラン作成APIを実行
    let processType;
    switch (urlType) {
      case 'DPL':
        processType = PlansCreatePlansRequest.ProcessTypeEnum.TemporarySaveForDeeplink;
        break;
      case 'SHR':
        processType = PlansCreatePlansRequest.ProcessTypeEnum.TemporarySaveForShare;
        break;
      default:
        return;
    }
    const requestParameter: PlansCreatePlansRequest = {
      plans: [
        {
          cartId: this._currentCartStoreService.CurrentCartData.data?.cartId ?? '',
          planName: this._currentPlanStoreService.CurrentPlanData.planName ?? '',
        },
      ],
      processType: processType,
    };
    apiEventAll(
      () => this._createPlansStoreService.setCreatePlansFromApi(requestParameter),
      this._createPlansStoreService.getCreatePlans$(),
      (response) => {
        // 一時URL作成処理
        const originString = this._aswMasterSvc.getMPropertyByKey('plan', 'url.planReview');
        const tempUrl = new URL(originString);
        tempUrl.searchParams.append(TEMP_URL_KEY, response.temporaryNumber ?? '');
        const parts = temporaryUrlModalParts();
        parts.payload = {
          type: urlType,
          url: tempUrl.toString(),
        };
        this._modalService.showSubModal(parts);
      },
      (error) => {
        const apiErr = this._common.apiError?.errors?.[0]?.code ?? '';
        if (apiErr === ErrorCodeConstants.ERROR_CODES.EBAZ000278) {
          this._errorsHandlerSvc.setNotRetryableError({
            errorType: ErrorType.BUSINESS_LOGIC,
            errorMsgId: 'E0333',
            apiErrorCode: apiErr,
          });
        }
      }
    );
  }

  /**
   * 見積PDFダウンロード処理
   */
  downloadEstimation(): void {
    // 見積(PDF)取得APIリクエストを作成
    this.subscribeService(
      'PlanReviewPlanManipulationMenuSvc GetEstimationRequest',
      this._planManipulationMenuService.getEstimationRequest$(),
      (data) => {
        this.deleteSubscription('PlanReviewPlanManipulationMenuSvc GetEstimationRequest');
        // 見積(PDF)取得APIを実行
        apiEventAll(
          () => this._getEstimationStoreService.setGetEstimationFromApi(data),
          this._getEstimationStoreService.getGetEstimation$(),
          (response) => {
            // 取得したBase64文字列をPDF変換
            const buffer = Buffer.from(response.estimation ?? '', 'base64');
            const fileName = this._staticMsgPipe.transform('label.quotation.title') + '.pdf';
            const file = new File([buffer], fileName, { type: 'application/pdf' });
            const url = URL.createObjectURL(file);

            // ダウンロード用のaタグを生成しクリック
            const el: HTMLLinkElement = this._renderer.createElement('a');
            el.href = url;
            el.setAttribute('download', file.name);
            document.body.appendChild(el);
            el.click();
            document.body.removeChild(el);

            URL.revokeObjectURL(url);
          },
          (error) => {
            const apiErr = this._common.apiError?.errors?.[0]?.code ?? '';
            if (apiErr === ErrorCodeConstants.ERROR_CODES.EBAZ000300) {
              this._errorsHandlerSvc.setRetryableError(PageType.PAGE, {
                errorMsgId: 'E0374',
                apiErrorCode: apiErr,
              });
            }
          }
        );
      }
    );
  }

  /**
   * プラン削除処理
   */
  deletePlan() {
    const afterEvent = () => this.isModalClose.emit();
    this._planManipulationMenuService.deletePlan(afterEvent);
  }
}
