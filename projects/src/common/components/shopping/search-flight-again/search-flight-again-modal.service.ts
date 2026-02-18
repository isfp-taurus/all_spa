import { Injectable } from '@angular/core';
import { ModalType } from '@lib/components';
import { SupportClass } from '@lib/components/support-class';
import { ModalService, ModalBlockParts, PageLoadingService } from '@lib/services';
import { SearchFlightAgainModalComponent } from './search-flight-again-modal.component';
import { SearchFlightStoreService } from '@common/services';
import { SearchFlightStateDetails } from '@common/store/search-flight';
import { RoundtripFlightAvailabilityInternationalState } from '@common/store/roundtripFlightAvailabilityInternational';
import { RoundtripFlightAvailabilityInternationalService } from '@common/services/roundtripFlightAvailabilityInternational/roundtripFlightAvailabilityInternational.service';

@Injectable({
  providedIn: 'root',
})
export class SearchFlightAgainModalService extends SupportClass {
  constructor(
    public _modalService: ModalService,
    private _searchFlightStoreService: SearchFlightStoreService,
    private _roundtripFlightAvailabilityInternationalService: RoundtripFlightAvailabilityInternationalService,
    private _pageLoadingService: PageLoadingService
  ) {
    super();
    this._modalBlockParts = this._modalService.defaultBlockPart(SearchFlightAgainModalComponent);
    this._modalBlockParts.closeBackEnable = true;
    this._modalBlockParts.type = ModalType.TYPE3;
  }

  destroy(): void {}

  private _modalBlockParts: ModalBlockParts;

  /** 履歴用検索条件（バックアップ）*/
  public tmpRequestSearchCondition: SearchFlightStateDetails = this._searchFlightStoreService.getData();

  public closeEvent = (applied?: boolean) => {
    //検索ボタン押下時はモーダル閉じるのみ
    if (applied === undefined || applied === false) {
      //履歴用検索条件（バックアップ）で履歴用検索条件を更新する。
      this._searchFlightStoreService.updateStore(this.tmpRequestSearchCondition);
      const setData: RoundtripFlightAvailabilityInternationalState = {};
      // ※表示状態をstoreで管理し、非表示にする旨を通知することによって非表示にする。
      setData.isShowSearchagain = false;
      // 検索条件に、リクエスト用検索条件
      this._roundtripFlightAvailabilityInternationalService.updateRoundtripFlightAvailabilityInternational(setData);
    }
  };

  /** モーダルの表示 */
  public openModal() {
    // 画面のローディング開始
    this._pageLoadingService.startLoading();

    // FIXME:暫定対応 画面のローディングを先に反映させるためにsetTimeoutで別スレッドで動作させる。
    setTimeout(() => {
      // /** モーダル開くときの履歴用検索条件を保持する */
      this.tmpRequestSearchCondition = this._searchFlightStoreService.getData();
      // /** 入力結果の受け取り用に関数を渡す */
      this._modalBlockParts.closeEvent = this.closeEvent;
      /** モーダルの表示 */
      this._modalService.showSubModal(this._modalBlockParts);
    }, 500);
  }
}
