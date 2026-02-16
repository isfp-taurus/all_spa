import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { SupportComponent } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';
import lottie, { AnimationItem } from 'lottie-web';
import { iconJson } from './icon_json_data';
import { RoundtripFlightAvailabilityInternationalService } from '@common/services/roundtripFlightAvailabilityInternational/roundtripFlightAvailabilityInternational.service';

@Component({
  selector: 'asw-add-to-favorite',
  templateUrl: './add-to-favorite.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddToFavoriteComponent extends SupportComponent implements AfterViewInit {
  private _animationAddToFavorite?: AnimationItem;

  /** コンストラクタ */
  constructor(
    private _common: CommonLibService,
    private _roundtripFlightAvailabilityInternationalService: RoundtripFlightAvailabilityInternationalService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    super(_common);
  }

  ngAfterViewInit(): void {
    this.initFavoriteIcon();
    if (this.isRegisteredFavorite) {
      this.moveAnimation();
    }
  }

  /** 初期表示処理 */
  init() {
    // お気に入り登録状態の更新を取得
    this.subscribeService(
      'get isRegisterdFavoiteinit',
      this._roundtripFlightAvailabilityInternationalService.getRoundtripFlightAvailabilityInternationalObservable(),
      (data) => {
        this.isRegisteredFavorite = !!data.isRegisteredFavorite;
        this.isNotFavoriteAnimation = !!data.isNotFavoriteAnimation;
        if (this.isRegisteredFavorite && this.isNotFavoriteAnimation) {
          this.disabled = true;
        } else if (this.isRegisteredFavorite && !this.isNotFavoriteAnimation) {
          this.moveAnimation();
        }
      }
    );
  }

  /** 画面終了時処理 */
  destroy() {
    this.deleteSubscription('get isRegisterdFavoiteinit');
    this.deleteSubscription('get isRegisterdFavoite');
  }

  /** 画面更新時処理 */
  reload() {}

  /** お気に入り登録済みか否か、登録済みであればtrue */
  @Input()
  public isRegisteredFavorite: boolean = false;

  /** お気に入り追加アニメーションが不要か */
  public isNotFavoriteAnimation: boolean = false;

  /** 連打防止用 */
  public disabled: boolean = false;

  /** お気に入り追加ボタン押下 */
  @Output()
  public clickFavoriteEvent = new EventEmitter<Event>();

  public addToFavirote(event: Event) {
    this.clickFavoriteEvent.emit(event);
  }

  @ViewChild('animationPoint') animationPoint?: ElementRef;
  /**
   *
   */
  public initFavoriteIcon() {
    const iconAddToFavoriteStage = this.animationPoint;
    if (iconAddToFavoriteStage?.nativeElement) {
      this._animationAddToFavorite = lottie.loadAnimation({
        container: iconAddToFavoriteStage.nativeElement,
        renderer: 'svg',
        loop: false,
        autoplay: false,
        animationData: iconJson,
      });
    }
  }

  // お気に入り追加ボタンの連打防止用変数
  public isPushRegisteredFavoriteButton: boolean = true;

  /**
   * お気に入り追加ボタン押下
   */
  public clickFavorite(event: Event): void {
    if (this.isPushRegisteredFavoriteButton) {
      this.isPushRegisteredFavoriteButton = false;
      event.preventDefault();
      // 往復空席照会結果(国際)画面(R01-P030)のお気に入り追加ボタン押下時処理を行う。
      if (!this.isRegisteredFavorite) {
        this.addToFavirote(event);
        // store更新後に処理を実施するため以下の処理を実施
        const storeInfo =
          this._roundtripFlightAvailabilityInternationalService.getRoundtripFlightAvailabilityInternationalObservable();
        this.subscribeService('get isRegisterdFavoite', storeInfo, (data) => {
          this.isRegisteredFavorite = !!data.isRegisteredFavorite;
          if (this.isRegisteredFavorite) {
            this.moveAnimation();
          }
        });
      } else {
        this.moveAnimation();
      }
    }
  }

  public moveAnimation(): void {
    const openClass = 'is-added';
    const btn = this.animationPoint;
    if (btn && !btn.nativeElement.classList.contains(openClass)) {
      btn.nativeElement.classList.add(openClass);
      this._animationAddToFavorite && this._animationAddToFavorite.playSegments([0, 200], true);
    }

    this._animationAddToFavorite?.addEventListener('complete', () => {
      this.disabled = true;
      this._changeDetectorRef.detectChanges();
    });
  }
}
