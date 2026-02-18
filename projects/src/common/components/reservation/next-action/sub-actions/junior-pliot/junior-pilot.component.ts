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

/** ジュニアパイロット */
@Component({
  selector: 'asw-junior-pilot',
  templateUrl: './junior-pilot.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JuniorPilotComponent implements OnInit {
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
    private readonly _nextActionService: NextActionService,
    private readonly _common: CommonLibService,
    private readonly _viewContainerRef: ViewContainerRef
  ) {}

  ngOnInit(): void {
    this._viewContainerRef.createEmbeddedView(this.template);
  }

  getIsDisplayed(pnr: GetOrderResponseData) {
    // PNR情報取得API応答.data.nextAction.juniorPilotRequest=true(次に必要なアクションである)の場合、ジュニアパイロットを促す旨を表示する。
    return pnr.nextActions?.juniorPilotRequest === true;
  }

  onClick() {
    this._nextActionService.onHandleJuniorPilot(
      {
        orderId: this._pnr?.orderId!,
        firstName: this._common.aswServiceStoreService.aswServiceData?.firstName!,
        lastName: this._common.aswServiceStoreService.aswServiceData?.lastName!,
        nextAction: NextActionTypeEnum.JuniorPilot,
      },
      this._pnr
    );
  }
}
