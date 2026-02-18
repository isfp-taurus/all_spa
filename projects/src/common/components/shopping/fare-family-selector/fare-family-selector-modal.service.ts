import { Injectable } from '@angular/core';
import { ModalType } from '@lib/components';
import { SupportClass } from '@lib/components/support-class';
import { ModalBlockParts, ModalService, AswMasterService, CommonLibService } from '@lib/services';
import { Subject } from 'rxjs';
import { FareFamilySelectorModalComponent } from './fare-family-selector-modal.component';
import { FareFamilySelectorInput, FareFamilySelectorOutput } from './fare-family-selector-modal.state';
import { TSList } from 'src/app/roundtrip-flight-availability-international//presenter/roundtrip-flight-availability-international-pres.state';
import { MASTER_TABLE } from '@conf/asw-master.config';
import { FlightUpgradeInfo, ffSelectModalInfo } from '@common/interfaces/roundtripFlightAvailabilityInternational';
import { AirOffer, Bounds } from '@common/interfaces/shopping/roundtrip-owd';
import { RoundtripOwdResponse } from 'src/sdk-search';
import { RoundtripOwdService } from '@common/services/roundtrip-owd/roundtrip-owd-store.service';
import { RoundtripFlightAvailabilityInternationalState } from '@common/store/roundtripFlightAvailabilityInternational';
import { fareFamiliesInfo } from '@common/components/shopping/fare-family-selector/fare-family-selector-modal-item/fare-family-selector-modal-item.state';
import { Flights } from '@common/interfaces/shopping/roundtrip-owd/response/data/airOffers/flights';
import { Type9 } from 'src/sdk-search/model/type9';
import { RoundtripFlightAvailabilityInternationalService } from '@common/services/roundtripFlightAvailabilityInternational/roundtripFlightAvailabilityInternational.service';
import { RoundtripFlightAvailabilityInternationalContService } from '@app/roundtrip-flight-availability-international/container/roundtrip-flight-availability-international-cont.service';
import { FareFamiliesRule } from '../fare-family-selector-modal-rule/fare-family-selector-modal-rule.state';
import { MListData } from '@common/interfaces';
import { CabinCacheList } from '@common/interfaces/shopping/cabinClass/cabinClassList';
import { CabinCache } from '@common/interfaces/shopping/cabinClass/cabinClass';

@Injectable({
  providedIn: 'root',
})
export class FareFamilySelectorModalService extends SupportClass {
  constructor(
    private _common: CommonLibService,
    public _modalService: ModalService,
    private _roundtripOwdService: RoundtripOwdService, // 往復指定日空席照会(OWD)用API(store)：roundtrip-owd
    private _roundtripFlightAvailabilityInternationalService: RoundtripFlightAvailabilityInternationalService, //往復空席画面store
    private _aswMasterSvc: AswMasterService, //キャッシュ取得サービス
    private _roundtripFlightAvailabilityService: RoundtripFlightAvailabilityInternationalContService
  ) {
    super();
    this._modalBlockParts = this._modalService.defaultBlockPart(FareFamilySelectorModalComponent);
    this._modalBlockParts.closeBackEnable = true;
    this._modalBlockParts.type = ModalType.TYPE2;
    this._subject = new Subject<FareFamilySelectorOutput>();
  }

  destroy(): void {
    this.deleteSubscription('TableSliderComponentResize');
  }

  /** 往復空席照会結果(国際)画面のStore */
  private _R01P030Store: RoundtripFlightAvailabilityInternationalState = {};

  /** 往復指定日空席照会(OWD)用レスポンス */
  private _response: RoundtripOwdResponse = {};

  /** FlightUpgradeInfo[] */
  public upgradeInformation: FlightUpgradeInfo[] = [];

  /** FF選択モーダル表示リスト */
  private ffSelectModalList?: ffSelectModalInfo[] = [];

  /** プロモーション適用有無 */
  private isPromotionApplied: boolean = false;

  /** セグメント情報(TravelSolution配下のflights) */
  private travelSolutionsFlightsList?: Type9[] = [];
  /** FF毎のセグメント関連情報リスト(AirOffer配下のBounds.flights) */
  private airOffersFlightsList?: Flights[][] = [];
  /** FF毎の当該bound.flights ※AirOffer配下のBounds */
  private airOfferBounds: Bounds[] = [];

  private _modalBlockParts: ModalBlockParts;
  private _subject!: Subject<FareFamilySelectorOutput>;

  public asObservableSubject() {
    return this._subject.asObservable();
  }

  /**
   * モーダルの表示
   *
   * @param tsList
   * @param boundIndex
   * @param anaCouchIsEnabledFlightIndexList
   * @param ffNameMap
   * @param tsIndex
   */
  public openModal(
    tsList: TSList,
    boundIndex: number,
    anaCouchIsEnabledFlightIndexList: number[],
    ffNameMap: Map<string, string>,
    tsIndex: number,
    tripTypeList: string[]
  ) {
    // 引数のAPIレスポンスを代入
    this._response = this._roundtripOwdService.roundtripOwdData ?? {};

    // 往復空席照会画面storeから値を取得
    this._R01P030Store =
      this._roundtripFlightAvailabilityInternationalService.roundtripFlightAvailabilityInternationalData;

    // FF情報 作成メソッドの呼び出し
    let fareFamiliesInfoList: fareFamiliesInfo[] = this.fareFamiliesInfo(boundIndex, ffNameMap);
    // セグメント情報リスト、セグメント関連情報リスト取得処理の呼び出し
    this.segmentInfoCreate(this._response, boundIndex, this.airOfferBounds);

    // FF選択モーダル内プロモーション適用有無の初期値false
    this.isPromotionApplied = false;
    // 画面表示用データ.airOffers.<選択airOfferId>.bounds[インデックス].totalProce.discountが存在する(プロモーション適用有無=trueが存在する)場合
    // FF選択モーダル内プロモーション適用有無にtrueを設定する
    if (fareFamiliesInfoList.filter((x) => x.isPromotionApplied).length > 0) {
      this.isPromotionApplied = true;
    }

    // 作成した値を引数に設定
    const input_data: FareFamilySelectorInput = {
      isPromotionApplied: this.isPromotionApplied, // プロモーション適用有無
      flightSummary: tsList.flightSummary!, // フライトサマリ部分
      fareFamiliesInfoList: fareFamiliesInfoList, // FF情報 オブジェクト
      travelSolutionsFlightsList: this.travelSolutionsFlightsList, // セグメント情報リスト(TravelSolution配下のflights)
      airOffersFlightsList: this.airOffersFlightsList, // セグメント関連情報リスト(AirOffer配下のflights)
      airOfferBounds: this.airOfferBounds, // 当該bounds
      upgradeInfo: this.upgradeInformation, // 当該当該バウンドアップグレード情報マップ
      anaCouchIsEnabledFlightIndexList: anaCouchIsEnabledFlightIndexList, // ANAカウチ利用可否Indexリスト
      subject: this._subject, // subject
      travelSolutionIndex: tsIndex, // TSのインデックス
      tripTypeList,
    };
    /** ペイロードを介して引数を渡す */
    this._modalBlockParts.payload = input_data;
    /** モーダルの表示 */
    this._modalService.showSubModal(this._modalBlockParts);
  }

  /** セグメント情報リスト、セグメント関連情報リスト取得処理(fare-family-selector-modal-item引数作成メソッド) */
  private segmentInfoCreate(response: RoundtripOwdResponse, boundIndex: number, airOfferBounds: Bounds[]): void {
    // セグメント情報リスト(TravelSolution配下のflights)を設定
    response?.data?.roundtripBounds?.[boundIndex]?.travelSolutions?.forEach((travelSolution) => {
      // FF選択モーダルでtravelSolutionIdは特定のidただ一つのため、当該bounds以外のboundsでも問題ない
      // 利用可能なboundsからtsidを取得(先頭が非表示の場合などへの対策)
      const travelSolutionId = airOfferBounds.map((x) => x.travelSolutionId).filter((x) => !!x)[0];

      if (travelSolution.travelSolutionId === travelSolutionId) {
        this.travelSolutionsFlightsList = travelSolution.flights;
      }
    });

    // セグメント関連情報リスト(当該bound.flights ※AirOffer配下のBounds.flights)を設定
    this.airOffersFlightsList = airOfferBounds.map((x) => x.flights ?? []);
  }

  /**
   * FF情報 作成メソッド
   *
   * @param boundIndex
   * @param ffNameMap
   * @returns
   */
  private fareFamiliesInfo(boundIndex: number, ffNameMap: Map<string, string>): fareFamiliesInfo[] {
    //返却値のFF情報リストを初期化
    let fareFamiliesInfoList: fareFamiliesInfo[] = [];

    /** FF情報 を初期化 */
    let fareFamiliesInfo: fareFamiliesInfo = {
      /** キャビンクラス毎にスタイル指定するためのclassサフィックス */
      headingItemSuffix: '',
      /** 選択済み */
      isSelected: false,
      /** (国際)変更前とセグメント数、販売キャリアコード、便番号、出発日、出発地、到着地、Fare basisが一致する場合true */
      isCurrent: false,
      /** キャビンクラス */
      cabinClassName: '',
      /** fareFamilyCode */
      fareFamilyCode: '',
      /** FF名称 */
      fareFamilyName: '',
      /** 通貨記号 */
      currencySymbol: '',
      /** 金額(プロモーション適用ありの場合、割引後金額) */
      price: 0,
      /** 金額(プロモーション適用ありの場合、割引前金額) */
      originalPrice: undefined,
      /** 残席数 */
      quota: 0,
      /** 残席種別 */
      quotaType: Bounds.QuotaTypeEnum.Available,
      /** プロモーション適用済 */
      isPromotionApplied: false,
      /** 最安支払い総額である */
      isLowestPrice: false,
      /** 運賃変更案内　表示可否 */
      faresChangeInformation: false,
      /** 支払総額以降表示可否 */
      notDisplayAirOffer: false,
      /** 販売キャリアコード + 便番号 ※選択ボタン読み上げ用ラベル */
      flightInfo: '',
      /** PD_930汎用マスターデータ(リスト).表示内容 ※選択ボタン読み上げ用ラベル */
      pd930Text: '',
      /** FFルール */
      fareFamiliesRule: {
        /** 予約変更可否 */
        itineraryPermit: '',
        /** 払戻可否 */
        refundPermit: '',
        /** 無料預け入れ手荷物 返却有無 */
        isReceivedFreeBaggagePcs: false,
        /** 無料預け入れ手荷物個数 */
        freeBaggagePcs: 0,
        /** 無料機内持ち込み手荷物 返却有無 */
        isReceivedCarryOnBaggage: false,
        /** 無料機内持ち込み手荷物個数 */
        carryOnBaggage: 0,
        /** 事前追加手荷物申し込み可・不可 */
        isFirstBaggagePermitted: false,
      },
      /** アップグレード情報 */
      upgradeInfo: [{}],
    };

    /** FF選択モーダル表示リストを画面storeから取得 */
    this.ffSelectModalList = this._R01P030Store.ffSelectModalList;

    this.airOfferBounds = [];

    // FF選択モーダル表示リストの要素数を繰り返し
    this.ffSelectModalList?.forEach((ffSelectModalInfo, ffIndex) => {
      // 当該FF毎表示内容マップ  ※項目説明用
      ffSelectModalInfo;
      // 当該FF ※項目説明用
      ffSelectModalInfo.fareFamily;
      // 当該airOfferの初期化
      let airOffer: AirOffer = {};
      // 支払総額以降表示可否
      let _notDisplayAirOffer: boolean = false;
      // 選択済み有無
      let _isSelected: boolean = false;

      // displayAirOfferが存在する場合、当該airOfferに設定する。
      // displayAirOfferが存在しない場合、支払総額以降表示可否にtrueを設定する。
      if (ffSelectModalInfo.displayAirOffer) {
        airOffer = ffSelectModalInfo.displayAirOffer;
      } else {
        _notDisplayAirOffer = true;
      }

      // 当該FF毎表示内容マップ.airOfferId=選択AirOfferId の場合、選択済み有無にtrueを設定
      if (airOffer.bounds) {
        if (
          boundIndex === 0 &&
          airOffer.bounds[0].travelSolutionId === this._roundtripFlightAvailabilityService.getSelectOutboundTSID() &&
          airOffer.bounds[0].fareFamilyCode === this._roundtripFlightAvailabilityService.getSelectOutboundFFCode()
        ) {
          _isSelected = true;
        }
        if (
          boundIndex === 1 &&
          airOffer.bounds[1].travelSolutionId === this._roundtripFlightAvailabilityService.getSelectReturnTripTSID() &&
          airOffer.bounds[1].fareFamilyCode === this._roundtripFlightAvailabilityService.getSelectReturnTripFF()
        ) {
          _isSelected = true;
        }
      }

      // undefined防止のため、設定用変数を初期化
      let _cabinClassName: string = '';
      let _fareFamilyCode: string = '';
      let _fareFamilyName: string = '';
      let _quota: number = 0;
      let _price: number = 0;
      let _originalPrice: number | undefined;
      let _isPromotionApplied: boolean = false;
      let _isLowestPrice: boolean = false;
      let _flightInfo: string = '';
      let _pd930Text: string = '';

      // キャビンクラスの値を設定
      _cabinClassName = this.getPD930Content(ffSelectModalInfo);

      // FF名称の値を設定
      if (ffSelectModalInfo.fareFamily) {
        if (ffSelectModalInfo.fareFamily.fareFamilyCode) {
          _fareFamilyCode = ffSelectModalInfo.fareFamily.fareFamilyCode ?? '';
          _fareFamilyName = ffNameMap.get(ffSelectModalInfo.fareFamily.fareFamilyCode) ?? '';
        }
      }

      // 当該バインドを一旦設定
      this.airOfferBounds[ffIndex] = {};

      /**
       * 以下4項目を設定
       * 支払総額,
       * プロモーション適用前支払総額,
       * 残席数,
       * プロモーション適用済アイコン,
       * 最安支払総額である旨の表示
       */
      if (airOffer) {
        if (airOffer.bounds) {
          // 支払総額の設定
          _price = airOffer.bounds[boundIndex].totalPrice?.total ?? 0;
          // プロモーション適用前支払総額
          _originalPrice = airOffer.bounds[boundIndex].totalPrice?.discount?.originalTotal;
          // 残席数
          _quota = airOffer.bounds[boundIndex].quota ?? 0;
          // プロモーション適用済アイコン
          _isPromotionApplied = airOffer.bounds[boundIndex].totalPrice?.discount != undefined ? true : false;
          // 当該bound 当メソッド以外にも使用するため、画面変数に設定
          this.airOfferBounds[ffIndex] = airOffer.bounds[boundIndex];
          // FF選択ボタン 読み上げ用(販売キャリアコード + 便番号)文言設定処理
          _flightInfo = this.getFlightInfo(airOffer, boundIndex) ?? '';
          // FF選択ボタン 読み上げ用(汎用マスターデータ(リスト).表示内容)文言設定処理
          _pd930Text = this.getSelectButtonText(ffSelectModalInfo) ?? '';
        }
        if (airOffer.prices) {
          _isLowestPrice = airOffer.prices.isCheapest ? true : false;
        }
      }

      // その他の値も含めて設定
      fareFamiliesInfo = {
        /** キャビンクラス毎にスタイル指定するためのclassサフィックス */
        headingItemSuffix: ffSelectModalInfo?.fareFamily?.fareFamilyWithService?.cabin ?? '',
        /** 選択済み */
        isSelected: _isSelected,
        /** (国際)変更前とセグメント数、販売キャリアコード、便番号、出発日、出発地、到着地、Fare basisが一致する場合true */
        isCurrent: false,
        /** キャビンクラス */
        cabinClassName: _cabinClassName,
        /** FF名称 ※fareFamilyCode */
        fareFamilyCode: _fareFamilyCode,
        /** FF名称  */
        fareFamilyName: _fareFamilyName,
        /** 支払総額　通貨記号 ※通貨記号用の共通部品が提供され次第使用する*/
        currencySymbol: '',
        /** 支払総額 (プロモーション適用ありの場合、割引後金額) */
        price: _price,
        /** プロモーション適用前支払総額 */
        originalPrice: _originalPrice,
        /** 残席数 */
        quota: _quota,
        /** 残席数 残席状況 */
        quotaType: airOffer?.bounds?.[boundIndex]?.quotaType ?? Bounds.QuotaTypeEnum.Enough,
        /** プロモーション適用済アイコン */
        isPromotionApplied: _isPromotionApplied,
        /** 最安支払総額である旨の表示 */
        isLowestPrice: _isLowestPrice,
        /** 運賃変更案内　表示可否 */
        faresChangeInformation: ffSelectModalInfo.otherBoundFareChange ?? false,
        /** 支払総額以降表示可否 */
        notDisplayAirOffer: _notDisplayAirOffer,
        /** 販売キャリアコード + 便番号 ※選択ボタン読み上げ用ラベル */
        flightInfo: _flightInfo,
        /** PD_930汎用マスターデータ(リスト).表示内容 ※選択ボタン読み上げ用ラベル */
        pd930Text: _pd930Text,
        /** FFルール */
        fareFamiliesRule: this.getFareFamiliesRule(airOffer?.bounds?.[boundIndex]),
        /** アップグレード情報 */
        upgradeInfo: ffSelectModalInfo.upgradeInfo,
      };
      fareFamiliesInfoList.push(fareFamiliesInfo);
    });

    return fareFamiliesInfoList;
  }

  /**
   * FFルール 作成メソッド
   *
   * @param airOfferBounds
   */
  public getFareFamiliesRule(airOfferBounds?: Bounds): FareFamiliesRule {
    // 予約変更可否 ※ChangeConditionsTypeEnum型がHTMLのngIfで判定できないため、string型に変換
    let _itineraryPermit: string = '';
    if (airOfferBounds?.changeConditionsType === Bounds.ChangeConditionsTypeEnum.free) {
      _itineraryPermit = 'free';
    }
    if (airOfferBounds?.changeConditionsType === Bounds.ChangeConditionsTypeEnum.unavailable) {
      _itineraryPermit = 'unavailable';
    }
    if (airOfferBounds?.changeConditionsType === Bounds.ChangeConditionsTypeEnum.withPenalty) {
      _itineraryPermit = 'withPenalty';
    }

    // 払戻可否 ※RefundConditionsTypeEnum型がHTMLのngIfで判定できないため、string型に変換
    let _refundPermit: string = '';
    if (airOfferBounds?.refundConditionsType === Bounds.ChangeConditionsTypeEnum.free) {
      _refundPermit = 'free';
    }
    if (airOfferBounds?.refundConditionsType === Bounds.ChangeConditionsTypeEnum.unavailable) {
      _refundPermit = 'unavailable';
    }
    if (airOfferBounds?.refundConditionsType === Bounds.ChangeConditionsTypeEnum.withPenalty) {
      _refundPermit = 'withPenalty';
    }

    let fareFamiliesRule: FareFamiliesRule = {
      /** 予約変更可否 */
      itineraryPermit: _itineraryPermit,
      /** 払戻可否 */
      refundPermit: _refundPermit,
      /** 無料預け入れ手荷物 返却有無 */
      isReceivedFreeBaggagePcs: airOfferBounds?.minFreeCheckedBaggageQuantity !== undefined ? true : false,
      /** 無料預け入れ手荷物個数 */
      freeBaggagePcs: airOfferBounds?.minFreeCheckedBaggageQuantity ?? 0,
      /** 無料機内持ち込み手荷物 返却有無 */
      isReceivedCarryOnBaggage: airOfferBounds?.minFreeCarryOnBaggageQuantity !== undefined ? true : false,
      /** 無料機内持ち込み手荷物個数 */
      carryOnBaggage: airOfferBounds?.minFreeCarryOnBaggageQuantity ?? 0,
      /** 事前追加手荷物申し込み可・不可 */
      isFirstBaggagePermitted: airOfferBounds?.isFirstBaggageAvailable ?? false,
    };

    return fareFamiliesRule;
  }

  /**
   * データコード=“PD_930”(表示用クラス名称)、value=クラス名称コード(※)となるASWDB(マスタ)の汎用マスターデータ(リスト).表示内容取得
   * @param value クラス名称コード
   * @returns データコード=“PD_930”の表示内容
   */
  private getPD930Content(ffSelectModalInfo: ffSelectModalInfo) {
    let result: string = '';
    let m_list_data_930: CabinCacheList = this._aswMasterSvc.aswMaster[MASTER_TABLE.M_LIST_DATA_930.key];
    let typeDataList = m_list_data_930?.[this._R01P030Store.searchResultItineraryType ?? ''];
    if (typeDataList) {
      typeDataList.some((typeData: CabinCache) => {
        if (typeData.value === ffSelectModalInfo.fareFamily?.fareFamilyWithService?.cabin) {
          result = typeData.label;
        }
      });
    }
    return result;
  }

  /**
   * FF選択ボタン 読み上げ用ラベル(販売キャリアコード + 便番号)取得処理
   *
   * @param airOffer 当該当該AirOffer
   * @param boundIndex バウンドインデックス
   */
  private getFlightInfo(airOffer: AirOffer, boundIndex: number) {
    // 1 当該bound[当該バウンドのインデックス].flights(以下、当該flightsとする)の要素数分、以下の文字を結合した文字列
    // 1.1 当該flights.marketingAirlineCode
    // 1.2 当該flights.marketingFlightNumber
    let flightInfo: string = '';

    // TravelSolutionIDを当該AirOfferから取得
    let tsId: string = '';
    if (airOffer.bounds) {
      tsId = airOffer.bounds[boundIndex].travelSolutionId ?? '';
    }

    if (this._response.data === undefined) {
      return;
    }
    if (this._response.data.roundtripBounds === undefined) {
      return;
    }
    if (this._response.data.roundtripBounds[boundIndex] === undefined) {
      return;
    }
    // 当該bound[当該バウンドのインデックス].flights(以下、当該flightsとする)の要素数分、繰り返し設定
    this._response.data.roundtripBounds[boundIndex].travelSolutions?.forEach((travelSolution) => {
      if (travelSolution.travelSolutionId === tsId) {
        travelSolution.flights?.forEach((flight) => {
          flightInfo = flightInfo + flight.marketingAirlineCode ?? '';
          flightInfo = flightInfo + flight.marketingFlightNumber?.toString() ?? '';
        });
      }
    });

    return flightInfo;
  }

  /**
   * FF選択ボタン 読み上げ用ラベル(汎用マスターデータ(リスト).表示内容)取得処理
   *
   * @param ffSelectModalInfo 当該FF毎表示内容マップ
   */
  private getSelectButtonText(ffSelectModalInfo: ffSelectModalInfo) {
    // 2 データコード=“PD_930”(表示用クラス名称)、value=クラス名称コード(※)となるASWDB(マスタ)の汎用マスターデータ(リスト).表示内容(※)以下を区切り文字(-(ハイフン))で連結した値
    // 2.1 “R”(有償)
    // 2.2 検索結果旅程種別
    // 2.3 当該FF.fareFamilyWithService.cabin
    let pd930Text: string = '';

    // 検索結果種別を画面storeから取得
    let searchResultItineraryType = this._R01P030Store.searchResultItineraryType ?? 'international';

    // 当該FF.fareFamilyWithService.cabinを取得
    let ffCabin: string = '';
    if (ffSelectModalInfo.fareFamily) {
      if (ffSelectModalInfo.fareFamily.fareFamilyWithService) {
        if (ffSelectModalInfo.fareFamily.fareFamilyWithService.cabin) {
          ffCabin = ffSelectModalInfo.fareFamily.fareFamilyWithService.cabin;
        }
      }
    }

    // クラス名称コード(※)以下を区切り文字(-(ハイフン))で連結した値
    // “R”(有償) , 検索結果旅程種別 , 当該FF.fareFamilyWithService.cabin
    let classCode = 'R-' + searchResultItineraryType + '-' + ffCabin;

    let listDataAkamaiData: MListData[] = this._aswMasterSvc.aswMaster[MASTER_TABLE.LISTDATA_ALL.key];
    // キャッシュを取得
    listDataAkamaiData?.forEach((data) => {
      if (data.data_code === 'PD_930' && data.value === classCode) {
        pd930Text = data.display_content;
      }
    });

    return pd930Text;
  }
}
