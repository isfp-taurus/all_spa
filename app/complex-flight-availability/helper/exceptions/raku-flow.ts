import { Context, DictionaryType } from './initial.state';
import { InitialBase } from './initial-base.class';
import { Dictionary } from '@ngrx/entity';
import { FlowRuntimeError } from './exceptions/flow-runtime-error.class';

/**
 * auto inject decoration
 * @description 値を自動的に挿入する
 * @returns {PropertyDecorator}
 */
const usedServiceSet = new Set<string>();
export function AutoInject(): PropertyDecorator {
  return (target, propertyIdentifier: string | symbol) => {
    if (!((propertyIdentifier as string).startsWith('_') && (propertyIdentifier as string).endsWith('Service'))) {
      throw new Error(`Inject property [${String(propertyIdentifier)}] should start with "_" and end with "Service".`);
    }
    usedServiceSet.add(propertyIdentifier as string);
    (target as { [key: string | symbol]: unknown })[propertyIdentifier] = undefined;
  };
}

/**
 * RakuFlow [らくのFlow]
 * - 複雑な初期処理は簡単になる
 * @template T:　処理クラスのインスタンス
 * @template K:　componentのポイント
 */
export class RakuFlow<T, K> {
  // 初期処理の流れ
  private containerList: T[] = [];

  // contextを作り
  public context: Context = {
    containers: new Map<string, unknown>(),
  };

  // 構造関数
  constructor(public root: K) {
    this._registerContainers<K>(this.root);
  }

  /**
   * propertyの後ろからの名前は`xxxService`があれば、自動でサービスのリストを集まる。
   * _xxxService => xxxService
   * { xxxService: instance }というobjectを生成する
   * @param clazz pointer
   * @returns {DictionaryType}
   */
  private _generateRegisterContainersList<K>(clazz: K) {
    const obj = {} as DictionaryType<unknown>;
    const propertiesList: string[] = Object.keys(clazz as unknown as DictionaryType<unknown>);
    const list = propertiesList.filter((name: string) => name.endsWith('Service'));
    const strWithoutUnderscore = (str: string) => str.replace(/^_+/, '');
    list.forEach(
      (item: string) => (obj[strWithoutUnderscore(item)] = (clazz as unknown as DictionaryType<unknown>)[item])
    );
    return obj;
  }

  /**
   * サービスを追加
   * @param clazz pointer
   */
  private _registerContainers<K>(clazz: K) {
    const map = this._generateRegisterContainersList<K>(clazz);
    for (const key in map) {
      this.context.containers.set(key, map[key]);
    }
  }

  /**
   * サービスを名前で取得
   * -eg: xxxService
   * @param {string} key
   * @returns
   */
  public resolveContainer<T>(key: string): T | undefined {
    const container = this.context.containers.get(key);
    if (!container) return undefined;
    return container as T;
  }

  /**
   * ハンドルを追加
   * @param container インスタンス
   */
  public addInstance(...container: T[]) {
    this.containerList.push(...container);
  }

  /**
   * 「同期」処理の実行
   * @param fn callback
   */
  public execute(fn: (_obj: T) => void) {
    this.containerList.forEach((obj: T) => {
      try {
        fn(obj);
      } catch (error) {
        if (error instanceof Error) {
          throw new FlowRuntimeError(error);
        }
      }
    });
  }

  /**
   * 「非同期」処理の実行
   * @param fn callback
   */
  public async executeAsyncMethod(fn: (_obj: T, _stop: () => void) => void) {
    let isNext = true;
    const stop = () => (isNext = false);

    function* eventIterator(_this: RakuFlow<T, K>) {
      for (let i = 0; i < _this.containerList.length; i++) {
        const obj = _this.containerList[i];
        if (isNext) yield fn(obj, stop);
      }
    }

    try {
      const eventsIterator = eventIterator(this);
      for await (const _ of eventsIterator) {
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new FlowRuntimeError(error);
      }
    }
  }

  /**
   * サービスが自動的に挿入されます。サービスがない場合、または名前が間違っている場合は、エラーがスローされます。
   * @param {InitialBase} ptr 子クラスのポインタ
   * @throws {Error} serviceが見つからない場合は、投げ出す
   */
  public autoInjectService(ptr: InitialBase) {
    for (const property in ptr) {
      const value = (ptr as unknown as Dictionary<unknown>)[property];
      // Serviceに該当するpropertyを判断する
      if (property.startsWith('_') && property.endsWith('Service') && !value) {
        const strWithoutUnderscore = (str: string) => str.replace(/^_+/, '');
        const service = this.resolveContainer(strWithoutUnderscore(property));
        (ptr as unknown as Dictionary<unknown>)[property] = service;
        if (!service)
          throw new Error(
            `[autoInjectService]: ${property} wasn't registered. maybe wrong with spell or miss _. or not contains "Service"\n`
          );
      }
    }
  }
}
