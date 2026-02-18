import { Component, OnInit } from '@angular/core';
// import { SupportComponent } from '../../../components/support-class';
// import { CommonLibService } from '../../../services';
import { NavigationEnd, Router } from '@angular/router';
import { DISABLED_WRAP_INNER_URLS } from '@common/helper';
import { filter } from 'rxjs';

@Component({
  selector: 'asw-contents-area',
  templateUrl: './contents-area.component.html',
})
/**
 * コンテンツ領域
 */
export class ContentsAreaComponent implements OnInit {
  public isDisabledWrapInner = false;

  constructor(private _router: Router) {}

  ngOnInit() {
    this._router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      const currentUrl = this._router.url;

      this.isDisabledWrapInner = DISABLED_WRAP_INNER_URLS.includes(currentUrl);
    });
  }
}
