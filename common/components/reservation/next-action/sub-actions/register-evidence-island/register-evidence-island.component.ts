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

/** 証憑登録(離島) */
@Component({
  selector: 'asw-register-evidence-island',
  templateUrl: './register-evidence-island.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterEvidenceIslandComponent implements OnInit {
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
    private readonly _viewContainerRef: ViewContainerRef
  ) {}

  ngOnInit(): void {
    this._viewContainerRef.createEmbeddedView(this.template);
  }

  getIsDisplayed(pnr: GetOrderResponseData) {
    // PNR情報取得API応答.data.nextAction.registrationOfVouchers.islandsTicket=true(次に必要なアクションである)の場合、証憑登録(離島)のコンテンツリンクを設定し、登録を促す旨を表示する。
    return pnr.nextActions?.registrationOfVouchers?.islandsTicket === true;
  }

  onClick() {
    this._nextActionService.onHandleRegisterEvidenceIsland(this._pnr);
  }
}
