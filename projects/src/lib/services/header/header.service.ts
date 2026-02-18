/**
 * ヘッダーエリア
 */
import { Injectable } from '@angular/core';
import { SupportClass } from '@lib/components/support-class';
import {
  BookingType,
  DeviceType,
  MemberKindCodeType,
  PremiumStatusCodeType,
  AnaCardTypeCodeType,
  IFlyGenderType,
} from '@lib/interfaces';
import { CommonLibService } from '@lib/services';

/**
 * ヘッダー画面Service
 */
@Injectable({
  providedIn: 'root',
})
export class HeaderService extends SupportClass {
  constructor(public _common: CommonLibService) {
    super();
  }

  getTopUrl() {
    let topUrl = this._common.aswMasterService.getMPropertyByKey('application', 'topServer');
    if (
      this._common.aswContextStoreService.aswContextData.deviceType === DeviceType.PC &&
      this._common.isJapaneseOffice() &&
      this._common.aswContextStoreService.aswContextData.bookingType === BookingType.R
    ) {
      topUrl += this._common.aswMasterService.getMPropertyByKey('application', 'topPath.pc.revenue');
      if (this._common.aswContextStoreService.aswContextData.lang !== 'ja') {
        topUrl += 'e';
      }
    } else {
      topUrl += this._common.aswMasterService.getMPropertyByKey('application', 'topPath');
    }
    return topUrl;
  }

  getAnaLogo() {
    if (
      this._common.aswContextStoreService.aswContextData.deviceType === DeviceType.PC &&
      this._common.isJapaneseOffice() &&
      this._common.aswContextStoreService.aswContextData.bookingType === BookingType.R
    ) {
      return 'alt.headerlogo.topLink';
    } else if (
      this._common.aswContextStoreService.aswContextData.deviceType === DeviceType.PC &&
      this._common.isJapaneseOffice() &&
      this._common.aswContextStoreService.aswContextData.bookingType !== BookingType.R
    ) {
      return 'alt.headerlogo.awardLink';
    }
    return 'alt.headerlogo';
  }

  getHelpContact() {
    if (this._common.isNotLogin()) {
      return 'label.meta.contactInfo';
    } else {
      if (this._common.amcMemberStoreService.amcMemberData.premiumStatus === PremiumStatusCodeType.BRONZE) {
        return 'label.meta.contactInfo.bronze';
      } else if (this._common.amcMemberStoreService.amcMemberData.premiumStatus === PremiumStatusCodeType.PLATINUM) {
        return 'label.meta.contactInfo.platinum';
      } else if (this._common.amcMemberStoreService.amcMemberData.premiumStatus === PremiumStatusCodeType.DIAMOND) {
        return 'label.meta.contactInfo.diamond';
      } else if (this._common.amcMemberStoreService.amcMemberData.anaCardTypeCode === AnaCardTypeCodeType.SFC) {
        return 'label.meta.contactInfo.sfc';
      } else if (this._common.amcMemberStoreService.amcMemberData.memberKindCode === MemberKindCodeType.MEMBER_AID) {
        return 'label.meta.contactInfo';
      } else if (this._common.amcMemberStoreService.amcMemberData.memberKindCode === MemberKindCodeType.MEMBER_ACH) {
        return 'label.meta.contactInfo.anaCard';
      } else {
        return 'label.meta.contactInfo';
      }
    }
  }

  getMemberImage() {
    if (this._common.amcMemberStoreService.amcMemberData.premiumStatus === PremiumStatusCodeType.BRONZE) {
      return 'assets/images/statuslogo_bronze.svg';
    } else if (this._common.amcMemberStoreService.amcMemberData.premiumStatus === PremiumStatusCodeType.PLATINUM) {
      return 'assets/images/statuslogo_platinum.svg';
    } else if (this._common.amcMemberStoreService.amcMemberData.premiumStatus === PremiumStatusCodeType.DIAMOND) {
      return 'assets/images/statuslogo_diamond.svg';
    } else if (this._common.amcMemberStoreService.amcMemberData.anaCardTypeCode === AnaCardTypeCodeType.SFC) {
      return 'assets/images/statuslogo_super_flyers_card.svg';
    } else if (this._common.amcMemberStoreService.amcMemberData.memberKindCode === MemberKindCodeType.MEMBER_AID) {
      return 'assets/images/statuslogo_amc.svg';
    } else if (this._common.amcMemberStoreService.amcMemberData.memberKindCode === MemberKindCodeType.MEMBER_ACH) {
      return 'assets/images/statuslogo_ana_card.svg';
    } else {
      return 'assets/images/statuslogo_amc.svg';
    }
  }

  getMemberAlt() {
    if (this._common.amcMemberStoreService.amcMemberData.premiumStatus === PremiumStatusCodeType.BRONZE) {
      return 'alt.bronzeMember';
    } else if (this._common.amcMemberStoreService.amcMemberData.premiumStatus === PremiumStatusCodeType.PLATINUM) {
      return 'alt.platinumMember';
    } else if (this._common.amcMemberStoreService.amcMemberData.premiumStatus === PremiumStatusCodeType.DIAMOND) {
      return 'alt.diamondMember';
    } else if (this._common.amcMemberStoreService.amcMemberData.anaCardTypeCode === AnaCardTypeCodeType.SFC) {
      return 'alt.sfcMember';
    } else if (this._common.amcMemberStoreService.amcMemberData.memberKindCode === MemberKindCodeType.MEMBER_AID) {
      return 'alt.anaMileageClubIcon';
    } else if (this._common.amcMemberStoreService.amcMemberData.memberKindCode === MemberKindCodeType.MEMBER_ACH) {
      return 'alt.anaCard';
    } else {
      return 'alt.anaMileageClubIcon';
    }
  }

  /**
   * フルネーム表示用文言取得
   * @returns 表示用文言
   */
  getLetrName() {
    switch (this._common.amcMemberStoreService.amcMemberData.iFlyMemberInfo?.profileDetails.individualInfo.gender) {
      case IFlyGenderType.MALE:
        return 'label.male.title';
      case IFlyGenderType.FEMALE:
        return 'label.female.title';
      default:
        return 'label.unknown.title';
    }
  }

  /**
   * 表示用フルネーム取得
   * 言語に応じたフルネームを返す。
   * @returns 表示用フルネーム
   */
  getFullName() {
    let fullName = '';
    const lang = this._common.aswContextStoreService.aswContextData.lang;
    if (lang === 'ja') {
      //日本語の場合「性 名」を返す。
      fullName =
        this._common.amcMemberStoreService.amcMemberData.iFlyMemberInfo?.profileDetails.individualInfo.secondLastName +
        ' ' +
        this._common.amcMemberStoreService.amcMemberData.iFlyMemberInfo?.profileDetails.individualInfo.secondName;
    } else {
      //日本語以外の場合「名 性」を返す。
      fullName =
        this._common.amcMemberStoreService.amcMemberData.iFlyMemberInfo?.profileDetails.individualInfo.givenName +
        ' ' +
        this._common.amcMemberStoreService.amcMemberData.iFlyMemberInfo?.profileDetails.individualInfo.familyName;
    }
    return fullName;
  }

  destroy(): void {}
}
