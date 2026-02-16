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

/** オンラインチェックイン */
@Component({
  selector: 'asw-online-check-in',
  templateUrl: './online-check-in.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnlineCheckInComponent implements OnInit {
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
    // PNR情報取得API応答.data.nextAction.onlineCheckin=true(次に必要なアクションである)の場合、オンラインチェックインを促す旨の文言を表示する。
    return pnr.nextActions?.onlineCheckin === true;
  }

  onClick() {
    this.nextActionService.onHandleOnlineCheckin(this._pnr);
  }
}
