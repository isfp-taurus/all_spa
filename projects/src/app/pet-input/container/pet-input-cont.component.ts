import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { MListData, PassengerType, ReservationFunctionIdType, ReservationPageIdType } from '@common/interfaces';
import { CurrentCartStoreService, PetInputStoreService } from '@common/services';
import { SupportPageComponent } from '@lib/components/support-class';
import { AswMasterService, CommonLibService, PageInitService } from '@lib/services';
import { PetInputInformation } from '@common/interfaces/reservation/pet-input/pet-input-information.interface';
import { CartsUpdatePetRakunoriRequestServicesPetDetailInner } from 'src/sdk-reservation/model/cartsUpdatePetRakunoriRequestServicesPetDetailInner';
import { PostGetCartResponseData } from 'src/sdk-reservation';
import { PetDetail, RegisteredPetsPerSegment } from 'src/sdk-reservation/model/createCartResponseDataPlanServicesPet';
import { PetInputCageSize } from '@common/interfaces/reservation/pet-input/cage-size.interface';
import { getKeyListData } from '@common/helper';
import { BehaviorSubject, Observable } from 'rxjs';

@Component({
  selector: 'asw-pet-input-cont',
  templateUrl: './pet-input-cont.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PetInputContComponent extends SupportPageComponent {
  /** 機能ID */
  functionId: string = ReservationFunctionIdType.PRIME_BOOKING;

  /** ページID */
  pageId: string = ReservationPageIdType.PET_RESERVATION_INFORMATION_REQUEST;

  /** M_PROPERTYカテゴリ: otherApplicationSettings */
  private readonly OTHER_APPLICATION_SETTINGS = 'otherApplicationSettings';

  /** ペットらくのり画面情報 */
  public petInputInformation: PetInputInformation = this.initPetInputInformation();

  /** 貸出ケージ申込可否 */
  private _isCageRentalAvailable: boolean = false;

  /** 画面表示制御用変数 */
  public isReadtToShow: boolean = false;

  /** 動的文言用Subject */
  public dynamicSubject = new BehaviorSubject<{}>({});

  public petTypeList: Array<MListData> = [];

  public cageTypeList: Array<MListData> = [];

  public cageSizeList: Array<PetInputCageSize> = [];

  public cageSizeExplainList: Array<MListData> = [];

  constructor(
    private _common: CommonLibService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _pageInitService: PageInitService,
    private _currentCartStoreService: CurrentCartStoreService,
    private _aswMasterSvc: AswMasterService,
    private _petInputStoreService: PetInputStoreService,
    private _aswMasterService: AswMasterService
  ) {
    super(_common, _pageInitService);
    this.initAswCommon();
  }

  /**
   * 初期処理
   */
  init(): void {
    // 動的文言初期化設定
    this.params = this.dynamicSubject.asObservable();

    this._getCache();
    this.setPetInputInformation();

    // 動的文言取得条件の送信
    this.dynamicSubject.next({});
  }

  destroy(): void {}
  refresh(): void {}
  reload(): void {}

  /**
   * 画面表示初期処理
   */
  private initAswCommon() {
    // 画面情報への機能ID、ページID設定
    this._common.aswCommonStoreService.updateAswCommon({
      functionId: this.functionId,
      pageId: this.pageId,
      subFunctionId: '',
      subPageId: '',
      isEnabledLogin: false,
      isUpgrade: false,
    });
  }

  /**
   * 前画面情報をペットらくのり用のストアに保存する
   */
  private setPetInputInformation(): void {
    const currentCart = this._currentCartStoreService.CurrentCartData.data ?? {};
    const registeredPets = currentCart?.plan?.services?.pet?.registeredPets ?? {};
    this._isCageRentalAvailable = currentCart.plan?.cartEligibilities?.isPetRakunoriCageLendingEligible ?? false;

    this.petInputInformation = {
      cartId: currentCart?.cartId ?? '',
      travelers:
        currentCart?.plan?.travelers?.filter(
          (traveler) =>
            traveler.passengerTypeCode === PassengerType.ADT || traveler.passengerTypeCode === PassengerType.B15
        ) ?? [],
      representativeTravelerId: this.getRepresentativeTravelerId(currentCart),
      petDetails: this.getPetDetails(registeredPets),
      registeredPetDetails: this.getPetDetails(registeredPets),
      maxCageSize: this._aswMasterSvc.getMPropertyByKey(this.OTHER_APPLICATION_SETTINGS, 'maxCageSize'),
      maxCageWeight: this._aswMasterSvc.getMPropertyByKey(this.OTHER_APPLICATION_SETTINGS, 'maxCageWeight'),
      isRegistered: Object.keys(registeredPets).length > 0,
    };

    this._petInputStoreService.setPetInput(this.petInputInformation);
  }

  /**
   * キャッシュ取得
   */
  private _getCache(): void {
    const _aswLangCode = this._common.aswContextStoreService.aswContextData.lang;
    this.subscribeService(
      'petInputListDataAll',
      this._aswMasterService.load([{ key: 'ListData_All', fileName: 'ListData_All' }], true),
      ([listData]) => {
        this.deleteSubscription('petInputListDataAll');
        const cageSizeListData = getKeyListData(listData, 'PD_013', _aswLangCode);
        this.petTypeList = getKeyListData(listData, 'PD_008', _aswLangCode);
        this.cageTypeList = getKeyListData(listData, 'PD_009', _aswLangCode);
        this.cageSizeExplainList = getKeyListData(listData, 'PD_014', _aswLangCode);
        this.cageSizeList = this._makeCageSizeList(cageSizeListData);
        this._changeDetectorRef.markForCheck();
        this.isReadtToShow = true;
      }
    );
  }

  /**
   * ペットらくのり画面情報の初期値を返す
   *
   * @returns ペットらくのり画面情報
   */
  public initPetInputInformation(): PetInputInformation {
    return {
      cartId: '',
      travelers: [],
      representativeTravelerId: '',
      petDetails: [],
      registeredPetDetails: [],
      maxCageSize: '',
      maxCageWeight: '',
      isRegistered: false,
    };
  }

  /**
   * 代表搭乗者ID取得
   *
   * @param currentCart 操作中カート情報
   * @returns 代表搭乗者ID
   */
  private getRepresentativeTravelerId(currentCart: PostGetCartResponseData): string {
    const travelers = currentCart?.plan?.travelers?.filter(
      (traveler) => traveler.passengerTypeCode === PassengerType.ADT || traveler.passengerTypeCode === PassengerType.B15
    );
    const services = currentCart?.plan?.services ?? {};

    if (services?.pet && Object.keys(services?.pet.registeredPets ?? {}).length !== 0) {
      // ペット所持者リストの先頭を代表者とする
      // もしペット所持者がいない場合は、搭乗者リストの先頭を代表者とする
      const registeredPets = services.pet?.registeredPets ?? {};
      const registeredPetsFromFirstSegment = registeredPets[Object.keys(registeredPets)[0]] ?? {};
      return Object.keys(registeredPetsFromFirstSegment)[0];
    } else {
      return travelers?.[0].id ?? '';
    }
  }

  /**
   * ペット情報取得
   *
   * @param registeredPets 登録済みペット情報
   * @returns ペット情報リスト
   */
  private getPetDetails(
    registeredPets: RegisteredPetsPerSegment
  ): Array<CartsUpdatePetRakunoriRequestServicesPetDetailInner> {
    // 先頭セグメント, 先頭搭乗者の申し込み情報を取得
    const registeredPetsFromFirstSegment = registeredPets[Object.keys(registeredPets)[0]] ?? {};
    const registeredPetsFromFirstSegmentAndTraveler =
      registeredPetsFromFirstSegment[Object.keys(registeredPetsFromFirstSegment)[0]] ?? [];
    let petDetails = [];

    // 登録済みペットがいない場合
    if (registeredPetsFromFirstSegmentAndTraveler.length <= 0) {
      const petDetail = this.createPetDetail();
      petDetails.push(petDetail);
      return petDetails;
    }

    for (let individualPetDetail of registeredPetsFromFirstSegmentAndTraveler) {
      const petDetail = this.createPetDetail(individualPetDetail);
      petDetails.push(petDetail);
    }
    return petDetails;
  }

  /**
   * ペット情報オブジェクト作成
   * @param registeredPetDetail ペットの詳細情報
   * @returns ペット情報オブジェクト
   */
  private createPetDetail(registeredPetDetail?: PetDetail): CartsUpdatePetRakunoriRequestServicesPetDetailInner {
    const cage = registeredPetDetail?.cage;
    return {
      index: registeredPetDetail?.index ?? 1,
      cage: {
        cageType: cage?.cageType ?? (this._isCageRentalAvailable ? 'lending' : 'carryOn'),
        petType: cage?.petType ?? '',
        lendingCageType: cage?.lendingCageType ?? 'S',
        size: {
          depth: cage?.size?.depth ?? 0,
          width: cage?.size?.width ?? 0,
          height: cage?.size?.height ?? 0,
        },
        weight: cage?.weight ?? 0,
      },
    };
  }

  /**
   * ケージサイズリストを作成する
   * @param cageSizeListData 汎用マスタより取得したケージサイズリスト
   * @return 変換後ケージサイズリスト
   */
  private _makeCageSizeList(cageSizeListData: Array<MListData>): Array<PetInputCageSize> {
    return cageSizeListData.map((cageSize: MListData) => {
      const title = cageSize.display_content.substring(0, cageSize.display_content.indexOf(' '));
      const content = cageSize.display_content.substring(cageSize.display_content.indexOf(' ') + 1);
      return { ...cageSize, display_title: title, display_content: content };
    });
  }
}
