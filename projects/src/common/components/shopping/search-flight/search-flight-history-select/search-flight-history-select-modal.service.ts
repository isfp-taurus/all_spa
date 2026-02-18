import { Injectable } from '@angular/core';
import { SearchFlightHistoryStoreService } from '@common/services/store/search-flight/search-flight-history-store/search-flight-history-store.service';
import { SearchFlightState } from '@common/store/search-flight/search-flight.state';
import { ModalType } from '@lib/components';
import { SupportClass } from '@lib/components/support-class';
import { ModalBlockParts } from '@lib/services';
import { ModalService } from '@lib/services/modal/modal.service';
import { Subject } from 'rxjs/internal/Subject';
import { SearchFlightHistorySelectModalComponent } from './search-flight-history-select-modal.component';
import { SearchFlightHistorySelectModalInput } from './search-flight-history-select.state';

/** 履歴・お気に入りモーダルを制御するサービスクラス */
@Injectable()
export class SearchFlightHistorySelectModalService extends SupportClass {
  constructor(
    public _modalService: ModalService,
    private _searchFlightHistoryStoreService: SearchFlightHistoryStoreService
  ) {
    super();
    this._modalBlockParts = this._modalService.defaultBlockPart(SearchFlightHistorySelectModalComponent);
    this._modalBlockParts.closeBackEnable = true;
    this._modalBlockParts.type = ModalType.TYPE3;
  }
  destroy(): void {}

  private _modalBlockParts: ModalBlockParts;

  // 明細データ選択して、親画面に通知用
  private _itemSelectSubject$ = new Subject<{
    searchFlightState: SearchFlightState;
    historyType: 'history' | 'favorite';
  }>();
  /** Observableに検索条件データを流すメソッド */
  public itemSelect(historyType: 'history' | 'favorite', value: SearchFlightState) {
    this._itemSelectSubject$.next({ historyType: historyType, searchFlightState: value });
  }
  /** 選択した履歴・お気に入りデータを検索条件データに変換したものを通知するObservableを返す */
  public getItemSelectObservable$() {
    return this._itemSelectSubject$.asObservable();
  }

  /** APIを実行する
   * モーダル呼び出しサービスに置くことで開く前にAPIを実行する
   */
  public requestHistoryFavoriteGet() {
    //APIの実行
    this._searchFlightHistoryStoreService.requestHistoryFavoriteGet(true);
  }

  /** モーダルを開く */
  public openModal(historyType: 'history' | 'favorite') {
    /** モーダルの表示 */
    const payload: SearchFlightHistorySelectModalInput = {
      historyType: historyType,
    };
    this._modalBlockParts.payload = payload;
    this._modalService.showSubModal(this._modalBlockParts);
  }
}
