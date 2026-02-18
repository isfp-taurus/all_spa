import { ModalBlockParts } from '@lib/services/modal/modal-part.state.';
import { PaymentMethodModalComponent } from './payment-method-modal.component';
import { GetOrderResponseData } from 'src/sdk-servicing';
import { LModalContentsWidthType, ModalType } from '@lib/components/shared-ui-components/modal/modal.state';
export interface PaymentMethodPayload {
  pnr: GetOrderResponseData;
}
export function paymentMethodPayloadParts(payload: PaymentMethodPayload): ModalBlockParts {
  return {
    id: 'payment-Method-modal',
    block: PaymentMethodModalComponent,
    closeBackEnable: false,
    type: ModalType.TYPE2,
    modalWidth: LModalContentsWidthType.MODAL_PC_W600,
    payload,
  };
}
