import { DOCUMENT } from '@angular/common';
import { EventEmitter, Inject, Injectable, NgZone } from '@angular/core';
import { Observable, of } from 'rxjs';
import { take, tap } from 'rxjs/operators';

/**
 * JavaScriptロードService
 * - ※3rdParty系などAngular変更検知外でロードする場合に利用。
 */
@Injectable({
  providedIn: 'root',
})
export class LoadScriptService {
  /**
   * ロード済みscript一覧
   */
  private _scripts: string[] = [];

  public constructor(@Inject(NgZone) private _ngZone: NgZone, @Inject(DOCUMENT) private _document: Document) {}

  /**
   * JavaScriptのロード処理
   *
   * @see {@link NgZone.runOutsideAngular}
   * @param src ロード対象のJavaScriptファイルパス
   * @param ignoreCached キャッシュ対象外の判断
   * @returns
   */
  public load$(src: string, ignoreCached = false): Observable<string> {
    if (ignoreCached) {
      const ignoredScript = this._document.querySelector(`script[src="${src}"]`);
      if (ignoredScript) {
        ignoredScript.remove();
      }
    } else {
      const cached: string | undefined = this._scripts.find((s: string) => s === src);
      if (cached) {
        return of(cached);
      }
    }
    // ロード済みscriptがない場合Angular Zone外でscriptをロードし、ロード済み一覧に追加
    return this._loadScript$(src)
      .asObservable()
      .pipe(
        tap((s: string) => (s && !ignoreCached ? this._scripts.push(s) : null)),
        take(1)
      );
  }

  /**
   * JavaScriptのロード処理（本処理）
   * - Angular Zone外({@link NgZone.runOutsideAngular})でscriptをロードする
   *   - scriptは、`<header>`内の`<script>`として追加される
   *
   * @param src ロード対象のJavaScriptファイルパス
   * @returns
   */
  private _loadScript$(src: string): EventEmitter<string> {
    const emitter$: EventEmitter<string> = new EventEmitter();
    const resolve = (value: string) => this._ngZone.run(() => emitter$.emit(value));
    this._ngZone.runOutsideAngular(() => {
      const $script: HTMLScriptElement = this._document.createElement('script');
      $script.src = src;
      $script.type = 'text/javascript';
      $script.async = true;
      $script.onerror = () => resolve('');
      $script.onload = () => resolve(src);
      const $head: HTMLHeadElement = this._document.getElementsByTagName('head')[0];
      if ($head) {
        $head.appendChild($script);
      }
    });

    return emitter$;
  }
}
