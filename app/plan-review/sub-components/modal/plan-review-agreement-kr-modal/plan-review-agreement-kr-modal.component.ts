import { AfterViewChecked, ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { PlanReviewStoreService } from '@common/services';
import { RoutesResRoutes } from '@conf/routes.config';
import { SupportModalBlockComponent } from '@lib/components/support-class';
import { AswValidators } from '@lib/helpers';
import { ErrorType } from '@lib/interfaces';
import { CommonLibService, ErrorsHandlerService } from '@lib/services';

/**
 * 同意確認モーダル(韓国)
 */
@Component({
  selector: 'asw-agreement-kr-modal',
  templateUrl: './plan-review-agreement-kr-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanReviewAgreementKrModalComponent extends SupportModalBlockComponent implements AfterViewChecked {
  /** 同意1のFormControl */
  public agreementFC_1 = new FormControl('');
  /** 同意2のFormControl */
  public agreementFC_2 = new FormControl('');
  /** 同意3のFormControl */
  public agreementFC_3 = new FormControl('');

  constructor(
    private _common: CommonLibService,
    private _router: Router,
    private _errorsHandlerSvc: ErrorsHandlerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _planReviewStoreService: PlanReviewStoreService
  ) {
    super(_common);
  }

  init(): void {
    this.closeWithUrlChange(this._router);
  }

  reload(): void {}

  destroy(): void {}

  ngAfterViewChecked(): void {
    this.resize();
    this._changeDetectorRef.markForCheck();
  }

  /**
   * 次へボタン押下時処理
   */
  clickContinue() {
    this._planReviewStoreService.updatePlanReview({ isHkKrAgreed: true });
    this.close();
  }

  /**
   * 閉じるボタン押下時処理
   */
  clickClose() {
    const prevPage = this.payload.prevPage;
    switch (prevPage) {
      case 'R01P030':
        this._router.navigateByUrl(RoutesResRoutes.ROUNDTRIP_FLIGHT_AVAILABILITY_INTERNATIONAL);
        break;
      case 'R01P031':
        this._router.navigateByUrl(RoutesResRoutes.ROUNDTRIP_FLIGHT_AVAILABILITY_DOMESTIC);
        break;
      case 'R01P033':
        this._router.navigateByUrl(RoutesResRoutes.COMPLEX_FLIGHT_AVAILABILITY);
        break;
      case 'R01P042':
        this._router.navigateByUrl(RoutesResRoutes.PLAN_LIST);
        break;
      default:
        // システムエラー
        this._errorsHandlerSvc.setNotRetryableError({
          errorType: ErrorType.SYSTEM,
        });
        this.close();
        break;
    }
    this.close();
  }
}
