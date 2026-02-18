import { Injectable } from '@angular/core';
import { AswMasterService, CommonLibService } from '@lib/services';
import {
  BizLoginInfoAnaBizContextEncryption,
  BizLoginInfoAnaBizContext,
  BizLoginInfoAnaBizContextAuthInfo,
  BizLoginInfoAnaBizContextSeamlessParameter,
} from 'src/sdk-authorization';
import { FareTypeOptionListByCabinClassMap } from './ana-biz-top.service.state';
import { SupportClass } from 'src/lib/components/support-class';
import { FareTypeData } from '@common/interfaces';

@Injectable()
export class AnaBizTopService extends SupportClass {
  private readonly NAME_SUFFIX_JP = '　様';
  private readonly NAME_PREFIX_EN = 'Dear ';
  private readonly CONTRACTTYPE_P = '01';
  constructor(private _common: CommonLibService, private _aswMasterSvc: AswMasterService) {
    super();
  }

  destroy(): void {}

  /**
   * URLテンプレート内のパス変数を提供された値で置き換えます。
   * @param {string} urlTemplate - プレースホルダーを含むURLテンプレート。
   * @param {Object} pathVariables - パス変数と対応する値のオブジェクト。
   * @returns {string} - パス変数が対応する値で置き換えられたフォーマット済みのURL。
   */
  formatUrl(urlTemplate: string, pathVariables: { [key: string]: string }): string {
    return urlTemplate.replace(/{{(\w+)}}/g, (match, key) => {
      return typeof pathVariables[key] !== 'undefined' ? pathVariables[key] : match;
    });
  }

  /**
   * 日付の文字列を yyyy-MM-dd 形式から yyyyMMdd 形式に変換します。
   * @param {string} input - yyyy-MM-dd 形式
   * @returns {string} - yyyyMMdd 形式
   */
  private _formatDate(input?: string): string {
    try {
      if (!input) {
        return '';
      }
      const regexWithHyphen = /^\d{4}-\d{2}-\d{2}$/; // yyyy-MM-dd
      const regexWithoutHyphen = /^\d{8}$/; // yyyyMMdd

      if (regexWithHyphen.test(input)) {
        return input.replace(/-/g, '');
      } else if (regexWithoutHyphen.test(input)) {
        return input;
      } else {
        return '';
      }
    } catch (error) {
      return '';
    }
  }

  /**
   * null/undefined だった場合は一律空文字""に置換する対応
   */
  private _formatParam<T extends Record<string, unknown>>(param: T): Record<keyof T, string> {
    const result = {} as Record<keyof T, string>;
    for (const key in param) {
      result[key] = String(param[key] ?? '');
    }
    return result;
  }

  /**
   * `m_list_data_940` のキャッシュされたマスターデータを取得
   * @param {(master: FareTypeData) => void} callback - 読み込まれたマスターデータを受け取るコールバック関数
   */
  private _getCacheMaster(callback: (master: FareTypeData) => void): void {
    this.subscribeService(
      'getMListData940',
      this._aswMasterSvc.load(
        [
          {
            key: 'm_list_data_940',
            fileName: 'm_list_data_940/M_list_data_940',
            isCurrentLang: true,
          },
        ],
        true
      ),
      ([value]) => {
        this.deleteSubscription('getMListData940');
        callback(value);
      }
    );
  }

  /**
   * 運賃オプションリスト取得
   * @param {FareTypeData} fareTypeObj - キャッシュにキャビンクラスデータ
   * @returns {Map<string, FareTypeOptionListByCabinClassMap[]>}
   */
  private _getCabinFareTypeListMap(
    fareTypeObj?: FareTypeData,
    authInfo?: BizLoginInfoAnaBizContextAuthInfo
  ): Map<string, FareTypeOptionListByCabinClassMap[]> {
    // Biz用CFF区分
    const CFF_TYPE = '3';
    // 指定されたCffTypeでオプションデータを取得する、国内は"1"、国際は"0"
    const cffFareTypeObj = fareTypeObj?.[CFF_TYPE] ?? {};

    return this._filterAnaBizFareOptionMap(new Map(Object.entries(cffFareTypeObj)), authInfo);
  }

  /**
   * AnaBiz運賃オプションリスト作成処理
   * @param fareOptionAnaBizMap AnaBiz運賃オプションマップ
   * @returns AnaBiz運賃オプションリスト
   */
  private _filterAnaBizFareOptionMap(
    fareOptionAnaBizMap: Map<string, FareTypeOptionListByCabinClassMap[]>,
    authInfo?: BizLoginInfoAnaBizContextAuthInfo
  ): Map<string, FareTypeOptionListByCabinClassMap[]> {
    // 企業情報
    const companyInfo = this._getCompanyInfo(authInfo);
    const ecoFareOptionAnaBizList = fareOptionAnaBizMap.get('eco');
    const eco =
      ecoFareOptionAnaBizList?.filter((item) => companyInfo?.eCffList?.includes(item.commercial_fare_family_code)) ??
      [];
    const firstFareOptionAnaBizList = fareOptionAnaBizMap.get('first');
    const first =
      firstFareOptionAnaBizList?.filter((item) => companyInfo?.fCffList?.includes(item.commercial_fare_family_code)) ??
      [];
    fareOptionAnaBizMap.set('eco', eco);
    fareOptionAnaBizMap.set('first', first);
    return fareOptionAnaBizMap;
  }

  /**
   * 企業情報作成処理
   */
  private _getCompanyInfo(authInfo?: BizLoginInfoAnaBizContextAuthInfo) {
    // 契約形態
    const contractType = authInfo?.contractType;
    // 企業情報
    const companyInfo = contractType === '01' ? authInfo?.companyInfoC : authInfo?.companyInfoA;
    return companyInfo;
  }

  /**
   * AnaBizTopのパラメータを送信します。
   *
   * @param anaBizContext ANA Bizログイン情報
   * @returns
   */

  public sendAnaBizTop(anaBizContext?: BizLoginInfoAnaBizContext) {
    const authInfo: BizLoginInfoAnaBizContextAuthInfo = anaBizContext?.authInfo ?? {};
    const seamlessParameter: BizLoginInfoAnaBizContextSeamlessParameter = anaBizContext?.seamlessParameter ?? {};
    const encryption: BizLoginInfoAnaBizContextEncryption = anaBizContext?.encryption ?? {};
    this._getCacheMaster((fareTypeObj) => {
      const cabinFareTypeListMap = this._getCabinFareTypeListMap(fareTypeObj, authInfo);
      const rolesMap = new Map<string, number>([
        ['TRAVELER', 2],
        ['APPROVER', 3],
        ['DEPARTMENT_ADMINISTRATOR', 4],
        ['COMPANY_ADMINISTRATOR', 5],
      ]);
      // ANA Biz TOPパラメータの作成
      const param = this._formatParam({
        companyContractState: authInfo?.companyInfoA?.contractStatus,
        cancellationDate: authInfo?.companyInfoA?.cancellationDate,
        accountExpirationDt: authInfo?.companyInfoA?.accountExpirationDate,
        departmentContractState: authInfo?.companyInfoC?.contractStatus,
        cancellationDateC: authInfo?.companyInfoC?.cancellationDate,
        accountExpirationDtC: authInfo?.companyInfoC?.accountExpirationDate,
        companyNmJp: authInfo?.companyInfoA?.companyName,
        companyNmEn: authInfo?.companyInfoA?.companyNameEn,
        corporateForm: authInfo?.companyInfoA?.corporateForm,
        companyCd: encryption?.companyCode,
        contractType: authInfo?.companyInfoA?.contractType,
        creditCompanyCd: authInfo?.companyInfoA?.creditCompanyCode,
        btmCd: authInfo?.companyInfoA?.btmCode,
        btmNm: authInfo?.companyInfoA?.btmName,
        consignmentCd: authInfo?.companyInfoA?.consignmentCode,
        subcontractorNm: authInfo?.companyInfoA?.subcontractorName,
        complimentFlg: authInfo?.companyInfoA?.complimentFlag,
        complimentType: authInfo?.companyInfoA?.complimentType,
        issueFlg: authInfo?.companyInfoA?.issueFlag,
        intraRestrictionFlg: authInfo?.companyInfoA?.intraRestrictionFlag,
        restrictSeamlessFlg: authInfo?.companyInfoA?.restrictSeamlessFlag,
        seamlessSystemNm: authInfo?.companyInfoA?.seamlessSystemName,
        onePaxFlg: authInfo?.companyInfoA?.onePaxFlag,
        amcRestrictionFlg: authInfo?.companyInfoA?.amcRestrictionFlag,
        departmentNameJp: authInfo?.companyInfoC?.contractSecName,
        departmentNameEn: authInfo?.companyInfoC?.contractSecNameEn,
        companyAccountCd: encryption?.companyAccountCode,
        accountIssueFlg: authInfo?.companyInfoC?.issueFlag,
        individualConfigFlg: authInfo?.companyInfoC?.individualConfigFlag,
        companyAccountOnePaxFlg: authInfo?.companyInfoC?.onePaxFlag,
        companyAccountAmcRestrictionFlg: authInfo?.companyInfoC?.amcRestrictionFlag,
        headOfficePrefectureCd: authInfo?.companyInfoA?.headOfficePrefectureCode,
        headOfficePrefectureCdC: authInfo?.companyInfoC?.headOfficePrefectureCode,
        agency3letterCd: authInfo?.companyInfoA?.agency3letterCode,
        agency3letterCdC: authInfo?.companyInfoC?.agency3letterCode,
        groupCd: authInfo?.companyInfoA?.groupCode,
        accountGroupCd: authInfo?.companyInfoC?.groupCode,
        pauseFlg: authInfo?.companyInfoA?.pauseFlag,
        companyAccountPauseFlg: authInfo?.companyInfoC?.pauseFlag,
        outwardEmbarkationDate: this._formatDate(seamlessParameter?.departureDate1),
        backwardEmbarkationDate: this._formatDate(seamlessParameter?.departureDate2),
        bizRole: authInfo?.roles
          ?.map((role) => rolesMap.get(role))
          .filter((role) => role !== undefined)
          .join(','),
        fareOptionEconomy: cabinFareTypeListMap
          .get('eco')
          ?.map((item) => item.value)
          .join(','),
        fareOptionFirst: cabinFareTypeListMap
          .get('first')
          ?.map((item) => item.value)
          .join(','),
        anaBizAccessToken: encryption?.anaBizAccessToken,
      });
      // パラメータ送信設定
      const form = document.createElement('form');
      const pathVariables = { lang: this._common.aswContextStoreService.aswContextData.lang };
      const url = this.formatUrl(
        this._common.aswMasterService.getMPropertyByKey('application', 'url.anaBizTop.redirect'),
        pathVariables
      );
      form.action = url;
      form.target = '_self'; // 同一タブ表示指定
      form.method = 'post'; // サーバへの送信方法を指定
      form.style.display = 'none'; //パラメータを非表示

      //パラメータに値を設定
      form.addEventListener('formdata', ({ formData }) => {
        formData.set('companyContractState', param.companyContractState);
        formData.set('cancellationDate', param.cancellationDate);
        formData.set('accountExpirationDt', param.accountExpirationDt);
        formData.set('departmentContractState', param.departmentContractState);
        formData.set('cancellationDateC', param.cancellationDateC);
        formData.set('accountExpirationDtC', param.accountExpirationDtC);
        formData.set(
          'companyNmJp',
          param.contractType === this.CONTRACTTYPE_P && param.companyNmJp !== param.departmentNameJp
            ? param.companyNmJp
            : param.companyNmJp + this.NAME_SUFFIX_JP
        );
        formData.set(
          'companyNmEn',
          this.NAME_PREFIX_EN + (param.companyNmEn !== '' ? param.companyNmEn : param.companyNmJp)
        );
        formData.set('corporateForm', param.corporateForm);
        formData.set('companyCd', param.companyCd);
        formData.set('contractType', param.contractType);
        formData.set('creditCompanyCd', param.creditCompanyCd);
        formData.set('btmCd', param.btmCd);
        formData.set('btmNm', param.btmNm);
        formData.set('consignmentCd', param.consignmentCd);
        formData.set('subcontractorNm', param.subcontractorNm);
        formData.set('complimentFlg', param.complimentFlg);
        formData.set('complimentType', param.complimentType);
        formData.set('issueFlg', param.issueFlg);
        formData.set('intraRestrictionFlg', param.intraRestrictionFlg);
        formData.set('restrictSeamlessFlg', param.restrictSeamlessFlg);
        formData.set('seamlessSystemNm', param.seamlessSystemNm);
        formData.set('onePaxFlg', param.onePaxFlg);
        formData.set('amcRestrictionFlg', param.amcRestrictionFlg);
        formData.set(
          'departmentNameJp',
          param.contractType === this.CONTRACTTYPE_P && param.companyNmJp !== param.departmentNameJp
            ? param.departmentNameJp + this.NAME_SUFFIX_JP
            : ''
        );
        formData.set(
          'departmentNameEn',
          this.getDepartmentNameEn(
            param.companyNmJp,
            param.departmentNameJp,
            param.companyNmEn,
            param.departmentNameEn,
            param.contractType
          )
        );
        formData.set('companyAccountCd', param.companyAccountCd);
        formData.set('accountIssueFlg', param.accountIssueFlg);
        formData.set('individualConfigFlg', param.individualConfigFlg);
        formData.set('companyAccountOnePaxFlg', param.companyAccountOnePaxFlg);
        formData.set('companyAccountAmcRestrictionFlg', param.companyAccountAmcRestrictionFlg);
        formData.set('headOfficePrefectureCd', param.headOfficePrefectureCd);
        formData.set('headOfficePrefectureCdC', param.headOfficePrefectureCdC);
        formData.set('agency3letterCd', param.agency3letterCd);
        formData.set('agency3letterCdC', param.agency3letterCdC);
        formData.set('groupCd', param.groupCd);
        formData.set('accountGroupCd', param.accountGroupCd);
        formData.set('pauseFlg', param.pauseFlg);
        formData.set('companyAccountPauseFlg', param.companyAccountPauseFlg);
        formData.set('outwardEmbarkationDate', param.outwardEmbarkationDate);
        formData.set('backwardEmbarkationDate', param.backwardEmbarkationDate);
        formData.set('bizRole', param.bizRole);
        formData.set('fareOptionEconomy', param.fareOptionEconomy);
        formData.set('fareOptionFirst', param.fareOptionFirst);
        formData.set('anaBizAccessToken', param.anaBizAccessToken);
      });
      document.body.append(form);

      // パラメータ送信
      form.submit();
      // パラメータ送信後、削除処理
      document.body.removeChild(form);
    });
  }

  /**
   * 企業精算CD単位の名称返却（英語）
   *
   * @param companyNmJp 企業名（日本語）
   * @param departmentNameJp 企業精算CD単位の名称（日本語）
   * @param companyNmEn 企業名（英語）
   * @param departmentNameEn 企業精算CD単位の名称（英語）
   * @param contractType 契約形態
   * @returns
   */
  private getDepartmentNameEn(
    companyNmJp: string,
    departmentNameJp: string,
    companyNmEn: string,
    departmentNameEn: string,
    contractType: string
  ): string {
    let workCompanyNmEn: string = companyNmEn !== '' ? companyNmEn : companyNmJp;
    let workDepartmentName: string = departmentNameEn !== '' ? departmentNameEn : departmentNameJp;
    return contractType === this.CONTRACTTYPE_P && workCompanyNmEn !== workDepartmentName ? workDepartmentName : '';
  }
}
