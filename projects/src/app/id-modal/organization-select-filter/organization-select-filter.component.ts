import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { OrganizationSelectSearchModel } from '@common/interfaces';
import { OrganizationSelectSearchStoreService, SelectCompanyAccountStoreService } from '@common/services';
import { SupportModalBlockComponent } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';
import { OrganizationSelectFilterPayload } from './organization-select-filter.state';
import { AswValidators } from '@lib/helpers';

@Component({
  selector: 'asw-organization-select-filter',
  templateUrl: './organization-select-filter.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationSelectFilterComponent extends SupportModalBlockComponent implements OnInit {
  public inputFG!: FormGroup;

  constructor(
    private _common: CommonLibService,
    public _changeDetectorRef: ChangeDetectorRef,
    public _selectCompanyAccountStoreService: SelectCompanyAccountStoreService,
    public _organizationSelectSearchStoreService: OrganizationSelectSearchStoreService
  ) {
    super(_common);

    this.inputFG = new FormGroup({
      organization_name: new FormControl(''),
      organization_id: new FormControl(
        '',
        AswValidators.alphaNumeric({ params: { key: 0, value: 'label.organizationId' } })
      ),
    });
  }

  init(): void {
    const contractSecName = this._organizationSelectSearchStoreService.organizationSelectSearchData.contractSecName;
    const companyAccountCode =
      this._organizationSelectSearchStoreService.organizationSelectSearchData.companyAccountCode;

    if (contractSecName) this.inputFG.get('organization_name')?.patchValue(contractSecName);
    if (companyAccountCode) this.inputFG.get('organization_id')?.patchValue(companyAccountCode);
  }

  override payload: OrganizationSelectFilterPayload | null = {};

  /**
   * 閉じるボタン押下時処理
   */
  clickClose() {
    this.close();
  }

  /**
   * Applyボタン押下
   */
  applyEvent() {
    // 組織一覧検索条件storeをセット
    const model: OrganizationSelectSearchModel = {
      contractSecName: this.inputFG.get('organization_name')?.value,
      companyAccountCode: this.inputFG.get('organization_id')?.value,
    };
    this._organizationSelectSearchStoreService.setOrganizationSelectSearch(model);

    if (this.payload?.updateEvent) this.payload.updateEvent();
    this.close();
  }

  /**
   * Resetボタン押下
   */
  resetEvent() {
    this.inputFG.reset();
    // 組織一覧検索条件storeをリセット
    this._organizationSelectSearchStoreService.resetOrganizationSelectSearch();
  }

  reload(): void {}
  destroy(): void {}
}
