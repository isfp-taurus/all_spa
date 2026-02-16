/**
 * 機内食申込画面 (R01-M053)
 *
 */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { DialogClickType, ErrorType } from '@lib/interfaces';
import {
  AswMasterService,
  CommonLibService,
  DialogDisplayService,
  ModalService,
  PageInitService,
  PageLoadingService,
  SystemDateService,
} from '@lib/services';
import { SupportModalIdComponent } from '@lib/components/support-class/support-modal-id-component';
import { MealApplicationModalService } from './meal-application-modal.service';
import { Router } from '@angular/router';
import {
  initialMealApplicationMastarData,
  MealApplicationMastarData,
  MealApplicationPassengerMapInfo,
  MealApplicationPassengerMealInfo,
  MealApplicationSelectMealType,
  ServiceApplicationModalSegmentInformation,
  SERVICE_APPLICATION_BABY_MEAL_CODE,
  SERVICE_APPLICATION_NOT_PREORDER_MEAL_ID,
  SERVICE_APPLICATION_SAME_MEAL_MESSAGE_ID,
  SERVICE_APPLICATION_STATUS_CANCEL,
  SERVICE_APPLICATION_STATUS_REQUEST,
  SERVICE_APPLICATION_UNKOWN_MEAL_ID,
} from '../service-application-modal.state';
import { MealApplicationModalHeaderComponent } from './meal-application-modal-header.component';
import { MealApplicationModalFooterComponent } from './meal-application-modal-footer.component';
import { CurrentCartStoreService, GetMealStoreService } from '@common/services';
import { GetMealState } from '@common/store';
import { MealApplicationModalPayload } from '../service-application-modal-payload.state';
import { MealType, MSpecialMeal, ReservationFunctionIdType, ReservationPageIdType } from '@common/interfaces';
import {
  MealApplicationSelectModalPayloadParts,
  MealApplicationSelectModalSelectInfo,
} from './meal-application-select-modal/meal-application-select-modal-payload.state';
import { StaticMsgPipe } from '@lib/pipes';
import { Subject, take } from 'rxjs';
import {
  apiEventAll,
  fixedArrayCache,
  getApplyListData,
  getBoundFlightFromSegmentId,
  getKeyListData,
  string8ToDate,
} from '@common/helper';
import { MealApplicationDynamicParams } from './meal-application-modal.state';
import { ErrorCodeConstants } from '@conf/app.constants';
@Component({
  selector: 'asw-meal-application-modal',
  templateUrl: './meal-application-modal.component.html',
  styleUrls: ['meal-application-modal.scss'], // c-status-display-buttonのafterにクリアボタンがいて個別にイベント設定できないため修正
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MealApplicationModalComponent extends SupportModalIdComponent {
  override autoInitEnd = false;
  private dynamicSubject = new Subject<MealApplicationDynamicParams>();

  constructor(
    private _common: CommonLibService,
    private _router: Router,
    private _pageInitService: PageInitService,
    private _dialogService: DialogDisplayService,
    private _getMealStoreService: GetMealStoreService,
    private _currentcartStoreService: CurrentCartStoreService,
    private _master: AswMasterService,
    private _modal: ModalService,
    private _staticMsg: StaticMsgPipe,
    public service: MealApplicationModalService,
    private _sysDate: SystemDateService,
    public change: ChangeDetectorRef,
    private _pageLoadingService: PageLoadingService
  ) {
    super(_common, _pageInitService);
    this.params = this.dynamicSubject.asObservable();

    //キャッシュ情報の取得
    const lang = this._common.aswContextStoreService.aswContextData.lang;
    const langPrefix = '/' + lang;
    this.subscribeService(
      'getMasterDataAll',
      this._master.load(
        [
          { key: 'm_airport_i18n', fileName: 'm_airport_i18n' + langPrefix },
          { key: 'M_SPECIAL_MEAL', fileName: `M_SPECIAL_MEAL_${lang}` },
          { key: 'ListData_All', fileName: 'ListData_All' },
        ],
        true
      ),
      ([air, specialMeal, listData]) => {
        const appListData = getApplyListData(listData, this._sysDate.getSystemDate());
        this.service.saveMessageData(appListData);
        this.mastarData = {
          air: air ?? {},
          specialMeal: fixedArrayCache<MSpecialMeal>(specialMeal).filter(
            (sp: MSpecialMeal) =>
              string8ToDate(sp.apply_from_date ?? '').getTime() <= this._sysDate.getSystemDate().getTime() &&
              this._sysDate.getSystemDate().getTime() <= string8ToDate(sp.apply_to_date ?? '').getTime()
          ),
          listDataSsr: getKeyListData(appListData, 'PD_950', lang),
          listDataCategory: getKeyListData(appListData, 'PD_007', lang),
        };
        this.babyMealName =
          this.mastarData.specialMeal.find((sp) => sp.ssr_code === SERVICE_APPLICATION_BABY_MEAL_CODE)
            ?.special_meal_name ?? this._staticMsg.transform(SERVICE_APPLICATION_UNKOWN_MEAL_ID);

        this.callMealInfoGetApi();

        this.closeWithUrlChange(this._router);
      }
    );
    //表示文言の取得
    this.subscribeService('getStaticMessage', this._staticMsg.get('label.normalMeal'), (str) => {
      this.adultMealName = str;
    });

    this.subscribeService('updateInfoService', this.service.updateInfoSource$, (data) => {
      this.change.markForCheck();
    });
  }
  init() {}
  destroy() {
    this.deleteSubscription('getMasterDataAll');
    this.deleteSubscription('getStaticMessage');
    this.deleteSubscription('updateInfoService');
  }
  reload() {}

  subPageId: string = ReservationPageIdType.FLIGHT_MEAL_REQUEST;
  subFunctionId: string = ReservationFunctionIdType.PRIME_BOOKING;

  public babyMealName = ''; //ベビーミールの文言
  public adultMealName = 'label.normalMeal'; //通常機内食の文言
  public override payload: MealApplicationModalPayload | null = {};
  override headerRef: MealApplicationModalHeaderComponent | null = null; //ヘッダー画面
  override footerRef: MealApplicationModalFooterComponent | null = null; //フッター画面
  public mastarData: MealApplicationMastarData = initialMealApplicationMastarData();
  public getMealState?: GetMealState;
  public mealMap: Array<MealApplicationPassengerMealInfo> = [];

  public passengerMap: Array<MealApplicationPassengerMapInfo> = [];

  /**
   * 機内食情報取得APIから情報を取得
   */
  callMealInfoGetApi() {
    apiEventAll(
      () => {
        this._getMealStoreService.setGetMealFromApi({
          cartId: this._currentcartStoreService.CurrentCartData.data?.cartId ?? '',
        });
      },
      this._getMealStoreService.getMeal$(),
      (res) => {
        this.getMealState = res;
        this.dynamicSubject.next({
          inflightMealReply: this.getMealState,
          getCartReply: this._currentcartStoreService.CurrentCartData,
        });
        this._pageInitService.endInit(null);
        const segmentInfoReturn = this.service.initilizeSegmentInfo(res);
        const segmentInfo = segmentInfoReturn?.segmentInfo ?? null;
        if (segmentInfo) {
          this.updateAirportName(segmentInfo);
          this.initialMap(segmentInfo);
          this.initialDispMap(segmentInfo);
          this.updateSsrAndDisp(segmentInfo);
        }
      },
      (error) => {
        const err = this._common.apiError;
        if (err?.errors?.[0]?.code === ErrorCodeConstants.ERROR_CODES.EBAZ000023) {
          this._common.errorsHandlerService.setNotRetryableError({
            errorType: ErrorType.BUSINESS_LOGIC,
            apiErrorCode: err.errors[0].code,
            errorMsgId: 'E0333',
          });
        } else {
          this._common.errorsHandlerService.setNotRetryableError({
            errorType: ErrorType.SYSTEM,
          });
        }
      }
    );
  }

  /**
   * 機内食種別マップを生成
   * @param segmentInfo 更新サービス情報
   */
  initialMap(segmentInfo: ServiceApplicationModalSegmentInformation) {
    this.mealMap = [];
    for (let [key, value] of Object.entries(this.getMealState?.data ?? {})) {
      for (let [key2, value2] of Object.entries(value)) {
        for (let special of Object.values(value2.specialMealList ?? {})) {
          special.forEach((info: { code: string }) => {
            this.mealMap.push({ code: info.code ?? '', value: MealApplicationSelectMealType.SPECIAL });
          });
        }
        for (let charge of value2.chargeableMealList ?? []) {
          this.mealMap.push({ code: charge.code ?? '', value: MealApplicationSelectMealType.CHARGEABLE });
        }
        for (let pre of value2.preorderMealList ?? []) {
          this.mealMap.push({ code: pre.code ?? '', value: MealApplicationSelectMealType.PREORDER });
        }
      }
    }
  }

  /**
   * 表示用マップを生成
   * @param segmentInfo 更新サービス情報
   */
  initialDispMap(segmentInfo: ServiceApplicationModalSegmentInformation) {
    if (this.getMealState) {
      this.passengerMap = this.service.initializeMealMap(this.getMealState, segmentInfo, this.mastarData);
    } else {
      this.passengerMap = [];
    }
  }

  /**
   * マスターデータをもとに空港名をcacheの値に入れ替える
   * @param segmentInfo  更新サービス情報
   */
  public updateAirportName(segmentInfo: ServiceApplicationModalSegmentInformation) {
    const airPrefix = 'm_airport_i18n_';

    segmentInfo.segment.forEach((seg) => {
      if (this.mastarData.air[airPrefix + seg.airportCode]) {
        seg.locationName = this.mastarData.air[airPrefix + seg.airportCode];
      }
      if (this.mastarData.air[airPrefix + seg.airportCodeTo]) {
        seg.locationNameTo = this.mastarData.air[airPrefix + seg.airportCodeTo];
      }
    });
  }

  /**
   * 更新サービス情報を更新する
   * @param segmentInfo  更新サービス情報
   */
  public updateSsrAndDisp(segmentInfo: ServiceApplicationModalSegmentInformation) {
    this.service.updateSegmentInfoFlag(segmentInfo);
    this.service.setUpdateInfo(segmentInfo);
    this.change.markForCheck();
  }

  /**
   * 機内食がクリックされた時の処理
   * @param travelerId 搭乗者ID
   * @param segmentId セグメントID
   * @param index 機内食リストのインデックス
   */
  clickMealButton(travelerId: string, segmentId: string, index: number) {
    // モーダルパラメータを取得
    const part = MealApplicationSelectModalPayloadParts();
    const elementId = document.activeElement?.id;

    //ペイロードにデータを入れる
    const traveler = this.getMealState?.data?.[travelerId]?.[segmentId];
    part.payload = {
      specialMealList: traveler?.specialMealList ?? {},
      chargeableMealList: traveler?.chargeableMealList ?? [],
      preorderMealList: traveler?.preorderMealList ?? [],
      masterData: this.mastarData,
      cabin: getBoundFlightFromSegmentId(
        this._currentcartStoreService.CurrentCartData.data?.plan?.airOffer?.bounds ?? [],
        segmentId
      )?.cabin,
    };

    //閉じる時実行処理
    part.closeEvent = (value?: MealApplicationSelectModalSelectInfo) => {
      this.selectMealCloseEvent(travelerId, segmentId, index, value, elementId);
      const elm = document.getElementById(elementId ?? '');
      // WCAG フォーカスを機内食モーダルに戻す
      if (elm) {
        elm.focus();
      }
    };
    //モーダル表示
    this._modal.showSubModal(part);
  }

  /**
   * 選択した機内食を設定(機内食選択モーダル 閉じる時実行処理)
   * @param travelerId 搭乗者ID
   * @param segmentId セグメントID
   * @param index インデックス
   * @param value 選択した機内食情報
   * @param elementId DOMのID
   */
  selectMealCloseEvent(
    travelerId: string,
    segmentId: string,
    index: number,
    value?: MealApplicationSelectModalSelectInfo,
    elementId?: string
  ) {
    if (value) {
      const segments = this.service.updateInfo;
      this.service.setMeal(this.passengerMap, segments, segmentId, travelerId, index, value);

      //特別機内食の場合
      if (value.type === MealType.SPECIAL) {
        //機内食登録可能セグメントが2便以上存在し、当該セグメントが1便目の場合、機内食一括申込ダイアログを表示する
        const segNum = Object.values(this.getMealState?.data?.[travelerId] ?? {}).filter(
          (meal) =>
            meal.isWithinApplicationDeadline &&
            Object.values(meal.specialMealList ?? {}).some((category) =>
              category.some((data: { code: Array<string> }) => (data.code ?? []).some((code) => code === value.code))
            )
        ).length;
        const isFirst =
          this.passengerMap.find((pass) => pass.travelerId === travelerId)?.segment[0]?.segmentId === segmentId;
        if (1 < segNum && isFirst) {
          const ret = this._dialogService.openDialog({
            confirmBtnLabel: 'label.yes',
            closeBtnLabel: 'label.no',
            message: SERVICE_APPLICATION_SAME_MEAL_MESSAGE_ID,
          });
          this.subscribeService('confirmDialogClick', ret.buttonClick$.pipe(take(1)), (result) => {
            if (result.clickType === DialogClickType.CONFIRM) {
              this.passengerMap
                .find((pass) => pass.travelerId === travelerId)
                ?.segment?.forEach((val) => {
                  segments.segment
                    .find((seg) => seg.segmentId === val.segmentId)
                    ?.passengerInformation.find((pass) => pass.id === travelerId)
                    ?.ssr.meal.forEach((meal, index) => {
                      const traveler = this.getMealState?.data?.[travelerId]?.[val.segmentId ?? ''];
                      if (
                        meal.isWithinApplicationDeadline &&
                        Object.values(traveler?.specialMealList ?? '').some((category) =>
                          category.some((data: { code: Array<string> }) =>
                            data.code.some((code) => code === value.code)
                          )
                        )
                      ) {
                        this.service.setMeal(
                          this.passengerMap,
                          segments,
                          val.segmentId ?? '',
                          travelerId,
                          index,
                          value
                        );
                      }
                    });
                });
              this.updateSsrAndDisp(segments);
            }
            // WCAG フォーカスを機内食モーダルに戻す
            const elm = document.getElementById(elementId ?? '');
            if (elm) {
              elm.focus();
            }
          });
        }
      }
      //データの更新
      this.updateSsrAndDisp(segments);
    }
  }

  /**
   * クリアボタンがクリックされた時の処理
   * @param travelerId 搭乗者ID
   * @param segmentId セグメントID
   * @param index 機内食リストのインデックス
   */
  clickMealClear(travelerId: string, segmentId: string, index: number) {
    const segments = this.service.updateInfo;
    const traveler = this.getMealState?.data?.[travelerId]?.[segmentId];
    const target = segments.segment
      .find((seg) => seg.segmentId === segmentId)
      ?.passengerInformation.find((pass) => pass.id === travelerId);
    const disp = this.passengerMap
      .find((pass) => pass.travelerId === travelerId)
      ?.segment.find((seg) => seg.segmentId === segmentId);
    if (target && disp) {
      target.ssr.meal[index].type = '';
      target.ssr.meal[index].code = '';
      target.ssr.meal[index].prevMessageId = '';
      target.ssr.meal[index].total = 0;
      target.ssr.meal[index].updateType =
        target.ssr.meal[index].prevCode === '' ? '' : SERVICE_APPLICATION_STATUS_CANCEL;
      disp.meals[index].mealCode = '';
      disp.meals[index].mealType = '';
      disp.meals[index].dispName =
        traveler?.preorderMealList?.length && traveler.preorderMealList.length !== 0
          ? this._staticMsg.transform(SERVICE_APPLICATION_NOT_PREORDER_MEAL_ID)
          : this.adultMealName;
      disp.meals[index].total = 0;
      disp.meals[index].isSelected = false;
      disp.meals[index].isTypeDisp = false;
      this.updateSsrAndDisp(segments);
    } else {
      //無いはずないけど例外
    }
  }

  /**
   * ベビーミールのチェックボックスがクリックされた時の処理
   * @param travelerId
   * @param segmentId
   * @param index
   */
  clickBabyMeal(travelerId: string, segmentId: string, index: number) {
    const segments = this.service.updateInfo;
    const target = segments.segment
      .find((seg) => seg.segmentId === segmentId)
      ?.passengerInformation.find((pass) => pass.id === travelerId);
    const disp = this.passengerMap
      .find((pass) => pass.travelerId === travelerId)
      ?.segment.find((seg) => seg.segmentId === segmentId);
    if (target && disp) {
      if (disp.meals[index].isSelected) {
        target.ssr.meal[index].code = SERVICE_APPLICATION_BABY_MEAL_CODE;
        target.ssr.meal[index].updateType =
          target.ssr.meal[index].prevCode === SERVICE_APPLICATION_BABY_MEAL_CODE
            ? ''
            : SERVICE_APPLICATION_STATUS_REQUEST;
      } else {
        target.ssr.meal[index].code = '';
        target.ssr.meal[index].updateType =
          target.ssr.meal[index].prevCode === '' ? '' : SERVICE_APPLICATION_STATUS_CANCEL;
      }
      disp.meals[index].mealCode = target.ssr.meal[index].code;
      this.updateSsrAndDisp(segments);
    } else {
      //無いはずないけど例外
    }
  }
}
