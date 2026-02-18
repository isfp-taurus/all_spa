import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { NextActionTypeEnum } from '@common/services/next-action/next-action.constants';
import { NextActionService } from '@common/services/next-action/next-action.service';
import { CommonLibService } from '@lib/services/common-lib/common-lib.service';
import { GetOrderResponseData } from 'src/sdk-servicing';

/** 事前座席指定 */
@Component({
  selector: 'asw-advance-seat-selection',
  templateUrl: './advance-seat-selection.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdvanceSeatSelectionComponent implements OnInit {
  @ViewChild('template', { static: true })
  template!: TemplateRef<unknown>;
  private _pnr: GetOrderResponseData = {};
  isDisplayed!: boolean;
  @Input() canBeClicked = true;
  @Input() set pnr(pnr: GetOrderResponseData) {
    this.isDisplayed = this.getIsDisplayed(pnr);
    this._pnr = pnr;
  }

  constructor(
    private readonly nextActionService: NextActionService,
    private readonly _common: CommonLibService,
    private readonly _viewContainerRef: ViewContainerRef
  ) {}

  ngOnInit(): void {
    this._viewContainerRef.createEmbeddedView(this.template);
  }

  getIsDisplayed(pnr: GetOrderResponseData) {
    // PNR情報取得API応答.data.nextAction.seatRequest=true(次に必要なアクションである)の場合、座席指定を促す旨を表示する。
    return pnr.nextActions?.seatRequest === true;
  }

  onClick() {
    this.nextActionService.onHandleAdvanceSeatSelection(
      {
        orderId: this._pnr?.orderId!,
        firstName: this._common.aswServiceStoreService.aswServiceData?.firstName!,
        lastName: this._common.aswServiceStoreService.aswServiceData?.lastName!,
        nextAction: NextActionTypeEnum.AdvancedSeatRequest,
      },
      this._pnr
    );
  }
}
