import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild } from '@angular/core';

import { MasterStoreKey } from '@conf/asw-master.config';
import { SupportModalBlockComponent } from '@lib/components/support-class';
import {
  AswMasterService,
  CommonLibService,
  PageLoadingService,
  DynamicContentService,
  SystemDateService,
} from '@lib/services';
import { SupportInformationInputFoldingTypeComponent } from './support-information-input-folding-type/support-information-input-folding-type.component';
import { SupportInformationInputSpecialAssistanceComponent } from './support-information-input-special-assistance/support-information-input-special-assistance.component';
import { SupportInformationInputWalkingAbilityComponent } from './support-information-input-walking-ability/support-information-input-walking-ability.component';
import { SupportInformationInputWheelchairTypeComponent } from './support-information-input-wheelchair-type/support-information-input-wheelchair-type.component';
import { SupportInformationInputWheelchairsComponent } from './support-information-input-wheelchairs/support-information-input-wheelchairs.component';
import { SupportInformationInputType } from './support-information-input.state';

import { Router } from '@angular/router';
import { SupportInformationInputStoreService } from '@common/services';
import {
  CountryCodeNameType,
  MListData,
  SupportInformationInputFoldingTypeModel,
  SupportInformationInputPregnantModel,
  SupportInformationInputSpecialAssistanceModel,
  SupportInformationInputWalkingAbilityModel,
  SupportInformationInputWheelchairsModel,
  SupportInformationInputWheelchairTypeModel,
} from '@common/interfaces';
import { SupportInformationInputPayload } from './support-information-input-payload.state';
import { SupportInformationInputState } from '@common/store';
import { getApplyListData, getKeyListData, getPhoneCountryList, wheelchairBatteryApi } from '@common/helper';
import { AlertMessageItem, AlertType, DynamicContent, DynamicContentType } from '@lib/interfaces';
import { filter, map, Subscription, take } from 'rxjs';
/**
 * サポート情報入力モーダル
 */
@Component({
  selector: 'asw-support-information-input',
  templateUrl: './support-information-input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupportInformationInputComponent extends SupportModalBlockComponent {
  constructor(
    private _common: CommonLibService,
    public changeDetectorRef: ChangeDetectorRef,
    private _aswMaserService: AswMasterService,
    private _supportInformationInputStoreService: SupportInformationInputStoreService,
    private _router: Router,
    private _sysDate: SystemDateService,
    private _pageLoadingService: PageLoadingService,
    private _dynamicContentSrv: DynamicContentService
  ) {
    super(_common);

    //URL検知
    this.closeWithUrlChange(this._router);
  }

  public SupportInformationInputType = SupportInformationInputType;
  public isInit = false;
  public id = this.constructor.name;

  //ペイロード定義
  public override payload: SupportInformationInputPayload | null = {};

  // 各画面で使用するマスタ
  public walkingAbilityMaster: Array<{ code: string; name: string }> = [];
  public wheelchairTypeMaster: Array<{ code: string; name: string }> = [];

  // MSG1678: 妊婦情報はサービシングで登録できることを案内する
  public dynamicItem?: AlertMessageItem;

  /**
   * ngOnDestroyにunsubscribeを実行
   */
  private _subscriptions: Subscription = new Subscription();

  /**
   * 次へボタン表示判定
   * @returns 表示可否
   */
  public isNext() {
    switch (this.type) {
      case SupportInformationInputType.SPECIAL_ASSISTANCE:
        if (this.specialAssistance.degreeOfWalking || this.specialAssistance.pregnant) {
          return true;
        }
        break;
      case SupportInformationInputType.WALKING_ABILITY:
        return true;
      case SupportInformationInputType.WHEELCHAIRS:
        if (this.wheelchairs.willBeCheckedIn || this.specialAssistance.pregnant) {
          return true;
        }
        break;
      case SupportInformationInputType.FOLDING_TYPE:
        return true;
      case SupportInformationInputType.WHEELCHAIR_TYPE:
        if (this.specialAssistance.pregnant) {
          return true;
        }
        break;
    }
    return false;
  }

  /**
   * 初期表示処理
   */
  init(): void {
    const lang = this._common.aswContextStoreService.aswContextData.lang;
    this.subscribeService(
      'supportInformationInputComponentMasterGet',
      this._aswMaserService.load(
        [
          { key: 'ListData_All', fileName: 'ListData_All' },
          {
            key: 'Country_WithPosCountryByContactTelNumberCountryFlg',
            fileName: `Country_WithPosCountryByContactTelNumberCountryFlg_${lang}`,
          },
          {
            key: 'Country_CountryI18n_All',
            fileName: `Country_CountryI18n_All_${lang}`,
          },
          { key: 'countryAll', fileName: 'Country_All' },
          { key: 'langCodeConvert_All', fileName: 'LangCodeConvert_All' },
        ],
        true
      ),
      ([data, PosCountry, PosCountryJp, country, langCodeConvert]) => {
        this.deleteSubscription('supportInformationInputComponentMasterGet');
        const lang = this._common.aswContextStoreService.aswContextData.lang;
        const appListData = getApplyListData(data ?? [], this._sysDate.getSystemDate());
        const posCode = this._common.aswContextStoreService.aswContextData.posCountryCode;
        this.wheelchairTypeMaster = getKeyListData(appListData, 'PD_960', lang).map((list) => {
          return {
            code: wheelchairBatteryApi(list.value),
            name: list.display_content,
          };
        });
        this.walkingAbilityMaster = getKeyListData(appListData, 'PD_006', lang).map((list) => {
          return {
            code: list.value,
            name: list.display_content,
          };
        });
        this.type = SupportInformationInputType.SPECIAL_ASSISTANCE;
        this.refresh();
      }
    );
    this._subscriptions.add(
      this._dynamicContentSrv
        .getDynamicContent$(true)
        .pipe(
          filter((data): data is DynamicContent => !!data),
          map((content) => content[DynamicContentType.ALERT_INFOMATION_NOT_CHANGE]),
          take(1)
        )
        .subscribe((content) => {
          if (content.includes('MSG1678')) {
            this.dynamicItem = {
              contentHtml: 'MSG1678',
              isCloseEnable: false,
              alertType: AlertType.INFOMATION,
            };
          }
        })
    );
  }

  reload(): void {}

  destroy(): void {
    this._subscriptions.unsubscribe();
  }

  public type: SupportInformationInputType = SupportInformationInputType.UNKNOWN;
  public specialAssistance: SupportInformationInputSpecialAssistanceModel =
    this._supportInformationInputStoreService.supportInformationInputData.specialAssistance;
  public walkingAbility: SupportInformationInputWalkingAbilityModel =
    this._supportInformationInputStoreService.supportInformationInputData.walkingAbility;
  public wheelchairs: SupportInformationInputWheelchairsModel =
    this._supportInformationInputStoreService.supportInformationInputData.wheelchairs;
  public foldingType: SupportInformationInputFoldingTypeModel =
    this._supportInformationInputStoreService.supportInformationInputData.foldingType;
  public wheelchairType: SupportInformationInputWheelchairTypeModel =
    this._supportInformationInputStoreService.supportInformationInputData.wheelchairType;
  public pregnant: SupportInformationInputPregnantModel =
    this._supportInformationInputStoreService.supportInformationInputData.pregnant;

  //サブコンポーネント
  @ViewChild('specialAssistanceCom') specialAssistanceCom?: SupportInformationInputSpecialAssistanceComponent;
  @ViewChild('walkingAbilityCom') walkingAbilityCom?: SupportInformationInputWalkingAbilityComponent;
  @ViewChild('wheelchairsCom') wheelchairsCom?: SupportInformationInputWheelchairsComponent;
  @ViewChild('foldingTypeCom') foldingTypeCom?: SupportInformationInputFoldingTypeComponent;
  @ViewChild('wheelchairTypeCom') wheelchairTypeCom?: SupportInformationInputWheelchairTypeComponent;

  refresh() {
    this.isInit = true;
    this.changeDetectorRef.markForCheck();
  }

  /**
   * 次へボタン押下処理
   */
  clickNext() {
    this._pageLoadingService.startLoading();
    this.allApply();
    switch (this.type) {
      case SupportInformationInputType.SPECIAL_ASSISTANCE:
        if (this.specialAssistance.degreeOfWalking) {
          this.type = SupportInformationInputType.WALKING_ABILITY;
        }
        break;
      case SupportInformationInputType.WALKING_ABILITY:
        if (this.walkingAbilityCom && this.walkingAbilityCom.isError()) {
          break;
        }
        this.type = SupportInformationInputType.WHEELCHAIRS;
        break;
      case SupportInformationInputType.WHEELCHAIRS:
        if (this.wheelchairsCom && this.wheelchairsCom.isError()) {
          break;
        }
        if (this.wheelchairs.willBeCheckedIn) {
          this.type = SupportInformationInputType.FOLDING_TYPE;
        }
        break;
      case SupportInformationInputType.FOLDING_TYPE:
        if (this.foldingTypeCom) {
          if (this.foldingTypeCom.isError()) {
            this.foldingTypeCom.enableValidOn();
            break;
          }
        }
        this.type = SupportInformationInputType.WHEELCHAIR_TYPE;
        break;
      case SupportInformationInputType.WHEELCHAIR_TYPE:
        if (this.wheelchairTypeCom && this.wheelchairTypeCom.isError()) {
          break;
        }
        break;
      default:
        break;
    }
    this._pageLoadingService.endLoading();
    this.changeDetectorRef.markForCheck();
  }

  /**
   * 戻るボタン押下処理
   */
  clickBack() {
    this._pageLoadingService.startLoading();
    this.allApply();
    switch (this.type) {
      case SupportInformationInputType.SPECIAL_ASSISTANCE:
        this.type = SupportInformationInputType.WHEELCHAIR_TYPE;
        break;
      case SupportInformationInputType.WALKING_ABILITY:
        this.type = SupportInformationInputType.SPECIAL_ASSISTANCE;
        break;
      case SupportInformationInputType.WHEELCHAIRS:
        this.type = SupportInformationInputType.WALKING_ABILITY;
        break;
      case SupportInformationInputType.FOLDING_TYPE:
        this.type = SupportInformationInputType.WHEELCHAIRS;
        break;
      case SupportInformationInputType.WHEELCHAIR_TYPE:
        this.type = SupportInformationInputType.FOLDING_TYPE;
        break;
      default:
        break;
    }
    this._pageLoadingService.endLoading();
    this.changeDetectorRef.markForCheck();
  }

  /**
   * 適用ボタン押下処理
   */
  clickSubmit() {
    if (this.allApply()) {
      return;
    }
    const value: SupportInformationInputState = {
      specialAssistance: this.specialAssistance,
      walkingAbility: this.walkingAbility,
      wheelchairs: this.wheelchairs,
      foldingType: this.foldingType,
      wheelchairType: this.wheelchairType,
      pregnant: this.pregnant,
    };
    this._supportInformationInputStoreService.setSupportInformationInput(value);
    this.close(value);
  }

  /**
   * サブコンポーネントの値をすべて適用しエラーチェックする
   * @return エラー可否
   */
  allApply(): boolean {
    let error = false;
    if (this.specialAssistanceCom) {
      this.specialAssistanceCom.apply();
    }
    if (this.walkingAbilityCom) {
      this.walkingAbilityCom.apply();
      error = this.walkingAbilityCom.isError();
    }
    if (this.wheelchairsCom) {
      this.wheelchairsCom.apply();
      error = this.wheelchairsCom.isError();
    }
    if (this.foldingTypeCom) {
      this.foldingTypeCom.apply();
      error = this.foldingTypeCom.isError();
    }
    if (this.wheelchairTypeCom) {
      this.wheelchairTypeCom.apply();
      error = this.wheelchairTypeCom.isError();
    }
    return error;
  }

  /**
   * 閉じるボタン押下処理
   */
  clickClose() {
    this.close();
  }
}
