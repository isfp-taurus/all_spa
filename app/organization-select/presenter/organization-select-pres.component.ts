import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { OrganizationSelectFilterPayload } from '@app/id-modal/organization-select-filter';
import { OrganizationSelectFilterComponent } from '@app/id-modal/organization-select-filter/organization-select-filter.component';
import { apiEventAll } from '@common/helper';
import { OrganizationSelectSearchModel } from '@common/interfaces';
import { isSP } from '@lib/helpers';
import {
  GetCompanyAccountsStoreService,
  OrganizationSelectSearchStoreService,
  SelectCompanyAccountStoreService,
} from '@common/services';
import { SupportComponent } from '@lib/components/support-class';
import { AlertType, ErrorType, SessionStorageName } from '@lib/interfaces';
import { AswMasterService, CommonLibService, ModalService, PageLoadingService } from '@lib/services';
import {
  BizLoginInfoAnaBizContextAuthInfo,
  BizLoginInfoAnaBizContextSeamlessParameter,
  GetCompanyAccountsResponseDataCompanyInfoCsInner,
  SelectCompanyAccountRequest,
} from 'src/sdk-authorization';
import { debounceTime, fromEvent } from 'rxjs';
import { ErrorCodeConstants } from '@conf/app.constants';

/**
 * ANA Biz組織選択
 */
@Component({
  selector: 'asw-organization-select-pres',
  templateUrl: './organization-select-pres.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationSelectPresComponent extends SupportComponent {
  @Input()
  set companyAccountsData(value: GetCompanyAccountsResponseDataCompanyInfoCsInner[] | undefined) {
    this._companyAccountsData = value;
    this.loadPerPageData();
  }
  /** 組織一覧データ */
  get companyAccountsData() {
    return this._companyAccountsData;
  }
  private _companyAccountsData?: GetCompanyAccountsResponseDataCompanyInfoCsInner[];

  // 端末認識処理
  public isSp = isSP();
  public isSpPre = isSP();

  /**
   * 画面サイズの変更検知
   */
  private resizeEvent = () => {
    this.isSpPre = this.isSp;
    this.isSp = isSP();
    if (this.isSpPre !== this.isSp) {
      this._changeDetectorRef.markForCheck();
    }
  };

  constructor(
    private _common: CommonLibService,
    private _modal: ModalService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _aswMasterService: AswMasterService,
    public _getCompanyAccountsStoreService: GetCompanyAccountsStoreService,
    public _selectCompanyAccountStoreService: SelectCompanyAccountStoreService,
    public _organizationSelectSearchStoreService: OrganizationSelectSearchStoreService,
    private _pageLoadingService: PageLoadingService
  ) {
    super(_common);
  }

  /** 組織一覧フィルターデータ */
  get filterCompanyAccountsData() {
    let _filterCompanyAccountsData = this.companyAccountsData;

    // 組織IDで絞り込み
    if (this.filterCompanyAccountCode) {
      _filterCompanyAccountsData = this.companyAccountsData?.filter((v) => {
        return v.companyAccountCode === this.filterCompanyAccountCode;
      });
    }

    // 組織名で絞り込み
    if (this.filterContractSecName) {
      _filterCompanyAccountsData = this.companyAccountsData?.filter((v) => {
        return (
          v.contractSectionName === this.filterContractSecName ||
          v.contractSectionEnglishName === this.filterContractSecName
        );
      });
    }

    return _filterCompanyAccountsData;
  }

  /** 組織名フィルター */
  get filterContractSecName() {
    return this._organizationSelectSearchStoreService.organizationSelectSearchData.contractSecName;
  }

  /** 組織IDフィルター */
  get filterCompanyAccountCode() {
    return this._organizationSelectSearchStoreService.organizationSelectSearchData.companyAccountCode;
  }

  /** 総合データ数 */
  get totalItems() {
    return this.filterCompanyAccountsData?.length ?? 0;
  }

  /** 最大ページ数 */
  get maxPage() {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  /** ページ番号 */
  get pageNumbers() {
    let start = Math.max(this.currentPage - 2, 1);
    let end = Math.min(start + this.pagesToShow - 1, this.maxPage);

    if (end - start < this.pagesToShow - 1) {
      start = Math.max(end - this.pagesToShow + 1, 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  /** 1ページあたりの最初の項目数 */
  get firstItemsNumber() {
    return this.itemsPerPage * (this.currentPage - 1) + 1;
  }

  /** 1ページあたりの最後の項目数 */
  get lastItemsNumber() {
    return Math.min(this.itemsPerPage * this.currentPage, this.totalItems);
  }

  /** 表示数 */
  get displayNumber() {
    return `Page ${this.firstItemsNumber} ~ ${this.lastItemsNumber} / ${this.totalItems}`;
  }

  /** 言語情報 */
  aswLangCode = this._common.aswContextStoreService.aswContextData.lang;

  /** 1ページのあたりのデータ */
  perPageData?: GetCompanyAccountsResponseDataCompanyInfoCsInner[];

  /** 現在のページ番号 */
  currentPage = 1;

  /** 1ページあたりのアイテム数 */
  itemsPerPage!: number;

  /** 表示するページ番号の数 */
  pagesToShow!: number;

  /** 契約状態・静的文言キーマップ */
  contractStatusMsg = {
    underContract: 'label.contactInPlace',
    creditSuspendedByJcb: 'label.usageSuspendedByJcb',
    ticketingSuspendedByAna: 'label.usageSuspendedByAna',
    cancelled: 'label.contactCanceled',
  };

  /**
   * 1ページあたりのデータの更新処理
   */
  loadPerPageData() {
    this.perPageData = this.filterCompanyAccountsData?.slice(
      (this.currentPage - 1) * this.itemsPerPage,
      this.currentPage * this.itemsPerPage
    );
    this._changeDetectorRef.markForCheck();
  }

  /**
   * ページ移動処理
   */
  goToPage(n: number) {
    this.currentPage = n;
    this.loadPerPageData();
  }

  /**
   * 前へボタン
   */
  onNext() {
    this.goToPage(Math.min(this.currentPage + 1, this.maxPage));
  }

  /**
   * 次へボタン
   */
  onPrev() {
    this.goToPage(Math.max(this.currentPage - 1, 1));
  }

  /**
   * 組織選択フィルタモーダル表示ボタン
   */
  clickFilterButton() {
    const part = this._modal.defaultBlockPart(OrganizationSelectFilterComponent, 'OrganizationSelectFilter');
    part.payload = {
      updateEvent: () => {
        // 画面更新
        this._changeDetectorRef.detectChanges();
        this.goToPage(1);

        // 0件の場合
        if (this.filterCompanyAccountsData?.length === 0) {
          this._common.alertMessageStoreService.setAlertWarningMessage({
            contentHtml: 'E0877',
            errorMessageId: 'E0877',
            isCloseEnable: false,
            alertType: AlertType.WARNING,
          });
        } else {
          this._common.alertMessageStoreService.resetAlertMessage();
        }
      },
    } as OrganizationSelectFilterPayload | null;
    this._modal.showSubModal(part);
  }

  /**
   * 組織一覧押下
   * @param
   */
  clickListItem(companyAccountCode: string, contractSectionName?: string) {
    // 組織一覧検索条件storeをセット
    const model: OrganizationSelectSearchModel = {
      contractSecName: contractSectionName,
      companyAccountCode: companyAccountCode,
    };
    this._organizationSelectSearchStoreService.setOrganizationSelectSearch(model);

    // 組織選択API実行
    const selectCompanyAccountRequestParam: SelectCompanyAccountRequest = {
      companyAccountCode: companyAccountCode,
    };
    this.callSelectComapnyAccountApi(selectCompanyAccountRequestParam);
  }

  /**
   * ANA Biz TOPパラメータ作成
   * @param authInfo 認証情報
   * @param seamlessParameter シームレス接続情報
   */
  createAnaBizTopParam(
    authInfo?: BizLoginInfoAnaBizContextAuthInfo,
    seamlessParameter?: BizLoginInfoAnaBizContextSeamlessParameter,
    accessToken?: string
  ) {
    return {
      companyContractState: authInfo?.companyInfoA?.contractStatus,
      cancellationDate: authInfo?.companyInfoA?.cancellationDate,
      accountExpirationDt: authInfo?.companyInfoA?.accountExpirationDate,
      departmentContractState: authInfo?.companyInfoC?.contractStatus,
      cancellationDateC: authInfo?.companyInfoC?.cancellationDate,
      accountExpirationDtC: authInfo?.companyInfoC?.accountExpirationDate,
      companyNmJp: authInfo?.companyInfoA?.companyName,
      companyNmEn: authInfo?.companyInfoA?.companyNameEn,
      corporateForm: authInfo?.companyInfoA?.corporateForm,
      companyCd: authInfo?.companyInfoA?.companyCode,
      contractType: authInfo?.companyInfoA?.creditExpirationMonth,
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
      amcRestrictionFlg: authInfo?.companyInfoA?.onePaxFlag,
      departmentNameJp: authInfo?.companyInfoC?.contractSecName,
      departmentNameEn: authInfo?.companyInfoC?.contractSecNameEn,
      companyAccountCd: authInfo?.companyInfoC?.companyAccountCode,
      accountIssueFlg: authInfo?.companyInfoC?.issueFlag,
      individualConfigFlg: authInfo?.companyInfoC?.individualConfigFlag,
      companyAccountOnePaxFlg: authInfo?.companyInfoC?.onePaxFlag,
      companyAccountAmcRestrictionFlg: authInfo?.companyInfoC?.amcRestrictionFlag,
      headOfficePrefectureCd: authInfo?.companyInfoA?.headOfficePrefectureCode,
      headOfficePrefectureCdC: authInfo?.companyInfoC?.headOfficePrefectureCode,
      agency3letterCd: authInfo?.companyInfoA?.agency3letterCode,
      agency3letterCdC: authInfo?.companyInfoC?.agency3letterCode,
      areaCd: '', // TODO 組織選択情報.companyInfoA.areaCd,
      groupCd: authInfo?.companyInfoA?.groupCode,
      accountAreaCd: '', // TODO 組織選択情報.companyInfoA.areaCd,
      accountGroupCd: authInfo?.companyInfoA?.groupCode,
      pauseFlg: authInfo?.companyInfoA?.pauseFlag,
      companyAccountPauseFlg: authInfo?.companyInfoC?.pauseFlag,
      outwardEmbarkationDate: seamlessParameter?.departureDate1,
      backwardEmbarkationDate: seamlessParameter?.departureDate2,
      bizRole: authInfo?.roles,
      anaBizAccessToken: accessToken,
    };
  }

  /**
   * ANA Biz 組織選択API実行
   * @param requeset 組織選択APIのリクエストパラメータ
   */
  callSelectComapnyAccountApi(request: SelectCompanyAccountRequest) {
    this._pageLoadingService.startLoading();
    apiEventAll(
      () => {
        this._selectCompanyAccountStoreService.setSelectCompanyAccountFromApi(request);
      },
      this._selectCompanyAccountStoreService.selectCompanyAccount$(),
      (response) => {
        this._pageLoadingService.endLoading();
        // パラメータを指定
        const authInfo = response.data?.anaBizContext?.authInfo;
        const seamlessParameter = response.data?.anaBizContext?.seamlessParameter;
        const accessToken = this._common.loadSessionStorage(SessionStorageName.ACCESS_TOKEN);
        const param = this.createAnaBizTopParam(authInfo, seamlessParameter, accessToken);
        console.log(param);

        // TODO
        // ANA Biz TOPへ遷移を行う
        window.location.href = '_blank';
      },
      (error) => {
        this._pageLoadingService.endLoading();
        const errorCodeMap: { [key: string]: string } = {
          [ErrorCodeConstants.ERROR_CODES.EAPZ000030]: 'E0846', // リクエストパラメータが形式不正
          [ErrorCodeConstants.ERROR_CODES.EAPZ000028]: 'E0848', // ログインステータスが不正
        };

        const apiCode = this._common.apiError?.errors?.[0]?.code ?? '';
        const code = errorCodeMap[apiCode];

        this._common.errorsHandlerService.setNotRetryableError({
          errorType: ErrorType.BUSINESS_LOGIC,
          apiErrorCode: apiCode,
          errorMsgId: code,
        });
        this._selectCompanyAccountStoreService.resetSelectCompanyAccount();
      }
    );
  }

  init(): void {
    // 設定ファイルから取得
    this.itemsPerPage = Number(
      this._aswMasterService.getMPropertyByKey('otherApplicationSettings', 'organizationSelect.itemsPerPage')
    );
    this.pagesToShow = Number(
      this._aswMasterService.getMPropertyByKey('otherApplicationSettings', 'organizationSelect.pagesToShow')
    );
    this.subscribeService('FilterResize', fromEvent(window, 'resize').pipe(debounceTime(100)), this.resizeEvent);
  }
  reload(): void {}
  destroy(): void {}
}
