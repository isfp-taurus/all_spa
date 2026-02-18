import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { NextActionService } from '@common/services/next-action/next-action.service';
import { GetOrderResponseData } from 'src/sdk-servicing';

/** イレギュラー振替(Acknowledge) */
@Component({
  selector: 'asw-acknowledge',
  templateUrl: './acknowledge.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AcknowledgeComponent implements OnInit {
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
    private readonly _viewContainerRef: ViewContainerRef
  ) {}

  ngOnInit(): void {
    this._viewContainerRef.createEmbeddedView(this.template);
  }

  getIsDisplayed(pnr: GetOrderResponseData) {
    // 以下条件をすべて満たす場合、Acknowledgeを促す旨の文言を表示する。
    // 1.PNR情報取得API応答.data.nextAction.acknowledgeOrSelfReaccommodation=true(次に必要なアクションである)
    // 2.PNR情報取得API応答.data.orderEligibilities.flightReaccommodation.acknowledge.isEligibleToForward=true(案内必要)
    return (
      pnr.nextActions?.acknowledgeOrSelfReaccommodation === true &&
      pnr.orderEligibilities?.flightReaccommodation?.acknowledge?.isEligibleToForward === true
    );
  }

  onClick() {
    this.nextActionService.onHandleAcknowledge(this._pnr);
  }
}
