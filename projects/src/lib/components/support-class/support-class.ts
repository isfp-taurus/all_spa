/**
 * コンポーネント、サービスで共通して持つ親クラス
 *
 */
import { Injectable, OnDestroy } from '@angular/core';
import { asapScheduler } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { Subject } from 'rxjs/internal/Subject';
import { Subscription } from 'rxjs/internal/Subscription';

/**
 * SupportClass、サービスで共通して持つ親クラス
 * 必要なクラスでextendsして使用する
 */
@Injectable({
  providedIn: 'root',
})
export abstract class SupportClass implements OnDestroy {
  // Subscribe するためのプロパティ
  private _subscriptionsBlock: Array<{ name: string | null; subscription: Subscription }> = [];
  constractor: any;

  constructor() {}

  // コンポーネント消滅時、
  ngOnDestroy(): void {
    this._subscriptionsBlock
      .filter((subscription) => subscription.subscription != null)
      .forEach((subscription) => subscription.subscription.unsubscribe());
    this.destroy();
  }

  /**
   * ngOnDestroy時に呼ばれる処理、継承先のコンポーネントで使用するngOnDestoroyの代替
   */
  abstract destroy(): void;

  /**
   * Subscriptionをコンポーネントで持たせないようにするための関数
   *
   * @param name  名称　ユニークになるように設定 クラス名+関数名など
   * @param observable observable処理
   * @param nextEvent 処理内容
   * @param errorEvent エラー時処理内容
   * @param completeEvent 完了時処理内容
   *
   * 使用例 this.subscribeService(this.sampleFecadeFacade.getAll(),state =>{
   *    console.log(state)
   *    if(state && state[0]){
   *      this.fecadeValue=state[0].str;
   *      this.fecadeValue2=state[0].num;
   *    }
   *  })
   *
   * takeを使用したい場合などは以下のように指定すればオペレーターも使用可能
   * this.subscribeService(this.sampleFecadeFacade.getAll().pipe(take(1)),state =>
   *
   */
  protected subscribeService<T, V>(
    name: string,
    observable$: Observable<T>,
    nextEvent: (value: T) => void,
    errorEvent?: (value: V) => void,
    completeEvent?: () => void
  ): void {
    const subscription = this._subscriptionsBlock.find((sub) => sub.name === name);
    if (subscription) {
      subscription.subscription.unsubscribe();
      this._subscriptionsBlock.splice(
        this._subscriptionsBlock.findIndex((sub) => sub.name === name),
        1
      );
    }
    this._subscriptionsBlock.push({
      name: name,
      subscription: observable$.subscribe({ next: nextEvent, error: errorEvent, complete: completeEvent }),
    });
  }

  /**
   *
   * forkJoin用
   *
   * @param name  名称　ユニークになるように設定 クラス名+関数名など
   * @param observables  Observable配列
   * @param nextEvent 処理内容
   * @param errorEvent エラー時処理内容
   * @param completeEvent 完了時処理内容
   *
   * 使用例
   * this.forkJoinService(
   *  [
   *    getResponse(this.airportListService.loadAll()),
   *    getResponse(this.regionListService.loadAll())
   *  ],
   *  ([airportState,regionState]) =>{
   *    this.airportListParts.airports=airportState.data;
   *    this.airportListParts2.airports=airportState.data;
   *    this.airportListParts.regions=regionState.data;
   *    this.airportListParts2.regions=regionState.data;
   *  }
   * )
   *
   */
  protected forkJoinService<V>(
    name: string,
    observables: Observable<any>[],
    nextEvent: (value: any[]) => void,
    errorEvent?: (value: V) => void,
    completeEvent?: () => void
  ): void {
    const subscription = this._subscriptionsBlock.find((sub) => sub.name === name);
    if (subscription) {
      subscription.subscription.unsubscribe();
      this._subscriptionsBlock.splice(
        this._subscriptionsBlock.findIndex((sub) => sub.name === name),
        1
      );
    }
    this._subscriptionsBlock.push({
      name: name,
      subscription: forkJoin(observables).subscribe({ next: nextEvent, error: errorEvent, complete: completeEvent }),
    });
  }

  /**
   * 作成したSubscriptionを基底クラスで管理させる
   * @param sub 作成したSubscription
   */
  public addSubscription(name: string, subscription: Subscription) {
    const _subscription = this._subscriptionsBlock.find((sub) => sub.name === name);
    if (_subscription) {
      _subscription.subscription.unsubscribe();
      this._subscriptionsBlock.splice(this._subscriptionsBlock.findIndex((sub) => sub.name === name));
    }
    this._subscriptionsBlock.push({ name: name, subscription });
  }

  /**
   * 作成したSubscriptionをを削除
   * @param name:subscription名
   */
  public deleteSubscription(name: string) {
    const _subscription = this._subscriptionsBlock.find((sub) => sub.name === name);
    if (_subscription) {
      _subscription.subscription.unsubscribe();
      this._subscriptionsBlock.splice(
        this._subscriptionsBlock.findIndex((sub) => sub.name === name),
        1
      );
    }
  }

  /**
   * スリープ処理
   */
  private sleep(msec: number | undefined) {
    return new Promise<void>(function (resolve) {
      asapScheduler.schedule(() => {
        resolve();
      }, msec);
    });
  }

  /**
   * スリープ処理、呼び出し用
   *
   * @param msec 待ち時間(ミリ秒)
   * @param next 処理内容
   */
  public async sleepTime(msec: number, next: () => void) {
    await this.sleep(msec);
    next();
  }

  /**
   * 処理待ち用
   *
   * 使い方の例
   *
   * サブジェクトを作成
   * const subject = new Subject();
   *
   * 処理待ちを終了するイベントの受け取り(value:any) => void 型
   * event = this.getWaitSubject(subject);
   *
   * 非同期処理の実行
   * XXXXStoreService.update(data) // storeを更新し、APIリクエストなどをする処理
   *
   * subscribeService(XXXXStoreService.observavle,(state) => {
   *  *APIが返ってきてstoreが書き換えられた時の処理*
   *  ------------------------------------------
   *  event(任意の値)
   * })
   *
   * //終了待ちイベントを実行 value には上で引数にした任意の値が返ってくる
   * const value = await this.waitEvent(subject);
   *
   */

  /**
   * 処理待ち終了イベントをsubjectに紐づけ
   */
  public getWaitSubject(subject: Subject<any>) {
    return (retVal: any) => {
      try {
        subject.next(retVal);
        subject.complete();
      } catch (err) {
        subject.error(err);
      }
    };
  }

  /**
   * 処理待ち関数
   */
  public async waitEvent(subject: Subject<any>, timeout?: number, timeoutReject = true) {
    const promiseEvent = () =>
      new Promise((resolve, reject) => {
        if (timeout) {
          asapScheduler.schedule(() => {
            if (timeoutReject) {
              reject('timeout');
            } else {
              resolve('timeout');
            }
          }, timeout);
        }
        this.subscribeService(this.constructor.name + 'waitEventSubscription', subject, (ret) => {
          resolve(ret);
        });
      });
    return await promiseEvent();
  }
}
