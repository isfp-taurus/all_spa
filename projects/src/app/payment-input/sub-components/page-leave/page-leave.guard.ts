import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRouteSnapshot, CanDeactivate, Router, UrlCreationOptions, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { DialogConfirmService } from '../dialog-confirm';
import { PaymentInputContComponent } from '@app/payment-input/container';
import { PageLoadingStore, updatePageLoading } from '@lib/store';
import { Store } from '@ngrx/store';
import { LoadingDisplayMode } from '@lib/interfaces';

@Injectable()
export class PageLeaveGuard implements CanDeactivate<PaymentInputContComponent> {
  constructor(
    private _store: Store<PageLoadingStore>,
    private dialog: DialogConfirmService,
    private router: Router,
    public location: Location
  ) {}
  canDeactivate(
    component: PaymentInputContComponent,
    currentRoute: ActivatedRouteSnapshot
  ): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    const currentNavigation = this.router.getCurrentNavigation();

    if (currentNavigation && currentNavigation.trigger === 'popstate' && component.isPaying) {
      const currentUrlTree = this.router.createUrlTree([], currentRoute as UrlCreationOptions);
      const currentUrl = currentUrlTree.toString();
      this._store.dispatch(updatePageLoading({ loadingDisplayMode: LoadingDisplayMode.NORMAL }));
      this.location.go(currentUrl);
      this.dialog.open();
      return false;
    }
    return true;
  }
}
