import { Injectable } from '@angular/core';
import { passengerInformationRequestPayloadParts } from '@app/id-modal/passenger-information-request/passenger-information-request.payload.state';
import { OtherBookingPassengerModalComponent, OtherBookingPassengerModalInput } from '@common/components';
import { apiEventAll, getKeyListData, isStringEmpty, getPaxName } from '@common/helper';
import { MListData, PassengerType, ContactRegState } from '@common/interfaces';
import {
  CurrentCartStoreService,
  CancelPrebookService,
  PlanReviewStoreService,
  DeleteTravelerStoreService,
} from '@common/services';
import { SupportClass } from '@lib/components/support-class';
import { DialogClickType, DialogType, ErrorType, PageType } from '@lib/interfaces';
import { StaticMsgPipe } from '@lib/pipes';
import { CommonLibService, DialogDisplayService, ErrorsHandlerService, ModalService } from '@lib/services';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  PostGetCartResponseDataPlan,
  ContactsTravelerIdEmail,
  ContactsTravelerIdPhone,
  Traveler,
} from 'src/sdk-reservation';
import { ErrorCodeConstants } from '@conf/app.constants';

/**
 * 搭乗者情報入力情報用サービス
 */
@Injectable({
  providedIn: 'root',
})
export class PlanReviewPassengerInfoService extends SupportClass {
  constructor(
    private _common: CommonLibService,
    private _deleteTravelerStoreService: DeleteTravelerStoreService,
    private _currentCartStoreService: CurrentCartStoreService,
    private _cancelPrebookService: CancelPrebookService,
    private _planReviewStoreService: PlanReviewStoreService,
    private _staticMsgPipe: StaticMsgPipe,
    private _dialogSvc: DialogDisplayService,
    private _errorsHandlerSvc: ErrorsHandlerService,
    private _modalService: ModalService
  ) {
    super();
  }

  /**
   * 性別文言取得処理
   * @param gender female, male, etc.
   * @param lang 操作中の言語
   * @param mListDataArray M_LIST_DATAキャッシュ
   * @returns M_LIST_DATAキャッシュ内の当該
   */
  getGenderLabel(gender: string, lang: string, mListDataArray: Array<MListData>): string | undefined {
    const dataList = getKeyListData(mListDataArray, 'PD_004', lang);
    const genderLabelMap = new Map(dataList.map((data) => [data.value, data.display_content]));
    return genderLabelMap.get(gender);
  }

  /**
   * 搭乗者情報入力モーダル表示処理
   * @param section @see PassengerInformationRequestEditType
   */
  openPassengerInfoRequest(section: number): void {
    const parts = passengerInformationRequestPayloadParts(
      true, // isEditMode
      section // editArea
    );
    this._modalService.showSubPageModal(parts);
  }

  /**
   * 搭乗者メールアドレス登録状況取得処理
   * @param email 搭乗者毎メールアドレス情報
   * @returns ContactRegState
   */
  getEmailRegState(email?: ContactsTravelerIdEmail): ContactRegState {
    if (isStringEmpty(email?.address)) {
      // 未登録の場合
      return ContactRegState.UNREG;
    } else {
      // 登録済みの場合
      if (email?.isSameAsRepresentative) {
        // 代表者連絡先と同じ
        return ContactRegState.SAME_AS_REP;
      } else {
        // 個別指定
        return ContactRegState.INDIV;
      }
    }
  }

  /**
   * 搭乗者SMS送付先登録状況取得処理
   * @param phone 搭乗者毎電話番号情報
   * @param isNameReg 姓名登録済みか否か
   * @returns ContactRegState
   */
  getPhoneRegState(phone: ContactsTravelerIdPhone | undefined, isNameReg: boolean): ContactRegState {
    if (phone?.number) {
      // 登録済みの場合
      if (phone.isSameAsRepresentative) {
        // 代表者連絡先と同じ
        return ContactRegState.SAME_AS_REP;
      } else {
        // 個別指定
        return ContactRegState.INDIV;
      }
    } else {
      // 未登録の場合
      if (isNameReg) {
        // 搭乗者情報入力済み(＝姓名が存在)の場合、送信不要とみなす
        return ContactRegState.NOT_NEEDED;
      } else {
        return ContactRegState.UNREG;
      }
    }
  }

  /**
   * 登録状態を表すbooleanを登録有無の文字列に変換する処理
   * @param isRegistered
   * @returns
   */
  stringifyRegStateBool(isRegistered: boolean): string | undefined {
    return isRegistered ? this._staticMsgPipe.transform('label.registered1') : undefined;
  }

  /**
   * 搭乗者削除処理
   * @param index 削除対象搭乗者のインデックス
   * @param hasAccompaniedInAnotherReservation 他PNRに大人の同行者が存在するか否か
   * @param afterEvent 後続処理
   */
  deletePassenger(index: number, hasAccompaniedInAnotherReservation?: boolean, afterEvent?: () => void): void {
    const cartPlan = this._currentCartStoreService.CurrentCartData.data?.plan;
    const targetPax = cartPlan?.travelers?.[index] ?? {};

    // prebookを解除
    this._cancelPrebookService.cancelPrebookNext(() => {
      // 以下、解除後処理
      this.deleteSubscription('PlanReviewPassengerInfoComponent CancelPrebook');
      // 搭乗者情報削除APIを実行
      const requestParams = {
        cartId: this._currentCartStoreService.CurrentCartData.data?.cartId ?? '',
        travelerId: targetPax?.id ?? '',
        hasAccompaniedInAnotherReservation: hasAccompaniedInAnotherReservation,
      };
      apiEventAll(
        () => this._deleteTravelerStoreService.setDeleteTravelerFromApi(requestParams),
        this._deleteTravelerStoreService.getDeleteTraveler$(),
        (response) => {
          // 画面情報更新判定をtrueにする
          this._planReviewStoreService.updatePlanReview({ isNeedRefresh: true });
          // 後続処理を実行
          if (afterEvent) {
            afterEvent();
          }
        },
        (error) => {
          const apiErr = this._common.apiError?.errors?.[0]?.code ?? '';
          if (apiErr === ErrorCodeConstants.ERROR_CODES.EBAZ000219) {
            this._errorsHandlerSvc.setNotRetryableError({
              errorType: ErrorType.BUSINESS_LOGIC,
              errorMsgId: 'E0333',
              apiErrorCode: apiErr,
            });
          } else {
            this._common.errorsHandlerService.setNotRetryableError({
              errorType: ErrorType.SYSTEM,
              apiErrorCode: apiErr,
            });
          }
        }
      );
    });
  }

  /**
   * 小児単独旅程にかかわるエラー＆モーダル表示処理
   * @param cartPlan 操作中カート情報.data.plan
   * @param index 削除対象搭乗者のインデックス
   * @param isAfterDcs DCS移行開始日以降の場合true
   * @param hasAccompaniedInAnotherReservation 他PNRに大人の同行者がいるか否か
   * @param afterEvent 後続処理
   */
  preventOrConfirmChdOnlyFlight(
    cartPlan: PostGetCartResponseDataPlan,
    index: number,
    isAfterDcs: boolean,
    hasAccompaniedInAnotherReservation?: boolean,
    afterEvent?: (hasAccompaniedInAnotherReservation?: boolean) => void
  ): void {
    const targetPax = cartPlan?.travelers?.[index] ?? {};
    const isDomestic = cartPlan?.airOffer?.tripType === 'domestic';
    // 削除対象がADTまたはB15か
    const isOverB15 =
      targetPax.passengerTypeCode === PassengerType.ADT || targetPax.passengerTypeCode === PassengerType.B15;
    const numOfPax = cartPlan?.travelersSummary?.numberOfTraveler;
    // 残りのADT～B15が1人以下
    const isZeroOneOverB15 = (numOfPax?.ADT ?? 0) + (numOfPax?.B15 ?? 0) <= 1;

    if (isOverB15 && isZeroOneOverB15 && numOfPax?.CHD) {
      if (!isAfterDcs || !isDomestic) {
        // 国際線およびDCS移行前の国内線では、小児単独旅程は予約不可
        this._common.errorsHandlerService.setRetryableError(PageType.PAGE, {
          errorMsgId: 'E0933',
        });
        return;
      }
      if (!numOfPax?.INF && afterEvent) {
        // 削除した結果小児単独旅程となる場合、小児単独予約確認モーダルを表示
        this._showOtherBookingPassengerModal(hasAccompaniedInAnotherReservation, (modalResponse?: boolean | null) => {
          if (modalResponse === null || modalResponse === undefined) {
            // モーダルでの確認がキャンセルされた場合
            return;
          }
          // 他PNRに大人の同行者が要るか否かの判定がモーダルから返却された場合、それを保持する(処理を後続処理にて行う)
          afterEvent(modalResponse);
        });
        return;
      }
    }
    if (afterEvent) {
      afterEvent(hasAccompaniedInAnotherReservation);
    }
  }

  /**
   * 小児単独予約確認モーダル表示処理
   * @param hasAccompaniedInAnotherReservation 他PNRに大人の同行者がいるか否か
   * @param afterEvent 後続処理
   */
  private _showOtherBookingPassengerModal(
    hasAccompaniedInAnotherReservation: boolean | undefined,
    afterEvent: (modalResponse?: boolean) => void
  ): void {
    const parts = this._modalService.defaultBlockPart(OtherBookingPassengerModalComponent);
    const payload: OtherBookingPassengerModalInput = { isOtherBookingPassenger: hasAccompaniedInAnotherReservation };
    parts.payload = payload;
    parts.closeEvent = (modalResponse?: boolean | null) => afterEvent(modalResponse ?? undefined);
    this._modalService.showSubModal(parts);
  }

  /**
   * 搭乗者削除前確認メッセージ取得処理
   * @param cartPlan 操作中カート情報.data.plan
   * @param index 削除対象搭乗者のインデックス
   * @returns 確認ダイアログ用情報の配列
   */
  getPaxDeleteAlertMsgList(
    cartPlan: PostGetCartResponseDataPlan,
    index: number
  ): Array<{ msg: string; param?: string }> {
    const targetPax = cartPlan?.travelers?.[index] ?? {};

    // 当該搭乗者を削除してよいかを尋ねる確認ダイアログ
    const paxDispName = getPaxName(targetPax) ?? this._staticMsgPipe.transform('label.passenger.n', { '0': index + 1 });
    const msgList: Array<{ msg: string; param?: string }> = [];
    // #14 (No.59) プラン作成時の小児、幼児の扱いに関して Cart小児幼児考慮
    // 紐づく幼児が存在する場合
    const hasInfant = this.hasAccompanyingTraveler(targetPax.id ?? '', cartPlan.travelers ?? []);
    if (targetPax?.passengerTypeCode === PassengerType.ADT && hasInfant) {
      msgList.push({ msg: 'm_dynamic_message-MSG1484' });
    }
    // FY25: 当該搭乗者に対してペットらくのりが申し込まれている場合の文言
    const isPetReg = Object.values(cartPlan?.services?.pet?.registeredPets ?? {}).some((segment) =>
      segment[targetPax.id ?? '']?.some((pet) => pet.id)
    );
    if (isPetReg) {
      msgList.push({ msg: 'm_dynamic_message-MSG1485' });
    }
    // 通常時の文言
    if (msgList.length === 0) {
      msgList.push({ msg: 'm_dynamic_message-MSG1038', param: paxDispName });
    }

    return msgList;
  }

  /**
   * 確認ダイアログ連続表示処理
   * @param msgList 確認ダイアログ用情報の配列
   * @returns DialogClickTypeのObservable
   */
  showMsgListInDialogs(msgList: Array<{ msg: string; param?: string }>): Observable<DialogClickType> {
    return new Observable((observer) => {
      // ダイアログを順番に表示させるためのSubject
      const counterSbj = new BehaviorSubject(0);

      // msgListの件数分、確認メッセージ表示処理を予約
      this.subscribeService('PlanReviewPassengerInfoComponent counterSbj', counterSbj, (index) => {
        this.showDialog(
          msgList[index],
          () => {
            // 同意した場合
            if (index + 1 === msgList.length) {
              // 最後の確認メッセージに同意した場合
              this.deleteSubscription('PlanReviewPassengerInfoComponent counterSbj');
              observer.next(DialogClickType.CONFIRM);
            } else {
              counterSbj.next(index + 1);
            }
          },
          () => {
            // 同意しなかった場合
            this.deleteSubscription('PlanReviewPassengerInfoComponent counterSbj');
            observer.next(DialogClickType.CLOSE);
          }
        );
      });
    });
  }

  /**
   * 確認ダイアログ表示処理(後続処理指定可能)
   * @param msgItem 確認ダイアログ用情報
   * @param confirmEvent 同意成立時イベント
   * @param cancelEvent 同意不成立時イベント
   */
  showDialog(msgItem: { msg: string; param?: string }, confirmEvent?: () => void, cancelEvent?: () => void): void {
    const dialogInfo = {
      type: DialogType.WARN,
      message: msgItem.msg,
      messageParams: msgItem.param
        ? {
            key: '0',
            value: msgItem.param,
            dontTranslate: true,
          }
        : undefined,
    };
    this.subscribeService(
      'PassengerInfoComponent Dialog buttonClickObservable',
      this._dialogSvc.openDialog(dialogInfo).buttonClick$,
      (result) => {
        this.deleteSubscription('PassengerInfoComponent Dialog buttonClickObservable');
        if (result.clickType === DialogClickType.CONFIRM && confirmEvent) {
          confirmEvent();
        } else if (cancelEvent) {
          cancelEvent();
        }
      }
    );
  }

  /**
   * 紐づく幼児が存在する
   * @param id 判定対象搭乗者のID
   * @param travelers 搭乗者情報の配列
   */
  hasAccompanyingTraveler(id: string, travelers: Array<Traveler>): boolean {
    // 紐づく幼児を持つ搭乗者のIDリスト
    return travelers.some((traveler) => traveler.accompanyingTravelerId === id);
  }

  /**
   * 大人の付添人が1名以上必要か否か判定処理
   * @param cartPlan 操作中カート情報.data.plan
   * @param index 削除対象搭乗者のインデックス
   * @param isAfterDcs DCS移行開始日以降の場合、true
   * @returns 必要な場合、true
   */
  isAdultRequired(cartPlan: PostGetCartResponseDataPlan, index: number, isAfterDcs: boolean): boolean {
    const targetPax = cartPlan?.travelers?.[index] ?? {};
    // 削除対象の搭乗者が大人
    const isAdt = targetPax.passengerTypeCode === PassengerType.ADT;
    // (削除対象の搭乗者を除く)大人の人数が0人
    const isOneAdt = cartPlan?.travelersSummary?.numberOfTraveler?.ADT === 1;
    // 小児または幼児の搭乗者人数が1名以上
    const chdNum = cartPlan?.travelersSummary?.numberOfTraveler?.CHD ?? 0;
    const infNum = cartPlan?.travelersSummary?.numberOfTraveler?.INF ?? 0;
    const isMoreThanOneChdInf = chdNum + infNum >= 1;
    // FY25: DCS移行開始日以降かつ日本国内単独旅程の場合、false
    const isAfterDcsDomestic = isAfterDcs && cartPlan.airOffer?.tripType === 'domestic';

    return isAdt && isOneAdt && isMoreThanOneChdInf && !isAfterDcsDomestic;
  }

  /**
   * 追加情報が入力可能かどうか
   * 搭乗者連絡先情報の表示条件判定の処理を流用
   * /src/app/id-modal/passenger-information-request/passenger-information/passenger-information.service.ts
   * @param code
   * @returns 追加情報を入力可能フラグ
   */
  getIsAdditionalInfo(code: string): boolean {
    // 搭乗者種別
    switch (code) {
      case PassengerType.ADT:
      case PassengerType.B15:
      case PassengerType.CHD:
        return true;
    }
    return false;
  }

  destroy(): void {}
}
