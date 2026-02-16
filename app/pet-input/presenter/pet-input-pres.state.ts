import { ValidatorFn } from '@angular/forms';
import { AswValidators } from '@lib/helpers';
import { ValidationErrorInfo } from '@lib/interfaces';
import { CartsUpdatePetRakunoriRequestServicesPetDetailInnerCage } from '../../../sdk-reservation/model/cartsUpdatePetRakunoriRequestServicesPetDetailInnerCage';

// 持ち込みケージ奥行き入力バリデータ
export const PET_INPUT_DEPTH_VALIDATOR: ValidatorFn[] = [
  AswValidators.required({ params: { key: 0, value: 'label.depth' } }),
  AswValidators.numeric({ params: { key: 0, value: 'label.depth' } }),
  AswValidators.pattern({ pattern: '^.{0,3}$', params: { key: 0, value: 'label.depth' } }),
];

// 持ち込みケージ幅入力バリデータ
export const PET_INPUT_WIDTH_VALIDATOR: ValidatorFn[] = [
  AswValidators.required({ params: { key: 0, value: 'label.width' } }),
  AswValidators.numeric({ params: { key: 0, value: 'label.width' } }),
  AswValidators.pattern({ pattern: '^.{0,3}$', params: { key: 0, value: 'label.width' } }),
];

// 持ち込みケージ高さ入力バリデータ
export const PET_INPUT_HEIGHT_VALIDATOR: ValidatorFn[] = [
  AswValidators.required({ params: { key: 0, value: 'label.height' } }),
  AswValidators.numeric({ params: { key: 0, value: 'label.height' } }),
  AswValidators.pattern({ pattern: '^.{0,3}$', params: { key: 0, value: 'label.height' } }),
];

// 重量入力バリデータ
export const PET_INPUT_LENDING_WEIGHT_VALIDATOR: ValidatorFn[] = [
  AswValidators.required({ params: { key: 0, value: 'label.weightOfPet' } }),
  AswValidators.numeric({ params: { key: 0, value: 'label.weightOfPet' } }),
  AswValidators.pattern({ pattern: '^.{0,2}$', params: { key: 0, value: 'label.weightOfPet' } }),
];

export const PET_INPUT_CARRYON_WEIGHT_VALIDATOR: ValidatorFn[] = [
  AswValidators.required({ params: { key: 0, value: 'label.weightOfPetAndCage' } }),
  AswValidators.numeric({ params: { key: 0, value: 'label.weightOfPetAndCage' } }),
  AswValidators.pattern({ pattern: '^.{0,2}$', params: { key: 0, value: 'label.weightOfPetAndCage' } }),
];

/**
 * ペット情報入力フォームデータ構造
 */
export interface PetInputPetDetailForm {
  petType: string;
  cageType: string;
  depth?: number;
  height?: number;
  width?: number;
  lendingCageType?: CartsUpdatePetRakunoriRequestServicesPetDetailInnerCage.LendingCageTypeEnum;
  weight: number;
}

/**
 * ペット情報入力フォームエラーメッセージデータ構造
 */
export interface PetInputPetDetailFormErrorMessage {
  width: ValidationErrorInfo | string;
  depth: ValidationErrorInfo | string;
  height: ValidationErrorInfo | string;
  lending: ValidationErrorInfo | string;
}
