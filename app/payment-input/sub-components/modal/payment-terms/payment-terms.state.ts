import { PaymentMethodsType } from '@common/interfaces/common/payment-methods';
import { LModalContentsWidthType, ModalType } from '@lib/components';
import { ModalBlockParts } from '@lib/services';
import { PaymentTermsComponent } from './payment-terms.component';

/**
 * 支払規約モーダル　ペイロード
 * @param paymentMethod 選択された支払方法
 */
export interface PaymentTermsPayload {
  message: string;
}

/**
 * 支払規約モーダルのパラメータ
 */
export function paymentTermsModalParts(): ModalBlockParts {
  return {
    id: 'paymentTermsModalParts',
    block: PaymentTermsComponent,
    closeBackEnable: true,
    type: ModalType.TYPE2,
    modalWidth: LModalContentsWidthType.MODAL_PC_W1000,
  };
}
