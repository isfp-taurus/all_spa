/**
 * 注意喚起エリア store サービス
 *
 */
import { Injectable } from '@angular/core';
import { SupportClass } from '../../components/support-class';
import { AlertMessageItem, AlertType } from '../../interfaces';
import {
  AlertMessageState,
  AlertMessageStore,
  addAlertInfomationMessage,
  addAlertSubInfomationMessage,
  addAlertSubWarningMessage,
  addAlertWarningMessage,
  removeAlertInfomationMessage,
  removeAlertSubInfomationMessage,
  removeAlertSubWarningMessage,
  removeAlertWarningMessage,
  removeAllAlertInfomationMessage,
  removeAllAlertMessage,
  removeAllAlertSubInfomationMessage,
  removeAllAlertSubMessage,
  removeAllAlertSubWarningMessage,
  removeAllAlertWarningMessage,
  resetAlertMessage,
  selectAlertMessageState,
  setAlertMessage,
  updateAlertMessage,
} from '../../store';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs/internal/Observable';
import { filter } from 'rxjs/operators';

/**
 * 注意喚起エリア store サービス
 *
 * store情報
 * @param alertMessageData @see AlertMessageState
 */
@Injectable()
export class AlertMessageStoreService extends SupportClass {
  private _alertMessage$: Observable<AlertMessageState>;
  private _alertMessageData!: AlertMessageState;
  get alertMessageData() {
    return this._alertMessageData;
  }

  constructor(private _store: Store<AlertMessageStore>) {
    super();
    this._alertMessage$ = this._store.pipe(
      select(selectAlertMessageState),
      filter((data) => !!data)
    );
    this.subscribeService('AlertMessageStoreServiceData', this._alertMessage$, (data) => {
      this._alertMessageData = data;
    });
  }

  destroy() {}

  public getAlertMessage$() {
    return this._alertMessage$;
  }

  public getAlertWarningMessage(): AlertMessageItem[] {
    return this._alertMessageData.warningMessage;
  }

  public getAlertInfomationMessage(): AlertMessageItem[] {
    return this._alertMessageData.infomationMessage;
  }

  /**
   * @param item ワーニング情報
   * @returns 注意喚起エリアの管理用ID
   */
  public setAlertWarningMessage(item: AlertMessageItem) {
    const _item: AlertMessageItem = {
      ...item,
      alertType: AlertType.WARNING,
      contentId: item.contentId || 'warning' + new Date().getTime(),
      isClosed: false,
    };
    this._store.dispatch(addAlertWarningMessage(_item));

    return _item.contentId;
  }

  /**
   * @param item インフォメーション情報
   * @returns 注意喚起エリアの管理用ID
   */
  public setAlertInfomationMessage(item: AlertMessageItem) {
    const _item: AlertMessageItem = {
      ...item,
      alertType: AlertType.INFOMATION,
      contentId: item.contentId || 'infomation' + new Date().getTime(),
      isClosed: false,
    };
    this._store.dispatch(addAlertInfomationMessage(_item));

    return _item.contentId;
  }

  /**
   @param contentId 注意喚起エリアの管理用ID
   */
  public removeAlertWarningMessage(contentId: string) {
    this._store.dispatch(removeAlertWarningMessage({ id: contentId }));
  }

  /**
   @param contentId 注意喚起エリアの管理用ID
   */
  public removeAlertInfomationMessage(contentId: string) {
    this._store.dispatch(removeAlertInfomationMessage({ id: contentId }));
  }

  public removeAllAlertWarningMessage() {
    this._store.dispatch(removeAllAlertWarningMessage());
  }

  public removeAllAlertInfomationMessage() {
    this._store.dispatch(removeAllAlertInfomationMessage());
  }

  public setAlertSubWarningMessage(item: AlertMessageItem) {
    item.alertType = AlertType.WARNING;
    item.contentId = item.contentId || 'subWarning' + this.alertMessageData.subWarningMessage.length;
    item.isClosed = false;
    this._store.dispatch(addAlertSubWarningMessage(item));
  }

  public setAlertSubInfomationMessage(item: AlertMessageItem) {
    item.alertType = AlertType.INFOMATION;
    item.contentId = item.contentId || 'subInfomation' + this.alertMessageData.subInfomationMessage.length;
    item.isClosed = false;
    this._store.dispatch(addAlertSubInfomationMessage(item));
  }

  /**
   @param contentId 注意喚起エリアの管理用ID
   */
  public removeAlertSubWarningMessage(contentId: string) {
    this._store.dispatch(removeAlertSubWarningMessage({ id: contentId }));
  }

  /**
   @param contentId 注意喚起エリアの管理用ID
   */
  public removeAlertSubInfomationMessage(contentId: string) {
    this._store.dispatch(removeAlertSubInfomationMessage({ id: contentId }));
  }

  public removeAllAlertSubWarningMessage() {
    this._store.dispatch(removeAllAlertSubWarningMessage());
  }

  public removeAllAlertSubInfomationMessage() {
    this._store.dispatch(removeAllAlertSubInfomationMessage());
  }

  public removeAllAlertMessage() {
    this._store.dispatch(removeAllAlertMessage());
  }

  public removeAllSubAlertMessage() {
    this._store.dispatch(removeAllAlertSubMessage());
  }

  public resetAlertMessage() {
    this._store.dispatch(resetAlertMessage());
  }

  public updateAlertMessage(value: AlertMessageState) {
    this._store.dispatch(updateAlertMessage(value));
  }

  public setAlertMessage(value: AlertMessageState) {
    this._store.dispatch(setAlertMessage(value));
  }
}
