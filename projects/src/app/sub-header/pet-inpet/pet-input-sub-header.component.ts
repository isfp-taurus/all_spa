/**
 * サブヘッダー
 */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { CommonLibService, DialogDisplayService } from '@lib/services';
import { SupportComponent } from '@lib/components/support-class';
import { fromEvent, take, throttleTime } from 'rxjs';
import { isPC } from '@lib/helpers';
import { DialogClickType, DialogType } from '@lib/interfaces';
import { RoutesResRoutes } from '@conf/routes.config';
import { Router } from '@angular/router';
import { PetInputStoreService } from '@common/services';
import { CartsUpdatePetRakunoriRequestServicesPetDetailInner } from 'src/sdk-reservation';
import { PetInputState } from '@common/store';

/**
 * ペットらくのりサブヘッダー
 *
 */
@Component({
  selector: 'asw-pet-input-sub-header',
  templateUrl: './pet-input-sub-header.component.html',
  providers: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PetInputSubHeaderComponent extends SupportComponent {
  private readonly DIALOG_INFO_MSG0524 = {
    type: DialogType.WARN,
    message: 'm_dynamic_message-MSG0524',
  };

  constructor(
    private _common: CommonLibService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _router: Router,
    private _dialogService: DialogDisplayService,
    private _petInputStoreService: PetInputStoreService
  ) {
    super(_common);
  }

  /** 画面サイズ判定(PC) */
  public isPc = isPC();

  /** 画面サイズ比較用変数(PC) */
  public isPcPre = this.isPc;

  /** 画面サイズチェック用関数 */
  private _resizeEvent = () => {
    this.isPcPre = this.isPc;
    this.isPc = isPC();
    if (this.isPcPre !== this.isPc) {
      this._changeDetectorRef.markForCheck();
    }
  };

  init(): void {
    // 画面サイズチェック開始
    this.subscribeService('SubHeaderResize', fromEvent(window, 'resize').pipe(throttleTime(500)), this._resizeEvent);
  }

  /**
   * 戻るボタンクリック
   */
  public clickReturnButton() {
    this.subscribeService(
      'petInputClickReturnButton',
      this._petInputStoreService.getPetInput$().pipe(take(1)),
      (petInputState) => {
        this.deleteSubscription('petInputClickReturnButton');
        // 変更が入っている場合は確認ダイアログを表示する
        if (this.checkFormChanges(petInputState)) {
          this._dialogService.openDialog(this.DIALOG_INFO_MSG0524).buttonClick$.subscribe((result) => {
            if (result.clickType === DialogClickType.CONFIRM) {
              this._petInputStoreService.resetPetInput();
              this._router.navigate([RoutesResRoutes.PLAN_REVIEW]);
            }
          });
        } else {
          this._router.navigate([RoutesResRoutes.PLAN_REVIEW]);
        }
      }
    );
  }

  /**
   * ペットらくのりの入力フォームに変更が入っているかチェックする
   *
   * @param petInputState ペットらくのり画面用ストア情報
   * @return true: 変更されている場合, false: 変更されていない場合
   */
  private checkFormChanges(petInputState: PetInputState): boolean {
    const petDetails = petInputState.petDetails ?? [];
    const registeredPetDetails = petInputState.registeredPetDetails ?? [];

    if (petDetails.length !== registeredPetDetails.length) {
      return true;
    }

    // 変更が入っていたらtrue
    let checkResult = false;

    // TODO: リファクタ余地有り
    petDetails.some((petDetail, index) => {
      checkResult = this.checkFormsDeeply(petDetail, registeredPetDetails[index]);
      if (checkResult) return true;
      return false;
    });

    return checkResult;
  }

  /**
   * ペットらくのりの入力フォームを1要素ずつ変更が入っているかチェックする
   *
   * @param petDetail ペット申込情報
   * @param registeredPetDetail 比較用ペット申込情報
   * @return true: 変更されている場合, false: 変更されていない場合
   */
  private checkFormsDeeply(
    petDetail: CartsUpdatePetRakunoriRequestServicesPetDetailInner,
    registeredPetDetail: CartsUpdatePetRakunoriRequestServicesPetDetailInner
  ): boolean {
    if (
      petDetail.index !== registeredPetDetail.index ||
      petDetail.cage.petType !== registeredPetDetail.cage.petType ||
      petDetail.cage.cageType !== registeredPetDetail.cage.cageType ||
      petDetail.cage.lendingCageType !== registeredPetDetail.cage.lendingCageType ||
      petDetail.cage.weight !== registeredPetDetail.cage.weight ||
      petDetail.cage.size?.width !== registeredPetDetail.cage.size?.width ||
      petDetail.cage.size?.depth !== registeredPetDetail.cage.size?.depth ||
      petDetail.cage.size?.height !== registeredPetDetail.cage.size?.height
    ) {
      return true;
    }
    return false;
  }

  reload(): void {}
  destroy(): void {}
}
