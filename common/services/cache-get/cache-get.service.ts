import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SupportClass } from '@lib/components/support-class';
import { CommonLibService, ErrorsHandlerService } from '@lib/services';
import { environment } from '@env/environment';
import { catchError, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CacheGetService extends SupportClass {
  constructor(private _common: CommonLibService, private _http: HttpClient) {
    super();
  }

  public getCache(filepath: string): Observable<any> {
    return this._http.get(`${environment.spa.baseUrl}${environment.spa.app.cache}/${filepath}`).pipe(
      catchError((e) => {
        return of({ e });
      })
    );
  }

  destroy(): void {}
}
