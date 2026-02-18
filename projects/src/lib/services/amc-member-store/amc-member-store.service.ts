/**
 * 会員情報 store サービス
 */
import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { SupportClass } from '@lib/components/support-class';
import {
  AMCMemberStore,
  selectAMCMemberState,
  resetAMCMember,
  updateAMCMember,
  setAMCMember,
  AMCMemberState,
  GetMemberInformationState,
} from '@lib/store';
import { AMCMemberModel, IFlyAddressType, IFlyGenderType, IFlyPhoneNumberType } from '@lib/interfaces';
import { filter, map, Observable, tap, throwError } from 'rxjs';
import { ApiErrorResponseService, GetMemberInformationStoreService } from '@lib/services';
import { HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';

/**
 * 会員情報 store サービス
 * store情報
 * @param amcMemberData @see AMCMemberModel
 */
@Injectable()
export class AMCMemberStoreService extends SupportClass {
  private _amcMember$: Observable<AMCMemberState>;
  private _amcMemberData!: AMCMemberState;
  get amcMemberData() {
    return this._amcMemberData;
  }

  constructor(
    private _store: Store<AMCMemberStore>,
    private _getMemberInformationStoreService: GetMemberInformationStoreService,
    private _apiErrService: ApiErrorResponseService
  ) {
    super();
    this._amcMember$ = this._store.pipe(
      select(selectAMCMemberState),
      filter((data) => !!data)
    );
    this.subscribeService('AMCMemberStoreServiceData', this._amcMember$, (data) => {
      this._amcMemberData = data;
    });
  }

  destroy() {}

  public getAMCMember$() {
    return this._amcMember$;
  }

  public updateAMCMember(value: Partial<AMCMemberModel>) {
    this._store.dispatch(updateAMCMember(value));
  }

  public updateAMCMemberByKey(key: keyof AMCMemberModel, value: any) {
    this._store.dispatch(updateAMCMember({ [key]: value }));
  }

  public setAMCMember(value: AMCMemberModel) {
    this._store.dispatch(setAMCMember(value));
  }

  public resetAMCMember() {
    this._store.dispatch(resetAMCMember());
  }

  public saveMemberInformationToAMCMember$(): Observable<GetMemberInformationState> {
    this._getMemberInformationStoreService.resetGetMemberInformation();
    this._getMemberInformationStoreService.callApi();

    return this._getMemberInformationStoreService.getGetMemberInformation$().pipe(
      filter((memberInfo) => !!memberInfo.model || memberInfo.isFailure === true),

      tap((memberInfo) => {
        if (!memberInfo.isFailure) {
          const amcMember = this.transformToAMCMember(memberInfo);
          this.updateAMCMember(amcMember);
        }
      })
    );
  }

  private transformToAMCMember(memberInfo: GetMemberInformationState): Partial<AMCMemberModel> {
    return {
      iFlyMemberInfo: {
        ...memberInfo.model?.data,
        profileDetails: {
          ...memberInfo.model?.data?.profileDetails,
          individualInfo: {
            ...memberInfo.model?.data?.profileDetails?.individualInfo,
            preferredEmailAddress: memberInfo.model?.data?.profileDetails?.individualInfo
              ?.preferredEmailAddress as IFlyAddressType,
            preferredPhoneNumber: memberInfo.model?.data?.profileDetails?.individualInfo
              ?.preferredPhoneNumber as IFlyPhoneNumberType,
            gender: memberInfo.model?.data?.profileDetails?.individualInfo?.gender as IFlyGenderType,
            memberContactInfos: memberInfo.model?.data?.profileDetails?.individualInfo?.memberContactInfos?.map(
              (memberContactInfo) => ({
                ...memberContactInfo,
                addressType: memberContactInfo?.addressType as IFlyAddressType,
              })
            ),
          },
        },
      },
    };
  }
}
