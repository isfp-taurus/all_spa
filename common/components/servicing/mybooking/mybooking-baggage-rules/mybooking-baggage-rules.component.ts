import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonLibService } from '@lib/services';
import { SupportComponent } from '@lib/components/support-class';
import { StaticMsgPipe } from '@lib/pipes';
import {
  dummyMybookingBaggageRulesDispInfoTravelerRulesSectionInfoDetails,
  initialMybookingBaggageRulesDisp,
  initialMybookingBaggageRulesMastarData,
  MybookingBaggageRulesDisp,
  MybookingBaggageRulesDispInfo,
  MybookingBaggageRulesDispInfoTravelerRulesSection,
  MybookingBaggageRulesDispInfoTravelerRulesSectionInfo,
  MybookingBaggageRulesInput,
  MybookingBaggageRulesMastarData,
} from './mybooking-baggage-rules.state';
import { FareConditionsResponseDataBaggageBound } from 'src/sdk-servicing/model/fareConditionsResponseDataBaggagePolicies';
import {
  FareConditionsResponseData,
  GetOrderResponseData,
  GetOrderResponseDataServicesBaggageItem,
} from 'src/sdk-servicing';
import { getAirLineNameFromCache, getAirportNameFromCache, getPassengerLabel, isEmptyObject } from '@common/helper';
import { DEFAULT_CURRENCY_CODE_ASW, RamlServicesBaggageFirstSegment } from '@common/interfaces';
import { MybookingBaggageRulesService } from './mybooking-baggage-rules.service';
import { getPaxName } from '@common/helper/passenger-name';
/**
 * 手荷物ルール部品
 *
 * @param data.fareConditions 運賃ルール・手荷物情報取得APIレスポンス
 * @param data.getOrder PNR情報取得レスポンス
 *
 */
@Component({
  selector: 'asw-mybooking-baggage-rules',
  templateUrl: './mybooking-baggage-rules.component.html',
  styleUrls: ['./mybooking-baggage-rules.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MybookingBaggageRulesComponent extends SupportComponent {
  constructor(
    private _common: CommonLibService,
    private _staticMsg: StaticMsgPipe,
    public change: ChangeDetectorRef,
    private _service: MybookingBaggageRulesService
  ) {
    super(_common);
    //キャッシュ情報の取得
    this._service.getCacheMaster((master) => {
      this.master = master;
      if (this.data) {
        this.refresh();
      }
    });
  }

  reload(): void {}
  init(): void {}
  destroy(): void {}

  @Input()
  set data(value: MybookingBaggageRulesInput | undefined) {
    this._data = value;
    this.refresh();
  }
  get data(): MybookingBaggageRulesInput | undefined {
    return this._data;
  }
  public _data?: MybookingBaggageRulesInput | undefined;
  @Output()
  dataChange = new EventEmitter<any>();

  @Output()
  clickLinkEvent = new EventEmitter<void>();

  // ロード中判定　ロード画面を表示するフラグ
  public isLoad = true;
  // エラー判定　エラーメッセージ表示するフラグ
  public isError = false;
  // 表示用データ
  public dispData: MybookingBaggageRulesDisp = initialMybookingBaggageRulesDisp;
  // 内部で必要なキャッシュデータ
  public master: MybookingBaggageRulesMastarData = initialMybookingBaggageRulesMastarData();

  // プラン有効判定（プラン確認画面にて使用）
  @Input() isPlanValid? = true;

  /**
   * 表示用データの更新
   */
  public refresh() {
    if (this.data?.fareConditions) {
      this.isLoad = false;
      if (
        this.data.fareConditions.isFailure ||
        (this.data.fareConditions.data && !this.data.fareConditions.data.baggagePolicies)
      ) {
        this.isError = true;
        this.dispData = { ...initialMybookingBaggageRulesDisp, policyRegulations: 'error' };
      } else {
        this.isError = false;
        this.dispData = {
          policyRegulations: this.dispPolicyRegulations(
            this.data.fareConditions.data.baggagePolicies?.policyRegulations
          ),
          info: this.getInfoData(this.data.fareConditions.data, this.data.getOrder.data ?? {}),
          isDomestic: this.data?.getOrder?.data?.air?.tripType === 'domestic',
        };
      }
    } else {
      this.isLoad = true;
      this.isError = false;
      this.dispData = initialMybookingBaggageRulesDisp;
    }
    this.change.detectChanges();
  }

  /**
   * 手荷物ルールの判定　IATAかDOTか
   * @param policyRegulations 手荷物ルール
   * @returns 手荷物ルール表示判定用文字列
   */
  dispPolicyRegulations(policyRegulations?: string) {
    if (!policyRegulations) return '';
    return policyRegulations === 'IATA RESO 302' ? 'IATA' : 'DOT';
  }

  /**
   * 手荷物ルール表示用データの作成
   * @param res 運賃ルール・手荷物情報取得APIレスポンス
   * @param pnr PNR情報取得レスポンス
   * @returns 手荷物ルール表示用データ
   */
  getInfoData(res: FareConditionsResponseData, pnr: GetOrderResponseData): Array<MybookingBaggageRulesDispInfo> {
    const policyRegulations = this.dispPolicyRegulations(res.baggagePolicies?.policyRegulations);
    const keys = Object.keys(res.baggagePolicies?.baggageAllowance ?? {})?.filter((key) => key !== 'allTravelersRule');
    const baggageFirst: GetOrderResponseDataServicesBaggageItem =
      policyRegulations === 'IATA' ? pnr.services?.baggage?.firstBaggage ?? {} : {};
    return (
      res.baggagePolicies?.baggageAllowance?.[keys[0] ?? '']?.baggageBounds?.map((bound) => {
        const flightId = bound?.checkedBaggageAllowance?.flightIds?.[0];
        const airBoundId = pnr?.air?.bounds?.find((pnrBound) =>
          pnrBound.flights?.find((flight) => flight?.id === flightId)
        )?.airBoundId;
        const isAvailable =
          policyRegulations === 'IATA'
            ? this._service.isBaggaheAvailable(baggageFirst, airBoundId ?? '') &&
              (pnr.orderEligibilities?.firstBaggage?.isEligible ?? false) &&
              (pnr?.orderEligibilities?.firstBaggage?.isEligibleToForward ?? false)
            : false;
        const isAvailableLabel = policyRegulations === 'IATA' ? this._service.getAvailableLabel(isAvailable) : '';
        return {
          departure:
            getAirportNameFromCache(bound.departure?.locationCode ?? '', this.master.airport) ??
            bound.departure?.locationName,
          arrival:
            getAirportNameFromCache(bound.arrival?.locationCode ?? '', this.master.airport) ??
            bound.arrival?.locationName,
          careerNameCheckedBaggage:
            getAirLineNameFromCache(bound.checkedBaggageAllowance?.airlineCode ?? '', this.master.airline) ??
            bound.checkedBaggageAllowance?.airlineName,
          careerNameCarryOn:
            getAirLineNameFromCache(bound.carryOnAllowance?.airlineCode ?? '', this.master.airline) ??
            bound.carryOnAllowance?.airlineName,
          tripType: pnr.air?.tripType ?? '',
          ruleLabelCheckedBaggage:
            policyRegulations === 'IATA'
              ? this._service.getTripruleDetaile(
                  pnr.air?.tripType ?? '',
                  bound.checkedBaggageAllowance?.isNhGroupOperating === true
                )
              : bound.checkedBaggageAllowance?.isNhGroupOperating
              ? this._staticMsg.transform('label.checkedBaggageAllownance.nhLink')
              : '',
          ruleLabelCarryOn:
            policyRegulations === 'IATA'
              ? this._service.getTripruleDetaile(
                  pnr.air?.tripType ?? '',
                  bound.carryOnAllowance?.isNhGroupOperating === true
                )
              : bound.carryOnAllowance?.isNhGroupOperating
              ? this._staticMsg.transform('label.cabinBaggageAllownance.nhLink')
              : '',
          isAvailable: isAvailable,
          isAvailableLabel: isAvailableLabel,
          travelerRules:
            pnr.travelers
              ?.filter((traveler) => traveler.regulatoryDetails)
              .map((traveler, index) => {
                return {
                  // 変更管理 No.50 第3性別対応
                  // ※nameの||の右側：プラン確認画面でのみ想定されるケース
                  name: getPaxName(traveler) || this._staticMsg.transform('label.passenger.n', { '0': index + 1 }),
                  passengerTypeLabel: this._staticMsg.transform(getPassengerLabel(traveler.passengerTypeCode ?? '')),
                  sectionRules: this.getSectionRules(
                    res.baggagePolicies?.baggageAllowance?.[traveler.id ?? '']?.baggageBounds ?? [],
                    res.baggagePolicies?.baggageAllowance?.[traveler.id ?? '']?.baggageBounds?.length || 0,
                    policyRegulations
                  ),
                };
              }) ?? [],
        };
      }) ?? []
    );
  }

  /**
   * 搭乗者ごとの手荷物ルールを作成する
   * @param data 運賃ルール・手荷物情報取得APIのバウンドごとの手荷物情報
   * @param boundNum 適用区間情報リスト数
   * @policyRegulations 手荷物ルール
   * @returns 手荷物ルール
   */
  getSectionRules(
    data: Array<FareConditionsResponseDataBaggageBound>,
    boundNum: number,
    policyRegulations: string
  ): MybookingBaggageRulesDispInfoTravelerRulesSection {
    const preCheckedBaggage = data.map((baggage) => this.getSectionRulesBlock(baggage ?? {}, 'checked'));
    const preCarryOnBaggage = data.map((baggage) => this.getSectionRulesBlock(baggage ?? {}, 'carry'));
    //　表示の都合上行と列を入れ替える
    return {
      checkedBaggage:
        policyRegulations === 'IATA' ? preCheckedBaggage : this.remakeSection(preCheckedBaggage, boundNum) ?? [],
      carryOnBaggage:
        policyRegulations === 'IATA' ? preCarryOnBaggage : this.remakeSection(preCarryOnBaggage, boundNum) ?? [],
    };
  }

  /**
   * 表示用に表示の都合上行と列を入れ替える、ダミーデータ処理などを行う
   * @param baggage USDOT　CADOT用データ
   * @param boundNum 適用区間情報リスト数
   * @returns 荷物ルール
   */
  remakeSection(baggage: Array<MybookingBaggageRulesDispInfoTravelerRulesSectionInfo>, boundNum: number) {
    if (boundNum > 1) {
      return baggage.map((bag, index) => {
        const preDetail = baggage.map(
          (select) => select.details?.[index] ?? dummyMybookingBaggageRulesDispInfoTravelerRulesSectionInfoDetails
        );
        return {
          num: bag.num,
          label: this._service.getBagLabel(index),
          details: preDetail.some((detail) => !detail.isDummy) ? preDetail : [], // 行が全てダミーなら表示する必要がないので削除
        };
      });
    } else if (!isEmptyObject(baggage) && !isEmptyObject(baggage[0].details)) {
      return baggage[0].details?.map((detail, index) => {
        const preDetail = detail ?? dummyMybookingBaggageRulesDispInfoTravelerRulesSectionInfoDetails;
        return {
          num: baggage[0].num,
          label: this._service.getBagLabel(index),
          details: !preDetail.isDummy ? [preDetail] : [], // 行が全てダミーなら表示する必要がないので削除
        };
      });
    } else {
      return [
        {
          num: 0,
          label: '',
          details: [],
        },
      ];
    }
  }

  /**
   * 手荷物ルール詳細を作成する
   * @param data 運賃ルール・手荷物情報取得APIレスポンスの手荷物ルール
   * @param baggageType 手荷物種別 'checked'(預入) | 'carry'(機内持ち込み)
   * @returns 手荷物ルール詳細
   */
  getSectionRulesBlock(
    data: FareConditionsResponseDataBaggageBound,
    baggageType: string
  ): MybookingBaggageRulesDispInfoTravelerRulesSectionInfo {
    const key = baggageType === 'checked' ? 'checkedBaggageAllowance' : 'carryOnAllowance';
    return {
      num: data?.[key]?.quantity,
      label: '',
      details:
        data?.[key]?.details?.map((detail) => {
          return {
            isDummy: false,
            isFree: detail.isFree ?? false,
            price: detail.totalPrices?.price ?? 0,
            currencyCode: detail.totalPrices?.currencyCode ?? DEFAULT_CURRENCY_CODE_ASW,
            weight: detail.policyDetails?.weight,
            weightLabel: this._service.getWeightLabel(detail.policyDetails?.weight),
            descriptions: detail.descriptions ?? [],
          };
        }) ?? [],
    };
  }
}
