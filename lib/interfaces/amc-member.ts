import { GenderCodeType } from './gender-code';
import { MemberKindCodeType } from './member-kind-code';
import { PremiumStatusCodeType } from './premium-status-code';
import { TierLevelType } from './tier-level';
import { IFlyAddressType } from './ifly-address';
import { IFlyGenderType } from './ifly-gender';
import { IFlyPhoneNumberType } from './ifly-phone-number';
import {
  InitializationResponseDataMemberInfo,
  InitializationResponseDataMemberInfoIFlyMemberInfo,
  InitializationResponseDataMemberInfoIFlyMemberInfoProfileDetails,
  InitializationResponseDataMemberInfoIFlyMemberInfoProfileDetailsIndividualInfo,
  InitializationResponseDataMemberInfoIFlyMemberInfoProfileDetailsIndividualInfoMemberContactInfosInner,
} from 'src/sdk-initialization';
import { CamelToSnake } from './camel-to-snake';
import { SnakeToCamelCase } from './snake-to-camel';
import { AnaCardTypeCodeType } from './ana-card-type-code';

/**
 * 会員情報
 */
export interface AMCMemberModel
  extends Omit<
    InitializationResponseDataMemberInfo,
    'memberKindCode' | 'gender' | 'premiumStatus' | 'tierLevel' | 'iFlyMemberInfo'
  > {
  memberKindCode: MemberKindCodeType;
  gender: GenderCodeType;
  premiumStatus: PremiumStatusCodeType;
  tierLevel: TierLevelType;
  anaCardTypeCode: AnaCardTypeCodeType;
  iFlyMemberInfo?: Omit<InitializationResponseDataMemberInfoIFlyMemberInfo, 'profileDetails'> & {
    profileDetails: Omit<InitializationResponseDataMemberInfoIFlyMemberInfoProfileDetails, 'individualInfo'> & {
      individualInfo: Omit<
        InitializationResponseDataMemberInfoIFlyMemberInfoProfileDetailsIndividualInfo,
        'preferredEmailAddress' | 'preferredPhoneNumber' | 'gender' | 'memberContactInfos'
      > & {
        preferredEmailAddress: IFlyAddressType;
        preferredPhoneNumber: IFlyPhoneNumberType;
        gender: IFlyGenderType;
        memberContactInfos?: (Omit<
          InitializationResponseDataMemberInfoIFlyMemberInfoProfileDetailsIndividualInfoMemberContactInfosInner,
          'addressType'
        > & {
          addressType: IFlyAddressType;
        })[];
      };
    };
  };
}

/**
 * キーリスト @see {@link AMCMemberModel}
 * インターフェイスのキー かつ キー = valueの定義
 */
export type AMCMemberType = (typeof AMCMemberType)[keyof typeof AMCMemberType];
export const AMCMemberType: {
  [key in Uppercase<keyof Required<CamelToSnake<AMCMemberModel>>>]: SnakeToCamelCase<Lowercase<key>> &
    keyof AMCMemberModel;
} = {
  GENDER: 'gender',
  MEMBER_KIND_CODE: 'memberKindCode',
  PREMIUM_STATUS: 'premiumStatus',
  TIER_LEVEL: 'tierLevel',
  AMC_NUMBER: 'amcNumber',
  CARD_STATUS_CODE: 'cardStatusCode',
  LETTER_NAME: 'letterName',
  ALTEA_NAME: 'alteaName',
  MILE_BALANCE: 'mileBalance',
  AFA_PRIME_MEMBER_IDENTIFICATION: 'afaPrimeMemberIdentification',
  UPGRADE_POINT_BALANCE_THIS_YEAR: 'upgradePointBalanceThisYear',
  UPGRADE_POINT_BALANCE_NEXT_YEAR: 'upgradePointBalanceNextYear',
  MILE_BALANCE_AFA: 'mileBalanceAfa',
  PREMIUM_POINT_TOTAL: 'premiumPointTotal',
  PREMIUM_POINT_ANA_TOTAL: 'premiumPointAnaTotal',
  SKY_COIN_BALANCE: 'skyCoinBalance',
  BOOK_DATE: 'bookDate',
  ANA_CARD_TYPE_CODE: 'anaCardTypeCode',
  I_FLY_MEMBER_INFO: 'iFlyMemberInfo',
};
