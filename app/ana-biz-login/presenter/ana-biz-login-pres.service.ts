import { Injectable } from '@angular/core';
import { RoutesResRoutes } from '@conf';
import { isAlphaNumeric, isNumeric } from '@lib/helpers';
import { ValidationErrorInfo } from '@lib/interfaces';
import { AuthorizationRequest } from 'src/sdk-authorization';

@Injectable()
export class AnaBizLoginPresService {
  constructor() {}

  /**
   * シームレスログインのURLを確認
   */
  public isSeamlessLoginURL(url: string): boolean {
    const urlObj = new URL(url);
    const slug = urlObj.pathname.split('/').at(-1);
    return slug === RoutesResRoutes.ANABIZ_SEAMLESS_LOGIN;
  }

  /**
   * シームレスログインケースのバリデーション
   * @param {AuthorizationRequest} authorizationRequestParam - ANA BizログインAPIリクエストデータ型
   * @returns {ValidationErrorInfo | null} - バリデーション結果
   */
  public validateSeamlessLoginParam(authorizationRequestParam: AuthorizationRequest): ValidationErrorInfo | null {
    const { companyOrOrganizationCode, companyPassword, connectionType, adminUserId, amcNumber, amcPassword } =
      authorizationRequestParam || {};

    if (connectionType !== AuthorizationRequest.ConnectionTypeEnum.Seamless) {
      return null;
    }
    // 企業IDまたは組織IDの必須チェック
    if (companyOrOrganizationCode) {
      // 英数字チェック
      if (!isAlphaNumeric(companyOrOrganizationCode)) {
        return {
          errorMsgId: 'E0005',
          params: [{ key: 0, value: 'label.companyAndOrganizationId' }],
        };
      }
      // 桁数チェック
      if (companyOrOrganizationCode.length > 10) {
        return {
          errorMsgId: 'E0346',
          params: [
            { key: 0, value: 'label.companyAndOrganizationId' },
            { key: 1, value: 10 },
          ],
        };
      }
    } else {
      return {
        errorMsgId: 'E0001',
        params: { key: 0, value: 'label.companyAndOrganizationId' },
      };
    }
    // 企業用パスワードの必須チェック
    if (companyPassword) {
      // 桁数チェック
      if (companyPassword.length > 20) {
        return {
          errorMsgId: 'E0346',
          params: [
            { key: 0, value: 'label.password' },
            { key: 1, value: 20 },
          ],
        };
      }
    } else {
      return {
        errorMsgId: 'E0001',
        params: { key: 0, value: 'label.password' },
      };
    }
    // 管理者ログイン
    if (adminUserId) {
      // 英数字チェック
      if (!isAlphaNumeric(adminUserId)) {
        return {
          errorMsgId: 'E0005',
          params: [{ key: 0, value: 'label.administratorId' }],
        };
      }
      // 桁数チェック
      if (adminUserId.length < 6 || adminUserId.length > 10) {
        return {
          errorMsgId: 'E0014',
          params: [
            { key: 0, value: 'label.administratorId' },
            { key: 1, value: 6 },
            { key: 2, value: 10 },
          ],
        };
      }
    }
    // AMC会員番号
    if (amcNumber) {
      // 数字チェック
      if (!isNumeric(amcNumber)) {
        return {
          errorMsgId: 'E0003',
          params: { key: 0, value: 'label.aNAMileageClubNumber' },
        };
      }
      // 桁数チェック
      if (amcNumber.length !== 10) {
        return {
          errorMsgId: 'E0009',
          params: [
            { key: 0, value: 'label.aNAMileageClubNumber' },
            { key: 1, value: 10 },
          ],
        };
      }
      // 必須チェック
      if (!amcPassword) {
        return {
          errorMsgId: 'E0001',
          params: [{ key: 0, value: 'label.password' }],
        };
      }
    }
    // AMC用パスワード
    if (amcPassword) {
      // 桁数チェック
      if (amcPassword.length > 20) {
        return {
          errorMsgId: 'E0346',
          params: [
            { key: 0, value: 'label.password' },
            { key: 1, value: 20 },
          ],
        };
      }
      // 必須チェック
      if (!amcNumber) {
        return {
          errorMsgId: 'E0001',
          params: [{ key: 0, value: 'label.aNAMileageClubNumber' }],
        };
      }
    }
    return null;
  }
}
