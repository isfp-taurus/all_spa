import { Injectable } from '@angular/core';
import { CanActivate, UrlTree, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { ErrorPageRoutes } from '../interfaces';
import { RoutesCommon } from '@conf';

/**
 * エラーハンドリングGuard
 */
@Injectable({
  providedIn: 'root',
})
export class ErrorsHandlerGuard implements CanActivate {
  constructor(private _router: Router) {}

  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    const commonType = route.paramMap.get('type');
    switch (commonType) {
      case ErrorPageRoutes.SERVICE:
      case ErrorPageRoutes.SYSTEM:
      case ErrorPageRoutes.SESSION_TIMEOUT:
      case ErrorPageRoutes.BROWSER_BACK:
        return true;
      default:
        // typeが上記以外の場合、システムエラー画面に遷移
        return this._router.parseUrl(`${RoutesCommon.COMMON}/${ErrorPageRoutes.SYSTEM}`);
    }
  }
}
