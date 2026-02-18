import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { SupportComponent } from '@lib/components/support-class';
import { GetSeatmapsStoreService } from '@common/services/api-store/sdk-servicing/get-seatmaps-store/get-seatmaps-store.service';
import { ServicingSeatmapService } from '@common/services/seatmap/servicing-seatmap.service';
import { MasterStoreKey } from '@conf/asw-master.config';
import { AswMasterService, CommonLibService } from '@lib/services';
import { combineLatest, take } from 'rxjs';
import { Type1 } from 'src/sdk-servicing';
import { AcvStatus } from '@app/complex-flight-availability/sub-components/flight-bound/flight-bound.state';
import { filter } from 'rxjs/operators';
import { SeatmapHelperService } from '@common/services/seatmap/seatmap-helper.service';
import { AppConstants } from '@conf/app.constants';

const SEATMAP_PROPETRY_CATEGORY = 'seatMap';

@Component({
  selector: 'asw-servicing-seatmap-seat-products',
  templateUrl: './servicing-seatmap-seat-products.component.html',
  styleUrls: ['./servicing-seatmap-seat-products.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicingSeatmapSeatProductsComponent extends SupportComponent {
  /** セグメント表示対象 */
  @Input() displayTargetSegment: Type1 | undefined;

  /** 通常席のシート名のための静的文言キー */
  normalSeatNameStaticMsgKey: string = '';

  /** 通常席のシート画像alt文言のための静的文言キー */
  normalSeatImgAltStaticMsgKey: string = '';

  /** 後ろ向き座席が存在するか */
  isContainedRearFacingSeat?: boolean;

  /** 有料カウチ席指定済みが存在するか */
  existsPaidCouchRequested?: boolean;

  /** 通常席のプロダクトURL */
  normalSeatProductUrl?: string;

  /** 通常席の画像 */
  normalSeatImage?: string;

  /** 後ろ向き席のコンテンツリンク */
  rearFacingSeatLink?: string;

  /** 後ろ向き席の画像 */
  rearFacingSeatImage?: string;

  /** カウチ席のコンテンツリンク */
  couchSeatLink?: string;

  /** カウチ席の画像 */
  couchSeatImage?: string;

  /** 画像ファイルパス定数用 */
  public appConstants = AppConstants;

  constructor(
    private _commonService: CommonLibService,
    private _getSeatmapsStoreService: GetSeatmapsStoreService,
    private _seatmapHelperService: SeatmapHelperService,
    private _masterService: AswMasterService,
    private _changeDetector: ChangeDetectorRef,
    private _seatmapService: ServicingSeatmapService
  ) {
    super(_commonService);
  }

  init(): void {
    this.subscribeService(
      `ServicingSeatmapSeatProductsComponent-int`,
      combineLatest([
        this._getSeatmapsStoreService.getGetSeatmapsObservable().pipe(
          filter((data) => !!data.data),
          take(1)
        ),
        this._masterService.getAswMasterByKey$(MasterStoreKey.AIRCRAFT_CABIN_I18N_JOIN_ACV_AND_CABIN).pipe(take(1)),
      ]),
      ([getSeatmaps, mAircraftCabin]) => {
        this.deleteSubscription(`ServicingSeatmapSeatProductsComponent-int`);
        // 後ろ向き席が含まれているか
        this.isContainedRearFacingSeat = getSeatmaps.data?.seatmaps?.isCotaninedRearFacingSeat;

        // 有料カウチ席指定が含まれているか
        this.existsPaidCouchRequested = getSeatmaps.data?.seatmaps?.isContainedCouchSeat;

        // 通常席のシート名に入る静的文言キーを設定
        if (this.existsPaidCouchRequested) {
          this.normalSeatNameStaticMsgKey = 'heading.normalSeat';
        } else if (this.isContainedRearFacingSeat) {
          this.normalSeatNameStaticMsgKey = 'heading.forwardFacingSeat';
        } else {
          this.normalSeatNameStaticMsgKey = 'heading.seatType';
        }

        // キャビン別機材情報マスタから対象のレコードを取得
        const displayTargetSegment = this._seatmapHelperService.getCurrentSelectedSegment();
        const version = displayTargetSegment?.aircraftConfigurationVersion;
        const cabinName = displayTargetSegment?.cabin ? displayTargetSegment.cabin : undefined;
        const contentsServerUrl = this._masterService.getMPropertyByKey(
          SEATMAP_PROPETRY_CATEGORY,
          'contents.server.url'
        );
        if (!!version && !!cabinName) {
          const targetCabinRecord: AcvStatus | undefined = mAircraftCabin?.[version]?.[cabinName]?.[0];

          if (!!targetCabinRecord) {
            // マスタから通常席のコンテンツリンクを取得
            this.normalSeatProductUrl = targetCabinRecord.product_url;
            if (targetCabinRecord?.seat_type_image) {
              // マスタから通常席のシート画像を取得
              this.normalSeatImage = `${contentsServerUrl}${targetCabinRecord.seat_type_image}.png`;

              // 通常席のシート画像alt文言のための静的文言キーを設定
              this.normalSeatImgAltStaticMsgKey = 'alt.seatProductExplanation.' + targetCabinRecord.seat_type_image;
            }
            this._changeDetector.markForCheck();
          }
        }

        // マスタから後ろ向き席とカウチ席のシート画像とコンテンツリンクを取得
        const rearFacingSeatImage = this._masterService.getMPropertyByKey(
          SEATMAP_PROPETRY_CATEGORY,
          'seatProduct.image.rearFacingSeat'
        );
        this.rearFacingSeatImage = `${contentsServerUrl}${rearFacingSeatImage}.png`;
        this.rearFacingSeatLink = this._masterService.getMPropertyByKey(
          SEATMAP_PROPETRY_CATEGORY,
          'seatProduct.contentLink.rearFacingSeat'
        );

        const couchSeatImage = this._masterService.getMPropertyByKey(
          SEATMAP_PROPETRY_CATEGORY,
          'seatProduct.image.couch'
        );
        this.couchSeatImage = `${contentsServerUrl}${couchSeatImage}.png`;
        this.couchSeatLink = this._masterService.getMPropertyByKey(
          SEATMAP_PROPETRY_CATEGORY,
          'seatProduct.contentLink.couch'
        );
      }
    );
  }

  /**
   * 座席イメージリンク表示判定
   *
   * @returns 判定結果
   */
  public isSeatTypeDisplay(): boolean {
    return (
      !!this._seatmapHelperService.getCurrentSelectedSegment()?.aircraftConfigurationVersion &&
      !!this._seatmapHelperService.getCurrentSelectedSegment()?.isNhGroupOperated
    );
  }

  reload(): void {}

  destroy(): void {
    this.deleteSubscription(`ServicingSeatmapSeatProductsComponent-int`);
  }
}
