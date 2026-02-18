import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';

import { CommonLibService } from '@lib/services';
import {
  initialPassengerInformationRequestPassengerInformationData,
  initialPassengerInformationRequestPassengerInformationParts,
  PassengerInformationRequestPassengerInformationData,
  PassengerInformationRequestPassengerInformationParts,
} from './passenger-information.state';
import { SubComponentModelComponent } from '@common/components/feature-parts/sub-conponent-model/sub-component-model.component';
import { initialPassengerInformationRequestInputCompleteOperationparts } from '../common-component/passenger-input-complete-operation-area/passenger-input-complete-operation-area.state';
import {
  PassengerInformationRequestPassengerArrivalAndDepartureNoticeData,
  initialPassengerInformationRequestPassengerArrivalAndDepartureNoticeData,
} from './passenger-arrival-and-departure-notice/passenger-arrival-and-departure-notice.state';
import {
  PassengerInformationRequestPassengerBasicInformationData,
  initialPassengerInformationRequestPassengerBasicInformationData,
} from './passenger-basic-information/passenger-basic-information.state';
import {
  PassengerInformationRequestPassengerContactData,
  initialPassengerInformationRequestPassengerContactData,
} from './passenger-contact/passenger-contact.state';
import {
  PassengerInformationRequestPassengerFFPData,
  initialPassengerInformationRequestPassengerFFPData,
} from './passenger-ffp/passenger-ffp.state';
import {
  PassengerInformationRequestPassengerCloseHeaderData,
  initialPassengerInformationRequestPassengerCloseHeaderData,
} from './passenger-header-close/passenger-header-close.state';
import {
  PassengerInformationRequestPassengerOpenHeaderData,
  initialPassengerInformationRequestPassengerOpenHeaderData,
} from './passenger-header-open/passenger-header-open.state';
import {
  PassengerInformationRequestPassengerPassportData,
  initialPassengerInformationRequestPassengerPassportData,
} from './passenger-passport/passenger-passport.state';
import {
  PassengerInformationRequestPassengerSupportData,
  initialPassengerInformationRequestPassengerSupportData,
} from './passenger-support/passenger-support.state';
import { PassengerInformationRequestPassengerArrivalAndDepartureNoticeComponent } from './passenger-arrival-and-departure-notice/passenger-arrival-and-departure-notice.component';
import { PassengerInformationRequestPassengerBasicInformationComponent } from './passenger-basic-information/passenger-basic-information.component';
import { PassengerInformationRequestPassengerContactComponent } from './passenger-contact/passenger-contact.component';
import { PassengerInformationRequestPassengerFFPComponent } from './passenger-ffp/passenger-ffp.component';
import { PassengerInformationRequestPassengerCloseHeaderComponent } from './passenger-header-close/passenger-header-close.component';
import { PassengerInformationRequestPassengerOpenHeaderComponent } from './passenger-header-open/passenger-header-open.component';
import { PassengerInformationRequestPassengerPassportComponent } from './passenger-passport/passenger-passport.component';
import { PassengerInformationRequestPassengerSupportComponent } from './passenger-support/passenger-support.component';
import { RegistrationLabelType } from '@common/interfaces';
import { isStringEmpty } from '@common/helper';
import {
  initialPassengerDisabilityDiscountData,
  PassengerInformationRequestDisabilityDiscountData,
} from './passenger-disability-discount/passenger-disability-discount.state';
import {
  initialPassengerInformationRequestIslandCardData,
  PassengerInformationRequestIslandCardData,
} from './passenger-island-card/passenger-island-card.state';
import { PassengerInformationRequestDisabilityDiscountComponent } from './passenger-disability-discount/passenger-disability-discount.component';
import { PassengerInformationRequestIslandCardComponent } from './passenger-island-card/passenger-island-card.component';

/**
 * passenger-information-request
 * 搭乗者情報ブロック
 */

@Component({
  selector: 'asw-passenger-information-request-passenger',
  templateUrl: './passenger-information.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PassengerInformationRequestPassengerInformationComponent extends SubComponentModelComponent<
  PassengerInformationRequestPassengerInformationData,
  PassengerInformationRequestPassengerInformationParts
> {
  constructor(public change: ChangeDetectorRef, protected _common: CommonLibService) {
    super(change, _common);
  }
  reload() {}
  init() {}
  destroy() {}
  public refresh() {
    //--------
    this._isOpen = this.parts.isOpen;
    this._arrivalAndDepartureNotice = this.data.arrivalAndDepartureNotice;
    this._basicInformation = this.data.basicInformation;
    this._closeHeader = this.data.closeHeader;
    this._contact = this.data.contact;
    this._ffpData = this.data.ffpData;
    this._openHeader = this.data.openHeader;
    this._passport = this.data.passport;
    this._support = this.data.support;
    this._parts.closeHeader.registrarionLabel = this._parts.registrarionLabel;
    this._parts.openHeader.registrarionLabel = this._parts.registrarionLabel;
    this._disability = this.data.disability;
    this._island = this.data.island;

    this.inputCompleteOperationData.nextAction = this.parts.nextAction;
    this.inputCompleteOperationData.nextButtonLabel = this.parts.nextButtonLabel;
    this.inputCompleteOperationData.saveButtonLabel = 'label.saveAndBacktoPlan';
    this.change.detectChanges(); //子コンポーネントも更新させるため
  }
  public update(isTached: boolean = false) {
    //--------
    let isError = false;
    this._data = {
      isError: false,
      arrivalAndDepartureNotice: this.arrivalAndDepartureNotice,
      basicInformation: this.basicInformation,
      contact: this.contact,
      ffpData: this.ffpData,
      passport: this.passport,
      closeHeader: this.closeHeader,
      openHeader: this.openHeader,
      support: this.support,
      disability: this.disability,
      island: this.island,
    };
    if (this.parts.registrarionLabel === RegistrationLabelType.EDITTING) {
      this._data.isError =
        this._data.arrivalAndDepartureNotice.isError ||
        this._data.basicInformation.isError ||
        this._data.closeHeader.isError ||
        this._data.contact.isError ||
        this._data.ffpData.isError ||
        this._data.openHeader.isError ||
        this._data.passport.isError ||
        this._data.support.isError ||
        this._data.disability.isError ||
        this._data.island.isError;
    }
    this.dataChange.emit(this._data);
  }
  _data = initialPassengerInformationRequestPassengerInformationData();
  _parts = initialPassengerInformationRequestPassengerInformationParts();
  setDataEvent(): void {
    this.refresh();
  }
  setPartsEvent(): void {
    this.refresh();
  }

  //開閉状態
  @Input()
  set isOpen(value: boolean) {
    this._isOpen = value;
    this.isOpenChange.emit(value);
    this.change.markForCheck();
  }
  get isOpen() {
    return this._isOpen;
  }
  public _isOpen: boolean = false;
  @Output()
  isOpenChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  //入力完了エリア 次へボタンのイベント通知
  @Output()
  public clickNextEvent: EventEmitter<void> = new EventEmitter<void>();
  //入力完了エリア 保存ボタンのイベント通知
  @Output()
  public clickSaveEvent: EventEmitter<void> = new EventEmitter<void>();
  //搭乗者判別用のindex
  @Input()
  public index: number = -1;
  //特典予約フラグ
  @Input()
  public isAwardBooking: boolean = false;

  //入力完了エリアデータ
  public inputCompleteOperationData = initialPassengerInformationRequestInputCompleteOperationparts();
  //子コンポーネントへのアクセス
  @ViewChild('arrivalAndDepartureNoticeComp')
  arrivalAndDepartureNoticeComp?: PassengerInformationRequestPassengerArrivalAndDepartureNoticeComponent;
  @ViewChild('basicInfoComp') basicInfoComp?: PassengerInformationRequestPassengerBasicInformationComponent;
  @ViewChild('closeHeaderComp') closeHeaderComp?: PassengerInformationRequestPassengerCloseHeaderComponent;
  @ViewChild('contactComp') contactComp?: PassengerInformationRequestPassengerContactComponent;
  @ViewChild('ffpDataComp') ffpDataComp?: PassengerInformationRequestPassengerFFPComponent;
  @ViewChild('openHeaderComp') openHeaderComp?: PassengerInformationRequestPassengerOpenHeaderComponent;
  @ViewChild('passportComp') passportComp?: PassengerInformationRequestPassengerPassportComponent;
  @ViewChild('supportComp') supportComp?: PassengerInformationRequestPassengerSupportComponent;
  @ViewChild('disabilityComp') disabilityComp?: PassengerInformationRequestDisabilityDiscountComponent;
  @ViewChild('islandComp') islandComp?: PassengerInformationRequestIslandCardComponent;

  // 発着通知連絡先情報
  public _arrivalAndDepartureNotice: PassengerInformationRequestPassengerArrivalAndDepartureNoticeData =
    initialPassengerInformationRequestPassengerArrivalAndDepartureNoticeData();
  set arrivalAndDepartureNotice(value: PassengerInformationRequestPassengerArrivalAndDepartureNoticeData) {
    this._arrivalAndDepartureNotice = value;
    this.update();
  }
  get arrivalAndDepartureNotice(): PassengerInformationRequestPassengerArrivalAndDepartureNoticeData {
    return this._arrivalAndDepartureNotice;
  }

  // 搭乗者基本情報
  public _basicInformation: PassengerInformationRequestPassengerBasicInformationData =
    initialPassengerInformationRequestPassengerBasicInformationData();
  set basicInformation(value: PassengerInformationRequestPassengerBasicInformationData) {
    this._basicInformation = value;
    this.update();
  }
  get basicInformation(): PassengerInformationRequestPassengerBasicInformationData {
    return this._basicInformation;
  }

  // 搭乗者連絡先情報
  public _contact: PassengerInformationRequestPassengerContactData =
    initialPassengerInformationRequestPassengerContactData();
  set contact(value: PassengerInformationRequestPassengerContactData) {
    this._contact = value;
    this.update();
  }
  get contact(): PassengerInformationRequestPassengerContactData {
    return this._contact;
  }

  // FFP情報
  public _ffpData: PassengerInformationRequestPassengerFFPData = initialPassengerInformationRequestPassengerFFPData();
  set ffpData(value: PassengerInformationRequestPassengerFFPData) {
    this._ffpData = value;
    this.update();
  }
  get ffpData(): PassengerInformationRequestPassengerFFPData {
    return this._ffpData;
  }

  // パスポート番号
  public _passport: PassengerInformationRequestPassengerPassportData =
    initialPassengerInformationRequestPassengerPassportData();
  set passport(value: PassengerInformationRequestPassengerPassportData) {
    this._passport = value;
    this.update();
  }
  get passport(): PassengerInformationRequestPassengerPassportData {
    return this._passport;
  }

  // 障がい割旅客種別
  public _disability: PassengerInformationRequestDisabilityDiscountData = initialPassengerDisabilityDiscountData();
  set disability(value: PassengerInformationRequestDisabilityDiscountData) {
    this._disability = value;
    this.update();
  }
  get disability(): PassengerInformationRequestDisabilityDiscountData {
    return this._disability;
  }

  // 障がい割旅客種別
  public _island: PassengerInformationRequestIslandCardData = initialPassengerInformationRequestIslandCardData();
  set island(value: PassengerInformationRequestIslandCardData) {
    this._island = value;
    this.update();
  }
  get island(): PassengerInformationRequestIslandCardData {
    return this._island;
  }

  // 搭乗者情報ヘッダ クローズ時
  public _closeHeader: PassengerInformationRequestPassengerCloseHeaderData =
    initialPassengerInformationRequestPassengerCloseHeaderData();
  set closeHeader(value: PassengerInformationRequestPassengerCloseHeaderData) {
    this._closeHeader = value;
    this.update();
  }
  get closeHeader(): PassengerInformationRequestPassengerCloseHeaderData {
    return this._closeHeader;
  }

  // 搭乗者情報ヘッダ オープン時
  public _openHeader: PassengerInformationRequestPassengerOpenHeaderData =
    initialPassengerInformationRequestPassengerOpenHeaderData();
  set openHeader(value: PassengerInformationRequestPassengerOpenHeaderData) {
    this._openHeader = value;
    this.update();
  }
  get openHeader(): PassengerInformationRequestPassengerOpenHeaderData {
    return this._openHeader;
  }

  // サポート情報
  public _support: PassengerInformationRequestPassengerSupportData =
    initialPassengerInformationRequestPassengerSupportData();
  set support(value: PassengerInformationRequestPassengerSupportData) {
    this._support = value;
    this.update();
  }
  get support(): PassengerInformationRequestPassengerSupportData {
    return this._support;
  }

  /**
   * 閉じる押下イベント
   */
  clickClose() {
    this.isOpen = false;
    this.isOpenChange.emit(this.isOpen);
  }

  /**
   * 次へボタン押下時処理
   * */
  clickNextButton() {
    this.clickNextEvent.emit();
  }
  /**
   * 保存してプランに戻るボタン押下時処理
   * */
  clickSaveButton() {
    this.clickSaveEvent.emit();
  }

  /**
   * 外部呼出し用 強制refresh
   * */
  public refreshForce() {
    this.refresh();
    this.arrivalAndDepartureNoticeComp?.refresh();
    this.basicInfoComp?.refresh();
    this.contactComp?.refresh();
    this.ffpDataComp?.refresh();
    this.closeHeaderComp?.refresh();
    this.openHeaderComp?.refresh();
    this.passportComp?.refresh();
    this.supportComp?.refresh();
    this.disabilityComp?.refresh();
    this.islandComp?.refresh();
  }

  /**
   * 外部呼出し用 強制update
   * */
  public updateForce(isTached: boolean = false) {
    if (this.parts.registrarionLabel === RegistrationLabelType.EDITTING) {
      this.arrivalAndDepartureNoticeComp?.update(isTached);
      this.basicInfoComp?.update(isTached);
      this.contactComp?.update(isTached);
      this.ffpDataComp?.update(isTached);
      this.closeHeaderComp?.update();
      this.openHeaderComp?.update();
      this.passportComp?.update(isTached);
      this.supportComp?.update();
      this.disabilityComp?.update(isTached);
      this.islandComp?.update(isTached);
    }
    this.update(isTached);
  }
}
