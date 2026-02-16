import { ModalType, LModalContentsWidthType } from '@lib/components';
import { ModalIdParts } from '@lib/services';
import { AgreementFooterComponent } from './agreement-footer.component';
import { AgreementHeaderComponent } from './agreement-header.component';
import { AgreementComponent } from './agreement.component';

/**
 * モーダル ペイロード
 * @param isDisplayTerms 呼び出し元にて指定された規約表示要否
 * @param isDisplayAPF 呼び出し元にて指定されたAPF説明表示要否
 * @param thirdLanguageCode 呼び出し元にて指定された第3言語コード
 * @param previousFunctionId 呼び出し元にて指定された遷移元機能ID
 * @param previousPageId 呼び出し元にて指定された遷移元画面ID
 */

export interface AgreementPayload {
  isDisplayTerms?: boolean;
  isDisplayAPF?: boolean;
  thirdLanguageCode?: string;
  previousFunctionId?: string;
  previousPageId?: string;
}
/**
 * 規約画面 (R01-P043)
 * 呼び出しパラメータ
 * const part = agreementPayloadParts(),
 * this.modal.showSubModal(part),
 *}
 */
export function agreementPayloadParts(payload?: AgreementPayload): ModalIdParts {
  return {
    id: 'AgreementComponent',
    content: AgreementComponent,
    header: AgreementHeaderComponent,
    footer: AgreementFooterComponent,
    closeBackEnable: false,
    type: ModalType.TYPE2,
    modalWidth: LModalContentsWidthType.MODAL_PC_W1000,
    payload: payload,
  };
}
