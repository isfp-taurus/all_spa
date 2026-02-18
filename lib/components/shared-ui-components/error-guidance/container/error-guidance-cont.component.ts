import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { PageType, RetryableError } from '../../../../interfaces';
import { ErrorsHandlerService } from '../../../../services';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * [SharedUI] 注意喚起エリア（エラー） (container)
 *
 * @implements OnInit
 */
@Component({
  selector: 'asw-error-guidance',
  templateUrl: './error-guidance-cont.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorGuidanceContComponent implements OnInit {
  private _isSubPage = false;
  /** サブ画面識別
   * - true: サブ画面
   * - false: 通常画面（デフォルト）
   */
  @Input()
  public get isSubPage(): boolean {
    return this._isSubPage;
  }
  public set isSubPage(value: BooleanInput) {
    this._isSubPage = coerceBooleanProperty(value);
  }

  /** エラー情報 */
  public errorInfo$?: Observable<RetryableError | null>;

  /** 表示用エラー文言ID */
  public displayErrorKey$?: Observable<string | null>;

  constructor(private _errorHandlerSvc: ErrorsHandlerService) {}

  /**
   * 初期化処理
   */
  public ngOnInit(): void {
    const pageType = this.isSubPage ? PageType.SUBPAGE : PageType.PAGE;
    this.errorInfo$ = this._errorHandlerSvc.getRetryableError$(pageType).pipe(
      map((data) => {
        if (!data) {
          return null;
        } else {
          if (data.errorMsgId) {
            // 表示用エラー文言ID体系取得（エラーが発生する都度取得）
            this.displayErrorKey$ = this._errorHandlerSvc.getDisplayErrorKey$(pageType);
            return data;
          }
          this.displayErrorKey$ = of(null);
          return data;
        }
      })
    );
  }
}
