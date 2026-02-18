import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { AswMasterService, CommonLibService, PageLoadingService } from '@lib/services';
import { SupportModalBlockComponent } from '@lib/components/support-class';
import { Router } from '@angular/router';
import { RoutesResRoutes } from '@conf/routes.config';
import { Store } from '@ngrx/store';
import { RoundtripFlightAvailabilityInternationalStore } from '@common/store/roundtripFlightAvailabilityInternational';
import { RoundtripFlightAvailabilityInternationalService } from '@common/services/roundtripFlightAvailabilityInternational/roundtripFlightAvailabilityInternational.service';
import { SearchFlightBodyContComponent } from '../search-flight/search-flight-body/container/search-flight-body-cont.component';
import { SearchFlightStoreService } from '@common/services';
import { FormGroup } from '@angular/forms';
import { AswValidators } from '@lib/helpers';
import { SearchFlightStateDetails } from '@common/store/search-flight';
import { CaptchaAuthenticationStatusGetStoreService } from '@common/services/captcha-authentication-status-get/captcha-authentication-status-get-store.service';
import { M_AIRPORT } from '@common/interfaces/common/m_airport.interface';
import { PageType } from '@lib/interfaces';
import { MasterStoreKey } from '@conf/asw-master.config';
@Component({
  selector: 'asw-search-flight-again-modal',
  templateUrl: './search-flight-again-modal.component.html',
})
export class SearchFlightAgainModalComponent extends SupportModalBlockComponent implements AfterViewInit {
  constructor(
    private common: CommonLibService,
    private _router: Router,
    private _searchFlightStoreService: SearchFlightStoreService,
    private _loadingSvc: PageLoadingService,
    private _captchaAuthenticationStoreSvc: CaptchaAuthenticationStatusGetStoreService,
    private _aswMasterSvc: AswMasterService,
    private _pageLoadingService: PageLoadingService
  ) {
    super(common);
  }

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

  public onewayInformationList: Array<number> = [];

  public isOpenSearchOption!: boolean;
  // 空港のキャッシューデータ取得
  private airportAllAkamai = [];

  override ngAfterViewInit() {
    super.ngAfterViewInit();

    // 再検索モーダルの描画完了時にローディングを終了する
    this._pageLoadingService.endLoading();
  }

  reload(): void {}

  init(): void {
    this.getLoginStatus();
  }

  destroy(): void {}

  //モーダル閉じる処理に引数を渡せるようにする
  override close!: (applied: boolean) => {};

  /** ログインステータス 未ログインの時true */
  public notLogin: boolean = true;

  public modalClose() {
    this.close(false);
  }

  changeOptionOpen(event: boolean) {
    this.isOpenSearchOption = event;
  }

  @ViewChild('aswSearchFlightBodyCont', { static: false }) body?: SearchFlightBodyContComponent;
  /** Searchボタンのクリックイベント */
  clickSearch(event: Event) {
    const searchFlight = this._searchFlightStoreService.getData();

    // バリデーションチェック
    const groupForCheck = new FormGroup({});
    if (searchFlight.tripType === 0) {
      this.body!.searchFlightBodyPresComponent!.roundTripComponent!.roundFormGroup.forEach((control, key) => {
        groupForCheck.addControl(key, control);
      });
      // 出発日部品変更検知できるになるため
      this.body!.searchFlightBodyPresComponent!.roundTripComponent!.departureAndReturnDateComponent.markTouched();
    } else {
      this.body!.searchFlightBodyPresComponent!.onewayOrMulticityComponent!.getFormControlGroup().forEach(
        (control, key) => {
          groupForCheck.addControl(key, control);
        }
      );
      // 出発日部品変更検知できるになるため
      this.body!.searchFlightBodyPresComponent!.onewayOrMulticityComponent!.departureDateComponent.forEach((cmp) => {
        cmp.markTouched();
      });
    }
    groupForCheck.markAllAsTouched();

    // 手動的にsetErrorsがあるので、検索時エラーをリフレッシュする。
    Object.keys(groupForCheck.controls).forEach((ctl) => {
      groupForCheck.get(ctl)?.updateValueAndValidity();
    });
    // 入力エラーある場合
    if (groupForCheck.invalid) {
      return;
    }

    let errorMap = this.body!.checkInputData();
    if (errorMap.size > 0) {
      this.body!.setErrorMessage(errorMap);
      // formControl部分
      this.body!.showErrorMsg(errorMap);
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
        this.close(true);
        return;
      }
    }
    if (this.body!.executeSearch()) {
      // 検索処理成功の場合、画面遷移する
      this._loadingSvc.endLoading(true);
      const nowPage = this._router.url.slice(1);
      this._captchaAuthenticationStoreSvc.skipCaptchaHandle(nowPage);
    }
    // イベントの伝搬を停止する
    event.preventDefault();
    this.close(true);
  }

  /**
   * ログインステータスを判断する
   * ログインしていなければtrue
   */
  private getLoginStatus() {
    this.notLogin = this.common.isNotLogin();
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
