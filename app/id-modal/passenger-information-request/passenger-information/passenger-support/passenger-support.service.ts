import { Injectable } from '@angular/core';
import { string8ToDate, wheelchairBatteryApi, wheelchairBatteryValue } from '@common/helper';
import { MListData } from '@common/interfaces';
import { SupportInformationInputStoreService } from '@common/services';
import { SupportInformationInputState } from '@common/store';
import { SupportClass } from '@lib/components/support-class';
import { CommonLibService, ModalService } from '@lib/services';
import { CreateCartResponseDataPlanTravelerSupportsTraveler } from 'src/sdk-reservation';
import { supportInformationInputModalParts } from '../../modal/support-information-input/support-information-input-payload.state';
import {
  PassengerInformationRequestPassengerSupportData,
  PassengerInformationRequestPassengerSupportParts,
} from './passenger-support.state';
/**
 * サポート情報 service
 */
@Injectable()
export class PassengerInformationRequestPassengerSupportService extends SupportClass {
  constructor(
    private _common: CommonLibService,
    private _modalService: ModalService,
    private _supportInformationInputStoreService: SupportInformationInputStoreService
  ) {
    super();
  }

  destroy() {}

  /**
   * サポート情報 初期値の作成
   * @param pd006 リストデータPD_006 サポート情報の説明
   * @param pd020 リストデータPD_020 サポート情報　妊婦の現在の状態
   * @param pd960 リストデータPD_960 バッテリータイプの表示名称
   * @param support 搭乗者サポート情報
   * @returns サポート情報 初期値
   */
  createData(
    pd006: Array<MListData>,
    pd020: Array<MListData>,
    pd960: Array<MListData>,
    support?: CreateCartResponseDataPlanTravelerSupportsTraveler
  ): PassengerInformationRequestPassengerSupportData {
    const walkLevel = support?.walking?.degreeOfAssistance?.code ?? '';
    const bringWheelchair = support?.walking?.wheelChair?.isNeeded;
    const wheelchairFoldable = support?.walking?.wheelChair?.isFoldable;
    const wheelchairType = support?.walking?.wheelChair?.type ?? '';
    const wheelchairBatteryType = wheelchairBatteryValue(support?.walking?.wheelChair?.batteryType ?? '');
    const ret: PassengerInformationRequestPassengerSupportData = {
      walk: walkLevel !== '',
      blind: support?.blind?.isRequested ?? false,
      deaf: support?.deaf?.isRequested ?? false,
      isPregnant: !!support?.pregnant?.dueDate,
      walkLevel: walkLevel,
      walkLevelDisplayValue: pd006.find((pd) => pd.value === walkLevel)?.display_content ?? '',
      bringWheelchair: bringWheelchair,
      bringWheelchairDisplayValue: this.getBringWheelchairDisplayValue(bringWheelchair),
      wheelchairFoldable: wheelchairFoldable,
      wheelchairFoldableDisplayValue: this.getWheelchairFoldableDisplayValue(wheelchairFoldable),
      wheelchairType: wheelchairType,
      wheelchairTypeDisplayValue: this.getWheelchairTypeDisplayValue(wheelchairType),
      wheelchairBatteryType: wheelchairBatteryType,
      wheelchairBatteryTypeDisplayValue: pd960.find((pd) => pd.value === wheelchairBatteryType)?.display_content ?? '',
      wheelchairDepth: wheelchairFoldable ? 0 : support?.walking?.wheelChair?.depth ?? 0,
      wheelchairWidth: wheelchairFoldable ? 0 : support?.walking?.wheelChair?.width ?? 0,
      wheelchairHeight: wheelchairFoldable ? 0 : support?.walking?.wheelChair?.height ?? 0,
      wheelchairWeight: wheelchairFoldable ? 0 : support?.walking?.wheelChair?.weight ?? 0,
      isError: false,
      doctorName: support?.pregnant?.doctor?.name ?? '',
      doctorCountryPhoneExtension: support?.pregnant?.doctor?.phone?.countryPhoneExtension ?? '',
      doctorPhoneNumber: support?.pregnant?.doctor?.phone?.number ?? '',
      pregnantDueDate: support?.pregnant?.dueDate ? this.convertDueDate(support.pregnant.dueDate) : undefined,
      pregnantCondition: support?.pregnant?.condition ?? '',
      pregnantConditionDisplayValue:
        pd020.find((pd) => pd.value === support?.pregnant?.condition)?.display_content ?? '',
    };
    return ret;
  }
  /**
   * サポート情報 設定値の作成
   * @param pd006 リストデータPD_006 サポート情報の説明
   * @param pd020 リストデータPD_020 サポート情報　妊婦の現在の状態
   * @param pd960 リストデータPD_960 バッテリータイプの表示名称
   * @returns サポート情報 設定値
   */
  createParts(
    pd006: Array<MListData>,
    pd020: Array<MListData>,
    pd960: Array<MListData>
  ): PassengerInformationRequestPassengerSupportParts {
    return {
      pd006: pd006,
      pd020: pd020,
      pd960: pd960,
    };
  }

  /**
   * サポート情報の編集処理
   * @param data サポート情報
   * @param parts サポート情報入力データ
   * @param submitEvent 編集時のイベント
   */
  public editSupportInput(
    data: PassengerInformationRequestPassengerSupportData,
    parts: PassengerInformationRequestPassengerSupportParts,
    submitEvent: (value: PassengerInformationRequestPassengerSupportData) => void
  ) {
    const elementId = document.activeElement?.id ?? '';
    this._supportInformationInputStoreService.setSupportInformationInput({
      specialAssistance: {
        degreeOfWalking: data.walk,
        blind: data.blind,
        deaf: data.deaf,
        pregnant: data.isPregnant,
      },
      walkingAbility: {
        code: data.walkLevel ?? '',
      },
      wheelchairs: {
        willBeCheckedIn: data.bringWheelchair,
      },
      foldingType: {
        isFolding: data.wheelchairFoldable,
        depth: data.wheelchairDepth ?? 0,
        width: data.wheelchairWidth ?? 0,
        height: data.wheelchairHeight ?? 0,
        weight: data.wheelchairWeight ?? 0,
      },
      wheelchairType: {
        type: data.wheelchairType ?? '',
        batteryType: wheelchairBatteryApi(data.wheelchairBatteryType),
      },
      pregnant: {
        doctorName: data.doctorName,
        doctorCountryPhoneExtension: data.doctorCountryPhoneExtension,
        doctorPhoneNumber: data.doctorPhoneNumber,
        pregnantDueDate: data.pregnantDueDate,
        pregnantCondition: data.pregnantCondition,
      },
    });
    this.dispSuportInputModal(parts, elementId, submitEvent);
  }

  /**
   * サポート情報入力モーダルの表示
   * @param parts サポート情報入力データ
   * @param submitEvent 編集時のイベント
   */
  dispSuportInputModal(
    parts: PassengerInformationRequestPassengerSupportParts,
    elementId: string,
    submitEvent: (value: PassengerInformationRequestPassengerSupportData) => void
  ) {
    const modalparts = supportInformationInputModalParts();
    modalparts.closeEvent = (value?: SupportInformationInputState) => {
      if (value) {
        //　適用ボタンを押されて閉じた場合
        const data: PassengerInformationRequestPassengerSupportData = {
          walk: value.specialAssistance.degreeOfWalking,
          blind: value.specialAssistance.blind,
          deaf: value.specialAssistance.deaf,
          isPregnant: value.specialAssistance.pregnant,
          walkLevel: value.walkingAbility.code,
          walkLevelDisplayValue:
            parts.pd006.find((pd) => pd.value === value.walkingAbility.code)?.display_content ?? '',
          bringWheelchair: value.wheelchairs.willBeCheckedIn ?? false,
          bringWheelchairDisplayValue: this.getBringWheelchairDisplayValue(value.wheelchairs.willBeCheckedIn),
          wheelchairFoldable: value.foldingType.isFolding ?? false,
          wheelchairFoldableDisplayValue: this.getWheelchairFoldableDisplayValue(value.foldingType.isFolding),
          wheelchairType: value.wheelchairType.type,
          wheelchairTypeDisplayValue: this.getWheelchairTypeDisplayValue(value.wheelchairType.type),
          wheelchairBatteryType: wheelchairBatteryValue(value.wheelchairType.batteryType),
          wheelchairBatteryTypeDisplayValue:
            parts.pd960.find((pd) => pd.value === wheelchairBatteryValue(value.wheelchairType.batteryType))
              ?.display_content ?? '',
          wheelchairDepth: value.foldingType.depth,
          wheelchairWidth: value.foldingType.width,
          wheelchairHeight: value.foldingType.height,
          wheelchairWeight: value.foldingType.weight,
          isError: false,
          doctorName: value.pregnant.doctorName,
          doctorCountryPhoneExtension: value.pregnant.doctorCountryPhoneExtension,
          doctorPhoneNumber: value.pregnant.doctorPhoneNumber,
          pregnantDueDate: value.pregnant.pregnantDueDate,
          pregnantCondition: value.pregnant.pregnantCondition,
          pregnantConditionDisplayValue:
            parts.pd020.find((pd) => pd.value === value.pregnant.pregnantCondition)?.display_content ?? '',
        };
        submitEvent(data);
      }
      // 閉じた際にフォーカスを戻す
      const elm = document.getElementById(elementId);
      if (elm) {
        elm.focus();
      }
    };
    this._modalService.showSubModal(modalparts);
  }

  /**
   * 車いす持ち込みラベルの取得
   * @param bringWheelchair 車いす持ち込みフラグ
   * @returns 車いす持ち込みラベル
   */
  getBringWheelchairDisplayValue(bringWheelchair?: boolean) {
    return bringWheelchair ? 'label.willBeCheckedIn' : 'label.willNotBeCheckedIn';
  }

  /**
   * 車いす折り畳みラベルの取得
   * @param wheelchairFoldable 車いす折り畳みフラグ
   * @returns 車いす折り畳みラベル
   */
  getWheelchairFoldableDisplayValue(wheelchairFoldable?: boolean) {
    return wheelchairFoldable ? 'label.foldable' : 'label.notFoldable';
  }

  /**
   * 車いす種別ラベルの取得
   * @param wheelchairType 車いす種別
   * @returns 車いす種別ラベル
   */
  getWheelchairTypeDisplayValue(wheelchairType: string) {
    if (wheelchairType === 'manual') {
      return 'label.manual';
    }
    return wheelchairType === 'battery' ? 'label.electric' : '';
  }

  /**
   * 出産予定日の文字列⇒Date変換
   * @param dueDate 出産予定日 string型
   * @returns 出産予定日 Date
   */
  convertDueDate(dueDate: string) {
    const parseDate = new Date(dueDate);
    if (toString.call(parseDate) === `[object Date]` && parseDate.toString() !== 'Invalid Date') {
      return parseDate;
    }
    return undefined;
  }
}
