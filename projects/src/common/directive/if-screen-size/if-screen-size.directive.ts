import { ChangeDetectorRef, Directive, Input, OnDestroy, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { isPC, isSP, isTB } from '@lib/helpers';
import { fromEvent, share, throttleTime } from 'rxjs';
import { DeviceType } from '@lib/interfaces';
import { BaseIfDirective } from '../base-if-directive';
/**
 * 指定されたデバイスの画面サイズ内かを判定し、要素の表示を切り替えるディレクティブ
 * 指定するデバイスが1つの場合は、PC、TB、SPを文字列の形式で指定、複数指定したい場合(TBでもPCでも表示したい)は配列形式で指定
 * また、その画面サイズではない場合別の要素を表示したい場合、*ngIfと同様にelseが指定可能
 *
 * 例：1つのデバイスを指定する場合
 * <div *aswIfScreenSize="'PC'">
 * </div>
 *
 * 例：2つのデバイスを指定する場合
 * <div *aswIfScreenSize="['TB','PC']">
 * </div>
 *
 * 例：指定されたデバイスの画面サイズでない場合に別の要素を表示したい場合
 * <div *aswIfScreenSize="'PC';else notPC">
 * </div>
 * <ng-template #notPC>
 *  <div>代替要素</div>
 * </ng-template>
 */
@Directive({
  selector: '[aswIfScreenSize],[aswIfScreenSizeElse]',
})
export class IfScreenSizeDirective extends BaseIfDirective implements OnInit, OnDestroy {
  /** 判定対象となる端末種別を受け取って、判定に使用する関数をセットする */
  @Input() set aswIfScreenSize(device: DeviceType | DeviceType[]) {
    this._device = device;
  }
  private _device!: DeviceType | DeviceType[];

  /** *aswIfScreenSize="true; else $template"`のようなElse構文に対応する場合に表示するテンプレートを受け取る */
  @Input()
  public set aswIfScreenSizeElse(elseTemplateRef: TemplateRef<any>) {
    this.elseTemplateRef = elseTemplateRef;
  }

  /** 現在の画面サイズが、指定したデバイスの範囲内であるかを判定する関数 */
  private _screenCheckMethod!: () => boolean;

  /** 一度画面サイズの変更が検知されてから次の画面サイズの変更を検知するまでの間隔(ms) */
  private readonly _screenResizeThrottleTimeMs = 10;

  constructor(templateRef: TemplateRef<any>, viewContainerRef: ViewContainerRef, changeDetectorRef: ChangeDetectorRef) {
    super(templateRef, viewContainerRef, changeDetectorRef);
  }

  init(): void {
    // 指定されたdeviceから判定メソッドを作成する
    this.createScreenSizeCheckMethod();
    // 画面初期表示時にどちらのテンプレートを表示すべきかを判定する
    this.condition = this._screenCheckMethod();

    // 画面のスクロールイベントの監視
    this._subscription.add(
      fromEvent(window, 'resize')
        .pipe(throttleTime(this._screenResizeThrottleTimeMs), share())
        .subscribe(() => {
          const prev = this.condition;
          const condition = this._screenCheckMethod();
          // 1つ前のコンディションと現在のコンディションを比較して、異なればコンディションを更新する
          if (prev !== condition) {
            this.condition = condition;
          }
        })
    );
  }

  /**
   * deviceからその画面サイズ範囲内かどうかを判定するメソッドを作成する
   */
  private createScreenSizeCheckMethod() {
    // デバイスが複数指定されていた場合、そのうちどれか1つのデバイスの画面サイズ内であればtrueを返す関数を作成してセット
    if (this._device instanceof Array) {
      const methods = this._device.map((device) => this.getScreenCheckMethod(device));
      this._screenCheckMethod = () => {
        return methods.some((methods) => methods());
      };
    } else {
      // デバイスが1つの場合は、そのデバイスの画面内であるかを判断する関数をセット
      this._screenCheckMethod = this.getScreenCheckMethod(this._device);
    }
  }

  /**
   * 指定されたデバイスから、判定用の関数を返す
   * @returns 画面幅が指定のデバイスの大きさに収まっているかを返す関数
   * */
  getScreenCheckMethod(device: DeviceType) {
    switch (device) {
      case DeviceType.PC:
        return isPC;
      case DeviceType.TABLET:
        return isTB;
      case DeviceType.SMART_PHONE:
        return isSP;
      default:
        return isSP;
    }
  }

  override destroy(): void {}
}
