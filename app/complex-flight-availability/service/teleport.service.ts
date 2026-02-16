import { Injectable } from '@angular/core';
import { SupportClass } from '@lib/components/support-class/support-class';
import { Subject } from 'rxjs';
import { EmitDataType } from './teleport.state';

export class TeleportSingleton {
  private static _instance: TeleportSingleton;

  /** @var イベントMap */
  private _eventMap: Map<string | symbol, Subject<unknown>> = new Map();

  /** @var 受信イベントの隊列Map */
  private _waitQueueMap: Map<string | symbol, ((name: string | symbol) => void)[]> = new Map();

  /** @var イベントの触発回数Map */
  private _eventCountMap: Map<string | symbol, number> = new Map();

  /** @var イベントのデータの集まるMap */
  private _eventDataMap: Map<string | symbol, unknown> = new Map();

  /** @var 多重イベントの触発回数Map */
  private _multiEventsList: string[][] = [];

  /** @var 多重イベントの更新する回数Map */
  private _eventUpdateMap: Map<string | symbol, number> = new Map();

  // 構造関数
  private constructor() {}

  // イベントのデータをクリア
  protected _clearEventUpdateMap() {
    this._eventUpdateMap = new Map();
  }

  // 多重イベントの更新する回数を記録
  protected _addEventUpdateMap(eventName: string | symbol, data: number) {
    this._eventUpdateMap.set(eventName, data);
  }

  // 多重イベントの更新する回数
  protected _getEventUpdateMap(eventName: string | symbol): number {
    return this._eventUpdateMap.get(eventName) ?? 0;
  }

  // イベントのデータをクリア
  protected _clearEventDataMap() {
    this._eventDataMap = new Map();
  }

  // イベントのデータを記録
  protected _addEventData(eventName: string | symbol, data: unknown) {
    this._eventDataMap.set(eventName, data);
  }

  // イベントのデータを取得
  protected _getEventData(eventName: string | symbol): unknown {
    return this._eventDataMap.get(eventName);
  }

  // 触発回数をゼロにする
  protected _clearEventCountMap() {
    this._eventCountMap = new Map();
  }

  // 触発回数を記録
  protected _addEventTimes(eventName: string | symbol) {
    let num = this._eventCountMap.get(eventName) ?? 0;
    num += 1;
    this._eventCountMap.set(eventName, num);
  }

  // 触発回数を取得
  protected _getEventTimes(eventName: string | symbol) {
    return this._eventCountMap.get(eventName) ?? 0;
  }

  // 多重イベントの名を生成
  protected _genMultiEventName(nameList: string[]): string {
    return nameList.join(',');
  }

  // 多重送信イベントをチェックする、多重イベントを全部送信した場合、自動的に多重イベントを触発
  protected _checkMultiEvents() {
    for (let i = 0; i < this._multiEventsList.length; i++) {
      const eventsList = this._multiEventsList[i];
      const timesArr = new Array(eventsList.length).fill(0);
      for (let j = 0; j < eventsList.length; j++) {
        const eventName = eventsList[j];
        const triggeredTimes = this._getEventTimes(eventName);
        timesArr[j] = triggeredTimes;
      }
      // is contains 0 in timesArr;
      const isNotContains0 = timesArr.indexOf(0) === -1;
      const updateEventName = this._genMultiEventName(eventsList);
      const lastTrace = this._getEventUpdateMap(updateEventName) ?? 0;
      const currentUpdateTimes = timesArr.reduce((x, y) => x + y, 0);

      if (isNotContains0) {
        if (currentUpdateTimes !== lastTrace) this._autoEmit(eventsList);
        this._addEventUpdateMap(updateEventName, currentUpdateTimes);
      }
    }
  }

  // 自動的にデータを発送する
  protected _autoEmit(eventsList: string[]) {
    const multiEventsName = this._genMultiEventName(eventsList);

    // データを集めて、取得し
    const dataList = [] as unknown[];
    eventsList.forEach((eventName) => {
      const _data = this._getEventData(eventName);
      dataList.push(_data);
    });

    // 送信データ
    const emitData: EmitDataType<unknown[]> = {
      data: dataList,
    };

    const subject = this._eventMap.get(multiEventsName);
    if (!subject) {
      const _subject = new Subject<unknown>();
      this._eventMap.set(multiEventsName, _subject);
      // receiveのハンドルがない場合は、積み重ねてくる。
      this._add2WaitMap(multiEventsName, (_name: string | symbol) => {
        const ptr = this._eventMap.get(_name);
        ptr?.next(emitData);
      });
      return;
    }
    subject.next(emitData);
  }

  // インスタンを取得
  static getInstance(): TeleportSingleton {
    if (!this._instance) {
      this._instance = new TeleportSingleton();
    }
    return this._instance;
  }

  // 終わるハンドル
  destroy() {
    this.clear();
  }

  /**
   * もし、receiveがない場合は、待つMapに追加
   * @param name イベントの名前
   * @param handlers ハンドル
   */
  protected _add2WaitMap(name: string | symbol, ...handlers: ((name: string | symbol) => void)[]) {
    if (this._waitQueueMap.has(name)) {
      const queue = this._waitQueueMap.get(name) ?? [];
      queue?.push(...handlers);
      this._waitQueueMap.set(name, queue);
      return;
    }
    this._waitQueueMap.set(name, handlers);
  }

  /**
   * 待つハンドルを全部で実行し
   * @param {string} name イベントの名前
   */
  protected _fireWaitHandlers(name: string | symbol) {
    const queue = this._waitQueueMap.get(name) ?? [];
    while (queue.length) {
      const fn = queue.shift();
      if (fn) {
        fn(name);
        // 回数を記録
        this._addEventTimes(name);
      }
    }
    this._waitQueueMap.set(name, []);
  }

  /**
   * @description データを発送する
   * @param {string|symbol} name イベントの名前
   * @param {T} data データ
   * @param {() => void} callback コールバック関数
   */
  public emit<T>(name: string | symbol, data: T, callback?: () => void) {
    const afterEmit = () => {
      // 回数を記録
      this._addEventTimes(name);
      this._checkMultiEvents();
    };

    // 送信データ
    const emitData: EmitDataType<T> = {
      data: data,
      callback: callback,
    };

    // データを記録
    this._addEventData(name, data);

    const subject = this._eventMap.get(name);
    if (!subject) {
      const _subject = new Subject<unknown>();
      this._eventMap.set(name, _subject);
      // receiveのハンドルがない場合は、積み重ねてくる。
      this._add2WaitMap(name, (_name: string | symbol) => {
        const ptr = this._eventMap.get(_name);
        ptr?.next(emitData);
        afterEmit();
      });
      return;
    }
    subject.next(emitData);
    afterEmit();
  }

  /**
   * @description データをいただく
   * @param {String|symbol} name イベントの名前
   * @param {(data:T) => void} handle データをいただくハンドル
   * @returns {TeleportServiceSingleton}
   */
  public receive<T>(name: string | symbol, handle: (data: T) => void): TeleportSingleton {
    // 受信ハンドル
    const eventHandle = (emitData: unknown) => {
      const obj = emitData as EmitDataType<T>;
      handle(obj.data);
      obj.callback && obj.callback();
    };

    const subject = this._eventMap.get(name);
    if (!subject) {
      const ptr = new Subject<unknown>();
      this._eventMap.set(name, ptr);
      ptr.subscribe({ next: eventHandle });
      return this;
    }
    // 直接に受信を準備
    subject.subscribe({ next: eventHandle });
    // 積み重ねを検査し、ある場合は実行し
    if ((this._waitQueueMap.get(name) ?? []).length) {
      this._fireWaitHandlers(name);
    }
    return this;
  }

  /**
   * @description 複数のデータをいただく
   * @param {Array<String|symbol>} name イベントの名前
   * @param {(data:unknown) => void} handle データをいただくハンドル
   * @returns {TeleportServiceSingleton}
   */
  public multiReceive(nameList: string[], handle: (...data: unknown[]) => void): TeleportSingleton {
    // 多重イベントを追加し
    this._multiEventsList.push(nameList);

    // defaultイベントを追加し
    nameList.forEach((eventName) => {
      this.receive(eventName, () => {});
    });

    // 受信ハンドル
    const eventHandle = (emitData: unknown) => {
      const obj = emitData as EmitDataType<unknown>;
      handle(...(obj.data as unknown[]));
      obj.callback && obj.callback();
    };

    const eventsNameList = this._genMultiEventName(nameList);
    const subject = this._eventMap.get(eventsNameList);
    if (!subject) {
      const ptr = new Subject<unknown>();
      this._eventMap.set(eventsNameList, ptr);
      ptr.subscribe({ next: eventHandle });
      return this;
    }
    // 直接に受信を準備
    subject.subscribe({ next: eventHandle });
    // 積み重ねを検査し、ある場合は実行
    if ((this._waitQueueMap.get(eventsNameList) ?? []).length) {
      this._fireWaitHandlers(eventsNameList);
    }
    return this;
  }

  /**
   * ハンドルを削除
   * @param {string} name
   */
  public removeHandle(name: string) {
    const subject = this._eventMap.get(name);
    subject?.unsubscribe();
  }

  /**
   * 全てのハンドルを削除
   */
  public removeAllHandle() {
    this._eventMap.clear();
  }

  /**
   * 全てのハンドルと受信イベントの隊列のデータを削除
   */
  public clear() {
    this._waitQueueMap.clear();
    this._clearEventCountMap();
    this._clearEventDataMap();
    this._clearEventUpdateMap();
    this.removeAllHandle();
  }
}

/**
 *
 *  @class Teleport Service
 *  @description 違うcomponentでも通信できる、angularのDIで使おう。
 *  #### 使い方:
 *  - 送信方法: this._teleportService.emit<T>("eventName", data);
 *  - 受信方法: this._teleportService.receive<T>("eventName", (data:T) => { ... });
 *  - waitQueueMapを活かして、同期か非同期を心配しないで、lifecycleも
 */
@Injectable({
  providedIn: 'root',
})
export class ComplexFlightAvailabilityTeleportService extends SupportClass {
  protected instance = TeleportSingleton.getInstance();

  constructor() {
    super();
  }

  override destroy(): void {
    this.clear();
  }

  /**
   * @description データを発送する
   * @param {string|symbol} name イベントの名前
   * @param {T} data データ
   * @param {() => void} callback コールバック関数
   */
  public emit<T>(name: string | symbol, data: T, callback?: () => void) {
    this.instance.emit(name, data, callback);
  }

  /**
   * @description データをいただく
   * @param {String|symbol} name イベントの名前
   * @param {(data:T) => void)} handle データをいただくハンドル
   * @returns {TeleportServiceSingleton}
   */
  public receive<T>(name: string | symbol, handle: (data: T) => void): TeleportSingleton {
    this.instance.receive(name, handle);
    return this.instance;
  }

  /**
   * @description データをいただく
   * @param {(String)[]} nameList イベントの名前のリスト
   * @param {(data:T) => void)} handle データをいただくハンドル
   * @returns {TeleportServiceSingleton}
   */
  public multiReceive(nameList: string[], handle: (...data: any[]) => void): TeleportSingleton {
    this.instance.multiReceive(nameList, handle);
    return this.instance;
  }

  /**
   * ハンドルを削除
   * @param {string} name
   */
  public removeHandle(name: string) {
    this.instance.removeHandle(name);
  }

  /**
   * 全てのハンドルを削除
   */
  public removeAllHandle() {
    this.instance.clear();
  }

  /**
   * 全てのハンドルと受信イベントの隊列のデータを削除
   */
  public clear() {
    this.instance.clear();
  }
}
