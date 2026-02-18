import { Component, Output, ChangeDetectionStrategy, ViewChild, ElementRef } from '@angular/core';
import { SupportComponent } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services/common-lib/common-lib.service';
import { Router } from '@angular/router';
import { RoutesResRoutes } from '@conf/routes.config';
import { FormGroup } from '@angular/forms';
import { SearchFlightStoreService } from '@common/services';
import { SearchFlightConditionForRequestService } from '@common/services/store/search-flight/search-flight-condition-for-request-store/search-flight-condition-for-request-store.service';
import { Itinerary, SearchFlightConditionForRequest } from '@common/store/search-flight-condition-for-request';
import { SearchFlightBodyContComponent, SearchFlightHistorySelectModalService } from '@common/components';
import { PageLoadingService, ErrorsHandlerService, AswMasterService } from '@lib/services';
import { PageType } from '@lib/interfaces';
import { CaptchaAuthenticationStatusGetStoreService } from '@common/services/captcha-authentication-status-get/captcha-authentication-status-get-store.service';
import { M_AIRPORT } from '@common/interfaces/common/m_airport.interface';
import { MasterStoreKey } from '@conf/asw-master.config';

@Component({
  selector: 'asw-search-flight-pres',
  templateUrl: './search-flight-pres.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchFlightPresComponent extends SupportComponent {
  /** 検索ボタン押下時出力 */
  @Output()
  public searchFlightConditionForRequest!: SearchFlightConditionForRequest;
  public itineraries: Array<Itinerary> = [];
  public information = {
    //往復
    departureOriginLocationCode: '',
    departureDestinationLocationCode: '',
    //エラーメッセージ用
    passengersErrorMsg: '',
    originErrorMsg: '',
    destinationErrorMsg: '',
    originBoundErrorMsg: '',
    transitDepartErrorMsg: '',
    transitReturnErrorMsg: '',
    dateErrorMsg: '',

    originErrorMessage0: '',
    originErrorMessage1: '',
    originErrorMessage2: '',
    originErrorMessage3: '',
    originErrorMessage4: '',
    originErrorMessage5: '',
    destinationErrorMessage0: '',
    destinationErrorMessage1: '',
    destinationErrorMessage2: '',
    destinationErrorMessage3: '',
    destinationErrorMessage4: '',
    destinationErrorMessage5: '',
    departureDateErrorMsg0: '',
    departureDateErrorMsg1: '',
    departureDateErrorMsg2: '',
    departureDateErrorMsg3: '',
    departureDateErrorMsg4: '',
    departureDateErrorMsg5: '',
  };
  public isOpenSearchOption!: boolean;
  public onewayInformationList: Array<number> = [];
  /** バリデーションチェックのフォーム*/
  public formGroup!: FormGroup;

  /** タブの選択状態 */
  public tabIndex: number;
  // 空港のキャッシューデータ取得
  private airportAllAkamai = [];

  @ViewChild('searchButton') searchButton!: ElementRef;
  /** コンストラクタ */
  constructor(
    protected common: CommonLibService,
    private _router: Router,
    private _searchFlightStoreService: SearchFlightStoreService,
    private _searchFlightHistorySelectModalService: SearchFlightHistorySelectModalService,
    private _searchFlightConditionForRequestService: SearchFlightConditionForRequestService,
    private _loadingSvc: PageLoadingService,
    private _errorsHandlerSvc: ErrorsHandlerService,
    private _captchaAuthenticationStoreSvc: CaptchaAuthenticationStatusGetStoreService,
    private _aswMasterSvc: AswMasterService
  ) {
    super(common);

    this.searchFlightConditionForRequest = this._searchFlightConditionForRequestService.getData();

    this.tabIndex = 0;

    //セッションストレージの開始とロード
    this._searchFlightStoreService.startSessionStorage();
  }
  /**BODY Component */
  @ViewChild('aswSearchFlightBodyCont', { static: false }) body?: SearchFlightBodyContComponent;
  /** 初期表示処理 */
  init() {}

  /** 画面終了時処理 */
  destroy() {}

  /** 画面更新時処理 */
  reload() {}

  changeOptionOpen(event: boolean) {
    this.isOpenSearchOption = event;
  }

  /** Searchボタンのクリックイベント */
  clickSearch(event: Event) {
    // get SearchFlightState stroe data
    const searchFlight = this._searchFlightStoreService.getData();

    // バリデーションチェック
    const groupForCheck = new FormGroup({});
    if (searchFlight.tripType === 0) {
      this.body!.searchFlightBodyPresComponent!.roundTripComponent!.roundFormGroup.forEach((control, key) => {
        groupForCheck.addControl(key, control);
        // 出発日以外の項目をtouchedになる
        if ('departureAndReturnDate' !== key) {
          control.markAsTouched();
        }
      });
    } else {
      // 出発日対象項目
      const departureDateKeyList: String[] = [];
      // 出発日部品
      for (
        let i = 0;
        i < this.body!.searchFlightBodyPresComponent!.onewayOrMulticityComponent!.departureDateComponent.length;
        i++
      ) {
        departureDateKeyList.push('departureDate' + i);
      }
      this.body!.searchFlightBodyPresComponent!.onewayOrMulticityComponent!.getFormControlGroup().forEach(
        (control, key) => {
          groupForCheck.addControl(key, control);
          // 出発日以外の項目をtouchedになる
          if (!departureDateKeyList.includes(key)) {
            control.markAsTouched();
          }
        }
      );
    }

    // 検索時エラーをリフレッシュする。
    Object.keys(groupForCheck.controls).forEach((ctl) => {
      groupForCheck.get(ctl)?.updateValueAndValidity();
    });

    if (searchFlight.tripType === 0) {
      // 出発日部品をtouchedになる、エラー情報をリフレッシュする（出発日部品が変更をすぐ検知できないので）
      this.body!.searchFlightBodyPresComponent!.roundTripComponent!.departureAndReturnDateComponent.markTouched();
    } else {
      // 出発日対象項目
      // 出発日部品をtouchedになる、エラー情報をリフレッシュする（出発日部品が変更をすぐ検知できないので）
      for (
        let i = 0;
        i < this.body!.searchFlightBodyPresComponent!.onewayOrMulticityComponent!.departureDateComponent.length;
        i++
      ) {
        this.body!.searchFlightBodyPresComponent!.onewayOrMulticityComponent!.departureDateComponent.get(
          i
        )!.markTouched();
      }
    }

    // 入力エラーある場合
    if (groupForCheck.invalid) {
      this._errorsHandlerSvc.setRetryableError(PageType.PAGE);
      return;
    }

    let errorMap = this.body!.checkInputData();
    if (errorMap.size > 0) {
      this.body!.setErrorMessage(errorMap);
      // formControl部分
      this.body!.showErrorMsg(errorMap);
      this._errorsHandlerSvc.setRetryableError(PageType.PAGE);
      return;
    }
    const isJapanOnly = this.body!.checkOnlyJapan(searchFlight);
    if (isJapanOnly && searchFlight.onewayOrMultiCity.length === 2) {
      const originLocationCodeMultiFlg = this.isMultiAirport(searchFlight.onewayOrMultiCity[0].originLocationCode!);
      let originLocationCityCode = '';
      let destinationLocation2CityCode = '';
      this.airportAllAkamai.filter((airport: M_AIRPORT) => {
        originLocationCityCode =
          airport.search_for_airport_code === searchFlight.onewayOrMultiCity[0].originLocationCode
            ? airport.city_code
            : originLocationCityCode;
        destinationLocation2CityCode =
          airport.search_for_airport_code === searchFlight.onewayOrMultiCity[1].destinationLocationCode
            ? airport.city_code
            : destinationLocation2CityCode;
      });
      if (
        originLocationCodeMultiFlg
          ? originLocationCityCode !== destinationLocation2CityCode
          : searchFlight.onewayOrMultiCity[0].originLocationCode !==
            searchFlight.onewayOrMultiCity[1].destinationLocationCode
      ) {
        this.common.errorsHandlerService.setRetryableError(PageType.PAGE, {
          errorMsgId: 'E1824',
        });
        return;
      }
    }

    if (this.body!.executeSearch()) {
      // 検索処理成功の場合、画面遷移する
      this._loadingSvc.endLoading(true);
      this._captchaAuthenticationStoreSvc.skipCaptchaHandle();
    }
  }

  /** マルチエアポート判定 */
  public isMultiAirport(AirportCode: string): boolean {
    this.airportAllAkamai = this._aswMasterSvc.aswMaster[MasterStoreKey.Airport_All];
    return this.airportAllAkamai.some((mAirportAll: M_AIRPORT) => {
      return (
        mAirportAll.search_for_airport_code === AirportCode &&
        (mAirportAll.multi_airport_type === '1' || mAirportAll.multi_airport_type === '2')
      );
    });
  }
}
