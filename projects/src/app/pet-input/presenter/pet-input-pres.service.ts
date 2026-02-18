import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { apiEventAll, defaultDispPassengerName, isStringEmpty } from '@common/helper';
import { PetInputPassenger } from '@common/interfaces/reservation/pet-input/passenger.interface';
import { PetInputInformation } from '@common/interfaces/reservation/pet-input/pet-input-information.interface';
import { DeliveryInformationStoreService, PetInputStoreService } from '@common/services';
import { CartsUpdatePetRakunoriStoreService } from '@common/services/api-store/sdk-reservation/carts-update-pet-rakunori-store/carts-update-pet-rakunori-store.service';
import { PetInputState } from '@common/store';
import { RoutesResRoutes } from '@conf/routes.config';
import { SupportClass } from '@lib/components/support-class';
import { ErrorType, PageType } from '@lib/interfaces';
import { StaticMsgPipe } from '@lib/pipes';
import { CommonLibService, ErrorsHandlerService, PageLoadingService } from '@lib/services';
import {
  CartsUpdatePetRakunoriRequest,
  CartsUpdatePetRakunoriRequestServicesPetDetailInner,
  CartsUpdatePetRakunoriRequestServicesPetDetailInnerCage,
} from 'src/sdk-reservation';
import { PetInputPetDetailForm } from './pet-input-pres.state';
import { ErrorCodeConstants } from '@conf/app.constants';

@Injectable({
  providedIn: 'root',
})
export class PetInputPresService extends SupportClass {
  constructor(
    private _common: CommonLibService,
    private _router: Router,
    private _deliveryInformationStoreService: DeliveryInformationStoreService,
    private _errorsHandlerService: ErrorsHandlerService,
    private _cartsUpdatePetRakunoriStoreService: CartsUpdatePetRakunoriStoreService,
    private _petInputStoreService: PetInputStoreService,
    private _staticMsg: StaticMsgPipe,
    private _pageLoadingService: PageLoadingService
  ) {
    super();
  }

  /**
   * 搭乗者リストを作成
   *
   * @param petInputData ペットらくのり情報
   * @returns 搭乗者リスト
   */
  public makePassengerList(petInputData: PetInputInformation): Array<PetInputPassenger> {
    let passengerList: Array<PetInputPassenger> = [];
    petInputData?.travelers?.forEach((traveler, i) => {
      {
        let passengerName: string = '';
        if (traveler.names?.[0]?.firstName !== '') {
          passengerName = traveler?.names ? defaultDispPassengerName(traveler.names[0]) : '';
        } else {
          passengerName = this._staticMsg.transform('label.passenger.n', { '0': i + 1 });
        }
        const passenger: PetInputPassenger = {
          ...traveler,
          name: passengerName,
        };
        passengerList.push(passenger);
      }
    });
    return passengerList;
  }

  /**
   * ペットらくのりAPIリクエストを行う
   *
   * @param petDetail 画面ペット情報入力
   */
  public requestToPetRakunoriApi(petDetail: PetInputPetDetailForm[], representativeTravelerId: string): void {
    this._pageLoadingService.startLoading();
    const request = this._makeRequestParameterForPetRakunoriApi(petDetail, representativeTravelerId);
    apiEventAll(
      () => {
        this._cartsUpdatePetRakunoriStoreService.setCartsUpdatePetRakunoriFromApi(request);
      },
      this._cartsUpdatePetRakunoriStoreService.cartsUpdatePetRakunori$(),
      () => {
        this._pageLoadingService.endLoading();
        this._petInputStoreService.resetPetInput();
        this._router.navigateByUrl(RoutesResRoutes.PLAN_REVIEW);
      },
      () => {
        this._pageLoadingService.endLoading();
        const errorCode = this._common.apiError?.errors?.[0].code;
        if (errorCode === ErrorCodeConstants.ERROR_CODES.EBAZ000278) {
          // カートが取得できなかった旨のエラーメッセージ
          this._errorsHandlerService.setNotRetryableError({
            errorType: ErrorType.BUSINESS_LOGIC,
            errorMsgId: 'E0333',
            apiErrorCode: errorCode,
          });
        } else if (errorCode === ErrorCodeConstants.ERROR_CODES.EBAZ000520) {
          this._deliveryInformationStoreService.setDeliveryInformationByKey('serviceApplication', 'errorInfo', [
            // 受付可能時間を超過している旨のエラーメッセージ
            { errorMsgId: 'E0942', apiErrorCode: errorCode },
          ]);
          this._petInputStoreService.resetPetInput();
          this._router.navigateByUrl(RoutesResRoutes.PLAN_REVIEW);
        } else {
          this._deliveryInformationStoreService.setDeliveryInformationByKey('serviceApplication', 'errorInfo', [
            // サービスの更新ができなかった旨のエラーメッセージ
            { errorMsgId: 'E0381', apiErrorCode: errorCode },
          ]);
          this._petInputStoreService.resetPetInput();
          this._router.navigateByUrl(RoutesResRoutes.PLAN_REVIEW);
        }
      }
    );
  }

  /**
   * 画面情報からCartsUpdatePetRakunoriRequestServicesPetDetailInnerを作成する関数
   *
   * @param petDetail 画面ペット入力情報
   * @return CartsUpdatePetRakunoriRequestServicesPetDetailInner
   */
  public makeCartsUpdatePetRakunoriRequestServicesPetDetailInner(
    petDetail: PetInputPetDetailForm[]
  ): CartsUpdatePetRakunoriRequestServicesPetDetailInner[] {
    return petDetail.map((petDetailElement, i) => {
      if (petDetailElement.cageType === 'lending') {
        return {
          index: i + 1,
          cage: {
            petType: petDetailElement.petType,
            cageType: petDetailElement.cageType as CartsUpdatePetRakunoriRequestServicesPetDetailInnerCage.CageTypeEnum,
            lendingCageType: this.convertPetRakunoriRequest(petDetailElement.lendingCageType),
            weight: petDetailElement.weight,
          },
        };
      } else {
        return {
          index: i + 1,
          cage: {
            petType: petDetailElement.petType,
            cageType: petDetailElement.cageType as CartsUpdatePetRakunoriRequestServicesPetDetailInnerCage.CageTypeEnum,
            size: {
              depth: Number(petDetailElement.depth),
              width: Number(petDetailElement.width),
              height: Number(petDetailElement.height),
            },
            weight: petDetailElement.weight,
          },
        };
      }
    });
  }

  /**
   * ペットらくのりAPIに渡す用のリクエストパラメータを作成する
   *
   * @param petDetail 画面ペット情報入力
   * @param representativeTravelerId　代表者id
   * @returns ペットらくのりAPIリクエストパラメータ
   */
  private _makeRequestParameterForPetRakunoriApi(
    petDetail: PetInputPetDetailForm[],
    representativeTravelerId: string
  ): CartsUpdatePetRakunoriRequest {
    if (petDetail.length <= 0) {
      const param: CartsUpdatePetRakunoriRequest = {
        cartId: this._petInputStoreService.PetInputData.cartId ?? '',
      };
      return param;
    } else {
      const parameter: CartsUpdatePetRakunoriRequest = {
        cartId: this._petInputStoreService.PetInputData.cartId ?? '',
        services: {
          representativeTravelerId: representativeTravelerId,
          petDetail: this.makeCartsUpdatePetRakunoriRequestServicesPetDetailInner(petDetail),
        },
      };
      return parameter;
    }
  }

  /**
   * カートとリストケージタイプ変換用関数
   *
   * @param cageType カートケージタイプ
   * @returns リストデータケージタイプ.value
   */
  public convertCartCageTypeToListData(
    cageType?: CartsUpdatePetRakunoriRequestServicesPetDetailInnerCage.LendingCageTypeEnum
  ): string | undefined {
    switch (cageType) {
      case CartsUpdatePetRakunoriRequestServicesPetDetailInnerCage.LendingCageTypeEnum.S:
        return 'S_SIZE';
      case CartsUpdatePetRakunoriRequestServicesPetDetailInnerCage.LendingCageTypeEnum.M:
        return 'M_SIZE';
      case CartsUpdatePetRakunoriRequestServicesPetDetailInnerCage.LendingCageTypeEnum.L:
        return 'L_SIZE';
    }
    return undefined;
  }

  /**
   * リストケージタイプとペットらくのりAPIリクエスト変換用関数
   *
   * @param cageType カートケージタイプ
   * @returns リストデータケージタイプ.value
   */
  public convertPetRakunoriRequest(
    cageType?: string
  ): CartsUpdatePetRakunoriRequestServicesPetDetailInnerCage.LendingCageTypeEnum {
    switch (cageType) {
      case 'S_SIZE':
        return CartsUpdatePetRakunoriRequestServicesPetDetailInnerCage.LendingCageTypeEnum.S;
      case 'M_SIZE':
        return CartsUpdatePetRakunoriRequestServicesPetDetailInnerCage.LendingCageTypeEnum.M;
      case 'L_SIZE':
        return CartsUpdatePetRakunoriRequestServicesPetDetailInnerCage.LendingCageTypeEnum.L;
    }
    return CartsUpdatePetRakunoriRequestServicesPetDetailInnerCage.LendingCageTypeEnum.S;
  }

  /**
   * 持ち込みケージのサイズをチェックする
   *
   * @param petDetail 画面入力
   * @return true: チェックに引っかかった場合, false: チェックを通過した場合
   */
  public carryOnCageSizeCheck(petDetail: PetInputPetDetailForm[]): boolean {
    return petDetail.some((petDetailElement: PetInputPetDetailForm) => {
      if (petDetailElement.cageType === 'carryOn') {
        if (
          Number(petDetailElement.width) + Number(petDetailElement.depth) + Number(petDetailElement.height) >
          Number(this._petInputStoreService.PetInputData.maxCageSize)
        ) {
          this._errorsHandlerService.setRetryableError(PageType.PAGE, {
            errorMsgId: 'E1040',
          });
          return true;
        }
      }
      return false;
    });
  }

  /**
   * 重量の上限超過をチェックする
   *
   * @param petDetail 画面入力
   * @return true: チェックに引っかかった場合, false: チェックを通過した場合
   */
  public weightCheck(petDetail: PetInputPetDetailForm[]): boolean {
    return petDetail.some((petDetailElement: PetInputPetDetailForm) => {
      if (Number(petDetailElement.weight) > Number(this._petInputStoreService.PetInputData.maxCageWeight)) {
        this._errorsHandlerService.setRetryableError(PageType.PAGE, {
          errorMsgId: 'E1041',
        });
        return true;
      }
      return false;
    });
  }

  destroy(): void {}
}
