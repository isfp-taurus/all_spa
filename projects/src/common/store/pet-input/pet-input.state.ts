import { AsyncStoreItem } from '@lib/store';
import { Traveler } from 'src/sdk-reservation';
import { CartsUpdatePetRakunoriRequestServicesPetDetailInner } from 'src/sdk-reservation/model/cartsUpdatePetRakunoriRequestServicesPetDetailInner';

/**
 * PetInput model
 */
export interface PetInputModel {
  /** カートID */
  cartId?: string;
  /** 搭乗者リスト */
  travelers?: Array<Traveler>;
  /** 代表搭乗者ID */
  representativeTravelerId?: string;
  /** 申込みのペットらくのり情報 */
  petDetails?: Array<CartsUpdatePetRakunoriRequestServicesPetDetailInner>;
  /** 登録済みのペットらくのり情報 */
  registeredPetDetails?: Array<CartsUpdatePetRakunoriRequestServicesPetDetailInner>;
  /** 持ち込みケージサイズ制限 */
  maxCageSize?: string;
  /** ケージとペットの総重量制限 */
  maxCageWeight?: string;
  /** 登録済みペットが存在するか否か */
  isRegistered?: boolean;
}

/**
 *  model details
 */
export interface PetInputStateDetails extends AsyncStoreItem {}

/**
 * PetInput store state
 */
export interface PetInputState extends PetInputStateDetails, PetInputModel {}

/**
 * Name of the PetInput Store
 */
export const PET_INPUT_STORE_NAME = 'petInput';

/**
 * PetInput Store Interface
 */
export interface PetInputStore {
  /** PetInput state */
  [PET_INPUT_STORE_NAME]: PetInputState;
}
