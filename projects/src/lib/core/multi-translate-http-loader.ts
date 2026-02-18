import { HttpClient } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';
import { deepmerge } from 'deepmerge-ts';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

/**
 * ITranslationResource
 *
 * @see {@link https://github.com/rbalet/ngx-translate-multi-http-loader/blob/v9.4.0/projects/multi-http-loader/src/lib/multi-http-loader.ts}
 */
export interface ITranslationResource {
  prefix: string;
  suffix?: string;
}

/**
 * MultiTranslateHttpLoader
 * - v9.0.0以降`HttpClient`の代わりに`HttpBackend`が使用されているため、`HttpInterceptor`が通らなくなる。
 * そのため、`HttpClient`を使用した本classを提供。
 *
 * @see {@link https://github.com/rbalet/ngx-translate-multi-http-loader/blob/v9.4.0/projects/multi-http-loader/src/lib/multi-http-loader.ts}
 */
export class MultiTranslateHttpLoader implements TranslateLoader {
  constructor(private _handler: HttpClient, private _resourcesPrefix: string[] | ITranslationResource[]) {}

  public getTranslation(lang: string): Observable<any> {
    const requests: Observable<Object | {}>[] = this._resourcesPrefix.map((resource: any) => {
      let path: string;
      if (resource.prefix) {
        path = `${resource.prefix}${lang}${resource.suffix || '.json'}`;
      } else {
        path = `${resource}${lang}.json`;
      }

      return this._handler.get(path).pipe(
        catchError(() => {
          return of({});
        })
      );
    });

    return forkJoin(requests).pipe(map((response) => deepmerge(...response)));
  }
}
