/**
 * モーダルの表示タイプ
 * @param TYPE1 : PC:画面中央 TAB:画面中央  SP:画面下,
 * @param TYPE2 : PC:画面中央 TAB:画面下	  SP:画面下,
 * @param TYPE3 : PC:画面右   TAB:画面右	  SP:画面下,
 * @param TYPE4 : PC:画面右   TAB:画面下	  SP:画面下,
 * @param TYPE5 : PC:画面左   TAB:画面左	  SP:画面下,
 * @param TYPE6 : PC:画面左   TAB:画面下	  SP:画面下,
 * @param TYPE7 : PC:画面下   TAB:画面下	  SP:画面下,
 * @param TYPE8 : PC:画面右   TAB:フル画面	SP:フル画面,
 * @param TYPE9 : PC:画面中央 TAB:画面中央	SP:画面中央,
 * @param TYPE10 : PC:画面右  TAB:画面右	  SP:フル画面,
 */
export type ModalType = (typeof ModalType)[keyof typeof ModalType];
export const ModalType = {
  TYPE1: 0,
  TYPE2: 1,
  TYPE3: 2,
  TYPE4: 3,
  TYPE5: 4,
  TYPE6: 5,
  TYPE7: 6,
  TYPE8: 7,
  TYPE9: 8,
  TYPE10: 9,
} as const;

export type LModalClassType = (typeof LModalClassType)[keyof typeof LModalClassType];
export const LModalClassType = {
  TYPE1: 'l-modal01 is-open display-none-to-inline',
  TYPE2: 'l-modal02 is-open display-none-to-inline',
  TYPE3: 'l-modal03 is-open display-none-to-inline',
  TYPE4: 'l-modal04 is-open display-none-to-inline',
  TYPE5: 'l-modal05 is-open display-none-to-inline',
  TYPE6: 'l-modal06 is-open display-none-to-inline',
  TYPE7: 'l-modal07 is-open display-none-to-inline',
  TYPE8: 'l-modal08 is-open display-none-to-inline',
  TYPE9: 'l-modal09 is-open display-none-to-inline',
  TYPE10: 'l-modal10 is-open display-none-to-inline',
} as const;
export type LModalBgClassType = (typeof LModalBgClassType)[keyof typeof LModalBgClassType];
export const LModalBgClassType = {
  TYPE1: 'l-modal01__bg',
  TYPE2: 'l-modal02__bg',
  TYPE3: 'l-modal03__bg',
  TYPE4: 'l-modal04__bg',
  TYPE5: 'l-modal05__bg',
  TYPE6: 'l-modal06__bg',
  TYPE7: 'l-modal07__bg',
  TYPE8: 'l-modal08__bg',
  TYPE9: 'l-modal09__bg',
  TYPE10: 'l-modal10__bg',
} as const;
export type LModalInnerClassType = (typeof LModalInnerClassType)[keyof typeof LModalInnerClassType];
export const LModalInnerClassType = {
  TYPE1: 'l-modal01__inner',
  TYPE2: 'l-modal02__inner',
  TYPE3: 'l-modal03__inner',
  TYPE4: 'l-modal04__inner',
  TYPE5: 'l-modal05__inner',
  TYPE6: 'l-modal06__inner',
  TYPE7: 'l-modal07__inner',
  TYPE8: 'l-modal08__inner',
  TYPE9: 'l-modal09__inner',
  TYPE10: 'l-modal10__inner',
} as const;
export type LModalContentsClassType = (typeof LModalContentsClassType)[keyof typeof LModalContentsClassType];
export const LModalContentsClassType = {
  TYPE1: 'l-modal01__contents',
  TYPE2: 'l-modal02__contents',
  TYPE3: 'l-modal03__contents',
  TYPE4: 'l-modal04__contents',
  TYPE5: 'l-modal05__contents',
  TYPE6: 'l-modal06__contents',
  TYPE7: 'l-modal07__contents',
  TYPE8: 'l-modal08__contents',
  TYPE9: 'l-modal09__contents',
  TYPE10: 'l-modal10__contents',
} as const;
export type LModalContentsWidthType = (typeof LModalContentsWidthType)[keyof typeof LModalContentsWidthType];
export const LModalContentsWidthType = {
  NONE: '',
  MODAL_TAB_W345: 'u-modal-size-tb-345',
  MODAL_TAB_W384: 'u-modal-size-tb-384',
  MODAL_TAB_W540: 'u-modal-size-tb-540',
  MODAL_TAB_W768: 'u-modal-size-tb-768',
  MODAL_PC_W500: 'u-modal-size-pc-500',
  MODAL_PC_W600: 'u-modal-size-pc-600',
  MODAL_PC_W768: 'u-modal-size-pc-768',
  MODAL_PC_W1000: 'u-modal-size-pc-1000',
} as const;

export type LModalHeaderClassType = (typeof LModalHeaderClassType)[keyof typeof LModalHeaderClassType];
export const LModalHeaderClassType = {
  TYPE1: 'l-modal01__header',
  TYPE2: 'l-modal02__header',
  TYPE3: 'l-modal03__header',
  TYPE4: 'l-modal04__header',
  TYPE5: 'l-modal05__header',
  TYPE6: 'l-modal06__header',
  TYPE7: 'l-modal07__header',
  TYPE8: 'l-modal08__header',
  TYPE9: 'l-modal09__header',
  TYPE10: 'l-modal10__header',
} as const;

export type LModalBodyClassType = (typeof LModalBodyClassType)[keyof typeof LModalBodyClassType];
export const LModalBodyClassType = {
  TYPE1: 'l-modal01__body',
  TYPE2: 'l-modal02__body',
  TYPE3: 'l-modal03__body',
  TYPE4: 'l-modal04__body',
  TYPE5: 'l-modal05__body',
  TYPE6: 'l-modal06__body',
  TYPE7: 'l-modal07__body',
  TYPE8: 'l-modal08__body',
  TYPE9: 'l-modal09__body',
  TYPE10: 'l-modal10__body',
} as const;

export type LModalFooterClassType = (typeof LModalFooterClassType)[keyof typeof LModalFooterClassType];
export const LModalFooterClassType = {
  TYPE1: 'l-modal01__footer',
  TYPE2: 'l-modal02__footer',
  TYPE3: 'l-modal03__footer',
  TYPE4: 'l-modal04__footer',
  TYPE5: 'l-modal05__footer',
  TYPE6: 'l-modal06__footer',
  TYPE7: 'l-modal07__footer',
  TYPE8: 'l-modal08__footer',
  TYPE9: 'l-modal09__footer',
  TYPE10: 'l-modal10__footer',
} as const;

export type ModalTypeClass = {
  lmodalClass: LModalClassType;
  lmodalBgClass: LModalBgClassType;
  lmodalInnerClass: LModalInnerClassType;
  lmodalContentsClass: LModalContentsClassType;
  LModalContentsClassWidth: LModalContentsWidthType;
  lmodalHeaderClass: LModalHeaderClassType;
  lmodalBodyClass: LModalBodyClassType;
  lmodalFooterClass: LModalFooterClassType;
};
export const ModalTypeClassValue: ModalTypeClass[] = [
  {
    lmodalClass: LModalClassType.TYPE1,
    lmodalBgClass: LModalBgClassType.TYPE1,
    lmodalInnerClass: LModalInnerClassType.TYPE1,
    lmodalContentsClass: LModalContentsClassType.TYPE1,
    LModalContentsClassWidth: LModalContentsWidthType.MODAL_TAB_W384,
    lmodalHeaderClass: LModalHeaderClassType.TYPE1,
    lmodalBodyClass: LModalBodyClassType.TYPE1,
    lmodalFooterClass: LModalFooterClassType.TYPE1,
  },
  {
    lmodalClass: LModalClassType.TYPE2,
    lmodalBgClass: LModalBgClassType.TYPE2,
    lmodalInnerClass: LModalInnerClassType.TYPE2,
    lmodalContentsClass: LModalContentsClassType.TYPE2,
    LModalContentsClassWidth: LModalContentsWidthType.NONE,
    lmodalHeaderClass: LModalHeaderClassType.TYPE2,
    lmodalBodyClass: LModalBodyClassType.TYPE2,
    lmodalFooterClass: LModalFooterClassType.TYPE2,
  },
  {
    lmodalClass: LModalClassType.TYPE3,
    lmodalBgClass: LModalBgClassType.TYPE3,
    lmodalInnerClass: LModalInnerClassType.TYPE3,
    lmodalContentsClass: LModalContentsClassType.TYPE3,
    LModalContentsClassWidth: LModalContentsWidthType.NONE,
    lmodalHeaderClass: LModalHeaderClassType.TYPE3,
    lmodalBodyClass: LModalBodyClassType.TYPE3,
    lmodalFooterClass: LModalFooterClassType.TYPE3,
  },
  {
    lmodalClass: LModalClassType.TYPE4,
    lmodalBgClass: LModalBgClassType.TYPE4,
    lmodalInnerClass: LModalInnerClassType.TYPE4,
    lmodalContentsClass: LModalContentsClassType.TYPE4,
    LModalContentsClassWidth: LModalContentsWidthType.MODAL_PC_W768,
    lmodalHeaderClass: LModalHeaderClassType.TYPE4,
    lmodalBodyClass: LModalBodyClassType.TYPE4,
    lmodalFooterClass: LModalFooterClassType.TYPE4,
  },
  {
    lmodalClass: LModalClassType.TYPE5,
    lmodalBgClass: LModalBgClassType.TYPE5,
    lmodalInnerClass: LModalInnerClassType.TYPE5,
    lmodalContentsClass: LModalContentsClassType.TYPE5,
    LModalContentsClassWidth: LModalContentsWidthType.MODAL_TAB_W768,
    lmodalHeaderClass: LModalHeaderClassType.TYPE5,
    lmodalBodyClass: LModalBodyClassType.TYPE5,
    lmodalFooterClass: LModalFooterClassType.TYPE5,
  },
  {
    lmodalClass: LModalClassType.TYPE6,
    lmodalBgClass: LModalBgClassType.TYPE6,
    lmodalInnerClass: LModalInnerClassType.TYPE6,
    lmodalContentsClass: LModalContentsClassType.TYPE6,
    LModalContentsClassWidth: LModalContentsWidthType.MODAL_PC_W768,
    lmodalHeaderClass: LModalHeaderClassType.TYPE6,
    lmodalBodyClass: LModalBodyClassType.TYPE6,
    lmodalFooterClass: LModalFooterClassType.TYPE6,
  },
  {
    lmodalClass: LModalClassType.TYPE7,
    lmodalBgClass: LModalBgClassType.TYPE7,
    lmodalInnerClass: LModalInnerClassType.TYPE7,
    lmodalContentsClass: LModalContentsClassType.TYPE7,
    LModalContentsClassWidth: LModalContentsWidthType.MODAL_PC_W768,
    lmodalHeaderClass: LModalHeaderClassType.TYPE7,
    lmodalBodyClass: LModalBodyClassType.TYPE7,
    lmodalFooterClass: LModalFooterClassType.TYPE7,
  },
  {
    lmodalClass: LModalClassType.TYPE8,
    lmodalBgClass: LModalBgClassType.TYPE8,
    lmodalInnerClass: LModalInnerClassType.TYPE8,
    lmodalContentsClass: LModalContentsClassType.TYPE8,
    LModalContentsClassWidth: LModalContentsWidthType.MODAL_PC_W768,
    lmodalHeaderClass: LModalHeaderClassType.TYPE8,
    lmodalBodyClass: LModalBodyClassType.TYPE8,
    lmodalFooterClass: LModalFooterClassType.TYPE8,
  },
  {
    lmodalClass: LModalClassType.TYPE9,
    lmodalBgClass: LModalBgClassType.TYPE9,
    lmodalInnerClass: LModalInnerClassType.TYPE9,
    lmodalContentsClass: LModalContentsClassType.TYPE9,
    LModalContentsClassWidth: LModalContentsWidthType.NONE,
    lmodalHeaderClass: LModalHeaderClassType.TYPE9,
    lmodalBodyClass: LModalBodyClassType.TYPE9,
    lmodalFooterClass: LModalFooterClassType.TYPE9,
  },
  {
    lmodalClass: LModalClassType.TYPE10,
    lmodalBgClass: LModalBgClassType.TYPE10,
    lmodalInnerClass: LModalInnerClassType.TYPE10,
    lmodalContentsClass: LModalContentsClassType.TYPE10,
    LModalContentsClassWidth: LModalContentsWidthType.MODAL_TAB_W768,
    lmodalHeaderClass: LModalHeaderClassType.TYPE10,
    lmodalBodyClass: LModalBodyClassType.TYPE10,
    lmodalFooterClass: LModalFooterClassType.TYPE10,
  },
];
