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
import { GetOrderResponseData, GetOrderResponseDataOrderType } from 'src/sdk-servicing';

/**
 * メールアドレス登録(直営PNR、NDC PNRの場合)
 *
 * メ ールアドレス登録(GDS PNRまたは国内代理店作成PNR)
 */
@Component({
  selector: 'asw-register-email',
  templateUrl: './register-email.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterEmailComponent implements OnInit {
  @ViewChild('template', { static: true })
  template!: TemplateRef<unknown>;
  private _pnr: GetOrderResponseData = {};
  isDisplayed!: boolean;
  @Input() canBeClicked = true;
  @Input() set pnr(pnr: GetOrderResponseData) {
    this.isDisplayed = this.getIsDisplayed(pnr);
    this._pnr = pnr;
  }
  private _isFirstInTheList: boolean = false;
  @Input() set isFirstInTheList(value: boolean) {
    this._isFirstInTheList = value;
    this.isDisplayed = this.getIsDisplayed(this._pnr);
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
    // 以下条件をすべて満たす場合、メールアドレスの入力を促す旨の文言を表示する。
    // 1.PNR情報取得API応答.data.nextAction.emailAddressRegistration=true(次に必要なアクションである)
    return (
      pnr.nextActions?.emailAddressRegistration === true &&
      (this._isFirstInTheList
        ? // 2.PNR情報取得API応答.data.orderType.channelType=”nh”(直営PNR)、または”ndc”(NDC PNR)の場合
          pnr.orderType?.channelType === GetOrderResponseDataOrderType.ChannelTypeEnum.Nh ||
          pnr.orderType?.channelType === GetOrderResponseDataOrderType.ChannelTypeEnum.Ndc
        : // 2.PNR情報取得API応答.data.orderType.channelType=”gds”(GDS PNR)、または "nh3"(国内代理店作成PNR)の場合)
          pnr.orderType?.channelType === GetOrderResponseDataOrderType.ChannelTypeEnum.Gds ||
          pnr.orderType?.channelType === GetOrderResponseDataOrderType.ChannelTypeEnum.Nh3)
    );
  }

  onClick() {
    this._nextActionService.onHandleRegisterEmail(
      {
        firstName: this._common.aswServiceStoreService.aswServiceData?.firstName!,
        lastName: this._common.aswServiceStoreService.aswServiceData?.lastName!,
        nextAction: NextActionTypeEnum.EmailAddressRegistration,
        orderId: this._pnr.orderId!,
      },
      this._pnr
    );
  }
}
