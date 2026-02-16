import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ChangeDetectorRef } from '@angular/core';
import { SupportComponent } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';
import { FareTypeSelectorModalService } from './fare-type-selector-modal.service';
import { FareTypeModalOutput, FareTypeOption } from './fare-type-selector.state';
import { SearchFlightStoreService } from '@common/services/store/search-flight/search-flight-store/search-flight-store.service';
/**
 * 運賃オプション選択モーダルの呼び出しと現在入力値のプレースホルダを表示する入力フォーム部品
 */
@Component({
  selector: 'asw-fare-type-selector',
  templateUrl: './fare-type-selector.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FareTypeSelectorComponent extends SupportComponent {
  constructor(
    protected _common: CommonLibService,
    private _searchFlightStoreService: SearchFlightStoreService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _fareTypeSelectorModalService: FareTypeSelectorModalService
  ) {
    super(_common);
  }
  reload(): void {}
  init(): void {
    //モーダルから渡される値の監視開始
    const fareType$ = this._fareTypeSelectorModalService.asObservableSubject();
    this.subscribeService('FareTypeSelectorComponent', fareType$, (data: FareTypeModalOutput) => {
      if (this.isEnabled && data.selectedFareType) {
        this._selected = data.selectedFareType;
        const fareTypeOptionFiltered = this._fareTypeOptionList.filter((v) => v.value == this._selected);
        if (fareTypeOptionFiltered.length != 0) {
          this.fareType = fareTypeOptionFiltered[0].fareType;
        }
        this.apply$.emit(this._selected);
      }
    });
    this.anaBizLoginStatus = this._common.aswContextStoreService.aswContextData.anaBizLoginStatus;
    // Storeの値変更時に入力項目に値を渡す処理を定義
    this.subscribeService('SearchFlightStoreService', this._searchFlightStoreService.searchFlight$, (data) => {
      this.isJapanOnlyFlag = data.isJapanOnly;
      this._selectedCabinClass = data.fare.cabinClass;
      this._selected = data.fare.fareOptionType;
      this._fareTypeOptionList = this._fareTypeSelectorModalService.createFareTypeOptionList(
        this._selectedCabinClass,
        this.isJapanOnlyFlag
      );
      this.fareType = this._fareTypeOptionList.find((v) => v.value === this._selected)?.fareType ?? '';
      this._changeDetectorRef.detectChanges();
    });
    //再設定することでsetメソッドを実行して選択肢を生成
    this.selected = this._selected;
  }
  destroy(): void {}

  public fareType: string = '';

  public anaBizLoginStatus: string = '';

  private _fareTypeOptionList: FareTypeOption[] = [];

  /** コンポーネントの活性状態 */
  @Input()
  public isEnabled: boolean = true;

  /** 国際判断フラグ */
  @Input()
  public isJapanOnlyFlag: boolean = false;

  /** 選択済のキャビンクラス */
  public _selectedCabinClass: string = '';
  @Input()
  get selectedCabinClass(): string {
    return this._selectedCabinClass;
  }
  set selectedCabinClass(value: string) {
    if (this._selectedCabinClass != value) {
      this._selectedCabinClass = value;
      this._fareTypeOptionList = this._fareTypeSelectorModalService.createFareTypeOptionList(
        this._selectedCabinClass,
        this.isJapanOnlyFlag
      );
      this.selected = this._selected;
    }
  }

  /** 選択済みの運賃オプション */
  private _selected: string | null = null;
  @Input()
  get selected(): string | null {
    return this._selected;
  }
  set selected(value: string | null) {
    let option = this._fareTypeOptionList.find((v) => v.value === value);
    if (option) {
      this._selected = option.value;
      this.fareType = option.fareType;
    } else {
      this._selected = value;
    }
  }

  @Output()
  apply$ = new EventEmitter<string>();

  public openModal() {
    this._fareTypeSelectorModalService.openModal(this.selected, this.selectedCabinClass, this.isJapanOnlyFlag);
  }

  /** 選択済の特典オプション */
  public _selectedAwardOption: string = '';
  @Input()
  get selectedAwardOption(): string {
    return this._selectedAwardOption;
  }
  set selectedAwardOption(value: string) {
    if (this._selectedAwardOption != value) {
      this._selectedAwardOption = value;
      this._fareTypeOptionList = this._fareTypeSelectorModalService.createFareTypeOptionListByAwardOption(
        this._selectedAwardOption
      );
      this.selected = this._selected;
    }
  }
}
