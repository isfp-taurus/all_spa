import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, QueryList, ViewChildren } from '@angular/core';
import { AgreementAreaParts, RadioGroupComponent } from '@lib/components';
import { SupportComponent } from '@lib/components/support-class';
import { AswValidators, isPC } from '@lib/helpers';
import { StaticMsgPipe } from '@lib/pipes';
import { CommonLibService, DialogDisplayService, ErrorsHandlerService, PageLoadingService } from '@lib/services';
import { fromEvent, throttleTime } from 'rxjs';
import { MListData } from '@common/interfaces';
import { PetInputCageSize } from '@common/interfaces/reservation/pet-input/cage-size.interface';
import { CancelPrebookService, CurrentCartStoreService, PetInputStoreService } from '@common/services';
import { PetInputPassenger } from '@common/interfaces/reservation/pet-input/passenger.interface';
import { CartsUpdatePetRakunoriRequestServicesPetDetailInnerCage } from 'src/sdk-reservation';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { DialogClickType, DialogType, ValidationErrorInfo } from '@lib/interfaces';
import { PetInfoInputComponent } from '../sub-components/pet-info-input/pet-info-input.component';
import {
  PetInputPetDetailForm,
  PetInputPetDetailFormErrorMessage,
  PET_INPUT_DEPTH_VALIDATOR,
  PET_INPUT_HEIGHT_VALIDATOR,
  PET_INPUT_CARRYON_WEIGHT_VALIDATOR,
  PET_INPUT_LENDING_WEIGHT_VALIDATOR,
  PET_INPUT_WIDTH_VALIDATOR,
} from './pet-input-pres.state';
import { PetInputPresService } from './pet-input-pres.service';
import { PetInputInformation } from '@common/interfaces/reservation/pet-input/pet-input-information.interface';
import { PetInputContComponent } from '../container/pet-input-cont.component';

@Component({
  selector: 'asw-pet-input-pres',
  templateUrl: './pet-input-pres.component.html',
  styleUrls: ['./pet-input-pres.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PetInputPresComponent extends SupportComponent {
  /** ペット情報 */
  @Input()
  set petInputInformation(data: PetInputInformation) {
    this.petInfo = data;
    this.init();
  }

  /** 表示用ペットの種類情報リスト */
  @Input() petTypeList: Array<MListData> = [];

  /** 表示用ケージ種類情報リスト */
  @Input() cageTypeList: Array<MListData> = [];

  /** 表示用ケージサイズ情報リスト */
  @Input() cageSizeList: Array<PetInputCageSize> = [];

  /** 表示用ケージサイズ説明文リスト */
  @Input() cageSizeExplainList: Array<MListData> = [];

  @ViewChildren(PetInfoInputComponent)
  public petInfoInputComponent?: QueryList<PetInfoInputComponent>;

  /** ペット情報リスト */
  public petInfo: PetInputInformation = this._petInputContService.initPetInputInformation();

  /**
   * 同意文言エリア設定項目
   */
  public agreementAreaParams: AgreementAreaParts = {
    partsTitle: 'Terms of Condition',
    submitText: this._staticMsg.transform('label.request'),
    isModal: false,
  };

  /** 搭乗者リスト */
  public passengerList: Array<PetInputPassenger> = [];

  /** 登録済みペットインデックス末尾 */
  public registeredPetFinalIndex: number = 0;

  /** 貸出ケージ申込可否状態 */
  public isCageRentalAvailable: boolean = false;

  /** 表示用入力チェックエラー情報 */
  public errorMessages: PetInputPetDetailFormErrorMessage[] = [];

  /** 代表者入力初期選択 */
  public selectedRepresentativeTravelerId: string = '';

  /** フォームコントロール */
  public petInputForm: FormGroup = new FormGroup({});

  /** 画面情報 */
  public petDetail?: Array<PetInputPetDetailForm> = [];

  /** 画面サイズ判定(PC) */
  public isPc = isPC();

  /** 画面サイズ比較用変数(PC) */
  public isPcPre = this.isPc;

  constructor(
    private _common: CommonLibService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _staticMsg: StaticMsgPipe,
    private _dialogService: DialogDisplayService,
    private _petInputStoreService: PetInputStoreService,
    private _currentCartStoreService: CurrentCartStoreService,
    private _errorsHandlerService: ErrorsHandlerService,
    private _cancelPrebookService: CancelPrebookService,
    private _petInputPresService: PetInputPresService,
    private _petInputContService: PetInputContComponent,
    private _pageLoadingService: PageLoadingService
  ) {
    super(_common);
  }

  /**
   * 初期処理
   */
  init(): void {
    this.subscribeService('SubHeaderResize', fromEvent(window, 'resize').pipe(throttleTime(500)), this._resizeEvent);

    // ケージサイズタイトル表示
    this.cageSizeList = this.cageSizeList.map((cageSize) => {
      return {
        ...cageSize,
        display_title: cageSize.value.slice(0, 1),
      };
    });

    // 画面から参照する用
    this.petDetail = this.petInfo.registeredPetDetails?.map((petDetail) => {
      const isRegistered = this.petInfo.isRegistered;
      return {
        cageType: petDetail.cage.cageType,
        depth: petDetail.cage.size?.depth,
        height: petDetail.cage.size?.height,
        width: petDetail.cage.size?.width,
        lendingCageType: isRegistered
          ? (this._petInputPresService.convertCartCageTypeToListData(petDetail.cage.lendingCageType) as
              | CartsUpdatePetRakunoriRequestServicesPetDetailInnerCage.LendingCageTypeEnum
              | undefined)
          : undefined,
        petType: petDetail.cage.petType,
        weight: petDetail.cage.weight,
      };
    });

    this._formInit();

    this.passengerList = this._petInputPresService.makePassengerList(this.petInfo);
    this.selectedRepresentativeTravelerId = this.petInfo.representativeTravelerId ?? '';
    // 貸出ケージ申込可否状態をセットする
    this.isCageRentalAvailable =
      this._currentCartStoreService.CurrentCartData.data?.plan?.cartEligibilities?.isPetRakunoriCageLendingEligible ??
      false;

    // フォームの変更監視
    // 戻るボタンクリック時に入力フォームが変更されているかチェックするため、逐次ストアを更新する
    this.subscribeService(
      'petInputPresValueChanges',
      this.petInputForm.valueChanges.pipe(throttleTime(100)),
      (value) => {
        // 画面表示用変数を更新
        this.petDetail = value.petDetail.map((petDetail: PetInputPetDetailForm) => {
          return {
            ...petDetail,
            depth: Number(petDetail?.depth) ?? 0,
            height: Number(petDetail?.height) ?? 0,
            width: Number(petDetail?.width) ?? 0,
            weight: Number(petDetail?.weight) ?? 0,
          };
        });

        // ストア更新
        this._petInputStoreService.updatePetInput({
          petDetails: this._petInputPresService.makeCartsUpdatePetRakunoriRequestServicesPetDetailInner(
            this.petDetail ?? []
          ),
        });
      }
    );
  }

  /**
   * フォーム作成関数
   * @param cageType ケージの種類
   * @param registeredCage カート情報：登録済みペット情報
   * @return ペット情報入力エリアフォームグループ
   */
  private _getFormGroup(
    cageType: CartsUpdatePetRakunoriRequestServicesPetDetailInnerCage.CageTypeEnum,
    registeredCage?: CartsUpdatePetRakunoriRequestServicesPetDetailInnerCage
  ): FormGroup {
    const isRegistered = this.petInfo.isRegistered;
    return new FormGroup({
      petType: new FormControl(registeredCage?.petType ?? '', [
        AswValidators.required({ params: { key: 0, value: 'label.typeOfPet' } }),
      ]),
      cageType: new FormControl(registeredCage?.cageType ?? cageType),
      // 登録済みペットがいない場合は、ストアに"S"が入っているため、空文字にして画面表示する
      lendingCageType: new FormControl(
        isRegistered
          ? this._petInputPresService.convertCartCageTypeToListData(registeredCage?.lendingCageType) ?? ''
          : '',
        (registeredCage?.cageType ?? cageType) ===
        CartsUpdatePetRakunoriRequestServicesPetDetailInnerCage.CageTypeEnum.Lending
          ? [AswValidators.required({ params: { key: 0, value: 'label.width' } })]
          : undefined
      ),
      width: new FormControl(
        isRegistered ? registeredCage?.size?.width ?? '' : '',
        (registeredCage?.cageType ?? cageType) ===
        CartsUpdatePetRakunoriRequestServicesPetDetailInnerCage.CageTypeEnum.CarryOn
          ? PET_INPUT_WIDTH_VALIDATOR
          : undefined
      ),
      depth: new FormControl(
        isRegistered ? registeredCage?.size?.depth ?? '' : '',
        (registeredCage?.cageType ?? cageType) ===
        CartsUpdatePetRakunoriRequestServicesPetDetailInnerCage.CageTypeEnum.CarryOn
          ? PET_INPUT_DEPTH_VALIDATOR
          : undefined
      ),
      height: new FormControl(
        isRegistered ? registeredCage?.size?.height ?? '' : '',
        (registeredCage?.cageType ?? cageType) ===
        CartsUpdatePetRakunoriRequestServicesPetDetailInnerCage.CageTypeEnum.CarryOn
          ? PET_INPUT_HEIGHT_VALIDATOR
          : undefined
      ),
      weight: new FormControl(
        isRegistered ? registeredCage?.weight ?? '' : '',
        (registeredCage?.cageType ?? cageType) ===
        CartsUpdatePetRakunoriRequestServicesPetDetailInnerCage.CageTypeEnum.CarryOn
          ? PET_INPUT_CARRYON_WEIGHT_VALIDATOR
          : PET_INPUT_LENDING_WEIGHT_VALIDATOR
      ),
    });
  }

  /**
   * フォーム初期処理
   */
  private _formInit() {
    const petInfoFormArray = new FormArray([] as any[]);
    this.registeredPetFinalIndex = 0;

    // 登録済みのペットがいない場合は、registeredPetDetailsには空の要素が１つ入っている状態になる
    this.petInfo.registeredPetDetails?.forEach((registeredPetDetail) => {
      petInfoFormArray?.push(
        this._getFormGroup(this.isCageRentalAvailable ? 'lending' : 'carryOn', registeredPetDetail.cage)
      );
      this.errorMessages.push({ width: '', depth: '', height: '', lending: '' });
      this.registeredPetFinalIndex++;
    });

    // フォーム
    this.petInputForm = new FormGroup({
      representativeTravelerId: new FormControl(this.petInfo.representativeTravelerId ?? ''),
      petDetail: petInfoFormArray,
    });
  }

  /**
   * ケージサイズ(貸出)変更時のイベント
   * @param event イベント情報
   * @param index ペット情報インデックス
   */
  public changelendingCageType(event: Event, index: number): void {
    // フォームデータ更新
    const target = event.target as HTMLInputElement;
    const petDetail = this.petInputForm.get('petDetail') as FormArray;
    const formGroup = petDetail.at(index) as FormGroup;
    formGroup.get('lendingCageType')?.setValue(target.value);

    // エラーをクリア
    this.errorMessages[index].lending = '';
    this._changeDetectorRef.markForCheck();
  }

  /**
   * ケージの種類選択時
   *
   * @param event ラジオボタンクリック時のコンポーネント状態
   * @param index 操作中ペット情報のインデックス
   */
  public changeCageType(event: RadioGroupComponent, index: number): void {
    // フォーム値設定
    const petDetail = this.petInputForm.get('petDetail') as FormArray;
    const formGroup = petDetail.at(index) as FormGroup;
    formGroup.get('cageType')?.setValue(event.data);

    // バリデーションチェック再設定
    if (event.data === CartsUpdatePetRakunoriRequestServicesPetDetailInnerCage.CageTypeEnum.Lending) {
      (this.petInputForm.get('petDetail') as FormArray).at(index)?.get('depth')?.clearValidators();
      (this.petInputForm.get('petDetail') as FormArray).at(index)?.get('height')?.clearValidators();
      (this.petInputForm.get('petDetail') as FormArray).at(index)?.get('width')?.clearValidators();
      (this.petInputForm.get('petDetail') as FormArray).at(index)?.get('weight')?.clearValidators();
      (this.petInputForm.get('petDetail') as FormArray)
        .at(index)
        ?.get('lendingCageType')
        ?.addValidators(AswValidators.required({ params: { key: 0, value: 'label.cageSize' } }));
      (this.petInputForm.get('petDetail') as FormArray)
        .at(index)
        ?.get('weight')
        ?.addValidators(PET_INPUT_LENDING_WEIGHT_VALIDATOR);
    } else {
      (this.petInputForm.get('petDetail') as FormArray).at(index)?.get('lendingCageType')?.clearValidators();
      (this.petInputForm.get('petDetail') as FormArray)
        .at(index)
        ?.get('height')
        ?.addValidators(PET_INPUT_HEIGHT_VALIDATOR);
      (this.petInputForm.get('petDetail') as FormArray)
        .at(index)
        ?.get('width')
        ?.addValidators(PET_INPUT_WIDTH_VALIDATOR);
      (this.petInputForm.get('petDetail') as FormArray)
        .at(index)
        ?.get('depth')
        ?.addValidators(PET_INPUT_DEPTH_VALIDATOR);
      (this.petInputForm.get('petDetail') as FormArray)
        .at(index)
        ?.get('weight')
        ?.addValidators(PET_INPUT_CARRYON_WEIGHT_VALIDATOR);
    }

    // バリデーションチェック結果アップデート
    this.updateValueAndValidityAll();
  }

  /**
   * バリデーションチェック結果アップデート
   */
  public updateValueAndValidityAll() {
    for (let index = 0; index < (this.petDetail ? this.petDetail.length : 0); index++) {
      (this.petInputForm.get('petDetail') as FormArray).at(index)?.get('width')?.updateValueAndValidity();
      (this.petInputForm.get('petDetail') as FormArray).at(index)?.get('height')?.updateValueAndValidity();
      (this.petInputForm.get('petDetail') as FormArray).at(index)?.get('depth')?.updateValueAndValidity();
      (this.petInputForm.get('petDetail') as FormArray).at(index)?.get('weight')?.updateValueAndValidity();
      (this.petInputForm.get('petDetail') as FormArray).at(index)?.get('lendingCageType')?.updateValueAndValidity();
    }
  }

  /**
   * 追加ボタンクリック
   */
  public clickAddButton() {
    (this.petInputForm.get('petDetail') as FormArray).push(
      this._getFormGroup(this.isCageRentalAvailable ? 'lending' : 'carryOn', undefined)
    );
    this.errorMessages.push({ width: '', depth: '', height: '', lending: '' });
  }

  /**
   * 削除ボタンクリック
   *
   * @param index ペット情報のインデックス
   */
  public clickDeleteButton(index: number) {
    let dialogMessageId = '';
    const deleteRegisteredPetFlag = this._isDeleteRegisteredPet(index, this.registeredPetFinalIndex);
    if (deleteRegisteredPetFlag) {
      dialogMessageId = 'MSG1530';
    } else {
      dialogMessageId = 'MSG1529';
    }

    // 削除確認ダイアログ表示
    this.subscribeService(
      'petInputPreDeleteConfirmDialog',
      this._dialogService.openDialog({
        type: DialogType.CHOICE,
        message: `m_dynamic_message-${dialogMessageId}`,
      }).buttonClick$,
      (result) => {
        this.deleteSubscription('petInputPreDeleteConfirmDialog');
        if (result.clickType === DialogClickType.CONFIRM) {
          this._pageLoadingService.startLoading();
          (this.petInputForm.get('petDetail') as FormArray).removeAt(index);
          this._changeDetectorRef.detectChanges();
          this.errorMessages.splice(index, 1);
          if (deleteRegisteredPetFlag) {
            this.registeredPetFinalIndex = this.registeredPetFinalIndex - 1 < 0 ? 0 : this.registeredPetFinalIndex - 1;
          }
          this._pageLoadingService.endLoading();
        }
      }
    );
  }

  /**
   * 削除対象は登録済みペットであるかどうか
   */
  private _isDeleteRegisteredPet(deleteIndex: number, registeredPetFinalIndex: number): boolean {
    const registeredLastPet = this.petInfo.registeredPetDetails?.[deleteIndex];
    // 登録済みペットリストの件数より大きい場合、未登録ペット
    // 新規かつ初期表示の場合、登録済みペットリストに空の情報1件の考慮として、petTypeでも判定
    if (registeredLastPet) {
      return !(registeredPetFinalIndex < deleteIndex + 1) && (registeredLastPet.cage.petType ?? '') !== '';
    } else {
      return false;
    }
  }

  /**
   * サブミット処理
   */
  public submit() {
    this._petInputStoreService.updatePetInput({
      petDetails: undefined,
    });
    this._errorsHandlerService.clearRetryableError();
    this.petInputForm.markAllAsTouched();

    if (!this.petInputForm.valid) {
      // 貸出ケージエリアエラー表示制御
      this.petInfoInputComponent?.forEach((component) => component.displayError());
      // 貸出ケージエリアエラー情報更新
      for (let index = 0; index < (this.petDetail ? this.petDetail.length : 0); index++) {
        if (this.petDetail ? this.petDetail[index].lendingCageType : false) {
          this.errorMessages[index].lending = '';
        } else {
          this.errorMessages[index].lending = {
            errorMsgId: 'E0001',
            params: { key: 0, value: 'label.cageSize' },
          };
        }
      }

      return;
    }

    this.selectedRepresentativeTravelerId = this.petInputForm.get('representativeTravelerId')?.value;
    if (this._petInputPresService.carryOnCageSizeCheck(this.petDetail ?? [])) return;
    if (this._petInputPresService.weightCheck(this.petDetail ?? [])) return;

    this._cancelPrebookService.cancelPrebook(true);
    this._petInputPresService.requestToPetRakunoriApi(this.petDetail ?? [], this.selectedRepresentativeTravelerId);
  }

  /**
   * 幅の入力項目からフォーカスを外した時のイベント
   *
   * @param error バリデーションエラー情報
   * @param index ペット情報インデックス
   */
  public blurEventForWidth(error: ValidationErrorInfo | string, index: number) {
    this.errorMessages[index].width = error;
  }

  /**
   * 奥行の入力項目からフォーカスを外した時のイベント
   *
   * @param error バリデーションエラー情報
   * @param index ペット情報インデックス
   */
  public blurEventForDepth(error: ValidationErrorInfo | string, index: number) {
    this.errorMessages[index].depth = error;
  }

  /**
   * 高さの入力項目からフォーカスを外した時のイベント
   *
   * @param error バリデーションエラー情報
   * @param index ペット情報インデックス
   */
  public blurEventForHeight(error: ValidationErrorInfo | string, index: number) {
    this.errorMessages[index].height = error;
  }

  refresh(): void {}
  reload(): void {}

  /**
   * クリーンアップ処理
   */
  destroy(): void {
    this.deleteSubscription('SubHeaderResize');
    this.deleteSubscription('petInputPresValueChanges');
    this.deleteSubscription('petInputPreDeleteConfirmDialog');
  }

  /**
   * 画面サイズ変更検知関数
   */
  private _resizeEvent = () => {
    this.isPcPre = this.isPc;
    this.isPc = isPC();
    if (this.isPcPre !== this.isPc) {
      this._changeDetectorRef.markForCheck();
    }
  };
}
