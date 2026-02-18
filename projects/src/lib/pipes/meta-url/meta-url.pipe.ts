import { ChangeDetectorRef, OnDestroy, Pipe, PipeTransform, Renderer2 } from '@angular/core';
import { MasterStoreKey } from '@conf/asw-master.config';
import { Subscription } from 'rxjs/internal/Subscription';
import { take } from 'rxjs/operators';
import { CommonLibService } from 'src/lib/services';

@Pipe({
  name: 'metaUrl',
  pure: false,
})
export class MetaUrlPipe implements PipeTransform, OnDestroy {
  private _$template!: HTMLElement;
  private _html!: string;
  private _rootUrl!: string;
  private _subscriptions: Subscription = new Subscription();

  constructor(
    private _common: CommonLibService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _renderer: Renderer2
  ) {}

  /**
   * meta URL出力
   *
   * @param {string} url 処理対象文字列
   * @returns {string}
   */
  transform(url: string): string {
    //提携ではmetaURLを利用しない。
    return url;

    this._$template = this._renderer.createElement('ng-template');
    this._renderer.setProperty(this._$template, 'innerHTML', url);
    this._html = this._$template.innerHTML;

    this._subscriptions.add(
      this._common.aswMasterService
        .getAswMasterByKey$(MasterStoreKey.PROPERTY)
        .pipe(take(1))
        .subscribe((state) => {
          this._rootUrl = state?.meta?.rootUrl[0]?.value;
          const $elements = this._$template.querySelectorAll('a');
          if ($elements.length > 0) {
            // aタグの場合
            this._updateAnchor();
          } else {
            // aタグ以外の場合
            if (url.startsWith(this._rootUrl)) {
              // meta判定ルートがパラメータ.処理対象文字列と前方一致する場合
              this._renderer.setProperty(this._$template, 'innerHTML', this._buildUrlText(url));
            }
          }
          this._html = this._$template.innerHTML;
          this._changeDetectorRef.markForCheck();
        })
    );
    return this._html.replace(/&amp;/g, '&');
  }

  ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

  private _buildUrl({ href }: HTMLAnchorElement): string {
    const connectionKind = this._common.aswContextStoreService.aswContextData.metaConnectionKind.trim();
    const lang = this._common.aswContextStoreService.aswContextData.metaLang;
    const bookingType = this._common.aswContextStoreService.aswContextData.bookingType.toLocaleLowerCase();
    const tierLevel = !this._common.amcMemberStoreService.amcMemberData.tierLevel
      ? 'none'
      : this._common.amcMemberStoreService.amcMemberData.tierLevel;

    return `${href}?CONNECTION_KIND=${connectionKind}&LANG=${lang}&BOOKING_TYPE=${bookingType}&TIER_LEVEL=${tierLevel}`;
  }

  private _buildUrlText(url: string): string {
    const connectionKind = this._common.aswContextStoreService.aswContextData.metaConnectionKind.trim();
    const lang = this._common.aswContextStoreService.aswContextData.metaLang;
    const bookingType = this._common.aswContextStoreService.aswContextData.bookingType.toLocaleLowerCase();
    const tierLevel = !this._common.amcMemberStoreService.amcMemberData.tierLevel
      ? 'none'
      : this._common.amcMemberStoreService.amcMemberData.tierLevel;

    return `${url}?CONNECTION_KIND=${connectionKind}&LANG=${lang}&BOOKING_TYPE=${bookingType}&TIER_LEVEL=${tierLevel}`;
  }

  private _updateAnchor() {
    if (this._rootUrl === undefined) return;
    const $elements = this._$template.querySelectorAll('a');
    Array.from($elements)
      .filter(({ href }: HTMLAnchorElement) => href.startsWith(this._rootUrl))
      .forEach(($a: HTMLAnchorElement) => {
        this._renderer.setAttribute($a, 'href', this._buildUrl($a));
      });
  }
}
