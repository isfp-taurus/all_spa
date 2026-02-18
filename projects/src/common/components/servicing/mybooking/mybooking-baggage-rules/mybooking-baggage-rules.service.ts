import { Injectable } from '@angular/core';
import { RamlServicesBaggageFirst } from '@common/interfaces';
import { SupportClass } from '@lib/components/support-class';
import { StaticMsgPipe } from '@lib/pipes';
import { AswMasterService, CommonLibService } from '@lib/services';
import { TravelerNamesInner } from 'src/sdk-servicing';
import { MybookingBaggageRulesMastarData } from './mybooking-baggage-rules.state';
import { isStringEmpty } from '@common/helper';

/**
 * 手荷物ルール部品 サービス
 */
@Injectable()
export class MybookingBaggageRulesService extends SupportClass {
  constructor(private _common: CommonLibService, private _master: AswMasterService, private _staticMsg: StaticMsgPipe) {
    super();
  }

  destroy() {}

  /**
   * 必要なキャッシュを取得する
   * @param event キャッシュ取得後処理
   */
  getCacheMaster(event: (master: MybookingBaggageRulesMastarData) => void) {
    const lang = this._common.aswContextStoreService.aswContextData.lang;
    const langPrefix = '/' + lang;
    this.subscribeService(
      'MybookingBaggageRulesCache',
      this._master.load(
        [
          { key: 'm_airport_i18n', fileName: 'm_airport_i18n' + langPrefix },
          { key: 'm_airline_i18n', fileName: 'm_airline_i18n' + langPrefix },
        ],
        true
      ),
      ([airport, airline]) => {
        this.deleteSubscription('MybookingBaggageRulesCache');
        const master: MybookingBaggageRulesMastarData = {
          airport: airport,
          airline: airline,
        };
        event(master);
      }
    );
  }

  /**
   * 手荷物申込モーダル表示表示フラグを取得する
   * @param baggaheBound 手荷物サービスのバウンドリスト
   * @param airBoundId バウンドID
   * @returns 表示文字列
   */
  isBaggaheAvailable(baggaheFirst: RamlServicesBaggageFirst, airBoundId: string): boolean {
    if (!isStringEmpty(airBoundId)) {
      return baggaheFirst?.[airBoundId]?.isAvailable;
    }
    return false;
  }

  /**
   * 手荷物申込モーダル表示に表示するラベルを取得する
   * @param isAvailable 表示有無
   * @returns 表示文字列
   */
  getAvailableLabel(isAvailable: boolean) {
    if (!isAvailable) {
      return this._staticMsg.transform('label.notApplicableOrApplied');
    }
    return this._staticMsg.transform('label.forwardRequestPage');
  }

  /**
   * 重さ表示のラベルを取得
   * @param weight 運賃ルール・手荷物情報取得APIレスポンスの手荷物ルールの重さ
   * @returns 表示文字列
   */
  getWeightLabel(weight?: number): string {
    // APIからは23か32しか返らない仕様のようですが念のため範囲で指定
    if (!weight) {
      return '';
    }
    if (weight <= 10) {
      return this._staticMsg.transform('message.freeCarryOnBaggageAllowanceWeight.10kg');
    }
    if (weight <= 23) {
      return this._staticMsg.transform('message.freeBaggageAllowanceWeight.23kg');
    }
    return this._staticMsg.transform('message.freeBaggageAllowanceWeight.32kg');
  }

  /**
   * 手荷物用ラベル
   * @param index 手荷物のインデックス
   * @returns 表示文字列
   */
  getBagLabel(index: number): string {
    switch (index) {
      case 0:
        return this._staticMsg.transform('label.1stPiece');
      case 1:
        return this._staticMsg.transform('label.2ndPiece');
      default:
        return ''; //３個目以降の荷物無いはずなのでラベルなし
    }
  }

  /**
   * 表示する手荷物ルールの説明文を取得
   * @param tripType 旅程種別
   * @param isNhGroupOperating NHグループフラグ
   * @returns 手荷物ルールの説明文
   */
  getTripruleDetaile(tripType: string, isNhGroupOperating: boolean) {
    switch (tripType) {
      case 'domestic': //日本国内単独旅程
        return this._staticMsg.transform('message.baggageAllowance.details');
      case 'international':
        if (isNhGroupOperating) {
          return this._staticMsg.transform('message.baggageAllowanceNh.details');
        } else {
          return this._staticMsg.transform('message.callCenter');
        }
      default:
        return this._staticMsg.transform('message.callCenter');
    }
  }

  /**
   * 搭乗者名の作成
   * @param name 搭乗者名情報
   * @returns 表示文字列
   */
  makeNames(name?: TravelerNamesInner): string {
    return name
      ? name.title + ' ' + name.firstName + ' ' + (name.middleName ? name.middleName + ' ' : '') + name.lastName
      : '';
  }
}
