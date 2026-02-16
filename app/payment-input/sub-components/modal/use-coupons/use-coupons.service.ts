import { Injectable } from '@angular/core';
import { SupportClass } from '@lib/components/support-class';
import { AswServiceModel } from '@lib/interfaces';
import { CommonLibService } from '@lib/services/common-lib/common-lib.service';
import { OrdersRepriceOrderRequest } from 'src/sdk-reservation';
import { PreviousScreenHandoverInformation } from '../../../container/payment-input-cont.state';
import { ErrorCodeConstants } from '@conf/app.constants';

/**
 * プロモーションコード入力モーダルのサービスクラス
 */
@Injectable()
export class UseCouponsService extends SupportClass {
  constructor(private _common: CommonLibService) {
    super();
  }

  destroy() {}

  /**
   * 購入時運賃再計算API実行のためのパラメータを作成
   * @param serviceCommon // サービス共通情報
   * @param prevScreenInfo // 前画面引継ぎ情報
   * @param cartId // カートID
   * @param promotionCode // プロモーションコード
   * @returns リクエストパラメータ
   */
  getRepriceOrderRequestParam(
    serviceCommon: AswServiceModel | null,
    prevScreenInfo: PreviousScreenHandoverInformation | null,
    cartId: string,
    promotionCode: string
  ): OrdersRepriceOrderRequest {
    return {
      orderId: prevScreenInfo?.orderId ?? serviceCommon?.orderId ?? '',
      credential: {
        firstName: prevScreenInfo?.credential.firstName ?? serviceCommon?.firstName ?? '',
        lastName: prevScreenInfo?.credential.lastName ?? serviceCommon?.lastName ?? '',
      },
      cartId: cartId,
      promotion: {
        code: promotionCode,
      },
    };
  }

  /**
   * APIエラーコードをエラーメッセージIDに変換する
   * @param errCode APIエラーコード
   * @returns エラーメッセージID
   */
  convertErrorCodeToErrorMessageId(errCode: string): string {
    let id = '';
    switch (errCode) {
      case ErrorCodeConstants.ERROR_CODES.EBAZ000201: // PNRが発券期限切れであった場合
        id = 'E0564'; // 発券期限切れの旨
        break;
      case ErrorCodeConstants.ERROR_CODES.EBAZ000202: // 購入対象のPNRが購入不可PNRであった場合
        id = 'E0754'; // 購入不可PNRである旨
        break;
      case ErrorCodeConstants.ERROR_CODES.EBAZ000215: // AAMプロモーションコードではない
      case ErrorCodeConstants.ERROR_CODES.EBAZ000218: // プロモーションコードの適用が失敗した
        id = 'E0232'; // AAMプロモーションコードではない旨
        break;
      default:
        break;
    }
    return id;
  }
}
