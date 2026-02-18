import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { MasterStoreKey } from '@conf/asw-master.config';
import { SupportModalBlockComponent } from '@lib/components/support-class';
import { AswMasterService, CommonLibService } from '@lib/services';
import { take, zip } from 'rxjs';
import { GetSeatmapsStoreService } from '@common/services/api-store/sdk-servicing/get-seatmaps-store/get-seatmaps-store.service';
import { ServicingSeatmapService } from '@common/services/seatmap/servicing-seatmap.service';
import { AppConstants } from '@conf/app.constants';

const SEATMAP_PROPETRY_CATEGORY = 'seatMap';

@Component({
  selector: 'asw-servicing-seatmap-seat-products-modal',
  templateUrl: './servicing-seatmap-seat-products-modal.component.html',
  styleUrls: ['./servicing-seatmap-seat-products-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicingSeatmapSeatProductsModalComponent extends SupportModalBlockComponent {
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
    private _common: CommonLibService,
    private _router: Router,
    private _getSeatmapsStoreService: GetSeatmapsStoreService,
    private _masterService: AswMasterService,
    private _seatmapService: ServicingSeatmapService
  ) {
    super(_common);
  }

  init(): void {
    // URLの変更時にモーダルが閉じられるよう設定する
    this.closeWithUrlChange(this._router);

    const targetFlight = this.payload;

    this.subscribeService(
      'ServicingSeatmapProductsModalComponent_zipped',
      this._masterService.getAswMasterByKey$(MasterStoreKey.AIRCRAFT_CABIN_I18N_JOIN_ACV_AND_CABIN),
      (mAircraftCabin) => {
        // 後ろ向き席が含まれているか
        ////TODO cotaninは誤字なので直したい
        this.isContainedRearFacingSeat =
          this._getSeatmapsStoreService.getSeatmapsData.data?.seatmaps?.isCotaninedRearFacingSeat;

        // 有料カウチ席指定が含まれているか
        this.existsPaidCouchRequested =
          this._getSeatmapsStoreService.getSeatmapsData.data?.seatmaps.isContainedCouchSeat;

        // 通常席のシート名に入る静的文言キーを設定
        if (this.existsPaidCouchRequested) {
          this.normalSeatNameStaticMsgKey = 'heading.normalSeat';
        } else if (this.isContainedRearFacingSeat) {
          this.normalSeatNameStaticMsgKey = 'heading.forwardFacingSeat';
        } else {
          this.normalSeatNameStaticMsgKey = 'heading.seatType';
        }

        // キャビン別機材情報マスタから対象のレコードを取得
        const version = targetFlight.aircraftConfigurationVersion;
        const cabinName = targetFlight.cabin;
        const contentsServerUrl = this._masterService.getMPropertyByKey(
          SEATMAP_PROPETRY_CATEGORY,
          'contents.server.url'
        );

        if (!!version && !!cabinName && !!contentsServerUrl) {
          const targetCabinRecord = mAircraftCabin?.[version]?.[cabinName]?.[0];

          // マスタから通常席のコンテンツリンクを取得
          this.normalSeatProductUrl = targetCabinRecord?.product_url;
          if (targetCabinRecord?.seat_type_image) {
            // マスタから通常席のシート画像を取得
            this.normalSeatImage = `${contentsServerUrl}${targetCabinRecord.seat_type_image}.png`;

            // 通常席のシート画像alt文言のための静的文言キーを設定
            this.normalSeatImgAltStaticMsgKey = 'alt.seatProductExplanation.' + targetCabinRecord.seat_type_image;
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
      }
    );
  }

  destroy(): void {}

  reload(): void {}
}
